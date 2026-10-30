import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  BudgetCategory, 
  BudgetItem, 
  RealTransaction, 
  MonthIndex, 
  MONTH_NAMES, 
  MonthSummary, 
  FinancialHealthStatus,
  YearBudgetPlan,
  YearRolloverConfig,
  SalaryStrategyConfig,
  RealCashPosition
} from '../types/budget';
import { INITIAL_CATEGORIES, INITIAL_TRANSACTIONS } from '../data/initialData';

const STORAGE_YEAR_PLANS_KEY = 'orcamento_familia_year_plans_v2';
const STORAGE_SELECTED_YEAR_KEY = 'orcamento_familia_selected_year_v2';
const STORAGE_TRANSACTIONS_KEY = 'orcamento_familia_transactions_v2';
const STORAGE_INITIAL_ACCOUNT_BALANCE_KEY = 'orcamento_familia_initial_account_balance_v1';
const STORAGE_SALARY_STRATEGY_KEY = 'orcamento_familia_salary_strategy_v1';

export function useBudgetStore() {
  const [selectedYear, setSelectedYear] = useState<number>(() => {
    try {
      const savedYear = localStorage.getItem(STORAGE_SELECTED_YEAR_KEY);
      if (savedYear) {
        return parseInt(savedYear, 10) || 2026;
      }
    } catch (e) {
      console.error(e);
    }
    return 2026;
  });

  // Saldo real inicial em conta bancária (ponto de partida real)
  const [initialAccountBalance, setInitialAccountBalance] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_INITIAL_ACCOUNT_BALANCE_KEY);
      if (saved) {
        return parseFloat(saved) || 0;
      }
    } catch (e) {
      console.error(e);
    }
    return 1500; // Padrão inicial realista (ex: R$ 1.500 na conta ao começar)
  });

  // Estratégia de recebimento de salário (Vale + Pagamento vs Pagamento Único)
  const [salaryStrategy, setSalaryStrategy] = useState<SalaryStrategyConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_SALARY_STRATEGY_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error(e);
    }
    return {
      mode: 'split_vale_pagamento',
      valePercent: 40,
      valeDay: 20,
      paymentDay: 5,
      singlePaymentDay: 5,
      monthlyNetSalary: 9000,
    };
  });

  const [yearPlans, setYearPlans] = useState<Record<number, YearBudgetPlan>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_YEAR_PLANS_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
      const legacyCats = localStorage.getItem('orcamento_familia_categories_v1');
      if (legacyCats) {
        return {
          2026: {
            categories: JSON.parse(legacyCats),
            initialBalance: 0,
          },
        };
      }
    } catch (e) {
      console.error('Error loading saved year plans:', e);
    }
    return {
      2026: {
        categories: INITIAL_CATEGORIES,
        initialBalance: 0,
      },
    };
  });

  const [transactions, setTransactions] = useState<RealTransaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_TRANSACTIONS_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
      const legacyTxs = localStorage.getItem('orcamento_familia_transactions_v1');
      if (legacyTxs) {
        return JSON.parse(legacyTxs);
      }
    } catch (e) {
      console.error('Error loading saved transactions:', e);
    }
    return INITIAL_TRANSACTIONS;
  });

  // Current year plan
  const currentPlan = useMemo<YearBudgetPlan>(() => {
    if (yearPlans[selectedYear]) {
      return yearPlans[selectedYear];
    }
    return {
      categories: INITIAL_CATEGORIES,
      initialBalance: 0,
    };
  }, [yearPlans, selectedYear]);

  const categories = currentPlan.categories;
  const initialBalance = currentPlan.initialBalance || 0;

  // Available Years
  const availableYears = useMemo(() => {
    const years = Object.keys(yearPlans).map(Number).sort((a, b) => a - b);
    if (!years.includes(selectedYear)) {
      years.push(selectedYear);
      years.sort((a, b) => a - b);
    }
    return years;
  }, [yearPlans, selectedYear]);

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_YEAR_PLANS_KEY, JSON.stringify(yearPlans));
    } catch (e) {
      console.error('Failed to save year plans to localStorage:', e);
    }
  }, [yearPlans]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_SELECTED_YEAR_KEY, selectedYear.toString());
    } catch (e) {
      console.error(e);
    }
  }, [selectedYear]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_TRANSACTIONS_KEY, JSON.stringify(transactions));
    } catch (e) {
      console.error('Failed to save transactions to localStorage:', e);
    }
  }, [transactions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_INITIAL_ACCOUNT_BALANCE_KEY, initialAccountBalance.toString());
    } catch (e) {
      console.error(e);
    }
  }, [initialAccountBalance]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_SALARY_STRATEGY_KEY, JSON.stringify(salaryStrategy));
    } catch (e) {
      console.error(e);
    }
  }, [salaryStrategy]);

  // Helper to mutate categories for the current year
  const updateCurrentCategories = useCallback(
    (updater: (cats: BudgetCategory[]) => BudgetCategory[]) => {
      setYearPlans((prev) => {
        const existing = prev[selectedYear] || { categories: INITIAL_CATEGORIES, initialBalance: 0 };
        return {
          ...prev,
          [selectedYear]: {
            ...existing,
            categories: updater(existing.categories),
          },
        };
      });
    },
    [selectedYear]
  );

  // Actions for Planning / Categories / Items
  const updateItemValue = useCallback((categoryId: string, itemId: string, monthIndex: MonthIndex, value: number) => {
    updateCurrentCategories((prev) =>
      prev.map((cat) => {
        if (cat.id !== categoryId) return cat;
        return {
          ...cat,
          items: cat.items.map((item) => {
            if (item.id !== itemId) return item;
            const newValues = [...item.values];
            newValues[monthIndex] = Math.max(0, Number(value) || 0);
            return { ...item, values: newValues };
          }),
        };
      })
    );
  }, [updateCurrentCategories]);

  const fillItemAllMonths = useCallback((categoryId: string, itemId: string, value: number) => {
    updateCurrentCategories((prev) =>
      prev.map((cat) => {
        if (cat.id !== categoryId) return cat;
        return {
          ...cat,
          items: cat.items.map((item) => {
            if (item.id !== itemId) return item;
            return { ...item, values: Array(12).fill(Math.max(0, Number(value) || 0)) };
          }),
        };
      })
    );
  }, [updateCurrentCategories]);

  const addItem = useCallback((categoryId: string, itemName: string, initialValue: number = 0) => {
    if (!itemName.trim()) return;
    const newItem: BudgetItem = {
      id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: itemName.trim(),
      values: Array(12).fill(initialValue),
    };
    updateCurrentCategories((prev) =>
      prev.map((cat) => {
        if (cat.id !== categoryId) return cat;
        return {
          ...cat,
          items: [...cat.items, newItem],
        };
      })
    );
  }, [updateCurrentCategories]);

  const removeItem = useCallback((categoryId: string, itemId: string) => {
    updateCurrentCategories((prev) =>
      prev.map((cat) => {
        if (cat.id !== categoryId) return cat;
        return {
          ...cat,
          items: cat.items.filter((item) => item.id !== itemId),
        };
      })
    );
  }, [updateCurrentCategories]);

  const renameItem = useCallback((categoryId: string, itemId: string, newName: string) => {
    if (!newName.trim()) return;
    updateCurrentCategories((prev) =>
      prev.map((cat) => {
        if (cat.id !== categoryId) return cat;
        return {
          ...cat,
          items: cat.items.map((item) => (item.id === itemId ? { ...item, name: newName.trim() } : item)),
        };
      })
    );
  }, [updateCurrentCategories]);

  const addCategory = useCallback((name: string, type: 'income' | 'expense') => {
    if (!name.trim()) return;
    const newCategory: BudgetCategory = {
      id: `cat_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: name.trim(),
      type,
      items: [
        {
          id: `item_${Date.now()}_default`,
          name: 'Item 1',
          values: Array(12).fill(0),
        },
      ],
    };
    updateCurrentCategories((prev) => [...prev, newCategory]);
  }, [updateCurrentCategories]);

  const removeCategory = useCallback((categoryId: string) => {
    updateCurrentCategories((prev) => prev.filter((cat) => cat.id !== categoryId));
  }, [updateCurrentCategories]);

  const renameCategory = useCallback((categoryId: string, newName: string) => {
    if (!newName.trim()) return;
    updateCurrentCategories((prev) =>
      prev.map((cat) => (cat.id === categoryId ? { ...cat, name: newName.trim() } : cat))
    );
  }, [updateCurrentCategories]);

  const updateInitialBalance = useCallback((value: number) => {
    setYearPlans((prev) => {
      const existing = prev[selectedYear] || { categories: INITIAL_CATEGORIES, initialBalance: 0 };
      return {
        ...prev,
        [selectedYear]: {
          ...existing,
          initialBalance: Number(value) || 0,
        },
      };
    });
  }, [selectedYear]);

  const updateSalaryStrategy = useCallback((config: Partial<SalaryStrategyConfig>) => {
    setSalaryStrategy((prev) => ({ ...prev, ...config }));
  }, []);

  // Actions for Real Transactions
  const addTransaction = useCallback((tx: Omit<RealTransaction, 'id' | 'createdAt'>) => {
    const newTx: RealTransaction = {
      ...tx,
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: Date.now(),
    };
    setTransactions((prev) => [newTx, ...prev]);
  }, []);

  const updateTransaction = useCallback((updatedTx: RealTransaction) => {
    setTransactions((prev) => prev.map((t) => (t.id === updatedTx.id ? updatedTx : t)));
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Filter transactions for the selected year
  const currentYearTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const txYear = parseInt(t.date.slice(0, 4), 10);
      return isNaN(txYear) || txYear === selectedYear;
    });
  }, [transactions, selectedYear]);

  // CÁLCULO DO SALDO DE CAIXA REAL DA CONTA
  const realCashPosition: RealCashPosition = useMemo(() => {
    let totalPaidIncome = 0;
    let totalPaidExpense = 0;
    let totalPendingIncome = 0;
    let totalPendingExpense = 0;

    let currentMonthPaidIncome = 0;
    let currentMonthPaidExpense = 0;

    // Active reference month (e.g. November = index 10)
    const activeMonthIdx = 10;

    currentYearTransactions.forEach((t) => {
      if (t.status === 'paid') {
        if (t.type === 'income') {
          totalPaidIncome += t.amount;
          if (t.month === activeMonthIdx) currentMonthPaidIncome += t.amount;
        } else {
          totalPaidExpense += t.amount;
          if (t.month === activeMonthIdx) currentMonthPaidExpense += t.amount;
        }
      } else {
        if (t.type === 'income') {
          totalPendingIncome += t.amount;
        } else {
          totalPendingExpense += t.amount;
        }
      }
    });

    const currentRealBalance = initialAccountBalance + totalPaidIncome - totalPaidExpense;
    const projectedRealBalance = currentRealBalance + totalPendingIncome - totalPendingExpense;
    const currentMonthRealBalance = currentMonthPaidIncome - currentMonthPaidExpense;

    return {
      initialAccountBalance,
      totalPaidIncome,
      totalPaidExpense,
      currentRealBalance,
      totalPendingIncome,
      totalPendingExpense,
      projectedRealBalance,
      currentMonthPaidIncome,
      currentMonthPaidExpense,
      currentMonthRealBalance,
    };
  }, [currentYearTransactions, initialAccountBalance]);

  // Calculate year end surplus for any year
  const calculateYearSurplus = useCallback((year: number) => {
    const plan = yearPlans[year];
    if (!plan) return 0;
    let income = 0;
    let expense = 0;
    plan.categories.forEach((cat) => {
      cat.items.forEach((item) => {
        const itemSum = item.values.reduce((s, v) => s + v, 0);
        if (cat.type === 'income') income += itemSum;
        else expense += itemSum;
      });
    });
    return income - expense;
  }, [yearPlans]);

  // VIRADA DE ANO: Create New Year Budget
  const createNextYearBudget = useCallback((config: YearRolloverConfig) => {
    const { sourceYear, newYear, strategy, carryOverBalance, adjustmentPercentage } = config;
    const sourcePlan = yearPlans[sourceYear] || { categories: INITIAL_CATEGORIES, initialBalance: 0 };

    let newCategories: BudgetCategory[] = [];
    const multiplier = 1 + (Number(adjustmentPercentage) || 0) / 100;

    if (strategy === 'copy_structure_and_values') {
      newCategories = sourcePlan.categories.map((cat) => ({
        ...cat,
        items: cat.items.map((item) => ({
          ...item,
          values: item.values.map((v) => Math.round(v * multiplier * 100) / 100),
        })),
      }));
    } else if (strategy === 'copy_structure_only') {
      newCategories = sourcePlan.categories.map((cat) => ({
        ...cat,
        items: cat.items.map((item) => ({
          ...item,
          values: Array(12).fill(0),
        })),
      }));
    } else {
      newCategories = INITIAL_CATEGORIES.map((cat) => ({
        ...cat,
        items: cat.items.map((item) => ({
          ...item,
          values: Array(12).fill(0),
        })),
      }));
    }

    let newInitialBalance = 0;
    if (carryOverBalance) {
      const sourceSurplus = calculateYearSurplus(sourceYear);
      newInitialBalance = (sourcePlan.initialBalance || 0) + sourceSurplus;
    }

    setYearPlans((prev) => ({
      ...prev,
      [newYear]: {
        categories: newCategories,
        initialBalance: newInitialBalance,
      },
    }));

    setSelectedYear(newYear);
  }, [yearPlans, calculateYearSurplus]);

  const deleteYearPlan = useCallback((year: number) => {
    if (Object.keys(yearPlans).length <= 1) {
      alert('Não é possível excluir o único ano existente.');
      return;
    }
    setYearPlans((prev) => {
      const copy = { ...prev };
      delete copy[year];
      return copy;
    });
    const remaining = Object.keys(yearPlans).map(Number).filter((y) => y !== year);
    if (remaining.length > 0) {
      setSelectedYear(remaining[0]);
    }
  }, [yearPlans]);

  const resetToOriginalSpreadsheet = useCallback(() => {
    setYearPlans({
      2026: {
        categories: INITIAL_CATEGORIES,
        initialBalance: 0,
      },
    });
    setSelectedYear(2026);
    setTransactions(INITIAL_TRANSACTIONS);
    setInitialAccountBalance(1500);
    try {
      localStorage.removeItem(STORAGE_YEAR_PLANS_KEY);
      localStorage.removeItem(STORAGE_SELECTED_YEAR_KEY);
      localStorage.removeItem(STORAGE_TRANSACTIONS_KEY);
      localStorage.removeItem(STORAGE_INITIAL_ACCOUNT_BALANCE_KEY);
      localStorage.removeItem(STORAGE_SALARY_STRATEGY_KEY);
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Monthly Summaries & Real Actuals for current year
  const monthlySummaries: MonthSummary[] = useMemo(() => {
    let runningPlanned = initialBalance;
    let runningActual = initialAccountBalance;

    return (Array.from({ length: 12 }) as MonthIndex[]).map((_, mIdx) => {
      const monthIndex = mIdx as MonthIndex;
      let plannedIncome = 0;
      let plannedExpense = 0;

      categories.forEach((cat) => {
        const catSum = cat.items.reduce((sum, item) => sum + (item.values[monthIndex] || 0), 0);
        if (cat.type === 'income') {
          plannedIncome += catSum;
        } else {
          plannedExpense += catSum;
        }
      });

      const plannedBalance = plannedIncome - plannedExpense;
      runningPlanned += plannedBalance;

      // Real transactions for this month in the current year
      const monthTransactions = currentYearTransactions.filter((t) => t.month === monthIndex);
      let actualIncome = 0;
      let actualExpense = 0;
      monthTransactions.forEach((t) => {
        if (t.type === 'income') {
          actualIncome += t.amount;
        } else {
          actualExpense += t.amount;
        }
      });

      const actualBalance = actualIncome - actualExpense;
      runningActual += actualBalance;

      const savingsRate = plannedIncome > 0 ? Math.max(0, (plannedBalance / plannedIncome) * 100) : 0;

      return {
        monthIndex,
        monthName: MONTH_NAMES[monthIndex],
        plannedIncome,
        plannedExpense,
        plannedBalance,
        actualIncome,
        actualExpense,
        actualBalance,
        cumulativePlannedBalance: runningPlanned,
        cumulativeActualBalance: runningActual,
        savingsRate,
      };
    });
  }, [categories, currentYearTransactions, initialBalance, initialAccountBalance]);

  // Annual Totals
  const annualSummary = useMemo(() => {
    const totalPlannedIncome = monthlySummaries.reduce((acc, m) => acc + m.plannedIncome, 0);
    const totalPlannedExpense = monthlySummaries.reduce((acc, m) => acc + m.plannedExpense, 0);
    const totalPlannedBalance = totalPlannedIncome - totalPlannedExpense;

    const totalActualIncome = monthlySummaries.reduce((acc, m) => acc + m.actualIncome, 0);
    const totalActualExpense = monthlySummaries.reduce((acc, m) => acc + m.actualExpense, 0);
    const totalActualBalance = totalActualIncome - totalActualExpense;

    const savingsRate = totalPlannedIncome > 0 ? (totalPlannedBalance / totalPlannedIncome) * 100 : 0;

    return {
      initialBalance,
      totalPlannedIncome,
      totalPlannedExpense,
      totalPlannedBalance,
      finalCumulativePlanned: initialBalance + totalPlannedBalance,
      totalActualIncome,
      totalActualExpense,
      totalActualBalance,
      finalCumulativeActual: initialAccountBalance + totalActualBalance,
      savingsRate,
    };
  }, [monthlySummaries, initialBalance, initialAccountBalance]);

  // Financial Health Calculation
  const financialHealth: FinancialHealthStatus = useMemo(() => {
    const totalIncome = annualSummary.totalPlannedIncome;
    const totalExpense = annualSummary.totalPlannedExpense;
    const annualSurplus = annualSummary.totalPlannedBalance;
    const savingsRate = annualSummary.savingsRate;

    const avgMonthlyExpense = totalExpense / 12 || 1;
    const emergencyFundMonths = annualSurplus > 0 ? annualSurplus / avgMonthlyExpense : 0;

    const creditCardCat = categories.find((c) => c.name.toLowerCase().includes('obrig') || c.id === 'cat_obrigacoes');
    const creditCardItem = creditCardCat?.items.find((i) => i.name.toLowerCase().includes('cartão'));
    const totalCreditCard = creditCardItem?.values.reduce((s, v) => s + v, 0) || 0;
    const debtRatio = totalIncome > 0 ? (totalCreditCard / totalIncome) * 100 : 0;

    let score = 50;
    if (savingsRate >= 50) score += 30;
    else if (savingsRate >= 20) score += 20;
    else if (savingsRate >= 10) score += 10;
    else score -= 15;

    if (emergencyFundMonths >= 6) score += 15;
    else if (emergencyFundMonths >= 3) score += 10;

    if (debtRatio <= 20) score += 10;
    else if (debtRatio > 40) score -= 20;

    score = Math.min(100, Math.max(10, Math.round(score)));

    let tier: FinancialHealthStatus['tier'] = 'Atenção';
    if (score >= 85) tier = 'Excelente';
    else if (score >= 70) tier = 'Saudável';
    else if (score >= 50) tier = 'Atenção';
    else tier = 'Crítico';

    const insights: FinancialHealthStatus['insights'] = [];

    insights.push({
      type: 'info',
      title: 'Saldo de Caixa Real em Conta',
      description: `Seu saldo real apurado pelas movimentações é de ${realCashPosition.currentRealBalance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}. Mantenha os lançamentos em dia para acompanhar o dinheiro exato na conta.`,
    });

    if (savingsRate >= 40) {
      insights.push({
        type: 'success',
        title: `Excelente Capacidade de Poupança (${selectedYear})`,
        description: `Seu planejamento para ${selectedYear} prevê reter ${savingsRate.toFixed(1)}% da renda bruta total (${annualSurplus.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} no ano).`,
      });
    }

    if (emergencyFundMonths >= 6) {
      insights.push({
        type: 'success',
        title: 'Forte Cobertura de Emergência',
        description: `O superávit anual planejado cobre até ${emergencyFundMonths.toFixed(1)} meses do seu custo de vida médio mensal.`,
      });
    }

    if (totalCreditCard > 0) {
      insights.push({
        type: debtRatio > 30 ? 'warning' : 'info',
        title: 'Faturas de Cartão de Crédito',
        description: `O cartão consome ${debtRatio.toFixed(1)}% da sua renda (${totalCreditCard.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} no ano). ${debtRatio > 30 ? 'Atenção para não comprometer sua margem de segurança.' : 'Valor dentro da margem de conforto.'}`,
      });
    }

    return {
      score,
      tier,
      savingsRateAnnual: savingsRate,
      totalIncomeAnnual: totalIncome,
      totalExpenseAnnual: totalExpense,
      annualSurplus,
      emergencyFundMonths,
      debtRatio,
      insights,
    };
  }, [annualSummary, categories, selectedYear, realCashPosition.currentRealBalance]);

  // Comparison helper
  const getComparisonData = useCallback(
    (monthSelection: number | 'all') => {
      return categories.map((cat) => {
        let plannedTotal = 0;
        if (monthSelection === 'all') {
          plannedTotal = cat.items.reduce(
            (sum, item) => sum + item.values.reduce((s, v) => s + v, 0),
            0
          );
        } else {
          plannedTotal = cat.items.reduce(
            (sum, item) => sum + (item.values[monthSelection as MonthIndex] || 0),
            0
          );
        }

        const catTxs = currentYearTransactions.filter((t) => {
          if (t.categoryId !== cat.id) return false;
          if (monthSelection !== 'all' && t.month !== monthSelection) return false;
          return true;
        });

        const actualTotal = catTxs.reduce((sum, t) => sum + t.amount, 0);
        const difference = cat.type === 'expense' ? plannedTotal - actualTotal : actualTotal - plannedTotal;
        const percentUsed = plannedTotal > 0 ? (actualTotal / plannedTotal) * 100 : actualTotal > 0 ? 100 : 0;

        return {
          categoryId: cat.id,
          categoryName: cat.name,
          type: cat.type,
          plannedTotal,
          actualTotal,
          difference,
          percentUsed,
          transactionCount: catTxs.length,
          items: cat.items.map((item) => {
            const itemPlanned =
              monthSelection === 'all'
                ? item.values.reduce((s, v) => s + v, 0)
                : item.values[monthSelection as MonthIndex] || 0;

            const itemTxs = catTxs.filter((t) => t.itemId === item.id);
            const itemActual = itemTxs.reduce((s, t) => s + t.amount, 0);
            const itemDiff = cat.type === 'expense' ? itemPlanned - itemActual : itemActual - itemPlanned;
            const itemPct = itemPlanned > 0 ? (itemActual / itemPlanned) * 100 : itemActual > 0 ? 100 : 0;

            return {
              itemId: item.id,
              itemName: item.name,
              planned: itemPlanned,
              actual: itemActual,
              difference: itemDiff,
              percentUsed: itemPct,
              count: itemTxs.length,
            };
          }),
        };
      });
    },
    [categories, currentYearTransactions]
  );

  const exportSpreadsheetCSV = useCallback(() => {
    const headers = ['Ano', 'Tipo', 'Categoria', 'Item', ...MONTH_NAMES, 'Total Ano'];
    const rows: string[][] = [headers];

    categories.forEach((cat) => {
      cat.items.forEach((item) => {
        const total = item.values.reduce((s, v) => s + v, 0);
        rows.push([
          selectedYear.toString(),
          cat.type === 'income' ? 'RECEITA' : 'DESPESA',
          `"${cat.name}"`,
          `"${item.name}"`,
          ...item.values.map((v) => `"${v.toFixed(2).replace('.', ',')}"`),
          `"${total.toFixed(2).replace('.', ',')}"`,
        ]);
      });
    });

    const csvContent = '\uFEFF' + rows.map((r) => r.join(';')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orcamento_familia_${selectedYear}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [categories, selectedYear]);

  return {
    selectedYear,
    setSelectedYear,
    availableYears,
    createNextYearBudget,
    deleteYearPlan,
    calculateYearSurplus,
    initialBalance,
    updateInitialBalance,
    initialAccountBalance,
    setInitialAccountBalance,
    realCashPosition,
    salaryStrategy,
    updateSalaryStrategy,
    categories,
    transactions: currentYearTransactions,
    allTransactions: transactions,
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
    renameCategory,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    resetToOriginalSpreadsheet,
    getComparisonData,
    exportSpreadsheetCSV,
  };
}
