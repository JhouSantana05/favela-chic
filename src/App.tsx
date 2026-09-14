import React, { useState } from 'react';
import { ProductProvider, useProducts } from './context/ProductContext';
import { CartProvider } from './context/CartContext';
import { ManagementProvider } from './context/ManagementContext';
import { Header } from './components/common/Header';
import { InstallPwaBanner } from './components/common/InstallPwaBanner';
import { CategoryFilter } from './components/catalog/CategoryFilter';
import { ProductCard } from './components/catalog/ProductCard';
import { ProductDetailsModal } from './components/catalog/ProductDetailsModal';
import { CartDrawer } from './components/cart/CartDrawer';
import { ProductFormModal } from './components/admin/ProductFormModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { HeroBanner } from './components/catalog/HeroBanner';
import { POSView } from './components/pos/POSView';
import { DebtsView } from './components/debts/DebtsView';
import { CashFlowView } from './components/cashflow/CashFlowView';
import { CRMView } from './components/crm/CRMView';
import { StockView } from './components/stock/StockView';
import { AdminLoginModal } from './components/auth/AdminLoginModal';
import type { AppViewMode, Product } from './types';
import { MapPin, Phone, Sparkles, Lock } from 'lucide-react';

const MainContent: React.FC = () => {
  const [viewMode, setViewMode] = useState<AppViewMode>('customer');
  const [selectedProductDetails, setSelectedProductDetails] = useState<Product | null>(null);

  // Autenticação do Lojista (Dono)
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return sessionStorage.getItem('favela_chic_admin_auth') === 'true';
  });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [targetModeAfterLogin, setTargetModeAfterLogin] = useState<AppViewMode>('pos');

  // Estado para modal de criação/edição de produto com câmera
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const {
    filteredProducts,
    isLoading,
    addProduct,
    editProduct,
    settings,
    searchQuery,
    setSearchQuery,
  } = useProducts();

  const handleSelectMode = (mode: AppViewMode) => {
    if (mode === 'customer') {
      setViewMode('customer');
      return;
    }

    // Se tentar acessar área restrita sem login
    if (!isAdmin) {
      setTargetModeAfterLogin(mode);
      setIsLoginModalOpen(true);
      return;
    }

    setViewMode(mode);
  };

  const handleLoginSuccess = () => {
    setIsAdmin(true);
    sessionStorage.setItem('favela_chic_admin_auth', 'true');
    setIsLoginModalOpen(false);
    setViewMode(targetModeAfterLogin || 'pos');
  };

  const handleLogout = () => {
    setIsAdmin(false);
    sessionStorage.removeItem('favela_chic_admin_auth');
    setViewMode('customer');
  };

  const handleOpenNewProduct = () => {
    if (!isAdmin) {
      setTargetModeAfterLogin('stock');
      setIsLoginModalOpen(true);
      return;
    }
    setEditingProduct(null);
    setIsProductFormOpen(true);
  };

  const handleEditProduct = (prod: Product) => {
    if (!isAdmin) {
      setIsLoginModalOpen(true);
      return;
    }
    setEditingProduct(prod);
    setIsProductFormOpen(true);
  };

  const handleSaveProduct = async (
    prodData: Omit<Product, 'id' | 'createdAt'> & { id?: string }
  ) => {
    if (prodData.id) {
      const existing = filteredProducts.find((p) => p.id === prodData.id);
      if (existing) {
        await editProduct({
          ...prodData,
          id: prodData.id,
          createdAt: existing.createdAt,
        });
      }
    } else {
      await addProduct(prodData);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      
      {/* Banner de Instalação do PWA */}
      <InstallPwaBanner />

      {/* Barra de Navegação Superior com Abas ERP e Controle de Acesso */}
      <Header
        currentMode={viewMode}
        isAdmin={isAdmin}
        onSelectMode={handleSelectMode}
        onOpenQuickAdd={handleOpenNewProduct}
        onOpenLogin={() => {
          setTargetModeAfterLogin('pos');
          setIsLoginModalOpen(true);
        }}
        onLogout={handleLogout}
      />

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
        
        {/* 1. VITRINE / CATÁLOGO PARA O CLIENTE */}
        {viewMode === 'customer' && (
          <div className="space-y-6">
            {!searchQuery && <HeroBanner />}

            <div className="sticky top-20 sm:top-24 z-30 bg-zinc-950/95 backdrop-blur-sm py-2">
              <CategoryFilter />
            </div>

            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 py-12">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-zinc-900/40 rounded-2xl aspect-[4/5] animate-pulse border border-zinc-800"
                  />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-3xl p-10 text-center max-w-md mx-auto my-12">
                <p className="text-zinc-300 font-semibold text-base mb-1">Nenhum produto encontrado</p>
                <p className="text-zinc-500 text-xs mb-4">
                  {searchQuery
                    ? `Não encontramos resultados para "${searchQuery}".`
                    : 'Ainda não há produtos cadastrados nesta categoria.'}
                </p>
                {searchQuery ? (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="bg-amber-500 text-black font-bold text-xs px-4 py-2 rounded-xl"
                  >
                    Limpar pesquisa
                  </button>
                ) : (
                  <button
                    onClick={handleOpenNewProduct}
                    className="bg-amber-500 text-black font-bold text-xs px-4 py-2 rounded-xl"
                  >
                    Tirar foto e cadastrar peça
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6 pb-12">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onOpenDetails={(p) => setSelectedProductDetails(p)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ÁREAS RESTRITAS DO LOJISTA (SÓ ACESSÍVEIS COM SENHA) */}
        {isAdmin && viewMode === 'pos' && <POSView />}
        {isAdmin && viewMode === 'debts' && <DebtsView />}
        {isAdmin && viewMode === 'cashflow' && <CashFlowView />}
        {isAdmin && viewMode === 'crm' && <CRMView />}
        {isAdmin && viewMode === 'stock' && (
          <StockView
            onOpenNewProduct={handleOpenNewProduct}
            onEditProduct={handleEditProduct}
          />
        )}
        {isAdmin && viewMode === 'admin' && (
          <AdminDashboard
            onOpenNewProduct={handleOpenNewProduct}
            onEditProduct={handleEditProduct}
            onViewProductDetails={(p) => setSelectedProductDetails(p)}
          />
        )}

      </main>

      {/* Rodapé Streetwear da Favela Chic */}
      <footer className="bg-zinc-950 border-t border-zinc-900 py-8 px-4 sm:px-6 lg:px-8 mt-12 safe-bottom">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <span className="font-display font-black text-xl tracking-wider text-white flex items-center gap-1.5">
              FAVELA <span className="text-amber-400">CHIC</span>
            </span>
            <p className="text-xs text-zinc-400 mt-1 max-w-sm">
              {settings.tagline} • Moda autêntica com gestão completa de estoque, caixa e fiado.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-zinc-400">
            {settings.address && (
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-500" />
                {settings.address}
              </span>
            )}
            {settings.instagram && (
              <span className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                </svg>
                {settings.instagram}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-500" />
              WhatsApp: {settings.whatsappNumber}
            </span>
          </div>

          {/* Botão de Acesso do Lojista no Rodapé */}
          <div className="flex items-center gap-3 text-[11px] text-zinc-500">
            {!isAdmin ? (
              <button
                onClick={() => {
                  setTargetModeAfterLogin('pos');
                  setIsLoginModalOpen(true);
                }}
                className="hover:text-amber-400 text-zinc-400 flex items-center gap-1 px-3 py-1.5 rounded-lg border border-zinc-800 hover:border-amber-500/40 transition"
              >
                <Lock className="w-3 h-3" />
                <span>Área Restrita do Lojista</span>
              </button>
            ) : (
              <button
                onClick={handleLogout}
                className="hover:text-red-400 text-zinc-400 flex items-center gap-1 px-3 py-1.5 rounded-lg border border-zinc-800 transition"
              >
                <span>Bloquear Painel</span>
              </button>
            )}

            <div className="flex items-center gap-1">
              <span>Favela Chic OS</span>
              <Sparkles className="w-3 h-3 text-amber-500 inline" />
            </div>
          </div>
        </div>
      </footer>

      {/* Gaveta do Carrinho / Sacola */}
      <CartDrawer />

      {/* Modal de Detalhes do Produto */}
      <ProductDetailsModal
        product={selectedProductDetails}
        onClose={() => setSelectedProductDetails(null)}
      />

      {/* Modal de Cadastro / Edição de Produto com Câmera */}
      <ProductFormModal
        isOpen={isProductFormOpen}
        onClose={() => setIsProductFormOpen(false)}
        onSave={handleSaveProduct}
        initialProduct={editingProduct}
      />

      {/* Modal de Login com Senha do Lojista */}
      <AdminLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={handleLoginSuccess}
      />

    </div>
  );
};

export default function App() {
  return (
    <ProductProvider>
      <CartProvider>
        <ManagementProvider>
          <MainContent />
        </ManagementProvider>
      </CartProvider>
    </ProductProvider>
  );
}
