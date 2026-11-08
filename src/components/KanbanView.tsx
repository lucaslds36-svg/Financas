import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight, 
  Filter, 
  Trash2, 
  Edit3, 
  Calendar,
  Wallet,
  ShoppingCart,
  Home,
  Car,
  CreditCard,
  Utensils,
  HeartPulse,
  Sparkles,
  Users
} from 'lucide-react';
import { RealTransaction, BudgetCategory, MonthIndex, MONTH_NAMES, MONTH_FULL_NAMES } from '../types/budget';
import { formatCurrency, formatDateBR, PAYMENT_METHOD_LABELS } from '../utils/formatters';

interface KanbanViewProps {
  transactions: RealTransaction[];
  categories: BudgetCategory[];
  onOpenNewTransaction: (type?: 'income' | 'expense', categoryName?: string) => void;
  onEditTransaction: (tx: RealTransaction) => void;
  onDeleteTransaction: (id: string) => void;
  onUpdateTransaction: (tx: RealTransaction) => void;
  selectedYear: number;
}

export const KanbanView: React.FC<KanbanViewProps> = ({
  transactions,
  categories,
  onOpenNewTransaction,
  onEditTransaction,
  onDeleteTransaction,
  onUpdateTransaction,
  selectedYear,
}) => {
  const currentMonth = new Date().getMonth() as MonthIndex;
  const [selectedMonth, setSelectedMonth] = useState<number | 'all'>(currentMonth);
  const [groupMode, setGroupMode] = useState<'status' | 'category'>('status');
  const [searchTerm, setSearchTerm] = useState('');
  const [personFilter, setPersonFilter] = useState<'all' | 'lucas' | 'esposa'>('all');

  // Filter transactions by month, search and person
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Month
      if (selectedMonth !== 'all' && tx.month !== selectedMonth) {
        return false;
      }
      // Search
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matches = 
          tx.description.toLowerCase().includes(query) ||
          tx.itemName.toLowerCase().includes(query) ||
          tx.categoryName.toLowerCase().includes(query) ||
          (tx.createdByName && tx.createdByName.toLowerCase().includes(query));
        if (!matches) return false;
      }
      // Person
      if (personFilter !== 'all') {
        const name = (tx.createdByName || '').toLowerCase();
        if (personFilter === 'lucas' && !name.includes('lucas')) return false;
        if (personFilter === 'esposa' && !name.includes('esposa')) return false;
      }
      return true;
    });
  }, [transactions, selectedMonth, searchTerm, personFilter]);

  // Quick toggle status of transaction
  const handleToggleStatus = (tx: RealTransaction) => {
    const nextStatus = tx.status === 'paid' ? 'pending' : 'paid';
    onUpdateTransaction({
      ...tx,
      status: nextStatus,
    });
  };

  // Grouping Definition: By Status & Fortnight (Quinzena)
  const statusColumns = useMemo(() => {
    const incomes = filteredTransactions.filter((t) => t.type === 'income');
    const pendingQuinzena1 = filteredTransactions.filter((t) => {
      if (t.type !== 'expense' || t.status !== 'pending') return false;
      const day = parseInt(t.date.slice(8, 10), 10);
      return isNaN(day) || day <= 15;
    });
    const pendingQuinzena2 = filteredTransactions.filter((t) => {
      if (t.type !== 'expense' || t.status !== 'pending') return false;
      const day = parseInt(t.date.slice(8, 10), 10);
      return !isNaN(day) && day > 15;
    });
    const paidExpenses = filteredTransactions.filter((t) => t.type === 'expense' && t.status === 'paid');

    return [
      {
        id: 'incomes',
        title: 'Entradas (Salário & Extras)',
        badge: 'Receitas',
        icon: Wallet,
        colorClass: 'text-emerald-700 bg-emerald-50 border-emerald-200',
        items: incomes,
        total: incomes.reduce((s, t) => s + t.amount, 0),
        addType: 'income' as const,
      },
      {
        id: 'pending_q1',
        title: 'A Pagar · 1ª Quinzena (Dia 1 a 15)',
        badge: 'Contas do Início',
        icon: Clock,
        colorClass: 'text-amber-800 bg-amber-50 border-amber-200',
        items: pendingQuinzena1,
        total: pendingQuinzena1.reduce((s, t) => s + t.amount, 0),
        addType: 'expense' as const,
      },
      {
        id: 'pending_q2',
        title: 'A Pagar · 2ª Quinzena (Dia 16 a 31)',
        badge: 'Contas do Vale/Fim',
        icon: Clock,
        colorClass: 'text-indigo-800 bg-indigo-50 border-indigo-200',
        items: pendingQuinzena2,
        total: pendingQuinzena2.reduce((s, t) => s + t.amount, 0),
        addType: 'expense' as const,
      },
      {
        id: 'paid',
        title: 'Gastos Pagos / Concretizados',
        badge: 'Concluído',
        icon: CheckCircle2,
        colorClass: 'text-neutral-800 bg-neutral-100 border-neutral-300',
        items: paidExpenses,
        total: paidExpenses.reduce((s, t) => s + t.amount, 0),
        addType: 'expense' as const,
      },
    ];
  }, [filteredTransactions]);

  // Grouping Definition: By Category
  const categoryColumns = useMemo(() => {
    const list = [
      {
        id: 'renda',
        title: 'Entradas / Renda',
        matchType: 'income',
        icon: Wallet,
        colorClass: 'text-emerald-700 bg-emerald-50 border-emerald-200',
        addType: 'income' as const,
        catName: 'Renda',
      },
      {
        id: 'mercado',
        title: 'Mercado & Feira',
        matchCat: ['cotidiano', 'mercado', 'alimentação'],
        icon: ShoppingCart,
        colorClass: 'text-neutral-800 bg-neutral-50 border-neutral-200',
        addType: 'expense' as const,
        catName: 'Cotidiano',
      },
      {
        id: 'moradia',
        title: 'Moradia & Contas',
        matchCat: ['casa', 'moradia', 'habitação', 'serviços públicos'],
        icon: Home,
        colorClass: 'text-neutral-800 bg-neutral-50 border-neutral-200',
        addType: 'expense' as const,
        catName: 'Casa',
      },
      {
        id: 'transporte',
        title: 'Transporte & Carro',
        matchCat: ['transporte', 'combustível', 'veículo'],
        icon: Car,
        colorClass: 'text-neutral-800 bg-neutral-50 border-neutral-200',
        addType: 'expense' as const,
        catName: 'Transporte',
      },
      {
        id: 'cartao',
        title: 'Cartão & Dívidas',
        matchCat: ['obrig', 'cartão', 'dívida'],
        icon: CreditCard,
        colorClass: 'text-rose-800 bg-rose-50 border-rose-200',
        addType: 'expense' as const,
        catName: 'Obrigações Financeiras',
      },
      {
        id: 'lazer',
        title: 'Lazer & Restaurante',
        matchCat: ['lazer', 'entretenimento', 'jantar'],
        icon: Utensils,
        colorClass: 'text-neutral-800 bg-neutral-50 border-neutral-200',
        addType: 'expense' as const,
        catName: 'Entretenimento',
      },
      {
        id: 'saude',
        title: 'Saúde & Cuidados',
        matchCat: ['saúde', 'farmácia', 'médico'],
        icon: HeartPulse,
        colorClass: 'text-neutral-800 bg-neutral-50 border-neutral-200',
        addType: 'expense' as const,
        catName: 'Saúde',
      },
    ];

    return list.map((col) => {
      let items: RealTransaction[] = [];
      if (col.matchType === 'income') {
        items = filteredTransactions.filter((t) => t.type === 'income');
      } else {
        items = filteredTransactions.filter((t) => {
          if (t.type !== 'expense') return false;
          const catNameLower = t.categoryName.toLowerCase();
          const itemNameLower = t.itemName.toLowerCase();
          return col.matchCat?.some(
            (term) => catNameLower.includes(term) || itemNameLower.includes(term)
          );
        });
      }

      return {
        ...col,
        items,
        total: items.reduce((s, t) => s + t.amount, 0),
      };
    });
  }, [filteredTransactions]);

  const activeColumns = groupMode === 'status' ? statusColumns : categoryColumns;

  // Summary Metrics
  const totalIncome = filteredTransactions
    .filter((t) => t.type === 'income')
    .reduce((s, t) => s + t.amount, 0);
  const totalExpense = filteredTransactions
    .filter((t) => t.type === 'expense')
    .reduce((s, t) => s + t.amount, 0);
  const surplus = totalIncome - totalExpense;

  return (
    <div className="space-y-6">
      
      {/* Streamlined Top Controls */}
      <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Month selector & Grouping */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="px-3 py-1.5 text-xs font-bold border border-neutral-300 rounded-lg bg-neutral-50 text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
            >
              <option value="all">Ano Todo ({selectedYear})</option>
              {MONTH_FULL_NAMES.map((name, idx) => (
                <option key={name} value={idx}>
                  {name}
                </option>
              ))}
            </select>

            <div className="flex p-0.5 bg-neutral-100 rounded-lg">
              <button
                type="button"
                onClick={() => setGroupMode('status')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                  groupMode === 'status'
                    ? 'bg-white text-neutral-900 shadow-2xs'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                Por Quinzena
              </button>
              <button
                type="button"
                onClick={() => setGroupMode('category')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                  groupMode === 'category'
                    ? 'bg-white text-neutral-900 shadow-2xs'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                Por Categoria
              </button>
            </div>
          </div>

          {/* Search & Person Filter */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-neutral-400" />
              <input
                type="text"
                placeholder="Filtrar lançamentos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </div>

            <div className="flex p-0.5 bg-neutral-100 rounded-lg shrink-0">
              <button
                type="button"
                onClick={() => setPersonFilter('all')}
                className={`px-2 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                  personFilter === 'all' ? 'bg-white text-neutral-900 shadow-2xs' : 'text-neutral-500'
                }`}
              >
                Ambos
              </button>
              <button
                type="button"
                onClick={() => setPersonFilter('lucas')}
                className={`px-2 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                  personFilter === 'lucas' ? 'bg-white text-neutral-900 shadow-2xs' : 'text-neutral-500'
                }`}
              >
                Lucas
              </button>
              <button
                type="button"
                onClick={() => setPersonFilter('esposa')}
                className={`px-2 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                  personFilter === 'esposa' ? 'bg-white text-pink-700 shadow-2xs' : 'text-neutral-500'
                }`}
              >
                Esposa
              </button>
            </div>
          </div>

        </div>
      </div>


      {/* Kanban Board Columns Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start overflow-x-auto pb-4">
        {activeColumns.map((col) => {
          const Icon = col.icon;
          return (
            <div
              key={col.id}
              className="bg-neutral-100/90 rounded-2xl p-3.5 border border-neutral-200/80 flex flex-col min-w-[280px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-neutral-200">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-white border border-neutral-200 flex items-center justify-center text-neutral-700 shadow-2xs">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-neutral-900 leading-tight">
                      {col.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-neutral-500">
                      <span>{col.items.length} itens</span>
                      <span>·</span>
                      <span className="font-bold text-neutral-900">
                        {formatCurrency(col.total)}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onOpenNewTransaction(col.addType, (col as any).catName)}
                  className="w-7 h-7 rounded-lg bg-white hover:bg-neutral-900 hover:text-white border border-neutral-200 flex items-center justify-center text-neutral-600 transition-colors shadow-2xs"
                  title={`Adicionar lançamento em ${col.title}`}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Cards List */}
              <div className="space-y-2.5 min-h-[140px]">
                {col.items.length === 0 ? (
                  <div className="h-28 flex flex-col items-center justify-center text-center p-3 rounded-xl border border-dashed border-neutral-300 bg-white/50 text-neutral-400 text-xs">
                    <span>Nenhum lançamento</span>
                    <button
                      type="button"
                      onClick={() => onOpenNewTransaction(col.addType, (col as any).catName)}
                      className="mt-1 text-[11px] font-bold text-emerald-700 hover:underline"
                    >
                      + Adicionar
                    </button>
                  </div>
                ) : (
                  col.items.map((tx) => {
                    const isIncome = tx.type === 'income';
                    const isPaid = tx.status === 'paid';
                    const isLucas = (tx.createdByName || '').toLowerCase().includes('lucas');
                    const isEsposa = (tx.createdByName || '').toLowerCase().includes('esposa');

                    return (
                      <div
                        key={tx.id}
                        className="bg-white rounded-xl p-3.5 border border-neutral-200/90 shadow-2xs hover:shadow-xs transition-all space-y-2 group"
                      >
                        {/* Card Top: Amount & Status Toggle */}
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className={`text-base font-bold font-mono tabular-nums leading-none ${
                              isIncome ? 'text-emerald-700' : 'text-neutral-900'
                            }`}>
                              {isIncome ? '+' : '-'} {formatCurrency(tx.amount)}
                            </div>
                            <span className="text-[11px] font-medium text-neutral-500 mt-1 block">
                              {tx.itemName}
                            </span>
                          </div>

                          {/* 1-Click Status Switcher Button */}
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(tx)}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition-colors flex items-center gap-1 ${
                              isPaid
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                                : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                            }`}
                            title="Clique para alternar entre Pago e Pendente"
                          >
                            {isPaid ? (
                              <>
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>{isIncome ? 'Recebido' : 'Pago'}</span>
                              </>
                            ) : (
                              <>
                                <Clock className="w-3 h-3 text-amber-600" />
                                <span>{isIncome ? 'A receber' : 'Pendente'}</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Description */}
                        <p className="text-xs font-semibold text-neutral-800 leading-snug">
                          {tx.description}
                        </p>

                        {/* Card Footer: Metadata (No pills, clean typography) & Actions */}
                        <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-500">
                          <div className="flex items-center gap-1.5">
                            <span>{formatDateBR(tx.date).slice(0, 5)}</span>
                            <span>·</span>
                            <span className={`font-semibold ${isEsposa ? 'text-pink-700' : 'text-neutral-800'}`}>
                              {tx.createdByName || 'Lucas'}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => onEditTransaction(tx)}
                              className="p-1 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors"
                              title="Editar"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Excluir lançamento de ${formatCurrency(tx.amount)}?`)) {
                                  onDeleteTransaction(tx.id);
                                }
                              }}
                              className="p-1 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                              title="Excluir"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
