import React, { useState } from 'react';
import { ShoppingCart, Plus, Minus, CheckCircle2, Search, ArrowRight } from 'lucide-react';
import { useProducts } from '../../context/ProductContext';
import { useManagement } from '../../context/ManagementContext';
import type { CartItem, PaymentMethod } from '../../types';
import confetti from 'canvas-confetti';

export const POSView: React.FC = () => {
  const { products } = useProducts();
  const { customers, processPOSSale } = useManagement();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Checkout modal state
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 15);
    return d.toISOString().split('T')[0];
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [saleSuccess, setSaleSuccess] = useState(false);

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val);
  };

  const handleAddItem = (product: typeof products[0]) => {
    const defaultSize = product.sizes[0] || 'Único';
    const defaultColor = product.colors[0] || 'Padrão';
    const itemId = `${product.id}::${defaultSize}::${defaultColor}`;

    setCart((prev) => {
      const existing = prev.find((item) => item.id === itemId);
      if (existing) {
        return prev.map((item) =>
          item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          id: itemId,
          product,
          selectedSize: defaultSize,
          selectedColor: defaultColor,
          quantity: 1,
        },
      ];
    });
  };

  const handleUpdateQuantity = (itemId: string, newQty: number) => {
    if (newQty <= 0) {
      setCart((prev) => prev.filter((i) => i.id !== itemId));
    } else {
      setCart((prev) =>
        prev.map((i) => (i.id === itemId ? { ...i, quantity: newQty } : i))
      );
    }
  };

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const handleFinishSale = async () => {
    if (cart.length === 0) return;

    if (paymentMethod === 'fiado' && !selectedCustomerId) {
      alert('Selecione o cliente para registrar a venda no Fiado!');
      return;
    }

    try {
      setIsProcessing(true);
      const customer = customers.find((c) => c.id === selectedCustomerId);

      await processPOSSale({
        items: cart,
        total: subtotal,
        paymentMethod,
        customer,
        dueDate: paymentMethod === 'fiado' ? dueDate : undefined,
      });

      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#10b981', '#ffffff'],
      });

      setSaleSuccess(true);
      setTimeout(() => {
        setSaleSuccess(false);
        setIsCheckoutOpen(false);
        setCart([]);
        setSelectedCustomerId('');
      }, 1500);
    } catch (err) {
      console.error('Erro ao finalizar venda:', err);
      alert('Erro ao registrar venda');
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchCat = selectedCategory === 'all' || p.category === selectedCategory;
    const matchSearch =
      !searchFilter ||
      p.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      p.category.toLowerCase().includes(searchFilter.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-5">
      
      {/* Topo do PDV */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
        <div>
          <span className="bg-amber-500/10 text-amber-400 text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full border border-amber-500/20">
            Frente de Caixa & Balcão
          </span>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-white mt-1">
            PDV / Venda Rápida
          </h1>
        </div>

        {/* Busca rápida */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Buscar peça rápida..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Lado Esquerdo: Catálogo de Peças (8 colunas) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-4">
          
          {/* Categorias Rápidas */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {['all', 'roupas', 'tenis', 'bones', 'acessorios'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition ${
                  selectedCategory === cat
                    ? 'bg-amber-500 text-black'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                }`}
              >
                {cat === 'all' ? 'Todos' : cat === 'bones' ? 'Bonés' : cat === 'tenis' ? 'Tênis' : cat === 'acessorios' ? 'Acessórios' : 'Roupas'}
              </button>
            ))}
          </div>

          {/* Grid de Produtos para Venda */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filteredProducts.map((p) => (
              <div
                key={p.id}
                onClick={() => handleAddItem(p)}
                className="bg-zinc-900/70 border border-zinc-800/90 rounded-2xl p-2.5 hover:border-amber-500/60 hover:bg-zinc-850 cursor-pointer transition active:scale-95 flex flex-col justify-between group"
              >
                <div className="aspect-[4/5] w-full rounded-xl overflow-hidden bg-zinc-950 mb-2 relative">
                  <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                  <span className="absolute bottom-1.5 right-1.5 bg-black/80 backdrop-blur-md text-[10px] font-bold text-zinc-300 px-1.5 py-0.5 rounded">
                    Estoque: {p.totalStock ?? 10}
                  </span>
                </div>

                <div>
                  <h4 className="font-semibold text-xs text-zinc-100 line-clamp-1 group-hover:text-amber-400">
                    {p.name}
                  </h4>
                  <span className="font-display font-black text-sm text-white block mt-0.5">
                    {formatPrice(p.price)}
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Lado Direito: Comanda da Venda Atual (5 colunas) */}
        <div className="lg:col-span-5 xl:col-span-4 bg-zinc-900/60 border border-zinc-800 rounded-3xl p-4 sm:p-5 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-amber-400" />
                <h3 className="font-display font-black text-base text-white">Comanda do Balcão</h3>
              </div>
              <span className="text-xs text-zinc-400 font-bold">
                {cart.length} itens
              </span>
            </div>

            {/* Lista de Itens Adicionados */}
            <div className="py-3 space-y-2.5 max-h-[380px] overflow-y-auto">
              {cart.length === 0 ? (
                <div className="py-12 text-center text-zinc-500 text-xs">
                  Toque nos produtos ao lado para adicionar à venda do balcão.
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="bg-zinc-950 border border-zinc-800/90 rounded-xl p-2.5 flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h5 className="font-semibold text-xs text-zinc-100 truncate">{item.product.name}</h5>
                      <span className="text-[10px] text-zinc-400">{item.selectedSize} • {formatPrice(item.product.price)}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        className="w-6 h-6 rounded-lg bg-zinc-900 hover:bg-zinc-800 flex items-center justify-center text-zinc-300 text-xs"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center text-xs font-bold text-white">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        className="w-6 h-6 rounded-lg bg-zinc-900 hover:bg-zinc-800 flex items-center justify-center text-zinc-300 text-xs"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <span className="font-bold text-xs text-amber-400 min-w-[60px] text-right">
                      {formatPrice(item.product.price * item.quantity)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Rodapé da Comanda com Total e Botão */}
          <div className="pt-4 border-t border-zinc-800 space-y-3">
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-zinc-400 font-bold">Total da Venda</span>
              <span className="font-display font-black text-2xl text-amber-400">
                {formatPrice(subtotal)}
              </span>
            </div>

            <button
              disabled={cart.length === 0}
              onClick={() => setIsCheckoutOpen(true)}
              className="w-full bg-amber-500 hover:bg-amber-400 active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed text-black font-extrabold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 text-sm transition"
            >
              <span>Cobrar Venda ({formatPrice(subtotal)})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

      {/* Modal de Finalização / Pagamento da Venda */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-5 sm:p-6 w-full max-w-md shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="font-display font-black text-lg text-white">Fechar Venda</h3>
                <span className="text-xs text-amber-400 font-bold">Total: {formatPrice(subtotal)}</span>
              </div>
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="text-zinc-400 hover:text-white text-xs font-bold"
              >
                Voltar
              </button>
            </div>

            {saleSuccess ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
                <h4 className="font-black text-lg text-white">Venda Concluída!</h4>
                <p className="text-xs text-zinc-400">Estoque abatido e transação lançada no sistema.</p>
              </div>
            ) : (
              <div className="space-y-4">
                
                {/* Formas de Pagamento */}
                <div>
                  <label className="text-xs font-bold text-zinc-300 uppercase block mb-1.5">
                    Forma de Pagamento:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'pix', label: '⚡ Pix' },
                      { id: 'cartao_credito', label: '💳 Cartão Crédito' },
                      { id: 'cartao_debito', label: '💳 Cartão Débito' },
                      { id: 'dinheiro', label: '💵 Dinheiro' },
                      { id: 'fiado', label: '📒 Fiado (Caderninho)' },
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setPaymentMethod(m.id as PaymentMethod)}
                        className={`p-2.5 rounded-xl border text-xs font-bold transition text-left ${
                          paymentMethod === m.id
                            ? 'bg-amber-500 text-black border-amber-500'
                            : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Se for Fiado: Selecionar o Cliente e Data de Acerto */}
                {paymentMethod === 'fiado' && (
                  <div className="space-y-3 bg-zinc-900/60 p-3.5 rounded-2xl border border-zinc-800">
                    <div>
                      <label className="text-xs font-bold text-amber-400 uppercase block mb-1">
                        Cliente da Quebrada: *
                      </label>
                      <select
                        value={selectedCustomerId}
                        onChange={(e) => setSelectedCustomerId(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
                        required
                      >
                        <option value="">-- Selecione o Cliente --</option>
                        {customers.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} {c.nickname ? `(${c.nickname})` : ''} - {c.phone}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-zinc-300 uppercase block mb-1">
                        Data Combinada para Acerto:
                      </label>
                      <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                )}

                <button
                  onClick={handleFinishSale}
                  disabled={isProcessing}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-black py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 text-sm transition"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>{isProcessing ? 'Gravando...' : 'Confirmar e Finalizar Venda'}</span>
                </button>

              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
