import React, { useState, useRef } from 'react';
import { X, Camera, Plus, Trash2, Image as ImageIcon, Sparkles, Check, AlertCircle } from 'lucide-react';
import type { Product, ProductCategory } from '../../types';
import { CameraModal } from './CameraModal';
import { compressImageFile } from '../../services/imageProcessor';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Omit<Product, 'id' | 'createdAt'> & { id?: string }) => Promise<void>;
  initialProduct?: Product | null;
}

const CATEGORY_DEFAULT_SIZES: Record<ProductCategory, string[]> = {
  roupas: ['P', 'M', 'G', 'GG'],
  tenis: ['38', '39', '40', '41', '42', '43'],
  bones: ['Tamanho Único'],
  acessorios: ['Padrão'],
};

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialProduct,
}) => {
  const [name, setName] = useState(initialProduct?.name || '');
  const [category, setCategory] = useState<ProductCategory>(initialProduct?.category || 'roupas');
  const [price, setPrice] = useState<string>(initialProduct?.price?.toString() || '');
  const [costPrice, setCostPrice] = useState<string>(initialProduct?.costPrice?.toString() || '');
  const [originalPrice, setOriginalPrice] = useState<string>(initialProduct?.originalPrice?.toString() || '');
  const [description, setDescription] = useState(initialProduct?.description || '');
  const [sizes, setSizes] = useState<string[]>(
    initialProduct?.sizes || CATEGORY_DEFAULT_SIZES['roupas']
  );
  const [newSizeInput, setNewSizeInput] = useState('');
  const [colors, setColors] = useState<string[]>(initialProduct?.colors || ['Preto']);
  const [newColorInput, setNewColorInput] = useState('');
  const [images, setImages] = useState<string[]>(initialProduct?.images || []);
  const [isFeatured, setIsFeatured] = useState(initialProduct?.isFeatured ?? true);
  const [inStock, setInStock] = useState(initialProduct?.inStock ?? true);

  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleCategoryChange = (newCat: ProductCategory) => {
    setCategory(newCat);
    // Se o usuário ainda não personalizou os tamanhos, preenche com o padrão da categoria
    if (sizes.length === 0 || JSON.stringify(sizes) === JSON.stringify(CATEGORY_DEFAULT_SIZES[category])) {
      setSizes(CATEGORY_DEFAULT_SIZES[newCat]);
    }
  };

  const handleAddSize = () => {
    const trimmed = newSizeInput.trim().toUpperCase();
    if (trimmed && !sizes.includes(trimmed)) {
      setSizes([...sizes, trimmed]);
      setNewSizeInput('');
    }
  };

  const handleRemoveSize = (sizeToRemove: string) => {
    setSizes(sizes.filter((s) => s !== sizeToRemove));
  };

  const handleAddColor = () => {
    const trimmed = newColorInput.trim();
    if (trimmed && !colors.includes(trimmed)) {
      setColors([...colors, trimmed]);
      setNewColorInput('');
    }
  };

  const handleRemoveColor = (colorToRemove: string) => {
    setColors(colors.filter((c) => c !== colorToRemove));
  };

  const handlePhotoCapturedFromCamera = (photoBase64: string) => {
    setImages((prev) => [...prev, photoBase64]);
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      const processed: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const compressed = await compressImageFile(files[i], {
          maxWidth: 1080,
          maxHeight: 1350,
          quality: 0.85,
        });
        processed.push(compressed);
      }
      setImages((prev) => [...prev, ...processed]);
    } catch (err) {
      console.error('Erro ao processar fotos da galeria:', err);
      alert('Erro ao carregar imagem selecionada.');
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImages(images.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('Por favor, informe o nome do produto.');
      return;
    }

    const parsedPrice = parseFloat(price.replace(',', '.'));
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setErrorMessage('Por favor, informe um preço válido.');
      return;
    }

    if (images.length === 0) {
      setErrorMessage('Adicione pelo menos 1 foto do produto (tire na câmera ou escolha da galeria).');
      return;
    }

    const parsedOriginalPrice = originalPrice ? parseFloat(originalPrice.replace(',', '.')) : undefined;
    const parsedCostPrice = costPrice ? parseFloat(costPrice.replace(',', '.')) : undefined;

    try {
      setIsSaving(true);
      await onSave({
        ...(initialProduct?.id ? { id: initialProduct.id } : {}),
        name: name.trim(),
        category,
        price: parsedPrice,
        costPrice: parsedCostPrice,
        originalPrice: parsedOriginalPrice && parsedOriginalPrice > parsedPrice ? parsedOriginalPrice : undefined,
        description: description.trim(),
        sizes: sizes.length > 0 ? sizes : ['Único'],
        colors: colors.length > 0 ? colors : ['Padrão'],
        images,
        isFeatured,
        inStock,
      });
      onClose();
    } catch (err) {
      console.error('Erro ao salvar produto:', err);
      setErrorMessage('Ocorreu um erro ao salvar o produto no catálogo.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
        <div className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl my-auto animate-in fade-in zoom-in-95">
          
          {/* Cabeçalho do Formulário */}
          <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="font-display font-black text-lg text-white">
                {initialProduct ? 'Editar Produto' : 'Cadastrar Novo Produto no Catálogo'}
              </h3>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
            
            {/* Mensagem de Erro */}
            {errorMessage && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2.5 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* SEÇÃO DE FOTOS DO PRODUTO (Câmera + Galeria) */}
            <div>
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block mb-2">
                Fotos do Produto *
              </label>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                
                {/* Botão Câmera Rápida */}
                <button
                  type="button"
                  onClick={() => setIsCameraOpen(true)}
                  className="aspect-[4/5] bg-amber-500/10 hover:bg-amber-500/20 border-2 border-dashed border-amber-500/50 rounded-2xl flex flex-col items-center justify-center text-amber-400 gap-1.5 active:scale-95 transition group"
                >
                  <div className="w-10 h-10 rounded-full bg-amber-500 text-black flex items-center justify-center shadow-md group-hover:scale-110 transition">
                    <Camera className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-extrabold text-amber-400">Tirar Foto</span>
                </button>

                {/* Botão Galeria */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-[4/5] bg-zinc-900 hover:bg-zinc-850 border-2 border-dashed border-zinc-750 rounded-2xl flex flex-col items-center justify-center text-zinc-400 gap-1.5 active:scale-95 transition"
                >
                  <ImageIcon className="w-6 h-6 text-zinc-500" />
                  <span className="text-[11px] font-bold text-zinc-400">Da Galeria</span>
                </button>

                {/* Miniaturas de Fotos Adicionadas */}
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-[4/5] rounded-2xl overflow-hidden border border-zinc-800 group bg-zinc-900"
                  >
                    <img src={img} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/70 text-red-400 hover:text-white hover:bg-red-600 transition"
                      title="Remover foto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    {idx === 0 && (
                      <span className="absolute bottom-1.5 left-1.5 text-[9px] font-extrabold bg-amber-500 text-black px-1.5 py-0.5 rounded shadow">
                        Capa
                      </span>
                    )}
                  </div>
                ))}

              </div>
            </div>

            {/* Nome do Produto */}
            <div>
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block mb-1.5">
                Nome da Peça / Modelo *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Camiseta Streetwear Bronx Oversized"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            {/* Categoria */}
            <div>
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block mb-1.5">
                Categoria *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['roupas', 'tenis', 'bones', 'acessorios'] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleCategoryChange(cat)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold capitalize transition ${
                      category === cat
                        ? 'bg-amber-500 text-black border-amber-500 shadow-md shadow-amber-500/10'
                        : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                    }`}
                  >
                    {cat === 'bones' ? 'Bonés' : cat === 'tenis' ? 'Tênis' : cat === 'acessorios' ? 'Acessórios' : 'Roupas'}
                  </button>
                ))}
              </div>
            </div>

            {/* Preços */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block mb-1.5">
                  Preço de Venda (R$) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-500">
                    R$
                  </span>
                  <input
                    type="text"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="99,90"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-3.5 py-2.5 text-sm font-bold text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block mb-1.5">
                  Preço de Custo (R$)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-500">
                    R$
                  </span>
                  <input
                    type="text"
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                    placeholder="45,00"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block mb-1.5">
                  Preço Original <span className="text-zinc-500 font-normal">Opcional</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-500">
                    R$
                  </span>
                  <input
                    type="text"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    placeholder="129,90"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* Tamanhos Disponíveis */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                  Tamanhos Disponíveis:
                </label>
                <span className="text-[11px] text-zinc-500">Pressione Enter ou Adicionar</span>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-2">
                {sizes.map((s) => (
                  <span
                    key={s}
                    className="bg-zinc-800 text-zinc-200 border border-zinc-700 text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5"
                  >
                    {s}
                    <button
                      type="button"
                      onClick={() => handleRemoveSize(s)}
                      className="hover:text-red-400"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSizeInput}
                  onChange={(e) => setNewSizeInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSize();
                    }
                  }}
                  placeholder="Ex: GG, 42, Especial..."
                  className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={handleAddSize}
                  className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Adicionar
                </button>
              </div>
            </div>

            {/* Cores Disponíveis */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                  Cores Disponíveis:
                </label>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-2">
                {colors.map((c) => (
                  <span
                    key={c}
                    className="bg-zinc-800 text-zinc-200 border border-zinc-700 text-xs font-medium px-2.5 py-1 rounded-lg flex items-center gap-1.5"
                  >
                    {c}
                    <button
                      type="button"
                      onClick={() => handleRemoveColor(c)}
                      className="hover:text-red-400"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newColorInput}
                  onChange={(e) => setNewColorInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddColor();
                    }
                  }}
                  placeholder="Ex: Preto Fosco, Off-white..."
                  className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={handleAddColor}
                  className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Adicionar
                </button>
              </div>
            </div>

            {/* Descrição */}
            <div>
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block mb-1.5">
                Descrição e Detalhes da Peça
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Ex: Tecido 100% algodão pesado, estampa em silk screen de alta durabilidade, caimento largo street..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500 resize-none"
              />
            </div>

            {/* Checkboxes: Destaque e Em Estoque */}
            <div className="flex items-center gap-6 pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-zinc-300">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 bg-zinc-900 border-zinc-700"
                />
                <span>Destacar na Vitrine (Drop Especial)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-zinc-300">
                <input
                  type="checkbox"
                  checked={inStock}
                  onChange={(e) => setInStock(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 bg-zinc-900 border-zinc-700"
                />
                <span>Em Estoque</span>
              </label>
            </div>

            {/* Botões do Rodapé */}
            <div className="pt-4 border-t border-zinc-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white text-xs font-bold hover:bg-zinc-900 transition"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="bg-amber-500 hover:bg-amber-400 text-black font-extrabold px-6 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>{isSaving ? 'Salvando na Nuvem...' : initialProduct ? 'Atualizar Peça' : 'Cadastrar no Catálogo'}</span>
              </button>
            </div>

          </form>

        </div>
      </div>

      {/* Input de Galeria invisível */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleGalleryUpload}
        className="hidden"
      />

      {/* Modal da Câmera em Tempo Real */}
      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onPhotoCaptured={handlePhotoCapturedFromCamera}
      />
    </>
  );
};
