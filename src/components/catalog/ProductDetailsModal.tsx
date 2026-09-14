import React, { useState } from 'react';
import { X, ShoppingBag, MessageCircle, Share2, Check, Sparkles, ShieldCheck } from 'lucide-react';
import type { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { useProducts } from '../../context/ProductContext';
import confetti from 'canvas-confetti';

interface ProductDetailsModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({ product, onClose }) => {
  const { addToCart } = useCart();
  const { settings } = useProducts();

  const [selectedSize, setSelectedSize] = useState<string>(() => product?.sizes[0] || 'Único');
  const [selectedColor, setSelectedColor] = useState<string>(() => product?.colors[0] || 'Padrão');
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isAddedAnimation, setIsAddedAnimation] = useState(false);

  if (!product) return null;

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val);
  };

  const handleAddToCart = () => {
    addToCart(product, selectedSize, selectedColor, quantity);
    setIsAddedAnimation(true);
    
    // Efeito de confetes no botão
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#f59e0b', '#fbbf24', '#ffffff'],
    });

    setTimeout(() => {
      setIsAddedAnimation(false);
      onClose();
    }, 450);
  };

  const handleDirectWhatsApp = () => {
    const rawNumber = settings.whatsappNumber.replace(/\D/g, '');
    const text = encodeURIComponent(
      `Salve, equipe *${settings.storeName}*! 👋\n\n` +
      `Gostei muito desse produto do catálogo:\n` +
      `🔥 *${product.name}*\n` +
      `📏 Tamanho: *${selectedSize}*\n` +
      `🎨 Cor: *${selectedColor}*\n` +
      `🔢 Qtd: *${quantity}*\n` +
      `💰 Valor: *${formatPrice(product.price * quantity)}*\n\n` +
      `Ainda está disponível para entrega ou retirada?`
    );
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${rawNumber}&text=${text}`;
    window.location.href = whatsappUrl;
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Confira ${product.name} na ${settings.storeName}!`,
          url: window.location.href,
        });
      } catch {
        // usuário cancelou
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copiado para a área de transferência!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Botão Fechar Modal */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/70 hover:bg-zinc-800 text-zinc-300 hover:text-white flex items-center justify-center backdrop-blur-sm border border-white/10 transition"
          aria-label="Fechar modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          
          {/* Coluna da Imagem */}
          <div className="relative bg-zinc-900 flex flex-col justify-between">
            <div className="relative aspect-[4/5] sm:aspect-square md:aspect-auto md:h-full w-full overflow-hidden">
              <img
                src={product.images[activeImageIndex] || product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover object-center"
              />

              {/* Botão Compartilhar */}
              <button
                onClick={handleShare}
                className="absolute bottom-4 left-4 z-10 w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-sm border border-white/10 transition"
                title="Compartilhar produto"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>

            {/* Galeria de Miniaturas (se houver mais de 1 foto) */}
            {product.images.length > 1 && (
              <div className="flex gap-2 p-3 bg-zinc-950/80 border-t border-zinc-800/80 overflow-x-auto">
                {product.images.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition shrink-0 ${
                      activeImageIndex === idx ? 'border-amber-500 scale-105' : 'border-zinc-800 opacity-60'
                    }`}
                  >
                    <img src={imgUrl} alt="Miniatura" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Coluna de Informações e Compra */}
          <div className="p-5 sm:p-7 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs uppercase tracking-wider text-amber-500 font-bold bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">
                  {product.category}
                </span>
                {product.isFeatured && (
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Destaque
                  </span>
                )}
              </div>

              <h2 className="font-display font-black text-xl sm:text-2xl text-white">
                {product.name}
              </h2>

              {/* Preço */}
              <div className="mt-3 flex items-baseline gap-2">
                <span className="font-display font-black text-2xl sm:text-3xl text-amber-400">
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-sm text-zinc-500 line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                Pagamento via Pix com 5% de desconto ou em até 3x no cartão.
              </p>

              {/* Descrição */}
              {product.description && (
                <div className="mt-4 pt-3 border-t border-zinc-800/80">
                  <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Descrição & Detalhes
                  </h4>
                  <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Seletor de Tamanho */}
              {product.sizes.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                      Escolha o Tamanho:
                    </label>
                    <span className="text-xs text-amber-400 font-semibold">
                      Selecionado: {selectedSize}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`min-w-[44px] h-10 px-3 rounded-xl font-bold text-xs sm:text-sm border transition ${
                          selectedSize === size
                            ? 'bg-amber-500 text-black border-amber-500 shadow-md shadow-amber-500/20'
                            : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Seletor de Cor */}
              {product.colors.length > 0 && (
                <div className="mt-4">
                  <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block mb-2">
                    Cor disponível:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                          selectedColor === color
                            ? 'bg-zinc-100 text-black border-white font-bold'
                            : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantidade */}
              <div className="mt-4 flex items-center gap-3">
                <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                  Quantidade:
                </span>
                <div className="flex items-center border border-zinc-800 rounded-xl overflow-hidden bg-zinc-900">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-9 h-9 flex items-center justify-center text-zinc-300 hover:bg-zinc-800 text-base font-bold transition"
                  >
                    -
                  </button>
                  <span className="w-9 text-center font-bold text-sm text-white">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-9 h-9 flex items-center justify-center text-zinc-300 hover:bg-zinc-800 text-base font-bold transition"
                  >
                    +
                  </button>
                </div>
              </div>

            </div>

            {/* Botões de Ação */}
            <div className="mt-6 pt-4 border-t border-zinc-800 flex flex-col gap-2.5">
              
              <button
                onClick={handleAddToCart}
                disabled={isAddedAnimation}
                className="w-full bg-amber-500 hover:bg-amber-400 active:scale-98 text-black font-extrabold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition duration-200"
              >
                {isAddedAnimation ? (
                  <>
                    <Check className="w-5 h-5 text-black" />
                    <span>Adicionado à Sacola!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5" />
                    <span>Adicionar à Sacola • {formatPrice(product.price * quantity)}</span>
                  </>
                )}
              </button>

              <button
                onClick={handleDirectWhatsApp}
                className="w-full bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-bold py-3 px-4 rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition duration-200 text-sm"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Pedir Direto no WhatsApp</span>
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-zinc-500 mt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
                <span>Retirada no bairro ou entrega rápida via motoboy</span>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
