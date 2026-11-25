import type { BusinessPlan } from '@/types';

export type ApiMode = 'mock' | 'api';

export interface PlanDefinition {
  id: BusinessPlan;
  label: string;
  monthlyPrice: number;
  seatLimit: number;
  description: string;
}

export interface AppConfig {
  brand: {
    name: string;
    shortName: string;
    logoLetter: string;
    tagline: string;
    supportEmail: string;
  };
  api: {
    /**
     * Set NEXT_PUBLIC_API_MODE=api in .env.local to route all service calls
     * to your backend API instead of local mock data.
     */
    mode: ApiMode;
    /** Base URL for all backend REST requests (e.g. https://api.yourdomain.com/v1) */
    baseUrl: string;
    /** Request timeout in milliseconds */
    timeoutMs: number;
    /** Authorization header prefix (e.g. "Bearer") */
    authHeaderPrefix: string;
    /** Storage key for persisted access token */
    tokenStorageKey: string;
    /** Storage key for persisted user session */
    userStorageKey: string;
  };
  locale: {
    currency: string;
    locale: string;
  };
  /**
   * Toggle top-level modules on or off across navigation and dashboards.
   * Useful for white-labeling or incremental backend rollouts.
   */
  features: {
    finance: boolean;
    crm: boolean;
    inventory: boolean;
    hr: boolean;
    businesses: boolean;
    settings: boolean;
  };
  plans: Record<BusinessPlan, PlanDefinition>;
}

const rawApiMode = process.env.NEXT_PUBLIC_API_MODE;
const resolvedApiMode: ApiMode = rawApiMode === 'api' ? 'api' : 'mock';
const brandName = process.env.NEXT_PUBLIC_APP_NAME || 'Caibos';

export const appConfig: AppConfig = {
  brand: {
    name: brandName,
    shortName: brandName,
    logoLetter: brandName.charAt(0).toUpperCase(),
    tagline: 'All-in-one business management system for small businesses',
    supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@caibos.io',
  },
  api: {
    mode: resolvedApiMode,
    baseUrl: (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1').replace(/\/+$/, ''),
    timeoutMs: Number(process.env.NEXT_PUBLIC_API_TIMEOUT_MS || 15000),
    authHeaderPrefix: 'Bearer',
    tokenStorageKey: 'caibos-auth-token',
    userStorageKey: 'caibos-user',
  },
  locale: {
    currency: process.env.NEXT_PUBLIC_DEFAULT_CURRENCY || 'USD',
    locale: process.env.NEXT_PUBLIC_DEFAULT_LOCALE || 'en-US',
  },
  features: {
    finance: true,
    crm: true,
    inventory: true,
    hr: true,
    businesses: true,
    settings: true,
  },
  plans: {
    free: {
      id: 'free',
      label: 'Free',
      monthlyPrice: 0,
      seatLimit: 5,
      description: 'Core dashboards for solo founders and micro-teams',
    },
    pro: {
      id: 'pro',
      label: 'Pro',
      monthlyPrice: 49,
      seatLimit: 25,
      description: 'Full Finance, CRM, Inventory & HR suite for growing businesses',
    },
    enterprise: {
      id: 'enterprise',
      label: 'Enterprise',
      monthlyPrice: 199,
      seatLimit: 250,
      description: 'Multi-branch controls, unlimited records, and dedicated SLA',
    },
  },
};

export function isApiMode(): boolean {
  return appConfig.api.mode === 'api';
}
