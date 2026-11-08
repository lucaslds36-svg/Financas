import React from 'react';
import { LayoutGrid, TrendingUp, Receipt, Users } from 'lucide-react';
import { ActiveTab } from '../types/navigation';

interface BottomNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'kanban', name: 'Cards', icon: LayoutGrid },
    { id: 'evolution', name: 'Gráficos', icon: TrendingUp },
    { id: 'transactions', name: 'Extrato', icon: Receipt },
    { id: 'family', name: 'Casal', icon: Users },
  ] as const;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-neutral-200 pb-safe pt-1 flex justify-around items-center px-2 z-40 shadow-lg">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as ActiveTab)}
            className={`flex flex-col items-center justify-center gap-0.5 py-1 px-3 w-full transition-colors min-h-[44px] ${
              isActive ? 'text-neutral-900 font-bold' : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <div className={`p-1 rounded-lg ${isActive ? 'bg-neutral-100 text-neutral-900' : ''}`}>
              <Icon className="w-4 h-4" />
            </div>
            <span className="text-[10px] tracking-tight">{tab.name}</span>
          </button>
        );
      })}
    </nav>
  );
};
