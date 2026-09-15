import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { Product, StoreSettings, Customer, CashTransaction, DebtRecord, DebtPayment } from '../types';
import { db, storage } from './firebase';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  writeBatch,
  query,
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';

// -----------------------------------------------------------------------------
// 1. CONFIGURAÇÃO INDEXEDDB (CACHE LOCAL E MODO OFFLINE)
// -----------------------------------------------------------------------------
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

export function getLocalDB() {
  if (!dbPromise) {
    dbPromise = openDB<FavelaChicDB>(DB_NAME, DB_VERSION, {
      upgrade(dbInstance, oldVersion) {
        if (oldVersion < 1) {
          const productStore = dbInstance.createObjectStore('products', { keyPath: 'id' });
          productStore.createIndex('by-category', 'category');
          productStore.createIndex('by-created', 'createdAt');
          dbInstance.createObjectStore('settings');
        }
        if (oldVersion < 2) {
          if (!dbInstance.objectStoreNames.contains('customers')) {
            const customerStore = dbInstance.createObjectStore('customers', { keyPath: 'id' });
            customerStore.createIndex('by-name', 'name');
            customerStore.createIndex('by-phone', 'phone');
          }
          if (!dbInstance.objectStoreNames.contains('cash_transactions')) {
            const cashStore = dbInstance.createObjectStore('cash_transactions', { keyPath: 'id' });
            cashStore.createIndex('by-date', 'date');
            cashStore.createIndex('by-type', 'type');
          }
          if (!dbInstance.objectStoreNames.contains('debts')) {
            const debtStore = dbInstance.createObjectStore('debts', { keyPath: 'id' });
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

// -----------------------------------------------------------------------------
// DADOS PADRÃO INICIAIS
// -----------------------------------------------------------------------------
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
      'Padrão::Preto Fosco': 7,
      'Padrão::Verde Militar': 4,
    },
    totalStock: 11,
    createdAt: Date.now() - 1000 * 60 * 60 * 12,
  }
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    name: 'Lucas Ferreira',
    nickname: 'Lukinha',
    phone: '5511988881111',
    address: 'Rua das Flores, 45 - Casa 2',
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
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString().split('T')[0],
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
    dueDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString().split('T')[0],
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
    description: 'Venda: 1x Camiseta Heavy + 1x Boné Snapback',
    paymentMethod: 'pix',
    date: Date.now() - 1000 * 60 * 60 * 2,
  },
  {
    id: 'tx-2',
    type: 'in',
    category: 'Venda Balcão',
    amount: 289.90,
    description: 'Venda: 1x Tênis Sneaker Chunky',
    paymentMethod: 'cartao_credito',
    date: Date.now() - 1000 * 60 * 60 * 6,
  }
];

// -----------------------------------------------------------------------------
// 2. HELPER: UPLOAD DE FOTOS PARA O FIREBASE STORAGE
// -----------------------------------------------------------------------------
export async function uploadImageToStorage(dataUrl: string, pathPrefix = 'products'): Promise<string> {
  // Se não for base64 (já for URL remota http...), não precisa fazer upload
  if (!dataUrl.startsWith('data:image')) {
    return dataUrl;
  }

  try {
    const fileId = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.jpg`;
    const imageRef = ref(storage, `${pathPrefix}/${fileId}`);
    await uploadString(imageRef, dataUrl, 'data_url');
    return await getDownloadURL(imageRef);
  } catch (err) {
    console.warn('Upload de imagem no Storage falhou, usando imagem compactada em cache:', err);
    return dataUrl; // fallback seguro para manter funcionando
  }
}

// -----------------------------------------------------------------------------
// 3. PRODUTOS (FIRESTORE + CACHE LOCAL)
// -----------------------------------------------------------------------------
export async function fetchProducts(): Promise<Product[]> {
  try {
    const snapshot = await getDocs(collection(db, 'products'));
    if (snapshot.empty) {
      // Primeira inicialização na nuvem: sobe os produtos de exemplo
      const batch = writeBatch(db);
      for (const item of INITIAL_PRODUCTS) {
        batch.set(doc(db, 'products', item.id), item);
      }
      await batch.commit();
      return INITIAL_PRODUCTS;
    }
    const products = snapshot.docs.map(d => d.data() as Product);
    return products.sort((a, b) => b.createdAt - a.createdAt);
  } catch (err) {
    console.warn('Erro ao ler produtos do Firestore, recorrendo ao cache local:', err);
    const localDb = await getLocalDB();
    const products = await localDb.getAll('products');
    if (products.length === 0) {
      return INITIAL_PRODUCTS;
    }
    return products.sort((a, b) => b.createdAt - a.createdAt);
  }
}

export async function saveProduct(product: Product): Promise<void> {
  // Envia as imagens para o Firebase Storage se forem base64
  const cloudImages: string[] = [];
  for (const img of product.images) {
    const uploadedUrl = await uploadImageToStorage(img, `products/${product.id}`);
    cloudImages.push(uploadedUrl);
  }
  const updatedProduct = { ...product, images: cloudImages };

  // 1. Salva no Firestore
  try {
    await setDoc(doc(db, 'products', updatedProduct.id), updatedProduct);
  } catch (err) {
    console.warn('Erro ao salvar produto no Firestore, salvando no cache local:', err);
  }

  // 2. Salva no cache local (IndexedDB)
  try {
    const localDb = await getLocalDB();
    await localDb.put('products', updatedProduct);
  } catch (e) {
    console.error('Erro ao salvar no cache local:', e);
  }
}

export async function removeProduct(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'products', id));
  } catch (err) {
    console.warn('Erro ao deletar no Firestore:', err);
  }

  try {
    const localDb = await getLocalDB();
    await localDb.delete('products', id);
  } catch (e) {
    console.error('Erro ao deletar no cache local:', e);
  }
}

export async function decreaseProductStock(
  productId: string,
  variationKey: string,
  quantity: number
): Promise<void> {
  let product: Product | null = null;

  try {
    const snap = await getDoc(doc(db, 'products', productId));
    if (snap.exists()) {
      product = snap.data() as Product;
    }
  } catch {
    // busca do local
  }

  if (!product) {
    const localDb = await getLocalDB();
    product = (await localDb.get('products', productId)) || null;
  }

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

  await saveProduct(updated);
}

// -----------------------------------------------------------------------------
// 4. CLIENTES (CRM)
// -----------------------------------------------------------------------------
export async function fetchCustomers(): Promise<Customer[]> {
  try {
    const snap = await getDocs(collection(db, 'customers'));
    if (snap.empty) {
      const batch = writeBatch(db);
      for (const c of INITIAL_CUSTOMERS) {
        batch.set(doc(db, 'customers', c.id), c);
      }
      await batch.commit();
      return INITIAL_CUSTOMERS;
    }
    return snap.docs.map(d => d.data() as Customer).sort((a, b) => b.createdAt - a.createdAt);
  } catch (err) {
    console.warn('Usando cache local para clientes:', err);
    const localDb = await getLocalDB();
    const list = await localDb.getAll('customers');
    return list.length > 0 ? list : INITIAL_CUSTOMERS;
  }
}

export async function saveCustomer(customer: Customer): Promise<void> {
  try {
    await setDoc(doc(db, 'customers', customer.id), customer);
  } catch (err) {
    console.warn('Erro ao salvar cliente no Firestore:', err);
  }
  try {
    const localDb = await getLocalDB();
    await localDb.put('customers', customer);
  } catch (e) {
    console.error(e);
  }
}

export async function removeCustomer(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'customers', id));
  } catch (e) {
    console.warn(e);
  }
  try {
    const localDb = await getLocalDB();
    await localDb.delete('customers', id);
  } catch (e) {
    console.error(e);
  }
}

// -----------------------------------------------------------------------------
// 5. CADERNINHO DE FIADO
// -----------------------------------------------------------------------------
export async function fetchDebts(): Promise<DebtRecord[]> {
  try {
    const snap = await getDocs(collection(db, 'debts'));
    if (snap.empty) {
      const batch = writeBatch(db);
      for (const d of INITIAL_DEBTS) {
        batch.set(doc(db, 'debts', d.id), d);
      }
      await batch.commit();
      return INITIAL_DEBTS;
    }
    return snap.docs.map(d => d.data() as DebtRecord).sort((a, b) => b.createdAt - a.createdAt);
  } catch (err) {
    console.warn('Usando cache local para fiados:', err);
    const localDb = await getLocalDB();
    const list = await localDb.getAll('debts');
    return list.length > 0 ? list : INITIAL_DEBTS;
  }
}

export async function saveDebt(debt: DebtRecord): Promise<void> {
  try {
    await setDoc(doc(db, 'debts', debt.id), debt);
  } catch (e) {
    console.warn(e);
  }
  try {
    const localDb = await getLocalDB();
    await localDb.put('debts', debt);
  } catch (e) {
    console.error(e);
  }
}

export async function addDebtPayment(debtId: string, payment: DebtPayment): Promise<void> {
  let debt: DebtRecord | null = null;
  try {
    const snap = await getDoc(doc(db, 'debts', debtId));
    if (snap.exists()) debt = snap.data() as DebtRecord;
  } catch {
    // busca do local
  }
  if (!debt) {
    const localDb = await getLocalDB();
    debt = (await localDb.get('debts', debtId)) || null;
  }
  if (!debt) return;

  const newPayments = [...(debt.payments || []), payment];
  const totalPaid = newPayments.reduce((acc, p) => acc + p.amount, 0);
  const remainingAmount = Math.max(0, debt.totalAmount - totalPaid);
  const newStatus = remainingAmount <= 0.01 ? 'paid' : 'partial';

  const updatedDebt: DebtRecord = {
    ...debt,
    payments: newPayments,
    remainingAmount,
    status: newStatus,
  };

  await saveDebt(updatedDebt);
}

export async function removeDebt(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'debts', id));
  } catch (e) {
    console.warn(e);
  }
  try {
    const localDb = await getLocalDB();
    await localDb.delete('debts', id);
  } catch (e) {
    console.error(e);
  }
}

// -----------------------------------------------------------------------------
// 6. FLUXO DE CAIXA
// -----------------------------------------------------------------------------
export async function fetchTransactions(): Promise<CashTransaction[]> {
  try {
    const snap = await getDocs(collection(db, 'cash_transactions'));
    if (snap.empty) {
      const batch = writeBatch(db);
      for (const t of INITIAL_TRANSACTIONS) {
        batch.set(doc(db, 'cash_transactions', t.id), t);
      }
      await batch.commit();
      return INITIAL_TRANSACTIONS;
    }
    return snap.docs.map(d => d.data() as CashTransaction).sort((a, b) => b.date - a.date);
  } catch (err) {
    console.warn('Usando cache local para transações de caixa:', err);
    const localDb = await getLocalDB();
    const list = await localDb.getAll('cash_transactions');
    return list.length > 0 ? list : INITIAL_TRANSACTIONS;
  }
}

export async function saveTransaction(tx: CashTransaction): Promise<void> {
  try {
    await setDoc(doc(db, 'cash_transactions', tx.id), tx);
  } catch (e) {
    console.warn(e);
  }
  try {
    const localDb = await getLocalDB();
    await localDb.put('cash_transactions', tx);
  } catch (e) {
    console.error(e);
  }
}

export const addTransaction = saveTransaction;

export async function removeTransaction(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'cash_transactions', id));
  } catch (e) {
    console.warn(e);
  }
  try {
    const localDb = await getLocalDB();
    await localDb.delete('cash_transactions', id);
  } catch (e) {
    console.error(e);
  }
}

// -----------------------------------------------------------------------------
// 7. CONFIGURAÇÕES DA LOJA
// -----------------------------------------------------------------------------
export async function fetchSettings(): Promise<StoreSettings> {
  try {
    const snap = await getDoc(doc(db, 'settings', 'store'));
    if (snap.exists()) {
      return snap.data() as StoreSettings;
    }
    await setDoc(doc(db, 'settings', 'store'), DEFAULT_SETTINGS);
    return DEFAULT_SETTINGS;
  } catch (err) {
    console.warn('Usando configurações do cache local:', err);
    const localDb = await getLocalDB();
    const settings = await localDb.get('settings', 'store');
    return settings || DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: StoreSettings): Promise<void> {
  try {
    await setDoc(doc(db, 'settings', 'store'), settings);
  } catch (e) {
    console.warn(e);
  }
  try {
    const localDb = await getLocalDB();
    await localDb.put('settings', settings, 'store');
  } catch (e) {
    console.error(e);
  }
}

// -----------------------------------------------------------------------------
// 8. ESCUTAS EM TEMPO REAL (REALTIME SNAPSHOTS)
// -----------------------------------------------------------------------------
export function subscribeProducts(onData: (products: Product[]) => void): () => void {
  try {
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(d => d.data() as Product);
      if (items.length > 0) {
        onData(items);
      }
    }, (err) => {
      console.warn('Snapshot de produtos indisponível:', err);
    });
  } catch {
    return () => {};
  }
}

export function subscribeSettings(onData: (settings: StoreSettings) => void): () => void {
  try {
    return onSnapshot(doc(db, 'settings', 'store'), (snap) => {
      if (snap.exists()) {
        onData(snap.data() as StoreSettings);
      }
    }, (err) => {
      console.warn('Snapshot de settings indisponível:', err);
    });
  } catch {
    return () => {};
  }
}

// -----------------------------------------------------------------------------
// 9. BACKUP COMPLETO JSON (IMPORTAR / EXPORTAR)
// -----------------------------------------------------------------------------
export async function exportCatalogBackup(): Promise<string> {
  const [products, settings, customers, debts, transactions] = await Promise.all([
    fetchProducts(),
    fetchSettings(),
    fetchCustomers(),
    fetchDebts(),
    fetchTransactions(),
  ]);

  const backup = {
    version: 3,
    cloudProvider: 'firebase-firestore',
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

  let pCount = 0;
  if (Array.isArray(data.products)) {
    for (const prod of data.products) {
      if (prod.id && prod.name) {
        await saveProduct(prod);
        pCount++;
      }
    }
  }

  let cCount = 0;
  if (Array.isArray(data.customers)) {
    for (const cust of data.customers) {
      if (cust.id && cust.name) {
        await saveCustomer(cust);
        cCount++;
      }
    }
  }

  let dCount = 0;
  if (Array.isArray(data.debts)) {
    for (const debt of data.debts) {
      if (debt.id && debt.customerName) {
        await saveDebt(debt);
        dCount++;
      }
    }
  }

  if (Array.isArray(data.transactions)) {
    for (const t of data.transactions) {
      if (t.id && t.amount) {
        await saveTransaction(t);
      }
    }
  }

  if (data.store) {
    await saveSettings(data.store);
  }

  return { products: pCount, customers: cCount, debts: dCount };
}
