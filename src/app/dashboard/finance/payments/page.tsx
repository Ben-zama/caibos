'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { mockPayments } from '@/lib/mock-data';
import { financeService } from '@/lib/api';
import { useApiQuery } from '@/hooks/useApiQuery';
import { formatCurrency } from '@/lib/format';
import { useAuth } from '@/lib/auth-context';
import { can } from '@/lib/permissions';
import { Plus, Search, ArrowUpRight, ArrowDownLeft, CreditCard, Banknote, Smartphone, Building2 } from 'lucide-react';

const fmt = (n: number) => formatCurrency(n, 0);

const methodIcon: Record<string, React.ElementType> = {
  bank_transfer: Building2,
  card: CreditCard,
  cash: Banknote,
  mobile_money: Smartphone,
};

const methodLabel: Record<string, string> = {
  bank_transfer: 'Bank Transfer',
  card: 'Card',
  cash: 'Cash',
  mobile_money: 'Mobile Money',
};

export default function PaymentsPage() {
  const { role } = useAuth();
  const { data: payments } = useApiQuery(() => financeService.getPayments(), mockPayments);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'incoming' | 'outgoing'>('all');

  const totalIn = payments.filter(p => p.type === 'incoming').reduce((s, p) => s + p.amount, 0);
  const totalOut = payments.filter(p => p.type === 'outgoing').reduce((s, p) => s + p.amount, 0);

  const filtered = payments.filter(p => {
    const matchFilter = filter === 'all' || p.type === filter;
    const matchSearch = p.description.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payments</h1>
          <p className="text-sm text-gray-500 mt-1">Track all incoming and outgoing payments</p>
        </div>
        {role && can(role, 'canCreate') && (
          <Button><Plus className="h-4 w-4" /> Record Payment</Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <p className="text-xs text-gray-500">Net Cash Flow</p>
          <p className={`mt-1 text-xl font-bold ${totalIn - totalOut >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {fmt(totalIn - totalOut)}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">This period</p>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-xs text-emerald-700 flex items-center gap-1"><ArrowDownLeft className="h-3 w-3" /> Total Incoming</p>
          <p className="mt-1 text-xl font-bold text-emerald-700">{fmt(totalIn)}</p>
          <p className="text-xs text-emerald-600 mt-0.5">{payments.filter(p => p.type === 'incoming').length} transactions</p>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-xs text-red-700 flex items-center gap-1"><ArrowUpRight className="h-3 w-3" /> Total Outgoing</p>
          <p className="mt-1 text-xl font-bold text-red-700">{fmt(totalOut)}</p>
          <p className="text-xs text-red-600 mt-0.5">{payments.filter(p => p.type === 'outgoing').length} transactions</p>
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-gray-200 p-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-1">
            {(['all', 'incoming', 'outgoing'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
                  filter === f ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search payments…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 py-2 text-sm placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:w-56"
            />
          </div>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {filtered.map(pay => {
            const MethodIcon = methodIcon[pay.method] ?? CreditCard;
            return (
              <div key={pay.id} className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${pay.type === 'incoming' ? 'bg-emerald-100' : 'bg-red-100'}`}>
                  {pay.type === 'incoming'
                    ? <ArrowDownLeft className="h-4 w-4 text-emerald-600" />
                    : <ArrowUpRight className="h-4 w-4 text-red-600" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white truncate">{pay.description}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <MethodIcon className="h-3 w-3 text-gray-400" />
                    <span className="text-xs text-gray-400">{methodLabel[pay.method]}</span>
                    {pay.reference && <span className="text-xs text-gray-300">· {pay.reference}</span>}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className={`font-semibold ${pay.type === 'incoming' ? 'text-emerald-600' : 'text-red-600'}`}>
                    {pay.type === 'incoming' ? '+' : '-'}{fmt(pay.amount)}
                  </p>
                  <p className="text-xs text-gray-400">{new Date(pay.date).toLocaleDateString()}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
