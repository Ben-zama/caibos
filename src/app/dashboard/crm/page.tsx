'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardValue } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { AreaChart } from '@/components/ui/charts/AreaChart';
import { mockContacts, mockDeals, mockActivities } from '@/lib/mock-data';
import { crmService } from '@/lib/api';
import { useApiQuery } from '@/hooks/useApiQuery';
import { formatCurrency } from '@/lib/format';
import { Users, Briefcase, TrendingUp, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const fmt = (n: number) => formatCurrency(n, 0);

const stageColor: Record<string, 'gray' | 'blue' | 'yellow' | 'purple' | 'green' | 'red'> = {
  lead: 'gray',
  qualified: 'blue',
  proposal: 'yellow',
  negotiation: 'purple',
  won: 'green',
  lost: 'red',
};

const pipelineChartData = [
  { month: 'Aug', pipeline: 45000, won: 18000 },
  { month: 'Sep', pipeline: 52000, won: 22000 },
  { month: 'Oct', pipeline: 48000, won: 19000 },
  { month: 'Nov', pipeline: 61000, won: 28000 },
  { month: 'Dec', pipeline: 74000, won: 31000 },
  { month: 'Jan', pipeline: 68000, won: 25000 },
  { month: 'Feb', pipeline: 83000, won: 35000 },
];

export default function CRMPage() {
  const { data: contacts } = useApiQuery(() => crmService.getContacts(), mockContacts);
  const { data: deals } = useApiQuery(() => crmService.getDeals(), mockDeals);
  const { data: activities } = useApiQuery(() => crmService.getActivities(), mockActivities);

  const totalPipeline = deals.filter(d => d.stage !== 'won' && d.stage !== 'lost').reduce((s, d) => s + d.value, 0);
  const wonValue = deals.filter(d => d.stage === 'won').reduce((s, d) => s + d.value, 0);
  const conversionRate = deals.length > 0 ? ((deals.filter(d => d.stage === 'won').length / deals.length) * 100).toFixed(0) : '0';
  const upcomingActivities = activities.filter(a => !a.completed).slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">CRM</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your contacts, deals, and customer relationships</p>
        </div>
        <Link href="/dashboard/crm/contacts" className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors">
          Add Contact
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Contacts</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-indigo-100 flex items-center justify-center">
              <Users className="h-4 w-4 text-indigo-600" />
            </div>
          </CardHeader>
          <CardValue>{contacts.length}</CardValue>
          <p className="mt-1 text-xs text-gray-400">{contacts.filter(c => c.type === 'lead').length} leads, {contacts.filter(c => c.type === 'client').length} clients</p>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pipeline Value</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <Briefcase className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardValue>{fmt(totalPipeline)}</CardValue>
          <p className="mt-1 text-xs text-gray-400">{deals.filter(d => d.stage !== 'won' && d.stage !== 'lost').length} active deals</p>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Won Revenue</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardValue className="text-green-600">{fmt(wonValue)}</CardValue>
          <p className="mt-1 text-xs text-gray-400">{deals.filter(d => d.stage === 'won').length} deals closed</p>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Conversion Rate</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-purple-100 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardValue>{conversionRate}%</CardValue>
          <p className="mt-1 text-xs text-gray-400">Lead to close</p>
        </Card>
      </div>

      {/* Charts + Activities */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Pipeline vs Won</h3>
              <p className="text-xs text-gray-400 mt-0.5">Monthly comparison</p>
            </div>
            <Link href="/dashboard/crm/deals" className="text-xs text-indigo-600 hover:underline flex items-center gap-1">
              View deals <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <AreaChart
            data={pipelineChartData}
            index="month"
            categories={['pipeline', 'won']}
            colors={['#6366f1', '#10b981']}
            valueFormatter={fmt}
            className="h-56"
          />
        </Card>

        <Card>
          <CardHeader>
            <h3 className="font-semibold text-gray-900 dark:text-white">Upcoming Activities</h3>
            <Link href="/dashboard/crm/activities" className="text-xs text-indigo-600 hover:underline flex items-center gap-1">
              All <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <div className="space-y-3">
            {upcomingActivities.map(act => (
              <div key={act.id} className="flex items-start gap-3">
                <div className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${
                  act.type === 'call' ? 'bg-blue-500' :
                  act.type === 'email' ? 'bg-green-500' :
                  act.type === 'meeting' ? 'bg-purple-500' : 'bg-amber-500'
                }`} />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{act.title}</p>
                  <p className="text-xs text-gray-400">{act.contactName} · {new Date(act.dueDate).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent contacts + Deal stages */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <h3 className="font-semibold text-gray-900 dark:text-white">Recent Contacts</h3>
            <Link href="/dashboard/crm/contacts" className="text-xs text-indigo-600 hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <div className="space-y-3">
            {contacts.slice(0, 5).map(c => (
              <div key={c.id} className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-sm font-semibold">
                  {c.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{c.name}</p>
                  <p className="text-xs text-gray-400 truncate">{c.company}</p>
                </div>
                <Badge color={c.type === 'client' ? 'green' : c.type === 'lead' ? 'blue' : 'gray'}>
                  {c.type}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="font-semibold text-gray-900 dark:text-white">Deals by Stage</h3>
            <Link href="/dashboard/crm/deals" className="text-xs text-indigo-600 hover:underline flex items-center gap-1">
              View pipeline <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <div className="space-y-3">
            {(['lead', 'qualified', 'proposal', 'negotiation', 'won'] as const).map(stage => {
              const stageDeals = deals.filter(d => d.stage === stage);
              const stageValue = stageDeals.reduce((s, d) => s + d.value, 0);
              const pct = totalPipeline > 0 ? (stageValue / (totalPipeline + wonValue)) * 100 : 0;
              return (
                <div key={stage}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Badge color={stageColor[stage]}>{stage.charAt(0).toUpperCase() + stage.slice(1)}</Badge>
                      <span className="text-xs text-gray-400">{stageDeals.length} deals</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{fmt(stageValue)}</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-gray-800">
                    <div
                      className={`h-1.5 rounded-full ${
                        stage === 'won' ? 'bg-green-500' :
                        stage === 'negotiation' ? 'bg-purple-500' :
                        stage === 'proposal' ? 'bg-amber-500' :
                        stage === 'qualified' ? 'bg-blue-500' : 'bg-gray-400'
                      }`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
