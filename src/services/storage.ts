import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { Product, StoreSettings, Customer, CashTransaction, DebtRecord } from '../types';

interface FavelaChicDB extends DBSchema {
  products: {
    key: string;
    value: Product;
    indexes: {
      'by-category': string;
      'by-created': number;
    };
  };
  settings: {
    key: string;
    value: StoreSettings;
  };
  customers: {
    key: string;
    value: Customer;
    indexes: {
      'by-name': string;
      'by-phone': string;
    };
  };
  cash_transactions: {
    key: string;
    value: CashTransaction;
    indexes: {
      'by-date': number;
      'by-type': string;
    };
  };
  debts: {
    key: string;
    value: DebtRecord;
    indexes: {
      'by-customer': string;
      'by-status': string;
      'by-due-date': string;
    };
  };
}

const DB_NAME = 'favela_chic_db';
const DB_VERSION = 2;

let dbPromise: Promise<IDBPDatabase<FavelaChicDB>> | null = null;

export function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<FavelaChicDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
          const productStore = db.createObjectStore('products', { keyPath: 'id' });
          productStore.createIndex('by-category', 'category');
          productStore.createIndex('by-created', 'createdAt');
          db.createObjectStore('settings');
        }
        if (oldVersion < 2) {
          if (!db.objectStoreNames.contains('customers')) {
            const customerStore = db.createObjectStore('customers', { keyPath: 'id' });
            customerStore.createIndex('by-name', 'name');
            customerStore.createIndex('by-phone', 'phone');
          }
          if (!db.objectStoreNames.contains('cash_transactions')) {
            const cashStore = db.createObjectStore('cash_transactions', { keyPath: 'id' });
            cashStore.createIndex('by-date', 'date');
            cashStore.createIndex('by-type', 'type');
          }
          if (!db.objectStoreNames.contains('debts')) {
            const debtStore = db.createObjectStore('debts', { keyPath: 'id' });
            debtStore.createIndex('by-customer', 'customerId');
            debtStore.createIndex('by-status', 'status');
            debtStore.createIndex('by-due-date', 'dueDate');
          }
        }
      },
    });
  }
  return dbPromise;
}

export const DEFAULT_SETTINGS: StoreSettings = {
  storeName: 'Favela Chic',
  tagline: 'O melhor do Streetwear & Moda Urbana do Bairro',
  whatsappNumber: '5511999999999',
  instagram: '@favelachic.oficial',
  address: 'Rua Principal do Bairro, 120 - Loja 2',
  deliveryFee: 10,
  pixKey: '11999999999',
  pixKeyType: 'telefone',
  adminPassword: '1234',
};

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Camiseta Oversized Street Urban Heavy',
    category: 'roupas',
    price: 99.90,
    costPrice: 42.00,
    originalPrice: 129.90,
    description: 'Camiseta 100% algodão fio 26.1 penteado gramatura 220g. Modelagem streetwear autêntica, gola canelada de 3cm.',
    sizes: ['P', 'M', 'G', 'GG'],
    colors: ['Preto Stone', 'Off White'],
    images: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80'
    ],
    inStock: true,
    isFeatured: true,
    stockByVariation: {
      'P::Preto Stone': 4,
      'M::Preto Stone': 8,
      'G::Preto Stone': 5,
      'GG::Preto Stone': 2,
      'M::Off White': 6,
      'G::Off White': 4,
    },
    totalStock: 29,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
  },
  {
    id: 'prod-2',
    name: 'Tênis Sneaker Retro Low Chunky',
    category: 'tenis',
    price: 289.90,
    costPrice: 135.00,
    originalPrice: 349.90,
    description: 'Design robusto inspirado na cultura hip-hop anos 90. Solado em borracha antiderrapante com amortecimento duplo.',
    sizes: ['38', '39', '40', '41', '42', '43'],
    colors: ['Branco/Preto', 'Total Black'],
    images: [
      'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80'
    ],
    inStock: true,
    isFeatured: true,
    stockByVariation: {
      '39::Branco/Preto': 2,
      '40::Branco/Preto': 3,
      '41::Branco/Preto': 4,
      '42::Branco/Preto': 2,
      '40::Total Black': 2,
      '41::Total Black': 3,
    },
    totalStock: 16,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
  },
  {
    id: 'prod-3',
    name: 'Boné Snapback Aba Reta Bordado 3D',
    category: 'bones',
    price: 79.90,
    costPrice: 28.00,
    originalPrice: 99.90,
    description: 'Boné estruturado premium com bordado frontal em alta definição. Regulador traseiro resistente e forro respirável.',
    sizes: ['Tamanho Único'],
    colors: ['Preto Clássico', 'Vinho Burguer'],
    images: [
      'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800&q=80'
    ],
    inStock: true,
    isFeatured: true,
    stockByVariation: {
      'Tamanho Único::Preto Clássico': 12,
      'Tamanho Único::Vinho Burguer': 6,
    },
    totalStock: 18,
    createdAt: Date.now() - 1000 * 60 * 60 * 24,
  },
  {
    id: 'prod-4',
    name: 'Shoulder Bag Tática Streetwear',
    category: 'acessorios',
    price: 69.90,
    costPrice: 25.00,
    description: 'Bolsa tiracolo impermeável em tecido ripstop com múltiplos compartimentos. Alça ajustável personalizada.',
    sizes: ['Padrão'],
    colors: ['Preto Fosco', 'Verde Militar'],
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80'
    ],
    inStock: true,
    isFeatured: false,
    stockByVariation: {
      'Padrão::Preto Fosco': 8,
      'Padrão::Verde Militar': 5,
    },
    totalStock: 13,
    createdAt: Date.now() - 1000 * 60 * 60 * 12,
  }
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    name: 'Lucas Ferreira',
    nickname: 'Lukinha do Grau',
    phone: '5511988881111',
    address: 'Rua das Flores, 45 (em frente à praça)',
    defaultSize: 'G',
    shoeSize: '41',
    birthday: '1998-05-14',
    notes: 'Curte camisetas pretas e boné aba reta. Cliente fiel toda sexta.',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 30,
  },
  {
    id: 'cust-2',
    name: 'Matheus Silva',
    nickname: 'Theus',
    phone: '5511977772222',
    address: 'Av. Brasil, 810 - Bloco B Ap 12',
    defaultSize: 'M',
    shoeSize: '40',
    birthday: '2001-11-20',
    notes: 'Paga sempre no Pix no dia do pagamento.',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 20,
  },
  {
    id: 'cust-3',
    name: 'Amanda Souza',
    nickname: 'Mandi',
    phone: '5511966663333',
    address: 'Travessa do Sol, 12',
    defaultSize: 'P',
    shoeSize: '37',
    birthday: '1999-08-03',
    notes: 'Gosta de shoulder bags e camisetas oversized como vestido.',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 10,
  }
];

