import { appConfig } from '@/config/app.config';
import type { BusinessPlan } from '@/types';

export type BillingCycle = 'monthly' | 'annual';

export const ANNUAL_DISCOUNT_RATE = 0.2;

export function calculatePlanPrice(plan: BusinessPlan, cycle: BillingCycle): number {
  const base = appConfig.plans[plan].monthlyPrice;
  if (base === 0 || cycle === 'monthly') return base;
  return Math.round(base * (1 - ANNUAL_DISCOUNT_RATE));
}

export function calculateAnnualSavings(plan: BusinessPlan): number {
  const monthly = appConfig.plans[plan].monthlyPrice;
  if (monthly === 0) return 0;
  const discountedMonthly = calculatePlanPrice(plan, 'annual');
  return (monthly - discountedMonthly) * 12;
}

export interface DemoRequestInput {
  fullName: string;
  workEmail: string;
  companyName: string;
  teamSize: string;
  primaryFocus: string;
}

export interface DemoRequestValidationResult {
  valid: boolean;
  errors: Partial<Record<keyof DemoRequestInput, string>>;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateDemoRequest(input: DemoRequestInput): DemoRequestValidationResult {
  const errors: Partial<Record<keyof DemoRequestInput, string>> = {};

  if (!input.fullName.trim() || input.fullName.trim().length < 2) {
    errors.fullName = 'Enter your full name.';
  }

  const email = input.workEmail.trim();
  if (!email) {
    errors.workEmail = 'Enter your work email address.';
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.workEmail = 'Enter a valid email address (for example, name@company.com).';
  }

  if (!input.companyName.trim() || input.companyName.trim().length < 2) {
    errors.companyName = 'Enter your company or workspace name.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
