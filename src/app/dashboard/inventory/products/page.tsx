'use client';

import React, { useState } from 'react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useInventory } from '@/lib/inventory-context';
import { useAuth } from '@/lib/auth-context';
import { can } from '@/lib/permissions';
import { clsx } from '@/lib/clsx';
import {
  Search,
  Plus,
  Package,
  LayoutGrid,
  List,
  Edit,
  Trash2,
  Eye,
  SlidersHorizontal,
  Download,
  AlertTriangle,
  X,
  MapPin,
  Barcode,
  Truck,
  TrendingUp,
} from 'lucide-react';
import type { Product, StockStatus } from '@/types';

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n);
}

const statusColor: Record<StockStatus, 'green' | 'yellow' | 'red'> = {
  in_stock: 'green',
  low_stock: 'yellow',
  out_of_stock: 'red',
};

const statusLabel: Record<StockStatus, string> = {
  in_stock: 'In Stock',
  low_stock: 'Low Stock',
  out_of_stock: 'Out of Stock',
};

export default function ProductsPage() {
  const { role } = useAuth();
  const canCreate = role ? can(role, 'canCreate') : false;
  const canDelete = role ? can(role, 'canDelete') : false;

  const {
    products,
    suppliers,
    movements,
    addProduct,
    updateProduct,
    deleteProduct,
    adjustStock,
  } = useInventory();

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'All' | StockStatus>('All');
  const [view, setView] = useState<'table' | 'grid'>('table');
  const [sortBy, setSortBy] = useState<'name' | 'stock' | 'sellingPrice' | 'margin'>('name');

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(null);
  const [adjustAmount, setAdjustAmount] = useState(0);
  const [adjustReason, setAdjustReason] = useState('Inventory audit');

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: 'Electronics',
    sellingPrice: 0,
    costPrice: 0,
    stock: 0,
    reorderLevel: 5,
    unit: 'unit',
    supplierId: '',
    location: '',
    barcode: '',
    description: '',
  });

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  const openAddModal = () => {
    setFormData({
      name: '',
      sku: `SKU-${Date.now().toString().slice(-4)}`,
      category: 'Electronics',
      sellingPrice: 100,
      costPrice: 60,
      stock: 10,
      reorderLevel: 5,
      unit: 'unit',
      supplierId: suppliers[0]?.id || '',
      location: 'Warehouse A - Bin 1',
      barcode: `${Math.floor(100000000000 + Math.random() * 900000000000)}`,
      description: '',
    });
    setIsAddOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      sku: p.sku,
      category: p.category,
      sellingPrice: p.sellingPrice,
      costPrice: p.costPrice,
      stock: p.stock,
      reorderLevel: p.reorderLevel,
      unit: p.unit,
      supplierId: p.supplierId || '',
      location: p.location || '',
      barcode: p.barcode || '',
      description: p.description || '',
    });
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const supplier = suppliers.find(s => s.id === formData.supplierId);

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        name: formData.name,
        sku: formData.sku,
        category: formData.category,
        sellingPrice: Number(formData.sellingPrice),
        costPrice: Number(formData.costPrice),
        stock: Number(formData.stock),
        reorderLevel: Number(formData.reorderLevel),
        unit: formData.unit,
        supplierId: formData.supplierId,
        supplierName: supplier?.name,
        location: formData.location,
        barcode: formData.barcode,
        description: formData.description,
      });
      setEditingProduct(null);
    } else {
      addProduct({
        name: formData.name,
        sku: formData.sku,
        category: formData.category,
        sellingPrice: Number(formData.sellingPrice),
        costPrice: Number(formData.costPrice),
        stock: Number(formData.stock),
        reorderLevel: Number(formData.reorderLevel),
        unit: formData.unit,
        supplierId: formData.supplierId,
        supplierName: supplier?.name,
        location: formData.location,
        barcode: formData.barcode,
        description: formData.description,
      });
      setIsAddOpen(false);
    }
  };

  const handleQuickAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingProduct || adjustAmount === 0) return;
    adjustStock(adjustingProduct.id, adjustAmount, 'delta', adjustReason);
    setAdjustingProduct(null);
    setAdjustAmount(0);
  };

  const exportCSV = () => {
    const headers = ['ID', 'Name', 'SKU', 'Category', 'Stock', 'Unit', 'Cost Price', 'Selling Price', 'Margin %', 'Status', 'Location', 'Supplier'];
    const rows = filtered.map(p => {
      const margin = p.sellingPrice > 0 ? (((p.sellingPrice - p.costPrice) / p.sellingPrice) * 100).toFixed(1) : '0';
      return [
        p.id,
        `"${p.name.replace(/"/g, '""')}"`,
        p.sku,
        p.category,
        p.stock,
        p.unit,
        p.costPrice,
        p.sellingPrice,
        `${margin}%`,
        p.status,
        `"${(p.location || '').replace(/"/g, '""')}"`,
        `"${(p.supplierName || '').replace(/"/g, '""')}"`,
      ].join(',');
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `inventory-catalog-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter and sort
  const filtered = products
    .filter(p => {
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase()) ||
        (p.barcode || '').includes(search);
      const matchCategory = category === 'All' || p.category === category;
      const matchStatus = statusFilter === 'All' || p.status === statusFilter;
      return matchSearch && matchCategory && matchStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'stock') return b.stock - a.stock;
      if (sortBy === 'sellingPrice') return b.sellingPrice - a.sellingPrice;
      if (sortBy === 'margin') {
        const marginA = a.sellingPrice > 0 ? (a.sellingPrice - a.costPrice) / a.sellingPrice : 0;
        const marginB = b.sellingPrice > 0 ? (b.sellingPrice - b.costPrice) / b.sellingPrice : 0;
        return marginB - marginA;
      }
      return 0;
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Product Catalog</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your items, stock thresholds, pricing, and locations ({products.length} total)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={exportCSV}>
            <Download className="h-4 w-4" /> Export CSV
          </Button>
          {canCreate && (
            <Button onClick={openAddModal}>
              <Plus className="h-4 w-4" /> Add Product
            </Button>
          )}
        </div>
      </div>

      {/* Filters and Controls Card */}
      <Card className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by product name, SKU, or barcode..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
            />
          </div>

          {/* Controls: Sort and View mode */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>Sort:</span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as 'name' | 'stock' | 'sellingPrice' | 'margin')}
                className="rounded-lg border border-gray-200 bg-white py-1.5 px-2 text-xs text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
              >
                <option value="name">Product Name</option>
                <option value="stock">Stock Level</option>
                <option value="sellingPrice">Selling Price</option>
                <option value="margin">Profit Margin</option>
              </select>
            </div>

            <div className="flex rounded-lg border border-gray-200 overflow-hidden dark:border-gray-700">
              <button
                onClick={() => setView('table')}
                className={clsx(
                  'p-2 transition-colors',
                  view === 'table' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'
                )}
                title="Table View"
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => setView('grid')}
                className={clsx(
                  'p-2 transition-colors',
                  view === 'grid' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'
                )}
                title="Grid View"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
          <div className="flex gap-1.5 flex-wrap items-center">
            <span className="text-xs text-gray-400 mr-1">Category:</span>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={clsx(
                  'rounded-lg px-2.5 py-1 text-xs font-medium transition-colors',
                  category === cat
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex gap-1.5 flex-wrap items-center">
            <span className="text-xs text-gray-400 mr-1">Status:</span>
            {(['All', 'in_stock', 'low_stock', 'out_of_stock'] as const).map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={clsx(
                  'rounded-lg px-2.5 py-1 text-xs font-medium transition-colors',
                  statusFilter === st
                    ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
                )}
              >
                {st === 'All' ? 'All Status' : statusLabel[st]}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Main View: Table View */}
      {view === 'table' ? (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Product & SKU</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Stock Level</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Cost</th>
                  <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Selling</th>
                  <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Margin</th>
                  <th className="py-3 px-6 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filtered.map(p => {
                  const margin = p.sellingPrice > 0
                    ? (((p.sellingPrice - p.costPrice) / p.sellingPrice) * 100).toFixed(1)
                    : '0.0';
                  const stockPct = p.reorderLevel > 0
                    ? Math.min((p.stock / (p.reorderLevel * 4)) * 100, 100)
                    : 100;
                  const isOut = p.status === 'out_of_stock';

                  return (
                    <tr
                      key={p.id}
                      className={clsx(
                        'transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50',
                        isOut && 'bg-red-50/30 dark:bg-red-900/10'
                      )}
                    >
                      <td className="py-3 px-6">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0 dark:bg-indigo-950/40">
                            <Package className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <div>
                            <button
                              onClick={() => setViewingProduct(p)}
                              className="text-sm font-semibold text-gray-900 dark:text-white hover:text-indigo-600 text-left cursor-pointer"
                            >
                              {p.name}
                            </button>
                            <p className="text-xs text-gray-400 font-mono mt-0.5">{p.sku}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-300">{p.category}</td>
                      <td className="py-3 px-4 min-w-[150px]">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                            <div
                              className={clsx(
                                'h-2 rounded-full transition-all',
                                p.status === 'in_stock' ? 'bg-green-500' :
                                p.status === 'low_stock' ? 'bg-yellow-500' : 'bg-red-500'
                              )}
                              style={{ width: `${stockPct}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-gray-700 dark:text-gray-300 shrink-0">
                            {p.stock} {p.unit}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge color={statusColor[p.status]}>{statusLabel[p.status]}</Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-right text-gray-600 dark:text-gray-300">{fmt(p.costPrice)}</td>
                      <td className="py-3 px-4 text-sm text-right font-medium text-gray-900 dark:text-white">{fmt(p.sellingPrice)}</td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-sm font-semibold text-emerald-600">{margin}%</span>
                      </td>
                      <td className="py-3 px-6 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setViewingProduct(p)}
                            className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                            title="View details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              setAdjustingProduct(p);
                              setAdjustAmount(0);
                            }}
                            className="p-1.5 text-gray-400 hover:text-amber-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                            title="Quick Adjust Stock"
                          >
                            <AlertTriangle className="h-4 w-4" />
                          </button>
                          {canCreate && (
                            <button
                              onClick={() => openEditModal(p)}
                              className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                              title="Edit product"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => setDeletingProductId(p.id)}
                              className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                              title="Delete product"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-sm text-gray-400">
                      No products found matching your current filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        /* Grid Card View */
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(p => {
            const margin = p.sellingPrice > 0
              ? (((p.sellingPrice - p.costPrice) / p.sellingPrice) * 100).toFixed(1)
              : '0.0';

            return (
              <Card key={p.id} className="hover:shadow-md transition-shadow flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="h-10 w-10 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0 dark:bg-indigo-950/40">
                        <Package className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white line-clamp-1">{p.name}</h4>
                        <p className="text-xs font-mono text-gray-400">{p.sku}</p>
                      </div>
                    </div>
                    <Badge color={statusColor[p.status]}>{statusLabel[p.status]}</Badge>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-lg bg-gray-50 p-2 dark:bg-gray-800/40">
                      <span className="text-gray-400">Current Stock</span>
                      <p className="font-semibold text-gray-900 dark:text-white mt-0.5 text-sm">
                        {p.stock} {p.unit}
                      </p>
                    </div>
                    <div className="rounded-lg bg-gray-50 p-2 dark:bg-gray-800/40">
                      <span className="text-gray-400">Reorder Level</span>
                      <p className="font-semibold text-gray-900 dark:text-white mt-0.5 text-sm">
                        {p.reorderLevel} {p.unit}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs border-t pt-3 dark:border-gray-800">
                    <div>
                      <span className="text-gray-400">Cost: </span>
                      <span className="font-medium text-gray-700 dark:text-gray-300">{fmt(p.costPrice)}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Selling: </span>
                      <span className="font-bold text-gray-900 dark:text-white">{fmt(p.sellingPrice)}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-emerald-600">{margin}%</span>
                    </div>
                  </div>

                  {p.location && (
                    <p className="mt-2 text-xs text-gray-400 flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {p.location}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t flex items-center justify-between dark:border-gray-800">
                  <button
                    onClick={() => setViewingProduct(p)}
                    className="text-xs font-medium text-indigo-600 hover:underline flex items-center gap-1"
                  >
                    View Details
                  </button>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setAdjustingProduct(p);
                        setAdjustAmount(0);
                      }}
                      className="p-1.5 text-gray-400 hover:text-amber-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                      title="Adjust Stock"
                    >
                      <AlertTriangle className="h-3.5 w-3.5" />
                    </button>
                    {canCreate && (
                      <button
                        onClick={() => openEditModal(p)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                        title="Edit"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => setDeletingProductId(p.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Product Details Drawer / Modal */}
      {viewingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900 dark:border dark:border-gray-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center dark:bg-indigo-950">
                  <Package className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">{viewingProduct.name}</h3>
                  <p className="text-xs font-mono text-gray-400">{viewingProduct.sku}</p>
                </div>
              </div>
              <button onClick={() => setViewingProduct(null)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/50">
                  <span className="text-xs text-gray-400">Stock Availability</span>
                  <p className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">
                    {viewingProduct.stock} {viewingProduct.unit}
                  </p>
                  <div className="mt-1">
                    <Badge color={statusColor[viewingProduct.status]}>{statusLabel[viewingProduct.status]}</Badge>
                  </div>
                </div>
                <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/50">
                  <span className="text-xs text-gray-400">Reorder Threshold</span>
                  <p className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">
                    {viewingProduct.reorderLevel} {viewingProduct.unit}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Recommended batch: {viewingProduct.reorderLevel * 2}</p>
                </div>
              </div>

              {/* Financial unit economics */}
              <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-800 space-y-2">
                <h4 className="text-xs font-semibold text-gray-500 uppercase">Unit Economics</h4>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <span className="text-xs text-gray-400">Cost Price</span>
                    <p className="font-semibold text-gray-800 dark:text-gray-200">{fmt(viewingProduct.costPrice)}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400">Selling Price</span>
                    <p className="font-semibold text-gray-800 dark:text-gray-200">{fmt(viewingProduct.sellingPrice)}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400">Gross Margin</span>
                    <p className="font-bold text-emerald-600">
                      {viewingProduct.sellingPrice > 0
                        ? (((viewingProduct.sellingPrice - viewingProduct.costPrice) / viewingProduct.sellingPrice) * 100).toFixed(1)
                        : 0}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Warehouse & Supplier details */}
              <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/50 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> Storage Location</span>
                  <span className="font-medium text-gray-800 dark:text-gray-200">{viewingProduct.location || 'Not Assigned'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 flex items-center gap-1"><Barcode className="h-3.5 w-3.5" /> Barcode</span>
                  <span className="font-mono text-gray-800 dark:text-gray-200">{viewingProduct.barcode || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 flex items-center gap-1"><Truck className="h-3.5 w-3.5" /> Supplier</span>
                  <span className="font-medium text-gray-800 dark:text-gray-200">{viewingProduct.supplierName || 'Primary Vendor'}</span>
                </div>
              </div>

              {viewingProduct.description && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Description</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed bg-gray-50 p-3 rounded-lg dark:bg-gray-800/40">
                    {viewingProduct.description}
                  </p>
                </div>
              )}

              {/* Product Movement History */}
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Movement History</h4>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {movements
                    .filter(m => m.productId === viewingProduct.id)
                    .slice(0, 5)
                    .map(m => (
                      <div key={m.id} className="flex items-center justify-between p-2 rounded bg-gray-50 text-xs dark:bg-gray-800/40">
                        <div>
                          <span className="font-mono font-medium">{m.reference}</span>
                          <span className="text-gray-400 ml-2">{m.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={m.quantity > 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                            {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                          </span>
                          <span className="text-gray-400 capitalize">({m.type})</span>
                        </div>
                      </div>
                    ))}
                  {movements.filter(m => m.productId === viewingProduct.id).length === 0 && (
                    <p className="text-xs text-gray-400 py-2 text-center">No movement history logged yet.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2 border-t pt-3 dark:border-gray-800">
              <Button variant="secondary" onClick={() => setViewingProduct(null)}>
                Close
              </Button>
              {canCreate && (
                <Button
                  onClick={() => {
                    const target = viewingProduct;
                    setViewingProduct(null);
                    openEditModal(target);
                  }}
                >
                  <Edit className="h-4 w-4" /> Edit Product
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {(isAddOpen || editingProduct) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-xl rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900 dark:border dark:border-gray-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3 dark:border-gray-800">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button
                onClick={() => {
                  setIsAddOpen(false);
                  setEditingProduct(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Ergonomic Office Chair"
                    className="w-full rounded-lg border border-gray-200 bg-white py-2 px-3 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase mb-1">
                    SKU Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={e => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="e.g. FUR-CHR-001"
                    className="w-full rounded-lg border border-gray-200 bg-white py-2 px-3 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase mb-1">
                    Category *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g. Electronics, Furniture"
                    className="w-full rounded-lg border border-gray-200 bg-white py-2 px-3 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase mb-1">
                    Cost Price ($) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.costPrice}
                    onChange={e => setFormData({ ...formData, costPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full rounded-lg border border-gray-200 bg-white py-2 px-3 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase mb-1">
                    Selling Price ($) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.sellingPrice}
                    onChange={e => setFormData({ ...formData, sellingPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full rounded-lg border border-gray-200 bg-white py-2 px-3 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase mb-1">
                    Initial Stock Count *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.stock}
                    onChange={e => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-lg border border-gray-200 bg-white py-2 px-3 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase mb-1">
                    Reorder Alert Level *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.reorderLevel}
                    onChange={e => setFormData({ ...formData, reorderLevel: parseInt(e.target.value) || 1 })}
                    className="w-full rounded-lg border border-gray-200 bg-white py-2 px-3 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase mb-1">
                    Unit of Measurement *
                  </label>
                  <select
                    value={formData.unit}
                    onChange={e => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 bg-white py-2 px-3 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="unit">unit</option>
                    <option value="piece">piece</option>
                    <option value="box">box</option>
                    <option value="pack">pack</option>
                    <option value="ream">ream</option>
                    <option value="license">license</option>
                    <option value="kg">kg</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase mb-1">
                    Supplier
                  </label>
                  <select
                    value={formData.supplierId}
                    onChange={e => setFormData({ ...formData, supplierId: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 bg-white py-2 px-3 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="">None / Direct</option>
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase mb-1">
                    Warehouse Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Warehouse A - Bay 3"
                    className="w-full rounded-lg border border-gray-200 bg-white py-2 px-3 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase mb-1">
                    Barcode / UPC
                  </label>
                  <input
                    type="text"
                    value={formData.barcode}
                    onChange={e => setFormData({ ...formData, barcode: e.target.value })}
                    placeholder="e.g. 884116348920"
                    className="w-full rounded-lg border border-gray-200 bg-white py-2 px-3 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase mb-1">
                    Description & Specifications
                  </label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Detailed specs or notes..."
                    className="w-full rounded-lg border border-gray-200 bg-white py-2 px-3 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t pt-3 dark:border-gray-800">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setIsAddOpen(false);
                    setEditingProduct(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Adjust Modal */}
      {adjustingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900 dark:border dark:border-gray-800">
            <div className="flex items-center justify-between border-b pb-3 dark:border-gray-800">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Quick Adjust Stock</h3>
              <button onClick={() => setAdjustingProduct(null)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleQuickAdjustSubmit} className="mt-4 space-y-4">
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{adjustingProduct.name}</p>
                <p className="text-xs text-gray-400">Current Stock: {adjustingProduct.stock} {adjustingProduct.unit}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase mb-1">
                  Change Quantity (+/-) *
                </label>
                <input
                  type="number"
                  value={adjustAmount}
                  onChange={e => setAdjustAmount(parseInt(e.target.value) || 0)}
                  placeholder="e.g. 5 or -2"
                  required
                  className="w-full rounded-lg border border-gray-200 bg-white py-2 px-3 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
                <p className="text-xs text-gray-500 mt-1">
                  New Stock:{' '}
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {Math.max(0, adjustingProduct.stock + adjustAmount)} {adjustingProduct.unit}
                  </span>
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase mb-1">
                  Reason for Adjustment
                </label>
                <select
                  value={adjustReason}
                  onChange={e => setAdjustReason(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white py-2 px-3 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  <option value="Inventory audit">Inventory audit</option>
                  <option value="Damaged goods written off">Damaged goods written off</option>
                  <option value="Lost or theft discrepancy">Lost or theft discrepancy</option>
                  <option value="Customer return / replenishment">Customer return / replenishment</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 border-t pt-3 dark:border-gray-800">
                <Button type="button" variant="secondary" onClick={() => setAdjustingProduct(null)}>
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

      {/* Delete Confirmation Modal */}
      {deletingProductId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900 dark:border dark:border-gray-800">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Confirm Product Deletion</h3>
            <p className="mt-2 text-sm text-gray-500">
              Are you sure you want to remove this product from the inventory catalog? This action cannot be undone.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setDeletingProductId(null)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  deleteProduct(deletingProductId);
                  setDeletingProductId(null);
                }}
              >
                Delete Product
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
