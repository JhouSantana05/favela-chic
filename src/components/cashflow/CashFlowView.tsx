import React, { useState } from 'react';
import { DollarSign, ArrowUpRight, ArrowDownRight, Plus, Trash2, Wallet } from 'lucide-react';
import { useManagement } from '../../context/ManagementContext';
import type { PaymentMethod } from '../../types';

export const CashFlowView: React.FC = () => {
  const {
    transactions,
    cashBalance,
    todayRevenue,
    monthRevenue,
    totalExpenses,
    recordTransaction,
    deleteTransaction,
  } = useManagement();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [type, setType] = useState<'in' | 'out'>('out');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Compra Mercadoria');
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [filterType, setFilterType] = useState<'all' | 'in' | 'out'>('all');

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val);
  };

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount.replace(',', '.'));
    if (isNaN(val) || val <= 0) {
      alert('Informe um valor válido');
      return;
    }

    try {
      await recordTransaction({
        type,
        amount: val,
        category,
        description: description.trim() || category,
        paymentMethod,
      });
      setIsModalOpen(false);
      setAmount('');
      setDescription('');
    } catch (err) {
      console.error('Erro ao adicionar transação:', err);
      alert('Erro ao registrar transação');
    }
  };

  const filteredTransactions = transactions.filter((t) => {
    if (filterType === 'all') return true;
    return t.type === filterType;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-6">
      
      {/* Topo do Fluxo de Caixa */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div>
          <span className="bg-emerald-500/10 text-emerald-400 text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full border border-emerald-500/20">
            Controle Financeiro da Loja
          </span>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-white mt-1">
            Fluxo de Caixa
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
            Acompanhe entradas de vendas à vista, pagamentos de fiado e despesas operacionais.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full md:w-auto bg-amber-500 hover:bg-amber-400 text-black font-extrabold px-5 py-3 rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Lançamento (Entrada/Saída)</span>
        </button>
      </div>

      {/* Cartões de Indicadores Financeiros */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        
        <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-zinc-400 font-bold">Saldo em Caixa</span>
            <Wallet className="w-4 h-4 text-amber-400" />
          </div>
          <span className={`font-display font-black text-xl sm:text-2xl ${cashBalance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {formatPrice(cashBalance)}
          </span>
          <span className="text-[10px] text-zinc-500 block mt-1">Saldo líquido acumulado</span>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-zinc-400 font-bold">Entradas Hoje</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="font-display font-black text-xl sm:text-2xl text-white">
            {formatPrice(todayRevenue)}
          </span>
          <span className="text-[10px] text-zinc-500 block mt-1">Vendas e acertos de hoje</span>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-zinc-400 font-bold">Faturamento Mês</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="font-display font-black text-xl sm:text-2xl text-emerald-400">
            {formatPrice(monthRevenue)}
          </span>
          <span className="text-[10px] text-zinc-500 block mt-1">Total faturado no mês</span>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-zinc-400 font-bold">Total Despesas</span>
            <ArrowDownRight className="w-4 h-4 text-red-400" />
          </div>
          <span className="font-display font-black text-xl sm:text-2xl text-red-400">
            {formatPrice(totalExpenses)}
          </span>
          <span className="text-[10px] text-zinc-500 block mt-1">Custos e compras</span>
        </div>

      </div>

      {/* Extrato de Lançamentos */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-4 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
          <h3 className="font-display font-black text-lg text-white">
            Extrato de Movimentações
          </h3>

          <div className="flex items-center gap-1.5">
            {[
              { id: 'all', label: 'Todos' },
              { id: 'in', label: 'Entradas (+)' },
              { id: 'out', label: 'Saídas (-)' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterType(f.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  filterType === f.id
                    ? 'bg-zinc-100 text-black'
                    : 'bg-zinc-950 text-zinc-400 border border-zinc-800'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="py-12 text-center text-zinc-500 text-xs">
            Nenhuma transação registrada no período.
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredTransactions.map((tx) => {
              const isEntry = tx.type === 'in';
              const dateObj = new Date(tx.date);
              const formattedDate = dateObj.toLocaleDateString('pt-BR') + ' às ' + dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

              return (
                <div
                  key={tx.id}
                  className="bg-zinc-950/70 border border-zinc-800/80 rounded-2xl p-3 sm:p-4 flex items-center justify-between gap-3 hover:border-zinc-700 transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isEntry
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}
                    >
                      {isEntry ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500">
                          {tx.category}
                        </span>
                        <span className="text-[10px] text-zinc-500">• {formattedDate}</span>
                      </div>
                      <h4 className="font-semibold text-xs sm:text-sm text-zinc-100 truncate">
                        {tx.description}
                      </h4>
                      <span className="text-[10px] text-zinc-400">
                        Via: {tx.paymentMethod === 'pix' ? 'Pix' : tx.paymentMethod === 'cartao_credito' ? 'Crédito' : tx.paymentMethod === 'cartao_debito' ? 'Débito' : 'Dinheiro'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`font-display font-black text-sm sm:text-base ${
                        isEntry ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      {isEntry ? '+' : '-'} {formatPrice(tx.amount)}
                    </span>

                    <button
                      onClick={() => {
                        if (confirm('Deseja excluir este lançamento?')) {
                          deleteTransaction(tx.id);
                        }
                      }}
                      className="p-1.5 text-zinc-600 hover:text-red-400 rounded-lg transition"
                      title="Excluir lançamento"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Modal de Novo Lançamento */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-5 sm:p-6 w-full max-w-md shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-display font-black text-base text-white">Novo Lançamento no Caixa</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-white text-xs font-bold"
              >
                Fechar
              </button>
            </div>

            <form onSubmit={handleAddTransaction} className="space-y-3.5">
              
              {/* Tipo: Entrada ou Saída */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setType('in');
                    setCategory('Venda Avulsa');
                  }}
                  className={`py-2.5 rounded-xl border text-xs font-black flex items-center justify-center gap-1.5 transition ${
                    type === 'in'
                      ? 'bg-emerald-500 text-black border-emerald-500'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                  }`}
                >
                  <ArrowUpRight className="w-4 h-4" /> Entrada (+)
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setType('out');
                    setCategory('Compra Mercadoria');
                  }}
                  className={`py-2.5 rounded-xl border text-xs font-black flex items-center justify-center gap-1.5 transition ${
                    type === 'out'
                      ? 'bg-red-500 text-white border-red-500'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                  }`}
                >
                  <ArrowDownRight className="w-4 h-4" /> Saída (-)
                </button>
              </div>

              {/* Valor */}
              <div>
                <label className="text-xs font-bold text-zinc-300 uppercase block mb-1">
                  Valor (R$) *
                </label>
                <input
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0,00"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-base font-black text-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              {/* Categoria */}
              <div>
                <label className="text-xs font-bold text-zinc-300 uppercase block mb-1">
                  Categoria
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
                >
                  {type === 'in' ? (
                    <>
                      <option value="Venda Avulsa">Venda Avulsa</option>
                      <option value="Aporte de Caixa">Aporte de Caixa</option>
                      <option value="Outras Entradas">Outras Entradas</option>
                    </>
                  ) : (
                    <>
                      <option value="Compra Mercadoria">Compra Mercadoria (Fornecedor)</option>
                      <option value="Aluguel da Loja">Aluguel da Loja</option>
                      <option value="Conta de Luz/Água">Conta de Luz / Água</option>
                      <option value="Internet/Celular">Internet / Celular</option>
                      <option value="Embalagens/Sacolas">Embalagens / Sacolas</option>
                      <option value="Motoboy/Frete">Motoboy / Frete</option>
                      <option value="Outras Despesas">Outras Despesas</option>
                    </>
                  )}
                </select>
              </div>

              {/* Descrição */}
              <div>
                <label className="text-xs font-bold text-zinc-300 uppercase block mb-1">
                  Descrição (Opcional)
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Compra de 20 camisetas no Brás"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Forma de Pagamento */}
              <div>
                <label className="text-xs font-bold text-zinc-300 uppercase block mb-1">
                  Meio de Pagamento
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
                      className={`p-2 rounded-xl border text-xs font-bold transition text-left ${
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

              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-400 text-black font-black py-3 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition mt-4"
              >
                <span>Registrar Lançamento</span>
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
