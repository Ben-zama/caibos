'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardValue } from '@/components/ui/Card';
import { AreaChart } from '@/components/ui/charts/AreaChart';
import { BarChart } from '@/components/ui/charts/BarChart';
import { DonutChart } from '@/components/ui/charts/DonutChart';
import { mockInvoices, mockExpenses, revenueChartData, expenseByCategory } from '@/lib/mock-data';
import { financeService } from '@/lib/api';
import { useApiQuery } from '@/hooks/useApiQuery';
import { formatCurrency } from '@/lib/format';
import { DollarSign, TrendingUp, TrendingDown, FileText, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const fmt = (n: number) => formatCurrency(n, 0);

export default function FinancePage() {
  const { data: invoices } = useApiQuery(() => financeService.getInvoices(), mockInvoices);
  const { data: expenses } = useApiQuery(() => financeService.getExpenses(), mockExpenses);
  const { data: revenueSeries } = useApiQuery(() => financeService.getRevenueChart(), revenueChartData);
  const { data: expenseBreakdown } = useApiQuery(() => financeService.getExpenseBreakdown(), expenseByCategory);

  const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.total, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const profit = totalRevenue - totalExpenses;
  const outstanding = invoices.filter(i => i.status === 'sent' || i.status === 'overdue').reduce((s, i) => s + i.total, 0);
  const profitMargin = totalRevenue > 0 ? ((profit / totalRevenue) * 100).toFixed(1) : '0.0';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Finance</h1>
          <p className="text-sm text-gray-500 mt-1">Track your revenue, expenses, and profitability</p>
        </div>
        <Link href="/dashboard/finance/invoices" className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors">
          New Invoice
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Revenue</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardValue>{fmt(totalRevenue)}</CardValue>
          <p className="mt-1 text-xs text-green-600 flex items-center gap-1"><TrendingUp className="h-3 w-3" /> +12.5% vs last month</p>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Expenses</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-red-100 flex items-center justify-center">
              <TrendingDown className="h-4 w-4 text-red-600" />
            </div>
          </CardHeader>
          <CardValue>{fmt(totalExpenses)}</CardValue>
          <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><TrendingDown className="h-3 w-3" /> +3.2% vs last month</p>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Net Profit</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-indigo-100 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-indigo-600" />
            </div>
          </CardHeader>
          <CardValue className={profit >= 0 ? 'text-green-600' : 'text-red-600'}>{fmt(profit)}</CardValue>
          <p className="mt-1 text-xs text-gray-400">Profit margin: {profitMargin}%</p>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Outstanding</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-amber-100 flex items-center justify-center">
              <FileText className="h-4 w-4 text-amber-600" />
            </div>
          </CardHeader>
          <CardValue>{fmt(outstanding)}</CardValue>
          <p className="mt-1 text-xs text-amber-600">{invoices.filter(i => i.status === 'overdue').length} overdue invoices</p>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Revenue vs Expenses</h3>
              <p className="text-xs text-gray-400 mt-0.5">Monthly comparison</p>
            </div>
            <Link href="/dashboard/finance/reports" className="text-xs text-indigo-600 hover:underline flex items-center gap-1">
              Full report <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <AreaChart
            data={revenueSeries}
            index="month"
            categories={['revenue', 'expenses']}
            colors={['#6366f1', '#10b981']}
            valueFormatter={fmt}
            className="h-60"
          />
        </Card>

        <Card>
          <CardHeader>
            <h3 className="font-semibold text-gray-900 dark:text-white">Expenses Breakdown</h3>
          </CardHeader>
          <DonutChart
            data={expenseBreakdown.map(e => ({ name: e.category, value: e.amount }))}
            valueFormatter={fmt}
            className="h-60"
          />
        </Card>
      </div>

      {/* Monthly bar chart */}
      <Card>
        <CardHeader>
          <h3 className="font-semibold text-gray-900 dark:text-white">Monthly Profit</h3>
        </CardHeader>
        <BarChart
          data={revenueSeries.map(d => ({
            month: d.month,
            profit: d.revenue - d.expenses,
          }))}
          index="month"
          categories={['profit']}
          colors={['#8b5cf6']}
          valueFormatter={fmt}
          className="h-48"
        />
      </Card>
    </div>
  );
}
