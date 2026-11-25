import { isApiMode } from '@/config/app.config';
import { apiClient } from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import {
  applyBusinessPlanUpdate,
  computePlatformMetrics,
  getPlanMonthlyPrice,
} from '@/lib/businesses-utils';
import { mockBusinesses } from '@/lib/mock-data';
import type {
  Business,
  BusinessPlan,
  BusinessStatus,
  CreateBusinessInput,
  PlatformMetrics,
  UpdateBusinessInput,
} from '@/types';

const STORAGE_KEY = 'caibos_admin_businesses';

function readLocalBusinesses(): Business[] {
  if (typeof window === 'undefined') return mockBusinesses;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Business[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // fallback to seed data
  }
  return mockBusinesses;
}

function writeLocalBusinesses(businesses: Business[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(businesses));
  } catch {
    // ignore quota errors
  }
}

export const businessesService = {
  getInitialSeed(): Business[] {
    return mockBusinesses;
  },

  async list(params?: {
    search?: string;
    plan?: string;
    status?: string;
  }): Promise<Business[]> {
    if (isApiMode()) {
      return apiClient.get<Business[]>(ENDPOINTS.BUSINESSES.LIST, { params });
    }
    return readLocalBusinesses();
  },

  async getById(id: string): Promise<Business | null> {
    if (isApiMode()) {
      return apiClient.get<Business>(ENDPOINTS.BUSINESSES.BY_ID(id));
    }
    return readLocalBusinesses().find(b => b.id === id) ?? null;
  },

  async create(input: CreateBusinessInput): Promise<Business> {
    if (isApiMode()) {
      return apiClient.post<Business>(ENDPOINTS.BUSINESSES.CREATE, input);
    }

    const current = readLocalBusinesses();
    const nextNum = current.length + 1;
    const today = new Date().toISOString().split('T')[0];
    const monthlyRevenue =
      input.status === 'active' ? getPlanMonthlyPrice(input.plan) : 0;

    const created: Business = {
      id: `biz-${String(nextNum).padStart(3, '0')}-${Date.now().toString().slice(-3)}`,
      name: input.name.trim(),
      industry: input.industry.trim(),
      plan: input.plan,
      status: input.status,
      ownerId: `user-${Date.now().toString().slice(-4)}`,
      ownerName: input.ownerName.trim(),
      ownerEmail: input.ownerEmail.trim(),
      usersCount: input.usersCount ?? 1,
      monthlyRevenue,
      location: input.location?.trim() || 'Remote',
      lastActiveAt: today,
      modules:
        input.plan === 'enterprise'
          ? ['Finance', 'CRM', 'Inventory', 'HR & Payroll']
          : input.plan === 'pro'
            ? ['Finance', 'CRM', 'Inventory']
            : ['Finance', 'CRM'],
      createdAt: today,
    };

    const updated = [created, ...current];
    writeLocalBusinesses(updated);
    return created;
  },

  async update(id: string, updates: UpdateBusinessInput): Promise<Business> {
    if (isApiMode()) {
      return apiClient.patch<Business>(ENDPOINTS.BUSINESSES.BY_ID(id), updates);
    }

    const current = readLocalBusinesses();
    let updatedBusiness: Business | null = null;
    const nextList = current.map(biz => {
      if (biz.id !== id) return biz;
      const merged: Business = { ...biz, ...updates };
      const recalculated =
        updates.plan !== undefined || updates.status !== undefined
          ? applyBusinessPlanUpdate(
              merged,
              updates.plan ?? merged.plan,
              updates.status ?? merged.status
            )
          : merged;
      updatedBusiness = recalculated;
      return recalculated;
    });

    if (!updatedBusiness) {
      throw new Error(`Business ${id} not found`);
    }

    writeLocalBusinesses(nextList);
    return updatedBusiness;
  },

  async updatePlan(id: string, plan: BusinessPlan): Promise<Business> {
    if (isApiMode()) {
      return apiClient.patch<Business>(ENDPOINTS.BUSINESSES.UPDATE_PLAN(id), { plan });
    }
    return this.update(id, { plan });
  },

  async updateStatus(id: string, status: BusinessStatus): Promise<Business> {
    if (isApiMode()) {
      return apiClient.patch<Business>(ENDPOINTS.BUSINESSES.UPDATE_STATUS(id), { status });
    }
    return this.update(id, { status });
  },

  async getMetrics(): Promise<PlatformMetrics> {
    if (isApiMode()) {
      return apiClient.get<PlatformMetrics>(ENDPOINTS.BUSINESSES.METRICS);
    }
    return computePlatformMetrics(readLocalBusinesses());
  },
};
