'use client';

import React from 'react';
import { useAuth } from '@/lib/auth-context';
import { useInventory } from '@/lib/inventory-context';
import { Card, CardHeader, CardTitle, CardValue } from '@/components/ui/Card';
import { AreaChart } from '@/components/ui/charts/AreaChart';
import { DonutChart } from '@/components/ui/charts/DonutChart';
import { Badge } from '@/components/ui/Badge';
import { useApiQuery } from '@/hooks/useApiQuery';
import { businessesService, crmService, financeService } from '@/lib/api';
import { computePlatformMetrics } from '@/lib/businesses-utils';
import { formatCurrency } from '@/lib/format';
import {
  mockInvoices,
  mockDeals,
  mockActivities,
  revenueChartData,
  expenseByCategory,
  mockBusiness,
} from '@/lib/mock-data';
import {
  DollarSign,
  FileText,
  Users,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Clock,
  CheckCircle,
  Phone,
  Mail,
  Calendar,
  AlertTriangle,
  Building2,
} from 'lucide-react';
import Link from 'next/link';

const activityIcon: Record<string, React.ElementType> = {
  call: Phone,
  email: Mail,
  meeting: Calendar,
  task: Clock,
  note: FileText,
};

const activityColor: Record<string, string> = {
  call: 'bg-blue-100 text-blue-600',
  email: 'bg-green-100 text-green-600',
  meeting: 'bg-purple-100 text-purple-600',
  task: 'bg-amber-100 text-amber-600',
  note: 'bg-gray-100 text-gray-600',
};

