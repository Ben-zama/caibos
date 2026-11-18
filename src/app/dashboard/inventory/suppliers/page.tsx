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
  Truck,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  Clock,
  Star,
  Edit,
  Trash2,
  Eye,
  X,
  LayoutGrid,
  List,
  ShoppingCart,
  Package,
} from 'lucide-react';
import type { Supplier } from '@/types';
import Link from 'next/link';

export default function SuppliersPage() {
  const { role } = useAuth();
  const canCreate = role ? can(role, 'canCreate') : false;
  const canDelete = role ? can(role, 'canDelete') : false;

  const {
    suppliers,
    products,
    purchaseOrders,
    addSupplier,
    updateSupplier,
    deleteSupplier,
  } = useInventory();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [view, setView] = useState<'grid' | 'table'>('grid');

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [viewingSupplier, setViewingSupplier] = useState<Supplier | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    leadTimeDays: 3,
    categories: 'Electronics',
    status: 'active' as 'active' | 'inactive',
    rating: 4.8,
  });

  const openAddModal = () => {
    setFormData({
      name: '',
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
      leadTimeDays: 3,
      categories: 'Electronics, Office Supplies',
      status: 'active',
      rating: 4.5,
    });
    setIsAddOpen(true);
  };

  const openEditModal = (s: Supplier) => {
    setEditingSupplier(s);
    setFormData({
      name: s.name,
      contactPerson: s.contactPerson,
      email: s.email,
      phone: s.phone,
      address: s.address || '',
      leadTimeDays: s.leadTimeDays,
      categories: s.categories.join(', '),
      status: s.status,
      rating: s.rating ?? 4.5,
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const categoriesArray = formData.categories
      .split(',')
      .map(c => c.trim())
      .filter(Boolean);

    if (editingSupplier) {
      updateSupplier(editingSupplier.id, {
        name: formData.name,
        contactPerson: formData.contactPerson,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        leadTimeDays: Number(formData.leadTimeDays),
        categories: categoriesArray,
        status: formData.status,
        rating: Number(formData.rating),
      });
      setEditingSupplier(null);
    } else {
      addSupplier({
        name: formData.name,
        contactPerson: formData.contactPerson,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        leadTimeDays: Number(formData.leadTimeDays),
        categories: categoriesArray,
        status: formData.status,
        rating: Number(formData.rating),
      });
      setIsAddOpen(false);
    }
  };

  // Metrics
  const activeCount = suppliers.filter(s => s.status === 'active').length;
  const avgLeadTime = suppliers.length > 0
    ? (suppliers.reduce((s, sup) => s + sup.leadTimeDays, 0) / suppliers.length).toFixed(1)
    : '0';
  const allCategoriesCount = Array.from(new Set(suppliers.flatMap(s => s.categories))).length;

  const filtered = suppliers.filter(s => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.contactPerson.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      s.categories.some(c => c.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Suppliers & Vendors</h1>
          <p className="text-sm text-gray-500 mt-1">
            Maintain your vendor partner directory, lead times, contact details, and catalog links
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canCreate && (
            <Button onClick={openAddModal}>
              <Plus className="h-4 w-4" /> Add Supplier
            </Button>
          )}
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Suppliers</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-indigo-100 flex items-center justify-center dark:bg-indigo-900/40">
              <Truck className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            </div>
          </CardHeader>
          <CardValue>{suppliers.length}</CardValue>
          <p className="mt-1 text-xs text-gray-400">Approved vendor partners</p>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Suppliers</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center dark:bg-green-900/40">
              <Truck className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardValue className="text-emerald-600 dark:text-emerald-400">{activeCount}</CardValue>
          <p className="mt-1 text-xs text-gray-400">Available for reorders & procurement</p>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Avg Lead Time</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-amber-100 flex items-center justify-center dark:bg-amber-900/40">
              <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
          </CardHeader>
          <CardValue className="text-amber-600 dark:text-amber-400">{avgLeadTime} days</CardValue>
          <p className="mt-1 text-xs text-gray-400">Average fulfillment turnaround</p>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Categories Supplied</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-purple-100 flex items-center justify-center dark:bg-purple-900/40">
              <Package className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardValue>{allCategoriesCount}</CardValue>
          <p className="mt-1 text-xs text-gray-400">Industry sectors covered</p>
        </Card>
      </div>

      {/* Filters and Controls */}
      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by supplier name, contact, email, or category..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {(['all', 'active', 'inactive'] as const).map(st => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={clsx(
                    'rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors',
                    statusFilter === st
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
                  )}
                >
                  {st}
                </button>
              ))}
            </div>

            <div className="flex rounded-lg border border-gray-200 overflow-hidden dark:border-gray-700">
              <button
                onClick={() => setView('grid')}
                className={clsx(
                  'p-2 transition-colors',
                  view === 'grid' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'
                )}
                title="Grid"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setView('table')}
                className={clsx(
                  'p-2 transition-colors',
                  view === 'table' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'
                )}
                title="Table"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Grid View */}
      {view === 'grid' ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(s => {
            const suppliedProds = products.filter(p => p.supplierId === s.id);
            const posCount = purchaseOrders.filter(p => p.supplierId === s.id).length;

            return (
              <Card key={s.id} className="hover:shadow-md transition-shadow flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-base dark:bg-indigo-950/40 dark:text-indigo-400">
                        {s.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white line-clamp-1">{s.name}</h4>
                        <p className="text-xs text-gray-500">{s.contactPerson}</p>
                      </div>
                    </div>
                    <Badge color={s.status === 'active' ? 'green' : 'gray'}>
                      {s.status}
                    </Badge>
                  </div>

                  <div className="mt-4 space-y-1.5 text-xs text-gray-600 dark:text-gray-300">
                    <p className="flex items-center gap-2 text-gray-500">
                      <Mail className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                      <span className="truncate">{s.email}</span>
                    </p>
                    <p className="flex items-center gap-2 text-gray-500">
                      <Phone className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                      <span>{s.phone}</span>
                    </p>
                    {s.address && (
                      <p className="flex items-center gap-2 text-gray-500">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                        <span className="truncate">{s.address}</span>
                      </p>
                    )}
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs border-t pt-3 dark:border-gray-800">
                    <span className="flex items-center gap-1 text-gray-500">
                      <Clock className="h-3.5 w-3.5 text-amber-500" /> {s.leadTimeDays}d lead time
                    </span>
                    <span className="flex items-center gap-1 text-gray-700 dark:text-gray-300 font-semibold">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {s.rating ?? 4.8}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1">
                    {s.categories.map((cat, i) => (
                      <span
                        key={i}
                        className="rounded-md bg-gray-100 px-2 py-0.5 text-[11px] text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t flex items-center justify-between dark:border-gray-800">
                  <button
                    onClick={() => setViewingSupplier(s)}
                    className="text-xs font-medium text-indigo-600 hover:underline flex items-center gap-1"
                  >
                    View Catalog ({suppliedProds.length})
                  </button>
                  <div className="flex items-center gap-1">
                    {canCreate && (
                      <button
                        onClick={() => openEditModal(s)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                        title="Edit"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => setDeletingId(s.id)}
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
      ) : (
        /* Table View */
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Supplier</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contact Person</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contact Info</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Lead Time</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rating</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="py-3 px-6 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filtered.map(s => (
                  <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="py-3 px-6">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{s.name}</p>
                      <p className="text-xs text-gray-400">{s.categories.join(', ')}</p>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">{s.contactPerson}</td>
                    <td className="py-3 px-4 text-xs text-gray-500 dark:text-gray-400">
                      <div>{s.email}</div>
                      <div>{s.phone}</div>
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                      {s.leadTimeDays} days
                    </td>
                    <td className="py-3 px-4">
                      <span className="flex items-center gap-1 text-xs font-semibold text-gray-700 dark:text-gray-300">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {s.rating ?? 4.8}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Badge color={s.status === 'active' ? 'green' : 'gray'}>{s.status}</Badge>
                    </td>
                    <td className="py-3 px-6 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setViewingSupplier(s)}
                          className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                          title="View Catalog"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {canCreate && (
                          <button
                            onClick={() => openEditModal(s)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => setDeletingId(s.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* View Supplier Details Modal */}
      {viewingSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-xl rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900 dark:border dark:border-gray-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold dark:bg-indigo-950/40 dark:text-indigo-400">
                  {viewingSupplier.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">{viewingSupplier.name}</h3>
                  <p className="text-xs text-gray-400">{viewingSupplier.contactPerson}</p>
                </div>
              </div>
              <button onClick={() => setViewingSupplier(null)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/50">
                  <span className="text-gray-400">Email Contact</span>
                  <p className="font-semibold text-gray-900 dark:text-white mt-0.5">{viewingSupplier.email}</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/50">
                  <span className="text-gray-400">Phone</span>
                  <p className="font-semibold text-gray-900 dark:text-white mt-0.5">{viewingSupplier.phone}</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/50">
                  <span className="text-gray-400">Standard Lead Time</span>
                  <p className="font-semibold text-gray-900 dark:text-white mt-0.5">{viewingSupplier.leadTimeDays} business days</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/50">
                  <span className="text-gray-400">Rating</span>
                  <p className="font-semibold text-gray-900 dark:text-white mt-0.5 flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {viewingSupplier.rating ?? 4.8} / 5.0
                  </p>
                </div>
              </div>

              {/* Products from this supplier */}
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                  Products Supplied ({products.filter(p => p.supplierId === viewingSupplier.id).length})
                </h4>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {products
                    .filter(p => p.supplierId === viewingSupplier.id)
                    .map(p => (
                      <div key={p.id} className="flex items-center justify-between p-2 rounded bg-gray-50 text-xs dark:bg-gray-800/40">
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{p.name}</p>
                          <p className="font-mono text-gray-400">{p.sku}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900 dark:text-white">Stock: {p.stock} {p.unit}</p>
                          <p className="text-gray-400">Cost: ${p.costPrice}</p>
                        </div>
                      </div>
                    ))}
                  {products.filter(p => p.supplierId === viewingSupplier.id).length === 0 && (
                    <p className="text-xs text-gray-400 py-3 text-center">No catalog products assigned to this supplier yet.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-between items-center border-t pt-3 dark:border-gray-800">
              <Link href="/dashboard/inventory/purchase-orders">
                <Button size="sm" onClick={() => setViewingSupplier(null)}>
                  <ShoppingCart className="h-3.5 w-3.5 mr-1" /> New Purchase Order
                </Button>
              </Link>
              <Button variant="secondary" onClick={() => setViewingSupplier(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {(isAddOpen || editingSupplier) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900 dark:border dark:border-gray-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3 dark:border-gray-800">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
              </h3>
              <button
                onClick={() => {
                  setIsAddOpen(false);
                  setEditingSupplier(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase mb-1">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Apex Hardware Supplies"
                    className="w-full rounded-lg border border-gray-200 bg-white py-2 px-3 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase mb-1">
                    Contact Person *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.contactPerson}
                    onChange={e => setFormData({ ...formData, contactPerson: e.target.value })}
                    placeholder="e.g. Rachel Adams"
                    className="w-full rounded-lg border border-gray-200 bg-white py-2 px-3 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="orders@supplier.com"
                    className="w-full rounded-lg border border-gray-200 bg-white py-2 px-3 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="w-full rounded-lg border border-gray-200 bg-white py-2 px-3 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase mb-1">
                    Lead Time (Days) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.leadTimeDays}
                    onChange={e => setFormData({ ...formData, leadTimeDays: parseInt(e.target.value) || 1 })}
                    className="w-full rounded-lg border border-gray-200 bg-white py-2 px-3 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase mb-1">
                    Categories Supplied (Comma separated)
                  </label>
                  <input
                    type="text"
                    value={formData.categories}
                    onChange={e => setFormData({ ...formData, categories: e.target.value })}
                    placeholder="e.g. Electronics, Office Supplies, Packaging"
                    className="w-full rounded-lg border border-gray-200 bg-white py-2 px-3 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase mb-1">
                    Office / Warehouse Address
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                    placeholder="e.g. 500 Industrial Pkwy, Chicago, IL"
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
                    setEditingSupplier(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingSupplier ? 'Save Changes' : 'Add Supplier'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900 dark:border dark:border-gray-800">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Delete Supplier</h3>
            <p className="mt-2 text-sm text-gray-500">
              Are you sure you want to remove this supplier from your directory?
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setDeletingId(null)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  deleteSupplier(deletingId);
                  setDeletingId(null);
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
