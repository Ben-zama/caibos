'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardValue } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { mockAttendance } from '@/lib/hr-mock-data';
import { hrService } from '@/lib/api';
import { useApiQuery } from '@/hooks/useApiQuery';
import { clsx } from '@/lib/clsx';
import type { AttendanceStatus } from '@/types';

const statusColor: Record<AttendanceStatus, 'green' | 'red' | 'yellow' | 'blue'> = {
  present: 'green',
  absent: 'red',
  late: 'yellow',
  half_day: 'blue',
};

const statusLabel: Record<AttendanceStatus, string> = {
  present: 'Present',
  absent: 'Absent',
  late: 'Late',
  half_day: 'Half Day',
};

export default function AttendancePage() {
  const { data: attendance } = useApiQuery(() => hrService.getAttendance(), mockAttendance);
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  // Deduplicate by employeeId (take first occurrence per employee for display)
  const seen = new Set<string>();
  const records = attendance.filter(r => {
    if (seen.has(r.employeeId)) return false;
    seen.add(r.employeeId);
    return true;
  });

  const total = records.length;
  const present = records.filter(r => r.status === 'present').length;
  const absent = records.filter(r => r.status === 'absent').length;
  const late = records.filter(r => r.status === 'late').length;
  const halfDay = records.filter(r => r.status === 'half_day').length;
  const attendanceRate = total > 0 ? Math.round((present / total) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Attendance</h1>
        <p className="text-sm text-gray-500 mt-1">{today}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardTitle>Present</CardTitle>
          <CardValue className="text-green-600 mt-2">{present}</CardValue>
        </Card>
        <Card>
          <CardTitle>Absent</CardTitle>
          <CardValue className="text-red-500 mt-2">{absent}</CardValue>
        </Card>
        <Card>
          <CardTitle>Late</CardTitle>
          <CardValue className="text-amber-500 mt-2">{late}</CardValue>
        </Card>
        <Card>
          <CardTitle>Half Day</CardTitle>
          <CardValue className="text-blue-500 mt-2">{halfDay}</CardValue>
        </Card>
      </div>

      {/* Attendance Rate Progress Bar */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900 dark:text-white">Today&apos;s Attendance Rate</h3>
          <span className="text-2xl font-bold text-indigo-600">{attendanceRate}%</span>
        </div>
        <div className="h-3 w-full rounded-full bg-gray-100 dark:bg-gray-800">
          <div
            className="h-3 rounded-full bg-indigo-500 transition-all"
            style={{ width: `${attendanceRate}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-gray-400">{present} of {total} employees present today</p>
      </Card>

      {/* Attendance Table */}
      <Card className="p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white">Today&apos;s Records</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Employee</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Status</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Clock In</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Clock Out</th>
              </tr>
            </thead>
            <tbody>
              {records.map((rec, i) => (
                <tr
                  key={rec.id}
                  className={clsx(
                    'border-b border-gray-100 dark:border-gray-800 last:border-0',
                    i % 2 === 0 ? '' : 'bg-gray-50/50 dark:bg-gray-800/30'
                  )}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
                        {rec.employeeName.charAt(0)}
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">{rec.employeeName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge color={statusColor[rec.status]}>{statusLabel[rec.status]}</Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300 font-mono">
                    {rec.clockIn ?? <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300 font-mono">
                    {rec.clockOut ?? <span className="text-amber-500 text-xs">Still in</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
