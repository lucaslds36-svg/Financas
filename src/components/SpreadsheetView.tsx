import React, { useState, useMemo } from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  Plus, 
  Trash2, 
  Search, 
  Copy, 
  FolderPlus,
  Maximize2,
  Minimize2,
  Smartphone,
  Table as TableIcon,
  Calendar,
  Sparkles
} from 'lucide-react';
import { BudgetCategory, MonthIndex, MONTH_NAMES, MONTH_FULL_NAMES } from '../types/budget';
import { formatCurrency } from '../utils/formatters';

interface SpreadsheetViewProps {
  categories: BudgetCategory[];
  selectedYear: number;
  availableYears: number[];
  initialBalance: number;
  onSelectYear: (year: number) => void;
  onOpenYearRollover: () => void;
  onUpdateInitialBalance: (val: number) => void;
  onUpdateValue: (categoryId: string, itemId: string, monthIndex: MonthIndex, value: number) => void;
  onFillAllMonths: (categoryId: string, itemId: string, value: number) => void;
  onRemoveItem: (categoryId: string, itemId: string) => void;
  onRenameItem: (categoryId: string, itemId: string, newName: string) => void;
  onOpenAddItem: (categoryId?: string) => void;
  onRemoveCategory: (categoryId: string) => void;
}

