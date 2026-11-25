'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DonutChart } from '@/components/ui/charts/DonutChart';
import { mockExpenses, expenseByCategory } from '@/lib/mock-data';
import { financeService } from '@/lib/api';
import { useApiQuery } from '@/hooks/useApiQuery';
import { formatCurrency } from '@/lib/format';
import { useAuth } from '@/lib/auth-context';
import { can } from '@/lib/permissions';
import { Plus, Search } from 'lucide-react';

const fmt = (n: number) => formatCurrency(n, 0);

const categoryColors: Record<string, 'indigo' | 'green' | 'yellow' | 'red' | 'purple' | 'blue' | 'gray'> = {
  Rent: 'indigo',
  Software: 'blue',
  Marketing: 'purple',
  Meals: 'green',
  Supplies: 'yellow',
  Utilities: 'gray',
};

export default function ExpensesPage() {
  const { role } = useAuth();
  const { data: expenses } = useApiQuery(() => financeService.getExpenses(), mockExpenses);
  const { data: breakdown } = useApiQuery(() => financeService.getExpenseBreakdown(), expenseByCategory);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const categories = ['All', ...Array.from(new Set(expenses.map(e => e.category)))];
  const total = expenses.reduce((s, e) => s + e.amount, 0);

  const filtered = expenses.filter(exp => {
    const matchCat = categoryFilter === 'All' || exp.category === categoryFilter;
    const matchSearch = exp.description.toLowerCase().includes(search.toLowerCase()) ||
      (exp.vendor?.toLowerCase().includes(search.toLowerCase()) ?? false);
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Expenses</h1>
          <p className="text-sm text-gray-500 mt-1">Track and categorize your business expenses</p>
        </div>
        {role && can(role, 'canCreate') && (
          <Button><Plus className="h-4 w-4" /> Add Expense</Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Category breakdown */}
        <Card>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">By Category</h3>
          <p className="text-xs text-gray-400 mb-4">Total: {fmt(total)}</p>
          <DonutChart
            data={breakdown.map(e => ({ name: e.category, value: e.amount }))}
            valueFormatter={fmt}
            className="h-48"
          />
          <div className="mt-4 space-y-2">
            {breakdown.map(e => (
              <div key={e.category} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{e.category}</span>
                <div className="flex items-center gap-2">
                  <span className="text-gray-900 font-medium">{fmt(e.amount)}</span>
                  <span className="text-xs text-gray-400">{total > 0 ? ((e.amount / total) * 100).toFixed(0) : 0}%</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Table */}
        <Card className="lg:col-span-2 p-0 overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-gray-200 p-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-1 flex-wrap">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    categoryFilter === cat ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 py-2 text-sm placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:w-48"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50">
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Description</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Category</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 hidden sm:table-cell">Vendor</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 hidden md:table-cell">Date</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filtered.map(exp => (
                  <tr key={exp.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{exp.description}</td>
                    <td className="px-4 py-3">
                      <Badge color={categoryColors[exp.category] ?? 'gray'}>{exp.category}</Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{exp.vendor ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{new Date(exp.date).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-white">{fmt(exp.amount)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-200 bg-gray-50 dark:border-gray-700">
                  <td colSpan={4} className="px-4 py-3 font-semibold text-gray-900 dark:text-white">Total</td>
                  <td className="px-4 py-3 text-right font-bold text-gray-900 dark:text-white">
                    {fmt(filtered.reduce((s, e) => s + e.amount, 0))}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
