import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  ArrowRight, 
  Copy, 
  RotateCcw, 
  Percent, 
  Wallet,
  CheckCircle2
} from 'lucide-react';
import { YearRolloverConfig } from '../types/budget';
import { formatCurrency } from '../utils/formatters';

interface YearRolloverModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentYear: number;
  currentYearSurplus: number;
  currentInitialBalance: number;
  availableYears: number[];
  onCreateNewYear: (config: YearRolloverConfig) => void;
}

export const YearRolloverModal: React.FC<YearRolloverModalProps> = ({
  isOpen,
  onClose,
  currentYear,
  currentYearSurplus,
  currentInitialBalance,
  availableYears,
  onCreateNewYear,
}) => {
  const defaultNextYear = Math.max(...availableYears, currentYear) + 1;
  const [newYear, setNewYear] = useState<number>(defaultNextYear);
  const [sourceYear, setSourceYear] = useState<number>(currentYear);
  const [strategy, setStrategy] = useState<'copy_structure_only' | 'copy_structure_and_values' | 'blank'>('copy_structure_only');
  const [carryOverBalance, setCarryOverBalance] = useState<boolean>(true);
  const [adjustmentPercentage, setAdjustmentPercentage] = useState<string>('0');

  if (!isOpen) return null;

  const totalCarriedBalance = currentInitialBalance + currentYearSurplus;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newYear <= 2000 || newYear > 2100) {
      alert('Informe um ano válido entre 2000 e 2100.');
      return;
    }
    if (availableYears.includes(newYear)) {
      if (!confirm(`O ano ${newYear} já existe. Deseja sobrescrever seu orçamento?`)) {
        return;
      }
    }

    onCreateNewYear({
      sourceYear,
      newYear,
      strategy,
      carryOverBalance,
      adjustmentPercentage: parseFloat(adjustmentPercentage) || 0,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-xl border border-neutral-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900">
                Virada de Ano & Novo Orçamento
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Crie o planejamento do próximo ano sem perder seu histórico
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Target Year and Source Year */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Novo Ano a Planejar *
              </label>
              <input
                type="number"
                required
                min={2000}
                max={2100}
                value={newYear}
                onChange={(e) => setNewYear(parseInt(e.target.value, 10) || defaultNextYear)}
                className="w-full px-3 py-2 text-sm font-mono font-bold border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Ano de Referência Base
              </label>
              <select
                value={sourceYear}
                onChange={(e) => setSourceYear(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
              >
                {availableYears.map((y) => (
                  <option key={y} value={y}>
                    Ano {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Strategy Selection */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-2">
              Como deseja inicializar o orçamento de {newYear}?
            </label>
            <div className="space-y-2">
              <label
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  strategy === 'copy_structure_only'
                    ? 'border-emerald-600 bg-emerald-50/50'
                    : 'border-neutral-200 hover:bg-neutral-50'
                }`}
              >
                <input
                  type="radio"
                  name="strategy"
                  checked={strategy === 'copy_structure_only'}
                  onChange={() => setStrategy('copy_structure_only')}
                  className="mt-1 text-emerald-600 focus:ring-emerald-500"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-neutral-900">
                      Copiar estrutura com valores zerados (Recomendado)
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-600 mt-0.5">
                    Mantém todas as suas categorias e itens personalizados de {sourceYear}, mas limpa as células para você preencher os novos valores do ano com calma.
                  </p>
                </div>
              </label>

              <label
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  strategy === 'copy_structure_and_values'
                    ? 'border-emerald-600 bg-emerald-50/50'
                    : 'border-neutral-200 hover:bg-neutral-50'
                }`}
              >
                <input
                  type="radio"
                  name="strategy"
                  checked={strategy === 'copy_structure_and_values'}
                  onChange={() => setStrategy('copy_structure_and_values')}
                  className="mt-1 text-emerald-600 focus:ring-emerald-500"
                />
                <div className="flex-1">
                  <span className="text-xs font-bold text-neutral-900">
                    Duplicar orçamento anterior na íntegra
                  </span>
                  <p className="text-[11px] text-neutral-600 mt-0.5">
                    Copia os mesmos valores de cada mês de {sourceYear}. Útil se sua renda e custos forem semelhantes.
                  </p>
                  {strategy === 'copy_structure_and_values' && (
                    <div className="mt-2.5 pt-2 border-t border-emerald-200/60 flex items-center gap-2">
                      <Percent className="w-3.5 h-3.5 text-emerald-700" />
                      <span className="text-[11px] text-neutral-700 font-medium">
                        Reajuste inflacionário geral (%):
                      </span>
                      <input
                        type="number"
                        step="0.5"
                        placeholder="Ex: 4.5"
                        value={adjustmentPercentage}
                        onChange={(e) => setAdjustmentPercentage(e.target.value)}
                        className="w-20 px-2 py-0.5 text-xs font-mono font-semibold border border-neutral-300 rounded bg-white"
                      />
                    </div>
                  )}
                </div>
              </label>

              <label
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  strategy === 'blank'
                    ? 'border-emerald-600 bg-emerald-50/50'
                    : 'border-neutral-200 hover:bg-neutral-50'
                }`}
              >
                <input
                  type="radio"
                  name="strategy"
                  checked={strategy === 'blank'}
                  onChange={() => setStrategy('blank')}
                  className="mt-1 text-emerald-600 focus:ring-emerald-500"
                />
                <div className="flex-1">
                  <span className="text-xs font-bold text-neutral-900">
                    Começar com modelo padrão zerado
                  </span>
                  <p className="text-[11px] text-neutral-600 mt-0.5">
                    Restaura as categorias originais da planilha com todos os valores em zero.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Saldo Inicial / Continuidade de Caixa */}
          <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={carryOverBalance}
                onChange={(e) => setCarryOverBalance(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded border-neutral-300 focus:ring-emerald-500"
              />
              <span className="text-xs font-bold text-neutral-900">
                Transportar saldo acumulado de {sourceYear} como saldo inicial de {newYear}
              </span>
            </label>
            <p className="text-[11px] text-neutral-600 pl-6 leading-relaxed">
              O saldo que sobrou em caixa no final de {sourceYear} (
              <strong className="font-mono text-emerald-700 font-bold">
                {formatCurrency(totalCarriedBalance)}
              </strong>
              ) será transportado como reserva inicial de {newYear}. Assim, sua evolução patrimonial continua sem interrupções!
            </p>
          </div>

          <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
            <span className="text-[11px] text-neutral-400">
              Você pode alternar entre os anos a qualquer momento.
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
              >
                <span>Criar Orçamento {newYear}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