export default function DashboardPage() {
  const { user } = useAuth();
  const { lowStockCount, totalInventoryCost, products } = useInventory();
  const { data: invoices } = useApiQuery(() => financeService.getInvoices(), mockInvoices);
  const { data: deals } = useApiQuery(() => crmService.getDeals(), mockDeals);
  const { data: activities } = useApiQuery(() => crmService.getActivities(), mockActivities);
  const { data: revenueSeries } = useApiQuery(() => financeService.getRevenueChart(), revenueChartData);
  const { data: expenseSeries } = useApiQuery(
    () => financeService.getExpenseBreakdown(),
    expenseByCategory
  );

  const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.total, 0);
  const totalOutstanding = invoices.filter(i => i.status === 'sent' || i.status === 'overdue').reduce((s, i) => s + i.total, 0);
  const overdueCount = invoices.filter(i => i.status === 'overdue').length;
  const pipelineValue = deals.filter(d => d.stage !== 'won' && d.stage !== 'lost').reduce((s, d) => s + d.value, 0);
  const wonDeals = deals.filter(d => d.stage === 'won').length;
  const upcomingActivities = activities.filter(a => !a.completed).slice(0, 4);

  if (user?.role === 'caibos') {
    return <CaibosAdminDashboard />;
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Good evening, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="mt-1 text-sm text-gray-500">{mockBusiness.name} · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
      </div>

      {/* Inventory Alert Banner if items are low */}
      {lowStockCount > 0 && (
        <div className="flex items-center justify-between rounded-xl bg-amber-50 border border-amber-200 p-4 dark:bg-amber-950/30 dark:border-amber-800">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-amber-100 flex items-center justify-center dark:bg-amber-900/50 shrink-0">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                {lowStockCount} product{lowStockCount > 1 ? 's' : ''} below reorder threshold
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-300">
                Total inventory value: {formatCurrency(totalInventoryCost)} ({products.length} products). Reorder now to avoid stockouts.
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/inventory"
            className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700 transition-colors shrink-0"
          >
            Review Stock
          </Link>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Revenue</CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100">
              <DollarSign className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardValue>{formatCurrency(totalRevenue)}</CardValue>
          <p className="mt-1 flex items-center gap-1 text-xs text-green-600">
            <TrendingUp className="h-3 w-3" /> +12.5% from last month
          </p>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Outstanding</CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100">
              <FileText className="h-4 w-4 text-amber-600" />
            </div>
          </CardHeader>
          <CardValue>{formatCurrency(totalOutstanding)}</CardValue>
          <p className="mt-1 flex items-center gap-1 text-xs text-amber-600">
            {overdueCount > 0 && <><TrendingDown className="h-3 w-3" /> {overdueCount} overdue</>}
            {overdueCount === 0 && <span className="text-gray-400">All invoices current</span>}
          </p>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pipeline Value</CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100">
              <TrendingUp className="h-4 w-4 text-indigo-600" />
            </div>
          </CardHeader>
          <CardValue>{formatCurrency(pipelineValue)}</CardValue>
          <p className="mt-1 text-xs text-gray-400">{deals.filter(d => d.stage !== 'won' && d.stage !== 'lost').length} active deals</p>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Deals Won</CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100">
              <Users className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardValue>{wonDeals}</CardValue>
          <p className="mt-1 text-xs text-gray-400">This period</p>
        </Card>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Revenue vs Expenses</h3>
              <p className="text-xs text-gray-400 mt-0.5">Last 7 months</p>
            </div>
            <Link href="/dashboard/finance/reports" className="text-xs text-indigo-600 hover:underline flex items-center gap-1">
              View report <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <AreaChart
            data={revenueSeries}
            index="month"
            categories={['revenue', 'expenses']}
            colors={['#6366f1', '#10b981']}
            valueFormatter={formatCurrency}
            className="h-56"
          />
        </Card>

        <Card>
          <CardHeader>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Expenses by Category</h3>
              <p className="text-xs text-gray-400 mt-0.5">This month</p>
            </div>
          </CardHeader>
          <DonutChart
            data={expenseSeries.map(e => ({ name: e.category, value: e.amount }))}
            valueFormatter={formatCurrency}
            className="h-56"
          />
        </Card>
      </div>

      {/* Bottom row: Recent invoices + Upcoming activities */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <h3 className="font-semibold text-gray-900 dark:text-white">Recent Invoices</h3>
            <Link href="/dashboard/finance/invoices" className="text-xs text-indigo-600 hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <div className="space-y-3">
            {invoices.slice(0, 4).map(inv => (
              <div key={inv.id} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{inv.clientName}</p>
                  <p className="text-xs text-gray-400">{inv.number}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(inv.total)}</span>
                  <StatusBadge status={inv.status} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="font-semibold text-gray-900 dark:text-white">Upcoming Activities</h3>
            <Link href="/dashboard/crm/activities" className="text-xs text-indigo-600 hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <div className="space-y-3">
            {upcomingActivities.map(act => {
              const Icon = activityIcon[act.type] ?? Clock;
              return (
                <div key={act.id} className="flex items-start gap-3">
                  <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${activityColor[act.type]}`}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{act.title}</p>
                    <p className="text-xs text-gray-400">{act.contactName} · {new Date(act.dueDate).toLocaleDateString()}</p>
                  </div>
                  {act.completed && <CheckCircle className="h-4 w-4 shrink-0 text-green-500" />}
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { color: 'green' | 'yellow' | 'red' | 'gray' | 'blue'; label: string }> = {
    paid: { color: 'green', label: 'Paid' },
    sent: { color: 'blue', label: 'Sent' },
    overdue: { color: 'red', label: 'Overdue' },
    draft: { color: 'gray', label: 'Draft' },
    cancelled: { color: 'gray', label: 'Cancelled' },
  };
  const s = map[status] ?? { color: 'gray', label: status };
  return <Badge color={s.color}>{s.label}</Badge>;
}

function CaibosAdminDashboard() {
  const { data: businesses } = useApiQuery(
    () => businessesService.list(),
    businessesService.getInitialSeed()
  );
  const { data: chartData } = useApiQuery(
    () => financeService.getRevenueChart(),
    revenueChartData
  );
  const metrics = computePlatformMetrics(businesses);

  const kpis = [
    {
      label: 'Total Businesses',
      value: String(metrics.totalBusinesses),
      subtext: `${metrics.activeBusinesses} active · ${metrics.trialBusinesses} trial`,
      icon: Building2,
      iconBg: 'bg-indigo-100 dark:bg-indigo-950',
      iconColor: 'text-indigo-600 dark:text-indigo-400',
    },
    {
      label: 'Paid Subscriptions',
      value: String(metrics.activeSubscriptions),
      subtext: 'Pro & Enterprise plans',
      icon: TrendingUp,
      iconBg: 'bg-emerald-100 dark:bg-emerald-950',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      label: 'Monthly Revenue',
      value: formatCurrency(metrics.monthlyRevenue),
      subtext: 'Active monthly recurring',
      icon: DollarSign,
      iconBg: 'bg-purple-100 dark:bg-purple-950',
      iconColor: 'text-purple-600 dark:text-purple-400',
    },
    {
      label: 'Total Platform Users',
      value: String(metrics.totalUsers),
      subtext: `${metrics.suspendedBusinesses} suspended accounts`,
      icon: Users,
      iconBg: 'bg-amber-100 dark:bg-amber-950',
      iconColor: 'text-amber-600 dark:text-amber-400',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Platform Overview</h1>
          <p className="mt-1 text-sm text-gray-500">Caibos Admin Dashboard</p>
        </div>
        <Link
          href="/dashboard/businesses"
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
        >
          View All Businesses
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map(item => (
          <Card key={item.label}>
            <CardHeader>
              <CardTitle>{item.label}</CardTitle>
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${item.iconBg}`}>
                <item.icon className={`h-4 w-4 ${item.iconColor}`} />
              </div>
            </CardHeader>
            <CardValue>{item.value}</CardValue>
            <p className="mt-1 text-xs text-gray-400">{item.subtext}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <h3 className="font-semibold text-gray-900 dark:text-white">Platform Revenue</h3>
          </CardHeader>
          <AreaChart
            data={chartData.map(d => ({ month: d.month, revenue: d.revenue * 0.5 }))}
            index="month"
            categories={['revenue']}
            colors={['#8b5cf6']}
            valueFormatter={(v) => `$${(v / 1000).toFixed(1)}k`}
            className="h-56"
          />
        </Card>

        <Card>
          <CardHeader>
            <h3 className="font-semibold text-gray-900 dark:text-white">Recent Businesses</h3>
            <Link
              href="/dashboard/businesses"
              className="flex items-center gap-1 text-xs text-indigo-600 hover:underline"
            >
              Manage all <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <div className="space-y-3">
            {businesses.slice(0, 5).map(biz => (
              <div key={biz.id} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                    {biz.name}
                  </p>
                  <p className="truncate text-xs text-gray-400">
                    {biz.industry} · {biz.usersCount ?? 1} users
                  </p>
                </div>
                <Badge
                  color={
                    biz.plan === 'enterprise'
                      ? 'purple'
                      : biz.plan === 'pro'
                        ? 'indigo'
                        : 'gray'
                  }
                  className="capitalize shrink-0"
                >
                  {biz.plan}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
