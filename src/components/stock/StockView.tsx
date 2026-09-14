import React, { useState } from 'react';
import { Package, AlertTriangle, TrendingUp, DollarSign, Plus, Minus, Search } from 'lucide-react';
import { useProducts } from '../../context/ProductContext';
import type { Product } from '../../types';

interface StockViewProps {
  onOpenNewProduct: () => void;
  onEditProduct: (product: Product) => void;
}

export const StockView: React.FC<StockViewProps> = ({
  onOpenNewProduct,
  onEditProduct,
}) => {
  const { products, editProduct } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val);
  };

  // Cálculos de Patrimônio e Lucratividade do Estoque
  const totalPieces = products.reduce((acc, p) => acc + (p.totalStock ?? 10), 0);
  const totalCostValue = products.reduce(
    (acc, p) => acc + (p.costPrice || p.price * 0.45) * (p.totalStock ?? 10),
    0
  );
  const totalSaleValue = products.reduce(
    (acc, p) => acc + p.price * (p.totalStock ?? 10),
    0
  );
  const totalEstimatedProfit = totalSaleValue - totalCostValue;

  const handleAdjustVariationStock = async (
    product: Product,
    varKey: string,
    delta: number
  ) => {
    const variations = { ...(product.stockByVariation || {}) };
    const current = variations[varKey] ?? 0;
    const newQty = Math.max(0, current + delta);
    variations[varKey] = newQty;

    const total = Object.values(variations).reduce((a, b) => a + b, 0);
    await editProduct({
      ...product,
      stockByVariation: variations,
      totalStock: total,
      inStock: total > 0,
    });
  };

  const filteredProducts = products.filter((p) => {
    const matchCat = categoryFilter === 'all' || p.category === categoryFilter;
    const matchSearch =
      !searchTerm ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-6">
      
      {/* Topo do Estoque */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div>
          <span className="bg-amber-500/10 text-amber-400 text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full border border-amber-500/20">
            Gestão de Grade & Lucratividade
          </span>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-white mt-1">
            Controle de Estoque
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
            Visualize o estoque exato por tamanho e cor, calcule seus custos e acompanhe a margem de lucro.
          </p>
        </div>

        <button
          onClick={onOpenNewProduct}
          className="w-full md:w-auto bg-amber-500 hover:bg-amber-400 text-black font-extrabold px-5 py-3 rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Nova Peça</span>
        </button>
      </div>

      {/* Indicadores de Patrimônio */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-zinc-400 font-bold">Total de Peças</span>
            <Package className="w-4 h-4 text-amber-400" />
          </div>
          <span className="font-display font-black text-xl sm:text-2xl text-white">
            {totalPieces} un.
          </span>
          <span className="text-[10px] text-zinc-500 block mt-1">Em toda a loja</span>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-zinc-400 font-bold">Investido em Custo</span>
            <DollarSign className="w-4 h-4 text-zinc-400" />
          </div>
          <span className="font-display font-black text-xl sm:text-2xl text-zinc-300">
            {formatPrice(totalCostValue)}
          </span>
          <span className="text-[10px] text-zinc-500 block mt-1">Mercadoria parada</span>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-zinc-400 font-bold">Valor de Venda</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="font-display font-black text-xl sm:text-2xl text-emerald-400">
            {formatPrice(totalSaleValue)}
          </span>
          <span className="text-[10px] text-zinc-500 block mt-1">Potencial bruto</span>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-zinc-400 font-bold">Lucro Estimado</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <span className="font-display font-black text-xl sm:text-2xl text-amber-400">
            {formatPrice(totalEstimatedProfit)}
          </span>
          <span className="text-[10px] text-zinc-500 block mt-1">Ao vender o estoque</span>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none pb-1">
          {['all', 'roupas', 'tenis', 'bones', 'acessorios'].map((c) => (
            <button
              key={c}
              onClick={() => setCategoryFilter(c)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition capitalize whitespace-nowrap ${
                categoryFilter === c
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              {c === 'all' ? 'Todos' : c === 'bones' ? 'Bonés' : c === 'tenis' ? 'Tênis' : c === 'acessorios' ? 'Acessórios' : 'Roupas'}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar peça ou categoria..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Lista de Produtos com Grade */}
      <div className="space-y-3.5">
        {filteredProducts.map((p) => {
          const cost = p.costPrice || p.price * 0.45;
          const profit = p.price - cost;
          const margin = Math.round((profit / p.price) * 100);
          const totalStock = p.totalStock ?? 10;
          const isLowStock = totalStock <= 3;

          return (
            <div
              key={p.id}
              className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-zinc-700 transition"
            >
              {/* Foto e Dados Básicos */}
              <div className="flex items-center gap-3.5 min-w-0">
                <img
                  src={p.images[0]}
                  alt={p.name}
                  className="w-16 h-20 rounded-2xl object-cover bg-zinc-950 shrink-0"
                />

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                      {p.category}
                    </span>
                    {isLowStock && (
                      <span className="text-[10px] font-bold text-red-400 flex items-center gap-1 bg-red-500/10 px-2 py-0.5 rounded-md border border-red-500/20">
                        <AlertTriangle className="w-3 h-3" /> Estoque Baixo
                      </span>
                    )}
                  </div>

                  <h3 className="font-semibold text-sm text-zinc-100 truncate mt-1">
                    {p.name}
                  </h3>

                  {/* Preços e Margem */}
                  <div className="flex flex-wrap items-baseline gap-3 text-xs mt-1.5">
                    <span className="text-zinc-400">
                      Custo: <strong>{formatPrice(cost)}</strong>
                    </span>
                    <span className="text-white">
                      Venda: <strong className="text-emerald-400">{formatPrice(p.price)}</strong>
                    </span>
                    <span className="text-amber-400 font-bold">
                      Lucro: +{formatPrice(profit)} ({margin}%)
                    </span>
                  </div>
                </div>
              </div>

              {/* Grade de Tamanhos com Controle de Estoque Rápido */}
              <div className="w-full md:w-auto bg-zinc-950/80 border border-zinc-800/80 rounded-2xl p-3 flex flex-col gap-2">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                  Grade Disponível: (Total: {totalStock} un)
                </span>

                <div className="flex flex-wrap gap-2">
                  {p.sizes.map((s) => {
                    const defaultColor = p.colors[0] || 'Padrão';
                    const varKey = `${s}::${defaultColor}`;
                    const qty = p.stockByVariation?.[varKey] ?? Math.round(totalStock / p.sizes.length);

                    return (
                      <div
                        key={s}
                        className="bg-zinc-900 border border-zinc-800 rounded-xl px-2 py-1 flex items-center gap-1.5"
                      >
                        <span className="text-xs font-bold text-zinc-200">{s}:</span>
                        <button
                          onClick={() => handleAdjustVariationStock(p, varKey, -1)}
                          className="w-5 h-5 rounded bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 text-xs"
                        >
                          <Minus className="w-2.5 h-2.5" />
                        </button>
                        <span className={`text-xs font-black px-1 ${qty === 0 ? 'text-red-400' : 'text-amber-400'}`}>
                          {qty}
                        </span>
                        <button
                          onClick={() => handleAdjustVariationStock(p, varKey, 1)}
                          className="w-5 h-5 rounded bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 text-xs"
                        >
                          <Plus className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Botão de Editar */}
              <div className="shrink-0">
                <button
                  onClick={() => onEditProduct(p)}
                  className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition"
                >
                  <span>Editar Peça</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
