import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { Customer, CashTransaction, DebtRecord, PaymentMethod, CartItem } from '../types';
import {
  fetchCustomers,
  saveCustomer,
  removeCustomer,
  fetchTransactions,
  addTransaction,
  removeTransaction,
  fetchDebts,
  saveDebt,
  removeDebt,
  decreaseProductStock,
} from '../services/storage';
import { useProducts } from './ProductContext';

interface ManagementContextType {
  customers: Customer[];
  transactions: CashTransaction[];
  debts: DebtRecord[];
  isLoading: boolean;
  totalReceivable: number;
  overdueDebtsCount: number;
  cashBalance: number;
  todayRevenue: number;
  monthRevenue: number;
  totalExpenses: number;
  // Métodos de Clientes
  createCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => Promise<Customer>;
  editCustomer: (customer: Customer) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  // Métodos de Caixa
  recordTransaction: (transaction: Omit<CashTransaction, 'id' | 'date'>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  // Métodos de Fiado
  createDebt: (debt: Omit<DebtRecord, 'id' | 'createdAt' | 'remainingAmount' | 'status' | 'payments'>) => Promise<DebtRecord>;
  recordDebtPayment: (debtId: string, amount: number, paymentMethod: PaymentMethod, notes?: string) => Promise<void>;
  deleteDebt: (id: string) => Promise<void>;
  // Venda no PDV (Balcão)
  processPOSSale: (params: {
    items: CartItem[];
    total: number;
    paymentMethod: PaymentMethod;
    customer?: Customer;
    dueDate?: string;
  }) => Promise<void>;
  reloadAll: () => Promise<void>;
}

const ManagementContext = createContext<ManagementContextType | undefined>(undefined);

export const ManagementProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { reloadProducts } = useProducts();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [transactions, setTransactions] = useState<CashTransaction[]>([]);
  const [debts, setDebts] = useState<DebtRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [storedCust, storedTx, storedDebts] = await Promise.all([
        fetchCustomers(),
        fetchTransactions(),
        fetchDebts(),
      ]);
      setCustomers(storedCust);
      setTransactions(storedTx);
      setDebts(storedDebts);
    } catch (err) {
      console.error('Erro ao carregar dados de gestão:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Cálculos Financeiros
  const cashBalance = useMemo(() => {
    return transactions.reduce((acc, t) => (t.type === 'in' ? acc + t.amount : acc - t.amount), 0);
  }, [transactions]);

  const totalExpenses = useMemo(() => {
    return transactions.filter((t) => t.type === 'out').reduce((acc, t) => acc + t.amount, 0);
  }, [transactions]);

  const todayRevenue = useMemo(() => {
    const today = new Date().setHours(0, 0, 0, 0);
    return transactions
      .filter((t) => t.type === 'in' && t.date >= today)
      .reduce((acc, t) => acc + t.amount, 0);
  }, [transactions]);

  const monthRevenue = useMemo(() => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    return transactions
      .filter((t) => t.type === 'in' && t.date >= firstDay)
      .reduce((acc, t) => acc + t.amount, 0);
  }, [transactions]);

  // Cálculos de Fiado
  const totalReceivable = useMemo(() => {
    return debts
      .filter((d) => d.status !== 'paid')
      .reduce((acc, d) => acc + d.remainingAmount, 0);
  }, [debts]);

  const overdueDebtsCount = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return debts.filter((d) => d.status !== 'paid' && d.dueDate < todayStr).length;
  }, [debts]);

  // Operações de Cliente
  const createCustomer = async (data: Omit<Customer, 'id' | 'createdAt'>): Promise<Customer> => {
    const newCust: Customer = {
      ...data,
      id: `cust-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: Date.now(),
    };
    await saveCustomer(newCust);
    setCustomers((prev) => [newCust, ...prev]);
    return newCust;
  };

  const editCustomer = async (customer: Customer): Promise<void> => {
    await saveCustomer(customer);
    setCustomers((prev) => prev.map((c) => (c.id === customer.id ? customer : c)));
  };

  const deleteCustomer = async (id: string): Promise<void> => {
    await removeCustomer(id);
    setCustomers((prev) => prev.filter((c) => c.id !== id));
  };

  // Operações de Caixa
  const recordTransaction = async (data: Omit<CashTransaction, 'id' | 'date'>): Promise<void> => {
    const newTx: CashTransaction = {
      ...data,
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      date: Date.now(),
    };
    await addTransaction(newTx);
    setTransactions((prev) => [newTx, ...prev]);
  };

  const deleteTransactionHandler = async (id: string): Promise<void> => {
    await removeTransaction(id);
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  // Operações de Fiado
  const createDebt = async (
    data: Omit<DebtRecord, 'id' | 'createdAt' | 'remainingAmount' | 'status' | 'payments'>
  ): Promise<DebtRecord> => {
    const newDebt: DebtRecord = {
      ...data,
      id: `debt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      remainingAmount: data.totalAmount,
      status: 'pending',
      createdAt: Date.now(),
      payments: [],
    };
    await saveDebt(newDebt);
    setDebts((prev) => [newDebt, ...prev]);
    return newDebt;
  };

  const recordDebtPayment = async (
    debtId: string,
    amount: number,
    paymentMethod: PaymentMethod,
    notes?: string
  ): Promise<void> => {
    const debt = debts.find((d) => d.id === debtId);
    if (!debt) return;

    const newPayment = {
      id: `pay-${Date.now()}`,
      amount,
      date: Date.now(),
      paymentMethod,
      notes,
    };

    const newRemaining = Math.max(0, debt.remainingAmount - amount);
    const newStatus: 'pending' | 'partial' | 'paid' = newRemaining <= 0 ? 'paid' : 'partial';

    const updatedDebt: DebtRecord = {
      ...debt,
      remainingAmount: newRemaining,
      status: newStatus,
      payments: [...debt.payments, newPayment],
    };

    await saveDebt(updatedDebt);
    setDebts((prev) => prev.map((d) => (d.id === debtId ? updatedDebt : d)));

    // Lança automaticamente no caixa como entrada
    await recordTransaction({
      type: 'in',
      category: 'Abatimento Fiado',
      amount,
      description: `Acerto fiado: ${debt.customerName}`,
      paymentMethod,
      referenceId: debt.id,
    });
  };

  const deleteDebtHandler = async (id: string): Promise<void> => {
    await removeDebt(id);
    setDebts((prev) => prev.filter((d) => d.id !== id));
  };

  // Processar Venda no Balcão (PDV)
  const processPOSSale = async ({
    items,
    total,
    paymentMethod,
    customer,
    dueDate,
  }: {
    items: CartItem[];
    total: number;
    paymentMethod: PaymentMethod;
    customer?: Customer;
    dueDate?: string;
  }): Promise<void> => {
    // 1. Dar baixa no estoque de cada variação
    for (const item of items) {
      const variationKey = `${item.selectedSize}::${item.selectedColor}`;
      await decreaseProductStock(item.product.id, variationKey, item.quantity);
    }
    await reloadProducts();

    const itemsSummary = items
      .map((i) => `${i.quantity}x ${i.product.name} (${i.selectedSize}/${i.selectedColor})`)
      .join(', ');

    // 2. Se for fiado, cria dívida
    if (paymentMethod === 'fiado') {
      if (!customer) throw new Error('Cliente é obrigatório para venda fiada');
      const finalDueDate =
        dueDate || new Date(Date.now() + 1000 * 60 * 60 * 24 * 15).toISOString().split('T')[0];

      await createDebt({
        customerId: customer.id,
        customerName: customer.nickname ? `${customer.name} (${customer.nickname})` : customer.name,
        customerPhone: customer.phone,
        itemsSummary,
        totalAmount: total,
        dueDate: finalDueDate,
      });
    } else {
      // 3. Se for à vista, lança no Caixa
      await recordTransaction({
        type: 'in',
        category: 'Venda Balcão',
        amount: total,
        description: `Venda balcão: ${itemsSummary}`,
        paymentMethod,
      });
    }
  };

  return (
    <ManagementContext.Provider
      value={{
        customers,
        transactions,
        debts,
        isLoading,
        totalReceivable,
        overdueDebtsCount,
        cashBalance,
        todayRevenue,
        monthRevenue,
        totalExpenses,
        createCustomer,
        editCustomer,
        deleteCustomer,
        recordTransaction,
        deleteTransaction: deleteTransactionHandler,
        createDebt,
        recordDebtPayment,
        deleteDebt: deleteDebtHandler,
        processPOSSale,
        reloadAll: loadData,
      }}
    >
      {children}
    </ManagementContext.Provider>
  );
};

export function useManagement() {
  const context = useContext(ManagementContext);
  if (!context) {
    throw new Error('useManagement deve ser utilizado dentro de um ManagementProvider');
  }
  return context;
}
