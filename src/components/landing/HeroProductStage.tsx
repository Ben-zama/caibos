'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { appConfig } from '@/config/app.config';

type PreviewModule = 'finance' | 'crm' | 'inventory' | 'hr';

interface ModuleSnapshot {
  id: PreviewModule;
  label: string;
  routeLabel: string;
  summary: string;
  kpis: { label: string; value: string; note: string }[];
  rowsTitle: string;
  rows: { primary: string; secondary: string; figure: string; status: string }[];
  barsTitle: string;
  bars: { label: string; pct: number; figure: string }[];
}

const MODULE_SNAPSHOTS: Record<PreviewModule, ModuleSnapshot> = {
  finance: {
    id: 'finance',
    label: 'Finance',
    routeLabel: '/dashboard/finance',
    summary: 'Live revenue ledger, aging invoices, and expense categorization in one view.',
    kpis: [
      { label: 'Collected Revenue', value: '$148,920', note: '+14.2% vs prior 30d' },
      { label: 'Net Margin', value: '31.4%', note: 'After operating expenses' },
      { label: 'Open Invoices', value: '$17,050', note: '4 sent · 1 overdue' },
      { label: 'Cash On Hand', value: '$92,410', note: 'Reconciled daily' },
    ],
    rowsTitle: 'Recent Invoices',
    rows: [
      { primary: 'TechStart Ltd', secondary: 'INV-2026-041 · Due Mar 12', figure: '$14,950', status: 'Paid' },
      { primary: 'Vanguard Logistics', secondary: 'INV-2026-042 · Due Mar 18', figure: '$8,400', status: 'Sent' },
      { primary: 'Green Solutions Co', secondary: 'INV-2026-038 · 4 days past', figure: '$3,200', status: 'Overdue' },
      { primary: 'Harbor Supply Group', secondary: 'INV-2026-044 · Draft', figure: '$6,150', status: 'Draft' },
    ],
    barsTitle: 'Monthly Cash Flow ($K)',
    bars: [
      { label: 'Oct', pct: 58, figure: '$19.4k' },
      { label: 'Nov', pct: 71, figure: '$23.8k' },
      { label: 'Dec', pct: 84, figure: '$28.1k' },
      { label: 'Jan', pct: 77, figure: '$25.6k' },
      { label: 'Feb', pct: 95, figure: '$31.9k' },
    ],
  },
  crm: {
    id: 'crm',
    label: 'CRM Pipeline',
    routeLabel: '/dashboard/crm/deals',
    summary: 'Track contacts, weighted deal velocity, and scheduled follow-ups without switching tools.',
    kpis: [
      { label: 'Active Pipeline', value: '$284,500', note: '19 qualified opportunities' },
      { label: 'Weighted Forecast', value: '$162,800', note: 'Current quarter close' },
      { label: 'Win Rate', value: '34.8%', note: 'Last 90 days' },
      { label: 'Avg. Deal Cycle', value: '18 days', note: '4 days faster QoQ' },
    ],
    rowsTitle: 'Priority Deals',
    rows: [
      { primary: 'Annual Fleet Renewal', secondary: 'Nova Retail Group · Negotiation', figure: '$48,000', status: '80%' },
      { primary: 'Warehouse POS Rollout', secondary: 'Kestrel Coffee Co · Proposal', figure: '$32,500', status: '60%' },
      { primary: 'Multi-Branch ERP License', secondary: 'Meridian Health · Qualified', figure: '$64,000', status: '40%' },
      { primary: 'Q2 Procurement Suite', secondary: 'BlueSky Agency · Won', figure: '$22,000', status: 'Closed' },
    ],
    barsTitle: 'Pipeline By Stage',
    bars: [
      { label: 'Lead', pct: 42, figure: '$44.0k' },
      { label: 'Qualified', pct: 68, figure: '$76.5k' },
      { label: 'Proposal', pct: 82, figure: '$92.0k' },
      { label: 'Negotiation', pct: 64, figure: '$72.0k' },
      { label: 'Closed Won', pct: 91, figure: '$104.2k' },
    ],
  },
  inventory: {
    id: 'inventory',
    label: 'Inventory',
    routeLabel: '/dashboard/inventory',
    summary: 'Real-time SKU valuation, automatic reorder thresholds, and one-click purchase orders.',
    kpis: [
      { label: 'Retail Valuation', value: '$194,620', note: '342 active SKUs' },
      { label: 'Stock Accuracy', value: '99.4%', note: 'Last cycle audit' },
      { label: 'Reorder Alerts', value: '3 SKUs', note: 'Below safety threshold' },
      { label: 'Open POs', value: '5 orders', note: '$14,820 inbound' },
    ],
    rowsTitle: 'Stock Movements & Alerts',
    rows: [
      { primary: 'Industrial Label Printer', secondary: 'SKU-LP-402 · Reorder point 10', figure: '4 units', status: 'Low Stock' },
      { primary: 'Thermal Paper Roll (24pk)', secondary: 'SKU-TP-118 · PO-2026-064', figure: '+120 units', status: 'Received' },
      { primary: 'USB-C Barcode Scanner', secondary: 'SKU-BS-209 · Reorder point 8', figure: '0 units', status: 'Out of Stock' },
      { primary: 'Packing Tape Dispenser', secondary: 'SKU-PT-087 · Stock count', figure: '68 units', status: 'In Stock' },
    ],
    barsTitle: 'Stock Health By Category',
    bars: [
      { label: 'Hardware', pct: 74, figure: '86 SKUs' },
      { label: 'Packaging', pct: 92, figure: '112 SKUs' },
      { label: 'Supplies', pct: 81, figure: '64 SKUs' },
      { label: 'Parts', pct: 56, figure: '48 SKUs' },
      { label: 'Accessories', pct: 88, figure: '32 SKUs' },
    ],
  },
  hr: {
    id: 'hr',
    label: 'HR & Payroll',
    routeLabel: '/dashboard/hr/payroll',
    summary: 'Employee directory, attendance tracking, leave approvals, and payslip runs in sync.',
    kpis: [
      { label: 'Headcount', value: '42 staff', note: '5 departments active' },
      { label: 'Attendance Today', value: '95.2%', note: '40 present · 2 on leave' },
      { label: 'Pending Leave', value: '3 requests', note: 'Awaiting manager review' },
      { label: 'Monthly Payroll', value: '$168,400', note: 'Scheduled Feb 28' },
    ],
    rowsTitle: 'Current Payroll Run',
    rows: [
      { primary: 'Engineering (14)', secondary: 'Gross $84,200 · Tax $16,840', figure: '$67,360', status: 'Approved' },
      { primary: 'Operations (11)', secondary: 'Gross $46,500 · Tax $8,370', figure: '$38,130', status: 'Approved' },
      { primary: 'Sales & Account (9)', secondary: 'Gross $42,800 · Tax $7,704', figure: '$35,096', status: 'Draft' },
      { primary: 'Finance & Admin (8)', secondary: 'Gross $34,900 · Tax $7,086', figure: '$27,814', status: 'Approved' },
    ],
    barsTitle: 'Headcount Distribution',
    bars: [
      { label: 'Engineering', pct: 88, figure: '14' },
      { label: 'Operations', pct: 70, figure: '11' },
      { label: 'Sales', pct: 58, figure: '9' },
      { label: 'Finance', pct: 50, figure: '8' },
      { label: 'Leadership', pct: 32, figure: '4' },
    ],
  },
};

