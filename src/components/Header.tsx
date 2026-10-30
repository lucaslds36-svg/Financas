import { useAuth } from '../contexts/AuthContext';
import { 
  Plus, 
  Download, 
  RotateCcw, 
  FileSpreadsheet, 
  LayoutDashboard, 
  Receipt, 
  BarChart3, 
  TrendingUp,
  Split,
  Users,
  Heart
} from 'lucide-react';

export type ActiveTab = 'overview' | 'spreadsheet' | 'transactions' | 'comparison' | 'evolution' | 'strategy';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenNewTransaction: () => void;
  onExportCSV: () => void;
  onResetOriginal: () => void;
  onOpenFamilySync: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewTransaction,
  onExportCSV,
  onResetOriginal,
  onOpenFamilySync,
}) => {
  const { user, family } = useAuth();
  return (
    <>
      {/* Desktop & Mobile Top Header Bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 h-14 sm:h-16">
            {/* Zone 1: Brand title, one line wordmark */}
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                <FileSpreadsheet className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-base sm:text-lg font-bold tracking-tight text-neutral-900 leading-none">
                  Orçamento Família
                </span>
                <span className="text-[10px] sm:text-[11px] text-neutral-500 font-medium hidden sm:inline">
                  Planejamento & Gastos Reais
                </span>
              </div>
            </div>

            {/* Zone 2: Navigation links / tabs (Desktop) */}
            <nav className="hidden lg:flex items-center gap-1 bg-neutral-100 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  activeTab === 'overview'
                    ? 'bg-white text-neutral-900 shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Visão Geral
              </button>
              <button
                onClick={() => setActiveTab('spreadsheet')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  activeTab === 'spreadsheet'
                    ? 'bg-white text-neutral-900 shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Planilha Anual
              </button>
              <button
                onClick={() => setActiveTab('transactions')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  activeTab === 'transactions'
                    ? 'bg-white text-neutral-900 shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Lançamentos Reais
              </button>
              <button
                onClick={() => setActiveTab('comparison')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  activeTab === 'comparison'
                    ? 'bg-white text-neutral-900 shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Planejado vs Real
              </button>
              <button
                onClick={() => setActiveTab('evolution')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  activeTab === 'evolution'
                    ? 'bg-white text-neutral-900 shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Evolução
              </button>
              <button
                onClick={() => setActiveTab('strategy')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  activeTab === 'strategy'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-emerald-700 hover:text-emerald-900'
                }`}
              >
                Estratégia Salarial
              </button>
            </nav>

            {/* Zone 3: Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Couple / Family Sync Button */}
              <button
                onClick={onOpenFamilySync}
                className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-semibold rounded-lg border transition-all shrink-0 min-h-[38px] sm:min-h-[40px] ${
                  user
                    ? 'bg-pink-50/80 text-pink-700 border-pink-200 hover:bg-pink-100'
                    : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50 shadow-2xs'
                }`}
                title={user ? 'Orçamento Compartilhado do Casal' : 'Conectar com Google para compartilhar com sua esposa'}
              >
                {user ? (
                  <>
                    <Heart className="w-3.5 h-3.5 text-pink-600 fill-current shrink-0" />
                    <span className="hidden sm:inline">
                      {family?.name ? family.name : 'Casal'}
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </>
                ) : (
                  <>
                    <Users className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                    <span>Conectar Casal</span>
                  </>
                )}
              </button>

              <button
                onClick={onExportCSV}
                title="Exportar Planilha CSV"
                className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors whitespace-nowrap shrink-0"
              >
                <Download className="w-3.5 h-3.5 text-neutral-500" />
                <span>Exportar CSV</span>
              </button>

              <button
                onClick={onResetOriginal}
                title="Restaurar dados originais da planilha"
                className="hidden 2xl:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restaurar</span>
              </button>

              <button
                onClick={onOpenNewTransaction}
                className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg shadow-xs transition-colors whitespace-nowrap shrink-0 min-h-[38px] sm:min-h-[40px]"
              >
                <Plus className="w-4 h-4" />
                <span>Novo Gasto</span>
              </button>
            </div>
          </div>

          {/* Tablet Sub-Navigation */}
          <div className="hidden md:flex lg:hidden overflow-x-auto py-2 gap-1.5 no-scrollbar border-t border-neutral-100 text-xs">
            {[
              { id: 'overview', label: 'Visão Geral' },
              { id: 'spreadsheet', label: 'Planilha' },
              { id: 'transactions', label: 'Lançamentos' },
              { id: 'comparison', label: 'Orçado vs Real' },
              { id: 'evolution', label: 'Evolução' },
              { id: 'strategy', label: 'Estratégia Salarial' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ActiveTab)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-neutral-900 text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:text-neutral-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* MOBILE FIXED BOTTOM NAVIGATION BAR (Ergonomic thumb zone) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-neutral-200 px-1 py-1 shadow-lg">
        <div className="grid grid-cols-5 items-center h-14 max-w-md mx-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
              activeTab === 'overview'
                ? 'text-emerald-700 font-bold'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span className="text-[10px] tracking-tight mt-0.5">Início</span>
          </button>

          <button
            onClick={() => setActiveTab('spreadsheet')}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
              activeTab === 'spreadsheet'
                ? 'text-emerald-700 font-bold'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span className="text-[10px] tracking-tight mt-0.5">Planilha</span>
          </button>

          <button
            onClick={() => setActiveTab('transactions')}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
              activeTab === 'transactions'
                ? 'text-emerald-700 font-bold'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span className="text-[10px] tracking-tight mt-0.5">Gastos</span>
          </button>

          <button
            onClick={() => setActiveTab('comparison')}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
              activeTab === 'comparison'
                ? 'text-emerald-700 font-bold'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span className="text-[10px] tracking-tight mt-0.5">Orçado</span>
          </button>

          <button
            onClick={() => setActiveTab('strategy')}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
              activeTab === 'strategy'
                ? 'text-emerald-700 font-bold'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Split className="w-4 h-4" />
            <span className="text-[10px] tracking-tight mt-0.5">Estratégia</span>
          </button>
        </div>
      </nav>
    </>
  );
};
