export type MonthIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

export const MONTH_NAMES = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
] as const;

export const MONTH_FULL_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
] as const;

export interface BudgetItem {
  id: string;
  name: string;
  values: number[]; // Array of 12 values for Jan..Dez
}

export interface BudgetCategory {
  id: string;
  name: string;
  type: 'income' | 'expense';
  items: BudgetItem[];
}

export type PaymentMethod = 
  | 'credit_card' 
  | 'pix' 
  | 'cash' 
  | 'debit' 
  | 'bank_slip' 
  | 'transfer';

export interface RealTransaction {
  id: string;
  date: string; // YYYY-MM-DD
  month: MonthIndex;
  type: 'income' | 'expense';
  categoryId: string;
  categoryName: string;
  itemId?: string;
  itemName: string;
  amount: number;
  description: string;
  paymentMethod: PaymentMethod;
  status: 'paid' | 'pending';
  createdAt: number;
}

export interface MonthSummary {
  monthIndex: MonthIndex;
  monthName: string;
  plannedIncome: number;
  plannedExpense: number;
  plannedBalance: number;
  actualIncome: number;
  actualExpense: number;
  actualBalance: number;
  cumulativePlannedBalance: number;
  cumulativeActualBalance: number; // Saldo de caixa real acumulado com base nos gastos reais
  savingsRate: number; // percentage (0 - 100)
}

export interface FinancialHealthStatus {
  score: number; // 0 to 100
  tier: 'Excelente' | 'Saudável' | 'Atenção' | 'Crítico';
  savingsRateAnnual: number;
  totalIncomeAnnual: number;
  totalExpenseAnnual: number;
  annualSurplus: number;
  emergencyFundMonths: number;
  debtRatio: number; // credit card / income
  insights: {
    type: 'success' | 'warning' | 'info';
    title: string;
    description: string;
  }[];
}

export interface YearBudgetPlan {
  categories: BudgetCategory[];
  initialBalance: number; // Saldo de caixa inicial / herdado do ano anterior
}

export interface YearRolloverConfig {
  sourceYear: number;
  newYear: number;
  strategy: 'copy_structure_and_values' | 'copy_structure_only' | 'blank';
  carryOverBalance: boolean;
  adjustmentPercentage?: number;
}

export interface SalaryStrategyConfig {
  mode: 'split_vale_pagamento' | 'single_payment';
  valePercent: number; // ex: 40%
  valeDay: number; // ex: 20
  paymentDay: number; // ex: 5
  singlePaymentDay: number; // ex: 5
  monthlyNetSalary: number; // Salário líquido do mês
}

export interface RealCashPosition {
  initialAccountBalance: number;
  totalPaidIncome: number;
  totalPaidExpense: number;
  currentRealBalance: number; // Saldo real disponível em conta hoje
  totalPendingIncome: number;
  totalPendingExpense: number;
  projectedRealBalance: number; // Saldo real projetado com pendências quitadas
  currentMonthPaidIncome: number;
  currentMonthPaidExpense: number;
  currentMonthRealBalance: number; // Saldo real do mês ativo
}
