import React, { useState } from 'react';
import { UserPlus, Phone, MapPin, MessageCircle, Search, Edit2, Trash2 } from 'lucide-react';
import { useManagement } from '../../context/ManagementContext';
import { useProducts } from '../../context/ProductContext';
import type { Customer } from '../../types';

export const CRMView: React.FC = () => {
  const { customers, createCustomer, editCustomer, deleteCustomer } = useManagement();
  const { settings } = useProducts();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCust, setEditingCust] = useState<Customer | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [defaultSize, setDefaultSize] = useState('G');
  const [shoeSize, setShoeSize] = useState('41');
  const [birthday, setBirthday] = useState('');
  const [notes, setNotes] = useState('');

  const openNewModal = () => {
    setEditingCust(null);
    setName('');
    setNickname('');
    setPhone('');
    setAddress('');
    setDefaultSize('G');
    setShoeSize('41');
    setBirthday('');
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (cust: Customer) => {
    setEditingCust(cust);
    setName(cust.name);
    setNickname(cust.nickname || '');
    setPhone(cust.phone);
    setAddress(cust.address || '');
    setDefaultSize(cust.defaultSize || 'G');
    setShoeSize(cust.shoeSize || '41');
    setBirthday(cust.birthday || '');
    setNotes(cust.notes || '');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      alert('Nome e telefone são obrigatórios');
      return;
    }

    try {
      if (editingCust) {
        await editCustomer({
          ...editingCust,
          name: name.trim(),
          nickname: nickname.trim() || undefined,
          phone: phone.trim(),
          address: address.trim() || undefined,
          defaultSize,
          shoeSize,
          birthday: birthday || undefined,
          notes: notes.trim() || undefined,
        });
      } else {
        await createCustomer({
          name: name.trim(),
          nickname: nickname.trim() || undefined,
          phone: phone.trim(),
          address: address.trim() || undefined,
          defaultSize,
          shoeSize,
          birthday: birthday || undefined,
          notes: notes.trim() || undefined,
        });
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Erro ao salvar cliente:', err);
      alert('Erro ao salvar cliente');
    }
  };

  // Disparo de Mensagem Personalizada no WhatsApp
  const handleSendPromotionWhatsApp = (cust: Customer) => {
    const rawNumber = cust.phone.replace(/\D/g, '');
    const displayName = cust.nickname || cust.name.split(' ')[0];
    const sizeInfo = cust.defaultSize ? `no tamanho *${cust.defaultSize}*` : '';

    const message =
      `Salve, *${displayName}*! Tudo em paz, família? 👋\n\n` +
      `Passando pra te dar um salve da *${settings.storeName}*! 👑\n\n` +
      `Acabou de colar drop novo de roupas e tênis ${sizeInfo} que você curte na loja! 🔥\n\n` +
      `Dá um check nas peças antes que esgote o seu tamanho. Se quiser que eu separe alguma pra você experimentar é só dar o toque! 🚀`;

    window.open(`https://wa.me/${rawNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const filteredCustomers = customers.filter((c) => {
    const term = searchTerm.toLowerCase();
    return (
      c.name.toLowerCase().includes(term) ||
      (c.nickname && c.nickname.toLowerCase().includes(term)) ||
      c.phone.includes(term) ||
      (c.address && c.address.toLowerCase().includes(term))
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-6">
      
      {/* Topo do CRM */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div>
          <span className="bg-blue-500/10 text-blue-400 text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full border border-blue-500/20">
            CRM & Fidelização de Clientes
          </span>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-white mt-1">
            Clientes do Bairro
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
            Cadastre os clientes da loja, registre o tamanho de roupa/tênis que usam e mande novidades exclusivas.
          </p>
        </div>

        <button
          onClick={openNewModal}
          className="w-full md:w-auto bg-amber-500 hover:bg-amber-400 text-black font-extrabold px-5 py-3 rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition active:scale-95"
        >
          <UserPlus className="w-4 h-4" />
          <span>Cadastrar Novo Cliente</span>
        </button>
      </div>

      {/* Busca */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome, apelido, telefone ou rua..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
          />
        </div>
        <span className="text-xs text-zinc-400 font-bold hidden sm:inline">
          {customers.length} clientes na base
        </span>
      </div>

      {/* Grid de Clientes */}
      {filteredCustomers.length === 0 ? (
        <div className="bg-zinc-900/30 border border-zinc-800 rounded-3xl p-10 text-center text-zinc-400 text-xs">
          Nenhum cliente cadastrado ou encontrado na busca.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.map((cust) => (
            <div
              key={cust.id}
              className="bg-zinc-900/70 border border-zinc-800 rounded-3xl p-5 flex flex-col justify-between hover:border-zinc-700 transition space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-display font-black text-sm border border-amber-500/20">
                      {cust.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-zinc-100">
                        {cust.name}
                      </h3>
                      {cust.nickname && (
                        <span className="text-xs text-amber-400 font-medium">
                          "{cust.nickname}"
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(cust)}
                      className="p-1.5 text-zinc-400 hover:text-white rounded-lg transition"
                      title="Editar cliente"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Excluir o cliente ${cust.name}?`)) {
                          deleteCustomer(cust.id);
                        }
                      }}
                      className="p-1.5 text-zinc-600 hover:text-red-400 rounded-lg transition"
                      title="Excluir cliente"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Preferências de Tamanho */}
                <div className="flex items-center gap-2 my-3">
                  <span className="bg-zinc-850 text-zinc-300 text-[11px] font-bold px-2.5 py-1 rounded-lg border border-zinc-800">
                    👕 Roupa: <strong className="text-amber-400">{cust.defaultSize || 'G'}</strong>
                  </span>
                  <span className="bg-zinc-850 text-zinc-300 text-[11px] font-bold px-2.5 py-1 rounded-lg border border-zinc-800">
                    👟 Tênis: <strong className="text-amber-400">{cust.shoeSize || '41'}</strong>
                  </span>
                </div>

                {/* Dados de Contato e Endereço */}
                <div className="space-y-1.5 text-xs text-zinc-400">
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{cust.phone}</span>
                  </div>
                  {cust.address && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                      <span className="truncate">{cust.address}</span>
                    </div>
                  )}
                  {cust.notes && (
                    <p className="text-[11px] text-zinc-500 italic bg-zinc-950 p-2 rounded-xl mt-2">
                      "{cust.notes}"
                    </p>
                  )}
                </div>

              </div>

              {/* Botão de Disparo no WhatsApp */}
              <div className="pt-3 border-t border-zinc-800">
                <button
                  onClick={() => handleSendPromotionWhatsApp(cust)}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md transition"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Avisar Novidades no Zap</span>
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Modal de Cadastro / Edição */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-5 sm:p-6 w-full max-w-md shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-display font-black text-base text-white">
                {editingCust ? 'Editar Cliente' : 'Novo Cliente do Bairro'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-white text-xs font-bold"
              >
                Fechar
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-zinc-300 uppercase block mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Carlos Eduardo"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-zinc-300 uppercase block mb-1">
                    Apelido do Bairro
                  </label>
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="Ex: Cadu, Menó..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-300 uppercase block mb-1">
                    WhatsApp (com DDD) *
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="11999998888"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
              </div>

              {/* Tamanhos que o cliente veste */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-zinc-300 uppercase block mb-1">
                    Tamanho de Roupa
                  </label>
                  <select
                    value={defaultSize}
                    onChange={(e) => setDefaultSize(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
                  >
                    {['P', 'M', 'G', 'GG', 'XG'].map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-300 uppercase block mb-1">
                    Número do Tênis
                  </label>
                  <select
                    value={shoeSize}
                    onChange={(e) => setShoeSize(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
                  >
                    {['37', '38', '39', '40', '41', '42', '43', '44'].map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-300 uppercase block mb-1">
                  Endereço / Referência no Bairro
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Rua e número ou ponto de referência"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-300 uppercase block mb-1">
                  Observações / Preferências
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Curte boné snapback preto e correntes"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-400 text-black font-black py-3 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition mt-4"
              >
                <span>{editingCust ? 'Salvar Alterações' : 'Cadastrar Cliente'}</span>
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
