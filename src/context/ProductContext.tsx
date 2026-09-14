import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { Product, ProductCategory, StoreSettings } from '../types';
import { fetchProducts, saveProduct, removeProduct, fetchSettings, saveSettings } from '../services/storage';

interface ProductContextType {
  products: Product[];
  filteredProducts: Product[];
  settings: StoreSettings;
  isLoading: boolean;
  selectedCategory: ProductCategory | 'todas';
  searchQuery: string;
  setSelectedCategory: (category: ProductCategory | 'todas') => void;
  setSearchQuery: (query: string) => void;
  addProduct: (product: Omit<Product, 'id' | 'createdAt'> & { id?: string }) => Promise<Product>;
  editProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  updateSettings: (newSettings: StoreSettings) => Promise<void>;
  reloadProducts: () => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<StoreSettings>({
    storeName: 'Favela Chic',
    tagline: 'O melhor do Streetwear & Moda Urbana do Bairro',
    whatsappNumber: '5511999999999',
    instagram: '@favelachic.oficial',
    address: 'Rua Principal do Bairro, 120 - Loja 2',
    deliveryFee: 10,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'todas'>('todas');
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [storedProducts, storedSettings] = await Promise.all([
        fetchProducts(),
        fetchSettings(),
      ]);
      setProducts(storedProducts);
      setSettings(storedSettings);
    } catch (err) {
      console.error('Erro ao carregar dados locais:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const addProduct = async (productData: Omit<Product, 'id' | 'createdAt'> & { id?: string }): Promise<Product> => {
    const newProduct: Product = {
      ...productData,
      id: productData.id || `prod-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: Date.now(),
    };

    await saveProduct(newProduct);
    setProducts((prev) => [newProduct, ...prev]);
    return newProduct;
  };

  const editProduct = async (updatedProduct: Product): Promise<void> => {
    await saveProduct(updatedProduct);
    setProducts((prev) => prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)));
  };

  const deleteProduct = async (id: string): Promise<void> => {
    await removeProduct(id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const updateSettingsHandler = async (newSettings: StoreSettings): Promise<void> => {
    await saveSettings(newSettings);
    setSettings(newSettings);
  };

  // Filtragem de produtos por busca e categoria
  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const matchCategory = selectedCategory === 'todas' || item.category === selectedCategory;
      const normalizedQuery = searchQuery.toLowerCase().trim();
      const matchQuery =
        !normalizedQuery ||
        item.name.toLowerCase().includes(normalizedQuery) ||
        item.description.toLowerCase().includes(normalizedQuery) ||
        item.colors.some((c) => c.toLowerCase().includes(normalizedQuery));
      return matchCategory && matchQuery;
    });
  }, [products, selectedCategory, searchQuery]);

  return (
    <ProductContext.Provider
      value={{
        products,
        filteredProducts,
        settings,
        isLoading,
        selectedCategory,
        searchQuery,
        setSelectedCategory,
        setSearchQuery,
        addProduct,
        editProduct,
        deleteProduct,
        updateSettings: updateSettingsHandler,
        reloadProducts: loadData,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export function useProducts() {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts deve ser utilizado dentro de um ProductProvider');
  }
  return context;
}
