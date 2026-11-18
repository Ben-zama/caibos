'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardValue } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { DonutChart } from '@/components/ui/charts/DonutChart';
import { mockEmployees, mockLeaveRequests, mockAttendance, mockPayroll } from '@/lib/hr-mock-data';
import { Users, UserX, Clock, Banknote, ArrowRight } from 'lucide-react';
import Link from 'next/link';

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

const leaveStatusColor: Record<string, 'green' | 'yellow' | 'red'> = {
  approved: 'green',
  pending: 'yellow',
  rejected: 'red',
};

const leaveTypeColor: Record<string, 'blue' | 'red' | 'gray' | 'purple' | 'indigo'> = {
  annual: 'blue',
  sick: 'red',
  unpaid: 'gray',
  maternity: 'purple',
  paternity: 'indigo',
};

export default function HROverviewPage() {
  const totalEmployees = mockEmployees.length;
  const onLeave = mockEmployees.filter(e => e.employmentStatus === 'on_leave').length;
  const presentToday = mockAttendance.filter(a => a.status === 'present').length;
  const uniqueAttendance = new Set(mockAttendance.map(a => a.employeeId)).size;
  const attendanceRate = uniqueAttendance > 0 ? Math.round((presentToday / uniqueAttendance) * 100) : 0;
  const payrollTotal = mockPayroll.reduce((s, p) => s + p.netPay, 0);

  // Headcount by department
  const deptMap: Record<string, number> = {};
  for (const emp of mockEmployees) {
    deptMap[emp.department] = (deptMap[emp.department] ?? 0) + 1;
  }
  const deptData = Object.entries(deptMap).map(([name, value]) => ({ name, value }));

  const recentLeave = mockLeaveRequests.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">HR &amp; Payroll</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your workforce, leave, attendance, and payroll</p>
        </div>
        <Link
          href="/dashboard/hr/employees"
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
        >
          View Employees
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Employees</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-indigo-100 flex items-center justify-center">
              <Users className="h-4 w-4 text-indigo-600" />
            </div>
          </CardHeader>
          <CardValue>{totalEmployees}</CardValue>
          <p className="mt-1 text-xs text-gray-400">{mockEmployees.filter(e => e.employmentStatus === 'active').length} active</p>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>On Leave</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-amber-100 flex items-center justify-center">
              <UserX className="h-4 w-4 text-amber-600" />
            </div>
          </CardHeader>
          <CardValue>{onLeave}</CardValue>
          <p className="mt-1 text-xs text-gray-400">{mockLeaveRequests.filter(l => l.status === 'pending').length} pending requests</p>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Attendance Rate</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center">
              <Clock className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardValue className="text-green-600">{attendanceRate}%</CardValue>
          <p className="mt-1 text-xs text-gray-400">Today · {presentToday} present</p>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payroll Total</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <Banknote className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardValue>{fmt(payrollTotal)}</CardValue>
          <p className="mt-1 text-xs text-gray-400">Current period net pay</p>
        </Card>
      </div>

      {/* Chart + Recent Leave */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Headcount by Department</h3>
              <p className="text-xs text-gray-400 mt-0.5">{totalEmployees} total employees</p>
            </div>
          </CardHeader>
          <DonutChart data={deptData} className="h-56" />
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <h3 className="font-semibold text-gray-900 dark:text-white">Recent Leave Requests</h3>
            <Link href="/dashboard/hr/leave" className="text-xs text-indigo-600 hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <div className="space-y-3">
            {recentLeave.map(req => (
              <div key={req.id} className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-sm font-semibold">
                  {req.employeeName.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{req.employeeName}</p>
                  <p className="text-xs text-gray-400">{req.startDate} → {req.endDate} · {req.days}d</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge color={leaveTypeColor[req.type]}>{req.type}</Badge>
                  <Badge color={leaveStatusColor[req.status]}>{req.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
