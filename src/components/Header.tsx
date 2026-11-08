import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ActiveTab } from '../types/navigation';
import { 
  Plus, 
  LayoutGrid, 
  TrendingUp, 
  Receipt, 
  Users, 
  Heart,
  ArrowUpRight
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenNewTransaction: (type?: 'income' | 'expense') => void;
  selectedYear: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewTransaction,
  selectedYear,
}) => {
  const { user, family } = useAuth();

  const navItems: { id: ActiveTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'kanban', label: 'Cards', icon: LayoutGrid },
    { id: 'evolution', label: 'Gráficos', icon: TrendingUp },
    { id: 'transactions', label: 'Extrato', icon: Receipt },
    { id: 'family', label: 'Casal', icon: Users },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-14 sm:h-16">
          
          {/* Zone 1: Clean Wordmark */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('kanban')}
              className="flex items-center gap-2 text-left group"
            >
              <div className="w-8 h-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center font-bold text-xs shadow-2xs group-hover:bg-neutral-800 transition-colors">
                OF
              </div>
              <div>
                <span className="text-base sm:text-lg font-bold tracking-tight text-neutral-900 block leading-tight">
                  Finanças
                </span>
                <span className="text-[10px] text-neutral-400 font-mono hidden sm:block">
                  {selectedYear}
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation (Desktop) - Only Cards, Gráficos, Extrato, Casal */}
          <nav className="hidden md:flex items-center gap-1 bg-neutral-100 p-1 rounded-xl">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-white text-neutral-900 shadow-xs'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Quick Entry Actions (+ Entrada & + Despesa) */}
          <div className="flex items-center gap-2 shrink-0">
            
            {/* Couple Indicator / Nav Button */}
            <PWAInstallButton />
            <button
              onClick={() => setActiveTab('family')}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                activeTab === 'family'
                  ? 'bg-neutral-900 text-white border-neutral-900'
                  : user
                  ? 'bg-pink-50 text-pink-700 border-pink-200 hover:bg-pink-100'
                  : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50 shadow-2xs'
              }`}
              title="Acessar espaço do casal"
            >
              <Heart className={`w-3.5 h-3.5 ${user ? 'text-pink-600 fill-current' : 'text-neutral-500'}`} />
              <span className="hidden sm:inline">
                {user ? (family?.name || 'Casal') : 'Casal'}
              </span>
            </button>

            {/* Quick Add Entrada */}
            <button
              type="button"
              onClick={() => onOpenNewTransaction('income')}
              className="inline-flex items-center gap-1 px-3 py-1.5 sm:py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
              title="Lançar Salário, Vale, Hora Extra ou Freela"
            >
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
              <span>+ Entrada</span>
            </button>

            {/* Quick Add Despesa */}
            <button
              type="button"
              onClick={() => onOpenNewTransaction('expense')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:py-2 text-xs font-bold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg shadow-xs transition-all active:scale-95 whitespace-nowrap shrink-0"
              title="Lançar nova despesa"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Despesa</span>
            </button>

          </div>
        </div>
      </div>
    </header>
  );
};
