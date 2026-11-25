'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { mockEmployees } from '@/lib/hr-mock-data';
import { hrService } from '@/lib/api';
import { useApiQuery } from '@/hooks/useApiQuery';
import { formatCurrency } from '@/lib/format';
import { useAuth } from '@/lib/auth-context';
import { can } from '@/lib/permissions';
import { clsx } from '@/lib/clsx';
import { LayoutGrid, List, Search } from 'lucide-react';
import type { EmploymentStatus } from '@/types';

const fmt = (n: number) => formatCurrency(n, 0);

const statusColor: Record<EmploymentStatus, 'green' | 'yellow' | 'red'> = {
  active: 'green',
  on_leave: 'yellow',
  terminated: 'red',
};

const statusLabel: Record<EmploymentStatus, string> = {
  active: 'Active',
  on_leave: 'On Leave',
  terminated: 'Terminated',
};

export default function EmployeesPage() {
  const { user } = useAuth();
  const canViewSalary = user?.role ? can(user.role, 'canViewSettings') : false;
  const { data: employees } = useApiQuery(() => hrService.getEmployees(), mockEmployees);

  const [search, setSearch] = useState('');
  const [dept, setDept] = useState('All');
  const [view, setView] = useState<'grid' | 'table'>('table');

  const departments = ['All', ...Array.from(new Set(employees.map(e => e.department))).sort()];

  const filtered = employees.filter(e => {
    const matchesSearch =
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase()) ||
      e.jobTitle.toLowerCase().includes(search.toLowerCase());
    const matchesDept = dept === 'All' || e.department === dept;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Employees</h1>
          <p className="text-sm text-gray-500 mt-1">{employees.length} total employees</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setView('grid')}
            className={clsx(
              'rounded-lg p-2 transition-colors',
              view === 'grid' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500 hover:bg-gray-100'
            )}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setView('table')}
            className={clsx(
              'rounded-lg p-2 transition-colors',
              view === 'table' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500 hover:bg-gray-100'
            )}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search employees…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white pl-9 pr-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {departments.map(d => (
            <button
              key={d}
              onClick={() => setDept(d)}
              className={clsx(
                'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                dept === d
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:ring-gray-700 dark:text-gray-300'
              )}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Grid View */}
      {view === 'grid' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(emp => (
            <Card key={emp.id}>
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-lg font-bold">
                  {emp.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900 dark:text-white truncate">{emp.name}</p>
                    <Badge color={statusColor[emp.employmentStatus]}>{statusLabel[emp.employmentStatus]}</Badge>
                  </div>
                  <p className="text-sm text-gray-500 truncate">{emp.jobTitle}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{emp.department}</p>
                  <p className="text-xs text-gray-400 truncate">{emp.email}</p>
                  {canViewSalary && (
                    <p className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">{fmt(emp.salary)}<span className="text-xs font-normal text-gray-400">/yr</span></p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Table View */}
      {view === 'table' && (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Name</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Title</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Department</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Start Date</th>
                  {canViewSalary && (
                    <th className="px-4 py-3 text-right font-medium text-gray-500 dark:text-gray-400">Salary</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filtered.map((emp, i) => (
                  <tr
                    key={emp.id}
                    className={clsx(
                      'border-b border-gray-100 dark:border-gray-800 last:border-0',
                      i % 2 === 0 ? '' : 'bg-gray-50/50 dark:bg-gray-800/30'
                    )}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
                          {emp.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{emp.name}</p>
                          <p className="text-xs text-gray-400">{emp.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{emp.jobTitle}</td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{emp.department}</td>
                    <td className="px-4 py-3">
                      <Badge color={statusColor[emp.employmentStatus]}>{statusLabel[emp.employmentStatus]}</Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{emp.startDate}</td>
                    {canViewSalary && (
                      <td className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">{fmt(emp.salary)}</td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="py-12 text-center text-sm text-gray-400">No employees match your filters.</div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
