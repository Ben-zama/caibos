'use client';

import React, { useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardValue } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { AddBusinessModal } from '@/components/businesses/AddBusinessModal';
import { BusinessDetailModal } from '@/components/businesses/BusinessDetailModal';
import { useApiQuery } from '@/hooks/useApiQuery';
import { businessesService } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import {
  businessesToCsv,
  computePlatformMetrics,
  filterBusinesses,
  getPlanMonthlyPrice,
} from '@/lib/businesses-utils';
import { formatCurrency, formatDate } from '@/lib/format';
import { can } from '@/lib/permissions';
import { clsx } from '@/lib/clsx';
import type {
  Business,
  BusinessPlan,
  BusinessStatus,
  CreateBusinessInput,
} from '@/types';
import {
  Building2,
  CheckCircle2,
  CreditCard,
  DollarSign,
  Download,
  Eye,
  LayoutGrid,
  List,
  MapPin,
  Plus,
  Search,
  Shield,
  Users,
  X,
} from 'lucide-react';

const planBadgeColor: Record<BusinessPlan, 'gray' | 'indigo' | 'purple'> = {
  free: 'gray',
  pro: 'indigo',
  enterprise: 'purple',
};

const statusBadgeColor: Record<BusinessStatus, 'green' | 'blue' | 'red'> = {
  active: 'green',
  trial: 'blue',
  suspended: 'red',
};

const planFilterOptions: ('all' | BusinessPlan)[] = ['all', 'free', 'pro', 'enterprise'];
const statusFilterOptions: ('all' | BusinessStatus)[] = ['all', 'active', 'trial', 'suspended'];

