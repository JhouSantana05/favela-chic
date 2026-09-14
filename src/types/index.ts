export type ProductCategory = 'roupas' | 'tenis' | 'bones' | 'acessorios';

export interface CategoryInfo {
  id: ProductCategory;
  label: string;
  icon: string;
  description: string;
  defaultSizes: string[];
}

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  costPrice?: number; // Preço de custo (quanto pagou no fornecedor)
  originalPrice?: number;
  description: string;
  sizes: string[];
  colors: string[];
  images: string[];
  inStock: boolean;
  isFeatured?: boolean;
  stockByVariation?: Record<string, number>; // chave: `${size}::${color}`, valor: quantidade
  totalStock?: number;
  createdAt: number;
}

export interface CartItem {
  id: string;
  product: Product;
  selectedSize: string;
  selectedColor: string;
  quantity: number;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  whatsappNumber: string;
  instagram?: string;
  address?: string;
  deliveryFee?: number;
  pixKey?: string;
  pixKeyType?: 'cpf' | 'cnpj' | 'telefone' | 'email' | 'aleatoria';
  adminPassword?: string;
}

// CRM de Clientes
export interface Customer {
  id: string;
  name: string;
  nickname?: string;
  phone: string;
  address?: string;
  defaultSize?: string; // ex: G
  shoeSize?: string; // ex: 41
  birthday?: string; // YYYY-MM-DD
  notes?: string;
  createdAt: number;
}

// Fluxo de Caixa (Financeiro)
export type PaymentMethod = 'pix' | 'cartao_credito' | 'cartao_debito' | 'dinheiro' | 'fiado';

export interface CashTransaction {
  id: string;
  type: 'in' | 'out'; // in: receita/venda, out: despesa
  category: string; // 'Venda Balcão', 'Venda Online', 'Abatimento Fiado', 'Compra Mercadoria', 'Aluguel', 'Luz', 'Outros'
  amount: number;
  description: string;
  paymentMethod: PaymentMethod;
  date: number; // timestamp
  referenceId?: string; // id do pedido ou da dívida
}

// Caderninho de Fiado (Vendas a Prazo)
export interface DebtPayment {
  id: string;
  amount: number;
  date: number;
  paymentMethod: PaymentMethod;
  notes?: string;
}

export interface DebtRecord {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  itemsSummary: string;
  totalAmount: number;
  remainingAmount: number;
  dueDate: string; // data prometida para pagar (YYYY-MM-DD)
  status: 'pending' | 'partial' | 'paid';
  createdAt: number;
  payments: DebtPayment[];
}

export type AppViewMode =
  | 'customer'
  | 'admin'
  | 'pos'
  | 'stock'
  | 'cashflow'
  | 'debts'
  | 'crm';
