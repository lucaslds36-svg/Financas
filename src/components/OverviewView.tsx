import React, { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Calendar,
  CalendarRange,
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet, 
  Receipt, 
  BarChart3, 
  Plus,
  CheckCircle2,
  AlertTriangle,
  Heart,
  Users,
  Copy,
  Check,
  Sparkles,
  ChevronRight,
  Layers,
  FileSpreadsheet
} from 'lucide-react';
import { 
  FinancialHealthStatus, 
  MonthSummary, 
  RealTransaction, 
  BudgetCategory,
  RealCashPosition,
  MonthIndex,
  MONTH_NAMES,
  MONTH_FULL_NAMES
} from '../types/budget';
import { formatCurrency, formatPercent, formatDateBR } from '../utils/formatters';
import { ActiveTab } from '../types/navigation';

interface OverviewViewProps {
  selectedYear: number;
  availableYears: number[];
  onSelectYear: (year: number) => void;
  onOpenYearRollover: () => void;
  realCashPosition: RealCashPosition;
  onUpdateInitialAccountBalance: (val: number) => void;
  financialHealth: FinancialHealthStatus;
  annualSummary: {
    initialBalance?: number;
    totalPlannedIncome: number;
    totalPlannedExpense: number;
    totalPlannedBalance: number;
    finalCumulativePlanned?: number;
    totalActualIncome: number;
    totalActualExpense: number;
    totalActualBalance: number;
    finalCumulativeActual?: number;
    savingsRate: number;
  };
  monthlySummaries: MonthSummary[];
  recentTransactions: RealTransaction[];
  categories?: BudgetCategory[];
  onNavigateTab: (tab: ActiveTab) => void;
  onOpenNewTransaction: () => void;
  onOpenFamilySync?: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  selectedYear,
  availableYears,
  onSelectYear,
  onOpenYearRollover,
  realCashPosition,
  onUpdateInitialAccountBalance,
  financialHealth,
  annualSummary,
  monthlySummaries,
  recentTransactions,
  categories = [],
  onNavigateTab,
  onOpenNewTransaction,
  onOpenFamilySync,
}) => {
  const { user, family, familyMembers } = useAuth();
  const [copiedCode, setCopiedCode] = useState(false);

  // View Scope: 'month' (default - as requested) vs 'year' (consolidated 12 months)
  const [viewScope, setViewScope] = useState<'month' | 'year'>('month');

  // Selected Month index (0 to 11). Defaults to November (index 10) for 2026 sample data or real calendar month
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<MonthIndex>(() => {
    const today = new Date();
    if (selectedYear === 2026) {
      return 10; // Novembro como mês padrão da planilha estruturada
    }
    const calMonth = today.getMonth();
    return (calMonth >= 0 && calMonth <= 11 ? calMonth : 0) as MonthIndex;
  });

  const handleCopyCode = () => {
    if (!family?.code) return;
    navigator.clipboard.writeText(family.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Month data
  const currentMonthSummary = monthlySummaries[selectedMonthIndex] || monthlySummaries[0];
  const selectedMonthFullName = MONTH_FULL_NAMES[selectedMonthIndex];
  const isSelectedMonthCurrentCalendar = useMemo(() => {
    const today = new Date();
    return today.getFullYear() === selectedYear && today.getMonth() === selectedMonthIndex;
  }, [selectedYear, selectedMonthIndex]);

  // Transactions specifically for the selected month
  const monthTransactions = useMemo(() => {
    return recentTransactions.filter((tx) => {
      const txYear = parseInt(tx.date.slice(0, 4), 10);
      const matchesYear = isNaN(txYear) || txYear === selectedYear;
      return matchesYear && tx.month === selectedMonthIndex;
    });
  }, [recentTransactions, selectedYear, selectedMonthIndex]);

  // Category breakdown for the selected month
  const monthCategoriesBreakdown = useMemo(() => {
    const expenseCats = categories.filter((c) => c.type === 'expense');
    return expenseCats.map((cat) => {
      const planned = cat.items.reduce((s, it) => s + (it.values[selectedMonthIndex] || 0), 0);
      const actual = monthTransactions
        .filter((tx) => tx.categoryId === cat.id || tx.categoryName.toLowerCase() === cat.name.toLowerCase())
        .reduce((s, tx) => s + tx.amount, 0);

      const percent = planned > 0 ? (actual / planned) * 100 : actual > 0 ? 100 : 0;
      const diff = planned - actual;

      return {
        id: cat.id,
        name: cat.name,
        planned,
        actual,
        percent,
        diff,
      };
    }).filter((c) => c.planned > 0 || c.actual > 0);
  }, [categories, selectedMonthIndex, monthTransactions]);

  // Overall month budget usage percentage
  const monthExpensePercent = currentMonthSummary.plannedExpense > 0
    ? (currentMonthSummary.actualExpense / currentMonthSummary.plannedExpense) * 100
    : currentMonthSummary.actualExpense > 0 ? 100 : 0;

  const monthBudgetRemaining = currentMonthSummary.plannedExpense - currentMonthSummary.actualExpense;

  const getTierColor = (tier: FinancialHealthStatus['tier']) => {
    switch (tier) {
      case 'Excelente':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'Saudável':
        return 'text-teal-700 bg-teal-50 border-teal-200';
      case 'Atenção':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'Crítico':
        return 'text-rose-700 bg-rose-50 border-rose-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Year Selector & Rollover Banner */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-neutral-200 shadow-xs">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-neutral-500">Ano do Orçamento:</span>
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
            {availableYears.map((y) => (
              <button
                key={y}
                onClick={() => onSelectYear(y)}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
                  selectedYear === y
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'bg-neutral-100 text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Ano {y}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {annualSummary.initialBalance && annualSummary.initialBalance > 0 ? (
            <div className="text-xs text-neutral-500 flex items-center gap-1.5">
              <span>Saldo Inicial Herdado:</span>
              <span className="font-mono font-bold text-emerald-700">
                {formatCurrency(annualSummary.initialBalance)}
              </span>
            </div>
          ) : null}
          <button
            onClick={onOpenYearRollover}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors whitespace-nowrap"
          >
            <span>Virada de Ano / Novo Orçamento</span>
          </button>
        </div>
      </div>

      {/* 2. Couple Shared Budget Banner */}
      {user && family ? (
        <div className="bg-gradient-to-r from-pink-50/80 via-white to-emerald-50/80 border border-pink-200/80 rounded-xl p-4 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-pink-100/80 text-pink-700 flex items-center justify-center shrink-0">
              <Heart className="w-4 h-4 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-neutral-900">
                  {family.name}
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full">
                  <Sparkles className="w-2.5 h-2.5" />
                  Sincronizado ao Vivo
                </span>
              </div>
              <p className="text-[11px] text-neutral-600 mt-0.5">
                {familyMembers.length > 1
                  ? `Conectados: ${familyMembers.map((m) => m.displayName.split(' ')[0]).join(' & ')} · Ambos podem lançar gastos no celular`
                  : `Compartilhe o código com sua esposa para ela lançar gastos junto com você.`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-lg border border-neutral-200 shadow-2xs text-xs">
              <span className="text-[10px] uppercase font-semibold text-neutral-400">Código:</span>
              <span className="font-mono font-bold text-emerald-800 tracking-wider">{family.code}</span>
              <button
                onClick={handleCopyCode}
                title="Copiar código para enviar para a esposa"
                className="p-1 text-neutral-400 hover:text-emerald-700 hover:bg-neutral-50 rounded"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            <button
              onClick={onOpenFamilySync}
              className="px-3 py-1.5 text-xs font-semibold text-neutral-700 bg-white hover:bg-neutral-50 border border-neutral-300 rounded-lg transition-colors whitespace-nowrap shadow-2xs"
            >
              Gerenciar Casal
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-emerald-50/90 via-teal-50/50 to-white border border-emerald-200/90 rounded-xl p-4 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-neutral-900">
                Acesso para Você e sua Esposa
              </h3>
              <p className="text-[11px] text-neutral-600 mt-0.5">
                Conecte com sua conta Google para sincronizar os gastos do casal no celular em tempo real.
              </p>
            </div>
          </div>

          <button
            onClick={onOpenFamilySync}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors whitespace-nowrap"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Conectar Orçamento do Casal</span>
          </button>
        </div>
      )}

      {/* 3. PROMINENT SCOPE SWITCHER: Mês Atual vs Ano Todo */}
      <div className="bg-neutral-900 text-white p-2 rounded-2xl shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-1 bg-neutral-800/90 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setViewScope('month')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
              viewScope === 'month'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-neutral-300 hover:text-white hover:bg-neutral-700/60'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Status do Mês ({selectedMonthFullName})</span>
          </button>

          <button
            onClick={() => setViewScope('year')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
              viewScope === 'year'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-neutral-300 hover:text-white hover:bg-neutral-700/60'
            }`}
          >
            <CalendarRange className="w-4 h-4" />
            <span>Ano Todo ({selectedYear} Consolidado)</span>
          </button>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2 px-2 text-xs text-neutral-300">
          <span className="text-[11px] text-neutral-400">Modo de Exibição:</span>
          <span className="font-semibold text-emerald-400">
            {viewScope === 'month' ? `Detalhamento de ${selectedMonthFullName}` : `Consolidado de 12 Meses`}
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. CONTENT ACCORDING TO SCOPE: 'month' vs 'year'                         */}
      {/* ========================================================================= */}

      {viewScope === 'month' ? (
        /* ===================================================================== */
        /* MONTH SCOPE: STATUS DO MÊS ATUAL (OR SELECTED MONTH)                  */
        /* ===================================================================== */
        <div className="space-y-6">
          {/* Quick Month Selector Carousel */}
          <div className="bg-white p-3 rounded-xl border border-neutral-200 shadow-xs">
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-xs font-semibold text-neutral-600 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                Selecione o Mês para Visualizar:
              </span>
              {selectedMonthIndex !== 10 && (
                <button
                  onClick={() => setSelectedMonthIndex(10)}
                  className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 underline"
                >
                  Voltar para Novembro (Mês de Referência)
                </button>
              )}
            </div>

            <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5">
              {MONTH_NAMES.map((mName, idx) => {
                const isSelected = selectedMonthIndex === idx;
                const mSum = monthlySummaries[idx];
                const hasTransactions = recentTransactions.some((t) => t.month === idx);

                return (
                  <button
                    key={mName}
                    onClick={() => setSelectedMonthIndex(idx as MonthIndex)}
                    className={`relative py-2 px-1 text-center rounded-lg border transition-all text-xs flex flex-col items-center justify-center ${
                      isSelected
                        ? 'bg-emerald-700 text-white border-emerald-700 font-bold shadow-xs scale-[1.02]'
                        : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border-neutral-200 font-medium'
                    }`}
                  >
                    <span>{mName}</span>
                    {hasTransactions && (
                      <span
                        className={`w-1.5 h-1.5 rounded-full mt-1 ${
                          isSelected ? 'bg-white' : 'bg-emerald-600'
                        }`}
                        title="Possui lançamentos reais"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Month Status Hero Card */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-5 sm:p-6 shadow-xs overflow-hidden">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
              <div className="space-y-2">
                <div className="flex items-center flex-wrap gap-2">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-neutral-900 text-white">
                    {selectedMonthFullName} de {selectedYear}
                  </span>
                  {selectedMonthIndex === 10 && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Mês Ativo da Planilha
                    </span>
                  )}
                  {isSelectedMonthCurrentCalendar && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-teal-100 text-teal-800 border border-teal-200">
                      Mês Atual do Calendário
                    </span>
                  )}
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-md border ${
                      monthExpensePercent <= 100
                        ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                        : 'text-rose-700 bg-rose-50 border-rose-200'
                    }`}
                  >
                    {monthExpensePercent <= 100 ? 'Orçamento Sob Controle' : 'Alerta: Orçamento Ultrapassado'}
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
                  Status Financeiro do Mês: {selectedMonthFullName}
                </h2>

                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed max-w-2xl">
                  {monthExpensePercent <= 100 ? (
                    <>
                      Você gastou{' '}
                      <strong className="text-neutral-900 font-mono">
                        {formatCurrency(currentMonthSummary.actualExpense)}
                      </strong>{' '}
                      de um teto planejado de{' '}
                      <strong className="text-neutral-900 font-mono">
                        {formatCurrency(currentMonthSummary.plannedExpense)}
                      </strong>{' '}
                      ({monthExpensePercent.toFixed(1)}% utilizado). Restam{' '}
                      <strong className="text-emerald-700 font-mono">
                        {formatCurrency(monthBudgetRemaining)}
                      </strong>{' '}
                      disponíveis para gastar neste mês.
                    </>
                  ) : (
                    <>
                      Atenção: seus gastos reais de{' '}
                      <strong className="text-rose-700 font-mono">
                        {formatCurrency(currentMonthSummary.actualExpense)}
                      </strong>{' '}
                      ultrapassaram a previsão mensal de{' '}
                      <strong className="text-neutral-900 font-mono">
                        {formatCurrency(currentMonthSummary.plannedExpense)}
                      </strong>{' '}
                      em{' '}
                      <strong className="text-rose-700 font-mono">
                        {formatCurrency(Math.abs(monthBudgetRemaining))}
                      </strong>.
                    </>
                  )}
                </p>
              </div>

              {/* Quick Actions Cluster */}
              <div className="flex sm:flex-col gap-2 shrink-0">
                <button
                  onClick={onOpenNewTransaction}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Novo Gasto no Mês</span>
                </button>
                <button
                  onClick={() => onNavigateTab('transactions')}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1 px-3.5 py-2 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors"
                >
                  <span>Ver Todos Lançamentos</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Visual Budget Progress Bar */}
            <div className="mt-5 pt-4 border-t border-neutral-100 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-neutral-700">Consumo do Orçamento de Despesas:</span>
                <span className="font-mono font-bold text-neutral-900">
                  {formatCurrency(currentMonthSummary.actualExpense)} / {formatCurrency(currentMonthSummary.plannedExpense)} ({monthExpensePercent.toFixed(1)}%)
                </span>
              </div>
              <div className="w-full h-3 bg-neutral-100 rounded-full overflow-hidden p-0.5 border border-neutral-200">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    monthExpensePercent > 100
                      ? 'bg-rose-500'
                      : monthExpensePercent > 80
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(monthExpensePercent, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* 4 Core Financial Totals FOR THE MONTH */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Saldo de Caixa Real em Conta (Hoje) */}
            <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-neutral-500">Saldo Real em Conta</span>
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Wallet className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl font-bold font-mono tabular-nums text-emerald-700 mt-1">
                {formatCurrency(realCashPosition.currentRealBalance)}
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-neutral-100 text-[11px] text-neutral-500">
                <span>Disponível em banco</span>
                <button
                  onClick={() => {
                    const promptVal = prompt(
                      'Informe o saldo inicial da sua conta bancária (ponto de partida):',
                      realCashPosition.initialAccountBalance.toString()
                    );
                    if (promptVal !== null) {
                      const parsed = parseFloat(promptVal.replace(',', '.')) || 0;
                      onUpdateInitialAccountBalance(parsed);
                    }
                  }}
                  className="text-emerald-700 font-semibold hover:underline"
                >
                  Ajustar
                </button>
              </div>
            </div>

            {/* Receitas do Mês */}
            <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-neutral-500">Receitas ({MONTH_NAMES[selectedMonthIndex]})</span>
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl font-bold font-mono tabular-nums text-neutral-900 mt-1">
                {formatCurrency(currentMonthSummary.actualIncome > 0 ? currentMonthSummary.actualIncome : currentMonthSummary.plannedIncome)}
              </div>
              <div className="mt-2 text-xs text-neutral-500 flex items-center justify-between">
                <span>Planejado: {formatCurrency(currentMonthSummary.plannedIncome)}</span>
                <span className="text-emerald-600 font-medium">
                  {currentMonthSummary.actualIncome > 0 ? 'Recebido' : 'Previsto'}
                </span>
              </div>
            </div>

            {/* Despesas do Mês */}
            <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-neutral-500">Despesas ({MONTH_NAMES[selectedMonthIndex]})</span>
                <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                  <ArrowDownRight className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl font-bold font-mono tabular-nums text-neutral-900 mt-1">
                {formatCurrency(currentMonthSummary.actualExpense)}
              </div>
              <div className="mt-2 text-xs text-neutral-500 flex items-center justify-between">
                <span>Teto: {formatCurrency(currentMonthSummary.plannedExpense)}</span>
                <span className={monthExpensePercent > 100 ? 'text-rose-600 font-bold' : 'text-neutral-500'}>
                  {monthExpensePercent.toFixed(0)}% gasto
                </span>
              </div>
            </div>

            {/* Resultado Líquido do Mês */}
            <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-neutral-500">Saldo do Mês</span>
                <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                  <BarChart3 className="w-4 h-4" />
                </div>
              </div>
              <div
                className={`text-xl font-bold font-mono tabular-nums mt-1 ${
                  currentMonthSummary.actualBalance >= 0 ? 'text-emerald-700' : 'text-rose-600'
                }`}
              >
                {formatCurrency(currentMonthSummary.actualBalance)}
              </div>
              <div className="mt-2 text-xs text-neutral-500 flex items-center justify-between">
                <span>Previsto: {formatCurrency(currentMonthSummary.plannedBalance)}</span>
                <span className="text-neutral-600 font-medium">Sobra do mês</span>
              </div>
            </div>
          </div>

          {/* Month Category Breakdown (Orçado vs Realizado do Mês) */}
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-neutral-900">
                  Despesas de {selectedMonthFullName} por Categoria (Planejado vs Real)
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Veja quanto foi reservado e quanto já foi gasto em cada área da família neste mês
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('spreadsheet')}
                className="self-start sm:self-auto inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
              >
                <span>Ajustar Limites na Planilha</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {monthCategoriesBreakdown.length > 0 ? (
              <div className="divide-y divide-neutral-100">
                {monthCategoriesBreakdown.map((cat) => (
                  <div key={cat.id} className="p-4 sm:px-6 hover:bg-neutral-50/70 transition-colors">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-neutral-900">{cat.name}</span>
                        {cat.actual > cat.planned && (
                          <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded">
                            Estourou
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-neutral-900">
                          {formatCurrency(cat.actual)}
                        </span>
                        <span className="text-neutral-400 mx-1">/</span>
                        <span className="font-mono text-neutral-500">
                          {formatCurrency(cat.planned)}
                        </span>
                      </div>
                    </div>

                    {/* Mini bar */}
                    <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          cat.percent > 100
                            ? 'bg-rose-500'
                            : cat.percent > 85
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(cat.percent, 100)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-neutral-500 mt-1">
                      <span>{cat.percent.toFixed(0)}% do limite utilizado</span>
                      <span className={cat.diff >= 0 ? 'text-emerald-700 font-medium' : 'text-rose-600 font-bold'}>
                        {cat.diff >= 0
                          ? `Restam ${formatCurrency(cat.diff)}`
                          : `Ultrapassado em ${formatCurrency(Math.abs(cat.diff))}`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-neutral-500">
                Nenhum valor orçado para despesas neste mês.
              </div>
            )}
          </div>

          {/* Real Transactions Registered in the Selected Month */}
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-neutral-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-neutral-900">
                  Lançamentos Reais de {selectedMonthFullName}
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  {monthTransactions.length} movimentações registradas neste mês
                </p>
              </div>
              <button
                onClick={onOpenNewTransaction}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Lançar Gasto</span>
              </button>
            </div>

            {monthTransactions.length > 0 ? (
              <div className="divide-y divide-neutral-100">
                {monthTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-4 sm:px-6 flex items-center justify-between hover:bg-neutral-50/70 transition-colors text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                          tx.type === 'income'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {tx.type === 'income' ? '+' : '-'}
                      </div>
                      <div>
                        <div className="font-semibold text-neutral-900 flex items-center gap-1.5">
                          <span>{tx.description}</span>
                          {tx.createdByName && (
                            <span className="text-[10px] text-neutral-500 bg-neutral-100 px-1.5 py-0.2 rounded font-normal">
                              {tx.createdByName.split(' ')[0]}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-neutral-500 mt-0.5">
                          <span>{tx.categoryName}</span>
                          <span className="mx-1">·</span>
                          <span>{tx.itemName}</span>
                          <span className="mx-1">·</span>
                          <span>{formatDateBR(tx.date)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div
                        className={`font-mono tabular-nums font-bold text-sm ${
                          tx.type === 'income' ? 'text-emerald-700' : 'text-neutral-900'
                        }`}
                      >
                        {tx.type === 'income' ? '+ ' : '- '}
                        {formatCurrency(tx.amount)}
                      </div>
                      <div className="text-[10px] text-neutral-400">
                        {tx.status === 'paid' ? 'Efetivado' : 'Pendente'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center space-y-3">
                <Receipt className="w-8 h-8 text-neutral-300 mx-auto" />
                <div className="text-xs text-neutral-600">
                  Nenhum lançamento real registrado ainda para <strong>{selectedMonthFullName}</strong>.
                </div>
                <button
                  onClick={onOpenNewTransaction}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Fazer Primeiro Lançamento</span>
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ===================================================================== */
        /* YEAR SCOPE: ANO TODO (CONSOLIDADO 12 MESES)                            */
        /* ===================================================================== */
        <div className="space-y-6">
          {/* Financial Health Score Hero Card */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs overflow-hidden relative">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-md border ${getTierColor(
                      financialHealth.tier
                    )}`}
                  >
                    Status Geral: {financialHealth.tier} ({financialHealth.score}/100)
                  </span>
                  <span className="text-xs text-neutral-400">·</span>
                  <span className="text-xs text-neutral-500 font-medium">
                    Diagnóstico Anual Consolidado
                  </span>
                </div>

                <h2 className="text-xl font-bold tracking-tight text-neutral-900">
                  Diagnóstico Anual do Seu Planejamento Familiar ({selectedYear})
                </h2>

                <p className="text-sm text-neutral-600 leading-relaxed">
                  Com base no seu orçamento anual estruturado de 12 meses, sua família tem uma capacidade de
                  geração de caixa livre de{' '}
                  <strong className="text-neutral-900 font-mono">
                    {formatCurrency(financialHealth.annualSurplus)}
                  </strong>{' '}
                  ({formatPercent(financialHealth.savingsRateAnnual)} de poupança prevista), garantindo
                  uma segurança equivalente a{' '}
                  <strong className="text-emerald-700 font-semibold font-mono">
                    {financialHealth.emergencyFundMonths.toFixed(1)} meses
                  </strong>{' '}
                  do seu custo de vida mensal.
                </p>
              </div>

              {/* Quick Metrics Cluster */}
              <div className="grid grid-cols-2 gap-3 shrink-0">
                <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200 text-center min-w-[140px]">
                  <span className="text-[11px] font-medium text-neutral-500">Taxa de Poupança Anual</span>
                  <div className="text-lg font-bold font-mono text-emerald-700 mt-0.5">
                    {formatPercent(financialHealth.savingsRateAnnual)}
                  </div>
                  <span className="text-[10px] text-neutral-400">Meta: 20%</span>
                </div>

                <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200 text-center min-w-[140px]">
                  <span className="text-[11px] font-medium text-neutral-500">Cartão de Crédito</span>
                  <div className="text-lg font-bold font-mono text-neutral-800 mt-0.5">
                    {formatPercent(financialHealth.debtRatio)}
                  </div>
                  <span className="text-[10px] text-neutral-400">Sobre renda</span>
                </div>
              </div>
            </div>

            {/* Actionable Health Insights */}
            <div className="mt-6 pt-5 border-t border-neutral-100 grid grid-cols-1 md:grid-cols-2 gap-3">
              {financialHealth.insights.map((insight, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-neutral-50/80 border border-neutral-200/80 flex items-start gap-3"
                >
                  {insight.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <h4 className="text-xs font-bold text-neutral-900">{insight.title}</h4>
                    <p className="text-xs text-neutral-600 mt-0.5 leading-relaxed">
                      {insight.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4 Annual Financial Totals */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Receita Anual */}
            <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-neutral-500">Receitas Totais ({selectedYear})</span>
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl font-bold font-mono tabular-nums text-neutral-900 mt-1">
                {formatCurrency(annualSummary.totalPlannedIncome)}
              </div>
              <p className="mt-2 text-xs text-neutral-500">
                Salários previstos + rendas diversas
              </p>
            </div>

            {/* Despesas Anuais */}
            <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-neutral-500">Despesas Totais ({selectedYear})</span>
                <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                  <ArrowDownRight className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl font-bold font-mono tabular-nums text-neutral-900 mt-1">
                {formatCurrency(annualSummary.totalPlannedExpense)}
              </div>
              <p className="mt-2 text-xs text-neutral-500">
                Compromissos fixos e despesas variáveis
              </p>
            </div>

            {/* Saldo de Caixa Real Atual */}
            <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-neutral-500">Saldo Real em Conta</span>
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Wallet className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl font-bold font-mono tabular-nums text-emerald-700 mt-1">
                {formatCurrency(realCashPosition.currentRealBalance)}
              </div>
              <p className="mt-2 text-xs text-neutral-500">
                Disponível real apurado pelas contas
              </p>
            </div>

            {/* Superávit Anual Previsto */}
            <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-neutral-500">Superávit Anual</span>
                <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                  <BarChart3 className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl font-bold font-mono tabular-nums text-neutral-900 mt-1">
                {formatCurrency(annualSummary.totalPlannedBalance)}
              </div>
              <p className="mt-2 text-xs text-neutral-500">
                Economia líquida prevista para o ano
              </p>
            </div>
          </div>

          {/* Consolidated 12-Month Table / Grid */}
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-neutral-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-neutral-900">
                  Visão Mês a Mês do Ano Todo ({selectedYear})
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Clique em qualquer mês para abrir a visão individual e ver os detalhes
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('spreadsheet')}
                className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
              >
                <span>Abrir Planilha Completa</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 p-4 bg-neutral-50/50">
              {monthlySummaries.map((m) => {
                const isSelected = selectedMonthIndex === m.monthIndex;
                const mPct = m.plannedExpense > 0 ? (m.actualExpense / m.plannedExpense) * 100 : 0;

                return (
                  <div
                    key={m.monthIndex}
                    onClick={() => {
                      setSelectedMonthIndex(m.monthIndex);
                      setViewScope('month');
                    }}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all hover:shadow-xs group ${
                      isSelected
                        ? 'bg-white border-emerald-500 ring-2 ring-emerald-500/20'
                        : 'bg-white border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-neutral-900">{MONTH_FULL_NAMES[m.monthIndex]}</span>
                        {m.monthIndex === 10 && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Mês ativo" />
                        )}
                      </div>
                      <span className="text-[11px] font-semibold text-emerald-700 group-hover:underline flex items-center gap-0.5">
                        Ver Mês
                        <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>

                    <div className="mt-2.5 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between text-neutral-600">
                        <span>Receita Prevista:</span>
                        <span className="font-mono font-medium text-neutral-900">{formatCurrency(m.plannedIncome)}</span>
                      </div>
                      <div className="flex items-center justify-between text-neutral-600">
                        <span>Despesa Prevista:</span>
                        <span className="font-mono font-medium text-neutral-900">{formatCurrency(m.plannedExpense)}</span>
                      </div>
                      <div className="flex items-center justify-between pt-1.5 border-t border-neutral-100 font-semibold">
                        <span>Saldo Previsto:</span>
                        <span className={`font-mono ${m.plannedBalance >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                          {formatCurrency(m.plannedBalance)}
                        </span>
                      </div>
                    </div>

                    {/* Progress bar if there are actual expenses */}
                    {m.actualExpense > 0 && (
                      <div className="mt-2 pt-2 border-t border-neutral-100">
                        <div className="flex items-center justify-between text-[10px] text-neutral-500 mb-1">
                          <span>Gasto Real:</span>
                          <span className="font-mono font-bold text-neutral-800">
                            {formatCurrency(m.actualExpense)} ({mPct.toFixed(0)}%)
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              mPct > 100 ? 'bg-rose-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(mPct, 100)}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 5. STRATEGY SPOTLIGHT CALLOUT (Always visible to guide salary flow) */}
      <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Estratégia Salarial Personalizada
            </span>
            <span className="text-xs text-neutral-400">·</span>
            <span className="text-xs text-neutral-500">Fluxo Quinzenal ou Mensal</span>
          </div>
          <h3 className="text-sm font-bold text-neutral-900">
            Como pagar as contas no Vale (dia 20) vs Pagamento (dia 05)?
          </h3>
          <p className="text-xs text-neutral-600 leading-relaxed max-w-2xl">
            Descubra exatamente quais despesas pagar no adiantamento quinzenal e quais pagar no salário principal, ou como blindar seu dinheiro se receber pagamento único em 4 semanas.
          </p>
        </div>
        <button
          onClick={() => onNavigateTab('strategy')}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors whitespace-nowrap shadow-xs self-start sm:self-auto shrink-0"
        >
          <span>Abrir Estratégia Salarial</span>
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      {/* 6. Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Planilha Anual */}
        <div
          onClick={() => onNavigateTab('spreadsheet')}
          className="bg-white p-5 rounded-xl border border-neutral-200 hover:border-emerald-500/50 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-neutral-400 group-hover:text-emerald-600 transition-colors" />
          </div>
          <h3 className="text-sm font-bold text-neutral-900 mt-3">
            Planilha Anual Completa
          </h3>
          <p className="text-xs text-neutral-500 mt-1">
            Edite os 12 meses, adicione ou remova itens e categorias como na sua planilha original.
          </p>
        </div>

        {/* Card 2: Lançamentos Reais */}
        <div
          onClick={() => onNavigateTab('transactions')}
          className="bg-white p-5 rounded-xl border border-neutral-200 hover:border-emerald-500/50 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Receipt className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-neutral-400 group-hover:text-indigo-600 transition-colors" />
          </div>
          <h3 className="text-sm font-bold text-neutral-900 mt-3">
            Lançamentos de Gastos Reais
          </h3>
          <p className="text-xs text-neutral-500 mt-1">
            Registre suas despesas cotidianas, supermercado, combustível e faturas pagas.
          </p>
        </div>

        {/* Card 3: Planejado vs Real & Evolução */}
        <div
          onClick={() => onNavigateTab('comparison')}
          className="bg-white p-5 rounded-xl border border-neutral-200 hover:border-emerald-500/50 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <BarChart3 className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-neutral-400 group-hover:text-teal-600 transition-colors" />
          </div>
          <h3 className="text-sm font-bold text-neutral-900 mt-3">
            Planejado vs Realizado
          </h3>
          <p className="text-xs text-neutral-500 mt-1">
            Veja desvios, se você economizou ou estourou o orçamento categoria por categoria.
          </p>
        </div>
      </div>
    </div>
  );
};
