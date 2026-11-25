import { appConfig } from '@/config/app.config';

export function formatCurrency(amount: number, maximumFractionDigits = 0): string {
  return new Intl.NumberFormat(appConfig.locale.locale, {
    style: 'currency',
    currency: appConfig.locale.currency,
    maximumFractionDigits,
  }).format(amount);
}

export function formatDate(dateInput: string | Date): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (Number.isNaN(date.getTime())) return String(dateInput);
  return date.toLocaleDateString(appConfig.locale.locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
