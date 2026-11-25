import { appConfig } from '@/config/app.config';
import type {
  Business,
  BusinessPlan,
  BusinessStatus,
  PlatformMetrics,
} from '@/types';

export interface BusinessFilters {
  search: string;
  plan: 'all' | BusinessPlan;
  status: 'all' | BusinessStatus;
}

export function getPlanMonthlyPrice(plan: BusinessPlan): number {
  return appConfig.plans[plan].monthlyPrice;
}

export function filterBusinesses(
  businesses: Business[],
  filters: BusinessFilters
): Business[] {
  const query = filters.search.trim().toLowerCase();

  return businesses.filter(biz => {
    const bizStatus = biz.status ?? 'active';
    const matchesPlan = filters.plan === 'all' || biz.plan === filters.plan;
    const matchesStatus = filters.status === 'all' || bizStatus === filters.status;
    if (!matchesPlan || !matchesStatus) return false;

    if (!query) return true;

    return (
      biz.name.toLowerCase().includes(query) ||
      biz.industry.toLowerCase().includes(query) ||
      biz.id.toLowerCase().includes(query) ||
      (biz.ownerName ?? '').toLowerCase().includes(query) ||
      (biz.ownerEmail ?? '').toLowerCase().includes(query) ||
      (biz.location ?? '').toLowerCase().includes(query)
    );
  });
}

export function computePlatformMetrics(businesses: Business[]): PlatformMetrics {
  let activeBusinesses = 0;
  let trialBusinesses = 0;
  let suspendedBusinesses = 0;
  let activeSubscriptions = 0;
  let monthlyRevenue = 0;
  let totalUsers = 0;

  for (const biz of businesses) {
    const status = biz.status ?? 'active';
    if (status === 'active') activeBusinesses += 1;
    else if (status === 'trial') trialBusinesses += 1;
    else if (status === 'suspended') suspendedBusinesses += 1;

    if (status === 'active' && biz.plan !== 'free') {
      activeSubscriptions += 1;
    }

    if (status === 'active') {
      monthlyRevenue += biz.monthlyRevenue ?? getPlanMonthlyPrice(biz.plan);
    }

    totalUsers += biz.usersCount ?? 1;
  }

  return {
    totalBusinesses: businesses.length,
    activeBusinesses,
    trialBusinesses,
    suspendedBusinesses,
    activeSubscriptions,
    monthlyRevenue,
    totalUsers,
  };
}

export function applyBusinessPlanUpdate(
  business: Business,
  plan: BusinessPlan,
  status?: BusinessStatus
): Business {
  const nextStatus = status ?? business.status ?? 'active';
  const basePrice = getPlanMonthlyPrice(plan);
  return {
    ...business,
    plan,
    status: nextStatus,
    monthlyRevenue: nextStatus === 'active' ? basePrice : 0,
  };
}

function escapeCsvCell(value: string | number | undefined): string {
  const text = String(value ?? '');
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export function businessesToCsv(businesses: Business[]): string {
  const headers = [
    'ID',
    'Business Name',
    'Industry',
    'Owner',
    'Owner Email',
    'Plan',
    'Status',
    'Users',
    'Monthly Revenue ($)',
    'Location',
    'Created At',
  ];

  const rows = businesses.map(biz =>
    [
      biz.id,
      biz.name,
      biz.industry,
      biz.ownerName ?? '',
      biz.ownerEmail ?? '',
      biz.plan,
      biz.status ?? 'active',
      biz.usersCount ?? 1,
      biz.monthlyRevenue ?? getPlanMonthlyPrice(biz.plan),
      biz.location ?? '',
      biz.createdAt,
    ]
      .map(escapeCsvCell)
      .join(',')
  );

  return [headers.join(','), ...rows].join('\n');
}
