import React, { useState, useEffect, useMemo } from 'react';
import { 
  Split, 
  Calendar, 
  CheckCircle2, 
  ShieldAlert, 
  Sparkles, 
  ArrowRight, 
  Wallet, 
  CreditCard, 
  ShoppingCart, 
  TrendingUp,
  Percent,
  Clock,
  Check,
  Plus,
  AlertCircle,
  CalendarDays,
  DollarSign
} from 'lucide-react';
import { SalaryStrategyConfig, BudgetCategory, RealCashPosition, RealTransaction, MonthIndex } from '../types/budget';
import { formatCurrency, formatPercent, formatDateBR } from '../utils/formatters';
import { ActiveTab } from '../types/navigation';

interface SalaryStrategyViewProps {
  salaryStrategy: SalaryStrategyConfig;
  onUpdateStrategy: (config: Partial<SalaryStrategyConfig>) => void;
  categories: BudgetCategory[];
  selectedYear?: number;
  realCashPosition?: RealCashPosition;
  onAddTransaction?: (tx: Omit<RealTransaction, 'id' | 'createdAt'>) => Promise<void>;
  onNavigateTab?: (tab: ActiveTab) => void;
}

export const SalaryStrategyView: React.FC<SalaryStrategyViewProps> = ({
  salaryStrategy,
  onUpdateStrategy,
  categories,
  selectedYear = 2026,
  realCashPosition,
  onAddTransaction,
  onNavigateTab,
}) => {
  const [activeMode, setActiveMode] = useState<'split_vale_pagamento' | 'single_payment'>(
    salaryStrategy.mode
  );
  
  // Total Monthly Net Salary
  const [salaryInput, setSalaryInput] = useState<string>(
    salaryStrategy.monthlyNetSalary.toString()
  );
  
  // Percent / Values
  const [valePercent, setValePercent] = useState<number>(salaryStrategy.valePercent || 40);

  // Vale & Pagamento Days (1 to 31)
  const [paymentDay, setPaymentDay] = useState<number>(salaryStrategy.paymentDay || 5);
  const [valeDay, setValeDay] = useState<number>(salaryStrategy.valeDay || 20);
  const [singlePaymentDay, setSinglePaymentDay] = useState<number>(salaryStrategy.singlePaymentDay || 5);

  // Custom Exact Values (R$)
  const defaultValeVal = ((salaryStrategy.monthlyNetSalary || 9000) * (salaryStrategy.valePercent || 40)) / 100;
  const defaultPaymentVal = (salaryStrategy.monthlyNetSalary || 9000) - defaultValeVal;

  const [customValeInput, setCustomValeInput] = useState<string>(
    (salaryStrategy.customValeAmount !== undefined ? salaryStrategy.customValeAmount : defaultValeVal).toString()
  );
  const [customPaymentInput, setCustomPaymentInput] = useState<string>(
    (salaryStrategy.customPaymentAmount !== undefined ? salaryStrategy.customPaymentAmount : defaultPaymentVal).toString()
  );

  // Real Actual Received Amount (quantia real que caiu em conta)
  const [actualPaymentReceivedInput, setActualPaymentReceivedInput] = useState<string>(
    (salaryStrategy.actualPaymentReceivedAmount || parseFloat(customPaymentInput) || defaultPaymentVal).toString()
  );
  const [actualValeReceivedInput, setActualValeReceivedInput] = useState<string>(
    (salaryStrategy.actualValeReceivedAmount || parseFloat(customValeInput) || defaultValeVal).toString()
  );
  const [actualSinglePaymentInput, setActualSinglePaymentInput] = useState<string>(
    (salaryStrategy.actualSinglePaymentReceivedAmount || salaryStrategy.monthlyNetSalary || 9000).toString()
  );

  // Received status checkboxes
  const [paymentReceived, setPaymentReceived] = useState<boolean>(!!salaryStrategy.paymentReceived);
  const [valeReceived, setValeReceived] = useState<boolean>(!!salaryStrategy.valeReceived);
  const [singlePaymentReceived, setSinglePaymentReceived] = useState<boolean>(!!salaryStrategy.singlePaymentReceived);

  // Toast / Feedback message
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const monthlyNet = parseFloat(salaryInput.replace(',', '.')) || salaryStrategy.monthlyNetSalary;
  const parsedCustomVale = parseFloat(customValeInput.replace(',', '.')) || 0;
  const parsedCustomPayment = parseFloat(customPaymentInput.replace(',', '.')) || 0;

  // Real received values
  const parsedActualPayment = parseFloat(actualPaymentReceivedInput.replace(',', '.')) || parsedCustomPayment;
  const parsedActualVale = parseFloat(actualValeReceivedInput.replace(',', '.')) || parsedCustomVale;
  const parsedActualSingle = parseFloat(actualSinglePaymentInput.replace(',', '.')) || monthlyNet;

  // Sync state if props change
  useEffect(() => {
    setActiveMode(salaryStrategy.mode);
    setSalaryInput(salaryStrategy.monthlyNetSalary.toString());
    setValePercent(salaryStrategy.valePercent || 40);
    setPaymentDay(salaryStrategy.paymentDay || 5);
    setValeDay(salaryStrategy.valeDay || 20);
    setSinglePaymentDay(salaryStrategy.singlePaymentDay || 5);
    setPaymentReceived(!!salaryStrategy.paymentReceived);
    setValeReceived(!!salaryStrategy.valeReceived);
    setSinglePaymentReceived(!!salaryStrategy.singlePaymentReceived);
  }, [salaryStrategy]);

  // Split Calculations
  const calculatedValeAmount = parsedCustomVale > 0 ? parsedCustomVale : (monthlyNet * valePercent) / 100;
  const calculatedPaymentAmount = parsedCustomPayment > 0 ? parsedCustomPayment : monthlyNet - calculatedValeAmount;
  const paymentPercent = Math.round((calculatedPaymentAmount / (calculatedValeAmount + calculatedPaymentAmount || 1)) * 100);

  // Fixed obligations approximation from categories
  const obligationsCat = categories.find((c) => c.id === 'cat_obrigacoes');
  const creditCardVal = obligationsCat?.items.find((i) => i.name.toLowerCase().includes('cartão'))?.values[10] || 1500;
  const longTermSavings = obligationsCat?.items.find((i) => i.name.toLowerCase().includes('economia'))?.values[10] || 2000;
  const supermarketVal = categories.find((c) => c.id === 'cat_cotidiano')?.items.find((i) => i.name.toLowerCase().includes('supermercado'))?.values[10] || 1500;
  const fuelVal = categories.find((c) => c.id === 'cat_transporte')?.items.find((i) => i.name.toLowerCase().includes('combustível'))?.values[10] || 600;

  // Fixed commitments (Cartão + Investimento)
  const totalFixedCommitments = creditCardVal + longTermSavings;
  const remainingForVariable = Math.max(0, (singlePaymentReceived ? parsedActualSingle : monthlyNet) - totalFixedCommitments);
  const weeklyAllowance = remainingForVariable / 4;

  // Day of the month calculation for timeline
  const today = new Date();
  const currentDayOfMonth = today.getDate();

  const handleModeChange = (mode: 'split_vale_pagamento' | 'single_payment') => {
    setActiveMode(mode);
    onUpdateStrategy({ mode });
  };

  const handleSalaryBlur = () => {
    const parsed = parseFloat(salaryInput.replace(',', '.')) || 9000;
    const newVale = (parsed * valePercent) / 100;
    const newPayment = parsed - newVale;
    setCustomValeInput(newVale.toFixed(2));
    setCustomPaymentInput(newPayment.toFixed(2));
    onUpdateStrategy({ 
      monthlyNetSalary: parsed,
      customValeAmount: newVale,
      customPaymentAmount: newPayment
    });
  };

  const handleValePercentChange = (percent: number) => {
    setValePercent(percent);
    const newVale = (monthlyNet * percent) / 100;
    const newPayment = monthlyNet - newVale;
    setCustomValeInput(newVale.toFixed(2));
    setCustomPaymentInput(newPayment.toFixed(2));
    onUpdateStrategy({ 
      valePercent: percent,
      customValeAmount: newVale,
      customPaymentAmount: newPayment
    });
  };

  const handleCustomValeBlur = () => {
    const val = parseFloat(customValeInput.replace(',', '.')) || 0;
    const payment = Math.max(0, monthlyNet - val);
    setCustomPaymentInput(payment.toFixed(2));
    const newPercent = monthlyNet > 0 ? Math.round((val / monthlyNet) * 100) : 40;
    setValePercent(newPercent);
    onUpdateStrategy({
      customValeAmount: val,
      customPaymentAmount: payment,
      valePercent: newPercent,
    });
  };

  const handleCustomPaymentBlur = () => {
    const payment = parseFloat(customPaymentInput.replace(',', '.')) || 0;
    const vale = Math.max(0, monthlyNet - payment);
    setCustomValeInput(vale.toFixed(2));
    const newPercent = monthlyNet > 0 ? Math.round((vale / monthlyNet) * 100) : 40;
    setValePercent(newPercent);
    onUpdateStrategy({
      customPaymentAmount: payment,
      customValeAmount: vale,
      valePercent: newPercent,
    });
  };

  const handleDayChange = (type: 'payment' | 'vale' | 'single', day: number) => {
    const cleanDay = Math.min(31, Math.max(1, day));
    if (type === 'payment') {
      setPaymentDay(cleanDay);
      onUpdateStrategy({ paymentDay: cleanDay });
    } else if (type === 'vale') {
      setValeDay(cleanDay);
      onUpdateStrategy({ valeDay: cleanDay });
    } else {
      setSinglePaymentDay(cleanDay);
      onUpdateStrategy({ singlePaymentDay: cleanDay });
    }
  };

  const handleTogglePaymentReceived = (checked: boolean) => {
    setPaymentReceived(checked);
    onUpdateStrategy({ 
      paymentReceived: checked,
      actualPaymentReceivedAmount: parsedActualPayment
    });
  };

  const handleToggleValeReceived = (checked: boolean) => {
    setValeReceived(checked);
    onUpdateStrategy({ 
      valeReceived: checked,
      actualValeReceivedAmount: parsedActualVale
    });
  };

  const handleToggleSingleReceived = (checked: boolean) => {
    setSinglePaymentReceived(checked);
    onUpdateStrategy({ 
      singlePaymentReceived: checked,
      actualSinglePaymentReceivedAmount: parsedActualSingle
    });
  };

  // Launch real transaction to cash position
  const handleLaunchToCash = async (type: 'payment' | 'vale' | 'single') => {
    if (!onAddTransaction) return;

    let amount = 0;
    let description = '';
    let day = 5;

    if (type === 'payment') {
      amount = parsedActualPayment;
      description = `Recebimento Salário (Dia ${paymentDay})`;
      day = paymentDay;
      handleTogglePaymentReceived(true);
    } else if (type === 'vale') {
      amount = parsedActualVale;
      description = `Recebimento Vale / Adiantamento (Dia ${valeDay})`;
      day = valeDay;
      handleToggleValeReceived(true);
    } else {
      amount = parsedActualSingle;
      description = `Recebimento Salário Único (Dia ${singlePaymentDay})`;
      day = singlePaymentDay;
      handleToggleSingleReceived(true);
    }

    const currentMonthIdx = (new Date().getMonth() as MonthIndex);
    const dayStr = day.toString().padStart(2, '0');
    const monthStr = (currentMonthIdx + 1).toString().padStart(2, '0');
    const dateFormatted = `${selectedYear}-${monthStr}-${dayStr}`;

    const incomeCat = categories.find((c) => c.type === 'income') || categories[0];
    const incomeItem = incomeCat?.items[0];

    try {
      await onAddTransaction({
        date: dateFormatted,
        month: currentMonthIdx,
        type: 'income',
        categoryId: incomeCat.id,
        categoryName: incomeCat.name,
        itemId: incomeItem?.id,
        itemName: incomeItem?.name || 'Salários',
        amount: amount,
        description: description,
        paymentMethod: 'transfer',
        status: 'paid',
      });

      setActionFeedback(`${description} de ${formatCurrency(amount)} lançado no Caixa Real com sucesso!`);
      setTimeout(() => setActionFeedback(null), 4000);
    } catch (err) {
      console.error(err);
      alert('Erro ao lançar transação.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {actionFeedback && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-800 text-white px-4 py-3 rounded-xl shadow-lg border border-emerald-600 flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
          <span>{actionFeedback}</span>
        </div>
      )}

      {/* Strategy Selector Header */}
      <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                Estratégia de Fluxo de Caixa
              </span>
              <span className="text-xs text-neutral-400">·</span>
              <span className="text-xs text-neutral-500 font-medium">Controle de Datas e Valores Reais</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-neutral-900 mt-1">
              Como Organizar seu Salário, Datas e Vencimentos
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Defina as datas exatas e os valores que você recebe no Vale e no Pagamento para administrar sua quantia real
            </p>
          </div>

          {/* Monthly Net Salary Master Input */}
          <div className="flex items-center gap-2 bg-neutral-50 p-2 rounded-xl border border-neutral-200 self-start sm:self-auto">
            <span className="text-xs font-semibold text-neutral-600">Salário Líquido Mensal:</span>
            <div className="relative">
              <span className="absolute left-2.5 top-1.5 text-xs font-bold text-neutral-500">R$</span>
              <input
                type="text"
                value={salaryInput}
                onChange={(e) => setSalaryInput(e.target.value)}
                onBlur={handleSalaryBlur}
                className="w-28 pl-8 pr-2 py-1 text-xs font-mono font-bold bg-white border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                title="Informe o total líquido aproximado da família"
              />
            </div>
          </div>
        </div>

        {/* Strategy Switch Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
          <button
            onClick={() => handleModeChange('split_vale_pagamento')}
            className={`p-4 rounded-xl border text-left transition-all flex items-start gap-3 ${
              activeMode === 'split_vale_pagamento'
                ? 'border-emerald-600 bg-emerald-50/60 shadow-xs'
                : 'border-neutral-200 hover:bg-neutral-50 text-neutral-600'
            }`}
          >
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                activeMode === 'split_vale_pagamento'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-neutral-100 text-neutral-600'
              }`}
            >
              <Split className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-neutral-900">
                  Estratégia 1: Vale + Pagamento
                </span>
                {activeMode === 'split_vale_pagamento' && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                )}
              </div>
              <p className="text-xs text-neutral-600 mt-1">
                Recebe em duas datas (ex: Pagamento dia 05 e Vale dia 20). Controle o valor real recebido em cada data.
              </p>
            </div>
          </button>

          <button
            onClick={() => handleModeChange('single_payment')}
            className={`p-4 rounded-xl border text-left transition-all flex items-start gap-3 ${
              activeMode === 'single_payment'
                ? 'border-emerald-600 bg-emerald-50/60 shadow-xs'
                : 'border-neutral-200 hover:bg-neutral-50 text-neutral-600'
            }`}
          >
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                activeMode === 'single_payment'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-neutral-100 text-neutral-600'
              }`}
            >
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-neutral-900">
                  Estratégia 2: Pagamento Único
                </span>
                {activeMode === 'single_payment' && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                )}
              </div>
              <p className="text-xs text-neutral-600 mt-1">
                Recebe 100% em uma única data. Usa o método dos 4 envelopes semanais a partir da data de pagamento.
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* STRATEGY 1: VALE + PAGAMENTO                                              */}
      {/* ========================================================================= */}
      {activeMode === 'split_vale_pagamento' && (
        <div className="space-y-6">
          {/* Timeline / Live Cash Status Tracker */}
          <div className="bg-gradient-to-r from-neutral-900 to-neutral-800 text-white p-5 rounded-2xl border border-neutral-700 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-700/80">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-200">
                  Fluxo Quinzenal do Mês Atual
                </span>
                <span className="text-[10px] text-neutral-400">· Hoje é Dia {currentDayOfMonth}</span>
              </div>
              
              <div className="flex items-center gap-3 text-xs">
                <span className="text-neutral-400">Status no Mês:</span>
                <span className="font-semibold text-emerald-400">
                  {paymentReceived && valeReceived
                    ? '100% dos Rendimentos Recebidos'
                    : paymentReceived
                    ? 'Pagamento Recebido · Aguardando Vale'
                    : valeReceived
                    ? 'Vale Recebido · Aguardando Pagamento'
                    : 'Aguardando Próximo Recebimento'}
                </span>
              </div>
            </div>

            {/* Visual Timeline Bar */}
            <div className="pt-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                {/* Milestone 1: Pagamento */}
                <div className={`flex items-center gap-1.5 ${paymentReceived ? 'text-emerald-400 font-bold' : 'text-neutral-300'}`}>
                  <span className={`w-3 h-3 rounded-full border-2 ${paymentReceived ? 'bg-emerald-400 border-white' : 'border-neutral-400 bg-neutral-800'}`} />
                  <span>Dia {paymentDay}: Pagamento ({formatCurrency(paymentReceived ? parsedActualPayment : calculatedPaymentAmount)})</span>
                  {paymentReceived && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </div>

                {/* Milestone 2: Vale */}
                <div className={`flex items-center gap-1.5 ${valeReceived ? 'text-emerald-400 font-bold' : 'text-neutral-300'}`}>
                  <span className={`w-3 h-3 rounded-full border-2 ${valeReceived ? 'bg-emerald-400 border-white' : 'border-neutral-400 bg-neutral-800'}`} />
                  <span>Dia {valeDay}: Vale ({formatCurrency(valeReceived ? parsedActualVale : calculatedValeAmount)})</span>
                  {valeReceived && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
              </div>

              {/* Progress track */}
              <div className="relative w-full h-2.5 bg-neutral-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500 rounded-full"
                  style={{
                    width: `${
                      paymentReceived && valeReceived
                        ? 100
                        : paymentReceived
                        ? Math.max(25, Math.min(75, (currentDayOfMonth / 30) * 100))
                        : valeReceived
                        ? 75
                        : 10
                    }%`,
                  }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-1">
                <span>
                  {currentDayOfMonth < paymentDay
                    ? `Faltam ${paymentDay - currentDayOfMonth} dias para o Pagamento do dia ${paymentDay}`
                    : currentDayOfMonth < valeDay
                    ? `Faltam ${valeDay - currentDayOfMonth} dias para o Vale do dia ${valeDay}`
                    : `Período final do mês pós-vale (preparação para o próximo dia ${paymentDay})`}
                </span>
                <span>
                  Total Recebido no Mês:{' '}
                  <strong className="text-white font-mono">
                    {formatCurrency(
                      (paymentReceived ? parsedActualPayment : 0) + (valeReceived ? parsedActualVale : 0)
                    )}
                  </strong>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Proportion Sliders / Presets */}
          <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Percent className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-semibold text-neutral-800">
                Divisão Rápida Quinzenal:
              </span>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto py-1">
              {[
                { label: '40% Vale / 60% Saldo', val: 40 },
                { label: '50% Vale / 50% Saldo', val: 50 },
                { label: '30% Vale / 70% Saldo', val: 30 },
              ].map((opt) => (
                <button
                  key={opt.val}
                  onClick={() => handleValePercentChange(opt.val)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                    valePercent === opt.val
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-neutral-100 text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Two Interactive Config & Management Columns: O Pagamento vs O Vale */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* ======================================================== */}
            {/* BLOCO 1: O PAGAMENTO (Ex: Dia 05)                        */}
            {/* ======================================================== */}
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden flex flex-col">
              {/* Header Card */}
              <div className="bg-emerald-800 text-white p-5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-emerald-300" />
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">
                      1ª Etapa · O Pagamento
                    </span>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-700 text-white">
                    {paymentPercent}% do Salário
                  </span>
                </div>

                {/* Date and Amount Inputs inside Header */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-3 border-t border-emerald-700/80">
                  {/* Dia de Pagamento */}
                  <div>
                    <label className="text-[11px] font-semibold text-emerald-200 block mb-1">
                      Dia do Recebimento:
                    </label>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-emerald-300">Dia</span>
                      <input
                        type="number"
                        min={1}
                        max={31}
                        value={paymentDay}
                        onChange={(e) => handleDayChange('payment', parseInt(e.target.value, 10) || 5)}
                        className="w-16 px-2 py-1 bg-emerald-900/80 border border-emerald-600 rounded text-center text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-white"
                      />
                      <span className="text-[11px] text-emerald-300">(5º dia útil)</span>
                    </div>
                  </div>

                  {/* Valor Previsto */}
                  <div>
                    <label className="text-[11px] font-semibold text-emerald-200 block mb-1">
                      Valor Previsto (R$):
                    </label>
                    <div className="relative">
                      <span className="absolute left-2 top-1 text-xs text-emerald-300 font-bold">R$</span>
                      <input
                        type="text"
                        value={customPaymentInput}
                        onChange={(e) => setCustomPaymentInput(e.target.value)}
                        onBlur={handleCustomPaymentBlur}
                        className="w-full pl-8 pr-2 py-1 bg-emerald-900/80 border border-emerald-600 rounded text-xs font-mono font-bold text-white focus:outline-none focus:ring-1 focus:ring-white"
                      />
                    </div>
                  </div>
                </div>

                <p className="text-xs text-emerald-100 mt-3">
                  Saldo de Salário: Foco em <strong>Blindagem de Contas Fixas & Fatura do Cartão</strong>
                </p>
              </div>

              {/* Body: Real Management & Receipt Check */}
              <div className="p-5 flex-1 space-y-4">
                
                {/* Card de Gestão da Quantia Real Recebida */}
                <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4 text-emerald-700" />
                      Quantia Real Recebida no Dia {paymentDay}:
                    </span>
                    <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-emerald-800">
                      <input
                        type="checkbox"
                        checked={paymentReceived}
                        onChange={(e) => handleTogglePaymentReceived(e.target.checked)}
                        className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                      />
                      <span>Já caiu na conta</span>
                    </label>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                      <span className="absolute left-2.5 top-2 text-xs font-bold text-neutral-500">R$</span>
                      <input
                        type="text"
                        value={actualPaymentReceivedInput}
                        onChange={(e) => {
                          setActualPaymentReceivedInput(e.target.value);
                          onUpdateStrategy({
                            actualPaymentReceivedAmount: parseFloat(e.target.value.replace(',', '.')) || 0,
                          });
                        }}
                        className="w-full pl-8 pr-3 py-1.5 text-sm font-mono font-bold bg-white border border-emerald-300 rounded-lg text-neutral-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        placeholder="Valor real creditado"
                      />
                    </div>

                    <button
                      onClick={() => handleLaunchToCash('payment')}
                      className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors shrink-0 flex items-center gap-1"
                      title="Lançar automaticamente no caixa real como entrada confirmada"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Lançar no Caixa Real</span>
                    </button>
                  </div>

                  {parsedActualPayment !== calculatedPaymentAmount && (
                    <div className="text-[11px] text-neutral-600 flex items-center justify-between">
                      <span>Diferença sobre o previsto:</span>
                      <span className={`font-mono font-bold ${parsedActualPayment >= calculatedPaymentAmount ? 'text-emerald-700' : 'text-rose-600'}`}>
                        {parsedActualPayment >= calculatedPaymentAmount ? '+' : ''}
                        {formatCurrency(parsedActualPayment - calculatedPaymentAmount)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="text-xs font-bold text-neutral-800 uppercase tracking-wider pt-1">
                  O que pagar com o Pagamento do Dia {paymentDay}:
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <CreditCard className="w-4 h-4 text-neutral-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-neutral-900">Fatura do Cartão de Crédito</div>
                        <div className="text-neutral-500 text-[11px]">Vencimento habitual entre dia 08 e 12</div>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-neutral-900">
                      {formatCurrency(creditCardVal)}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <TrendingUp className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-neutral-900">Pague-se Primeiro (Investimento)</div>
                        <div className="text-neutral-500 text-[11px]">Aporte de longo prazo antes de gastar</div>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-emerald-700">
                      {formatCurrency(longTermSavings)}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <ShoppingCart className="w-4 h-4 text-neutral-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-neutral-900">Supermercado (Quinzena 1)</div>
                        <div className="text-neutral-500 text-[11px]">Compras para os dias {paymentDay} a {valeDay} (50% da cota)</div>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-neutral-900">
                      {formatCurrency(supermarketVal / 2)}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <Clock className="w-4 h-4 text-neutral-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-neutral-900">Combustível 1ª Quinzena</div>
                        <div className="text-neutral-500 text-[11px]">Abastecimento dias {paymentDay} a {valeDay}</div>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-neutral-900">
                      {formatCurrency(fuelVal / 2)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
                  <span className="font-semibold text-neutral-600">Sobra estimada até o Vale:</span>
                  <span className="font-mono font-bold text-emerald-700">
                    {formatCurrency(
                      Math.max(
                        0,
                        (paymentReceived ? parsedActualPayment : calculatedPaymentAmount) -
                          (creditCardVal + longTermSavings + supermarketVal / 2 + fuelVal / 2)
                      )
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* ======================================================== */}
            {/* BLOCO 2: O VALE (Ex: Dia 20)                             */}
            {/* ======================================================== */}
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden flex flex-col">
              {/* Header Card */}
              <div className="bg-indigo-900 text-white p-5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-indigo-300" />
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-200">
                      2ª Etapa · O Vale (Adiantamento)
                    </span>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-800 text-white">
                    {valePercent}% do Salário
                  </span>
                </div>

                {/* Date and Amount Inputs inside Header */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-3 border-t border-indigo-700/80">
                  {/* Dia do Vale */}
                  <div>
                    <label className="text-[11px] font-semibold text-indigo-200 block mb-1">
                      Dia do Recebimento:
                    </label>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-indigo-300">Dia</span>
                      <input
                        type="number"
                        min={1}
                        max={31}
                        value={valeDay}
                        onChange={(e) => handleDayChange('vale', parseInt(e.target.value, 10) || 20)}
                        className="w-16 px-2 py-1 bg-indigo-950/80 border border-indigo-600 rounded text-center text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-white"
                      />
                      <span className="text-[11px] text-indigo-300">(Adiantamento)</span>
                    </div>
                  </div>

                  {/* Valor Previsto do Vale */}
                  <div>
                    <label className="text-[11px] font-semibold text-indigo-200 block mb-1">
                      Valor Previsto (R$):
                    </label>
                    <div className="relative">
                      <span className="absolute left-2 top-1 text-xs text-indigo-300 font-bold">R$</span>
                      <input
                        type="text"
                        value={customValeInput}
                        onChange={(e) => setCustomValeInput(e.target.value)}
                        onBlur={handleCustomValeBlur}
                        className="w-full pl-8 pr-2 py-1 bg-indigo-950/80 border border-indigo-600 rounded text-xs font-mono font-bold text-white focus:outline-none focus:ring-1 focus:ring-white"
                      />
                    </div>
                  </div>
                </div>

                <p className="text-xs text-indigo-100 mt-3">
                  Vale Quinzenal: Foco em <strong>Alimentação, Lazer & Virada do Mês</strong>
                </p>
              </div>

              {/* Body: Real Management & Receipt Check */}
              <div className="p-5 flex-1 space-y-4">
                
                {/* Card de Gestão da Quantia Real do Vale */}
                <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4 text-indigo-700" />
                      Quantia Real Recebida no Dia {valeDay}:
                    </span>
                    <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-indigo-900">
                      <input
                        type="checkbox"
                        checked={valeReceived}
                        onChange={(e) => handleToggleValeReceived(e.target.checked)}
                        className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                      />
                      <span>Já caiu na conta</span>
                    </label>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                      <span className="absolute left-2.5 top-2 text-xs font-bold text-neutral-500">R$</span>
                      <input
                        type="text"
                        value={actualValeReceivedInput}
                        onChange={(e) => {
                          setActualValeReceivedInput(e.target.value);
                          onUpdateStrategy({
                            actualValeReceivedAmount: parseFloat(e.target.value.replace(',', '.')) || 0,
                          });
                        }}
                        className="w-full pl-8 pr-3 py-1.5 text-sm font-mono font-bold bg-white border border-indigo-300 rounded-lg text-neutral-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        placeholder="Valor real creditado"
                      />
                    </div>

                    <button
                      onClick={() => handleLaunchToCash('vale')}
                      className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-700 hover:bg-indigo-800 rounded-lg shadow-xs transition-colors shrink-0 flex items-center gap-1"
                      title="Lançar automaticamente no caixa real como entrada confirmada"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Lançar no Caixa Real</span>
                    </button>
                  </div>

                  {parsedActualVale !== calculatedValeAmount && (
                    <div className="text-[11px] text-neutral-600 flex items-center justify-between">
                      <span>Diferença sobre o previsto:</span>
                      <span className={`font-mono font-bold ${parsedActualVale >= calculatedValeAmount ? 'text-emerald-700' : 'text-rose-600'}`}>
                        {parsedActualVale >= calculatedValeAmount ? '+' : ''}
                        {formatCurrency(parsedActualVale - calculatedValeAmount)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="text-xs font-bold text-neutral-800 uppercase tracking-wider pt-1">
                  O que pagar com o Vale do Dia {valeDay}:
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <ShoppingCart className="w-4 h-4 text-neutral-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-neutral-900">Supermercado (Quinzena 2)</div>
                        <div className="text-neutral-500 text-[11px]">Compras para dias {valeDay} ao próximo dia {paymentDay}</div>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-neutral-900">
                      {formatCurrency(supermarketVal / 2)}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <Clock className="w-4 h-4 text-neutral-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-neutral-900">Combustível 2ª Quinzena</div>
                        <div className="text-neutral-500 text-[11px]">Abastecimento dias {valeDay} a {paymentDay}</div>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-neutral-900">
                      {formatCurrency(fuelVal / 2)}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <Sparkles className="w-4 h-4 text-neutral-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-neutral-900">Jantar Fora & Lazer Familiar</div>
                        <div className="text-neutral-500 text-[11px]">Restaurantes e fins de semana</div>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-neutral-900">
                      {formatCurrency(700)}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <ShieldAlert className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-neutral-900">Reserva de Transição para o Dia {paymentDay}</div>
                        <div className="text-neutral-500 text-[11px]">Garante saldo positivo na virada do mês</div>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-indigo-700">
                      {formatCurrency(
                        Math.max(
                          0,
                          (valeReceived ? parsedActualVale : calculatedValeAmount) - (supermarketVal / 2 + fuelVal / 2 + 700)
                        )
                      )}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
                  <span className="font-semibold text-neutral-600">Margem Livre do Vale:</span>
                  <span className="font-mono font-bold text-indigo-700">
                    {formatCurrency(
                      Math.max(
                        0,
                        (valeReceived ? parsedActualVale : calculatedValeAmount) - (supermarketVal / 2 + fuelVal / 2 + 700)
                      )
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Golden Rules for Vale + Pagamento */}
          <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 text-xs text-amber-900 space-y-2">
            <div className="font-bold flex items-center gap-2 text-amber-950">
              <ShieldAlert className="w-4 h-4 text-amber-700" />
              <span>Regra de Ouro da Estratégia Quinzenal:</span>
            </div>
            <p className="leading-relaxed">
              <strong>Nunca use o Vale para pagar a fatura do cartão</strong> se o vencimento for dia 10 (você pagaria juros de atraso ou ficaria descapitalizado no meio do mês). Conecte a fatura sempre ao <strong>Pagamento do dia {paymentDay}</strong>, e use o Vale do dia {valeDay} exclusivamente como o oxigênio para manter o supermercado, combustível e lazer em dia até o próximo dia {paymentDay}.
            </p>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STRATEGY 2: PAGAMENTO ÚNICO (4 SEMANAS)                                   */}
      {/* ========================================================================= */}
      {activeMode === 'single_payment' && (
        <div className="space-y-6">
          {/* Configuração da Data e Valor do Pagamento Único */}
          <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-neutral-100">
              <div>
                <h3 className="text-sm font-bold text-neutral-900">
                  Data e Valor do Pagamento Único
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Informe o dia exato do recebimento e a quantia real creditada em conta
                </p>
              </div>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                <input
                  type="checkbox"
                  checked={singlePaymentReceived}
                  onChange={(e) => handleToggleSingleReceived(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span>Salário já caiu na conta este mês</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              <div>
                <label className="text-xs font-semibold text-neutral-600 block mb-1">
                  Dia do Recebimento:
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-500">Dia</span>
                  <input
                    type="number"
                    min={1}
                    max={31}
                    value={singlePaymentDay}
                    onChange={(e) => handleDayChange('single', parseInt(e.target.value, 10) || 5)}
                    className="w-20 px-3 py-1.5 border border-neutral-300 rounded-lg text-xs font-bold text-neutral-900"
                  />
                  <span className="text-[11px] text-neutral-400">de cada mês</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-600 block mb-1">
                  Quantia Real Recebida (R$):
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2 text-xs font-bold text-neutral-500">R$</span>
                  <input
                    type="text"
                    value={actualSinglePaymentInput}
                    onChange={(e) => {
                      setActualSinglePaymentInput(e.target.value);
                      onUpdateStrategy({
                        actualSinglePaymentReceivedAmount: parseFloat(e.target.value.replace(',', '.')) || 0,
                      });
                    }}
                    className="w-full pl-8 pr-3 py-1.5 text-xs font-mono font-bold border border-neutral-300 rounded-lg text-neutral-900"
                    placeholder="Valor creditado"
                  />
                </div>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => handleLaunchToCash('single')}
                  className="w-full py-2 px-3 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Lançar no Caixa Real</span>
                </button>
              </div>
            </div>
          </div>

          {/* Executive Architecture */}
          <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-neutral-900">
              A Estratégia dos 4 Envelopes a partir do Dia {singlePaymentDay}
            </h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Receber tudo de uma vez exige blindagem contra a aceleração de gastos nos primeiros 10 dias. Com base na quantia de <strong>{formatCurrency(singlePaymentReceived ? parsedActualSingle : monthlyNet)}</strong>, separamos seu dinheiro em duas etapas imediatas:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-2">
                <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                  Etapa 1 · No Dia {singlePaymentDay} (Quitação Imediata)
                </span>
                <div className="text-lg font-bold font-mono text-neutral-900">
                  {formatCurrency(totalFixedCommitments)}
                </div>
                <p className="text-xs text-neutral-600">
                  Quitação imediata da Fatura do Cartão ({formatCurrency(creditCardVal)}) e transferência do Aporte de Investimento ({formatCurrency(longTermSavings)}).
                </p>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2">
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                  Etapa 2 · Caixa Operacional do Mês
                </span>
                <div className="text-lg font-bold font-mono text-emerald-800">
                  {formatCurrency(remainingForVariable)}
                </div>
                <p className="text-xs text-emerald-700">
                  Dinheiro que sobra para alimentação, combustível, passeios e dia a dia. Dividido rigorosamente em 4 semanas!
                </p>
              </div>
            </div>
          </div>

          {/* 4 Weekly Envelopes Grid adapted to payment day */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { 
                week: 'Semana 1', 
                days: `Dias ${singlePaymentDay} a ${((singlePaymentDay + 6) % 31) || 31}`, 
                desc: 'Compras principais de feira e abastecimento inicial' 
              },
              { 
                week: 'Semana 2', 
                days: `Dias ${((singlePaymentDay + 7) % 31) || 1} a ${((singlePaymentDay + 13) % 31) || 14}`, 
                desc: 'Reposição de alimentos e gastos da rotina' 
              },
              { 
                week: 'Semana 3', 
                days: `Dias ${((singlePaymentDay + 14) % 31) || 15} a ${((singlePaymentDay + 20) % 31) || 21}`, 
                desc: 'Foco na manutenção do teto e despesas leves' 
              },
              { 
                week: 'Semana 4', 
                days: `Dias ${((singlePaymentDay + 21) % 31) || 22} até próx. dia ${singlePaymentDay}`, 
                desc: 'Reta final com dinheiro garantido na conta' 
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs space-y-2 text-center"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center mx-auto">
                  0{idx + 1}
                </div>
                <div className="font-bold text-neutral-900 text-sm">{item.week}</div>
                <div className="text-[11px] text-neutral-400 font-medium">{item.days}</div>
                <div className="text-lg font-bold font-mono tabular-nums text-emerald-700 pt-1">
                  {formatCurrency(weeklyAllowance)}
                </div>
                <p className="text-[11px] text-neutral-500 leading-snug">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Practical Tactic Tip */}
          <div className="bg-neutral-900 text-white rounded-xl p-5 space-y-2 text-xs">
            <div className="font-bold flex items-center gap-2 text-emerald-400 text-sm">
              <Sparkles className="w-4 h-4" />
              <span>Dica Prática para Aplicar no Celular:</span>
            </div>
            <p className="text-neutral-300 leading-relaxed">
              Para não misturar as semanas, transfira a cota semanal ({formatCurrency(weeklyAllowance)}) toda semana para uma conta digital ou ajuste o limite semanal do cartão virtual. Assim você gasta com total tranquilidade sabendo que não vai faltar nas próximas semanas!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
