import React, { useState } from 'react';
import { BookOpen, AlertTriangle, CheckCircle2, MessageCircle, DollarSign, Plus, Search, Trash2, Calendar, Phone } from 'lucide-react';
import { useManagement } from '../../context/ManagementContext';
import { useProducts } from '../../context/ProductContext';
import type { DebtRecord, PaymentMethod } from '../../types';
import confetti from 'canvas-confetti';

export const DebtsView: React.FC = () => {
  const { debts, totalReceivable, overdueDebtsCount, recordDebtPayment, deleteDebt, customers, createDebt } = useManagement();
  const { settings } = useProducts();

  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'overdue' | 'paid'>('pending');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal de Abatimento
  const [selectedDebtForPayment, setSelectedDebtForPayment] = useState<DebtRecord | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [paymentNotes, setPaymentNotes] = useState('');

  // Modal de Novo Fiado Avulso
  const [isNewDebtOpen, setIsNewDebtOpen] = useState(false);
  const [newCustId, setNewCustId] = useState('');
  const [newItemsText, setNewItemsText] = useState('');
  const [newTotalAmount, setNewTotalAmount] = useState('');
  const [newDueDate, setNewDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 15);
    return d.toISOString().split('T')[0];
  });

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val);
  };

  const todayStr = new Date().toISOString().split('T')[0];

  // Lógica de Cobrança Educada no WhatsApp
  const handleWhatsAppReminder = (debt: DebtRecord) => {
    const rawNumber = debt.customerPhone.replace(/\D/g, '');
    const isOverdue = debt.dueDate < todayStr;
    const formattedDue = debt.dueDate.split('-').reverse().join('/');

    const pixInfo = settings.pixKey ? `\n\nChave Pix para facilitar: *${settings.pixKey}*` : '';

    const message = isOverdue
      ? `Salve, *${debt.customerName}*! Tudo em paz, meu irmão? 👋\n\n` +
        `Passando com todo respeito pra dar um toque sobre aquele acerto da *${settings.storeName}* combinado para o dia *${formattedDue}*.\n\n` +
        `📦 *Peças*: ${debt.itemsSummary}\n` +
        `💰 *Saldo Pendente*: *${formatPrice(debt.remainingAmount)}*${pixInfo}\n\n` +
        `Consegue dar uma passada na loja ou mandar o comprovante aqui no zap hoje? Tmj!`
      : `Salve, *${debt.customerName}*! Tudo bem? 👋\n\n` +
        `Passando pra te lembrar do nosso acerto combinado para o dia *${formattedDue}* na *${settings.storeName}*.\n\n` +
        `📦 *Peças*: ${debt.itemsSummary}\n` +
        `💰 *Valor*: *${formatPrice(debt.remainingAmount)}*${pixInfo}\n\n` +
        `Qualquer dúvida só dar um alô por aqui. Valeu pelo apoio e preferência de sempre! 🚀`;

    window.open(`https://wa.me/${rawNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleConfirmPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDebtForPayment) return;

    const parsed = parseFloat(paymentAmount.replace(',', '.'));
    if (isNaN(parsed) || parsed <= 0) {
      alert('Informe um valor válido');
      return;
    }

    try {
      await recordDebtPayment(selectedDebtForPayment.id, parsed, paymentMethod, paymentNotes);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#10b981', '#f59e0b'],
      });
      setSelectedDebtForPayment(null);
      setPaymentAmount('');
      setPaymentNotes('');
    } catch (err) {
      console.error('Erro ao abater fiado:', err);
      alert('Erro ao processar pagamento');
    }
  };

  const handleCreateManualDebt = async (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find((c) => c.id === newCustId);
    if (!cust) {
      alert('Selecione um cliente');
      return;
    }
    const val = parseFloat(newTotalAmount.replace(',', '.'));
    if (isNaN(val) || val <= 0) {
      alert('Valor inválido');
      return;
    }

    try {
      await createDebt({
        customerId: cust.id,
        customerName: cust.nickname ? `${cust.name} (${cust.nickname})` : cust.name,
        customerPhone: cust.phone,
        itemsSummary: newItemsText.trim() || 'Peças diversas',
        totalAmount: val,
        dueDate: newDueDate,
      });
      setIsNewDebtOpen(false);
      setNewCustId('');
      setNewItemsText('');
      setNewTotalAmount('');
    } catch (err) {
      console.error('Erro ao criar fiado manual:', err);
      alert('Erro ao salvar fiado');
    }
  };

  const filteredDebts = debts.filter((d) => {
    const isOverdue = d.status !== 'paid' && d.dueDate < todayStr;
    const matchStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'paid'
        ? d.status === 'paid'
        : statusFilter === 'overdue'
        ? isOverdue
        : d.status !== 'paid';

    const matchSearch =
      !searchTerm ||
      d.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.customerPhone.includes(searchTerm) ||
      d.itemsSummary.toLowerCase().includes(searchTerm.toLowerCase());

    return matchStatus && matchSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-6">
      
      {/* Topo do Caderninho */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div>
          <span className="bg-amber-500/10 text-amber-400 text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full border border-amber-500/20">
            Contas a Receber da Quebrada
          </span>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-white mt-1">
            Caderninho Digital de Fiado
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
            Controle de quem comprou a prazo, datas combinadas de acerto e cobrança direta no WhatsApp.
          </p>
        </div>

        <button
          onClick={() => setIsNewDebtOpen(true)}
          className="w-full md:w-auto bg-amber-500 hover:bg-amber-400 text-black font-extrabold px-5 py-3 rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Anotar Novo Fiado</span>
        </button>
      </div>

      {/* Cartões de Indicadores */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-zinc-400 block font-bold">Total a Receber</span>
            <span className="font-display font-black text-2xl text-amber-400">
              {formatPrice(totalReceivable)}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-zinc-400 block font-bold">Acertos Vencidos</span>
            <span className="font-display font-black text-2xl text-red-400">
              {overdueDebtsCount} {overdueDebtsCount === 1 ? 'cliente' : 'clientes'}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-zinc-400 block font-bold">Total Registrado</span>
            <span className="font-display font-black text-2xl text-white">
              {debts.length} {debts.length === 1 ? 'notinha' : 'notinhas'}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-zinc-800 text-zinc-400 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Barra de Filtros e Busca */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none pb-1">
          {[
            { id: 'pending', label: 'Em Aberto' },
            { id: 'overdue', label: 'Vencidos' },
            { id: 'paid', label: 'Quitados' },
            { id: 'all', label: 'Todos' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                statusFilter === f.id
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por cliente ou telefone..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Lista de Fiados (Notinhas) */}
      {filteredDebts.length === 0 ? (
        <div className="bg-zinc-900/30 border border-zinc-800 rounded-3xl p-10 text-center text-zinc-400 text-xs">
          Nenhum registro de fiado encontrado com os filtros atuais.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDebts.map((debt) => {
            const isOverdue = debt.status !== 'paid' && debt.dueDate < todayStr;
            const paidAmount = debt.totalAmount - debt.remainingAmount;
            const progressPercent = Math.min(100, Math.round((paidAmount / debt.totalAmount) * 100));

            return (
              <div
                key={debt.id}
                className={`bg-zinc-900/70 border rounded-3xl p-4 sm:p-5 flex flex-col justify-between transition ${
                  debt.status === 'paid'
                    ? 'border-emerald-500/30 bg-emerald-950/10'
                    : isOverdue
                    ? 'border-red-500/40 bg-red-950/10'
                    : 'border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                          debt.status === 'paid'
                            ? 'bg-emerald-500 text-black'
                            : isOverdue
                            ? 'bg-red-500 text-white'
                            : debt.status === 'partial'
                            ? 'bg-blue-500 text-white'
                            : 'bg-amber-500 text-black'
                        }`}
                      >
                        {debt.status === 'paid'
                          ? 'QUITADO'
                          : isOverdue
                          ? 'VENCIDO'
                          : debt.status === 'partial'
                          ? 'PARCIALMENTE PAGO'
                          : 'PENDENTE'}
                      </span>
                      <h3 className="font-display font-black text-lg text-white mt-1">
                        {debt.customerName}
                      </h3>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-zinc-400 block">Resta Pagar</span>
                      <span
                        className={`font-display font-black text-xl ${
                          debt.status === 'paid'
                            ? 'text-emerald-400'
                            : isOverdue
                            ? 'text-red-400'
                            : 'text-amber-400'
                        }`}
                      >
                        {formatPrice(debt.remainingAmount)}
                      </span>
                    </div>
                  </div>

                  {/* Detalhes dos Itens */}
                  <p className="text-xs text-zinc-300 bg-zinc-950/80 p-2.5 rounded-xl border border-zinc-800/80 my-2.5">
                    🛍️ <span className="font-medium">{debt.itemsSummary}</span>
                  </p>

                  {/* Barra de Progresso do Pagamento */}
                  <div className="space-y-1 my-3">
                    <div className="flex justify-between text-[11px] text-zinc-400">
                      <span>Pago: {formatPrice(paidAmount)} ({progressPercent}%)</span>
                      <span>Total: {formatPrice(debt.totalAmount)}</span>
                    </div>
                    <div className="w-full h-2 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
                      <div
                        className={`h-full transition-all duration-500 ${
                          debt.status === 'paid' ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Informações de Prazo */}
                  <div className="flex items-center gap-3 text-xs text-zinc-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                      Acerto: <strong className={isOverdue ? 'text-red-400' : 'text-zinc-200'}>{debt.dueDate.split('-').reverse().join('/')}</strong>
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-zinc-500" />
                      {debt.customerPhone}
                    </span>
                  </div>

                </div>

                {/* Ações: Cobrança Zap + Abater Valor */}
                <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                  
                  {debt.status !== 'paid' ? (
                    <div className="flex items-center gap-2 w-full">
                      <button
                        onClick={() => handleWhatsAppReminder(debt)}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md transition"
                        title="Enviar cobrança amiga no WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>Cobrar no Zap</span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedDebtForPayment(debt);
                          setPaymentAmount(debt.remainingAmount.toString());
                        }}
                        className="flex-1 bg-amber-500 hover:bg-amber-400 active:scale-95 text-black font-extrabold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md transition"
                      >
                        <DollarSign className="w-4 h-4" />
                        <span>Dar Baixa</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between w-full text-xs text-emerald-400 font-bold">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Conta totalmente quitada!
                      </span>
                      <button
                        onClick={() => {
                          if (confirm('Deseja excluir este registro de fiado quitado?')) {
                            deleteDebt(debt.id);
                          }
                        }}
                        className="text-zinc-600 hover:text-red-400 p-1"
                        title="Excluir"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Abatimento / Pagamento */}
      {selectedDebtForPayment && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-5 sm:p-6 w-full max-w-md shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="font-display font-black text-base text-white">Registrar Abatimento de Fiado</h3>
                <span className="text-xs text-zinc-400">Cliente: {selectedDebtForPayment.customerName}</span>
              </div>
              <button
                onClick={() => setSelectedDebtForPayment(null)}
                className="text-zinc-400 hover:text-white text-xs font-bold"
              >
                Cancelar
              </button>
            </div>

            <form onSubmit={handleConfirmPayment} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-zinc-300 uppercase block mb-1">
                  Quanto o cliente está pagando hoje? (R$) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-500">
                    R$
                  </span>
                  <input
                    type="text"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-3.5 py-2.5 text-base font-black text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
                <span className="text-[11px] text-amber-400 mt-1 block">
                  Total da dívida atual: {formatPrice(selectedDebtForPayment.remainingAmount)}
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-300 uppercase block mb-1">
                  Forma do Pagamento:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'pix', label: '⚡ Pix' },
                    { id: 'dinheiro', label: '💵 Dinheiro' },
                    { id: 'cartao_debito', label: '💳 Débito' },
                    { id: 'cartao_credito', label: '💳 Crédito' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id as any)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition text-left ${
                        paymentMethod === m.id
                          ? 'bg-amber-500 text-black border-amber-500'
                          : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-300 uppercase block mb-1">
                  Observações (Opcional)
                </label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="Ex: Pagou metade pelo Pix e prometeu o resto dia 20"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-95 transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirmar Pagamento e Lançar no Caixa</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Anotar Novo Fiado Manual */}
      {isNewDebtOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-5 sm:p-6 w-full max-w-md shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-display font-black text-base text-white">Anotar Novo Fiado no Caderninho</h3>
              <button
                onClick={() => setIsNewDebtOpen(false)}
                className="text-zinc-400 hover:text-white text-xs font-bold"
              >
                Fechar
              </button>
            </div>

            <form onSubmit={handleCreateManualDebt} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-zinc-300 uppercase block mb-1">
                  Cliente da Loja *
                </label>
                <select
                  value={newCustId}
                  onChange={(e) => setNewCustId(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
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
                  Peças / Descrição das Peças *
                </label>
                <input
                  type="text"
                  value={newItemsText}
                  onChange={(e) => setNewItemsText(e.target.value)}
                  placeholder="Ex: 1x Boné Snapback + 1x Camiseta G"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-300 uppercase block mb-1">
                  Valor Total do Fiado (R$) *
                </label>
                <input
                  type="text"
                  value={newTotalAmount}
                  onChange={(e) => setNewTotalAmount(e.target.value)}
                  placeholder="179,90"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-bold text-zinc-100 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-300 uppercase block mb-1">
                  Data Combinada para Acerto:
                </label>
                <input
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-400 text-black font-black py-3 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Salvar Fiado</span>
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
