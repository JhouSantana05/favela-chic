import React, { useState, useRef } from 'react';
import { Camera, Edit2, Trash2, Settings, Download, Upload, Eye, CheckCircle2, Store, Phone, MapPin, DollarSign, Shirt, Footprints, Flame, Sparkles, LayoutGrid, Lock, KeyRound } from 'lucide-react';
import { useProducts } from '../../context/ProductContext';
import type { Product, StoreSettings } from '../../types';
import { exportCatalogBackup, importCatalogBackup } from '../../services/storage';

interface AdminDashboardProps {
  onOpenNewProduct: () => void;
  onEditProduct: (product: Product) => void;
  onViewProductDetails: (product: Product) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onOpenNewProduct,
  onEditProduct,
  onViewProductDetails,
}) => {
  const { products, deleteProduct, settings, updateSettings, reloadProducts } = useProducts();

  const [activeTab, setActiveTab] = useState<'products' | 'settings'>('products');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  // Form State para configurações da loja
  const [storeForm, setStoreForm] = useState<StoreSettings>(settings);
  const backupInputRef = useRef<HTMLInputElement | null>(null);

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val);
  };

  const handleSaveStoreSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      await updateSettings(storeForm);
      setSettingsSuccess(true);
      setTimeout(() => setSettingsSuccess(false), 3000);
    } catch (err) {
      console.error('Erro ao salvar configurações:', err);
      alert('Erro ao salvar configurações');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleDelete = async (prod: Product) => {
    if (confirm(`Tem certeza que deseja remover "${prod.name}" do catálogo?`)) {
      await deleteProduct(prod.id);
    }
  };

  const handleExportBackup = async () => {
    try {
      const json = await exportCatalogBackup();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `catalogo-favela-chic-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Erro ao exportar:', err);
      alert('Erro ao exportar backup');
    }
  };

  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const count = await importCatalogBackup(text);
      await reloadProducts();
      alert(`Sucesso! ${count} produtos foram importados para o catálogo.`);
    } catch (err) {
      console.error('Erro ao importar:', err);
      alert('Arquivo de backup inválido.');
    }
  };

  // Contadores
  const countRoupas = products.filter((p) => p.category === 'roupas').length;
  const countTenis = products.filter((p) => p.category === 'tenis').length;
  const countBones = products.filter((p) => p.category === 'bones').length;
  const countAcessorios = products.filter((p) => p.category === 'acessorios').length;

  const displayedProducts = filterCategory === 'all'
    ? products
    : products.filter((p) => p.category === filterCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Barra de Topo do Painel */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-amber-500/10 text-amber-400 text-xs font-black uppercase px-2.5 py-0.5 rounded-full border border-amber-500/20">
              Painel de Gestão da Loja
            </span>
          </div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-white">
            Catálogo & Estoque
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
            Tire fotos dos produtos na loja, defina preços e receba pedidos no seu WhatsApp.
          </p>
        </div>

        {/* Botão de Ação Principal: CÂMERA / NOVO PRODUTO */}
        <button
          onClick={onOpenNewProduct}
          className="w-full md:w-auto bg-amber-500 hover:bg-amber-400 active:scale-95 text-black font-extrabold px-5 py-3 rounded-2xl text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-amber-500/25 transition"
        >
          <Camera className="w-5 h-5" />
          <span>Tirar Foto e Cadastrar Peça</span>
        </button>
      </div>

      {/* Cartões de Métricas Rápidas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-3.5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
            <Shirt className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-zinc-400 block">Roupas</span>
            <span className="font-display font-black text-lg text-white">{countRoupas}</span>
          </div>
        </div>

        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-3.5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <Footprints className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-zinc-400 block">Tênis & Kicks</span>
            <span className="font-display font-black text-lg text-white">{countTenis}</span>
          </div>
        </div>

        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-3.5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-zinc-400 block">Bonés & Caps</span>
            <span className="font-display font-black text-lg text-white">{countBones}</span>
          </div>
        </div>

        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-3.5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-zinc-400 block">Acessórios</span>
            <span className="font-display font-black text-lg text-white">{countAcessorios}</span>
          </div>
        </div>
      </div>

      {/* Abas: Produtos vs Configurações da Loja */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition ${
              activeTab === 'products'
                ? 'bg-amber-500 text-black shadow-md'
                : 'bg-zinc-900 text-zinc-400 hover:text-white'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Peças Cadastradas ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition ${
              activeTab === 'settings'
                ? 'bg-amber-500 text-black shadow-md'
                : 'bg-zinc-900 text-zinc-400 hover:text-white'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>WhatsApp & Loja</span>
          </button>
        </div>

        {/* Ferramentas de Backup */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={handleExportBackup}
            className="p-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition"
            title="Exportar backup completo em JSON"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Fazer Backup</span>
          </button>

          <button
            onClick={() => backupInputRef.current?.click()}
            className="p-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition"
            title="Restaurar backup JSON"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Restaurar</span>
          </button>
        </div>
      </div>

      {/* Conteúdo da Aba PRODUTOS */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          
          {/* Filtro rápido por categoria */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {['all', 'roupas', 'tenis', 'bones', 'acessorios'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition ${
                  filterCategory === cat
                    ? 'bg-zinc-100 text-black'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                }`}
              >
                {cat === 'all'
                  ? 'Todos'
                  : cat === 'bones'
                  ? 'Bonés'
                  : cat === 'tenis'
                  ? 'Tênis'
                  : cat === 'acessorios'
                  ? 'Acessórios'
                  : 'Roupas'}
              </button>
            ))}
          </div>

          {/* Grid / Lista de Produtos Cadastrados */}
          {displayedProducts.length === 0 ? (
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-10 text-center">
              <p className="text-zinc-400 text-sm">Nenhum produto cadastrado nesta categoria.</p>
              <button
                onClick={onOpenNewProduct}
                className="mt-4 bg-amber-500 text-black font-bold text-xs px-4 py-2 rounded-xl"
              >
                Cadastrar agora com a câmera
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedProducts.map((prod) => (
                <div
                  key={prod.id}
                  className="bg-zinc-900/60 border border-zinc-800/90 rounded-2xl p-3.5 flex gap-3.5 items-center justify-between hover:border-zinc-700 transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={prod.images[0]}
                      alt={prod.name}
                      className="w-16 h-20 rounded-xl object-cover bg-zinc-950 shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="text-[10px] font-extrabold uppercase text-amber-400">
                        {prod.category}
                      </span>
                      <h4 className="font-semibold text-sm text-zinc-100 truncate">
                        {prod.name}
                      </h4>
                      <span className="font-display font-black text-sm text-white block mt-0.5">
                        {formatPrice(prod.price)}
                      </span>
                      <span className="text-[10px] text-zinc-400">
                        Tamanhos: {prod.sizes.join(', ')}
                      </span>
                    </div>
                  </div>

                  {/* Ações do Lojista */}
                  <div className="flex flex-col gap-1.5 shrink-0">
                    <button
                      onClick={() => onViewProductDetails(prod)}
                      className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
                      title="Ver como o cliente enxerga"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onEditProduct(prod)}
                      className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-amber-400 transition"
                      title="Editar dados ou foto"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(prod)}
                      className="p-2 rounded-lg bg-zinc-800 hover:bg-red-500/20 text-red-400 transition"
                      title="Excluir produto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* Conteúdo da Aba CONFIGURAÇÕES DA LOJA (WhatsApp e Dados) */}
      {activeTab === 'settings' && (
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-5 sm:p-7 max-w-2xl shadow-xl">
          <div className="mb-5">
            <h3 className="font-display font-black text-xl text-white">
              Configurações da Loja & WhatsApp
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              Todos os pedidos montados pelos clientes na sacola serão encaminhados para este número do WhatsApp.
            </p>
          </div>

          {settingsSuccess && (
            <div className="mb-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-2.5 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Configurações salvas com sucesso!</span>
            </div>
          )}

          <form onSubmit={handleSaveStoreSettings} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block mb-1">
                Nome da Loja
              </label>
              <div className="relative">
                <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  value={storeForm.storeName}
                  onChange={(e) => setStoreForm({ ...storeForm, storeName: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block mb-1">
                Slogan / Subtítulo
              </label>
              <input
                type="text"
                value={storeForm.tagline}
                onChange={(e) => setStoreForm({ ...storeForm, tagline: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block mb-1">
                Número do WhatsApp para Pedidos (com DDD) *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                <input
                  type="text"
                  value={storeForm.whatsappNumber}
                  onChange={(e) => setStoreForm({ ...storeForm, whatsappNumber: e.target.value })}
                  placeholder="5511999998888"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>
              <span className="text-[11px] text-zinc-500 mt-1 block">
                Exemplo: 55 + DDD + Número celular (ex: 5511999998888).
              </span>
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block mb-1">
                Endereço da Loja (para retirada no balcão)
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  value={storeForm.address || ''}
                  onChange={(e) => setStoreForm({ ...storeForm, address: e.target.value })}
                  placeholder="Ex: Rua Central do Bairro, 120"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block mb-1">
                Taxa de Entrega de Motoboy no Bairro (R$)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="number"
                  step="0.50"
                  value={storeForm.deliveryFee || 0}
                  onChange={(e) =>
                    setStoreForm({ ...storeForm, deliveryFee: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block mb-1">
                Chave Pix da Loja (Para cobrança automática de fiado)
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
                <input
                  type="text"
                  value={storeForm.pixKey || ''}
                  onChange={(e) => setStoreForm({ ...storeForm, pixKey: e.target.value })}
                  placeholder="Telefone, CPF, CNPJ ou chave aleatória"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl space-y-2">
              <label className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" /> Senha de Acesso do Lojista (Dono)
              </label>
              <input
                type="text"
                value={storeForm.adminPassword || '1234'}
                onChange={(e) => setStoreForm({ ...storeForm, adminPassword: e.target.value })}
                placeholder="Ex: 1234 ou sua senha secreta"
                className="w-full bg-zinc-950 border border-amber-500/40 rounded-xl px-3.5 py-2.5 text-sm font-bold text-white focus:outline-none focus:border-amber-400"
                required
              />
              <span className="text-[11px] text-zinc-400 block">
                Esta senha bloqueia o PDV, Fiados, Caixa, Estoque e Cadastro de Peças de clientes normais.
              </span>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={isSavingSettings}
                className="bg-amber-500 hover:bg-amber-400 text-black font-extrabold px-6 py-3 rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition"
              >
                <span>{isSavingSettings ? 'Salvando...' : 'Salvar Configurações'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Input invisível para restauração de backup */}
      <input
        ref={backupInputRef}
        type="file"
        accept=".json,application/json"
        onChange={handleImportBackup}
        className="hidden"
      />

    </div>
  );
};