const MODULE_ORDER: PreviewModule[] = ['finance', 'crm', 'inventory', 'hr'];

export function HeroProductStage() {
  const [activeModule, setActiveModule] = useState<PreviewModule>('finance');
  const snapshot = MODULE_SNAPSHOTS[activeModule];

  return (
    <section
      id="product"
      className="relative border-b border-slate-200/80 bg-[#FAFAFC] pt-10 pb-16 lg:pt-14 lg:pb-24"
    >
      <div className="mx-auto max-w-6xl px-6">
        {/* Top proposition block */}
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-medium text-slate-500">
            <span>Finance</span>
            <span className="mx-2 text-slate-300" aria-hidden="true">·</span>
            <span>CRM</span>
            <span className="mx-2 text-slate-300" aria-hidden="true">·</span>
            <span>Inventory</span>
            <span className="mx-2 text-slate-300" aria-hidden="true">·</span>
            <span>HR &amp; Payroll</span>
          </p>

          <h1
            className="font-display mt-4 font-bold tracking-tight text-slate-950 text-balance"
            style={{ fontSize: 'clamp(2.25rem, 3.8vw, 3.45rem)', lineHeight: 1.08 }}
          >
            Run finance, sales, stock, and payroll from one workspace.
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
            {appConfig.brand.name} replaces disconnected spreadsheets and four separate software
            subscriptions with one shared operational ledger—built for growing teams and
            multi-business operators.
          </p>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition-colors duration-150 hover:bg-indigo-700 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Launch Live Workspace
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <a
              href="#demo"
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-800 transition-colors duration-150 hover:border-slate-400 hover:bg-slate-50 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Schedule Product Walkthrough
            </a>
          </div>

          <p className="mt-3.5 text-xs text-slate-500">
            Interactive sandbox included · Role-based views for Owner, Admin, and Platform Operator · REST API ready
          </p>
        </div>

        {/* Interactive SaaS Workspace Stage */}
        <div className="mt-10 lg:mt-11">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_24px_60px_-24px_rgba(15,23,42,0.12)]">
            {/* Browser chrome & module switcher */}
            <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50/80 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5" aria-hidden="true">
                  <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                  <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                  <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                </div>
                <span className="font-mono text-xs text-slate-500 truncate">
                  app.{appConfig.brand.name.toLowerCase()}.io{snapshot.routeLabel}
                </span>
              </div>

              {/* Interactive segmented control */}
              <div
                role="tablist"
                aria-label="Preview workspace modules"
                className="grid grid-cols-2 gap-1 rounded-lg bg-slate-200/70 p-1 sm:flex sm:items-center"
              >
                {MODULE_ORDER.map(key => {
                  const mod = MODULE_SNAPSHOTS[key];
                  const isSelected = activeModule === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      role="tab"
                      aria-selected={isSelected}
                      onClick={() => setActiveModule(key)}
                      className={`rounded-md px-3 py-1.5 text-center text-xs font-medium transition-all duration-150 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-indigo-600 ${
                        isSelected
                          ? 'bg-white text-slate-950 shadow-xs'
                          : 'text-slate-600 hover:text-slate-950'
                      }`}
                    >
                      {mod.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Stage body */}
            <div className="p-5 sm:p-8" data-testid="hero-preview-panel">
              <div className="flex flex-col gap-2 border-b border-slate-100 pb-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="font-display text-lg font-semibold text-slate-950">
                    {snapshot.label} Workspace
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">{snapshot.summary}</p>
                </div>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 whitespace-nowrap shrink-0"
                >
                  Open full module
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>

              {/* 4 KPI strip */}
              <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                {snapshot.kpis.map(kpi => (
                  <div
                    key={kpi.label}
                    className="rounded-xl border border-slate-200/90 bg-slate-50/50 p-4"
                  >
                    <p className="text-xs font-medium text-slate-500">{kpi.label}</p>
                    <p className="font-mono mt-2 text-xl font-semibold tracking-tight text-slate-950 tabular-nums sm:text-2xl">
                      {kpi.value}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">{kpi.note}</p>
                  </div>
                ))}
              </div>

              {/* Split analytical table + horizontal bars */}
              <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
                <div className="lg:col-span-7">
                  <div className="flex items-center justify-between pb-3">
                    <h3 className="text-xs font-semibold text-slate-700">{snapshot.rowsTitle}</h3>
                    <span className="text-xs text-slate-400">Live workspace view</span>
                  </div>
                  <div className="divide-y divide-slate-100 border-t border-slate-200/80">
                    {snapshot.rows.map(row => (
                      <div
                        key={row.primary}
                        className="flex items-center justify-between gap-4 py-3 text-sm"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-medium text-slate-900">{row.primary}</p>
                          <p className="truncate text-xs text-slate-500">{row.secondary}</p>
                        </div>
                        <div className="flex items-center gap-4 shrink-0">
                          <span className="font-mono text-sm font-semibold text-slate-900 tabular-nums">
                            {row.figure}
                          </span>
                          <span className="w-20 text-right text-xs font-medium text-slate-500">
                            {row.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-slate-200/80 pt-5 lg:col-span-5 lg:border-t-0 lg:border-l lg:pl-6 lg:pt-0">
                  <div className="flex items-center justify-between pb-4">
                    <h3 className="text-xs font-semibold text-slate-700">{snapshot.barsTitle}</h3>
                    <span className="text-xs text-slate-400">Last 5 periods</span>
                  </div>
                  <div className="space-y-3.5">
                    {snapshot.bars.map(bar => (
                      <div key={bar.label} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-slate-700">{bar.label}</span>
                          <span className="font-mono font-medium text-slate-900 tabular-nums">
                            {bar.figure}
                          </span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-indigo-600 transition-all duration-200"
                            style={{ width: `${bar.pct}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
