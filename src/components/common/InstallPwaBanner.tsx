import React, { useState } from 'react';
import { Download, X, Smartphone, Sparkles } from 'lucide-react';
import { usePWA } from '../../hooks/usePWA';

export const InstallPwaBanner: React.FC = () => {
  const { isInstallable, isInstalled, installApp } = usePWA();
  const [isDismissed, setIsDismissed] = useState(false);

  if (isInstalled || !isInstallable || isDismissed) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 text-black px-4 py-2.5 shadow-lg relative flex items-center justify-between transition-all">
      <div className="flex items-center gap-2.5 max-w-2xl">
        <div className="w-8 h-8 rounded-full bg-black/15 flex items-center justify-center shrink-0">
          <Smartphone className="w-4 h-4 text-black" />
        </div>
        <div className="text-xs sm:text-sm font-medium leading-tight">
          <span className="font-extrabold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 inline" /> Instale o App Favela Chic!
          </span>
          <span className="opacity-90 hidden xs:inline">
            Acesso instantâneo, catálogo rápido e fotos na hora.
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={installApp}
          className="bg-black text-white hover:bg-zinc-900 active:scale-95 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-md transition"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Instalar</span>
        </button>

        <button
          onClick={() => setIsDismissed(true)}
          className="p-1 text-black/70 hover:text-black rounded-full hover:bg-black/10 transition"
          aria-label="Fechar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
