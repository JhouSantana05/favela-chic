import React, { useState, useEffect, useRef } from 'react';
import { Camera, SwitchCamera, X, Check, RotateCcw, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { useCamera } from '../../hooks/useCamera';
import { compressImageFile } from '../../services/imageProcessor';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPhotoCaptured: (base64Photo: string) => void;
}

export const CameraModal: React.FC<CameraModalProps> = ({
  isOpen,
  onClose,
  onPhotoCaptured,
}) => {
  const {
    videoRef,
    isActive,
    error,
    startCamera,
    stopCamera,
    toggleFacingMode,
    capturePhoto,
  } = useCamera();

  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
  const [isFlashing, setIsFlashing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPreviewPhoto(null);
      startCamera('environment');
    } else {
      stopCamera();
    }
  }, [isOpen, startCamera, stopCamera]);

  if (!isOpen) return null;

  const handleTakeSnapshot = () => {
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 150);

    const photo = capturePhoto();
    if (photo) {
      setPreviewPhoto(photo);
      stopCamera();
    }
  };

  const handleRetake = () => {
    setPreviewPhoto(null);
    startCamera('environment');
  };

  const handleConfirmPhoto = () => {
    if (previewPhoto) {
      onPhotoCaptured(previewPhoto);
      onClose();
    }
  };

  const handleGalleryFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImageFile(file, {
          maxWidth: 1080,
          maxHeight: 1350,
          quality: 0.85,
        });
        setPreviewPhoto(compressed);
        stopCamera();
      } catch (err) {
        console.error('Erro ao processar imagem da galeria:', err);
        alert('Não foi possível carregar a foto selecionada.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between overflow-hidden safe-top safe-bottom select-none">
      
      {/* Barra de Controle Superior */}
      <div className="relative z-20 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-white flex items-center justify-center backdrop-blur-md border border-white/10 transition"
          aria-label="Fechar câmera"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
          <Camera className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-xs font-bold text-zinc-200 tracking-wider">
            {previewPhoto ? 'PRÉVIA DO PRODUTO' : 'ENQUADRE A PEÇA'}
          </span>
        </div>

        {!previewPhoto ? (
          <button
            onClick={toggleFacingMode}
            className="w-10 h-10 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-white flex items-center justify-center backdrop-blur-md border border-white/10 transition"
            title="Alternar câmera frontal/traseira"
          >
            <SwitchCamera className="w-5 h-5" />
          </button>
        ) : (
          <div className="w-10 h-10" />
        )}
      </div>

      {/* Área Central: Visor de Vídeo ou Pré-visualização da Foto */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden bg-zinc-950">
        
        {/* Flash Effect ao clicar */}
        {isFlashing && (
          <div className="absolute inset-0 bg-white z-30 pointer-events-none transition-opacity duration-150" />
        )}

        {previewPhoto ? (
          // Visualização da Foto Tirada
          <div className="relative w-full h-full max-w-md max-h-[80vh] flex items-center justify-center p-2">
            <img
              src={previewPhoto}
              alt="Foto capturada do produto"
              className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl border border-zinc-800"
            />
          </div>
        ) : error ? (
          // Mensagem de Erro / Sem Permissão de Câmera
          <div className="p-6 text-center max-w-sm flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mb-3">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h4 className="font-bold text-base text-zinc-100 mb-1">Câmera indisponível</h4>
            <p className="text-xs text-zinc-400 mb-4">{error}</p>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-amber-500 hover:bg-amber-400 text-black font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition"
            >
              <ImageIcon className="w-4 h-4" /> Escolher Foto da Galeria
            </button>
          </div>
        ) : (
          // Visor da Câmera em Tempo Real
          <div className="relative w-full h-full flex items-center justify-center">
            <video
              ref={videoRef}
              playsInline
              autoPlay
              muted
              className="w-full h-full object-cover"
            />

            {/* Grid Guia de Enquadramento 3x3 */}
            <div className="absolute inset-4 sm:inset-10 pointer-events-none border border-white/20 rounded-2xl overflow-hidden grid grid-cols-3 grid-rows-3">
              <div className="border-r border-b border-white/15" />
              <div className="border-r border-b border-white/15" />
              <div className="border-b border-white/15" />
              <div className="border-r border-b border-white/15" />
              <div className="border-r border-b border-white/15" />
              <div className="border-b border-white/15" />
              <div className="border-r border-white/15" />
              <div className="border-r border-white/15" />
              <div />
            </div>
          </div>
        )}
      </div>

      {/* Barra de Controle Inferior */}
      <div className="relative z-20 p-6 bg-gradient-to-t from-black/90 to-transparent flex items-center justify-around">
        
        {previewPhoto ? (
          // Controles pós-captura: Repetir ou Confirmar
          <div className="flex items-center justify-center gap-6 w-full max-w-sm">
            <button
              onClick={handleRetake}
              className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 py-3.5 px-4 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-95 transition"
            >
              <RotateCcw className="w-4 h-4" /> Tirar Outra
            </button>

            <button
              onClick={handleConfirmPhoto}
              className="flex-1 bg-amber-500 hover:bg-amber-400 text-black py-3.5 px-4 rounded-2xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 active:scale-95 transition"
            >
              <Check className="w-5 h-5" /> Usar Foto
            </button>
          </div>
        ) : (
          // Controles ao vivo: Galeria + Botão Shutter Central
          <div className="flex items-center justify-around w-full max-w-sm">
            
            {/* Botão Galeria */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-12 h-12 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 flex items-center justify-center border border-white/10 active:scale-95 transition"
              title="Carregar da galeria"
            >
              <ImageIcon className="w-5 h-5" />
            </button>

            {/* Botão Central de Disparo (Shutter) */}
            <button
              onClick={handleTakeSnapshot}
              disabled={!isActive}
              className={`w-20 h-20 rounded-full border-4 border-white p-1 flex items-center justify-center transition-all ${
                isActive ? 'hover:scale-105 active:scale-90 opacity-100' : 'opacity-40 cursor-not-allowed'
              }`}
              title="Tirar foto"
            >
              <div className="w-full h-full rounded-full bg-amber-500 shadow-lg shadow-amber-500/50" />
            </button>

            <div className="w-12 h-12" />
          </div>
        )}

      </div>

      {/* Input de Arquivo oculto para Galeria */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleGalleryFile}
        className="hidden"
      />
    </div>
  );
};