export default function BusinessesPage() {
  const { role } = useAuth();
  const canViewAll = role ? can(role, 'canViewAllBusinesses') : false;

  const {
    data: businesses,
    setData: setBusinesses,
    error,
  } = useApiQuery(() => businessesService.list(), businessesService.getInitialSeed());

  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState<'all' | BusinessPlan>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | BusinessStatus>('all');
  const [view, setView] = useState<'table' | 'grid'>('table');
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const metrics = useMemo(() => computePlatformMetrics(businesses), [businesses]);
  const filtered = useMemo(
    () =>
      filterBusinesses(businesses, {
        search,
        plan: planFilter,
        status: statusFilter,
      }),
    [businesses, search, planFilter, statusFilter]
  );

  if (!canViewAll) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Shield className="mb-4 h-12 w-12 text-gray-300" />
        <h1 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
          Access Restricted
        </h1>
        <p className="mt-1 text-sm text-gray-400">
          Only Caibos platform administrators can view all registered businesses.
        </p>
      </div>
    );
  }

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 4000);
  };

  const handleSaveBusiness = async (
    id: string,
    updates: { plan: BusinessPlan; status: BusinessStatus }
  ) => {
    const updated = await businessesService.update(id, updates);
    setBusinesses(prev => prev.map(b => (b.id === id ? updated : b)));
    showToast(`Updated ${updated.name} (${updated.plan} · ${updated.status ?? 'active'}).`);
  };

  const handleCreateBusiness = async (input: CreateBusinessInput) => {
    const created = await businessesService.create(input);
    setBusinesses(prev => [created, ...prev]);
    showToast(`Workspace "${created.name}" created successfully.`);
  };

  const handleExportCsv = () => {
    const csv = businessesToCsv(filtered);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `caibos-businesses-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const resetFilters = () => {
    setSearch('');
    setPlanFilter('all');
    setStatusFilter('all');
  };

  return (
    <div className="space-y-6">
      {/* Feedback banner */}
      {toast && (
        <div
          role="status"
          className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
        >
          <div className="flex items-center gap-2 text-sm font-medium">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>{toast}</span>
          </div>
          <button
            type="button"
            aria-label="Dismiss notification"
            onClick={() => setToast(null)}
            className="rounded p-1 text-emerald-600 hover:bg-emerald-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">All Businesses</h1>
          <p className="mt-1 text-sm text-gray-500">
            Monitor tenant workspaces, subscription plans, seats, and account status across the platform
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" onClick={handleExportCsv}>
            <Download className="h-4 w-4" /> Export CSV
          </Button>
          <Button onClick={() => setIsAddOpen(true)}>
            <Plus className="h-4 w-4" /> Add Business
          </Button>
        </div>
      </div>

      {/* Platform KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Businesses</CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-950">
              <Building2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            </div>
          </CardHeader>
          <CardValue>{metrics.totalBusinesses}</CardValue>
          <p className="mt-1 text-xs text-gray-400">
            {metrics.activeBusinesses} active · {metrics.trialBusinesses} trial · {metrics.suspendedBusinesses} suspended
          </p>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Paid Subscriptions</CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950">
              <CreditCard className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </CardHeader>
          <CardValue className="text-emerald-600">{metrics.activeSubscriptions}</CardValue>
          <p className="mt-1 text-xs text-gray-400">Active Pro &amp; Enterprise workspaces</p>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Recurring Revenue</CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-950">
              <DollarSign className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardValue>{formatCurrency(metrics.monthlyRevenue)}</CardValue>
          <p className="mt-1 text-xs text-gray-400">Active billed plans</p>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Platform Users</CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-950">
              <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardValue>{metrics.totalUsers}</CardValue>
          <p className="mt-1 text-xs text-gray-400">Across all workspaces</p>
        </Card>
      </div>

      {/* Filters & Controls */}
      <Card className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              aria-label="Search businesses"
              placeholder="Search by business name, owner, email, industry, or location…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Status Select */}
            <div className="flex items-center gap-2">
              <label htmlFor="status-filter" className="text-xs font-medium text-gray-500">
                Status:
              </label>
              <select
                id="status-filter"
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as 'all' | BusinessStatus)}
                className="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-sm capitalize text-gray-700 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
              >
                {statusFilterOptions.map(status => (
                  <option key={status} value={status} className="capitalize">
                    {status === 'all' ? 'All Statuses' : status}
                  </option>
                ))}
              </select>
            </div>

            {/* View Toggle */}
            <div className="flex overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
              <button
                type="button"
                aria-label="Table view"
                onClick={() => setView('table')}
                className={clsx(
                  'flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors',
                  view === 'table'
                    ? 'bg-indigo-50 font-medium text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                    : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'
                )}
              >
                <List className="h-4 w-4" />
                <span className="hidden sm:inline">Table</span>
              </button>
              <button
                type="button"
                aria-label="Grid view"
                onClick={() => setView('grid')}
                className={clsx(
                  'flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors',
                  view === 'grid'
                    ? 'bg-indigo-50 font-medium text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                    : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'
                )}
              >
                <LayoutGrid className="h-4 w-4" />
                <span className="hidden sm:inline">Grid</span>
              </button>
            </div>
          </div>
        </div>

        {/* Plan Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-3 dark:border-gray-800">
          <div className="flex flex-wrap gap-1.5">
            {planFilterOptions.map(plan => {
              const count =
                plan === 'all'
                  ? businesses.length
                  : businesses.filter(b => b.plan === plan).length;
              return (
                <button
                  key={plan}
                  type="button"
                  onClick={() => setPlanFilter(plan)}
                  className={clsx(
                    'rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors',
                    planFilter === plan
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                  )}
                >
                  {plan === 'all' ? 'All Plans' : plan}{' '}
                  <span className={planFilter === plan ? 'text-indigo-200' : 'text-gray-400'}>
                    ({count})
                  </span>
                </button>
              );
            })}
          </div>
          <p className="text-xs text-gray-500">
            Showing <span className="font-semibold text-gray-900 dark:text-white">{filtered.length}</span> of{' '}
            {businesses.length} businesses
          </p>
        </div>
      </Card>

      {/* Table View */}
      {view === 'table' && filtered.length > 0 && (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50">
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Business</th>
                  <th className="hidden px-4 py-3 text-left font-medium text-gray-500 md:table-cell">
                    Owner
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Plan</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                  <th className="hidden px-4 py-3 text-right font-medium text-gray-500 sm:table-cell">
                    Users
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500">MRR</th>
                  <th className="hidden px-4 py-3 text-left font-medium text-gray-500 xl:table-cell">
                    Joined
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filtered.map(biz => {
                  const status = biz.status ?? 'active';
                  const mrr =
                    status === 'active'
                      ? (biz.monthlyRevenue ?? getPlanMonthlyPrice(biz.plan))
                      : 0;
                  return (
                    <tr
                      key={biz.id}
                      className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-sm font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                            {biz.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-gray-900 dark:text-white">
                              {biz.name}
                            </p>
                            <p className="truncate text-xs text-gray-500">
                              {biz.industry}
                              {biz.location ? ` · ${biz.location}` : ''}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="hidden px-4 py-3.5 md:table-cell">
                        <p className="font-medium text-gray-800 dark:text-gray-200">
                          {biz.ownerName ?? '—'}
                        </p>
                        <p className="text-xs text-gray-400">{biz.ownerEmail ?? biz.ownerId}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge color={planBadgeColor[biz.plan]} className="capitalize">
                          {biz.plan}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge color={statusBadgeColor[status]} className="capitalize">
                          {status}
                        </Badge>
                      </td>
                      <td className="hidden px-4 py-3.5 text-right font-medium text-gray-700 dark:text-gray-300 sm:table-cell">
                        {biz.usersCount ?? 1}
                      </td>
                      <td className="px-4 py-3.5 text-right font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(mrr)}
                      </td>
                      <td className="hidden whitespace-nowrap px-4 py-3.5 text-gray-500 xl:table-cell">
                        {formatDate(biz.createdAt)}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <Button
                          size="sm"
                          variant="secondary"
                          aria-label={`Manage ${biz.name}`}
                          onClick={() => setSelectedBusiness(biz)}
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Manage
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Grid View */}
      {view === 'grid' && filtered.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(biz => {
            const status = biz.status ?? 'active';
            const mrr =
              status === 'active'
                ? (biz.monthlyRevenue ?? getPlanMonthlyPrice(biz.plan))
                : 0;
            return (
              <Card key={biz.id} className="flex flex-col justify-between gap-4">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-sm font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                        {biz.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-gray-900 dark:text-white">
                          {biz.name}
                        </p>
                        <p className="truncate text-xs text-gray-500">{biz.industry}</p>
                      </div>
                    </div>
                    <Badge color={statusBadgeColor[status]} className="capitalize">
                      {status}
                    </Badge>
                  </div>

                  <div className="mt-4 space-y-1.5 text-xs text-gray-500">
                    <p className="font-medium text-gray-700 dark:text-gray-300">
                      Owner: {biz.ownerName ?? '—'}
                    </p>
                    {biz.ownerEmail && <p className="truncate">{biz.ownerEmail}</p>}
                    {biz.location && (
                      <p className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 shrink-0" />
                        {biz.location}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-gray-100 pt-3 dark:border-gray-800">
                  <div className="flex items-center gap-2">
                    <Badge color={planBadgeColor[biz.plan]} className="capitalize">
                      {biz.plan}
                    </Badge>
                    <span className="text-xs font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(mrr)}/mo
                    </span>
                    <span className="text-xs text-gray-400">· {biz.usersCount ?? 1} users</span>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    aria-label={`Manage ${biz.name}`}
                    onClick={() => setSelectedBusiness(biz)}
                  >
                    Manage
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="rounded-xl border border-dashed border-gray-300 py-16 text-center dark:border-gray-700">
          <Building2 className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-sm font-medium text-gray-700 dark:text-gray-300">
            No businesses match your current filters
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Try clearing your search or selecting a different plan or status.
          </p>
          <Button variant="secondary" size="sm" className="mt-4" onClick={resetFilters}>
            Reset Filters
          </Button>
        </div>
      )}

      {/* Modals */}
      {selectedBusiness && (
        <BusinessDetailModal
          business={selectedBusiness}
          onClose={() => setSelectedBusiness(null)}
          onSave={handleSaveBusiness}
        />
      )}

      {isAddOpen && (
        <AddBusinessModal
          onClose={() => setIsAddOpen(false)}
          onCreate={handleCreateBusiness}
        />
      )}
    </div>
  );
}
