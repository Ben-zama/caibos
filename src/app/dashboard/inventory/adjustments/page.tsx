'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardValue } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useInventory } from '@/lib/inventory-context';
import { clsx } from '@/lib/clsx';
import {
  RefreshCw,
  AlertTriangle,
  ClipboardCheck,
  Search,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  Package,
} from 'lucide-react';

const REASON_PRESETS = [
  'Physical inventory audit count',
  'Damaged units written off during inspection',
  'Lost or theft discrepancy',
  'Expired / degraded items discarded',
  'Promotional or marketing sample usage',
  'Customer return added back to stock',
  'Supplier shipment discrepancy resolution',
  'Other custom adjustment',
];

export default function AdjustmentsPage() {
  const { products, movements, adjustStock } = useInventory();

  const [selectedProductId, setSelectedProductId] = useState('');
  const [adjustmentMode, setAdjustmentMode] = useState<'delta' | 'exact'>('delta');
  const [deltaQuantity, setDeltaQuantity] = useState<number>(0);
  const [exactQuantity, setExactQuantity] = useState<number>(0);
  const [reasonPreset, setReasonPreset] = useState(REASON_PRESETS[0]);
  const [customNote, setCustomNote] = useState('');
  const [reference, setReference] = useState(`ADJ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);

  // History search filter
  const [historySearch, setHistorySearch] = useState('');

  const selectedProduct = products.find(p => p.id === selectedProductId);

  // Computed next stock
  const currentStock = selectedProduct ? selectedProduct.stock : 0;
  const nextStock = selectedProduct
    ? adjustmentMode === 'delta'
      ? Math.max(0, currentStock + deltaQuantity)
      : Math.max(0, exactQuantity)
    : 0;

  const actualDelta = adjustmentMode === 'delta' ? deltaQuantity : exactQuantity - currentStock;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedProductId || !selectedProduct) return;
    if (actualDelta === 0) return;

    const finalReason = customNote ? `${reasonPreset}: ${customNote}` : reasonPreset;

    adjustStock(
      selectedProductId,
      adjustmentMode === 'delta' ? deltaQuantity : exactQuantity,
      adjustmentMode,
      finalReason,
      reference
    );

    setSubmittedMessage(
      `Adjusted ${selectedProduct.name} by ${actualDelta > 0 ? `+${actualDelta}` : actualDelta} ${selectedProduct.unit}. New balance: ${nextStock} ${selectedProduct.unit}.`
    );

    // Reset form with new reference
    setTimeout(() => {
      setSubmittedMessage(null);
      setSelectedProductId('');
      setDeltaQuantity(0);
      setExactQuantity(0);
      setCustomNote('');
      setReference(`ADJ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
    }, 4000);
  }

  // Adjustments from history
  const pastAdjustments = movements
    .filter(m => m.type === 'adjustment')
    .sort((a, b) => b.date.localeCompare(a.date));

  const filteredHistory = pastAdjustments.filter(m =>
    m.productName.toLowerCase().includes(historySearch.toLowerCase()) ||
    (m.reference || '').toLowerCase().includes(historySearch.toLowerCase()) ||
    (m.note || '').toLowerCase().includes(historySearch.toLowerCase())
  );

  const netAdjustmentUnits = pastAdjustments.reduce((sum, a) => sum + a.quantity, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Stock Adjustments & Physical Audit</h1>
        <p className="text-sm text-gray-500 mt-1">
          Perform stock reconciliation, write-offs for damaged goods, and physical inventory count audits
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Adjustments Logged</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-indigo-100 flex items-center justify-center dark:bg-indigo-900/40">
              <ClipboardCheck className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            </div>
          </CardHeader>
          <CardValue>{pastAdjustments.length}</CardValue>
          <p className="mt-1 text-xs text-gray-400">Audit entries recorded</p>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Net Adjusted Units</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-yellow-100 flex items-center justify-center dark:bg-yellow-900/40">
              <RefreshCw className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            </div>
          </CardHeader>
          <CardValue className={netAdjustmentUnits >= 0 ? 'text-green-600' : 'text-amber-600'}>
            {netAdjustmentUnits > 0 ? `+${netAdjustmentUnits}` : netAdjustmentUnits}
          </CardValue>
          <p className="mt-1 text-xs text-gray-400">Total variance across all audits</p>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reconciliation Status</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center dark:bg-green-900/40">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardValue className="text-emerald-600 dark:text-emerald-400">Active</CardValue>
          <p className="mt-1 text-xs text-gray-400">Real-time ledger synchronization enabled</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Adjustment Entry Form (2 cols) */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Record Stock Adjustment</h3>
              <p className="text-xs text-gray-400 mt-0.5">Select mode and adjust stock with full traceability</p>
            </div>
            <RefreshCw className="h-5 w-5 text-gray-400" />
          </CardHeader>

          {submittedMessage ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
              <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center dark:bg-emerald-950">
                <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Adjustment Successfully Recorded!</p>
              <p className="text-xs text-gray-500 max-w-xs">{submittedMessage}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Product Select */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase mb-1">
                  Product to Adjust *
                </label>
                <select
                  value={selectedProductId}
                  onChange={e => {
                    setSelectedProductId(e.target.value);
                    const p = products.find(prod => prod.id === e.target.value);
                    if (p) setExactQuantity(p.stock);
                  }}
                  className="w-full rounded-lg border border-gray-200 bg-white py-2 px-3 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  required
                >
                  <option value="">Choose a product...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Current: {p.stock} {p.unit})
                    </option>
                  ))}
                </select>
              </div>

              {/* Mode Toggle */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase mb-1">
                  Adjustment Method
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustmentMode('delta')}
                    className={clsx(
                      'rounded-lg py-2 px-3 text-xs font-medium border transition-colors',
                      adjustmentMode === 'delta'
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400'
                    )}
                  >
                    Quantity Delta (+ / -)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAdjustmentMode('exact');
                      if (selectedProduct) setExactQuantity(selectedProduct.stock);
                    }}
                    className={clsx(
                      'rounded-lg py-2 px-3 text-xs font-medium border transition-colors',
                      adjustmentMode === 'exact'
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400'
                    )}
                  >
                    Physical Count Match
                  </button>
                </div>
              </div>

              {/* Input according to mode */}
              {adjustmentMode === 'delta' ? (
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase mb-1">
                    Delta Change (+ units to add, - units to remove) *
                  </label>
                  <input
                    type="number"
                    value={deltaQuantity}
                    onChange={e => setDeltaQuantity(parseInt(e.target.value) || 0)}
                    placeholder="e.g. -2 or 5"
                    required
                    className="w-full rounded-lg border border-gray-200 bg-white py-2 px-3 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase mb-1">
                    Actual Physical Count Counted *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={exactQuantity}
                    onChange={e => setExactQuantity(Math.max(0, parseInt(e.target.value) || 0))}
                    placeholder="e.g. 25"
                    required
                    className="w-full rounded-lg border border-gray-200 bg-white py-2 px-3 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              )}

              {/* Live Preview Box */}
              {selectedProduct && (
                <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-3 text-xs space-y-1.5 border border-gray-100 dark:border-gray-800">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Current Ledger Stock</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{currentStock} {selectedProduct.unit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Variance (Delta)</span>
                    <span className={clsx('font-bold', actualDelta > 0 ? 'text-green-600' : actualDelta < 0 ? 'text-red-600' : 'text-gray-400')}>
                      {actualDelta > 0 ? `+${actualDelta}` : actualDelta} {selectedProduct.unit}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-1.5 dark:border-gray-700">
                    <span className="text-gray-700 dark:text-gray-300 font-medium">New Stock After Audit</span>
                    <span className="font-bold text-gray-900 dark:text-white text-sm">
                      {nextStock} {selectedProduct.unit}
                    </span>
                  </div>
                </div>
              )}

              {/* Reason Presets */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase mb-1">
                  Reason for Adjustment *
                </label>
                <select
                  value={reasonPreset}
                  onChange={e => setReasonPreset(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white py-2 px-3 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  {REASON_PRESETS.map(r => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reference */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase mb-1">
                  Audit Reference ID
                </label>
                <input
                  type="text"
                  value={reference}
                  onChange={e => setReference(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white py-2 px-3 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white font-mono text-xs"
                />
              </div>

              {/* Custom Details */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase mb-1">
                  Additional Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={customNote}
                  onChange={e => setCustomNote(e.target.value)}
                  placeholder="e.g. Counted shelf B-4 with inspector John"
                  className="w-full rounded-lg border border-gray-200 bg-white py-2 px-3 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={!selectedProductId || actualDelta === 0}
              >
                Apply Adjustment
              </Button>
            </form>
          )}
        </Card>

        {/* Audit Log / History Table (3 cols) */}
        <Card className="lg:col-span-3 p-0 overflow-hidden flex flex-col justify-between">
          <div>
            <CardHeader className="px-6 pt-6 pb-4 mb-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Adjustment Audit Trail</h3>
                <p className="text-xs text-gray-400 mt-0.5">Historical record of all manual modifications</p>
              </div>
              <div className="relative w-full sm:w-56">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search audit trail..."
                  value={historySearch}
                  onChange={e => setHistorySearch(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white py-1.5 pl-8 pr-3 text-xs text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
            </CardHeader>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Product</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Variance</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Balance After</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Reference</th>
                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filteredHistory.map(adj => {
                    const isPositive = adj.quantity > 0;
                    return (
                      <tr key={adj.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="py-3 px-6 text-sm font-medium text-gray-900 dark:text-white">
                          {adj.productName}
                        </td>
                        <td className="py-3 px-4">
                          <span className={clsx(
                            'text-xs font-bold px-2 py-0.5 rounded-full inline-block',
                            isPositive
                              ? 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300'
                              : 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300'
                          )}>
                            {isPositive ? `+${adj.quantity}` : adj.quantity}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300 font-semibold">
                          {adj.balanceAfter !== undefined ? `${adj.balanceAfter}` : '-'}
                        </td>
                        <td className="py-3 px-4 text-xs text-gray-500 dark:text-gray-400">{adj.date}</td>
                        <td className="py-3 px-4 text-xs font-mono text-indigo-600 dark:text-indigo-400">
                          {adj.reference}
                        </td>
                        <td className="py-3 px-6 text-xs text-gray-600 dark:text-gray-300 max-w-xs truncate" title={adj.note}>
                          {adj.note}
                        </td>
                      </tr>
                    );
                  })}
                  {filteredHistory.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-sm text-gray-400">
                        No adjustment records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
