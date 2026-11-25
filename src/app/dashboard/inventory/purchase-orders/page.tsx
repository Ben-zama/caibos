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
  ShoppingCart,
  Plus,
  Search,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  Eye,
  X,
  Trash2,
  Download,
  AlertTriangle,
} from 'lucide-react';
import type { PurchaseOrder, PurchaseOrderStatus, PurchaseOrderItem } from '@/types';

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

function getDefaultExpectedDate() {
  const date = new Date();
  date.setDate(date.getDate() + 5);
  return date.toISOString().split('T')[0];
}

const statusBadgeColor: Record<PurchaseOrderStatus, 'gray' | 'blue' | 'green' | 'red'> = {
  draft: 'gray',
  ordered: 'blue',
  received: 'green',
  cancelled: 'red',
};

const statusLabel: Record<PurchaseOrderStatus, string> = {
  draft: 'Draft',
  ordered: 'Ordered / In Transit',
  received: 'Goods Received',
  cancelled: 'Cancelled',
};

export default function PurchaseOrdersPage() {
  const { role } = useAuth();
  const canCreate = role ? can(role, 'canCreate') : false;

  const {
    purchaseOrders,
    products,
    suppliers,
    createPurchaseOrder,
    updatePOStatus,
  } = useInventory();

  const [activeTab, setActiveTab] = useState<'all' | PurchaseOrderStatus>('all');
  const [search, setSearch] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [viewingPO, setViewingPO] = useState<PurchaseOrder | null>(null);

  // Form State
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [expectedDate, setExpectedDate] = useState('');
  const [poNotes, setPoNotes] = useState('');
  const [items, setItems] = useState<PurchaseOrderItem[]>([
    {
      productId: products[0]?.id || '',
      productName: products[0]?.name || '',
      sku: products[0]?.sku || '',
      quantity: 10,
      unitCost: products[0]?.costPrice || 0,
      total: (products[0]?.costPrice || 0) * 10,
    },
  ]);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4500);
  };

  const handleAddItem = () => {
    const prod = products[0];
    if (!prod) return;
    setItems([
      ...items,
      {
        productId: prod.id,
        productName: prod.name,
        sku: prod.sku,
        quantity: 10,
        unitCost: prod.costPrice,
        total: prod.costPrice * 10,
      },
    ]);
  };

  const handleItemProductChange = (index: number, prodId: string) => {
    const prod = products.find(p => p.id === prodId);
    if (!prod) return;
    const next = [...items];
    next[index] = {
      ...next[index],
      productId: prod.id,
      productName: prod.name,
      sku: prod.sku,
      unitCost: prod.costPrice,
      total: prod.costPrice * next[index].quantity,
    };
    setItems(next);
  };

  const handleItemQtyChange = (index: number, qty: number) => {
    const next = [...items];
    const safeQty = Math.max(1, qty);
    next[index] = {
      ...next[index],
      quantity: safeQty,
      total: next[index].unitCost * safeQty,
    };
    setItems(next);
  };

  const handleItemCostChange = (index: number, cost: number) => {
    const next = [...items];
    const safeCost = Math.max(0, cost);
    next[index] = {
      ...next[index],
      unitCost: safeCost,
      total: safeCost * next[index].quantity,
    };
    setItems(next);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const totalAmount = items.reduce((sum, item) => sum + item.total, 0);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const supplier = suppliers.find(s => s.id === selectedSupplierId) || suppliers[0];
    if (!supplier) return;

    const po = createPurchaseOrder({
      supplierId: supplier.id,
      supplierName: supplier.name,
      orderDate: new Date().toISOString().split('T')[0],
      expectedDate: expectedDate || getDefaultExpectedDate(),
      status: 'ordered',
      items,
      totalAmount,
      notes: poNotes,
    });

    showNotification(`Purchase Order ${po.poNumber} created and marked Ordered!`);
    setIsCreateOpen(false);
    setSelectedSupplierId('');
    setPoNotes('');
    setItems([
      {
        productId: products[0]?.id || '',
        productName: products[0]?.name || '',
        sku: products[0]?.sku || '',
        quantity: 10,
        unitCost: products[0]?.costPrice || 0,
        total: (products[0]?.costPrice || 0) * 10,
      },
    ]);
  };

  const handleReceivePO = (po: PurchaseOrder) => {
    updatePOStatus(po.id, 'received');
    showNotification(`PO ${po.poNumber} goods received! Inventory stock levels updated automatically.`);
    if (viewingPO?.id === po.id) {
      setViewingPO({ ...viewingPO, status: 'received' });
    }
  };

  const exportCSV = () => {
    const headers = ['PO Number', 'Supplier', 'Status', 'Order Date', 'Expected Date', 'Items Count', 'Total Amount', 'Notes'];
    const rows = filtered.map(po => [
      po.poNumber,
      `"${po.supplierName.replace(/"/g, '""')}"`,
      po.status,
      po.orderDate,
      po.expectedDate,
      po.items.reduce((s, i) => s + i.quantity, 0),
      po.totalAmount,
      `"${(po.notes || '').replace(/"/g, '""')}"`,
    ].join(','));

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `purchase-orders-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Metrics
  const activeOrdersCount = purchaseOrders.filter(p => p.status === 'ordered').length;
  const receivedOrdersCount = purchaseOrders.filter(p => p.status === 'received').length;
  const totalCommittedSpend = purchaseOrders
    .filter(p => p.status === 'ordered' || p.status === 'draft')
    .reduce((s, p) => s + p.totalAmount, 0);

  const filtered = purchaseOrders
    .filter(po => {
      const matchSearch =
        po.poNumber.toLowerCase().includes(search.toLowerCase()) ||
        po.supplierName.toLowerCase().includes(search.toLowerCase()) ||
        (po.notes || '').toLowerCase().includes(search.toLowerCase());
      const matchTab = activeTab === 'all' || po.status === activeTab;
      return matchSearch && matchTab;
    })
    .sort((a, b) => b.orderDate.localeCompare(a.orderDate));

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="flex items-center justify-between rounded-lg bg-emerald-50 border border-emerald-200 p-4 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-sm font-medium">{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-emerald-600 hover:text-emerald-800">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Purchase Orders</h1>
          <p className="text-sm text-gray-500 mt-1">
            Supplier procurement, replenishment orders, and automated receiving into warehouse
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={exportCSV}>
            <Download className="h-4 w-4" /> Export CSV
          </Button>
          {canCreate && (
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4" /> Create PO
            </Button>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Purchase Orders</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-indigo-100 flex items-center justify-center dark:bg-indigo-900/40">
              <ShoppingCart className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            </div>
          </CardHeader>
          <CardValue>{purchaseOrders.length}</CardValue>
          <p className="mt-1 text-xs text-gray-400">All-time procurement records</p>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Awaiting Delivery</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center dark:bg-blue-900/40">
              <Truck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardValue className="text-blue-600 dark:text-blue-400">{activeOrdersCount}</CardValue>
          <p className="mt-1 text-xs text-gray-400">Orders currently in transit</p>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Committed Spend</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-amber-100 flex items-center justify-center dark:bg-amber-900/40">
              <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
          </CardHeader>
          <CardValue className="text-amber-600 dark:text-amber-400">{fmt(totalCommittedSpend)}</CardValue>
          <p className="mt-1 text-xs text-gray-400">Pending & draft order totals</p>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Completed Deliveries</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center dark:bg-green-900/40">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardValue className="text-emerald-600 dark:text-emerald-400">{receivedOrdersCount}</CardValue>
          <p className="mt-1 text-xs text-gray-400">Successfully received & restocked</p>
        </Card>
      </div>

      {/* Tabs & Search */}
      <Card className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-1 flex-wrap">
            {(['all', 'draft', 'ordered', 'received', 'cancelled'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={clsx(
                  'rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors',
                  activeTab === tab
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
                )}
              >
                {tab === 'all' ? 'All Orders' : statusLabel[tab]}
                <span className="ml-1.5 text-xs opacity-75">
                  ({tab === 'all' ? purchaseOrders.length : purchaseOrders.filter(p => p.status === tab).length})
                </span>
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by PO # or supplier..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white py-1.5 pl-9 pr-4 text-xs text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>
        </div>
      </Card>

      {/* PO Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">PO Number</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Supplier</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Items Ordered</th>
                <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Value</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Order Date</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Expected Delivery</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="py-3 px-6 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filtered.map(po => {
                const totalUnits = po.items.reduce((s, i) => s + i.quantity, 0);
                return (
                  <tr key={po.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="py-3 px-6">
                      <button
                        onClick={() => setViewingPO(po)}
                        className="text-sm font-mono font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        {po.poNumber}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-white">
                      {po.supplierName}
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-600 dark:text-gray-300">
                      {po.items.length} line item{po.items.length !== 1 ? 's' : ''} ({totalUnits} units)
                    </td>
                    <td className="py-3 px-4 text-sm text-right font-bold text-gray-900 dark:text-white">
                      {fmt(po.totalAmount)}
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-500 dark:text-gray-400">{po.orderDate}</td>
                    <td className="py-3 px-4 text-xs text-gray-500 dark:text-gray-400">{po.expectedDate}</td>
                    <td className="py-3 px-4">
                      <Badge color={statusBadgeColor[po.status]}>{statusLabel[po.status]}</Badge>
                    </td>
                    <td className="py-3 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button size="sm" variant="secondary" onClick={() => setViewingPO(po)}>
                          <Eye className="h-3.5 w-3.5 mr-1" /> View
                        </Button>
                        {po.status === 'ordered' && canCreate && (
                          <Button size="sm" onClick={() => handleReceivePO(po)}>
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Receive Goods
                          </Button>
                        )}
                        {po.status === 'draft' && canCreate && (
                          <Button size="sm" onClick={() => updatePOStatus(po.id, 'ordered')}>
                            Send Order
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-sm text-gray-400">
                    No purchase orders found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* View PO Details Modal */}
      {viewingPO && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900 dark:border dark:border-gray-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Purchase Order {viewingPO.poNumber}
                </h3>
              </div>
              <button onClick={() => setViewingPO(null)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 text-xs">
                <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/50">
                  <span className="text-gray-400">Supplier</span>
                  <p className="font-semibold text-gray-900 dark:text-white mt-0.5">{viewingPO.supplierName}</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/50">
                  <span className="text-gray-400">Status</span>
                  <div className="mt-1">
                    <Badge color={statusBadgeColor[viewingPO.status]}>{statusLabel[viewingPO.status]}</Badge>
                  </div>
                </div>
                <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/50">
                  <span className="text-gray-400">Order Date</span>
                  <p className="font-semibold text-gray-900 dark:text-white mt-0.5">{viewingPO.orderDate}</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/50">
                  <span className="text-gray-400">Expected Delivery</span>
                  <p className="font-semibold text-gray-900 dark:text-white mt-0.5">{viewingPO.expectedDate}</p>
                </div>
              </div>

              {/* Items Table */}
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Ordered Line Items</h4>
                <div className="rounded-lg border border-gray-200 overflow-hidden dark:border-gray-800">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800 text-xs">
                    <thead className="bg-gray-50 dark:bg-gray-800/50">
                      <tr>
                        <th className="py-2 px-3 text-left">Product</th>
                        <th className="py-2 px-3 text-left">SKU</th>
                        <th className="py-2 px-3 text-right">Quantity</th>
                        <th className="py-2 px-3 text-right">Unit Cost</th>
                        <th className="py-2 px-3 text-right">Line Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {viewingPO.items.map((item, i) => (
                        <tr key={i}>
                          <td className="py-2 px-3 font-medium text-gray-900 dark:text-white">{item.productName}</td>
                          <td className="py-2 px-3 font-mono text-gray-500">{item.sku}</td>
                          <td className="py-2 px-3 text-right font-semibold">{item.quantity}</td>
                          <td className="py-2 px-3 text-right">{fmt(item.unitCost)}</td>
                          <td className="py-2 px-3 text-right font-bold text-gray-900 dark:text-white">{fmt(item.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50 dark:bg-gray-800/50 font-semibold border-t dark:border-gray-700">
                      <tr>
                        <td colSpan={4} className="py-2.5 px-3 text-right">Grand Total:</td>
                        <td className="py-2.5 px-3 text-right text-sm font-bold text-indigo-600 dark:text-indigo-400">
                          {fmt(viewingPO.totalAmount)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {viewingPO.notes && (
                <div className="rounded-lg bg-gray-50 p-3 text-xs text-gray-600 dark:bg-gray-800/50 dark:text-gray-300">
                  <span className="font-semibold block mb-0.5">Notes:</span>
                  {viewingPO.notes}
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center justify-between border-t pt-3 dark:border-gray-800">
              {viewingPO.status === 'ordered' && canCreate ? (
                <Button onClick={() => handleReceivePO(viewingPO)}>
                  <CheckCircle2 className="h-4 w-4 mr-1" /> Receive Items into Inventory
                </Button>
              ) : (
                <span />
              )}
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => setViewingPO(null)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Purchase Order Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900 dark:border dark:border-gray-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3 dark:border-gray-800">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Create Purchase Order</h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase mb-1">
                    Select Supplier *
                  </label>
                  <select
                    value={selectedSupplierId}
                    onChange={e => setSelectedSupplierId(e.target.value)}
                    required
                    className="w-full rounded-lg border border-gray-200 bg-white py-2 px-3 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="">Select a supplier...</option>
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} (Lead time: ~{s.leadTimeDays} days)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase mb-1">
                    Expected Delivery Date
                  </label>
                  <input
                    type="date"
                    value={expectedDate}
                    onChange={e => setExpectedDate(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-white py-2 px-3 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>

              {/* Line items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                    Order Line Items ({items.length})
                  </label>
                  <Button type="button" size="sm" variant="secondary" onClick={handleAddItem}>
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add Item
                  </Button>
                </div>

                <div className="space-y-2">
                  {items.map((item, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-12 gap-2 items-center p-2.5 rounded-lg bg-gray-50 border border-gray-100 dark:bg-gray-800/50 dark:border-gray-800"
                    >
                      <div className="col-span-5">
                        <select
                          value={item.productId}
                          onChange={e => handleItemProductChange(index, e.target.value)}
                          className="w-full rounded border border-gray-200 bg-white py-1.5 px-2 text-xs text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                        >
                          {products.map(p => (
                            <option key={p.id} value={p.id}>
                              {p.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-span-2">
                        <input
                          type="number"
                          min="1"
                          placeholder="Qty"
                          value={item.quantity}
                          onChange={e => handleItemQtyChange(index, parseInt(e.target.value) || 1)}
                          className="w-full rounded border border-gray-200 bg-white py-1.5 px-2 text-xs text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white text-right"
                        />
                      </div>

                      <div className="col-span-2">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="Cost"
                          value={item.unitCost}
                          onChange={e => handleItemCostChange(index, parseFloat(e.target.value) || 0)}
                          className="w-full rounded border border-gray-200 bg-white py-1.5 px-2 text-xs text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white text-right"
                        />
                      </div>

                      <div className="col-span-2 text-right font-bold text-xs text-gray-900 dark:text-white">
                        {fmt(item.total)}
                      </div>

                      <div className="col-span-1 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          disabled={items.length <= 1}
                          className="text-gray-400 hover:text-red-600 disabled:opacity-30"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center mt-3 p-3 bg-gray-50 rounded-lg dark:bg-gray-800/40 font-semibold text-sm">
                  <span>Total Order Amount:</span>
                  <span className="text-base text-indigo-600 dark:text-indigo-400 font-bold">{fmt(totalAmount)}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase mb-1">
                  PO Notes / Delivery Instructions
                </label>
                <textarea
                  rows={2}
                  value={poNotes}
                  onChange={e => setPoNotes(e.target.value)}
                  placeholder="e.g. Please deliver to Warehouse Dock 2 before 4pm"
                  className="w-full rounded-lg border border-gray-200 bg-white py-2 px-3 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 border-t pt-3 dark:border-gray-800">
                <Button type="button" variant="secondary" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={!selectedSupplierId || items.length === 0}>
                  Create & Place Order
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
