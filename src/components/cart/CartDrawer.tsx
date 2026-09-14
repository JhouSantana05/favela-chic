import React, { useState, useRef } from 'react';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  MessageCircle,
  ArrowRight,
  MapPin,
  Store,
  ChevronLeft,
  AlertCircle
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useProducts } from '../../context/ProductContext';
import confetti from 'canvas-confetti';

export const CartDrawer: React.FC = () => {
  const { cart, isCartOpen, closeCart, updateQuantity, removeFromCart, clearCart, subtotal } = useCart();
  const { settings } = useProducts();

  const [deliveryType, setDeliveryType] = useState<'pickup' | 'delivery'>('pickup');
  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'cartao' | 'dinheiro'>('pix');
  const [changeFor, setChangeFor] = useState('');

  // Erros visuais inline sem alert()
  const [nameError, setNameError] = useState(false);
  const [addressError, setAddressError] = useState(false);

  const nameInputRef = useRef<HTMLInputElement | null>(null);
  const addressInputRef = useRef<HTMLInputElement | null>(null);

  if (!isCartOpen) return null;

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val);
  };

  const deliveryFee = deliveryType === 'delivery' ? (settings.deliveryFee || 0) : 0;
  const finalTotal = subtotal + deliveryFee;

  const handleCheckoutWhatsApp = () => {
    if (cart.length === 0) return;

    // Validação inline sem travar o celular com alert()
    if (!customerName.trim()) {
      setNameError(true);
      nameInputRef.current?.focus();
      return;
    }

    if (deliveryType === 'delivery' && !customerAddress.trim()) {
      setAddressError(true);
      addressInputRef.current?.focus();
      return;
    }

    // Disparar confetes de comemoração
    confetti({
      particleCount: 70,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10b981', '#f59e0b', '#ffffff'],
    });

    const itemsSummary = cart
      .map(
        (item, index) =>
          `${index + 1}. *${item.product.name}*\n` +
          `   • Tamanho: ${item.selectedSize} | Cor: ${item.selectedColor}\n` +
          `   • Qtd: ${item.quantity}x de ${formatPrice(item.product.price)} = *${formatPrice(
            item.product.price * item.quantity
          )}*`
      )
      .join('\n\n');

    const paymentText =
      paymentMethod === 'pix'
        ? 'Pix (Chave da loja)'
        : paymentMethod === 'cartao'
        ? 'Cartão (Levar maquininha)'
        : `Dinheiro${changeFor ? ` (Troco para R$ ${changeFor})` : ''}`;

    const deliveryText =
      deliveryType === 'pickup'
        ? `🏪 *Retirada no Balcão*: ${settings.address || 'Endereço da Loja'}`
        : `🛵 *Entrega no Bairro* (+ ${formatPrice(deliveryFee)})\n📍 Endereço: ${customerAddress.trim()}`;

    const message =
      `🛍️ *NOVO PEDIDO - FAVELA CHIC* 🛍️\n\n` +
      `👤 *Cliente*: ${customerName.trim()}\n\n` +
      `📦 *ITENS DO PEDIDO*:\n${itemsSummary}\n\n` +
      `--------------------------------\n` +
      `💰 Subtotal: ${formatPrice(subtotal)}\n` +
      `${deliveryType === 'delivery' ? `🛵 Taxa de Entrega: ${formatPrice(deliveryFee)}\n` : ''}` +
      `💎 *TOTAL A PAGAR: ${formatPrice(finalTotal)}*\n` +
      `--------------------------------\n\n` +
      `🚚 *FORMA DE RECEBIMENTO*:\n${deliveryText}\n\n` +
      `💳 *FORMA DE PAGAMENTO*:\n${paymentText}\n\n` +
      `Aguardo confirmação para separar as peças! 🚀`;

    const rawNumber = settings.whatsappNumber.replace(/\D/g, '') || '5511999999999';
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${rawNumber}&text=${encodedMessage}`;

    // No celular, window.location.href não é bloqueado como popup!
    window.location.href = whatsappUrl;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop escuro clicável para fechar a sacola */}
      <div
        onClick={closeCart}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        aria-label="Fechar sacola tocando fora"
      />

      {/* Gaveta da Sacola - 100% da largura em mobile, sem margens que cortem o X */}
      <div className="relative z-10 w-full max-w-md bg-zinc-950 border-l border-zinc-800 text-zinc-100 flex flex-col shadow-2xl h-full safe-top safe-bottom">
        
        {/* Topo da Sacola com Botão de Voltar e X bem visíveis */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/90 shrink-0">
          
          <button
            onClick={closeCart}
            className="flex items-center gap-1.5 text-xs font-bold text-zinc-400 hover:text-white active:scale-95 bg-zinc-900 px-3 py-2 rounded-xl border border-zinc-800 transition"
            title="Voltar para a vitrine"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Voltar</span>
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <h3 className="font-display font-black text-base sm:text-lg text-white">Sua Sacola</h3>
          </div>

          <button
            onClick={closeCart}
            className="w-9 h-9 rounded-xl bg-zinc-900 hover:bg-zinc-800 active:scale-95 text-zinc-400 hover:text-white flex items-center justify-center border border-zinc-800 transition shrink-0"
            aria-label="Fechar sacola"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conteúdo rolável */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 my-auto">
              <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600 mb-4">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-base text-zinc-200">Sua sacola está vazia</h4>
              <p className="text-xs text-zinc-400 mt-1 max-w-xs">
                Adicione camisetas oversized, tênis, bonés e acessórios estilosos do nosso catálogo.
              </p>
              <button
                onClick={closeCart}
                className="mt-5 bg-amber-500 text-black font-bold text-xs px-6 py-3 rounded-2xl hover:bg-amber-400 active:scale-95 transition"
              >
                Explorar Vitrine
              </button>
            </div>
          ) : (
            <>
              {/* Cabeçalho da Lista de Peças */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Peças Selecionadas ({cart.length})
                </span>
                <button
                  onClick={clearCart}
                  className="text-xs text-red-400 hover:text-red-300 font-medium flex items-center gap-1 active:scale-95 transition"
                >
                  <Trash2 className="w-3 h-3" /> Limpar tudo
                </button>
              </div>

              {/* Lista de Peças */}
              <div className="space-y-3">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-3 flex gap-3 items-center"
                  >
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-16 h-16 rounded-xl object-cover bg-zinc-950 shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-xs sm:text-sm text-zinc-100 truncate">
                        {item.product.name}
                      </h4>
                      <div className="text-[11px] text-zinc-400 flex items-center gap-1.5 mt-0.5">
                        <span className="bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-300">
                          {item.selectedSize}
                        </span>
                        <span className="bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-300">
                          {item.selectedColor}
                        </span>
                      </div>
                      <span className="font-bold text-xs text-amber-400 block mt-1">
                        {formatPrice(item.product.price * item.quantity)}
                      </span>
                    </div>

                    {/* Controle de Quantidade */}
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <div className="flex items-center border border-zinc-800 rounded-lg overflow-hidden bg-zinc-950">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center text-zinc-400 hover:text-white active:bg-zinc-800"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-bold text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center text-zinc-400 hover:text-white active:bg-zinc-800"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-zinc-600 hover:text-red-400 p-1 transition"
                        title="Remover peça"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Formulário de Dados para o Fechamento */}
              <div className="pt-4 border-t border-zinc-800/80 space-y-3.5">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 block">
                  Dados para o Pedido
                </span>

                {/* Nome do Cliente */}
                <div>
                  <label className="text-xs font-bold text-zinc-300 block mb-1">
                    Seu Nome: *
                  </label>
                  <input
                    ref={nameInputRef}
                    type="text"
                    value={customerName}
                    onChange={(e) => {
                      setCustomerName(e.target.value);
                      if (nameError) setNameError(false);
                    }}
                    placeholder="Digite seu nome (Ex: Carlos Oliveira)"
                    className={`w-full bg-zinc-900 border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none transition ${
                      nameError
                        ? 'border-red-500 ring-2 ring-red-500/30'
                        : 'border-zinc-800 focus:border-amber-500'
                    }`}
                  />
                  {nameError && (
                    <span className="text-[11px] text-red-400 font-bold flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3" /> Por favor, informe seu nome para separarmos as peças.
                    </span>
                  )}
                </div>

                {/* Tipo de Recebimento */}
                <div>
                  <label className="text-xs font-bold text-zinc-300 block mb-1.5">
                    Como deseja receber?
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDeliveryType('pickup')}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                        deliveryType === 'pickup'
                          ? 'bg-amber-500/10 border-amber-500 text-amber-400'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                      }`}
                    >
                      <Store className="w-3.5 h-3.5" /> Retirar na Loja
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeliveryType('delivery')}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                        deliveryType === 'delivery'
                          ? 'bg-amber-500/10 border-amber-500 text-amber-400'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                      }`}
                    >
                      <MapPin className="w-3.5 h-3.5" /> Entrega (+{formatPrice(settings.deliveryFee || 0)})
                    </button>
                  </div>
                </div>

                {/* Endereço de Entrega (se entrega selecionada) */}
                {deliveryType === 'delivery' && (
                  <div>
                    <label className="text-xs font-bold text-zinc-300 block mb-1">
                      Endereço & Referência no Bairro: *
                    </label>
                    <input
                      ref={addressInputRef}
                      type="text"
                      value={customerAddress}
                      onChange={(e) => {
                        setCustomerAddress(e.target.value);
                        if (addressError) setAddressError(false);
                      }}
                      placeholder="Rua, número, complemento e ponto de referência"
                      className={`w-full bg-zinc-900 border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none transition ${
                        addressError
                          ? 'border-red-500 ring-2 ring-red-500/30'
                          : 'border-zinc-800 focus:border-amber-500'
                      }`}
                    />
                    {addressError && (
                      <span className="text-[11px] text-red-400 font-bold flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3 h-3" /> Informe o endereço para o motoboy entregar.
                      </span>
                    )}
                  </div>
                )}

                {/* Método de Pagamento */}
                <div>
                  <label className="text-xs font-bold text-zinc-300 block mb-1.5">
                    Forma de Pagamento:
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['pix', 'cartao', 'dinheiro'] as const).map((method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setPaymentMethod(method)}
                        className={`py-2 px-1 rounded-xl border text-[11px] font-bold capitalize transition text-center ${
                          paymentMethod === method
                            ? 'bg-zinc-100 text-black border-white'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                        }`}
                      >
                        {method === 'pix' ? '⚡ Pix' : method === 'cartao' ? '💳 Cartão' : '💵 Dinheiro'}
                      </button>
                    ))}
                  </div>

                  {paymentMethod === 'dinheiro' && (
                    <div className="mt-2">
                      <input
                        type="text"
                        value={changeFor}
                        onChange={(e) => setChangeFor(e.target.value)}
                        placeholder="Precisa de troco para quanto? (opcional)"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  )}
                </div>

              </div>
            </>
          )}
        </div>

        {/* Rodapé Fixo com Totais, Botão WhatsApp e Botão Continuar Comprando */}
        {cart.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-zinc-800 bg-zinc-950 shrink-0 space-y-3">
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-zinc-400">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {deliveryType === 'delivery' && (
                <div className="flex justify-between text-zinc-400">
                  <span>Taxa de Entrega (Bairro)</span>
                  <span>{formatPrice(deliveryFee)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold text-white pt-1.5 border-t border-zinc-800">
                <span>Total do Pedido</span>
                <span className="font-display text-amber-400 text-lg font-black">
                  {formatPrice(finalTotal)}
                </span>
              </div>
            </div>

            {/* Botão Principal de Envio no WhatsApp */}
            <button
              onClick={handleCheckoutWhatsApp}
              className="w-full bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-black py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition text-sm sm:text-base"
            >
              <MessageCircle className="w-5 h-5 fill-white" />
              <span>Finalizar Pedido no WhatsApp</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            {/* Botão Secundário para Fechar Sacola e Continuar Comprando */}
            <button
              onClick={closeCart}
              className="w-full py-2 text-center text-xs text-zinc-400 hover:text-zinc-200 transition font-bold"
            >
              Continuar Comprando na Vitrine
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
