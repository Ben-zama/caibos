'use client';

import React, { useState } from 'react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/lib/auth-context';
import { mockBusiness, mockUsers } from '@/lib/mock-data';
import { settingsService } from '@/lib/api';
import { useApiQuery } from '@/hooks/useApiQuery';
import { appConfig } from '@/config/app.config';
import { formatCurrency } from '@/lib/format';
import { Building2, Shield, CreditCard, Bell, Trash2, Plus, Check } from 'lucide-react';

const tabs = ['Business Profile', 'Team', 'Subscription', 'Notifications'] as const;

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<typeof tabs[number]>('Business Profile');
  const [saved, setSaved] = useState(false);

  const { data: business, setData: setBusiness } = useApiQuery(
    () => settingsService.getBusinessProfile(),
    mockBusiness
  );
  const { data: team, setData: setTeam } = useApiQuery(
    () => settingsService.getTeamMembers(),
    mockUsers.filter(u => u.businessId === mockBusiness.id)
  );

  const [formValues, setFormValues] = useState({
    name: business.name,
    industry: business.industry,
    email: business.ownerEmail ?? 'contact@acme.com',
    phone: business.phone ?? '+1 555-0100',
    website: business.website ?? 'https://acme.com',
    address: '123 Business Ave, Suite 400, New York, NY 10001',
  });

  if (user?.role !== 'owner') {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Shield className="h-12 w-12 text-gray-300 mb-4" />
        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Access Restricted</h2>
        <p className="text-sm text-gray-400 mt-1">Only business owners can access settings.</p>
      </div>
    );
  }

  const handleSave = async () => {
    const updated = await settingsService.updateBusinessProfile(formValues);
    setBusiness(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleRemoveMember = async (id: string) => {
    await settingsService.removeTeamMember(id);
    setTeam(prev => prev.filter(m => m.id !== id));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your business and account settings</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 dark:border-gray-800">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Business Profile */}
      {activeTab === 'Business Profile' && (
        <div className="space-y-6 max-w-2xl">
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Building2 className="h-4 w-4 text-indigo-600" /> Business Information
              </h3>
            </CardHeader>
            <div className="space-y-4">
              {(
                [
                  { key: 'name', label: 'Business Name' },
                  { key: 'industry', label: 'Industry' },
                  { key: 'email', label: 'Business Email' },
                  { key: 'phone', label: 'Phone Number' },
                  { key: 'website', label: 'Website' },
                ] as const
              ).map(field => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{field.label}</label>
                  <input
                    type="text"
                    value={formValues[field.key]}
                    onChange={e => setFormValues(prev => ({ ...prev, [field.key]: e.target.value }))}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Business Address</label>
                <textarea
                  rows={2}
                  value={formValues.address}
                  onChange={e => setFormValues(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white resize-none"
                />
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <Button onClick={handleSave}>
                {saved ? <><Check className="h-4 w-4" /> Saved!</> : 'Save Changes'}
              </Button>
              <Button
                variant="secondary"
                onClick={() =>
                  setFormValues({
                    name: business.name,
                    industry: business.industry,
                    email: business.ownerEmail ?? 'contact@acme.com',
                    phone: business.phone ?? '+1 555-0100',
                    website: business.website ?? 'https://acme.com',
                    address: '123 Business Ave, Suite 400, New York, NY 10001',
                  })
                }
              >
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Team */}
      {activeTab === 'Team' && (
        <div className="space-y-4 max-w-3xl">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">{team.length} team members</p>
            <Button><Plus className="h-4 w-4" /> Invite Member</Button>
          </div>
          <Card className="p-0 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50">
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Member</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Role</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {team.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-sm font-semibold">
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{u.name}</p>
                          <p className="text-xs text-gray-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge color={u.role === 'owner' ? 'indigo' : 'yellow'}>
                        {u.role === 'owner' ? 'Owner' : 'Admin'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3"><Badge color="green">Active</Badge></td>
                    <td className="px-4 py-3 text-right">
                      {u.role !== 'owner' && (
                        <button
                          onClick={() => handleRemoveMember(u.id)}
                          aria-label={`Remove ${u.name}`}
                          className="text-red-400 hover:text-red-600 p-1 rounded"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
          <Card>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Shield className="h-4 w-4 text-indigo-600" /> Role Permissions
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="pb-2 text-left font-medium text-gray-500">Permission</th>
                    <th className="pb-2 text-center font-medium text-gray-500">Owner</th>
                    <th className="pb-2 text-center font-medium text-gray-500">Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {[
                    ['Create records', true, true],
                    ['Edit records', true, true],
                    ['Delete records', true, false],
                    ['Manage team', true, false],
                    ['View settings', true, false],
                    ['Export data', true, false],
                  ].map(([perm, owner, admin]) => (
                    <tr key={String(perm)}>
                      <td className="py-2 text-gray-700 dark:text-gray-300">{perm}</td>
                      <td className="py-2 text-center">{owner ? '✅' : '—'}</td>
                      <td className="py-2 text-center">{admin ? '✅' : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Subscription */}
      {activeTab === 'Subscription' && (
        <div className="space-y-6 max-w-2xl">
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-indigo-600" /> Current Plan
              </h3>
            </CardHeader>
            <div className="rounded-lg bg-indigo-50 border border-indigo-200 p-4 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-indigo-700 text-lg capitalize">{business.plan} Plan</p>
                  <p className="text-sm text-indigo-600 mt-0.5">Billed monthly · {appConfig.plans[business.plan].description}</p>
                </div>
                <Badge color="indigo">Active</Badge>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {Object.values(appConfig.plans).map(plan => {
                const isCurrent = plan.id === business.plan;
                return (
                  <div
                    key={plan.id}
                    className={`rounded-xl border p-4 ${isCurrent ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'}`}
                  >
                    <p className={`font-semibold ${isCurrent ? 'text-indigo-700' : 'text-gray-900 dark:text-white'}`}>{plan.label}</p>
                    <p className={`text-2xl font-bold mt-1 ${isCurrent ? 'text-indigo-700' : 'text-gray-900 dark:text-white'}`}>
                      {formatCurrency(plan.monthlyPrice, 0)}<span className="text-sm font-normal text-gray-400">/mo</span>
                    </p>
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Up to {plan.seatLimit} team members</p>
                    <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">{plan.description}</p>
                    <Button
                      variant={isCurrent ? 'ghost' : 'primary'}
                      size="sm"
                      className="mt-4 w-full"
                      disabled={isCurrent}
                    >
                      {isCurrent ? 'Current' : 'Upgrade'}
                    </Button>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {/* Notifications */}
      {activeTab === 'Notifications' && (
        <div className="space-y-4 max-w-2xl">
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Bell className="h-4 w-4 text-indigo-600" /> Notification Preferences
              </h3>
            </CardHeader>
            <div className="space-y-4">
              {[
                { label: 'Invoice paid', desc: 'When a client pays an invoice', defaultOn: true },
                { label: 'Invoice overdue', desc: 'When an invoice becomes overdue', defaultOn: true },
                { label: 'New deal created', desc: 'When a new deal is added', defaultOn: false },
                { label: 'Activity reminder', desc: '1 hour before scheduled activities', defaultOn: true },
                { label: 'Weekly summary', desc: 'Weekly performance report via email', defaultOn: false },
                { label: 'Team updates', desc: 'When team members make changes', defaultOn: false },
              ].map(notif => (
                <div key={notif.label} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{notif.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{notif.desc}</p>
                  </div>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input type="checkbox" defaultChecked={notif.defaultOn} className="peer sr-only" />
                    <div className="peer h-5 w-9 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-indigo-600 peer-checked:after:translate-x-full dark:bg-gray-700" />
                  </label>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Button onClick={handleSave}>
                {saved ? <><Check className="h-4 w-4" /> Saved!</> : 'Save Preferences'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
