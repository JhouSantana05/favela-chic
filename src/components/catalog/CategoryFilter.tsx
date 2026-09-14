import React from 'react';
import { Shirt, Footprints, Sparkles, LayoutGrid, Flame } from 'lucide-react';
import { useProducts } from '../../context/ProductContext';
import type { ProductCategory } from '../../types';

interface CategoryItem {
  id: ProductCategory | 'todas';
  label: string;
  icon: React.ReactNode;
}

const CATEGORIES: CategoryItem[] = [
  { id: 'todas', label: 'Todos os Drops', icon: <LayoutGrid className="w-4 h-4" /> },
  { id: 'roupas', label: 'Roupas', icon: <Shirt className="w-4 h-4" /> },
  { id: 'tenis', label: 'Tênis & Kicks', icon: <Footprints className="w-4 h-4" /> },
  { id: 'bones', label: 'Bonés & Caps', icon: <Flame className="w-4 h-4" /> },
  { id: 'acessorios', label: 'Acessórios', icon: <Sparkles className="w-4 h-4" /> },
];

export const CategoryFilter: React.FC = () => {
  const { selectedCategory, setSelectedCategory, products } = useProducts();

  const getCount = (catId: ProductCategory | 'todas') => {
    if (catId === 'todas') return products.length;
    return products.filter((p) => p.category === catId).length;
  };

  return (
    <div className="w-full overflow-x-auto py-2 scrollbar-none">
      <div className="flex items-center gap-2 sm:gap-2.5 min-w-max px-1">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const count = getCount(cat.id);

          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all tap-active ${
                isSelected
                  ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20 scale-[1.02]'
                  : 'bg-zinc-900/90 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 border border-zinc-800/80'
              }`}
            >
              <span className={isSelected ? 'text-black' : 'text-zinc-400'}>{cat.icon}</span>
              <span>{cat.label}</span>
              <span
                className={`text-[11px] px-1.5 py-0.5 rounded-full font-extrabold ${
                  isSelected ? 'bg-black/20 text-black' : 'bg-zinc-800 text-zinc-500'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
