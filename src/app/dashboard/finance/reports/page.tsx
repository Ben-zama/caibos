'use client';

import React from 'react';
import { Card, CardHeader } from '@/components/ui/Card';
import { AreaChart } from '@/components/ui/charts/AreaChart';
import { BarChart } from '@/components/ui/charts/BarChart';
import { DonutChart } from '@/components/ui/charts/DonutChart';
import { Button } from '@/components/ui/Button';
import { mockInvoices, mockExpenses, revenueChartData, expenseByCategory } from '@/lib/mock-data';
import { Download, TrendingUp, TrendingDown, DollarSign, FileText } from 'lucide-react';

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

export default function ReportsPage() {
  const totalRevenue = mockInvoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.total, 0);
  const totalExpenses = mockExpenses.reduce((s, e) => s + e.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = ((netProfit / totalRevenue) * 100).toFixed(1);

  const plData = [
    { label: 'Gross Revenue', amount: totalRevenue, type: 'income' },
    { label: 'Total Expenses', amount: -totalExpenses, type: 'expense' },
    { label: 'Net Profit', amount: netProfit, type: 'profit' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports</h1>
          <p className="text-sm text-gray-500 mt-1">Financial insights and performance analytics</p>
        </div>
        <Button variant="secondary">
          <Download className="h-4 w-4" /> Export PDF
        </Button>
      </div>

      {/* KPI summary */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Total Revenue', value: fmt(totalRevenue), icon: DollarSign, color: 'green', trend: '+12.5%' },
          { label: 'Total Expenses', value: fmt(totalExpenses), icon: TrendingDown, color: 'red', trend: '+3.2%' },
          { label: 'Net Profit', value: fmt(netProfit), icon: TrendingUp, color: netProfit >= 0 ? 'green' : 'red', trend: `${profitMargin}% margin` },
          { label: 'Invoices Issued', value: mockInvoices.length.toString(), icon: FileText, color: 'indigo', trend: `${mockInvoices.filter(i => i.status === 'paid').length} paid` },
        ].map(item => (
          <div key={item.label} className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <p className="text-xs text-gray-500">{item.label}</p>
            <p className={`mt-1 text-xl font-bold text-gray-900 dark:text-white`}>{item.value}</p>
            <p className="mt-0.5 text-xs text-gray-400">{item.trend}</p>
          </div>
        ))}
      </div>

      {/* P&L Statement */}
      <Card>
        <CardHeader>
          <h3 className="font-semibold text-gray-900 dark:text-white">Profit & Loss Statement</h3>
          <span className="text-xs text-gray-400">Current Period</span>
        </CardHeader>
        <div className="space-y-3">
          {plData.map(row => (
            <div key={row.label} className={`flex items-center justify-between rounded-lg px-4 py-3 ${
              row.type === 'profit' ? 'bg-indigo-50 dark:bg-indigo-900/20' : 'bg-gray-50 dark:bg-gray-800/50'
            }`}>
              <span className={`font-medium ${row.type === 'profit' ? 'text-indigo-700' : 'text-gray-700 dark:text-gray-300'}`}>
                {row.label}
              </span>
              <span className={`text-lg font-bold ${
                row.type === 'income' ? 'text-green-600' :
                row.type === 'expense' ? 'text-red-600' :
                row.amount >= 0 ? 'text-indigo-700' : 'text-red-600'
              }`}>
                {row.amount < 0 ? `-${fmt(Math.abs(row.amount))}` : fmt(row.amount)}
              </span>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Revenue trend */}
        <Card>
          <CardHeader>
            <h3 className="font-semibold text-gray-900 dark:text-white">Revenue Trend</h3>
            <span className="text-xs text-gray-400">7 months</span>
          </CardHeader>
          <AreaChart
            data={revenueChartData}
            index="month"
            categories={['revenue', 'expenses']}
            colors={['#6366f1', '#10b981']}
            valueFormatter={fmt}
            className="h-52"
          />
        </Card>

        {/* Expense breakdown */}
        <Card>
          <CardHeader>
            <h3 className="font-semibold text-gray-900 dark:text-white">Expense Categories</h3>
          </CardHeader>
          <DonutChart
            data={expenseByCategory.map(e => ({ name: e.category, value: e.amount }))}
            valueFormatter={fmt}
            className="h-52"
          />
        </Card>
      </div>

      {/* Monthly profit bar */}
      <Card>
        <CardHeader>
          <h3 className="font-semibold text-gray-900 dark:text-white">Monthly Profit</h3>
        </CardHeader>
        <BarChart
          data={revenueChartData.map(d => ({
            month: d.month,
            profit: (d.revenue as number) - (d.expenses as number),
          }))}
          index="month"
          categories={['profit']}
          colors={['#8b5cf6']}
          valueFormatter={fmt}
          className="h-48"
        />
      </Card>

      {/* Invoice aging */}
      <Card>
        <CardHeader>
          <h3 className="font-semibold text-gray-900 dark:text-white">Invoice Aging Report</h3>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="pb-3 text-left font-medium text-gray-500">Client</th>
                <th className="pb-3 text-right font-medium text-gray-500">Current</th>
                <th className="pb-3 text-right font-medium text-gray-500">1-30 days</th>
                <th className="pb-3 text-right font-medium text-gray-500">31-60 days</th>
                <th className="pb-3 text-right font-medium text-gray-500">60+ days</th>
                <th className="pb-3 text-right font-medium text-gray-500">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {mockInvoices.filter(i => i.status !== 'paid' && i.status !== 'draft').map(inv => (
                <tr key={inv.id}>
                  <td className="py-3 font-medium text-gray-900 dark:text-white">{inv.clientName}</td>
                  <td className="py-3 text-right text-gray-500">{inv.status === 'sent' ? fmt(inv.total) : '—'}</td>
                  <td className="py-3 text-right text-gray-500">—</td>
                  <td className="py-3 text-right text-gray-500">{inv.status === 'overdue' ? fmt(inv.total) : '—'}</td>
                  <td className="py-3 text-right text-gray-500">—</td>
                  <td className="py-3 text-right font-semibold text-gray-900 dark:text-white">{fmt(inv.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
