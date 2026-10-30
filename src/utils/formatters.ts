import { PaymentMethod } from '../types/budget';

export function formatCurrency(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return 'R$ 0,00';
  }
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatCurrencyCompact(amount: number): string {
  if (Math.abs(amount) >= 1_000_000) {
    return `R$ ${(amount / 1_000_000).toFixed(1).replace('.', ',')}M`;
  }
  if (Math.abs(amount) >= 1_000) {
    return `R$ ${(amount / 1_000).toFixed(1).replace('.', ',')}k`;
  }
  return formatCurrency(amount);
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1).replace('.', ',')}%`;
}

export function formatDateBR(dateString: string): string {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  if (!year || !month || !day) return dateString;
  return `${day}/${month}/${year}`;
}

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  credit_card: 'Cartão de Crédito',
  pix: 'PIX',
  debit: 'Cartão de Débito',
  bank_slip: 'Boleto Bancário',
  cash: 'Dinheiro',
  transfer: 'Transferência / TED',
};
