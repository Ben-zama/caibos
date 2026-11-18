'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { mockContacts } from '@/lib/mock-data';
import { useAuth } from '@/lib/auth-context';
import { can } from '@/lib/permissions';
import type { ContactType } from '@/types';
import { Plus, Search, Phone, Mail, Building2, Tag } from 'lucide-react';

const typeColor: Record<ContactType, 'green' | 'blue' | 'gray'> = {
  client: 'green',
  lead: 'blue',
  vendor: 'gray',
};

export default function ContactsPage() {
  const { role } = useAuth();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<ContactType | 'all'>('all');
  const [view, setView] = useState<'grid' | 'table'>('grid');

  const filtered = mockContacts.filter(c => {
    const matchType = typeFilter === 'all' || c.type === typeFilter;
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.company?.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Contacts</h1>
          <p className="text-sm text-gray-500 mt-1">{mockContacts.length} total contacts</p>
        </div>
        {role && can(role, 'canCreate') && (
          <Button><Plus className="h-4 w-4" /> Add Contact</Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          {(['all', 'client', 'lead', 'vendor'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
                typeFilter === t ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {t}
              <span className="ml-1.5 text-xs text-gray-400">
                ({t === 'all' ? mockContacts.length : mockContacts.filter(c => c.type === t).length})
              </span>
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search contacts…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="rounded-lg border border-gray-200 bg-white pl-9 pr-3 py-2 text-sm placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-52"
            />
          </div>
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            <button
              onClick={() => setView('grid')}
              className={`px-3 py-2 text-sm transition-colors ${view === 'grid' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              Grid
            </button>
            <button
              onClick={() => setView('table')}
              className={`px-3 py-2 text-sm transition-colors ${view === 'table' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              Table
            </button>
          </div>
        </div>
      </div>

      {/* Grid view */}
      {view === 'grid' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(c => (
            <Card key={c.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-semibold">
                  {c.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900 dark:text-white truncate">{c.name}</p>
                    <Badge color={typeColor[c.type]}>{c.type}</Badge>
                  </div>
                  {c.company && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <Building2 className="h-3 w-3 text-gray-400" />
                      <p className="text-xs text-gray-500 truncate">{c.company}</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-4 space-y-1.5">
                <a href={`mailto:${c.email}`} className="flex items-center gap-2 text-xs text-gray-500 hover:text-indigo-600 transition-colors">
                  <Mail className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{c.email}</span>
                </a>
                {c.phone && (
                  <a href={`tel:${c.phone}`} className="flex items-center gap-2 text-xs text-gray-500 hover:text-indigo-600 transition-colors">
                    <Phone className="h-3.5 w-3.5 shrink-0" />
                    <span>{c.phone}</span>
                  </a>
                )}
              </div>
              {c.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {c.tags.map(tag => (
                    <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                      <Tag className="h-2.5 w-2.5" />{tag}
                    </span>
                  ))}
                </div>
              )}
              <p className="mt-3 text-xs text-gray-400">Added {new Date(c.createdAt).toLocaleDateString()}</p>
            </Card>
          ))}
        </div>
      )}

      {/* Table view */}
      {view === 'table' && (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50">
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Name</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 hidden sm:table-cell">Company</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 hidden md:table-cell">Email</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 hidden lg:table-cell">Phone</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Type</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 hidden xl:table-cell">Tags</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filtered.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold">
                          {c.name.charAt(0)}
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{c.company ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{c.email}</td>
                    <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">{c.phone ?? '—'}</td>
                    <td className="px-4 py-3"><Badge color={typeColor[c.type]}>{c.type}</Badge></td>
                    <td className="px-4 py-3 hidden xl:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {c.tags.map(tag => (
                          <span key={tag} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{tag}</span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {filtered.length === 0 && (
        <div className="rounded-xl border border-dashed border-gray-300 py-16 text-center">
          <Users className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-sm text-gray-500">No contacts found</p>
        </div>
      )}
    </div>
  );
}

function Users({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  );
}
