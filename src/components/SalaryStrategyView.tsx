import React, { useState } from 'react';
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
  Layers,
  Clock
} from 'lucide-react';
import { SalaryStrategyConfig, BudgetCategory } from '../types/budget';
import { formatCurrency, formatPercent } from '../utils/formatters';

interface SalaryStrategyViewProps {
  salaryStrategy: SalaryStrategyConfig;
  onUpdateStrategy: (config: Partial<SalaryStrategyConfig>) => void;
  categories: BudgetCategory[];
}

export const SalaryStrategyView: React.FC<SalaryStrategyViewProps> = ({
  salaryStrategy,
  onUpdateStrategy,
  categories,
}) => {
  const [activeMode, setActiveMode] = useState<'split_vale_pagamento' | 'single_payment'>(
    salaryStrategy.mode
  );
  const [salaryInput, setSalaryInput] = useState<string>(
    salaryStrategy.monthlyNetSalary.toString()
  );
  const [valePercent, setValePercent] = useState<number>(salaryStrategy.valePercent || 40);

  const monthlyNet = parseFloat(salaryInput.replace(',', '.')) || salaryStrategy.monthlyNetSalary;

  // Split Calculations
  const valeAmount = (monthlyNet * valePercent) / 100;
  const paymentPercent = 100 - valePercent;
  const paymentAmount = (monthlyNet * paymentPercent) / 100;

  // Single payment weekly split
  // Fixed obligations approximation from categories
  const obligationsCat = categories.find((c) => c.id === 'cat_obrigacoes');
  const creditCardVal = obligationsCat?.items.find((i) => i.name.toLowerCase().includes('cartão'))?.values[10] || 1500;
  const longTermSavings = obligationsCat?.items.find((i) => i.name.toLowerCase().includes('economia'))?.values[10] || 2000;
  const supermarketVal = categories.find((c) => c.id === 'cat_cotidiano')?.items.find((i) => i.name.toLowerCase().includes('supermercado'))?.values[10] || 1500;
  const fuelVal = categories.find((c) => c.id === 'cat_transporte')?.items.find((i) => i.name.toLowerCase().includes('combustível'))?.values[10] || 600;

  // Fixed bills (Cartão + Economias)
  const totalFixedCommitments = creditCardVal + longTermSavings;
  const remainingForVariable = Math.max(0, monthlyNet - totalFixedCommitments);
  const weeklyAllowance = remainingForVariable / 4;

  const handleModeChange = (mode: 'split_vale_pagamento' | 'single_payment') => {
    setActiveMode(mode);
    onUpdateStrategy({ mode });
  };

  const handleSalaryBlur = () => {
    const parsed = parseFloat(salaryInput.replace(',', '.')) || 9000;
    onUpdateStrategy({ monthlyNetSalary: parsed });
  };

  const handleValePercentChange = (val: number) => {
    setValePercent(val);
    onUpdateStrategy({ valePercent: val });
  };

  return (
    <div className="space-y-6">
      {/* Strategy Selector Header */}
      <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                Estratégia de Fluxo de Caixa
              </span>
              <span className="text-xs text-neutral-400">·</span>
              <span className="text-xs text-neutral-500 font-medium">Otimização Salarial</span>
            </div>
            <h2 className="text-lg font-bold text-neutral-900 mt-1">
              Como Organizar seu Salário e Vencimentos
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Escolha como você recebe sua renda para ver a melhor divisão tática de contas
            </p>
          </div>

          {/* Salary Net Input */}
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
                Recebe em duas datas (ex: Vale dia 20 e Pagamento dia 05). Distribui contas por quinzena.
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
                Recebe 100% em uma única data. Usa o método dos 4 envelopes semanais para não faltar dinheiro.
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* STRATEGY 1: VALE + PAGAMENTO CONTENT */}
      {activeMode === 'split_vale_pagamento' && (
        <div className="space-y-6">
          {/* Percentage Split Slider / Selector */}
          <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Percent className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-semibold text-neutral-800">
                Proporção da Divisão Quinzenal:
              </span>
            </div>
            <div className="flex items-center gap-2">
              {[
                { label: '40% Vale / 60% Saldo', val: 40 },
                { label: '50% Vale / 50% Saldo', val: 50 },
                { label: '30% Vale / 70% Saldo', val: 30 },
              ].map((opt) => (
                <button
                  key={opt.val}
                  onClick={() => handleValePercentChange(opt.val)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
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

          {/* Two Columns: Quinzena 1 vs Quinzena 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bloco 1: O PAGAMENTO (Dia 05) */}
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden flex flex-col">
              <div className="bg-emerald-800 text-white p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-emerald-300" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-emerald-200">
                      1ª Etapa · Dia 05 (5º Dia Útil)
                    </span>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-700 text-white">
                    {paymentPercent}% do Salário
                  </span>
                </div>
                <div className="text-2xl font-bold font-mono tabular-nums mt-2">
                  {formatCurrency(paymentAmount)}
                </div>
                <p className="text-xs text-emerald-100 mt-1">
                  Saldo de Salário: Foco em <strong>Blindagem de Contas Fixas & Cartão</strong>
                </p>
              </div>

              <div className="p-5 flex-1 space-y-4">
                <div className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                  O que pagar no Dia 05:
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
                        <div className="text-neutral-500 text-[11px]">Compras para os dias 05 a 20 (50% da cota)</div>
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
                        <div className="text-neutral-500 text-[11px]">Abastecimento dias 05 a 20</div>
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
                      Math.max(0, paymentAmount - (creditCardVal + longTermSavings + supermarketVal / 2 + fuelVal / 2))
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Bloco 2: O VALE (Dia 20) */}
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden flex flex-col">
              <div className="bg-indigo-900 text-white p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-indigo-300" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-indigo-200">
                      2ª Etapa · Dia 20 (Adiantamento)
                    </span>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-800 text-white">
                    {valePercent}% do Salário
                  </span>
                </div>
                <div className="text-2xl font-bold font-mono tabular-nums mt-2">
                  {formatCurrency(valeAmount)}
                </div>
                <p className="text-xs text-indigo-100 mt-1">
                  Vale Quinzenal: Foco em <strong>Alimentação, Lazer & Virada do Mês</strong>
                </p>
              </div>

              <div className="p-5 flex-1 space-y-4">
                <div className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                  O que pagar no Dia 20:
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <ShoppingCart className="w-4 h-4 text-neutral-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-neutral-900">Supermercado (Quinzena 2)</div>
                        <div className="text-neutral-500 text-[11px]">Compras para dias 20 ao dia 05</div>
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
                        <div className="text-neutral-500 text-[11px]">Abastecimento dias 20 a 05</div>
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
                        <div className="font-bold text-neutral-900">Reserva de Transição para o Dia 05</div>
                        <div className="text-neutral-500 text-[11px]">Garante saldo positivo na virada do mês</div>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-indigo-700">
                      {formatCurrency(
                        Math.max(0, valeAmount - (supermarketVal / 2 + fuelVal / 2 + 700))
                      )}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
                  <span className="font-semibold text-neutral-600">Margem Livre do Vale:</span>
                  <span className="font-mono font-bold text-indigo-700">
                    {formatCurrency(
                      Math.max(0, valeAmount - (supermarketVal / 2 + fuelVal / 2 + 700))
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
              <strong>Nunca use o Vale para pagar a fatura do cartão</strong> se o vencimento for dia 10 (você pagaria juros de atraso ou ficaria descapitalizado no meio do mês). Conecte a fatura sempre ao <strong>Pagamento do dia 05</strong>, e use o Vale do dia 20 exclusivamente como o oxigênio para manter o supermercado, combustível e lazer em dia até o próximo dia 05.
            </p>
          </div>
        </div>
      )}

      {/* STRATEGY 2: PAGAMENTO ÚNICO (4 SEMANAS) CONTENT */}
      {activeMode === 'single_payment' && (
        <div className="space-y-6">
          {/* Executive Architecture */}
          <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-neutral-900">
              A Estratégia dos 4 Envelopes (Blindagem Semanal)
            </h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Receber tudo de uma vez é a maior armadilha para a maioria das famílias, pois a falsa sensação de saldo alto no começo do mês faz os gastos acelerarem nos primeiros 10 dias. A técnica abaixo resolve isso dividindo seu dinheiro em duas etapas:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-2">
                <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                  Etapa 1 · Dia do Pagamento (Imediato)
                </span>
                <div className="text-lg font-bold font-mono text-neutral-900">
                  {formatCurrency(totalFixedCommitments)}
                </div>
                <p className="text-xs text-neutral-600">
                  Quitação imediata da Fatura do Cartão ({formatCurrency(creditCardVal)}) e transferência do Aporte de Poupança/Investimento ({formatCurrency(longTermSavings)}).
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

          {/* 4 Weekly Envelopes Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { week: 'Semana 1', days: 'Dias 01 a 07', desc: 'Compras principais de feira e abastecimento inicial' },
              { week: 'Semana 2', days: 'Dias 08 a 14', desc: 'Reposição de alimentos e gastos do dia a dia' },
              { week: 'Semana 3', days: 'Dias 15 a 21', desc: 'Foco na manutenção do teto e despesas leves' },
              { week: 'Semana 4', days: 'Dias 22 até fim', desc: 'Reta final do mês com dinheiro sobrando' },
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
              Para não misturar as semanas, muitas pessoas transferem a cota semanal ({formatCurrency(weeklyAllowance)}) toda segunda-feira para uma conta de pagamentos separada (ex: conta digital gratuita) ou estipulam o limite do cartão virtual semanal. Assim você gasta com total tranquilidade sabendo que não vai faltar para as outras semanas!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
