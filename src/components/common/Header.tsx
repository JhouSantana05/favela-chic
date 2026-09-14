import React from 'react';
import {
  ShoppingBag,
  Camera,
  Search,
  X,
  ShoppingCart,
  BookOpen,
  DollarSign,
  Users,
  Package,
  LayoutGrid
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useProducts } from '../../context/ProductContext';
import { useManagement } from '../../context/ManagementContext';
import type { AppViewMode } from '../../types';

interface HeaderProps {
  currentMode: AppViewMode;
  onSelectMode: (mode: AppViewMode) => void;
  onOpenQuickAdd: () => void;
}

interface NavItem {
  id: AppViewMode;
  label: string;
  icon: React.ReactNode;
  badge?: string;
  badgeColor?: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentMode,
  onSelectMode,
  onOpenQuickAdd,
}) => {
  const { totalItems, openCart } = useCart();
  const { searchQuery, setSearchQuery, settings } = useProducts();
  const { overdueDebtsCount } = useManagement();

  const NAV_ITEMS: NavItem[] = [
    { id: 'customer', label: 'Vitrine', icon: <LayoutGrid className="w-4 h-4" /> },
    { id: 'pos', label: 'PDV Balcão', icon: <ShoppingCart className="w-4 h-4" /> },
    {
      id: 'debts',
      label: 'Fiado',
      icon: <BookOpen className="w-4 h-4" />,
      badge: overdueDebtsCount > 0 ? `${overdueDebtsCount} venc.` : undefined,
      badgeColor: 'bg-red-500 text-white',
    },
    { id: 'cashflow', label: 'Caixa', icon: <DollarSign className="w-4 h-4" /> },
    { id: 'crm', label: 'Clientes', icon: <Users className="w-4 h-4" /> },
    { id: 'stock', label: 'Estoque', icon: <Package className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800/80 safe-top">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Linha Principal do Topo */}
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3">
          
          {/* Logo & Marca Favela Chic */}
          <div
            onClick={() => onSelectMode('customer')}
            className="flex items-center gap-2.5 cursor-pointer group shrink-0"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-amber-600 to-yellow-600 flex items-center justify-center p-0.5 shadow-lg shadow-amber-500/10 group-hover:scale-105 transition">
              <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center">
                <span className="font-display font-black text-amber-400 text-lg tracking-tighter">FC</span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-display font-black text-xl sm:text-2xl tracking-wider text-white flex items-center gap-1.5">
                FAVELA <span className="text-amber-400 font-extrabold">CHIC</span>
              </span>
              <span className="text-[10px] text-zinc-400 uppercase tracking-widest -mt-1 font-semibold hidden md:inline">
                {settings.tagline}
              </span>
            </div>
          </div>

          {/* Busca Rápida (Desktop) */}
          {currentMode === 'customer' && (
            <div className="hidden md:flex flex-1 max-w-md mx-4">
              <div className="relative w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar peças no catálogo..."
                  className="w-full bg-zinc-900/90 border border-zinc-800 rounded-full pl-10 pr-9 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Botões da Direita */}
          <div className="flex items-center gap-2">
            
            {/* Botão Câmera / Tirar Foto */}
            <button
              onClick={onOpenQuickAdd}
              className="bg-amber-500 hover:bg-amber-400 active:scale-95 text-black font-extrabold px-3 py-2 rounded-xl text-xs sm:text-sm flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition"
              title="Tirar foto e cadastrar peça"
            >
              <Camera className="w-4 h-4" />
              <span className="hidden xs:inline">Tirar Foto</span>
            </button>

            {/* Sacola de Compras */}
            <button
              onClick={openCart}
              className="relative p-2.5 bg-zinc-900 hover:bg-zinc-850 active:scale-95 border border-zinc-800 rounded-xl text-zinc-200 hover:text-white transition"
              aria-label="Abrir Sacola de Compras"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-black text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-pulse">
                  {totalItems}
                </span>
              )}
            </button>

          </div>

        </div>

        {/* Menu de Abas de Navegação (Vitrine, PDV, Fiado, Caixa, Clientes, Estoque) */}
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-2 pt-1 border-t border-zinc-900 scrollbar-none">
          {NAV_ITEMS.map((item) => {
            const isActive = currentMode === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectMode(item.id as AppViewMode)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap tap-active ${
                  isActive
                    ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20 scale-[1.02]'
                    : 'bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850 border border-zinc-800/80'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ml-1 ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
};
