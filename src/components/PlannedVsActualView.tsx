import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ChevronDown, 
  ChevronRight,
  Calendar,
  Layers
} from 'lucide-react';
import { MONTH_NAMES, MONTH_FULL_NAMES, MonthIndex } from '../types/budget';
import { formatCurrency, formatPercent } from '../utils/formatters';

interface PlannedVsActualViewProps {
  selectedYear?: number;
  getComparisonData: (month: number | 'all') => {
    categoryId: string;
    categoryName: string;
    type: 'income' | 'expense';
    plannedTotal: number;
    actualTotal: number;
    difference: number;
    percentUsed: number;
    transactionCount: number;
    items: {
      itemId: string;
      itemName: string;
      planned: number;
      actual: number;
      difference: number;
      percentUsed: number;
      count: number;
    }[];
  }[];
}

export const PlannedVsActualView: React.FC<PlannedVsActualViewProps> = ({
  selectedYear = 2026,
  getComparisonData,
}) => {
  const [selectedMonth, setSelectedMonth] = useState<number | 'all'>(10); // Default to Novembro (10)
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({});

  const comparison = getComparisonData(selectedMonth);

  const toggleExpand = (catId: string) => {
    setExpandedCats((prev) => ({ ...prev, [catId]: !prev[catId] }));
  };

  const incomeCategories = comparison.filter((c) => c.type === 'income');
  const expenseCategories = comparison.filter((c) => c.type === 'expense');

  // Overall totals
  const totalPlannedIncome = incomeCategories.reduce((s, c) => s + c.plannedTotal, 0);
  const totalActualIncome = incomeCategories.reduce((s, c) => s + c.actualTotal, 0);
  const incomeDifference = totalActualIncome - totalPlannedIncome;

  const totalPlannedExpense = expenseCategories.reduce((s, c) => s + c.plannedTotal, 0);
  const totalActualExpense = expenseCategories.reduce((s, c) => s + c.actualTotal, 0);
  const expenseSavings = totalPlannedExpense - totalActualExpense;

  const plannedNet = totalPlannedIncome - totalPlannedExpense;
  const actualNet = totalActualIncome - totalActualExpense;
  const netDifference = actualNet - plannedNet;

  const expenseExecutionRate =
    totalPlannedExpense > 0 ? (totalActualExpense / totalPlannedExpense) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Month Selector Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-emerald-600" />
          <span className="text-xs font-semibold text-neutral-800">
            Período de Comparação:
          </span>
          <div className="flex items-center gap-1 overflow-x-auto py-1">
            <button
              onClick={() => setSelectedMonth('all')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                selectedMonth === 'all'
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'bg-neutral-100 text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Ano Completo
            </button>
            {MONTH_NAMES.map((m, idx) => (
              <button
                key={m}
                onClick={() => setSelectedMonth(idx)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  selectedMonth === idx
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-neutral-100 text-neutral-600 hover:text-neutral-900'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div className="text-xs text-neutral-500 font-medium shrink-0">
          Visualizando:{' '}
          <span className="text-neutral-900 font-bold">
            {selectedMonth === 'all'
              ? `Consolidado de ${selectedYear}`
              : `${MONTH_FULL_NAMES[selectedMonth]} de ${selectedYear}`}
          </span>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Despesas Totais */}
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500">Despesas Orçadas</span>
            <span className="text-xs font-mono text-neutral-500">
              {formatPercent(expenseExecutionRate)} gasto
            </span>
          </div>
          <div className="text-lg font-bold font-mono tabular-nums text-neutral-900 mt-1">
            {formatCurrency(totalPlannedExpense)}
          </div>
          <div className="mt-2 text-xs text-neutral-500 flex items-center justify-between">
            <span>Realizado:</span>
            <span className="font-mono font-semibold text-neutral-800">
              {formatCurrency(totalActualExpense)}
            </span>
          </div>
        </div>

        {/* Economia de Despesas */}
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500">Desvio em Despesas</span>
            {expenseSavings >= 0 ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <XCircle className="w-4 h-4 text-rose-600" />
            )}
          </div>
          <div
            className={`text-lg font-bold font-mono tabular-nums mt-1 ${
              expenseSavings >= 0 ? 'text-emerald-700' : 'text-rose-700'
            }`}
          >
            {expenseSavings >= 0 ? `+ ${formatCurrency(expenseSavings)}` : formatCurrency(expenseSavings)}
          </div>
          <p className="mt-2 text-xs text-neutral-500">
            {expenseSavings >= 0
              ? 'Economia em relação ao orçado'
              : 'Gasto acima do previsto na planilha'}
          </p>
        </div>

        {/* Receitas Totais */}
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500">Receitas Totais</span>
            <span className="text-xs font-mono text-emerald-600 font-semibold">
              {incomeDifference >= 0 ? 'Meta atingida' : 'Abaixo da meta'}
            </span>
          </div>
          <div className="text-lg font-bold font-mono tabular-nums text-neutral-900 mt-1">
            {formatCurrency(totalActualIncome)}
          </div>
          <div className="mt-2 text-xs text-neutral-500 flex items-center justify-between">
            <span>Orçado:</span>
            <span className="font-mono font-semibold text-neutral-800">
              {formatCurrency(totalPlannedIncome)}
            </span>
          </div>
        </div>

        {/* Saldo Líquido Realizado vs Orçado */}
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500">Saldo Líquido Real</span>
            <span className="text-xs text-neutral-400">Entradas - Saídas</span>
          </div>
          <div
            className={`text-lg font-bold font-mono tabular-nums mt-1 ${
              actualNet >= 0 ? 'text-emerald-700' : 'text-rose-700'
            }`}
          >
            {formatCurrency(actualNet)}
          </div>
          <div className="mt-2 text-xs text-neutral-500 flex items-center justify-between">
            <span>Orçado no plano:</span>
            <span className="font-mono font-semibold text-neutral-800">
              {formatCurrency(plannedNet)}
            </span>
          </div>
        </div>
      </div>

      {/* Categories Breakdown Table */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-neutral-900">
              Detalhamento de Execução por Categoria
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Compare quanto você planejou versus o total lançado em cada grupo
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-neutral-500">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              Dentro do teto
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
              80% - 100%
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
              Estourou teto
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 min-w-[200px]">Categoria / Item</th>
                <th className="py-3 px-4 text-right">Planejado (Orçado)</th>
                <th className="py-3 px-4 text-right">Realizado (Gastos)</th>
                <th className="py-3 px-4 text-right">Diferença / Saldo</th>
                <th className="py-3 px-4 min-w-[160px]">Progresso do Orçamento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {/* DESPESAS */}
              <tr className="bg-rose-50/50 font-bold text-rose-900">
                <td colSpan={5} className="py-2.5 px-4 tracking-wide text-[11px] uppercase">
                  Despesas da Família
                </td>
              </tr>

              {expenseCategories.map((cat) => {
                const isExpanded = expandedCats[cat.categoryId];
                const pct = cat.percentUsed;
                const isOverBudget = cat.actualTotal > cat.plannedTotal && cat.plannedTotal > 0;
                const isNearBudget = pct >= 80 && pct <= 100;

                return (
                  <React.Fragment key={cat.categoryId}>
                    <tr
                      onClick={() => toggleExpand(cat.categoryId)}
                      className="hover:bg-neutral-50 cursor-pointer font-semibold text-neutral-900 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {isExpanded ? (
                            <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
                          )}
                          <span>{cat.categoryName}</span>
                          {cat.transactionCount > 0 && (
                            <span className="text-[11px] text-neutral-400 font-normal">
                              ({cat.transactionCount} lançamentos)
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-neutral-700">
                        {formatCurrency(cat.plannedTotal)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-neutral-900 font-bold">
                        {formatCurrency(cat.actualTotal)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums">
                        <span
                          className={
                            cat.difference >= 0 ? 'text-emerald-700 font-semibold' : 'text-rose-700 font-bold'
                          }
                        >
                          {cat.difference >= 0 ? `+ ${formatCurrency(cat.difference)}` : formatCurrency(cat.difference)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-neutral-100 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                isOverBudget
                                  ? 'bg-rose-500'
                                  : isNearBudget
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500'
                              }`}
                              style={{ width: `${Math.min(100, pct)}%` }}
                            />
                          </div>
                          <span className="w-12 text-right font-mono text-[11px] text-neutral-600">
                            {formatPercent(pct)}
                          </span>
                        </div>
                      </td>
                    </tr>

                    {/* Sub-items */}
                    {isExpanded &&
                      cat.items.map((item) => {
                        const itemOver = item.actual > item.planned && item.planned > 0;
                        return (
                          <tr
                            key={item.itemId}
                            className="bg-neutral-50/40 text-neutral-600 hover:bg-neutral-50 transition-colors"
                          >
                            <td className="py-2 px-4 pl-9 text-xs">
                              <span className="font-medium text-neutral-700">{item.itemName}</span>
                              {item.count > 0 && (
                                <span className="ml-2 text-[10px] text-neutral-400">
                                  ({item.count} gastos)
                                </span>
                              )}
                            </td>
                            <td className="py-2 px-4 text-right font-mono tabular-nums text-neutral-500">
                              {formatCurrency(item.planned)}
                            </td>
                            <td className="py-2 px-4 text-right font-mono tabular-nums text-neutral-800 font-medium">
                              {formatCurrency(item.actual)}
                            </td>
                            <td className="py-2 px-4 text-right font-mono tabular-nums text-xs">
                              <span className={item.difference >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                                {item.difference >= 0 ? `+ ${formatCurrency(item.difference)}` : formatCurrency(item.difference)}
                              </span>
                            </td>
                            <td className="py-2 px-4">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 bg-neutral-200/60 rounded-full h-1.5 overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${
                                      itemOver ? 'bg-rose-500' : 'bg-emerald-500'
                                    }`}
                                    style={{ width: `${Math.min(100, item.percentUsed)}%` }}
                                  />
                                </div>
                                <span className="w-12 text-right font-mono text-[10px] text-neutral-500">
                                  {formatPercent(item.percentUsed)}
                                </span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </React.Fragment>
                );
              })}

              {/* RECEITAS */}
              <tr className="bg-emerald-50/50 font-bold text-emerald-900 border-t border-neutral-200">
                <td colSpan={5} className="py-2.5 px-4 tracking-wide text-[11px] uppercase">
                  Receitas & Entradas
                </td>
              </tr>

              {incomeCategories.map((cat) => {
                const isExpanded = expandedCats[cat.categoryId];
                return (
                  <React.Fragment key={cat.categoryId}>
                    <tr
                      onClick={() => toggleExpand(cat.categoryId)}
                      className="hover:bg-neutral-50 cursor-pointer font-semibold text-neutral-900 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {isExpanded ? (
                            <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
                          )}
                          <span>{cat.categoryName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-neutral-700">
                        {formatCurrency(cat.plannedTotal)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-emerald-700 font-bold">
                        {formatCurrency(cat.actualTotal)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums">
                        <span
                          className={
                            cat.difference >= 0 ? 'text-emerald-700 font-semibold' : 'text-amber-700'
                          }
                        >
                          {cat.difference >= 0 ? `+ ${formatCurrency(cat.difference)}` : formatCurrency(cat.difference)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-neutral-100 rounded-full h-2 overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full"
                              style={{ width: `${Math.min(100, cat.percentUsed)}%` }}
                            />
                          </div>
                          <span className="w-12 text-right font-mono text-[11px] text-neutral-600">
                            {formatPercent(cat.percentUsed)}
                          </span>
                        </div>
                      </td>
                    </tr>

                    {/* Sub-items */}
                    {isExpanded &&
                      cat.items.map((item) => (
                        <tr
                          key={item.itemId}
                          className="bg-neutral-50/40 text-neutral-600 hover:bg-neutral-50 transition-colors"
                        >
                          <td className="py-2 px-4 pl-9 text-xs">
                            <span className="font-medium text-neutral-700">{item.itemName}</span>
                          </td>
                          <td className="py-2 px-4 text-right font-mono tabular-nums text-neutral-500">
                            {formatCurrency(item.planned)}
                          </td>
                          <td className="py-2 px-4 text-right font-mono tabular-nums text-emerald-700 font-medium">
                            {formatCurrency(item.actual)}
                          </td>
                          <td className="py-2 px-4 text-right font-mono tabular-nums text-xs">
                            <span className={item.difference >= 0 ? 'text-emerald-600' : 'text-amber-600'}>
                              {item.difference >= 0 ? `+ ${formatCurrency(item.difference)}` : formatCurrency(item.difference)}
                            </span>
                          </td>
                          <td className="py-2 px-4">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-neutral-200/60 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className="h-full bg-emerald-500 rounded-full"
                                  style={{ width: `${Math.min(100, item.percentUsed)}%` }}
                                />
                              </div>
                              <span className="w-12 text-right font-mono text-[10px] text-neutral-500">
                                {formatPercent(item.percentUsed)}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
