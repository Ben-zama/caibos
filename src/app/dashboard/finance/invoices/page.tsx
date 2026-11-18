'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { mockInvoices } from '@/lib/mock-data';
import { useAuth } from '@/lib/auth-context';
import { can } from '@/lib/permissions';
import type { InvoiceStatus } from '@/types';
import { Plus, Search, Eye, Download, Send } from 'lucide-react';

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

const statusConfig: Record<InvoiceStatus, { color: 'green' | 'blue' | 'red' | 'gray' | 'yellow'; label: string }> = {
  paid: { color: 'green', label: 'Paid' },
  sent: { color: 'blue', label: 'Sent' },
  overdue: { color: 'red', label: 'Overdue' },
  draft: { color: 'gray', label: 'Draft' },
  cancelled: { color: 'gray', label: 'Cancelled' },
};

const tabs = ['All', 'Draft', 'Sent', 'Paid', 'Overdue'] as const;

export default function InvoicesPage() {
  const { role } = useAuth();
  const [activeTab, setActiveTab] = useState<typeof tabs[number]>('All');
  const [search, setSearch] = useState('');

  const filtered = mockInvoices.filter(inv => {
    const matchTab = activeTab === 'All' || inv.status === activeTab.toLowerCase();
    const matchSearch = inv.clientName.toLowerCase().includes(search.toLowerCase()) ||
      inv.number.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const totals = {
    all: mockInvoices.reduce((s, i) => s + i.total, 0),
    paid: mockInvoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.total, 0),
    outstanding: mockInvoices.filter(i => i.status === 'sent' || i.status === 'overdue').reduce((s, i) => s + i.total, 0),
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Invoices</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and track your invoices</p>
        </div>
        {role && can(role, 'canCreate') && (
          <Button>
            <Plus className="h-4 w-4" /> New Invoice
          </Button>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <p className="text-xs text-gray-500">Total Invoiced</p>
          <p className="mt-1 text-xl font-bold text-gray-900 dark:text-white">{fmt(totals.all)}</p>
          <p className="text-xs text-gray-400 mt-0.5">{mockInvoices.length} invoices</p>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-xs text-emerald-700">Collected</p>
          <p className="mt-1 text-xl font-bold text-emerald-700">{fmt(totals.paid)}</p>
          <p className="text-xs text-emerald-600 mt-0.5">{mockInvoices.filter(i => i.status === 'paid').length} paid</p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-xs text-amber-700">Outstanding</p>
          <p className="mt-1 text-xl font-bold text-amber-700">{fmt(totals.outstanding)}</p>
          <p className="text-xs text-amber-600 mt-0.5">{mockInvoices.filter(i => i.status === 'overdue').length} overdue</p>
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        {/* Filters */}
        <div className="flex flex-col gap-3 border-b border-gray-200 p-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab}
                <span className="ml-1.5 rounded-full bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600">
                  {tab === 'All' ? mockInvoices.length : mockInvoices.filter(i => i.status === tab.toLowerCase()).length}
                </span>
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search invoices…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white sm:w-56"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50">
                <th className="px-4 py-3 text-left font-medium text-gray-500">Invoice</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Client</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500 hidden sm:table-cell">Issued</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500 hidden md:table-cell">Due</th>
                <th className="px-4 py-3 text-right font-medium text-gray-500">Amount</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 text-right font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-400">No invoices found</td>
                </tr>
              ) : filtered.map(inv => {
                const s = statusConfig[inv.status];
                return (
                  <tr key={inv.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{inv.number}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900 dark:text-white">{inv.clientName}</p>
                      <p className="text-xs text-gray-400">{inv.clientEmail}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{new Date(inv.issuedDate).toLocaleDateString()}</td>
                    <td className={`px-4 py-3 hidden md:table-cell ${inv.status === 'overdue' ? 'font-medium text-red-600' : 'text-gray-500'}`}>
                      {new Date(inv.dueDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-white">{fmt(inv.total)}</td>
                    <td className="px-4 py-3"><Badge color={s.color}>{s.label}</Badge></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600" title="View">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600" title="Download">
                          <Download className="h-4 w-4" />
                        </button>
                        {inv.status === 'draft' && role && can(role, 'canUpdate') && (
                          <button className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-indigo-600" title="Send">
                            <Send className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
