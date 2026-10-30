import React, { useState } from 'react';
import { 
  TrendingUp, 
  PiggyBank, 
  ArrowUpRight, 
  Calendar,
  Layers,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { MonthSummary, BudgetCategory } from '../types/budget';
import { formatCurrency, formatPercent } from '../utils/formatters';

interface EvolutionViewProps {
  selectedYear?: number;
  monthlySummaries: MonthSummary[];
  categories: BudgetCategory[];
  annualSummary: {
    totalPlannedIncome: number;
    totalPlannedExpense: number;
    totalPlannedBalance: number;
    savingsRate: number;
  };
}

export const EvolutionView: React.FC<EvolutionViewProps> = ({
  selectedYear = 2026,
  monthlySummaries,
  categories,
  annualSummary,
}) => {
  const [hoveredMonth, setHoveredMonth] = useState<number | null>(null);

  // Maximum value for scaling bar charts
  const maxMonthlyValue = Math.max(
    ...monthlySummaries.map((m) => Math.max(m.plannedIncome, m.plannedExpense, m.plannedBalance)),
    1000
  );

  // Cumulative balance max
  const maxCumulative = Math.max(
    ...monthlySummaries.map((m) => m.cumulativePlannedBalance),
    1000
  );

  // Category Annual Breakdown
  const expenseCategories = categories.filter((c) => c.type === 'expense');
  const categoryTotals = expenseCategories.map((cat) => {
    const total = cat.items.reduce(
      (sum, item) => sum + item.values.reduce((s, v) => s + v, 0),
      0
    );
    const percent = annualSummary.totalPlannedExpense > 0
      ? (total / annualSummary.totalPlannedExpense) * 100
      : 0;
    return {
      id: cat.id,
      name: cat.name,
      total,
      percent,
    };
  }).sort((a, b) => b.total - a.total);

  // Top month stats
  const highestExpenseMonth = [...monthlySummaries].sort(
    (a, b) => b.plannedExpense - a.plannedExpense
  )[0];
  const highestIncomeMonth = [...monthlySummaries].sort(
    (a, b) => b.plannedIncome - a.plannedIncome
  )[0];
  const highestSurplusMonth = [...monthlySummaries].sort(
    (a, b) => b.plannedBalance - a.plannedBalance
  )[0];

  return (
    <div className="space-y-8">
      {/* Overview Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
          <span className="text-xs font-medium text-neutral-500">Saldo Acumulado no Fim do Ano</span>
          <div className="text-xl font-bold font-mono tabular-nums text-emerald-700 mt-1">
            {formatCurrency(annualSummary.totalPlannedBalance)}
          </div>
          <div className="mt-2 text-xs text-neutral-500 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
            <span>Patrimônio financeiro livre projetado</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
          <span className="text-xs font-medium text-neutral-500">Taxa Média de Poupança</span>
          <div className="text-xl font-bold font-mono tabular-nums text-indigo-700 mt-1">
            {formatPercent(annualSummary.savingsRate)}
          </div>
          <div className="mt-2 text-xs text-neutral-500 flex items-center gap-1">
            <PiggyBank className="w-3.5 h-3.5 text-indigo-600" />
            <span>Retenção de capital sobre receitas</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
          <span className="text-xs font-medium text-neutral-500">Mês com Maior Superávit</span>
          <div className="text-xl font-bold font-mono tabular-nums text-neutral-900 mt-1">
            {highestSurplusMonth.monthName} ({formatCurrency(highestSurplusMonth.plannedBalance)})
          </div>
          <p className="mt-2 text-xs text-neutral-500">
            Pico de retenção de caixa líquido
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
          <span className="text-xs font-medium text-neutral-500">Pico de Despesas do Ano</span>
          <div className="text-xl font-bold font-mono tabular-nums text-rose-700 mt-1">
            {highestExpenseMonth.monthName} ({formatCurrency(highestExpenseMonth.plannedExpense)})
          </div>
          <p className="mt-2 text-xs text-neutral-500">
            Concentração de pagamentos e viagens
          </p>
        </div>
      </div>

      {/* Chart 1: Evolução Mês a Mês (Receita vs Despesas vs Saldo) */}
      <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="text-sm font-bold text-neutral-900">
              Evolução Mensal do Fluxo de Caixa (12 Meses)
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Comparação mensal entre Receita, Despesas e Saldo Líquido
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium">
            <span className="flex items-center gap-1.5 text-emerald-700">
              <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" />
              Receita
            </span>
            <span className="flex items-center gap-1.5 text-rose-700">
              <span className="w-3 h-3 rounded-sm bg-rose-500 inline-block" />
              Despesas
            </span>
            <span className="flex items-center gap-1.5 text-indigo-700">
              <span className="w-3 h-3 rounded-sm bg-indigo-500 inline-block" />
              Saldo Líquido
            </span>
          </div>
        </div>

        {/* SVG Grouped Bar Chart */}
        <div className="relative pt-4 pb-2">
          <div className="h-64 flex items-end justify-between gap-2 border-b border-neutral-200 px-2">
            {monthlySummaries.map((m, idx) => {
              const incomeHeight = (m.plannedIncome / maxMonthlyValue) * 100;
              const expenseHeight = (m.plannedExpense / maxMonthlyValue) * 100;
              const balanceHeight = (Math.max(0, m.plannedBalance) / maxMonthlyValue) * 100;
              const isHovered = hoveredMonth === idx;

              return (
                <div
                  key={m.monthIndex}
                  onMouseEnter={() => setHoveredMonth(idx)}
                  onMouseLeave={() => setHoveredMonth(null)}
                  className="flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer"
                >
                  {/* Tooltip on hover */}
                  {isHovered && (
                    <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 bg-neutral-900 text-white p-2.5 rounded-lg shadow-lg text-[11px] whitespace-nowrap z-30 pointer-events-none">
                      <div className="font-bold border-b border-neutral-700 pb-1 mb-1 text-neutral-200">
                        {m.monthName}
                      </div>
                      <div className="flex justify-between gap-3 text-emerald-400">
                        <span>Receita:</span>
                        <span className="font-mono tabular-nums">{formatCurrency(m.plannedIncome)}</span>
                      </div>
                      <div className="flex justify-between gap-3 text-rose-400">
                        <span>Despesas:</span>
                        <span className="font-mono tabular-nums">{formatCurrency(m.plannedExpense)}</span>
                      </div>
                      <div className="flex justify-between gap-3 text-indigo-300 font-semibold pt-1 border-t border-neutral-800">
                        <span>Saldo:</span>
                        <span className="font-mono tabular-nums">{formatCurrency(m.plannedBalance)}</span>
                      </div>
                    </div>
                  )}

                  {/* Bars group */}
                  <div className="w-full flex items-end justify-center gap-1 h-full">
                    <div
                      className={`w-1/3 rounded-t-sm transition-all duration-200 ${
                        isHovered ? 'bg-emerald-600' : 'bg-emerald-500/90'
                      }`}
                      style={{ height: `${Math.max(4, incomeHeight)}%` }}
                    />
                    <div
                      className={`w-1/3 rounded-t-sm transition-all duration-200 ${
                        isHovered ? 'bg-rose-600' : 'bg-rose-500/90'
                      }`}
                      style={{ height: `${Math.max(4, expenseHeight)}%` }}
                    />
                    <div
                      className={`w-1/3 rounded-t-sm transition-all duration-200 ${
                        isHovered ? 'bg-indigo-600' : 'bg-indigo-500/90'
                      }`}
                      style={{ height: `${Math.max(4, balanceHeight)}%` }}
                    />
                  </div>

                  <span className="text-[11px] font-medium text-neutral-500 mt-2">
                    {m.monthName}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Chart 2: Curva de Acúmulo de Patrimônio (Saldo Acumulado) */}
      <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="text-sm font-bold text-neutral-900">
              Evolução do Saldo Acumulado (Curva de Patrimônio Líquido)
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Crescimento do caixa ao longo dos 12 meses acumulando a sobra mensal
            </p>
          </div>
          <div className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
            Final do Ano: {formatCurrency(annualSummary.totalPlannedBalance)}
          </div>
        </div>

        {/* Visual Growth SVG Area/Line Chart */}
        <div className="h-56 w-full relative">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 1000 200" preserveAspectRatio="none">
            <defs>
              <linearGradient id="wealthGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid horizontal lines */}
            <line x1="0" y1="50" x2="1000" y2="50" stroke="#f1f5f9" strokeWidth="1" />
            <line x1="0" y1="100" x2="1000" y2="100" stroke="#f1f5f9" strokeWidth="1" />
            <line x1="0" y1="150" x2="1000" y2="150" stroke="#f1f5f9" strokeWidth="1" />

            {/* SVG Area */}
            {(() => {
              const points = monthlySummaries.map((m, i) => {
                const x = (i / 11) * 980 + 10;
                const y = 190 - (m.cumulativePlannedBalance / maxCumulative) * 170;
                return `${x},${y}`;
              });
              const areaPath = `M 10,190 L ${points.join(' L ')} L 990,190 Z`;
              const linePath = `M ${points.join(' L ')}`;

              return (
                <>
                  <path d={areaPath} fill="url(#wealthGradient)" />
                  <path
                    d={linePath}
                    fill="none"
                    stroke="#059669"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {monthlySummaries.map((m, i) => {
                    const x = (i / 11) * 980 + 10;
                    const y = 190 - (m.cumulativePlannedBalance / maxCumulative) * 170;
                    return (
                      <circle
                        key={i}
                        cx={x}
                        cy={y}
                        r="5"
                        fill="#ffffff"
                        stroke="#059669"
                        strokeWidth="2.5"
                      />
                    );
                  })}
                </>
              );
            })()}
          </svg>

          {/* Month labels below SVG */}
          <div className="flex justify-between items-center text-[11px] text-neutral-500 font-medium pt-3">
            {monthlySummaries.map((m) => (
              <span key={m.monthIndex} className="text-center w-8">
                {m.monthName}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Breakdown by Category: Table + Percent Bars */}
      <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-neutral-900">
              Distribuição Anual de Despesas por Categoria
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Onde o dinheiro da família está concentrado ao longo de todo o ano
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-neutral-900">
            Total Anual: {formatCurrency(annualSummary.totalPlannedExpense)}
          </span>
        </div>

        <div className="space-y-3 pt-2">
          {categoryTotals.map((cat) => (
            <div key={cat.id} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-neutral-800">{cat.name}</span>
                <div className="flex items-center gap-3">
                  <span className="font-mono tabular-nums text-neutral-600">
                    {formatCurrency(cat.total)}
                  </span>
                  <span className="font-mono tabular-nums font-semibold text-neutral-900 w-12 text-right">
                    {formatPercent(cat.percent)}
                  </span>
                </div>
              </div>
              <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, cat.percent)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
