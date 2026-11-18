'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardValue } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useInventory } from '@/lib/inventory-context';
import { useAuth } from '@/lib/auth-context';
import { can } from '@/lib/permissions';
import { clsx } from '@/lib/clsx';
import {
  Search,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Plus,
  Download,
  Filter,
  Calendar,
  X,
  TrendingUp,
  TrendingDown,
  Package,
} from 'lucide-react';
import type { StockMovementType } from '@/types';

const typeColor: Record<StockMovementType, 'green' | 'red' | 'yellow'> = {
  in: 'green',
  out: 'red',
  adjustment: 'yellow',
};

const typeLabel: Record<StockMovementType, string> = {
  in: 'Stock In',
  out: 'Stock Out',
  adjustment: 'Adjustment',
};

const filters: { label: string; value: string }[] = [
  { label: 'All Movements', value: 'all' },
  { label: 'Stock In (Received)', value: 'in' },
  { label: 'Stock Out (Dispatched)', value: 'out' },
  { label: 'Adjustments / Audits', value: 'adjustment' },
];

export default function StockMovementsPage() {
  const { role } = useAuth();
  const canCreate = role ? can(role, 'canCreate') : false;

  const { movements, products, recordMovement } = useInventory();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [productFilter, setProductFilter] = useState('all');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [movProductId, setMovProductId] = useState('');
  const [movType, setMovType] = useState<StockMovementType>('in');
  const [movQty, setMovQty] = useState(1);
  const [movRef, setMovRef] = useState('');
  const [movNote, setMovNote] = useState('');

  const handleRecordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!movProductId || movQty <= 0) return;

    recordMovement({
      productId: movProductId,
      type: movType,
      quantity: movQty,
      reference: movRef || undefined,
      note: movNote || undefined,
    });

    setIsModalOpen(false);
    setMovProductId('');
    setMovQty(1);
    setMovRef('');
    setMovNote('');
  };

  const exportCSV = () => {
    const headers = ['ID', 'Product', 'Type', 'Quantity', 'Balance After', 'Date', 'Reference', 'Note'];
    const rows = filtered.map(m => [
      m.id,
      `"${m.productName.replace(/"/g, '""')}"`,
      m.type,
      m.quantity,
      m.balanceAfter ?? '',
      m.date,
      `"${(m.reference || '').replace(/"/g, '""')}"`,
      `"${(m.note || '').replace(/"/g, '""')}"`,
    ].join(','));

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `stock-movements-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Metrics
  const totalIn = movements
    .filter(m => m.type === 'in')
    .reduce((s, m) => s + Math.abs(m.quantity), 0);
  const totalOut = movements
    .filter(m => m.type === 'out')
    .reduce((s, m) => s + Math.abs(m.quantity), 0);
  const totalAdj = movements
    .filter(m => m.type === 'adjustment')
    .reduce((s, m) => s + m.quantity, 0);
  const netStockDelta = totalIn - totalOut + totalAdj;

  const filtered = movements
    .filter(m => {
      const matchSearch =
        m.productName.toLowerCase().includes(search.toLowerCase()) ||
        (m.reference ?? '').toLowerCase().includes(search.toLowerCase()) ||
        (m.note ?? '').toLowerCase().includes(search.toLowerCase());
      const matchType = typeFilter === 'all' || m.type === typeFilter;
      const matchProduct = productFilter === 'all' || m.productId === productFilter;
      return matchSearch && matchType && matchProduct;
    })
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Stock Movements</h1>
          <p className="text-sm text-gray-500 mt-1">
            Complete traceability and audit log of all inventory ins, outs, and quantity adjustments
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={exportCSV}>
            <Download className="h-4 w-4" /> Export CSV
          </Button>
          {canCreate && (
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="h-4 w-4" /> Record Movement
            </Button>
          )}
        </div>
      </div>

      {/* Movement Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Stock Received</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center dark:bg-green-900/40">
              <ArrowUp className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardValue className="text-emerald-600 dark:text-emerald-400">+{totalIn}</CardValue>
          <p className="mt-1 text-xs text-gray-400">Total units received from orders & vendors</p>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Stock Dispatched</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-red-100 flex items-center justify-center dark:bg-red-900/40">
              <ArrowDown className="h-4 w-4 text-red-600 dark:text-red-400" />
            </div>
          </CardHeader>
          <CardValue className="text-red-600 dark:text-red-400">-{totalOut}</CardValue>
          <p className="mt-1 text-xs text-gray-400">Sales dispatches and internal office usage</p>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Net Inventory Delta</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-indigo-100 flex items-center justify-center dark:bg-indigo-900/40">
              <TrendingUp className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            </div>
          </CardHeader>
          <CardValue className={netStockDelta >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-red-600'}>
            {netStockDelta >= 0 ? `+${netStockDelta}` : netStockDelta}
          </CardValue>
          <p className="mt-1 text-xs text-gray-400">Net physical change across warehouse</p>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Transactions</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center dark:bg-gray-800">
              <RefreshCw className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </div>
          </CardHeader>
          <CardValue>{movements.length}</CardValue>
          <p className="mt-1 text-xs text-gray-400">Logged audit entries recorded</p>
        </Card>
      </div>

      {/* Filters Card */}
      <Card>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by product, reference #, or note..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={productFilter}
              onChange={e => setProductFilter(e.target.value)}
              className="rounded-lg border border-gray-200 bg-white py-2 px-3 text-xs text-gray-700 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
            >
              <option value="all">All Products</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            <div className="flex gap-1 flex-wrap">
              {filters.map(f => (
                <button
                  key={f.value}
                  onClick={() => setTypeFilter(f.value)}
                  className={clsx(
                    'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                    typeFilter === f.value
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Movements Table */}
      <Card className="p-0 overflow-hidden">
        <CardHeader className="px-6 pt-6 pb-4 mb-0">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            {filtered.length} Movement Record{filtered.length !== 1 ? 's' : ''}
          </h3>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Product</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Change</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Balance After</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Reference</th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Note / Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filtered.map(m => {
                const isPositive = m.quantity > 0;
                return (
                  <tr key={m.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="py-3 px-6">
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                            m.type === 'in' ? 'bg-green-100 text-green-600 dark:bg-green-900/40' :
                            m.type === 'out' ? 'bg-red-100 text-red-600 dark:bg-red-900/40' :
                            'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/40'
                          }`}
                        >
                          {m.type === 'in' ? <ArrowUp className="h-4 w-4" /> : m.type === 'out' ? <ArrowDown className="h-4 w-4" /> : <RefreshCw className="h-4 w-4" />}
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {m.productName}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge color={typeColor[m.type]}>{typeLabel[m.type]}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-sm font-bold ${
                        m.type === 'in' ? 'text-green-600' : m.type === 'out' ? 'text-red-600' : isPositive ? 'text-green-600' : 'text-amber-600'
                      }`}>
                        {m.type === 'in' ? '+' : m.type === 'out' ? '-' : isPositive ? '+' : ''}
                        {Math.abs(m.quantity)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {m.balanceAfter !== undefined ? `${m.balanceAfter} units` : '-'}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400">{m.date}</td>
                    <td className="py-3 px-4 text-xs font-mono text-indigo-600 dark:text-indigo-400 font-medium">
                      {m.reference || '-'}
                    </td>
                    <td className="py-3 px-6 text-sm text-gray-600 dark:text-gray-300">
                      {m.note || '-'}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-sm text-gray-400">
                    No movements match your search filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Record Movement Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900 dark:border dark:border-gray-800">
            <div className="flex items-center justify-between border-b pb-3 dark:border-gray-800">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Record Stock Movement</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleRecordSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase mb-1">
                  Movement Type *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setMovType('in')}
                    className={`flex items-center justify-center gap-2 rounded-lg py-2 px-3 text-sm font-medium border transition-colors ${
                      movType === 'in'
                        ? 'bg-green-50 border-green-500 text-green-700 dark:bg-green-950/40 dark:text-green-300'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <ArrowUp className="h-4 w-4" /> Stock In
                  </button>
                  <button
                    type="button"
                    onClick={() => setMovType('out')}
                    className={`flex items-center justify-center gap-2 rounded-lg py-2 px-3 text-sm font-medium border transition-colors ${
                      movType === 'out'
                        ? 'bg-red-50 border-red-500 text-red-700 dark:bg-red-950/40 dark:text-red-300'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <ArrowDown className="h-4 w-4" /> Stock Out
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase mb-1">
                  Product *
                </label>
                <select
                  value={movProductId}
                  onChange={e => setMovProductId(e.target.value)}
                  required
                  className="w-full rounded-lg border border-gray-200 bg-white py-2 px-3 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  <option value="">Select a product...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Current: {p.stock} {p.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase mb-1">
                  Quantity *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={movQty}
                  onChange={e => setMovQty(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full rounded-lg border border-gray-200 bg-white py-2 px-3 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase mb-1">
                  Reference # (PO, Sales Order, Invoice)
                </label>
                <input
                  type="text"
                  placeholder="e.g. SO-2026-0422"
                  value={movRef}
                  onChange={e => setMovRef(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white py-2 px-3 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase mb-1">
                  Note
                </label>
                <input
                  type="text"
                  placeholder="e.g. Delivered to client branch"
                  value={movNote}
                  onChange={e => setMovNote(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white py-2 px-3 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 border-t pt-3 dark:border-gray-800">
                <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Record Movement
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
