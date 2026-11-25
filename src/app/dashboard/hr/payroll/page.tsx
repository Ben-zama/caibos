'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardValue } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { mockPayroll } from '@/lib/hr-mock-data';
import { hrService } from '@/lib/api';
import { useApiQuery } from '@/hooks/useApiQuery';
import { formatCurrency } from '@/lib/format';
import { useAuth } from '@/lib/auth-context';
import { clsx } from '@/lib/clsx';
import { Download, CheckCircle } from 'lucide-react';
import type { PayrollRun } from '@/types';

const fmt = (n: number) => formatCurrency(n, 2);

type PayStatus = PayrollRun['status'];

const statusColor: Record<PayStatus, 'gray' | 'yellow' | 'green'> = {
  draft: 'gray',
  approved: 'yellow',
  paid: 'green',
};

export default function PayrollPage() {
  const { user } = useAuth();
  const isOwner = user?.role === 'owner';

  const { data: records, setData: setRecords } = useApiQuery(
    () => hrService.getPayroll(),
    mockPayroll
  );
  const periods = Array.from(new Set(records.map(p => p.period)));
  const [selectedPeriod, setSelectedPeriod] = useState(periods[0] ?? '');

  const filtered = records.filter(r => r.period === selectedPeriod);
  const totalNet = filtered.reduce((s, r) => s + r.netPay, 0);
  const totalGross = filtered.reduce((s, r) => s + r.basicSalary, 0);
  const totalDeductions = filtered.reduce((s, r) => s + r.deductions, 0);

  const approveRecord = async (id: string) => {
    setRecords(r => r.map(rec => rec.id === id ? { ...rec, status: 'approved' } : rec));
    await hrService.approvePayroll(id).catch(() => undefined);
  };

  const downloadPayslip = (emp: string, period: string) => {
    // Simulate download — in production this would generate a PDF
    const content = `Payslip - ${emp} - ${period}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payslip-${emp.replace(/\s+/g, '-')}-${period.replace(/\s+/g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payroll</h1>
          <p className="text-sm text-gray-500 mt-1">Process and manage employee payroll</p>
        </div>
        {/* Period Selector */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-500">Period:</label>
          <select
            value={selectedPeriod}
            onChange={e => setSelectedPeriod(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          >
            {periods.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardTitle>Gross Salary</CardTitle>
          <CardValue className="mt-2">{fmt(totalGross)}</CardValue>
          <p className="text-xs text-gray-400 mt-1">Before deductions</p>
        </Card>
        <Card>
          <CardTitle>Total Deductions</CardTitle>
          <CardValue className="mt-2 text-red-500">{fmt(totalDeductions)}</CardValue>
          <p className="text-xs text-gray-400 mt-1">Tax & contributions</p>
        </Card>
        <Card>
          <CardTitle>Net Pay</CardTitle>
          <CardValue className="mt-2 text-green-600">{fmt(totalNet)}</CardValue>
          <p className="text-xs text-gray-400 mt-1">{filtered.length} employees</p>
        </Card>
      </div>

      {/* Payroll Table */}
      <Card className="p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-white">Employee Breakdown — {selectedPeriod}</h3>
          <span className="text-sm text-gray-500">{filtered.length} records</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Employee</th>
                <th className="px-4 py-3 text-right font-medium text-gray-500 dark:text-gray-400">Basic Salary</th>
                <th className="px-4 py-3 text-right font-medium text-gray-500 dark:text-gray-400">Deductions</th>
                <th className="px-4 py-3 text-right font-medium text-gray-500 dark:text-gray-400">Net Pay</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Status</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((rec, i) => (
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
                  <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">{fmt(rec.basicSalary)}</td>
                  <td className="px-4 py-3 text-right text-red-500">-{fmt(rec.deductions)}</td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-white">{fmt(rec.netPay)}</td>
                  <td className="px-4 py-3">
                    <Badge color={statusColor[rec.status]} className="capitalize">{rec.status}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {isOwner && rec.status === 'draft' && (
                        <Button size="sm" variant="primary" onClick={() => approveRecord(rec.id)}>
                          <CheckCircle className="h-3.5 w-3.5" />
                          Approve
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => downloadPayslip(rec.employeeName, rec.period)}
                      >
                        <Download className="h-3.5 w-3.5" />
                        Payslip
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">Total</td>
                <td className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-white">{fmt(totalGross)}</td>
                <td className="px-4 py-3 text-right font-semibold text-red-500">-{fmt(totalDeductions)}</td>
                <td className="px-4 py-3 text-right font-bold text-green-600">{fmt(totalNet)}</td>
                <td colSpan={2} />
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>
    </div>
  );
}