export const SpreadsheetView: React.FC<SpreadsheetViewProps> = ({
  categories,
  selectedYear,
  availableYears,
  initialBalance,
  onSelectYear,
  onOpenYearRollover,
  onUpdateInitialBalance,
  onUpdateValue,
  onFillAllMonths,
  onRemoveItem,
  onRenameItem,
  onOpenAddItem,
  onRemoveCategory,
}) => {
  const [displayMode, setDisplayMode] = useState<'mobile_month' | 'table'>('mobile_month');
  const [mobileSelectedMonth, setMobileSelectedMonth] = useState<MonthIndex>(10); // Default to Novembro (10)
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [editingCell, setEditingCell] = useState<{
    categoryId: string;
    itemId: string;
    monthIndex: MonthIndex;
  } | null>(null);
  const [cellInputValue, setCellInputValue] = useState('');
  const [editingItemName, setEditingItemName] = useState<string | null>(null);
  const [nameInputValue, setNameInputValue] = useState('');

  const toggleCategory = (catId: string) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  const collapseAll = () => {
    const allCollapsed: Record<string, boolean> = {};
    categories.forEach((c) => {
      allCollapsed[c.id] = true;
    });
    setCollapsedCategories(allCollapsed);
  };

  const expandAll = () => {
    setCollapsedCategories({});
  };

  // Start cell editing
  const handleStartCellEdit = (
    categoryId: string,
    itemId: string,
    monthIndex: MonthIndex,
    currentValue: number
  ) => {
    setEditingCell({ categoryId, itemId, monthIndex });
    setCellInputValue(currentValue === 0 ? '' : currentValue.toString());
  };

  const handleSaveCellEdit = () => {
    if (editingCell) {
      const parsed = parseFloat(cellInputValue.replace(',', '.')) || 0;
      onUpdateValue(editingCell.categoryId, editingCell.itemId, editingCell.monthIndex, parsed);
      setEditingCell(null);
    }
  };

  const handleCellKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveCellEdit();
    } else if (e.key === 'Escape') {
      setEditingCell(null);
    }
  };

  // Start Item Rename
  const handleStartRename = (itemId: string, currentName: string) => {
    setEditingItemName(itemId);
    setNameInputValue(currentName);
  };

  const handleSaveRename = (categoryId: string, itemId: string) => {
    if (nameInputValue.trim()) {
      onRenameItem(categoryId, itemId, nameInputValue.trim());
    }
    setEditingItemName(null);
  };

  // Filtered categories and items based on search
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const query = searchQuery.toLowerCase();
    return categories
      .map((cat) => {
        const matchesCat = cat.name.toLowerCase().includes(query);
        const filteredItems = cat.items.filter((item) =>
          item.name.toLowerCase().includes(query)
        );
        if (matchesCat) return cat;
        if (filteredItems.length > 0) {
          return { ...cat, items: filteredItems };
        }
        return null;
      })
      .filter(Boolean) as BudgetCategory[];
  }, [categories, searchQuery]);

  // Overall Totals Per Month
  const monthlyTotals = useMemo(() => {
    const incomePerMonth = Array(12).fill(0);
    const expensePerMonth = Array(12).fill(0);

    categories.forEach((cat) => {
      cat.items.forEach((item) => {
        item.values.forEach((val, mIdx) => {
          if (cat.type === 'income') {
            incomePerMonth[mIdx] += val;
          } else {
            expensePerMonth[mIdx] += val;
          }
        });
      });
    });

    const netDifferencePerMonth = incomePerMonth.map((inc, i) => inc - expensePerMonth[i]);

    let cumulative = initialBalance;
    const cumulativeBalancePerMonth = netDifferencePerMonth.map((diff) => {
      cumulative += diff;
      return cumulative;
    });

    const totalIncomeYear = incomePerMonth.reduce((a, b) => a + b, 0);
    const totalExpenseYear = expensePerMonth.reduce((a, b) => a + b, 0);
    const totalNetYear = totalIncomeYear - totalExpenseYear;
    const finalCumulativeYear = initialBalance + totalNetYear;

    return {
      incomePerMonth,
      expensePerMonth,
      netDifferencePerMonth,
      cumulativeBalancePerMonth,
      totalIncomeYear,
      totalExpenseYear,
      totalNetYear,
      finalCumulativeYear,
    };
  }, [categories, initialBalance]);

  const incomeCategories = filteredCategories.filter((c) => c.type === 'income');
  const expenseCategories = filteredCategories.filter((c) => c.type === 'expense');

  // Month totals for mobile view
  const currentMonthIncome = monthlyTotals.incomePerMonth[mobileSelectedMonth];
  const currentMonthExpense = monthlyTotals.expensePerMonth[mobileSelectedMonth];
  const currentMonthNet = monthlyTotals.netDifferencePerMonth[mobileSelectedMonth];

  return (
    <div className="space-y-6">
      {/* Year Selector & Rollover Banner */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-neutral-900 text-white p-3.5 rounded-xl shadow-xs">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-neutral-400">Ano Orçamentário:</span>
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
            {availableYears.map((y) => (
              <button
                key={y}
                onClick={() => onSelectYear(y)}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors whitespace-nowrap min-h-[36px] ${
                  selectedYear === y
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                }`}
              >
                Ano {y}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {initialBalance > 0 && (
            <div className="text-xs text-neutral-300 flex items-center gap-1.5">
              <span className="text-neutral-400">Saldo Inicial Herdado:</span>
              <span className="font-mono font-bold text-emerald-400">{formatCurrency(initialBalance)}</span>
            </div>
          )}
          <button
            onClick={onOpenYearRollover}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-neutral-950 rounded-lg transition-colors whitespace-nowrap shadow-xs min-h-[36px]"
          >
            <span>Virada de Ano / Novo Ano</span>
          </button>
        </div>
      </div>

      {/* Mode Switcher & Action Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
        {/* Toggle between Mobile Cards View and Full 12-Month Table */}
        <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-lg">
          <button
            onClick={() => setDisplayMode('mobile_month')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              displayMode === 'mobile_month'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
            <span>Visão Mensal (Cards Celular)</span>
          </button>
          <button
            onClick={() => setDisplayMode('table')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              displayMode === 'table'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5 text-indigo-600" />
            <span>Tabela Anual (14 Colunas)</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar item..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <button
            onClick={() => onOpenAddItem()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs whitespace-nowrap shrink-0 min-h-[36px]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo Item</span>
          </button>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* VIEW MODE 1: MOBILE MONTH CARDS (OTIMIZADO P/ CELULAR) */}
      {/* ---------------------------------------------------- */}
      {displayMode === 'mobile_month' && (
        <div className="space-y-4">
          {/* Month Selector Carousel (Thumb-friendly touch bar) */}
          <div className="bg-white p-3 rounded-xl border border-neutral-200 shadow-xs">
            <div className="flex items-center justify-between gap-2 overflow-x-auto py-1 no-scrollbar">
              {MONTH_NAMES.map((m, idx) => (
                <button
                  key={m}
                  onClick={() => setMobileSelectedMonth(idx as MonthIndex)}
                  className={`px-3 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap min-w-[46px] min-h-[44px] flex flex-col items-center justify-center ${
                    mobileSelectedMonth === idx
                      ? 'bg-emerald-600 text-white shadow-xs scale-105'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  <span>{m}</span>
                  <span className="text-[10px] font-normal opacity-80">{selectedYear}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Month Summary KPI Strip */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200">
              <span className="text-[10px] font-semibold text-emerald-800 uppercase">Receita Prevista</span>
              <div className="text-sm sm:text-base font-bold font-mono text-emerald-950 mt-0.5">
                {formatCurrency(currentMonthIncome)}
              </div>
            </div>

            <div className="bg-rose-50 p-3 rounded-xl border border-rose-200">
              <span className="text-[10px] font-semibold text-rose-800 uppercase">Despesa Prevista</span>
              <div className="text-sm sm:text-base font-bold font-mono text-rose-950 mt-0.5">
                {formatCurrency(currentMonthExpense)}
              </div>
            </div>

            <div className="bg-neutral-900 text-white p-3 rounded-xl">
              <span className="text-[10px] font-semibold text-neutral-300 uppercase">Saldo do Mês</span>
              <div
                className={`text-sm sm:text-base font-bold font-mono mt-0.5 ${
                  currentMonthNet >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {formatCurrency(currentMonthNet)}
              </div>
            </div>
          </div>

          {/* RECEITAS MOBILE SECTION */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider px-1">
              Receitas de {MONTH_FULL_NAMES[mobileSelectedMonth]}
            </div>

            {incomeCategories.map((cat) => (
              <div key={cat.id} className="bg-white rounded-xl border border-neutral-200 shadow-xs overflow-hidden">
                <div className="p-3 bg-emerald-50/70 border-b border-emerald-100 flex items-center justify-between">
                  <span className="font-bold text-xs text-emerald-950">{cat.name}</span>
                  <button
                    onClick={() => onOpenAddItem(cat.id)}
                    className="text-[11px] font-semibold text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200"
                  >
                    + Adicionar
                  </button>
                </div>

                <div className="divide-y divide-neutral-100">
                  {cat.items.map((item) => {
                    const val = item.values[mobileSelectedMonth] || 0;
                    return (
                      <div key={item.id} className="p-3 flex items-center justify-between gap-3 text-xs">
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-neutral-900 truncate">{item.name}</div>
                          <div className="text-[10px] text-neutral-400">Total ano: {formatCurrency(item.values.reduce((a, b) => a + b, 0))}</div>
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={val === 0 ? '' : val}
                            placeholder="0,00"
                            onChange={(e) => {
                              const parsed = parseFloat(e.target.value) || 0;
                              onUpdateValue(cat.id, item.id, mobileSelectedMonth, parsed);
                            }}
                            className="w-24 text-right px-2 py-1.5 font-mono font-bold text-xs border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 bg-neutral-50"
                          />
                          <button
                            onClick={() => {
                              if (confirm(`Excluir "${item.name}"?`)) {
                                onRemoveItem(cat.id, item.id);
                              }
                            }}
                            className="p-1.5 text-neutral-400 hover:text-rose-600 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* DESPESAS MOBILE SECTION */}
          <div className="space-y-3 pt-2">
            <div className="text-xs font-bold text-rose-800 uppercase tracking-wider px-1">
              Despesas de {MONTH_FULL_NAMES[mobileSelectedMonth]}
            </div>

            {expenseCategories.map((cat) => (
              <div key={cat.id} className="bg-white rounded-xl border border-neutral-200 shadow-xs overflow-hidden">
                <div className="p-3 bg-neutral-50 border-b border-neutral-100 flex items-center justify-between">
                  <span className="font-bold text-xs text-neutral-900">{cat.name}</span>
                  <button
                    onClick={() => onOpenAddItem(cat.id)}
                    className="text-[11px] font-semibold text-neutral-700 bg-white px-2 py-0.5 rounded border border-neutral-200"
                  >
                    + Item
                  </button>
                </div>

                <div className="divide-y divide-neutral-100">
                  {cat.items.map((item) => {
                    const val = item.values[mobileSelectedMonth] || 0;
                    return (
                      <div key={item.id} className="p-3 flex items-center justify-between gap-3 text-xs">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-neutral-900 truncate">{item.name}</div>
                          <div className="text-[10px] text-neutral-400">Total ano: {formatCurrency(item.values.reduce((a, b) => a + b, 0))}</div>
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={val === 0 ? '' : val}
                            placeholder="0,00"
                            onChange={(e) => {
                              const parsed = parseFloat(e.target.value) || 0;
                              onUpdateValue(cat.id, item.id, mobileSelectedMonth, parsed);
                            }}
                            className="w-24 text-right px-2 py-1.5 font-mono font-medium text-xs border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 bg-neutral-50"
                          />
                          <button
                            onClick={() => {
                              if (confirm(`Excluir "${item.name}"?`)) {
                                onRemoveItem(cat.id, item.id);
                              }
                            }}
                            className="p-1.5 text-neutral-400 hover:text-rose-600 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* VIEW MODE 2: FULL 14-COLUMN DESKTOP SPREADSHEET TABLE */}
      {/* ---------------------------------------------------- */}
      {displayMode === 'table' && (
        <div className="bg-white rounded-xl border border-neutral-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-neutral-100/80 border-b border-neutral-200 text-neutral-600 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-3 min-w-[240px] sticky left-0 z-20 bg-neutral-100/95 backdrop-blur-xs border-r border-neutral-200">
                    Categoria / Item
                  </th>
                  {MONTH_NAMES.map((m) => (
                    <th key={m} className="py-3 px-2 text-right min-w-[100px]">
                      {m}
                    </th>
                  ))}
                  <th className="py-3 px-3 text-right min-w-[120px] bg-neutral-200/50 font-bold text-neutral-900 border-l border-neutral-200">
                    Total Ano
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {/* SECTION: RECEITA */}
                <tr className="bg-emerald-50/70 text-emerald-950 font-bold border-t border-b border-emerald-200">
                  <td
                    colSpan={14}
                    className="py-2.5 px-3 sticky left-0 z-10 bg-emerald-50/90 backdrop-blur-xs tracking-wide"
                  >
                    RECEITA
                  </td>
                </tr>

                {incomeCategories.map((cat) => {
                  const isCollapsed = collapsedCategories[cat.id];
                  const catTotals = Array(12).fill(0);
                  cat.items.forEach((item) => {
                    item.values.forEach((v, idx) => {
                      catTotals[idx] += v;
                    });
                  });
                  const catYearTotal = catTotals.reduce((a, b) => a + b, 0);

                  return (
                    <React.Fragment key={cat.id}>
                      <tr className="bg-neutral-50/90 font-semibold text-neutral-800 hover:bg-neutral-100/80 transition-colors group">
                        <td className="py-2 px-3 sticky left-0 z-10 bg-neutral-50/95 backdrop-blur-xs border-r border-neutral-200">
                          <div className="flex items-center justify-between">
                            <button
                              onClick={() => toggleCategory(cat.id)}
                              className="flex items-center gap-1.5 text-left font-bold text-neutral-800 hover:text-emerald-700"
                            >
                              {isCollapsed ? (
                                <ChevronRight className="w-3.5 h-3.5 text-neutral-500" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5 text-neutral-500" />
                              )}
                              <span>{cat.name.toUpperCase()}</span>
                            </button>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => onOpenAddItem(cat.id)}
                                title="Adicionar item nesta categoria"
                                className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                              {categories.length > 2 && (
                                <button
                                  onClick={() => {
                                    if (confirm(`Excluir a categoria "${cat.name}" e todos os seus itens?`)) {
                                      onRemoveCategory(cat.id);
                                    }
                                  }}
                                  title="Excluir categoria"
                                  className="p-1 text-neutral-400 hover:text-rose-600 rounded"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        </td>
                        {catTotals.map((tot, idx) => (
                          <td
                            key={idx}
                            className="py-2 px-2 text-right font-mono tabular-nums text-neutral-700 font-semibold"
                          >
                            {formatCurrency(tot)}
                          </td>
                        ))}
                        <td className="py-2 px-3 text-right font-mono tabular-nums font-bold text-emerald-700 bg-neutral-100/50 border-l border-neutral-200">
                          {formatCurrency(catYearTotal)}
                        </td>
                      </tr>

                      {!isCollapsed &&
                        cat.items.map((item) => {
                          const itemYearTotal = item.values.reduce((a, b) => a + b, 0);

                          return (
                            <tr
                              key={item.id}
                              className="hover:bg-neutral-50/60 transition-colors group text-neutral-700"
                            >
                              <td className="py-1.5 px-3 pl-8 sticky left-0 z-10 bg-white/95 backdrop-blur-xs border-r border-neutral-200">
                                <div className="flex items-center justify-between">
                                  {editingItemName === item.id ? (
                                    <input
                                      type="text"
                                      autoFocus
                                      value={nameInputValue}
                                      onChange={(e) => setNameInputValue(e.target.value)}
                                      onBlur={() => handleSaveRename(cat.id, item.id)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleSaveRename(cat.id, item.id);
                                        if (e.key === 'Escape') setEditingItemName(null);
                                      }}
                                      className="px-1.5 py-0.5 text-xs border border-emerald-500 rounded font-medium focus:outline-none"
                                    />
                                  ) : (
                                    <span
                                      onDoubleClick={() => handleStartRename(item.id, item.name)}
                                      title="Dê dois cliques para renomear"
                                      className="cursor-pointer hover:text-neutral-900 font-medium"
                                    >
                                      {item.name}
                                    </span>
                                  )}

                                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                      onClick={() => {
                                        const currentFirst = item.values.find((v) => v > 0) || 0;
                                        const promptVal = prompt(
                                          `Preencher todos os 12 meses para "${item.name}":`,
                                          currentFirst.toString()
                                        );
                                        if (promptVal !== null) {
                                          const parsed = parseFloat(promptVal.replace(',', '.')) || 0;
                                          onFillAllMonths(cat.id, item.id, parsed);
                                        }
                                      }}
                                      title="Replicar valor para todos os meses"
                                      className="p-1 text-neutral-400 hover:text-neutral-700 rounded"
                                    >
                                      <Copy className="w-3 h-3" />
                                    </button>
                                    <button
                                      onClick={() => {
                                        if (confirm(`Remover "${item.name}"?`)) {
                                          onRemoveItem(cat.id, item.id);
                                        }
                                      }}
                                      title="Excluir item"
                                      className="p-1 text-neutral-400 hover:text-rose-600 rounded"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                              </td>

                              {item.values.map((val, mIdx) => {
                                const isEditing =
                                  editingCell?.categoryId === cat.id &&
                                  editingCell?.itemId === item.id &&
                                  editingCell?.monthIndex === mIdx;

                                return (
                                  <td
                                    key={mIdx}
                                    onClick={() => {
                                      if (!isEditing) {
                                        handleStartCellEdit(cat.id, item.id, mIdx as MonthIndex, val);
                                      }
                                    }}
                                    className={`py-1.5 px-2 text-right font-mono tabular-nums cursor-pointer transition-colors ${
                                      isEditing
                                        ? 'bg-emerald-50 p-0'
                                        : val > 0
                                        ? 'text-neutral-900 font-medium hover:bg-neutral-100'
                                        : 'text-neutral-300 hover:bg-neutral-50'
                                    }`}
                                  >
                                    {isEditing ? (
                                      <input
                                        type="text"
                                        autoFocus
                                        value={cellInputValue}
                                        onChange={(e) => setCellInputValue(e.target.value)}
                                        onBlur={handleSaveCellEdit}
                                        onKeyDown={handleCellKeyDown}
                                        className="w-full h-full text-right py-1 px-1.5 bg-emerald-50 text-emerald-900 font-mono font-semibold border-2 border-emerald-600 rounded outline-none"
                                      />
                                    ) : val > 0 ? (
                                      formatCurrency(val)
                                    ) : (
                                      '-'
                                    )}
                                  </td>
                                );
                              })}

                              <td className="py-1.5 px-3 text-right font-mono tabular-nums font-semibold text-neutral-900 bg-neutral-50/50 border-l border-neutral-200">
                                {formatCurrency(itemYearTotal)}
                              </td>
                            </tr>
                          );
                        })}
                    </React.Fragment>
                  );
                })}

                {/* Total Receitas Row */}
                <tr className="bg-emerald-100/70 font-bold text-emerald-900 border-t-2 border-b-2 border-emerald-300">
                  <td className="py-2.5 px-3 sticky left-0 z-10 bg-emerald-100/90 backdrop-blur-xs border-r border-neutral-200">
                    Total Receitas
                  </td>
                  {monthlyTotals.incomePerMonth.map((tot, idx) => (
                    <td key={idx} className="py-2.5 px-2 text-right font-mono tabular-nums">
                      {formatCurrency(tot)}
                    </td>
                  ))}
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums border-l border-neutral-200 text-emerald-950">
                    {formatCurrency(monthlyTotals.totalIncomeYear)}
                  </td>
                </tr>

                {/* SECTION: DESPESAS */}
                <tr className="bg-rose-50/70 text-rose-950 font-bold border-t border-b border-rose-200">
                  <td
                    colSpan={14}
                    className="py-2.5 px-3 sticky left-0 z-10 bg-rose-50/90 backdrop-blur-xs tracking-wide"
                  >
                    DESPESAS
                  </td>
                </tr>

                {expenseCategories.map((cat) => {
                  const isCollapsed = collapsedCategories[cat.id];
                  const catTotals = Array(12).fill(0);
                  cat.items.forEach((item) => {
                    item.values.forEach((v, idx) => {
                      catTotals[idx] += v;
                    });
                  });
                  const catYearTotal = catTotals.reduce((a, b) => a + b, 0);

                  return (
                    <React.Fragment key={cat.id}>
                      <tr className="bg-neutral-50/90 font-semibold text-neutral-800 hover:bg-neutral-100/80 transition-colors group">
                        <td className="py-2 px-3 sticky left-0 z-10 bg-neutral-50/95 backdrop-blur-xs border-r border-neutral-200">
                          <div className="flex items-center justify-between">
                            <button
                              onClick={() => toggleCategory(cat.id)}
                              className="flex items-center gap-1.5 text-left font-bold text-neutral-800 hover:text-rose-700"
                            >
                              {isCollapsed ? (
                                <ChevronRight className="w-3.5 h-3.5 text-neutral-500" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5 text-neutral-500" />
                              )}
                              <span>{cat.name.toUpperCase()}</span>
                            </button>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => onOpenAddItem(cat.id)}
                                title="Adicionar item nesta categoria"
                                className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                              {categories.length > 2 && (
                                <button
                                  onClick={() => {
                                    if (confirm(`Excluir a categoria "${cat.name}" e todos os seus itens?`)) {
                                      onRemoveCategory(cat.id);
                                    }
                                  }}
                                  title="Excluir categoria"
                                  className="p-1 text-neutral-400 hover:text-rose-600 rounded"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        </td>
                        {catTotals.map((tot, idx) => (
                          <td
                            key={idx}
                            className="py-2 px-2 text-right font-mono tabular-nums text-neutral-700 font-semibold"
                          >
                            {formatCurrency(tot)}
                          </td>
                        ))}
                        <td className="py-2 px-3 text-right font-mono tabular-nums font-bold text-rose-700 bg-neutral-100/50 border-l border-neutral-200">
                          {formatCurrency(catYearTotal)}
                        </td>
                      </tr>

                      {!isCollapsed &&
                        cat.items.map((item) => {
                          const itemYearTotal = item.values.reduce((a, b) => a + b, 0);

                          return (
                            <tr
                              key={item.id}
                              className="hover:bg-neutral-50/60 transition-colors group text-neutral-700"
                            >
                              <td className="py-1.5 px-3 pl-8 sticky left-0 z-10 bg-white/95 backdrop-blur-xs border-r border-neutral-200">
                                <div className="flex items-center justify-between">
                                  {editingItemName === item.id ? (
                                    <input
                                      type="text"
                                      autoFocus
                                      value={nameInputValue}
                                      onChange={(e) => setNameInputValue(e.target.value)}
                                      onBlur={() => handleSaveRename(cat.id, item.id)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleSaveRename(cat.id, item.id);
                                        if (e.key === 'Escape') setEditingItemName(null);
                                      }}
                                      className="px-1.5 py-0.5 text-xs border border-emerald-500 rounded font-medium focus:outline-none"
                                    />
                                  ) : (
                                    <span
                                      onDoubleClick={() => handleStartRename(item.id, item.name)}
                                      title="Dê dois cliques para renomear"
                                      className="cursor-pointer hover:text-neutral-900 font-medium"
                                    >
                                      {item.name}
                                    </span>
                                  )}

                                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                      onClick={() => {
                                        const currentFirst = item.values.find((v) => v > 0) || 0;
                                        const promptVal = prompt(
                                          `Preencher todos os 12 meses para "${item.name}":`,
                                          currentFirst.toString()
                                        );
                                        if (promptVal !== null) {
                                          const parsed = parseFloat(promptVal.replace(',', '.')) || 0;
                                          onFillAllMonths(cat.id, item.id, parsed);
                                        }
                                      }}
                                      title="Replicar valor para todos os meses"
                                      className="p-1 text-neutral-400 hover:text-neutral-700 rounded"
                                    >
                                      <Copy className="w-3 h-3" />
                                    </button>
                                    <button
                                      onClick={() => {
                                        if (confirm(`Remover "${item.name}"?`)) {
                                          onRemoveItem(cat.id, item.id);
                                        }
                                      }}
                                      title="Excluir item"
                                      className="p-1 text-neutral-400 hover:text-rose-600 rounded"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                              </td>

                              {item.values.map((val, mIdx) => {
                                const isEditing =
                                  editingCell?.categoryId === cat.id &&
                                  editingCell?.itemId === item.id &&
                                  editingCell?.monthIndex === mIdx;

                                return (
                                  <td
                                    key={mIdx}
                                    onClick={() => {
                                      if (!isEditing) {
                                        handleStartCellEdit(cat.id, item.id, mIdx as MonthIndex, val);
                                      }
                                    }}
                                    className={`py-1.5 px-2 text-right font-mono tabular-nums cursor-pointer transition-colors ${
                                      isEditing
                                        ? 'bg-emerald-50 p-0'
                                        : val > 0
                                        ? 'text-neutral-900 font-medium hover:bg-neutral-100'
                                        : 'text-neutral-300 hover:bg-neutral-50'
                                    }`}
                                  >
                                    {isEditing ? (
                                      <input
                                        type="text"
                                        autoFocus
                                        value={cellInputValue}
                                        onChange={(e) => setCellInputValue(e.target.value)}
                                        onBlur={handleSaveCellEdit}
                                        onKeyDown={handleCellKeyDown}
                                        className="w-full h-full text-right py-1 px-1.5 bg-emerald-50 text-emerald-900 font-mono font-semibold border-2 border-emerald-600 rounded outline-none"
                                      />
                                    ) : val > 0 ? (
                                      formatCurrency(val)
                                    ) : (
                                      '-'
                                    )}
                                  </td>
                                );
                              })}

                              <td className="py-1.5 px-3 text-right font-mono tabular-nums font-semibold text-neutral-900 bg-neutral-50/50 border-l border-neutral-200">
                                {formatCurrency(itemYearTotal)}
                              </td>
                            </tr>
                          );
                        })}
                    </React.Fragment>
                  );
                })}

                {/* TOTAIS GERAIS */}
                <tr className="bg-neutral-200/90 text-neutral-900 font-bold border-t-2 border-neutral-300">
                  <td
                    colSpan={14}
                    className="py-2 px-3 sticky left-0 z-10 bg-neutral-200/95 backdrop-blur-xs tracking-wider"
                  >
                    TOTAIS FINAIS
                  </td>
                </tr>

                {/* Despesas Totais */}
                <tr className="bg-rose-100/60 font-bold text-rose-900">
                  <td className="py-2.5 px-3 sticky left-0 z-10 bg-rose-100/90 backdrop-blur-xs border-r border-neutral-200">
                    Despesas Totais
                  </td>
                  {monthlyTotals.expensePerMonth.map((tot, idx) => (
                    <td key={idx} className="py-2.5 px-2 text-right font-mono tabular-nums">
                      {formatCurrency(tot)}
                    </td>
                  ))}
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums border-l border-neutral-200 text-rose-950">
                    {formatCurrency(monthlyTotals.totalExpenseYear)}
                  </td>
                </tr>

                {/* Diferença de Caixa (Receita - Despesas) */}
                <tr className="bg-emerald-100/90 font-bold text-emerald-950 border-t border-b border-emerald-300">
                  <td className="py-2.5 px-3 sticky left-0 z-10 bg-emerald-100/95 backdrop-blur-xs border-r border-neutral-200">
                    Diferença de Caixa (Saldo Mensal)
                  </td>
                  {monthlyTotals.netDifferencePerMonth.map((diff, idx) => (
                    <td
                      key={idx}
                      className={`py-2.5 px-2 text-right font-mono tabular-nums ${
                        diff >= 0 ? 'text-emerald-900' : 'text-rose-700'
                      }`}
                    >
                      {formatCurrency(diff)}
                    </td>
                  ))}
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums border-l border-neutral-200 font-extrabold text-emerald-950">
                    {formatCurrency(monthlyTotals.totalNetYear)}
                  </td>
                </tr>

                {/* Saldo de Caixa Real Acumulado */}
                <tr className="bg-neutral-100/90 font-semibold text-neutral-800">
                  <td className="py-2.5 px-3 sticky left-0 z-10 bg-neutral-100/95 backdrop-blur-xs border-r border-neutral-200">
                    Saldo de Caixa Real (Movimentações Efetivadas)
                  </td>
                  {monthlyTotals.cumulativeBalancePerMonth.map((cum, idx) => (
                    <td
                      key={idx}
                      className="py-2.5 px-2 text-right font-mono tabular-nums text-neutral-800"
                    >
                      {formatCurrency(cum)}
                    </td>
                  ))}
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums border-l border-neutral-200 font-bold text-neutral-900">
                    {formatCurrency(monthlyTotals.finalCumulativeYear)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between text-xs text-neutral-500 gap-2 px-1">
        <div className="flex items-center gap-4">
          <span>💡 Toque ou clique no valor para editar o orçamento</span>
          <span aria-hidden="true">·</span>
          <span>Troque entre "Cards Celular" e "Tabela Anual" no topo</span>
        </div>
      </div>
    </div>
  );
};
