'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { appConfig } from '@/config/app.config';
import { formatCurrency } from '@/lib/format';
import type { BusinessPlan, BusinessStatus, CreateBusinessInput } from '@/types';
import { Building2, X } from 'lucide-react';

interface AddBusinessModalProps {
  onClose: () => void;
  onCreate: (input: CreateBusinessInput) => Promise<void>;
}

const INDUSTRY_OPTIONS = [
  'Technology',
  'SaaS & Software',
  'E-Commerce & Retail',
  'Marketing & Media',
  'Renewable Energy',
  'Supply Chain',
  'Healthcare',
  'Financial Services',
  'Manufacturing',
  'Data & Consulting',
];

export function AddBusinessModal({ onClose, onCreate }: AddBusinessModalProps) {
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState(INDUSTRY_OPTIONS[0]);
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [location, setLocation] = useState('');
  const [plan, setPlan] = useState<BusinessPlan>('pro');
  const [status, setStatus] = useState<BusinessStatus>('active');
  const [usersCount, setUsersCount] = useState(5);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !ownerName.trim() || !ownerEmail.trim()) {
      setError('Business name, owner name, and owner email are required.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await onCreate({
        name: name.trim(),
        industry,
        ownerName: ownerName.trim(),
        ownerEmail: ownerEmail.trim(),
        location: location.trim() || 'Remote',
        plan,
        status,
        usersCount: Math.max(1, usersCount),
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create business');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-business-title"
    >
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900">
        <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300">
              <Building2 className="h-4 w-4" />
            </div>
            <div>
              <h2
                id="add-business-title"
                className="text-base font-bold text-gray-900 dark:text-white"
              >
                Add Business Workspace
              </h2>
              <p className="text-xs text-gray-500">Provision a new business tenant on {appConfig.brand.name}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close add business modal"
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-5">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="new-business-name"
                className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300"
              >
                Business Name *
              </label>
              <input
                id="new-business-name"
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Summit Retail Group"
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="new-business-industry"
                  className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300"
                >
                  Industry
                </label>
                <select
                  id="new-business-industry"
                  value={industry}
                  onChange={e => setIndustry(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  {INDUSTRY_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="new-business-location"
                  className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300"
                >
                  Location
                </label>
                <input
                  id="new-business-location"
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="e.g. Denver, USA"
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="new-business-owner"
                  className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300"
                >
                  Owner Name *
                </label>
                <input
                  id="new-business-owner"
                  type="text"
                  required
                  value={ownerName}
                  onChange={e => setOwnerName(e.target.value)}
                  placeholder="e.g. Jordan Taylor"
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label
                  htmlFor="new-business-email"
                  className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300"
                >
                  Owner Email *
                </label>
                <input
                  id="new-business-email"
                  type="email"
                  required
                  value={ownerEmail}
                  onChange={e => setOwnerEmail(e.target.value)}
                  placeholder="jordan@summitretail.com"
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label
                  htmlFor="new-business-plan"
                  className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300"
                >
                  Plan
                </label>
                <select
                  id="new-business-plan"
                  value={plan}
                  onChange={e => setPlan(e.target.value as BusinessPlan)}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  {(Object.keys(appConfig.plans) as BusinessPlan[]).map(p => (
                    <option key={p} value={p}>
                      {appConfig.plans[p].label} ({formatCurrency(appConfig.plans[p].monthlyPrice)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="new-business-status"
                  className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300"
                >
                  Initial Status
                </label>
                <select
                  id="new-business-status"
                  value={status}
                  onChange={e => setStatus(e.target.value as BusinessStatus)}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  <option value="active">Active</option>
                  <option value="trial">Trial</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="new-business-seats"
                  className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300"
                >
                  Initial Seats
                </label>
                <input
                  id="new-business-seats"
                  type="number"
                  min={1}
                  max={500}
                  value={usersCount}
                  onChange={e => setUsersCount(Math.max(1, Number(e.target.value) || 1))}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center justify-end gap-2 border-t border-gray-200 px-6 py-4 dark:border-gray-800">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              Create Business
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
