import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  ShieldCheck, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet, 
  PiggyBank, 
  AlertCircle, 
  FileSpreadsheet, 
  Receipt, 
  BarChart3, 
  Plus,
  CheckCircle2,
  AlertTriangle,
  Heart,
  Users,
  Copy,
  Check,
  Sparkles
} from 'lucide-react';
import { 
  FinancialHealthStatus, 
  MonthSummary, 
  RealTransaction, 
  BudgetCategory,
  RealCashPosition
} from '../types/budget';
import { formatCurrency, formatPercent, formatDateBR } from '../utils/formatters';
import { ActiveTab } from './Header';

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
  onNavigateTab,
  onOpenNewTransaction,
  onOpenFamilySync,
}) => {
  const { user, family, familyMembers } = useAuth();
  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopyCode = () => {
    if (!family?.code) return;
    navigator.clipboard.writeText(family.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };
  // Current month reference (index 10 = Nov)
  const currentMonthSummary = monthlySummaries[10] || monthlySummaries[0];

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
      {/* Year Selector & Rollover Banner */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-neutral-200 shadow-xs">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-neutral-500">Ano em Exibição:</span>
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

      {/* Couple Shared Budget Banner */}
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
                Status: {financialHealth.tier} ({financialHealth.score}/100)
              </span>
              <span className="text-xs text-neutral-400">·</span>
              <span className="text-xs text-neutral-500 font-medium">
                Diagnóstico Baseado na Sua Planilha
              </span>
            </div>

            <h2 className="text-xl font-bold tracking-tight text-neutral-900">
              Diagnóstico do Seu Planejamento Familiar
            </h2>

            <p className="text-sm text-neutral-600 leading-relaxed">
              Com base no seu orçamento anual estruturado, sua família tem uma capacidade de
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
              <span className="text-[11px] font-medium text-neutral-500">Taxa de Poupança</span>
              <div className="text-lg font-bold font-mono text-emerald-700 mt-0.5">
                {formatPercent(financialHealth.savingsRateAnnual)}
              </div>
              <span className="text-[10px] text-neutral-400">Meta recomendada: 20%</span>
            </div>

            <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200 text-center min-w-[140px]">
              <span className="text-[11px] font-medium text-neutral-500">Cartão de Crédito</span>
              <div className="text-lg font-bold font-mono text-neutral-800 mt-0.5">
                {formatPercent(financialHealth.debtRatio)}
              </div>
              <span className="text-[10px] text-neutral-400">Sobre renda bruta</span>
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

      {/* SALDO DE CAIXA REAL EM CONTA (Movimentações Efetivadas) */}
      <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 text-white p-5 sm:p-6 rounded-2xl shadow-sm border border-neutral-700">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-700/70">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
                Saldo de Caixa Real em Conta
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums text-white mt-1">
              {formatCurrency(realCashPosition.currentRealBalance)}
            </div>
            <p className="text-xs text-neutral-300 mt-1">
              Dinheiro real apurado pelos seus lançamentos efetivados (entradas - saídas pagas)
            </p>
          </div>

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
            className="self-start sm:self-auto px-3 py-1.5 text-xs font-semibold bg-neutral-700 hover:bg-neutral-600 text-neutral-200 rounded-lg transition-colors border border-neutral-600 shrink-0"
          >
            Ajustar Saldo Inicial da Conta
          </button>
        </div>

        {/* 3 Real Breakdown Strips */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 text-xs">
          <div className="bg-neutral-800/80 p-3 rounded-xl border border-neutral-700/60">
            <span className="text-neutral-400 font-medium">Entradas Efetivadas (Pagas):</span>
            <div className="text-base font-bold font-mono text-emerald-400 mt-0.5">
              + {formatCurrency(realCashPosition.totalPaidIncome)}
            </div>
          </div>

          <div className="bg-neutral-800/80 p-3 rounded-xl border border-neutral-700/60">
            <span className="text-neutral-400 font-medium">Saídas Efetivadas (Pagas):</span>
            <div className="text-base font-bold font-mono text-rose-400 mt-0.5">
              - {formatCurrency(realCashPosition.totalPaidExpense)}
            </div>
          </div>

          <div className="bg-neutral-800/80 p-3 rounded-xl border border-neutral-700/60">
            <span className="text-neutral-400 font-medium">Resultado Real do Mês Ativo:</span>
            <div
              className={`text-base font-bold font-mono mt-0.5 ${
                realCashPosition.currentMonthRealBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {formatCurrency(realCashPosition.currentMonthRealBalance)}
            </div>
          </div>
        </div>
      </div>

      {/* STRATEGY SPOTLIGHT CALLOUT */}
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

      {/* 4 Core Financial Totals */}
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
            Disponível real pelas movimentações
          </p>
        </div>

        {/* Gastos Reais Lançados */}
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500">Gastos Reais Lançados</span>
            <div className="w-7 h-7 rounded-lg bg-neutral-100 text-neutral-600 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold font-mono tabular-nums text-neutral-900 mt-1">
            {formatCurrency(annualSummary.totalActualExpense)}
          </div>
          <p className="mt-2 text-xs text-neutral-500">
            Em {recentTransactions.length} lançamentos registrados
          </p>
        </div>
      </div>

      {/* Quick Navigation Cards */}
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

      {/* Recent Transactions Preview */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-neutral-900">
              Últimos Gastos Reais Lançados
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Acompanhe as movimentações financeiras recentes da família
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenNewTransaction}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Novo Lançamento</span>
            </button>
            <button
              onClick={() => onNavigateTab('transactions')}
              className="px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              Ver Todos
            </button>
          </div>
        </div>

        <div className="divide-y divide-neutral-100">
          {recentTransactions.slice(0, 5).map((tx) => (
            <div
              key={tx.id}
              className="px-6 py-3 flex items-center justify-between hover:bg-neutral-50/70 transition-colors text-xs"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                    tx.type === 'income'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-rose-50 text-rose-700'
                  }`}
                >
                  {tx.type === 'income' ? '+' : '-'}
                </div>
                <div>
                  <div className="font-semibold text-neutral-900">{tx.description}</div>
                  <div className="text-[11px] text-neutral-500 mt-0.5">
                    <span>{tx.categoryName}</span>
                    <span className="mx-1">·</span>
                    <span>{tx.itemName}</span>
                    <span className="mx-1">·</span>
                    <span>{formatDateBR(tx.date)}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
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
      </div>
    </div>
  );
};
