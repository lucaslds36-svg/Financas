/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { Header, ActiveTab } from './components/Header';
import { OverviewView } from './components/OverviewView';
import { SpreadsheetView } from './components/SpreadsheetView';
import { RealTransactionsView } from './components/RealTransactionsView';
import { PlannedVsActualView } from './components/PlannedVsActualView';
import { EvolutionView } from './components/EvolutionView';
import { SalaryStrategyView } from './components/SalaryStrategyView';
import { TransactionModal } from './components/TransactionModal';
import { CategoryItemModal } from './components/CategoryItemModal';
import { YearRolloverModal } from './components/YearRolloverModal';
import { FamilySyncModal } from './components/FamilySyncModal';
import { useBudgetStore } from './hooks/useBudgetStore';
import { RealTransaction } from './types/budget';

function BudgetAppContent() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<RealTransaction | null>(null);
  const [isCategoryItemModalOpen, setIsCategoryItemModalOpen] = useState(false);
  const [targetCategoryIdForNewItem, setTargetCategoryIdForNewItem] = useState<string | undefined>();
  const [isYearRolloverOpen, setIsYearRolloverOpen] = useState(false);
  const [isFamilySyncOpen, setIsFamilySyncOpen] = useState(false);

  const {
    selectedYear,
    setSelectedYear,
    availableYears,
    createNextYearBudget,
    calculateYearSurplus,
    initialBalance,
    updateInitialBalance,
    initialAccountBalance,
    setInitialAccountBalance,
    realCashPosition,
    salaryStrategy,
    updateSalaryStrategy,
    categories,
    transactions,
    monthlySummaries,
    annualSummary,
    financialHealth,
    updateItemValue,
    fillItemAllMonths,
    addItem,
    removeItem,
    renameItem,
    addCategory,
    removeCategory,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    resetToOriginalSpreadsheet,
    getComparisonData,
    exportSpreadsheetCSV,
  } = useBudgetStore();

  const handleOpenNewTransaction = () => {
    setEditingTransaction(null);
    setIsTransactionModalOpen(true);
  };

  const handleEditTransaction = (tx: RealTransaction) => {
    setEditingTransaction(tx);
    setIsTransactionModalOpen(true);
  };

  const handleOpenAddItem = (categoryId?: string) => {
    setTargetCategoryIdForNewItem(categoryId);
    setIsCategoryItemModalOpen(true);
  };

  const handleReset = () => {
    if (
      confirm(
        'Tem certeza que deseja restaurar a planilha original? Suas edições recentes serão resetadas para o modelo inicial.'
      )
    ) {
      resetToOriginalSpreadsheet();
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col font-sans text-neutral-900">
      {/* Top Bar Header & Mobile Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewTransaction={handleOpenNewTransaction}
        onExportCSV={exportSpreadsheetCSV}
        onResetOriginal={handleReset}
        onOpenFamilySync={() => setIsFamilySyncOpen(true)}
      />

      {/* Main Content Area (pb-24 on mobile ensures thumb nav bar never covers content) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24 md:pb-8">
        {activeTab === 'overview' && (
          <OverviewView
            selectedYear={selectedYear}
            availableYears={availableYears}
            onSelectYear={setSelectedYear}
            onOpenYearRollover={() => setIsYearRolloverOpen(true)}
            realCashPosition={realCashPosition}
            onUpdateInitialAccountBalance={setInitialAccountBalance}
            financialHealth={financialHealth}
            annualSummary={annualSummary}
            monthlySummaries={monthlySummaries}
            recentTransactions={transactions}
            onNavigateTab={setActiveTab}
            onOpenNewTransaction={handleOpenNewTransaction}
            onOpenFamilySync={() => setIsFamilySyncOpen(true)}
          />
        )}

        {activeTab === 'spreadsheet' && (
          <SpreadsheetView
            categories={categories}
            selectedYear={selectedYear}
            availableYears={availableYears}
            initialBalance={initialBalance}
            onSelectYear={setSelectedYear}
            onOpenYearRollover={() => setIsYearRolloverOpen(true)}
            onUpdateInitialBalance={updateInitialBalance}
            onUpdateValue={updateItemValue}
            onFillAllMonths={fillItemAllMonths}
            onRemoveItem={removeItem}
            onRenameItem={renameItem}
            onOpenAddItem={handleOpenAddItem}
            onRemoveCategory={removeCategory}
          />
        )}

        {activeTab === 'transactions' && (
          <RealTransactionsView
            transactions={transactions}
            onOpenNewTransaction={handleOpenNewTransaction}
            onEditTransaction={handleEditTransaction}
            onDeleteTransaction={deleteTransaction}
          />
        )}

        {activeTab === 'comparison' && (
          <PlannedVsActualView
            selectedYear={selectedYear}
            getComparisonData={getComparisonData}
          />
        )}

        {activeTab === 'evolution' && (
          <EvolutionView
            selectedYear={selectedYear}
            monthlySummaries={monthlySummaries}
            categories={categories}
            annualSummary={annualSummary}
          />
        )}

        {activeTab === 'strategy' && (
          <SalaryStrategyView
            salaryStrategy={salaryStrategy}
            onUpdateStrategy={updateSalaryStrategy}
            categories={categories}
          />
        )}
      </main>

      {/* Footer (hidden on mobile to prevent clutter) */}
      <footer className="hidden md:block border-t border-neutral-200 bg-white py-6 mt-12 text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-800">Orçamento Família</span>
            <span>·</span>
            <span>Ano Ativo: {selectedYear}</span>
            <span>·</span>
            <span>Planejamento familiar compartilhado e controle de gastos reais</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsFamilySyncOpen(true)}
              className="font-medium text-pink-700 hover:text-pink-800 transition-colors"
            >
              Espaço do Casal
            </button>
            <span>·</span>
            <button
              onClick={() => setIsYearRolloverOpen(true)}
              className="font-medium text-emerald-700 hover:text-emerald-800 transition-colors"
            >
              + Virada de Ano
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
              onClick={handleReset}
              className="hover:text-rose-600 transition-colors"
            >
              Restaurar Original
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => {
          setIsTransactionModalOpen(false);
          setEditingTransaction(null);
        }}
        categories={categories}
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
        editingTransaction={editingTransaction}
      />

      <CategoryItemModal
        isOpen={isCategoryItemModalOpen}
        onClose={() => setIsCategoryItemModalOpen(false)}
        categories={categories}
        defaultCategoryId={targetCategoryIdForNewItem}
        onAddItem={addItem}
        onAddCategory={addCategory}
      />

      <YearRolloverModal
        isOpen={isYearRolloverOpen}
        onClose={() => setIsYearRolloverOpen(false)}
        currentYear={selectedYear}
        currentYearSurplus={calculateYearSurplus(selectedYear)}
        currentInitialBalance={initialBalance}
        availableYears={availableYears}
        onCreateNewYear={createNextYearBudget}
      />

      <FamilySyncModal
        isOpen={isFamilySyncOpen}
        onClose={() => setIsFamilySyncOpen(false)}
      />
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
