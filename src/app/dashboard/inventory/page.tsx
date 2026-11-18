'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardValue } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { DonutChart } from '@/components/ui/charts/DonutChart';
import { BarChart } from '@/components/ui/charts/BarChart';
import { useInventory } from '@/lib/inventory-context';
import { useAuth } from '@/lib/auth-context';
import { can } from '@/lib/permissions';
import {
  Package,
  AlertTriangle,
  DollarSign,
  XCircle,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Plus,
  ShoppingCart,
  TrendingUp,
  CheckCircle2,
  X,
  Truck,
} from 'lucide-react';
import Link from 'next/link';

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

const movementTypeColor: Record<string, 'green' | 'red' | 'yellow'> = {
  in: 'green',
  out: 'red',
  adjustment: 'yellow',
};

export default function InventoryOverviewPage() {
  const { role } = useAuth();
  const canCreate = role ? can(role, 'canCreate') : false;

  const {
    products,
    movements,
    totalInventoryCost,
    totalRetailValue,
    potentialProfit,
    lowStockCount,
    outOfStockCount,
    inStockCount,
    quickReorder,
    adjustStock,
    recordMovement,
  } = useInventory();

  // Feedback notifications
  const [notification, setNotification] = useState<string | null>(null);

  // Quick Movement Modal
  const [movementModalOpen, setMovementModalOpen] = useState(false);
  const [movProductId, setMovProductId] = useState('');
  const [movType, setMovType] = useState<'in' | 'out'>('in');
  const [movQty, setMovQty] = useState(1);
  const [movRef, setMovRef] = useState('');
  const [movNote, setMovNote] = useState('');

  // Quick Adjustment Modal
  const [adjustModalProduct, setAdjustModalProduct] = useState<{ id: string; name: string; stock: number; unit: string } | null>(null);
  const [adjAmount, setAdjAmount] = useState(0);
  const [adjReason, setAdjReason] = useState('Physical audit count');

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleQuickReorder = (productId: string, productName: string) => {
    const product = products.find(p => p.id === productId);
    const reorderQty = product ? Math.max(10, product.reorderLevel * 2) : 10;
    const po = quickReorder(productId, reorderQty);
    if (po) {
      showNotification(`Purchase Order ${po.poNumber} created for ${reorderQty}x ${productName}!`);
    }
  };

  const handleMovementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!movProductId || movQty <= 0) return;
    const res = recordMovement({
      productId: movProductId,
      type: movType,
      quantity: movQty,
      reference: movRef || undefined,
      note: movNote || undefined,
    });
    if (res) {
      showNotification(`Recorded ${movType === 'in' ? 'Stock In' : 'Stock Out'} of ${movQty} units.`);
      setMovementModalOpen(false);
      setMovProductId('');
      setMovQty(1);
      setMovRef('');
      setMovNote('');
    }
  };

  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustModalProduct || adjAmount === 0) return;
    adjustStock(adjustModalProduct.id, adjAmount, 'delta', adjReason);
    showNotification(`Stock adjusted for ${adjustModalProduct.name}.`);
    setAdjustModalProduct(null);
    setAdjAmount(0);
  };

  const donutData = [
    { name: 'In Stock', value: inStockCount },
    { name: 'Low Stock', value: lowStockCount },
    { name: 'Out of Stock', value: outOfStockCount },
  ];

  // Category breakdown for chart
  const categories = Array.from(new Set(products.map(p => p.category)));
  const categoryBarData = categories.map(cat => {
    const prods = products.filter(p => p.category === cat);
    const value = prods.reduce((sum, p) => sum + p.costPrice * p.stock, 0);
    const count = prods.reduce((sum, p) => sum + p.stock, 0);
    return {
      category: cat,
      'Value ($)': Math.round(value),
      'Units': count,
    };
  });

  const recentMovements = [...movements].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
  const lowStockProducts = products.filter(p => p.status === 'low_stock' || p.status === 'out_of_stock');

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="flex items-center justify-between rounded-lg bg-emerald-50 border border-emerald-200 p-4 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300 transition-all">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-sm font-medium">{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-emerald-600 hover:text-emerald-800 dark:hover:text-emerald-200">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Header with Quick Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Inventory Overview</h1>
          <p className="text-sm text-gray-500 mt-1">Real-time stock tracking, valuation, and supply replenishment</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {canCreate && (
            <>
              <Button variant="secondary" onClick={() => setMovementModalOpen(true)}>
                <RefreshCw className="h-4 w-4" /> Quick Movement
              </Button>
              <Link href="/dashboard/inventory/purchase-orders">
                <Button variant="secondary">
                  <ShoppingCart className="h-4 w-4" /> Purchase Orders
                </Button>
              </Link>
              <Link href="/dashboard/inventory/products">
                <Button>
                  <Plus className="h-4 w-4" /> Add Product
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Catalog</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-indigo-100 flex items-center justify-center dark:bg-indigo-900/40">
              <Package className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            </div>
          </CardHeader>
          <CardValue>{products.length}</CardValue>
          <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
            <span>{categories.length} categories</span>
            <span className="text-emerald-600 font-medium">{inStockCount} in stock</span>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inventory Valuation</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center dark:bg-green-900/40">
              <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardValue className="text-emerald-600 dark:text-emerald-400">{fmt(totalInventoryCost)}</CardValue>
          <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
            <span>Retail value: </span>
            <span className="font-semibold text-gray-800 dark:text-gray-200">{fmt(totalRetailValue)}</span>
            <span className="text-emerald-600 ml-auto flex items-center">
              <TrendingUp className="h-3 w-3 mr-0.5" /> +{fmt(potentialProfit)}
            </span>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Low Stock Alerts</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-yellow-100 flex items-center justify-center dark:bg-yellow-900/40">
              <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            </div>
          </CardHeader>
          <CardValue className="text-yellow-600 dark:text-yellow-400">{lowStockCount}</CardValue>
          <p className="mt-1 text-xs text-gray-400">Products below reorder threshold</p>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Out of Stock</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-red-100 flex items-center justify-center dark:bg-red-900/40">
              <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            </div>
          </CardHeader>
          <CardValue className="text-red-600 dark:text-red-400">{outOfStockCount}</CardValue>
          <p className="mt-1 text-xs text-gray-400">Zero inventory items requiring restocking</p>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Stock Status</h3>
              <p className="text-xs text-gray-400 mt-0.5">Availability split</p>
            </div>
          </CardHeader>
          <DonutChart
            data={donutData}
            colors={['#10b981', '#f59e0b', '#ef4444']}
            className="h-56"
          />
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Category Valuation ($)</h3>
              <p className="text-xs text-gray-400 mt-0.5">Capital invested per inventory department</p>
            </div>
            <Link href="/dashboard/inventory/products" className="text-xs text-indigo-600 hover:underline flex items-center gap-1">
              Browse products <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <BarChart
            data={categoryBarData}
            index="category"
            categories={['Value ($)']}
            colors={['#6366f1']}
            valueFormatter={(v) => fmt(v)}
            className="h-56"
          />
        </Card>
      </div>

      {/* Low Stock Attention Table */}
      <Card>
        <CardHeader>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900 dark:text-white">Low Stock & Reorder Queue</h3>
              {lowStockProducts.length > 0 && (
                <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-600 dark:bg-red-900/40 dark:text-red-400">
                  {lowStockProducts.length} Action Needed
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-0.5">Automated threshold warnings and 1-click supplier reordering</p>
          </div>
          <Link href="/dashboard/inventory/purchase-orders" className="text-xs text-indigo-600 hover:underline flex items-center gap-1">
            View all purchase orders <ArrowRight className="h-3 w-3" />
          </Link>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
            <thead>
              <tr className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Current Stock</th>
                <th className="py-3 px-4">Reorder Point</th>
                <th className="py-3 px-4">Preferred Supplier</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {lowStockProducts.map(p => {
                const deficit = p.reorderLevel - p.stock;
                return (
                  <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="py-3 px-4">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{p.name}</p>
                      <p className="text-xs text-gray-400">{p.category}</p>
                    </td>
                    <td className="py-3 px-4 text-sm font-mono text-gray-500 dark:text-gray-400">{p.sku}</td>
                    <td className="py-3 px-4 text-xs text-gray-500 dark:text-gray-400">{p.location || 'Warehouse Main'}</td>
                    <td className="py-3 px-4">
                      <span className={`text-sm font-semibold ${p.stock === 0 ? 'text-red-600' : 'text-amber-600'}`}>
                        {p.stock} {p.unit}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400">
                      {p.reorderLevel} {p.unit}
                      {deficit > 0 && <span className="ml-1 text-xs text-red-500">(-{deficit})</span>}
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-600 dark:text-gray-300">
                      {p.supplierName || 'Primary Supplier'}
                    </td>
                    <td className="py-3 px-4">
                      <Badge color={p.status === 'out_of_stock' ? 'red' : 'yellow'}>
                        {p.status === 'out_of_stock' ? 'Out of Stock' : 'Low Stock'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setAdjustModalProduct({ id: p.id, name: p.name, stock: p.stock, unit: p.unit })}
                        >
                          Adjust
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleQuickReorder(p.id, p.name)}
                        >
                          <ShoppingCart className="h-3.5 w-3.5 mr-1" /> Reorder
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {lowStockProducts.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-sm text-gray-400">
                    🎉 Excellent! All stock levels are currently healthy and above their reorder points.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Recent Movements Table */}
      <Card>
        <CardHeader>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Recent Stock Activity</h3>
            <p className="text-xs text-gray-400 mt-0.5">Audit log of all stock ins, outs, and manual adjustments</p>
          </div>
          <Link href="/dashboard/inventory/movements" className="text-xs text-indigo-600 hover:underline flex items-center gap-1">
            Full movement log <ArrowRight className="h-3 w-3" />
          </Link>
        </CardHeader>
        <div className="space-y-3">
          {recentMovements.map(mov => (
            <div
              key={mov.id}
              className="flex items-center justify-between gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 ${
                    mov.type === 'in' ? 'bg-green-100 text-green-600 dark:bg-green-900/40' :
                    mov.type === 'out' ? 'bg-red-100 text-red-600 dark:bg-red-900/40' :
                    'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/40'
                  }`}
                >
                  {mov.type === 'in' ? (
                    <ArrowUp className="h-4 w-4" />
                  ) : mov.type === 'out' ? (
                    <ArrowDown className="h-4 w-4" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{mov.productName}</p>
                  <p className="text-xs text-gray-400">
                    <span className="font-mono">{mov.reference}</span> · {mov.note} · {mov.date}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span
                  className={`text-sm font-semibold ${
                    mov.type === 'in' ? 'text-green-600' : mov.type === 'out' ? 'text-red-600' : 'text-yellow-600'
                  }`}
                >
                  {mov.type === 'in' ? '+' : mov.type === 'out' ? '-' : mov.quantity > 0 ? '+' : ''}{Math.abs(mov.quantity)}
                </span>
                <Badge color={movementTypeColor[mov.type]}>{mov.type}</Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Quick Movement Modal */}
      {movementModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900 dark:border dark:border-gray-800">
            <div className="flex items-center justify-between border-b pb-3 dark:border-gray-800">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Record Stock Movement</h3>
              <button onClick={() => setMovementModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleMovementSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase mb-1">
                  Movement Type
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
                    <ArrowUp className="h-4 w-4" /> Stock In (Receive)
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
                    <ArrowDown className="h-4 w-4" /> Stock Out (Dispatch)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase mb-1">
                  Select Product *
                </label>
                <select
                  value={movProductId}
                  onChange={e => setMovProductId(e.target.value)}
                  required
                  className="w-full rounded-lg border border-gray-200 bg-white py-2 px-3 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  <option value="">Choose a product...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Stock: {p.stock} {p.unit})
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
                  value={movQty}
                  onChange={e => setMovQty(Math.max(1, parseInt(e.target.value) || 1))}
                  required
                  className="w-full rounded-lg border border-gray-200 bg-white py-2 px-3 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase mb-1">
                  Reference # (e.g. PO, Invoice, Ticket)
                </label>
                <input
                  type="text"
                  placeholder="e.g. PO-2026-081"
                  value={movRef}
                  onChange={e => setMovRef(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white py-2 px-3 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase mb-1">
                  Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Restock from warehouse"
                  value={movNote}
                  onChange={e => setMovNote(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white py-2 px-3 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t dark:border-gray-800">
                <Button type="button" variant="secondary" onClick={() => setMovementModalOpen(false)}>
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

      {/* Quick Adjust Modal */}
      {adjustModalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900 dark:border dark:border-gray-800">
            <div className="flex items-center justify-between border-b pb-3 dark:border-gray-800">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Quick Stock Adjustment</h3>
              <button onClick={() => setAdjustModalProduct(null)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAdjustSubmit} className="mt-4 space-y-4">
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{adjustModalProduct.name}</p>
                <p className="text-xs text-gray-400">Current Stock: {adjustModalProduct.stock} {adjustModalProduct.unit}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase mb-1">
                  Stock Change (+/- Units) *
                </label>
                <input
                  type="number"
                  value={adjAmount}
                  onChange={e => setAdjAmount(parseInt(e.target.value) || 0)}
                  placeholder="e.g. 10 or -3"
                  required
                  className="w-full rounded-lg border border-gray-200 bg-white py-2 px-3 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Resulting stock:{' '}
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {Math.max(0, adjustModalProduct.stock + adjAmount)} {adjustModalProduct.unit}
                  </span>
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase mb-1">
                  Reason
                </label>
                <select
                  value={adjReason}
                  onChange={e => setAdjReason(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white py-2 px-3 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  <option value="Physical audit count">Physical audit count</option>
                  <option value="Damaged goods written off">Damaged goods written off</option>
                  <option value="Lost or theft discrepancy">Lost or theft discrepancy</option>
                  <option value="Customer return / replenishment">Customer return / replenishment</option>
                  <option value="Internal usage / samples">Internal usage / samples</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t dark:border-gray-800">
                <Button type="button" variant="secondary" onClick={() => setAdjustModalProduct(null)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Save Adjustment
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
