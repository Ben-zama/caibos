import { isApiMode } from '@/config/app.config';
import { apiClient } from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import {
  expenseByCategory,
  mockExpenses,
  mockInvoices,
  mockPayments,
  revenueChartData,
} from '@/lib/mock-data';
import type { Expense, Invoice, Payment } from '@/types';

export interface RevenuePoint {
  month: string;
  revenue: number;
  expenses: number;
}

export interface ExpenseCategoryPoint {
  category: string;
  amount: number;
}

export const financeService = {
  async getInvoices(): Promise<Invoice[]> {
    if (isApiMode()) {
      return apiClient.get<Invoice[]>(ENDPOINTS.FINANCE.INVOICES);
    }
    return mockInvoices;
  },

  async getPayments(): Promise<Payment[]> {
    if (isApiMode()) {
      return apiClient.get<Payment[]>(ENDPOINTS.FINANCE.PAYMENTS);
    }
    return mockPayments;
  },

  async getExpenses(): Promise<Expense[]> {
    if (isApiMode()) {
      return apiClient.get<Expense[]>(ENDPOINTS.FINANCE.EXPENSES);
    }
    return mockExpenses;
  },

  async getRevenueChart(): Promise<RevenuePoint[]> {
    if (isApiMode()) {
      return apiClient.get<RevenuePoint[]>(ENDPOINTS.FINANCE.REVENUE_CHART);
    }
    return revenueChartData;
  },

  async getExpenseBreakdown(): Promise<ExpenseCategoryPoint[]> {
    if (isApiMode()) {
      return apiClient.get<ExpenseCategoryPoint[]>(ENDPOINTS.FINANCE.EXPENSE_BREAKDOWN);
    }
    return expenseByCategory;
  },
};
