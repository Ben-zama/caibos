'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import { appConfig } from '@/config/app.config';
import {
  calculateAnnualSavings,
  calculatePlanPrice,
  type BillingCycle,
} from '@/lib/landing-utils';
import type { BusinessPlan } from '@/types';

interface TierMeta {
  id: BusinessPlan;
  featured: boolean;
  ctaLabel: string;
  ctaHref: string;
  features: readonly string[];
}

const TIER_META: readonly TierMeta[] = [
  {
    id: 'free',
    featured: false,
    ctaLabel: 'Start Free Workspace',
    ctaHref: '/login',
    features: [
      'Up to 5 team members included',
      'Core invoicing, expenses, and payment tracking',
      'Contact directory and deal pipeline',
      'Standard CSV exports and role presets',
    ],
  },
  {
    id: 'pro',
    featured: true,
    ctaLabel: 'Start 14-Day Pro Trial',
    ctaHref: '/login',
    features: [
      'Up to 25 seats with granular RBAC controls',
      'Full Finance, CRM, Inventory & HR suite',
      'Automated PO-to-stock reconciliation & reorder alerts',
      'Attendance logs, leave approvals, and payroll runs',
      'REST API mode with typed client services',
    ],
  },
  {
    id: 'enterprise',
    featured: false,
    ctaLabel: 'Request Enterprise Rollout',
    ctaHref: '#demo',
    features: [
      'Up to 250 seats across multiple business units',
      'Platform Admin tenant console & MRR ledger',
      'Custom module flags and white-label configuration',
      'Dedicated backend integration support & SLA',
      'Audit-ready access governance and SSO handoff',
    ],
  },
] as const;

export function PricingSection() {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');

  return (
    <section id="pricing" className="border-b border-slate-200/80 bg-white py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-indigo-600">Pricing</p>
            <h2 className="font-display mt-3 text-3xl font-bold tracking-tight text-slate-950 text-balance sm:text-4xl">
              Simple per-workspace plans with every core module included.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-600">
              Start on the free workspace or upgrade as your team expands across Finance, CRM, Inventory, and HR. No per-module add-on fees.
            </p>
          </div>

          {/* Interactive Monthly / Annual segmented control */}
          <div
            role="group"
            aria-label="Billing cycle"
            className="inline-flex w-fit items-center rounded-xl border border-slate-200 bg-[#FAFAFC] p-1"
          >
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              aria-pressed={billingCycle === 'monthly'}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                billingCycle === 'monthly'
                  ? 'bg-white text-slate-950 shadow-xs ring-1 ring-slate-200/80'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('annual')}
              aria-pressed={billingCycle === 'annual'}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                billingCycle === 'annual'
                  ? 'bg-white text-slate-950 shadow-xs ring-1 ring-slate-200/80'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              Annual <span className="ml-1 text-indigo-600">· Save 20%</span>
            </button>
          </div>
        </div>

        {/* 3-Column Tier Grid */}
        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {TIER_META.map(tier => {
            const plan = appConfig.plans[tier.id];
            const price = calculatePlanPrice(tier.id, billingCycle);
            const annualSavings = calculateAnnualSavings(tier.id);
            const isInternalAnchor = tier.ctaHref.startsWith('#');

            return (
              <div
                key={tier.id}
                data-plan-card={tier.id}
                className={`flex flex-col justify-between rounded-2xl p-7 ${
                  tier.featured
                    ? 'border-2 border-indigo-600 bg-white shadow-sm'
                    : 'border border-slate-200/90 bg-[#FAFAFC]'
                }`}
              >
                <div>
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="font-display text-lg font-semibold text-slate-950">
                      {plan.label}
                    </h3>
                    {tier.featured && (
                      <span className="text-xs font-semibold text-indigo-600">
                        Most popular
                      </span>
                    )}
                  </div>

                  <p className="mt-2 min-h-[2.5rem] text-sm leading-relaxed text-slate-600">
                    {plan.description}
                  </p>

                  <div className="mt-6 flex items-baseline gap-1.5 border-b border-slate-200/80 pb-6">
                    <span
                      data-plan-price={tier.id}
                      className="font-mono text-4xl font-semibold tracking-tight text-slate-950 tabular-nums"
                    >
                      ${price}
                    </span>
                    <span className="text-sm text-slate-500">/ month</span>
                    {billingCycle === 'annual' && annualSavings > 0 && (
                      <span className="ml-auto font-mono text-xs font-medium text-indigo-600 tabular-nums">
                        Save ${annualSavings}/yr
                      </span>
                    )}
                  </div>

                  <p className="mt-4 text-xs font-medium text-slate-500">
                    Includes up to{' '}
                    <span className="font-mono text-slate-900 tabular-nums">{plan.seatLimit}</span>{' '}
                    active seats
                  </p>

                  <ul className="mt-5 space-y-3">
                    {tier.features.map(feature => (
                      <li key={feature} className="flex items-start gap-2.5 text-sm text-slate-700">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8">
                  {isInternalAnchor ? (
                    <a
                      href={tier.ctaHref}
                      className={`inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                        tier.featured
                          ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                          : 'border border-slate-300 bg-white text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <span>{tier.ctaLabel}</span>
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  ) : (
                    <Link
                      href={tier.ctaHref}
                      className={`inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                        tier.featured
                          ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                          : 'border border-slate-300 bg-white text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <span>{tier.ctaLabel}</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
