import React from 'react';
import { ShoppingBag, Eye, Tag } from 'lucide-react';
import type { Product } from '../../types';
import { useCart } from '../../context/CartContext';

interface ProductCardProps {
  product: Product;
  onOpenDetails: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onOpenDetails }) => {
  const { addToCart } = useCart();

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val);
  };

  const discountPercent = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Adiciona com o primeiro tamanho e primeira cor disponíveis
    const defaultSize = product.sizes[0] || 'Único';
    const defaultColor = product.colors[0] || 'Padrão';
    addToCart(product, defaultSize, defaultColor, 1);
  };

  return (
    <div
      onClick={() => onOpenDetails(product)}
      className="group bg-zinc-900/60 rounded-2xl overflow-hidden border border-zinc-800/80 hover:border-amber-500/50 hover:shadow-xl hover:shadow-amber-500/5 transition-all duration-300 flex flex-col cursor-pointer"
    >
      {/* Container da Imagem com proporção 4:5 estilo lookbook */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-zinc-950">
        <img
          src={product.images[0] || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80'}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Gradiente sutil inferior na imagem */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

        {/* Badges superiores */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {discountPercent && (
            <span className="bg-red-500 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-md flex items-center gap-1 shadow-md">
              <Tag className="w-2.5 h-2.5" /> -{discountPercent}% OFF
            </span>
          )}
          {product.isFeatured && (
            <span className="bg-amber-500 text-black text-[10px] font-black uppercase px-2 py-0.5 rounded-md shadow-md">
              DROP EXCLUSIVO
            </span>
          )}
        </div>

        {/* Botão Hover rápido de Ver Detalhes */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 backdrop-blur-[2px]">
          <span className="bg-white/90 text-black text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform">
            <Eye className="w-3.5 h-3.5" /> Ver Detalhes
          </span>
        </div>

        {/* Tamanhos disponíveis na base da foto */}
        {product.sizes.length > 0 && (
          <div className="absolute bottom-2 left-2 right-2 flex flex-wrap gap-1 z-10">
            {product.sizes.slice(0, 4).map((s) => (
              <span
                key={s}
                className="bg-black/70 backdrop-blur-md text-zinc-300 text-[10px] font-bold px-1.5 py-0.5 rounded border border-white/10"
              >
                {s}
              </span>
            ))}
            {product.sizes.length > 4 && (
              <span className="bg-black/70 backdrop-blur-md text-zinc-400 text-[10px] font-bold px-1 py-0.5 rounded">
                +{product.sizes.length - 4}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Detalhes do Produto */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          <span className="text-[11px] uppercase tracking-wider text-amber-500 font-bold">
            {product.category}
          </span>
          <h3 className="font-semibold text-sm sm:text-base text-zinc-100 line-clamp-2 mt-0.5 group-hover:text-amber-400 transition-colors">
            {product.name}
          </h3>
        </div>

        <div className="mt-3 pt-2.5 border-t border-zinc-800/60 flex items-end justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-display font-black text-base sm:text-lg text-white">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-xs text-zinc-500 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>
            <span className="text-[10px] text-zinc-400 block font-medium">
              em até 3x de {formatPrice(product.price / 3)} sem juros
            </span>
          </div>

          <button
            onClick={handleQuickAdd}
            className="w-9 h-9 rounded-xl bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-black flex items-center justify-center border border-amber-500/30 transition-all active:scale-95 shrink-0"
            title="Adicionar à sacola"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
