import React from 'react';
import { Plus, Minus, ArrowUpRight } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import { RealCashPosition } from '../types/budget';

interface SimpleDashboardProps {
  realCashPosition: RealCashPosition;
  onOpenNewTransaction: (type: 'income' | 'expense') => void;
}

export const SimpleDashboard: React.FC<SimpleDashboardProps> = ({ 
  realCashPosition, 
  onOpenNewTransaction 
}) => {
  return (
    <div className="p-4 pb-24 space-y-6">
      {/* Saldo Principal */}
      <div className="bg-neutral-900 rounded-3xl p-6 text-white shadow-xl">
        <span className="text-neutral-400 text-xs uppercase tracking-widest font-bold">Saldo Disponível</span>
        <div className="text-4xl font-extrabold font-mono mt-2">
          {formatCurrency(realCashPosition.currentRealBalance)}
        </div>
      </div>

      {/* Ações Rápidas */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => onOpenNewTransaction('expense')}
          className="bg-rose-50 border border-rose-100 text-rose-700 p-4 rounded-2xl flex flex-col items-center gap-2 font-bold"
        >
          <Minus className="w-6 h-6" />
          Registrar Gasto
        </button>
        <button
          onClick={() => onOpenNewTransaction('income')}
          className="bg-emerald-50 border border-emerald-100 text-emerald-700 p-4 rounded-2xl flex flex-col items-center gap-2 font-bold"
        >
          <Plus className="w-6 h-6" />
          Registrar Receita
        </button>
      </div>

      {/* Resumo Rápido */}
      <div className="bg-white rounded-2xl border border-neutral-100 p-4 shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <span className="font-bold text-neutral-800">Este Mês</span>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-neutral-500">Entradas</span>
            <span className="font-mono font-bold text-emerald-600">+{formatCurrency(realCashPosition.currentMonthPaidIncome)}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-neutral-500">Saídas</span>
            <span className="font-mono font-bold text-rose-600">-{formatCurrency(realCashPosition.currentMonthPaidExpense)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
