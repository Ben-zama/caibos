'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { mockActivities } from '@/lib/mock-data';
import { useAuth } from '@/lib/auth-context';
import { can } from '@/lib/permissions';
import type { ActivityType } from '@/types';
import { Plus, Phone, Mail, Calendar, CheckCircle2, Circle, Clock, FileText, Check } from 'lucide-react';

const activityConfig: Record<ActivityType, { icon: React.ElementType; color: string; bg: string; badge: 'blue' | 'green' | 'purple' | 'yellow' | 'gray' }> = {
  call: { icon: Phone, color: 'text-blue-600', bg: 'bg-blue-100', badge: 'blue' },
  email: { icon: Mail, color: 'text-green-600', bg: 'bg-green-100', badge: 'green' },
  meeting: { icon: Calendar, color: 'text-purple-600', bg: 'bg-purple-100', badge: 'purple' },
  task: { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100', badge: 'yellow' },
  note: { icon: FileText, color: 'text-gray-600', bg: 'bg-gray-100', badge: 'gray' },
};

const filters = ['All', 'Call', 'Email', 'Meeting', 'Task', 'Note'] as const;

export default function ActivitiesPage() {
  const { role } = useAuth();
  const [activities, setActivities] = useState(mockActivities);
  const [activeFilter, setActiveFilter] = useState<typeof filters[number]>('All');
  const [showCompleted, setShowCompleted] = useState(false);

  const toggleComplete = (id: string) => {
    setActivities(prev => prev.map(a => a.id === id ? { ...a, completed: !a.completed } : a));
  };

  const filtered = activities.filter(a => {
    const matchFilter = activeFilter === 'All' || a.type === activeFilter.toLowerCase();
    const matchCompleted = showCompleted || !a.completed;
    return matchFilter && matchCompleted;
  });

  const upcoming = filtered.filter(a => !a.completed);
  const completed = filtered.filter(a => a.completed);

  const stats = {
    total: activities.length,
    completed: activities.filter(a => a.completed).length,
    due: activities.filter(a => !a.completed && new Date(a.dueDate) <= new Date()).length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Activities</h1>
          <p className="text-sm text-gray-500 mt-1">Track calls, emails, meetings, and tasks</p>
        </div>
        {role && can(role, 'canCreate') && (
          <Button><Plus className="h-4 w-4" /> Log Activity</Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4 text-center dark:border-gray-800 dark:bg-gray-900">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
          <p className="text-xs text-gray-500 mt-1">Total</p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-center">
          <p className="text-2xl font-bold text-amber-700">{stats.due}</p>
          <p className="text-xs text-amber-600 mt-1">Due / Overdue</p>
        </div>
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-center">
          <p className="text-2xl font-bold text-green-700">{stats.completed}</p>
          <p className="text-xs text-green-600 mt-1">Completed</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1 flex-wrap">
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                activeFilter === f ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
          <input
            type="checkbox"
            checked={showCompleted}
            onChange={e => setShowCompleted(e.target.checked)}
            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          Show completed
        </label>
      </div>

      {/* Upcoming activities */}
      {upcoming.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Upcoming ({upcoming.length})</h2>
          <div className="space-y-2">
            {upcoming.map(act => {
              const cfg = activityConfig[act.type];
              const isOverdue = new Date(act.dueDate) < new Date();
              return (
                <div key={act.id} className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900 hover:shadow-sm transition-shadow">
                  <button
                    onClick={() => toggleComplete(act.id)}
                    className="mt-0.5 shrink-0 text-gray-300 hover:text-green-500 transition-colors"
                  >
                    <Circle className="h-5 w-5" />
                  </button>
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${cfg.bg}`}>
                    <cfg.icon className={`h-4 w-4 ${cfg.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{act.title}</p>
                      <Badge color={cfg.badge}>{act.type}</Badge>
                      {isOverdue && <Badge color="red">Overdue</Badge>}
                    </div>
                    {act.contactName && (
                      <p className="text-xs text-gray-500 mt-0.5">{act.contactName}</p>
                    )}
                    {act.description && (
                      <p className="text-xs text-gray-400 mt-1">{act.description}</p>
                    )}
                  </div>
                  <div className="shrink-0 text-right">
                    <p className={`text-xs font-medium ${isOverdue ? 'text-red-500' : 'text-gray-500'}`}>
                      {new Date(act.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Completed activities */}
      {showCompleted && completed.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-400 mb-3">Completed ({completed.length})</h2>
          <div className="space-y-2">
            {completed.map(act => {
              const cfg = activityConfig[act.type];
              return (
                <div key={act.id} className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4 opacity-70 dark:border-gray-800 dark:bg-gray-900/50">
                  <button
                    onClick={() => toggleComplete(act.id)}
                    className="mt-0.5 shrink-0 text-green-500 hover:text-gray-300 transition-colors"
                  >
                    <CheckCircle2 className="h-5 w-5" />
                  </button>
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${cfg.bg}`}>
                    <cfg.icon className={`h-4 w-4 ${cfg.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-500 line-through">{act.title}</p>
                    {act.contactName && <p className="text-xs text-gray-400 mt-0.5">{act.contactName}</p>}
                  </div>
                  <Check className="h-4 w-4 shrink-0 text-green-500 mt-1" />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="rounded-xl border border-dashed border-gray-300 py-16 text-center">
          <Calendar className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-sm text-gray-500">No activities found</p>
        </div>
      )}
    </div>
  );
}