export const INITIAL_DEBTS: DebtRecord[] = [
  {
    id: 'debt-1',
    customerId: 'cust-1',
    customerName: 'Lucas Ferreira (Lukinha)',
    customerPhone: '5511988881111',
    itemsSummary: '1x Camiseta Oversized Preto (G) + 1x Boné Snapback Preto',
    totalAmount: 179.80,
    remainingAmount: 79.80,
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString().split('T')[0], // 5 dias à frente
    status: 'partial',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5,
    payments: [
      {
        id: 'pay-1',
        amount: 100.00,
        date: Date.now() - 1000 * 60 * 60 * 24 * 1,
        paymentMethod: 'pix',
        notes: 'Adiantou R$ 100 no Pix',
      }
    ]
  },
  {
    id: 'debt-2',
    customerId: 'cust-2',
    customerName: 'Matheus Silva',
    customerPhone: '5511977772222',
    itemsSummary: '1x Tênis Sneaker Retro Low Chunky (40)',
    totalAmount: 289.90,
    remainingAmount: 289.90,
    dueDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString().split('T')[0], // Vencido há 2 dias
    status: 'pending',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 12,
    payments: []
  }
];

export const INITIAL_TRANSACTIONS: CashTransaction[] = [
  {
    id: 'tx-1',
    type: 'in',
    category: 'Venda Balcão',
    amount: 179.80,
    description: 'Venda: 1x Camiseta Oversized + 1x Boné',
    paymentMethod: 'pix',
    date: Date.now() - 1000 * 60 * 60 * 28,
  },
  {
    id: 'tx-2',
    type: 'out',
    category: 'Compra Fornecedor',
    amount: 450.00,
    description: 'Reposição de camisetas no Brás',
    paymentMethod: 'pix',
    date: Date.now() - 1000 * 60 * 60 * 20,
  },
  {
    id: 'tx-3',
    type: 'in',
    category: 'Abatimento Fiado',
    amount: 100.00,
    description: 'Acerto parcial de Lucas Ferreira',
    paymentMethod: 'pix',
    date: Date.now() - 1000 * 60 * 60 * 24,
  },
  {
    id: 'tx-4',
    type: 'in',
    category: 'Venda Balcão',
    amount: 289.90,
    description: 'Venda: 1x Tênis Sneaker Chunky',
    paymentMethod: 'cartao_credito',
    date: Date.now() - 1000 * 60 * 60 * 6,
  }
];

// PRODUTOS
export async function fetchProducts(): Promise<Product[]> {
  const db = await getDB();
  const products = await db.getAll('products');
  
  if (products.length === 0) {
    const tx = db.transaction('products', 'readwrite');
    for (const item of INITIAL_PRODUCTS) {
      await tx.store.put(item);
    }
    await tx.done;
    return INITIAL_PRODUCTS;
  }
  return products.sort((a, b) => b.createdAt - a.createdAt);
}

export async function saveProduct(product: Product): Promise<void> {
  const db = await getDB();
  await db.put('products', product);
}

export async function removeProduct(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('products', id);
}

