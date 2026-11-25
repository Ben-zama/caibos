'use client';

import React, { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { mockDeals } from '@/lib/mock-data';
import { crmService } from '@/lib/api';
import { useApiQuery } from '@/hooks/useApiQuery';
import { formatCurrency } from '@/lib/format';
import { useAuth } from '@/lib/auth-context';
import { can } from '@/lib/permissions';
import type { Deal, DealStage } from '@/types';
import { Plus, GripVertical } from 'lucide-react';

const fmt = (n: number) => formatCurrency(n, 0);

const stages: { key: DealStage; label: string; color: string; bg: string; badge: 'gray' | 'blue' | 'yellow' | 'purple' | 'green' | 'red' }[] = [
  { key: 'lead', label: 'Lead', color: 'text-gray-600', bg: 'bg-gray-50 border-gray-200', badge: 'gray' },
  { key: 'qualified', label: 'Qualified', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200', badge: 'blue' },
  { key: 'proposal', label: 'Proposal', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200', badge: 'yellow' },
  { key: 'negotiation', label: 'Negotiation', color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200', badge: 'purple' },
  { key: 'won', label: 'Won', color: 'text-green-600', bg: 'bg-green-50 border-green-200', badge: 'green' },
  { key: 'lost', label: 'Lost', color: 'text-red-600', bg: 'bg-red-50 border-red-200', badge: 'red' },
];

function DealCard({ deal }: { deal: Deal }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm hover:shadow-md transition-shadow cursor-grab dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">{deal.title}</p>
        <GripVertical className="h-4 w-4 shrink-0 text-gray-300 mt-0.5" />
      </div>
      <p className="mt-1 text-xs text-gray-500">{deal.contactName}</p>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-sm font-bold text-gray-900 dark:text-white">{fmt(deal.value)}</span>
        <span className="text-xs text-gray-400">{deal.probability}%</span>
      </div>
      <div className="mt-2 h-1 w-full rounded-full bg-gray-100 dark:bg-gray-700">
        <div
          className="h-1 rounded-full bg-indigo-500 transition-all"
          style={{ width: `${deal.probability}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-gray-400">Close: {new Date(deal.expectedCloseDate).toLocaleDateString()}</p>
    </div>
  );
}

export default function DealsPage() {
  const { role } = useAuth();
  const { data: deals } = useApiQuery(() => crmService.getDeals(), mockDeals);
  const [view, setView] = useState<'kanban' | 'table'>('kanban');

  const totalPipeline = deals.filter(d => d.stage !== 'lost').reduce((s, d) => s + d.value, 0);
  const weightedPipeline = deals.filter(d => d.stage !== 'lost').reduce((s, d) => s + d.value * (d.probability / 100), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Deals Pipeline</h1>
          <p className="text-sm text-gray-500 mt-1">
            {fmt(totalPipeline)} total · {fmt(weightedPipeline)} weighted
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            <button
              onClick={() => setView('kanban')}
              className={`px-3 py-2 text-sm transition-colors ${view === 'kanban' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              Kanban
            </button>
            <button
              onClick={() => setView('table')}
              className={`px-3 py-2 text-sm transition-colors ${view === 'table' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              Table
            </button>
          </div>
          {role && can(role, 'canCreate') && (
            <Button><Plus className="h-4 w-4" /> Add Deal</Button>
          )}
        </div>
      </div>

      {/* Kanban board */}
      {view === 'kanban' && (
        <div className="overflow-x-auto pb-4">
          <div className="inline-flex gap-4 min-w-max">
            {stages.map(stage => {
              const stageDeals = deals.filter(d => d.stage === stage.key);
              const stageTotal = stageDeals.reduce((s, d) => s + d.value, 0);
              return (
                <div key={stage.key} className="w-64 shrink-0">
                  <div className={`mb-3 rounded-lg border px-3 py-2 ${stage.bg}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-semibold ${stage.color}`}>{stage.label}</span>
                        <span className={`rounded-full px-1.5 py-0.5 text-xs font-medium ${stage.color} bg-white/60`}>
                          {stageDeals.length}
                        </span>
                      </div>
                      <span className={`text-xs font-medium ${stage.color}`}>{fmt(stageTotal)}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {stageDeals.map(deal => (
                      <DealCard key={deal.id} deal={deal} />
                    ))}
                    {stageDeals.length === 0 && (
                      <div className="rounded-lg border-2 border-dashed border-gray-200 py-6 text-center">
                        <p className="text-xs text-gray-400">No deals</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Table view */}
      {view === 'table' && (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden dark:border-gray-800 dark:bg-gray-900">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50">
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Deal</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Contact</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500">Value</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Stage</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500 hidden sm:table-cell">Probability</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 hidden md:table-cell">Close Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {deals.map(deal => {
                  const stage = stages.find(s => s.key === deal.stage)!;
                  return (
                    <tr key={deal.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer">
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{deal.title}</td>
                      <td className="px-4 py-3 text-gray-500">{deal.contactName}</td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-white">{fmt(deal.value)}</td>
                      <td className="px-4 py-3"><Badge color={stage.badge}>{stage.label}</Badge></td>
                      <td className="px-4 py-3 text-right hidden sm:table-cell">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 h-1.5 rounded-full bg-gray-100">
                            <div className="h-1.5 rounded-full bg-indigo-500" style={{ width: `${deal.probability}%` }} />
                          </div>
                          <span className="text-gray-500 text-xs">{deal.probability}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{new Date(deal.expectedCloseDate).toLocaleDateString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
