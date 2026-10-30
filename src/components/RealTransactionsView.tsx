import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  TrendingDown, 
  TrendingUp, 
  Wallet,
  Calendar
} from 'lucide-react';
import { RealTransaction, MONTH_NAMES, MONTH_FULL_NAMES, MonthIndex } from '../types/budget';
import { formatCurrency, formatDateBR, PAYMENT_METHOD_LABELS } from '../utils/formatters';

interface RealTransactionsViewProps {
  transactions: RealTransaction[];
  onOpenNewTransaction: () => void;
  onEditTransaction: (tx: RealTransaction) => void;
  onDeleteTransaction: (id: string) => void;
}

export const RealTransactionsView: React.FC<RealTransactionsViewProps> = ({
  transactions,
  onOpenNewTransaction,
  onEditTransaction,
  onDeleteTransaction,
}) => {
  const [selectedMonth, setSelectedMonth] = useState<number | 'all'>('all');
  const [selectedType, setSelectedType] = useState<'all' | 'expense' | 'income'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (selectedMonth !== 'all' && t.month !== selectedMonth) return false;
      if (selectedType !== 'all' && t.type !== selectedType) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesDesc = t.description.toLowerCase().includes(q);
        const matchesCat = t.categoryName.toLowerCase().includes(q);
        const matchesItem = t.itemName.toLowerCase().includes(q);
        if (!matchesDesc && !matchesCat && !matchesItem) return false;
      }
      return true;
    });
  }, [transactions, selectedMonth, selectedType, searchQuery]);

  // Totals for filtered period
  const totals = useMemo(() => {
    let income = 0;
    let expense = 0;
    filteredTransactions.forEach((t) => {
      if (t.type === 'income') income += t.amount;
      else expense += t.amount;
    });
    return {
      income,
      expense,
      balance: income - expense,
      count: filteredTransactions.length,
    };
  }, [filteredTransactions]);

  return (
    <div className="space-y-6">
      {/* Header & Metric Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-neutral-500">Receitas Reais (Entradas)</span>
            <div className="text-lg font-bold font-mono tabular-nums text-emerald-700 mt-0.5">
              {formatCurrency(totals.income)}
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-neutral-500">Despesas Reais (Saídas)</span>
            <div className="text-lg font-bold font-mono tabular-nums text-rose-700 mt-0.5">
              {formatCurrency(totals.expense)}
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-neutral-500">Saldo Realizado no Período</span>
            <div
              className={`text-lg font-bold font-mono tabular-nums mt-0.5 ${
                totals.balance >= 0 ? 'text-neutral-900' : 'text-rose-600'
              }`}
            >
              {formatCurrency(totals.balance)}
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-neutral-100 text-neutral-700 flex items-center justify-center">
            <Wallet className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Month selector */}
          <div className="flex items-center gap-1.5 bg-neutral-50 px-2.5 py-1 rounded-lg border border-neutral-200">
            <Calendar className="w-3.5 h-3.5 text-neutral-500" />
            <select
              value={selectedMonth}
              onChange={(e) =>
                setSelectedMonth(e.target.value === 'all' ? 'all' : Number(e.target.value))
              }
              className="bg-transparent text-xs font-medium text-neutral-700 focus:outline-none"
            >
              <option value="all">Ano Inteiro (Todos os meses)</option>
              {MONTH_FULL_NAMES.map((m, idx) => (
                <option key={idx} value={idx}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-lg">
            <button
              onClick={() => setSelectedType('all')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                selectedType === 'all'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setSelectedType('expense')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                selectedType === 'expense'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Despesas
            </button>
            <button
              onClick={() => setSelectedType('income')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                selectedType === 'income'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Receitas
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar descrição ou categoria..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <button
            onClick={onOpenNewTransaction}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Gasto/Renda</span>
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-xs overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto mb-3">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-neutral-900">
              Nenhum lançamento encontrado
            </h3>
            <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
              Não foram encontrados lançamentos reais para os filtros selecionados. Clique no botão abaixo para adicionar seu primeiro gasto ou entrada.
            </p>
            <button
              onClick={onOpenNewTransaction}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Lançamento Real</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Data</th>
                  <th className="py-3 px-4">Descrição</th>
                  <th className="py-3 px-4">Categoria</th>
                  <th className="py-3 px-4">Item Planilha</th>
                  <th className="py-3 px-4">Pagamento</th>
                  <th className="py-3 px-4 text-right">Valor</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-neutral-50/70 transition-colors group">
                    <td className="py-3 px-4 font-mono text-neutral-600 whitespace-nowrap">
                      {formatDateBR(tx.date)}
                    </td>
                    <td className="py-3 px-4 font-medium text-neutral-900">
                      {tx.description}
                    </td>
                    <td className="py-3 px-4 text-neutral-600">
                      <span className="font-medium text-neutral-800">{tx.categoryName}</span>
                    </td>
                    <td className="py-3 px-4 text-neutral-500">
                      {tx.itemName}
                    </td>
                    <td className="py-3 px-4 text-neutral-600 whitespace-nowrap">
                      {PAYMENT_METHOD_LABELS[tx.paymentMethod] || tx.paymentMethod}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold whitespace-nowrap">
                      <span
                        className={
                          tx.type === 'income' ? 'text-emerald-700 font-bold' : 'text-rose-700'
                        }
                      >
                        {tx.type === 'income' ? '+ ' : '- '}
                        {formatCurrency(tx.amount)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <span
                        className={`inline-block text-[11px] font-medium ${
                          tx.status === 'paid' ? 'text-emerald-700' : 'text-amber-700'
                        }`}
                      >
                        {tx.status === 'paid' ? 'Efetivado' : 'Pendente'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onEditTransaction(tx)}
                          title="Editar lançamento"
                          className="p-1 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Excluir o lançamento "${tx.description}"?`)) {
                              onDeleteTransaction(tx.id);
                            }
                          }}
                          title="Excluir lançamento"
                          className="p-1 text-neutral-400 hover:text-rose-600 hover:bg-neutral-100 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