export async function decreaseProductStock(
  productId: string,
  variationKey: string,
  quantity: number
): Promise<void> {
  const db = await getDB();
  const product = await db.get('products', productId);
  if (!product) return;

  const variations = product.stockByVariation || {};
  const current = variations[variationKey] ?? 10;
  const newStock = Math.max(0, current - quantity);
  variations[variationKey] = newStock;

  const total = Object.values(variations).reduce((a, b) => a + b, 0);
  const updated: Product = {
    ...product,
    stockByVariation: variations,
    totalStock: total,
    inStock: total > 0,
  };
  await db.put('products', updated);
}

// CLIENTES (CRM)
export async function fetchCustomers(): Promise<Customer[]> {
  const db = await getDB();
  const customers = await db.getAll('customers');
  if (customers.length === 0) {
    const tx = db.transaction('customers', 'readwrite');
    for (const cust of INITIAL_CUSTOMERS) {
      await tx.store.put(cust);
    }
    await tx.done;
    return INITIAL_CUSTOMERS;
  }
  return customers.sort((a, b) => b.createdAt - a.createdAt);
}

export async function saveCustomer(customer: Customer): Promise<void> {
  const db = await getDB();
  await db.put('customers', customer);
}

export async function removeCustomer(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('customers', id);
}

// FLUXO DE CAIXA (TRANSAÇÕES)
export async function fetchTransactions(): Promise<CashTransaction[]> {
  const db = await getDB();
  const txs = await db.getAll('cash_transactions');
  if (txs.length === 0) {
    const tx = db.transaction('cash_transactions', 'readwrite');
    for (const t of INITIAL_TRANSACTIONS) {
      await tx.store.put(t);
    }
    await tx.done;
    return INITIAL_TRANSACTIONS;
  }
  return txs.sort((a, b) => b.date - a.date);
}

export async function addTransaction(transaction: CashTransaction): Promise<void> {
  const db = await getDB();
  await db.put('cash_transactions', transaction);
}

export async function removeTransaction(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('cash_transactions', id);
}

// CADERNINHO DE FIADO (DÍVIDAS)
export async function fetchDebts(): Promise<DebtRecord[]> {
  const db = await getDB();
  const debts = await db.getAll('debts');
  if (debts.length === 0) {
    const tx = db.transaction('debts', 'readwrite');
    for (const d of INITIAL_DEBTS) {
      await tx.store.put(d);
    }
    await tx.done;
    return INITIAL_DEBTS;
  }
  return debts.sort((a, b) => b.createdAt - a.createdAt);
}

export async function saveDebt(debt: DebtRecord): Promise<void> {
  const db = await getDB();
  await db.put('debts', debt);
}

export async function removeDebt(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('debts', id);
}

// CONFIGURAÇÕES
export async function fetchSettings(): Promise<StoreSettings> {
  const db = await getDB();
  const settings = await db.get('settings', 'store');
  return settings || DEFAULT_SETTINGS;
}

export async function saveSettings(settings: StoreSettings): Promise<void> {
  const db = await getDB();
  await db.put('settings', settings, 'store');
}

// BACKUP COMPLETO
export async function exportCatalogBackup(): Promise<string> {
  const [products, settings, customers, debts, transactions] = await Promise.all([
    fetchProducts(),
    fetchSettings(),
    fetchCustomers(),
    fetchDebts(),
    fetchTransactions(),
  ]);

  const backup = {
    version: 2,
    exportedAt: new Date().toISOString(),
    store: settings,
    products,
    customers,
    debts,
    transactions,
  };
  return JSON.stringify(backup, null, 2);
}

export async function importCatalogBackup(jsonContent: string): Promise<{ products: number; customers: number; debts: number }> {
  const data = JSON.parse(jsonContent);
  const db = await getDB();

  let pCount = 0;
  if (Array.isArray(data.products)) {
    const tx = db.transaction('products', 'readwrite');
    for (const prod of data.products) {
      if (prod.id && prod.name) {
        await tx.store.put(prod);
        pCount++;
      }
    }
    await tx.done;
  }

  let cCount = 0;
  if (Array.isArray(data.customers)) {
    const tx = db.transaction('customers', 'readwrite');
    for (const cust of data.customers) {
      if (cust.id && cust.name) {
        await tx.store.put(cust);
        cCount++;
      }
    }
    await tx.done;
  }

  let dCount = 0;
  if (Array.isArray(data.debts)) {
    const tx = db.transaction('debts', 'readwrite');
    for (const debt of data.debts) {
      if (debt.id && debt.customerName) {
        await tx.store.put(debt);
        dCount++;
      }
    }
    await tx.done;
  }

  if (Array.isArray(data.transactions)) {
    const tx = db.transaction('cash_transactions', 'readwrite');
    for (const t of data.transactions) {
      if (t.id && t.amount) {
        await tx.store.put(t);
      }
    }
    await tx.done;
  }

  if (data.store) {
    await saveSettings(data.store);
  }

  return { products: pCount, customers: cCount, debts: dCount };
}
