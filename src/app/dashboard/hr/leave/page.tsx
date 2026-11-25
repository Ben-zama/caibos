'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardValue } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { mockLeaveRequests } from '@/lib/hr-mock-data';
import { hrService } from '@/lib/api';
import { useApiQuery } from '@/hooks/useApiQuery';
import { useAuth } from '@/lib/auth-context';
import { clsx } from '@/lib/clsx';
import { Check, X } from 'lucide-react';
import type { LeaveStatus, LeaveType } from '@/types';

const statusColor: Record<LeaveStatus, 'green' | 'yellow' | 'red'> = {
  approved: 'green',
  pending: 'yellow',
  rejected: 'red',
};

const typeColor: Record<LeaveType, 'blue' | 'red' | 'gray' | 'purple' | 'indigo'> = {
  annual: 'blue',
  sick: 'red',
  unpaid: 'gray',
  maternity: 'purple',
  paternity: 'indigo',
};

const leaveTypes: LeaveType[] = ['annual', 'sick', 'unpaid', 'maternity', 'paternity'];

export default function LeavePage() {
  const { user } = useAuth();
  const isOwner = user?.role === 'owner';

  const { data: requests, setData: setRequests } = useApiQuery(
    () => hrService.getLeaveRequests(),
    mockLeaveRequests
  );

  const approve = async (id: string) => {
    setRequests(r => r.map(req => req.id === id ? { ...req, status: 'approved' } : req));
    await hrService.approveLeave(id).catch(() => undefined);
  };

  const reject = async (id: string) => {
    setRequests(r => r.map(req => req.id === id ? { ...req, status: 'rejected' } : req));
    await hrService.rejectLeave(id).catch(() => undefined);
  };

  // Balance summary: approved days per type
  const balanceSummary = leaveTypes.map(type => {
    const approved = requests.filter(r => r.type === type && r.status === 'approved').reduce((s, r) => s + r.days, 0);
    const pending = requests.filter(r => r.type === type && r.status === 'pending').reduce((s, r) => s + r.days, 0);
    return { type, approved, pending };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Leave Management</h1>
        <p className="text-sm text-gray-500 mt-1">Review and manage employee leave requests</p>
      </div>

      {/* Balance Summary Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {balanceSummary.map(b => (
          <Card key={b.type} className="p-4">
            <CardTitle className="capitalize mb-2">{b.type}</CardTitle>
            <CardValue className="text-lg">{b.approved}d</CardValue>
            {b.pending > 0 && (
              <p className="text-xs text-amber-500 mt-1">{b.pending}d pending</p>
            )}
          </Card>
        ))}
      </div>

      {/* Leave Requests Table */}
      <Card className="p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white">Leave Requests</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Employee</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Type</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Period</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Days</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Reason</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Status</th>
                {isOwner && <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {requests.map((req, i) => (
                <tr
                  key={req.id}
                  className={clsx(
                    'border-b border-gray-100 dark:border-gray-800 last:border-0',
                    i % 2 === 0 ? '' : 'bg-gray-50/50 dark:bg-gray-800/30'
                  )}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
                        {req.employeeName.charAt(0)}
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">{req.employeeName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge color={typeColor[req.type]} className="capitalize">{req.type}</Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{req.startDate} → {req.endDate}</td>
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{req.days}</td>
                  <td className="px-4 py-3 text-gray-500 max-w-[180px] truncate">{req.reason}</td>
                  <td className="px-4 py-3">
                    <Badge color={statusColor[req.status]} className="capitalize">{req.status}</Badge>
                  </td>
                  {isOwner && (
                    <td className="px-4 py-3">
                      {req.status === 'pending' ? (
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="primary" onClick={() => approve(req.id)}>
                            <Check className="h-3.5 w-3.5" />
                            Approve
                          </Button>
                          <Button size="sm" variant="danger" onClick={() => reject(req.id)}>
                            <X className="h-3.5 w-3.5" />
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">—</span>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
