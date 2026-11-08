/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { Header } from './components/Header';
import { ActiveTab } from './types/navigation';
import { BottomNav } from './components/BottomNav';
import { KanbanView } from './components/KanbanView';
import { EvolutionView } from './components/EvolutionView';
import { RealTransactionsView } from './components/RealTransactionsView';
import { TransactionModal } from './components/TransactionModal';
import { FamilyView } from './components/FamilyView';
import { FamilySyncModal } from './components/FamilySyncModal';
import { useBudgetStore } from './hooks/useBudgetStore';
import { RealTransaction } from './types/budget';
import { formatCurrency } from './utils/formatters';
import { RotateCcw } from 'lucide-react';

function BudgetAppContent() {
  // Default to 'kanban' (Cards View) as requested
  const [activeTab, setActiveTab] = useState<ActiveTab>('kanban');
  
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [transactionModalType, setTransactionModalType] = useState<'income' | 'expense'>('expense');
  const [transactionModalCategory, setTransactionModalCategory] = useState<string | undefined>(undefined);
  const [editingTransaction, setEditingTransaction] = useState<RealTransaction | null>(null);

  const [isFamilySyncOpen, setIsFamilySyncOpen] = useState(false);

  const {
    selectedYear,
    realCashPosition,
    categories,
    transactions,
    monthlySummaries,
    annualSummary,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    resetToOriginalSpreadsheet,
    resetToZero,
    exportSpreadsheetCSV,
  } = useBudgetStore();

  const handleOpenNewTransaction = (type: 'income' | 'expense' = 'expense', categoryName?: string) => {
    setEditingTransaction(null);
    setTransactionModalType(type);
    setTransactionModalCategory(categoryName);
    setIsTransactionModalOpen(true);
  };

  const handleEditTransaction = (tx: RealTransaction) => {
    setEditingTransaction(tx);
    setTransactionModalType(tx.type);
    setTransactionModalCategory(tx.categoryName);
    setIsTransactionModalOpen(true);
  };

  const handlePromptReset = () => {
    const choice = prompt(
      'Digite "zerar" para limpar todos os valores ou "original" para restaurar os dados de exemplo:'
    );
    if (!choice) return;
    const clean = choice.trim().toLowerCase();
    if (clean === 'zerar') {
      resetToZero();
      alert('Aplicativo zerado com sucesso!');
    } else if (clean === 'original') {
      resetToOriginalSpreadsheet();
      alert('Dados restaurados com sucesso.');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col font-sans text-neutral-900 selection:bg-neutral-900 selection:text-white">
      
      {/* Clean Top Header Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewTransaction={handleOpenNewTransaction}
        selectedYear={selectedYear}
      />

      {/* Discrete, Clean Balance Bar */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
          <div className="flex items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-4 sm:gap-6 font-mono overflow-x-auto no-scrollbar">
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-neutral-500 font-sans font-medium">Saldo em Caixa:</span>
                <span className="font-bold text-neutral-900 text-sm">
                  {formatCurrency(realCashPosition.currentRealBalance)}
                </span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 text-emerald-700">
                <span className="text-neutral-400 font-sans font-normal">Entradas Mês:</span>
                <span className="font-bold">
                  +{formatCurrency(realCashPosition.currentMonthPaidIncome)}
                </span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 text-neutral-900">
                <span className="text-neutral-400 font-sans font-normal">Gastos Mês:</span>
                <span className="font-bold">
                  -{formatCurrency(realCashPosition.currentMonthPaidExpense)}
                </span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-neutral-400 font-sans font-normal">Sobra:</span>
                <span className={`font-bold ${realCashPosition.currentMonthRealBalance >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                  {formatCurrency(realCashPosition.currentMonthRealBalance)}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handlePromptReset}
              className="text-[11px] font-semibold text-neutral-400 hover:text-neutral-900 transition-colors hidden sm:flex items-center gap-1 shrink-0"
              title="Zerar valores para recomeçar do zero"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Zerar Dados</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5 pb-24 md:pb-8">
        
        {/* TAB 1: Visualização por CARDS (Kanban) */}
        {activeTab === 'kanban' && (
          <KanbanView
            transactions={transactions}
            categories={categories}
            onOpenNewTransaction={handleOpenNewTransaction}
            onEditTransaction={handleEditTransaction}
            onDeleteTransaction={deleteTransaction}
            onUpdateTransaction={updateTransaction}
            selectedYear={selectedYear}
          />
        )}

        {/* TAB 2: Visualização por GRÁFICOS (Evolução no Mês e no Ano) */}
        {activeTab === 'evolution' && (
          <EvolutionView
            selectedYear={selectedYear}
            monthlySummaries={monthlySummaries}
            categories={categories}
            annualSummary={annualSummary}
            transactions={transactions}
          />
        )}

        {/* TAB 3: EXTRATO */}
        {activeTab === 'transactions' && (
          <RealTransactionsView
            transactions={transactions}
            onOpenNewTransaction={() => handleOpenNewTransaction('expense')}
            onEditTransaction={handleEditTransaction}
            onDeleteTransaction={deleteTransaction}
          />
        )}

        {/* TAB 4: CASAL (Orçamento Compartilhado sem travamento) */}
        {activeTab === 'family' && (
          <FamilyView onBack={() => setActiveTab('kanban')} />
        )}

      </main>

      {/* Clean Footer */}
      <footer className="hidden md:block border-t border-neutral-200 bg-white py-5 mt-10 text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-neutral-800">Finanças</span>
            <span>·</span>
            <span>Controle familiar visual e compartilhado</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('family')}
              className="text-pink-700 hover:text-pink-800 font-semibold transition-colors"
            >
              Espaço do Casal
            </button>
            <span>·</span>
            <button
              onClick={exportSpreadsheetCSV}
              className="hover:text-neutral-900 transition-colors"
            >
              Exportar CSV
            </button>
            <span>·</span>
            <button
              onClick={handlePromptReset}
              className="hover:text-rose-600 transition-colors"
            >
              Zerar / Restaurar
            </button>
          </div>
        </div>
      </footer>

      {/* Modal de Lançamento Rápido */}
      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => {
          setIsTransactionModalOpen(false);
          setEditingTransaction(null);
        }}
        categories={categories}
        defaultType={transactionModalType}
        defaultCategoryName={transactionModalCategory}
        editingTransaction={editingTransaction}
        onSave={(data) => {
          if (editingTransaction) {
            updateTransaction({
              ...data,
              id: editingTransaction.id,
              createdAt: editingTransaction.createdAt,
            });
          } else {
            addTransaction(data);
          }
        }}
      />

      {/* Family Sync Modal (if triggered via modal flag) */}
      <FamilySyncModal
        isOpen={isFamilySyncOpen}
        onClose={() => setIsFamilySyncOpen(false)}
      />

      {/* Mobile Bottom Navigation */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BudgetAppContent />
    </AuthProvider>
  );
}
