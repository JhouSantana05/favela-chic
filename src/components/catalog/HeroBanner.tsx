import React from 'react';
import { Flame, Sparkles, MessageCircle, ShieldCheck, Truck } from 'lucide-react';
import { useProducts } from '../../context/ProductContext';

export const HeroBanner: React.FC = () => {
  const { settings } = useProducts();

  const handleOpenWhatsApp = () => {
    const rawNumber = settings.whatsappNumber.replace(/\D/g, '');
    const message = encodeURIComponent(`Olá! Vi o catálogo da ${settings.storeName} e gostaria de tirar uma dúvida.`);
    window.location.href = `https://api.whatsapp.com/send?phone=${rawNumber}&text=${message}`;
  };

  return (
    <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-zinc-900 via-zinc-950 to-black border border-zinc-800/80 p-6 sm:p-10 shadow-2xl my-4">
      {/* Luz ambiente de fundo */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-60 h-60 bg-yellow-600/5 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

      <div className="relative z-10 max-w-2xl">
        <div className="inline-flex items-center gap-2 bg-amber-500/15 border border-amber-500/30 rounded-full px-3 py-1 mb-3.5">
          <Flame className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-amber-400">
            Nova Coleção Urbana Disponível
          </span>
        </div>

        <h1 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight leading-[1.1]">
          VISTA A AUTENTICIDADE <span className="text-amber-400">DO BAIRRO</span>.
        </h1>

        <p className="text-xs sm:text-sm text-zinc-300 mt-2.5 max-w-lg leading-relaxed">
          Camisetas oversized pesadas, kicks exclusivos, bonés estruturados e correntes de respeito. 
          Escolha seu kit e feche seu pedido direto no WhatsApp!
        </p>

        {/* Badges de Benefícios */}
        <div className="mt-5 flex flex-wrap gap-2.5 sm:gap-4 text-[11px] sm:text-xs font-semibold text-zinc-400">
          <div className="flex items-center gap-1.5 bg-zinc-900/80 border border-zinc-800 px-3 py-1.5 rounded-xl">
            <Truck className="w-3.5 h-3.5 text-amber-400" />
            <span>Entrega Rápida no Bairro</span>
          </div>
          <div className="flex items-center gap-1.5 bg-zinc-900/80 border border-zinc-800 px-3 py-1.5 rounded-xl">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Retirada no Balcão</span>
          </div>
          <div className="flex items-center gap-1.5 bg-zinc-900/80 border border-zinc-800 px-3 py-1.5 rounded-xl">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Peças Selecionadas</span>
          </div>
        </div>

        {/* Botão de contato direto */}
        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={handleOpenWhatsApp}
            className="bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Chamar no WhatsApp da Loja</span>
          </button>
        </div>
      </div>
    </div>
  );
};
