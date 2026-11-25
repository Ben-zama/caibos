'use client';

import React, { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { appConfig } from '@/config/app.config';
import { applyBusinessPlanUpdate, getPlanMonthlyPrice } from '@/lib/businesses-utils';
import { formatCurrency, formatDate } from '@/lib/format';
import type { Business, BusinessPlan, BusinessStatus } from '@/types';
import {
  Building2,
  Calendar,
  Globe,
  Mail,
  MapPin,
  Phone,
  Users,
  X,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';

interface BusinessDetailModalProps {
  business: Business;
  onClose: () => void;
  onSave: (id: string, updates: { plan: BusinessPlan; status: BusinessStatus }) => Promise<void>;
}

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

export function BusinessDetailModal({
  business,
  onClose,
  onSave,
}: BusinessDetailModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<BusinessPlan>(business.plan);
  const [selectedStatus, setSelectedStatus] = useState<BusinessStatus>(
    business.status ?? 'active'
  );
  const [saving, setSaving] = useState(false);

  const preview = applyBusinessPlanUpdate(business, selectedPlan, selectedStatus);
  const hasChanges =
    selectedPlan !== business.plan ||
    selectedStatus !== (business.status ?? 'active');
  const seatLimit = appConfig.plans[selectedPlan].seatLimit;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(business.id, { plan: selectedPlan, status: selectedStatus });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="business-detail-title"
    >
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900">
        {/* Header */}
        <div className="flex shrink-0 items-start justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2
                  id="business-detail-title"
                  className="text-lg font-bold text-gray-900 dark:text-white"
                >
                  {business.name}
                </h2>
                <Badge color={planBadgeColor[business.plan]} className="capitalize">
                  {business.plan}
                </Badge>
                <Badge
                  color={statusBadgeColor[business.status ?? 'active']}
                  className="capitalize"
                >
                  {business.status ?? 'active'}
                </Badge>
              </div>
              <p className="mt-0.5 text-xs text-gray-500">
                {business.industry} · ID: <span className="font-mono">{business.id}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close business details"
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-5">
            {/* Business Metadata */}
            <div className="grid grid-cols-1 gap-4 rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800/40 sm:grid-cols-2">
              <div className="space-y-2.5">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Owner &amp; Contact
                </p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {business.ownerName ?? 'Account Owner'}
                </p>
                {business.ownerEmail && (
                  <p className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                    <Mail className="h-3.5 w-3.5 text-gray-400" />
                    {business.ownerEmail}
                  </p>
                )}
                {business.phone && (
                  <p className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                    <Phone className="h-3.5 w-3.5 text-gray-400" />
                    {business.phone}
                  </p>
                )}
              </div>

              <div className="space-y-2.5">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Account Info
                </p>
                {business.location && (
                  <p className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                    <MapPin className="h-3.5 w-3.5 text-gray-400" />
                    {business.location}
                  </p>
                )}
                {business.website && (
                  <p className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                    <Globe className="h-3.5 w-3.5 text-gray-400" />
                    {business.website}
                  </p>
                )}
                <p className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                  <Calendar className="h-3.5 w-3.5 text-gray-400" />
                  Joined {formatDate(business.createdAt)}
                </p>
                <p className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                  <Users className="h-3.5 w-3.5 text-gray-400" />
                  {business.usersCount ?? 1} / {seatLimit} seats active
                </p>
              </div>
            </div>

            {/* Enabled Modules */}
            {business.modules && business.modules.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Active Modules
                </p>
                <div className="flex flex-wrap gap-2">
                  {business.modules.map(mod => (
                    <span
                      key={mod}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                      {mod}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Admin Controls */}
            <div className="space-y-4 rounded-xl border border-indigo-100 bg-indigo-50/40 p-4 dark:border-indigo-900/40 dark:bg-indigo-950/20">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Platform Admin Controls
              </h3>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="business-plan-select"
                    className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300"
                  >
                    Subscription Plan
                  </label>
                  <select
                    id="business-plan-select"
                    value={selectedPlan}
                    onChange={e => setSelectedPlan(e.target.value as BusinessPlan)}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  >
                    {(Object.keys(appConfig.plans) as BusinessPlan[]).map(planKey => {
                      const def = appConfig.plans[planKey];
                      return (
                        <option key={planKey} value={planKey}>
                          {def.label} — {formatCurrency(def.monthlyPrice)}/mo ({def.seatLimit} seats)
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="business-status-select"
                    className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300"
                  >
                    Account Status
                  </label>
                  <select
                    id="business-status-select"
                    value={selectedStatus}
                    onChange={e => setSelectedStatus(e.target.value as BusinessStatus)}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="active">Active</option>
                    <option value="trial">Trial</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white px-3.5 py-2.5 text-xs dark:bg-gray-900">
                <span className="text-gray-500">Projected Monthly Billing (MRR)</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {formatCurrency(preview.monthlyRevenue ?? getPlanMonthlyPrice(selectedPlan))}
                  <span className="font-normal text-gray-400"> / mo</span>
                </span>
              </div>

              {selectedStatus === 'suspended' && (
                <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
                  <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    Suspending this workspace pauses billing and restricts team access until reactivated.
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex shrink-0 items-center justify-end gap-2 border-t border-gray-200 px-6 py-4 dark:border-gray-800">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={saving} disabled={!hasChanges}>
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
