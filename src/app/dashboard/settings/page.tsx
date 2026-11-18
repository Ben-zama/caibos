'use client';

import React, { useState } from 'react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/lib/auth-context';
import { mockBusiness, mockUsers } from '@/lib/mock-data';
import { Building2, Users, Shield, CreditCard, Bell, Globe, Trash2, Plus, Check } from 'lucide-react';

const tabs = ['Business Profile', 'Team', 'Subscription', 'Notifications'] as const;

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<typeof tabs[number]>('Business Profile');
  const [saved, setSaved] = useState(false);

  if (user?.role !== 'owner') {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Shield className="h-12 w-12 text-gray-300 mb-4" />
        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Access Restricted</h2>
        <p className="text-sm text-gray-400 mt-1">Only business owners can access settings.</p>
      </div>
    );
  }

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
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
              {[
                { label: 'Business Name', defaultValue: mockBusiness.name },
                { label: 'Industry', defaultValue: mockBusiness.industry },
                { label: 'Business Email', defaultValue: 'contact@acme.com' },
                { label: 'Phone Number', defaultValue: '+1 555-0100' },
                { label: 'Website', defaultValue: 'https://acme.com' },
              ].map(field => (
                <div key={field.label}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{field.label}</label>
                  <input
                    type="text"
                    defaultValue={field.defaultValue}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Business Address</label>
                <textarea
                  rows={2}
                  defaultValue="123 Business Ave, Suite 400, New York, NY 10001"
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white resize-none"
                />
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <Button onClick={handleSave}>
                {saved ? <><Check className="h-4 w-4" /> Saved!</> : 'Save Changes'}
              </Button>
              <Button variant="secondary">Cancel</Button>
            </div>
          </Card>
        </div>
      )}

      {/* Team */}
      {activeTab === 'Team' && (
        <div className="space-y-4 max-w-3xl">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">{mockUsers.filter(u => u.businessId === 'biz-001').length} team members</p>
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
                {mockUsers.filter(u => u.businessId === 'biz-001').map(u => (
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
                      <Badge color={u.role === 'owner' ? 'indigo' : 'yellow' as 'yellow'}>
                        {u.role === 'owner' ? 'Owner' : 'Admin'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3"><Badge color="green">Active</Badge></td>
                    <td className="px-4 py-3 text-right">
                      {u.role !== 'owner' && (
                        <button className="text-red-400 hover:text-red-600 p-1 rounded">
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
                  <p className="font-bold text-indigo-700 text-lg capitalize">{mockBusiness.plan} Plan</p>
                  <p className="text-sm text-indigo-600 mt-0.5">Billed monthly · Next renewal Dec 15, 2024</p>
                </div>
                <Badge color="indigo">Active</Badge>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                { name: 'Free', price: '$0', features: ['1 user', 'Basic Finance', 'Up to 10 invoices'] },
                { name: 'Pro', price: '$29', features: ['5 users', 'Full Finance', 'Full CRM', 'Reports'], current: true },
                { name: 'Enterprise', price: '$99', features: ['Unlimited users', 'All features', 'Priority support'] },
              ].map(plan => (
                <div
                  key={plan.name}
                  className={`rounded-xl border p-4 ${plan.current ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'}`}
                >
                  <p className={`font-semibold ${plan.current ? 'text-indigo-700' : 'text-gray-900 dark:text-white'}`}>{plan.name}</p>
                  <p className={`text-2xl font-bold mt-1 ${plan.current ? 'text-indigo-700' : 'text-gray-900 dark:text-white'}`}>
                    {plan.price}<span className="text-sm font-normal text-gray-400">/mo</span>
                  </p>
                  <ul className="mt-3 space-y-1.5">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                        <Check className="h-3 w-3 text-green-500 shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant={plan.current ? 'ghost' : 'primary'}
                    size="sm"
                    className="mt-4 w-full"
                    disabled={plan.current}
                  >
                    {plan.current ? 'Current' : 'Upgrade'}
                  </Button>
                </div>
              ))}
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
