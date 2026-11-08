import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet, 
  ShoppingCart, 
  PieChart as PieIcon, 
  BarChart3, 
  Activity, 
  Layers, 
  Users,
  ChevronRight,
  Info
} from 'lucide-react';
import { MonthSummary, BudgetCategory, RealTransaction, MonthIndex, MONTH_NAMES, MONTH_FULL_NAMES } from '../types/budget';
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
    totalActualIncome?: number;
    totalActualExpense?: number;
    totalActualBalance?: number;
  };
  transactions?: RealTransaction[];
}

export const EvolutionView: React.FC<EvolutionViewProps> = ({
  selectedYear = 2026,
  monthlySummaries,
  categories,
  annualSummary,
  transactions = [],
}) => {
  const currentMonthIdx = new Date().getMonth() as MonthIndex;
  const [viewScope, setViewScope] = useState<'month' | 'year'>('month');
  const [activeMonth, setActiveMonth] = useState<MonthIndex>(currentMonthIdx);
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);

  // Filter transactions for the selected active month
  const activeMonthTransactions = useMemo(() => {
    return transactions.filter((t) => t.month === activeMonth);
  }, [transactions, activeMonth]);

  // Days in selected month
  const daysInMonth = useMemo(() => {
    // 0 is last day of previous month, month is 1-indexed in Date constructor
    return new Date(selectedYear, activeMonth + 1, 0).getDate();
  }, [selectedYear, activeMonth]);

  // Calculate day-by-day spending and cumulative spending in the active month
  const dailyBreakdown = useMemo(() => {
    const days: {
      day: number;
      expenseAmount: number;
      incomeAmount: number;
      cumulativeExpense: number;
      items: RealTransaction[];
    }[] = [];

    let runningExpense = 0;

    for (let d = 1; d <= daysInMonth; d++) {
      const dayStr = d.toString().padStart(2, '0');
      const dayTxs = activeMonthTransactions.filter((t) => {
        const txDay = parseInt(t.date.slice(8, 10), 10);
        return txDay === d;
      });

      const dayExpense = dayTxs
        .filter((t) => t.type === 'expense')
        .reduce((s, t) => s + t.amount, 0);

      const dayIncome = dayTxs
        .filter((t) => t.type === 'income')
        .reduce((s, t) => s + t.amount, 0);

      runningExpense += dayExpense;

      days.push({
        day: d,
        expenseAmount: dayExpense,
        incomeAmount: dayIncome,
        cumulativeExpense: runningExpense,
        items: dayTxs,
      });
    }

    return days;
  }, [activeMonthTransactions, daysInMonth]);

  // Month stats
  const monthSummary = monthlySummaries[activeMonth];
  const monthTotalActualExpense = activeMonthTransactions
    .filter((t) => t.type === 'expense')
    .reduce((s, t) => s + t.amount, 0);
  const monthTotalActualIncome = activeMonthTransactions
    .filter((t) => t.type === 'income')
    .reduce((s, t) => s + t.amount, 0);

  // Budget planned for this month (or from planned summary)
  const monthPlannedExpense = monthSummary?.plannedExpense || 0;
  const monthPlannedIncome = monthSummary?.plannedIncome || 0;

  // Average daily expense
  const today = new Date();
  const isCurrentMonth = today.getMonth() === activeMonth && today.getFullYear() === selectedYear;
  const elapsedDays = isCurrentMonth ? Math.max(1, today.getDate()) : daysInMonth;
  const avgDailyExpense = monthTotalActualExpense / elapsedDays;
  const projectedMonthEndExpense = avgDailyExpense * daysInMonth;

  // Highest spending day in month
  const peakDay = useMemo(() => {
    return [...dailyBreakdown].sort((a, b) => b.expenseAmount - a.expenseAmount)[0];
  }, [dailyBreakdown]);

  // Max cumulative for SVG scaling
  const maxCumulativeValue = Math.max(
    monthPlannedExpense || 1000,
    dailyBreakdown[dailyBreakdown.length - 1]?.cumulativeExpense || 1000,
    100
  );

  // Max single day expense for bar scaling
  const maxDayExpense = Math.max(...dailyBreakdown.map((d) => d.expenseAmount), 100);

  // Category breakdown for active month
  const monthCategoryBreakdown = useMemo(() => {
    const map = new Map<string, { name: string; amount: number; count: number }>();
    activeMonthTransactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        const cat = t.categoryName || 'Diversos';
        const curr = map.get(cat) || { name: cat, amount: 0, count: 0 };
        curr.amount += t.amount;
        curr.count += 1;
        map.set(cat, curr);
      });

    return Array.from(map.values()).sort((a, b) => b.amount - a.amount);
  }, [activeMonthTransactions]);

  // Couple breakdown for active month (Lucas vs Esposa)
  const coupleMonthBreakdown = useMemo(() => {
    let lucasTotal = 0;
    let esposaTotal = 0;
    let casalTotal = 0;

    activeMonthTransactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        const name = (t.createdByName || '').toLowerCase();
        if (name.includes('esposa')) {
          esposaTotal += t.amount;
        } else if (name.includes('casal')) {
          casalTotal += t.amount;
        } else {
          lucasTotal += t.amount;
        }
      });

    return {
      lucasTotal,
      esposaTotal,
      casalTotal,
      total: lucasTotal + esposaTotal + casalTotal || 1,
    };
  }, [activeMonthTransactions]);

  // Yearly max for scaling 12 months chart
  const maxYearlyValue = Math.max(
    ...monthlySummaries.map((m) => Math.max(m.plannedIncome, m.plannedExpense, m.actualIncome || 0, m.actualExpense || 0)),
    1000
  );

  return (
    <div className="space-y-6">
      
      {/* Top Header Card */}
      <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                Relatórios Financeiros
              </span>
              <span className="text-xs text-neutral-400">·</span>
              <span className="text-xs font-semibold text-neutral-700">
                Evolução Detalhada
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-neutral-900 mt-1">
              Acompanhamento de Gastos e Renda
            </h2>
          </div>

          {/* Scope Switcher: No Mês vs No Ano */}
          <div className="flex p-1 bg-neutral-100 rounded-xl self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setViewScope('month')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                viewScope === 'month'
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Evolução Dentro do Mês (Dia a Dia)
            </button>
            <button
              type="button"
              onClick={() => setViewScope('year')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                viewScope === 'year'
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Evolução no Ano (12 Meses)
            </button>
          </div>
        </div>

        {/* Month Selector Strip */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-3">
          <span className="text-xs font-semibold text-neutral-500 mr-1 shrink-0">
            {viewScope === 'month' ? 'Mês em Análise:' : 'Filtro de Destaque:'}
          </span>
          {MONTH_NAMES.map((name, idx) => {
            const isSelected = activeMonth === idx;
            const isCurrent = idx === new Date().getMonth();
            return (
              <button
                key={name}
                type="button"
                onClick={() => setActiveMonth(idx as MonthIndex)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors shrink-0 flex items-center gap-1 ${
                  isSelected
                    ? 'bg-emerald-700 text-white'
                    : isCurrent
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-neutral-100 text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <span>{MONTH_FULL_NAMES[idx]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SCOPE 1: EVOLUÇÃO DENTRO DO MÊS (DIA A DIA)                               */}
      {/* ========================================================================= */}
      {viewScope === 'month' && (
        <div className="space-y-6">
          
          {/* Month KPI Metric Cards (Single-elevation, clean tabular numbers) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            
            <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 block">
                Total Gasto em {MONTH_FULL_NAMES[activeMonth]}
              </span>
              <div className="text-2xl font-bold font-mono tabular-nums text-neutral-900 mt-1">
                {formatCurrency(monthTotalActualExpense)}
              </div>
              <div className="mt-1 text-[11px] text-neutral-500">
                {activeMonthTransactions.filter((t) => t.type === 'expense').length} compras realizadas
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 block">
                Total Recebido (Salário/Extras)
              </span>
              <div className="text-2xl font-bold font-mono tabular-nums text-emerald-700 mt-1">
                +{formatCurrency(monthTotalActualIncome)}
              </div>
              <div className="mt-1 text-[11px] text-neutral-500">
                Sobra no mês:{' '}
                <strong className={monthTotalActualIncome >= monthTotalActualExpense ? 'text-emerald-700 font-mono' : 'text-rose-600 font-mono'}>
                  {formatCurrency(monthTotalActualIncome - monthTotalActualExpense)}
                </strong>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 block">
                Média Diária de Gastos
              </span>
              <div className="text-2xl font-bold font-mono tabular-nums text-neutral-900 mt-1">
                {formatCurrency(avgDailyExpense)}
                <span className="text-xs font-normal text-neutral-400">/dia</span>
              </div>
              <div className="mt-1 text-[11px] text-neutral-500">
                Baseado em {elapsedDays} dias decorridos
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 block">
                Pico Máximo de Gasto
              </span>
              <div className="text-2xl font-bold font-mono tabular-nums text-neutral-900 mt-1">
                {peakDay && peakDay.expenseAmount > 0 ? formatCurrency(peakDay.expenseAmount) : 'R$ 0,00'}
              </div>
              <div className="mt-1 text-[11px] text-neutral-500">
                {peakDay && peakDay.expenseAmount > 0 ? `Ocorrido no dia ${peakDay.day}` : 'Sem gastos registrados'}
              </div>
            </div>

          </div>

          {/* Gráfico 1: Curva de Evolução Acumulada no Mês (Burn-up) */}
          <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-100">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  <span>Curva de Gastos Acumulados no Mês (Dia 1 ao Dia {daysInMonth})</span>
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Veja a velocidade com que seu dinheiro é gasto dia a dia durante o mês
                </p>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-600" />
                  <span className="text-neutral-600">Gasto Acumulado Real</span>
                </div>
                {monthPlannedExpense > 0 && (
                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-0.5 border-t-2 border-dashed border-neutral-400" />
                    <span className="text-neutral-500">Teto Planejado ({formatCurrency(monthPlannedExpense)})</span>
                  </div>
                )}
              </div>
            </div>

            {/* SVG Interactive Line Chart */}
            <div className="relative pt-2">
              <div className="w-full h-56 sm:h-64">
                <svg
                  viewBox={`0 0 ${daysInMonth * 20} 180`}
                  className="w-full h-full overflow-visible"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="monthGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#059669" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#059669" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal grid lines */}
                  {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
                    const y = 160 - pct * 140;
                    return (
                      <line
                        key={pct}
                        x1="0"
                        y1={y}
                        x2={daysInMonth * 20}
                        y2={y}
                        stroke="#f1f5f9"
                        strokeWidth="1"
                      />
                    );
                  })}

                  {/* Planned budget ceiling line */}
                  {monthPlannedExpense > 0 && (
                    <line
                      x1="0"
                      y1={Math.max(10, 160 - (monthPlannedExpense / maxCumulativeValue) * 140)}
                      x2={daysInMonth * 20}
                      y2={Math.max(10, 160 - (monthPlannedExpense / maxCumulativeValue) * 140)}
                      stroke="#94a3b8"
                      strokeWidth="1.5"
                      strokeDasharray="4 4"
                    />
                  )}

                  {/* Area fill */}
                  <polygon
                    fill="url(#monthGradient)"
                    points={`
                      0,160 
                      ${dailyBreakdown
                        .map((d, i) => {
                          const x = i * 20 + 10;
                          const y = 160 - (d.cumulativeExpense / maxCumulativeValue) * 140;
                          return `${x},${y}`;
                        })
                        .join(' ')} 
                      ${(daysInMonth - 1) * 20 + 10},160
                    `}
                  />

                  {/* Primary cumulative line */}
                  <polyline
                    fill="none"
                    stroke="#059669"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={dailyBreakdown
                      .map((d, i) => {
                        const x = i * 20 + 10;
                        const y = 160 - (d.cumulativeExpense / maxCumulativeValue) * 140;
                        return `${x},${y}`;
                      })
                      .join(' ')}
                  />

                  {/* Day Points */}
                  {dailyBreakdown.map((d, i) => {
                    const x = i * 20 + 10;
                    const y = 160 - (d.cumulativeExpense / maxCumulativeValue) * 140;
                    const isHovered = hoveredDay === d.day;
                    const hasSpike = d.expenseAmount > 0;

                    return (
                      <g key={d.day}>
                        <circle
                          cx={x}
                          cy={y}
                          r={isHovered ? 6 : hasSpike ? 3.5 : 2}
                          fill={isHovered ? '#047857' : hasSpike ? '#059669' : '#a7f3d0'}
                          stroke="#ffffff"
                          strokeWidth="1.5"
                          className="cursor-pointer transition-all"
                          onMouseEnter={() => setHoveredDay(d.day)}
                          onMouseLeave={() => setHoveredDay(null)}
                        />
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Day numbers labels along bottom */}
              <div className="flex justify-between text-[10px] font-mono text-neutral-400 pt-2 border-t border-neutral-100">
                <span>Dia 01</span>
                <span>Dia 05</span>
                <span>Dia 10</span>
                <span>Dia 15</span>
                <span>Dia 20</span>
                <span>Dia 25</span>
                <span>Dia {daysInMonth}</span>
              </div>

              {/* Tooltip Card if day hovered */}
              {hoveredDay !== null && (
                <div className="mt-3 p-3 bg-neutral-900 text-white rounded-xl text-xs flex items-center justify-between gap-4 animate-in fade-in duration-100">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-400" />
                    <span>
                      Dia <strong>{hoveredDay} de {MONTH_FULL_NAMES[activeMonth]}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-4 font-mono">
                    <span>
                      Gasto no dia:{' '}
                      <strong className="text-emerald-400">
                        {formatCurrency(dailyBreakdown[hoveredDay - 1]?.expenseAmount || 0)}
                      </strong>
                    </span>
                    <span>
                      Acumulado até aqui:{' '}
                      <strong>
                        {formatCurrency(dailyBreakdown[hoveredDay - 1]?.cumulativeExpense || 0)}
                      </strong>
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Gráfico 2: Histograma de Barras Diárias (Onde ocorreram os gastos) */}
          <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-neutral-700" />
                  <span>Gastos Diários Individuais (Picos de Compras)</span>
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Veja exatamente em quais dias do mês o dinheiro saiu da sua conta
                </p>
              </div>
              <span className="text-xs font-mono text-neutral-400">
                Máximo diário: {formatCurrency(maxDayExpense)}
              </span>
            </div>

            {/* Daily Bars */}
            <div className="h-32 flex items-end gap-1 sm:gap-1.5 pt-4 pb-1 overflow-x-auto">
              {dailyBreakdown.map((d) => {
                const heightPct = maxDayExpense > 0 ? (d.expenseAmount / maxDayExpense) * 100 : 0;
                const isPeak = d.expenseAmount === peakDay?.expenseAmount && d.expenseAmount > 0;
                return (
                  <div
                    key={d.day}
                    className="flex-1 flex flex-col items-center gap-1 min-w-[8px] sm:min-w-[12px] group relative cursor-pointer"
                    onMouseEnter={() => setHoveredDay(d.day)}
                    onMouseLeave={() => setHoveredDay(null)}
                  >
                    {/* Tooltip on hover */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full mb-1 z-20 pointer-events-none bg-neutral-900 text-white text-[10px] font-mono py-1 px-1.5 rounded whitespace-nowrap shadow-md">
                      Dia {d.day}: {formatCurrency(d.expenseAmount)}
                    </div>

                    <div
                      className={`w-full rounded-t-xs transition-all ${
                        isPeak
                          ? 'bg-rose-500'
                          : d.expenseAmount > 0
                          ? 'bg-neutral-800 hover:bg-emerald-600'
                          : 'bg-neutral-200/50'
                      }`}
                      style={{ height: `${Math.max(4, heightPct)}%` }}
                    />
                    <span className="text-[9px] font-mono text-neutral-400 group-hover:text-neutral-900">
                      {d.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Gráfico 3 & 4: Distribuição por Categorias & Quem Gastou (Casal) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Categorias mais gastas */}
            <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                  <PieIcon className="w-4 h-4 text-emerald-600" />
                  <span>Maiores Categorias de Despesas no Mês</span>
                </h3>
                <span className="text-xs font-mono text-neutral-500">
                  {monthCategoryBreakdown.length} categorias
                </span>
              </div>

              {monthCategoryBreakdown.length === 0 ? (
                <div className="py-8 text-center text-xs text-neutral-400">
                  Nenhuma despesa lançada neste mês.
                </div>
              ) : (
                <div className="space-y-3">
                  {monthCategoryBreakdown.map((cat, idx) => {
                    const pct = monthTotalActualExpense > 0 ? (cat.amount / monthTotalActualExpense) * 100 : 0;
                    return (
                      <div key={cat.name} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-neutral-800 truncate">
                            {idx + 1}. {cat.name}
                          </span>
                          <div className="flex items-center gap-2 font-mono">
                            <span className="text-neutral-400 text-[11px]">{pct.toFixed(1)}%</span>
                            <span className="font-bold text-neutral-900">{formatCurrency(cat.amount)}</span>
                          </div>
                        </div>
                        {/* Progress Bar */}
                        <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-neutral-900 rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Divisão do Casal (Lucas vs Esposa) */}
            <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-pink-600" />
                  <span>Divisão de Gastos do Casal no Mês</span>
                </h3>
                <span className="text-xs text-neutral-500 font-medium">
                  Transparência a dois
                </span>
              </div>

              <div className="space-y-4 pt-1">
                {/* Visual Ratio Bar */}
                <div className="h-3 rounded-full bg-neutral-100 flex overflow-hidden">
                  <div
                    className="bg-neutral-900 transition-all"
                    style={{ width: `${(coupleMonthBreakdown.lucasTotal / coupleMonthBreakdown.total) * 100}%` }}
                    title={`Lucas: ${formatCurrency(coupleMonthBreakdown.lucasTotal)}`}
                  />
                  <div
                    className="bg-pink-600 transition-all"
                    style={{ width: `${(coupleMonthBreakdown.esposaTotal / coupleMonthBreakdown.total) * 100}%` }}
                    title={`Esposa: ${formatCurrency(coupleMonthBreakdown.esposaTotal)}`}
                  />
                  <div
                    className="bg-neutral-400 transition-all"
                    style={{ width: `${(coupleMonthBreakdown.casalTotal / coupleMonthBreakdown.total) * 100}%` }}
                    title={`Conjunto: ${formatCurrency(coupleMonthBreakdown.casalTotal)}`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200">
                    <span className="text-neutral-500 block text-[11px]">Gastos de Lucas</span>
                    <span className="text-base font-bold font-mono text-neutral-900 mt-0.5 block">
                      {formatCurrency(coupleMonthBreakdown.lucasTotal)}
                    </span>
                    <span className="text-[11px] font-mono text-neutral-400">
                      {((coupleMonthBreakdown.lucasTotal / coupleMonthBreakdown.total) * 100).toFixed(0)}% do total
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-pink-50/50 border border-pink-200">
                    <span className="text-pink-700 block text-[11px]">Gastos da Esposa</span>
                    <span className="text-base font-bold font-mono text-pink-900 mt-0.5 block">
                      {formatCurrency(coupleMonthBreakdown.esposaTotal)}
                    </span>
                    <span className="text-[11px] font-mono text-pink-700/70">
                      {((coupleMonthBreakdown.esposaTotal / coupleMonthBreakdown.total) * 100).toFixed(0)}% do total
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-neutral-500 leading-relaxed">
                  Ambos os cônjuges podem lançar gastos pelo celular simultaneamente. Todas as despesas e receitas sincronizam na nuvem em tempo real.
                </p>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* SCOPE 2: EVOLUÇÃO NO ANO (12 MESES)                                       */}
      {/* ========================================================================= */}
      {viewScope === 'year' && (
        <div className="space-y-6">
          
          {/* Annual Big Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-2xs">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 block">
                Total de Receitas do Ano
              </span>
              <div className="text-2xl font-bold font-mono tabular-nums text-emerald-700 mt-1">
                +{formatCurrency(annualSummary.totalPlannedIncome || annualSummary.totalActualIncome || 0)}
              </div>
              <p className="text-xs text-neutral-500 mt-1">
                Salários, vales, horas extras e rendimentos
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-2xs">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 block">
                Total de Despesas do Ano
              </span>
              <div className="text-2xl font-bold font-mono tabular-nums text-neutral-900 mt-1">
                -{formatCurrency(annualSummary.totalPlannedExpense || annualSummary.totalActualExpense || 0)}
              </div>
              <p className="text-xs text-neutral-500 mt-1">
                Custo de vida familiar ao longo dos 12 meses
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-2xs">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 block">
                Sobra Líquida Acumulada
              </span>
              <div className="text-2xl font-bold font-mono tabular-nums text-emerald-800 mt-1">
                {formatCurrency(annualSummary.totalPlannedBalance || annualSummary.totalActualBalance || 0)}
              </div>
              <p className="text-xs text-neutral-500 mt-1">
                Taxa de retenção:{' '}
                <strong className="text-emerald-700">{formatPercent(annualSummary.savingsRate)}</strong>
              </p>
            </div>
          </div>

          {/* Gráfico 12 Meses: Comparativo Entradas vs Saídas */}
          <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-100">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-600" />
                  <span>Fluxo Mensal (Janeiro a Dezembro)</span>
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Comparação direta de Entradas vs Despesas e Sobra Líquida mês a mês
                </p>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-xs bg-emerald-600" />
                  <span className="text-neutral-600">Entradas</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-xs bg-neutral-800" />
                  <span className="text-neutral-600">Despesas</span>
                </div>
              </div>
            </div>

            {/* 12 Months Bars */}
            <div className="h-48 sm:h-56 flex items-end gap-2 sm:gap-4 pt-4 pb-1 border-b border-neutral-100">
              {monthlySummaries.map((m) => {
                const income = m.plannedIncome || m.actualIncome;
                const expense = m.plannedExpense || m.actualExpense;
                const incomeHeight = maxYearlyValue > 0 ? (income / maxYearlyValue) * 100 : 0;
                const expenseHeight = maxYearlyValue > 0 ? (expense / maxYearlyValue) * 100 : 0;

                return (
                  <div key={m.monthName} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                    <div className="w-full flex items-end justify-center gap-1 h-full">
                      {/* Income Bar */}
                      <div
                        className="w-1/2 max-w-[20px] bg-emerald-600 hover:bg-emerald-700 rounded-t-xs transition-all"
                        style={{ height: `${Math.max(4, incomeHeight)}%` }}
                        title={`${m.monthName} - Entradas: ${formatCurrency(income)}`}
                      />
                      {/* Expense Bar */}
                      <div
                        className="w-1/2 max-w-[20px] bg-neutral-800 hover:bg-neutral-900 rounded-t-xs transition-all"
                        style={{ height: `${Math.max(4, expenseHeight)}%` }}
                        title={`${m.monthName} - Despesas: ${formatCurrency(expense)}`}
                      />
                    </div>
                    <span className="text-[11px] font-mono text-neutral-500 font-semibold group-hover:text-neutral-900">
                      {m.monthName}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tabela Sintética dos 12 Meses (Zero poluição visual, alta legibilidade) */}
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-neutral-900">
                Tabela Consolidada de Evolução (Jan a Dez)
              </h3>
              <span className="text-xs text-neutral-500">
                Valores em Reais (R$)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-neutral-50 text-neutral-600 font-semibold border-b border-neutral-200">
                  <tr>
                    <th className="py-2.5 px-4">Mês</th>
                    <th className="py-2.5 px-4 text-right">Entradas</th>
                    <th className="py-2.5 px-4 text-right">Despesas</th>
                    <th className="py-2.5 px-4 text-right">Sobra Líquida</th>
                    <th className="py-2.5 px-4 text-right">Taxa Poupança</th>
                    <th className="py-2.5 px-4 text-right">Saldo Acumulado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {monthlySummaries.map((m) => {
                    const inc = m.plannedIncome || m.actualIncome;
                    const exp = m.plannedExpense || m.actualExpense;
                    const bal = inc - exp;
                    return (
                      <tr key={m.monthIndex} className="hover:bg-neutral-50/70 transition-colors">
                        <td className="py-2.5 px-4 font-bold text-neutral-900">
                          {MONTH_FULL_NAMES[m.monthIndex]}
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono tabular-nums text-emerald-700 font-medium">
                          {formatCurrency(inc)}
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono tabular-nums text-neutral-900 font-medium">
                          {formatCurrency(exp)}
                        </td>
                        <td className={`py-2.5 px-4 text-right font-mono tabular-nums font-bold ${
                          bal >= 0 ? 'text-emerald-700' : 'text-rose-600'
                        }`}>
                          {formatCurrency(bal)}
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono tabular-nums text-neutral-600">
                          {m.savingsRate.toFixed(1)}%
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono tabular-nums font-bold text-neutral-900">
                          {formatCurrency(m.cumulativePlannedBalance)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
