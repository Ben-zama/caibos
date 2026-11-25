'use client';

import React, { useState } from 'react';
import Image, { type StaticImageData } from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Building2, Layers, ShieldCheck } from 'lucide-react';
import opsWorkspaceImg from '@/assets/images/caibos_ops_workspace_1795642488821.jpg';
import warehouseOpsImg from '@/assets/images/caibos_warehouse_ops_1795642488857.jpg';
import teamCollabImg from '@/assets/images/caibos_team_collab_1795642489374.jpg';

function ResilientPhoto({
  src,
  alt,
  caption,
}: {
  src: StaticImageData;
  alt: string;
  caption: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-slate-100 p-6 text-center text-slate-500">
        <Layers className="h-6 w-6 text-slate-400" aria-hidden="true" />
        <p className="mt-2 text-xs font-medium">{caption}</p>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="(max-width: 1024px) 100vw, 50vw"
      className="object-cover"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  );
}

export function CapabilitiesBento() {
  return (
    <section id="modules" className="border-b border-slate-200/80 bg-white py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-indigo-600">Unified Architecture</p>
          <h2 className="font-display mt-3 text-3xl font-bold tracking-tight text-slate-950 text-balance sm:text-4xl">
            Five core modules sharing one live data model.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-600">
            When an invoice is paid, a purchase order is received, or a payroll run is approved,
            every downstream balance updates automatically—with zero CSV imports between tools.
          </p>
        </div>

        {/* Asymmetric 12-column Bento Grid */}
        <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Card 01: Finance & Invoicing (Wide span-7 with editorial photography) */}
          <article className="flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-[#FAFAFC] lg:col-span-7">
            <div className="p-6 sm:p-8">
              <p className="text-xs font-medium text-slate-500">
                01. Finance &amp; Invoicing · Automated Ledger
              </p>
              <h3 className="font-display mt-2 text-xl font-semibold text-slate-950">
                Invoices, cash flow, and profit statements reconciled in real time.
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                Create and send branded invoices, log incoming and outgoing payments, categorize
                vendor expenses, and review live P&amp;L aging reports without exporting to external
                spreadsheets.
              </p>
            </div>
            <div className="relative mt-auto aspect-[16/9] w-full overflow-hidden border-t border-slate-200/80 bg-slate-100">
              <ResilientPhoto
                src={opsWorkspaceImg}
                alt="Bright minimalist operations desk representing Caibos Finance and ledger control"
                caption="Finance & Operations Workspace"
              />
            </div>
          </article>

          {/* Card 02: CRM & Sales Pipeline (Span-5 structured capability card) */}
          <article className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 lg:col-span-5">
            <div>
              <p className="text-xs font-medium text-slate-500">
                02. CRM &amp; Sales Pipeline · Revenue Ops
              </p>
              <h3 className="font-display mt-2 text-xl font-semibold text-slate-950">
                From first contact to signed contract in one pipeline.
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                Manage leads, clients, and vendors alongside Kanban deal boards, weighted close
                probabilities, and daily call or meeting checklists.
              </p>

              <dl className="mt-8 space-y-4 border-t border-slate-200/80 pt-6">
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-xs font-medium text-slate-500">Pipeline Stages</dt>
                  <dd className="text-sm font-medium text-slate-900">Lead → Qualified → Won</dd>
                </div>
                <div className="flex items-baseline justify-between gap-4 border-t border-slate-100 pt-4">
                  <dt className="text-xs font-medium text-slate-500">Activity Tracking</dt>
                  <dd className="text-sm font-medium text-slate-900">Calls, emails, meetings, tasks</dd>
                </div>
                <div className="flex items-baseline justify-between gap-4 border-t border-slate-100 pt-4">
                  <dt className="text-xs font-medium text-slate-500">Invoicing Handoff</dt>
                  <dd className="text-sm font-medium text-slate-900">Client records shared with Finance</dd>
                </div>
              </dl>
            </div>

            <div className="mt-8 border-t border-slate-100 pt-5">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
              >
                Inspect live CRM pipeline
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </article>

          {/* Card 03: Real-Time Inventory (Span-6 with fulfillment studio visual) */}
          <article className="flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-[#FAFAFC] lg:col-span-6">
            <div className="p-6 sm:p-8">
              <p className="text-xs font-medium text-slate-500">
                03. Inventory &amp; Procurement · Stock Control
              </p>
              <h3 className="font-display mt-2 text-xl font-semibold text-slate-950">
                Automatic stock receipt on every purchase order.
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                Monitor SKU margins, stock movements, and physical count adjustments. Marking a
                purchase order received immediately updates warehouse quantities and cost valuation.
              </p>
            </div>
            <div className="relative mt-auto aspect-[16/9] w-full overflow-hidden border-t border-slate-200/80 bg-slate-100">
              <ResilientPhoto
                src={warehouseOpsImg}
                alt="Organized modern boutique fulfillment studio with barcode scanner and labeled inventory shelving"
                caption="Inventory & Fulfillment Operations"
              />
            </div>
          </article>

          {/* Card 04: HR, Leave & Payroll (Span-6 with founders collaboration visual) */}
          <article className="flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-[#FAFAFC] lg:col-span-6">
            <div className="p-6 sm:p-8">
              <p className="text-xs font-medium text-slate-500">
                04. HR &amp; Payroll · People Operations
              </p>
              <h3 className="font-display mt-2 text-xl font-semibold text-slate-950">
                Directory, attendance, leave approvals, and payslips together.
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                Review daily attendance rates, approve or decline time-off requests in one click,
                and run monthly gross-to-net payroll with downloadable employee payslips.
              </p>
            </div>
            <div className="relative mt-auto aspect-[16/9] w-full overflow-hidden border-t border-slate-200/80 bg-slate-100">
              <ResilientPhoto
                src={teamCollabImg}
                alt="Two founders reviewing quarterly financial and staffing dashboards together at a sunlit studio table"
                caption="Team & Payroll Management"
              />
            </div>
          </article>

          {/* Card 05: Multi-Tenant Platform Control & API-Ready Codebase (Full-width horizontal split) */}
          <article className="grid grid-cols-1 gap-8 rounded-2xl border border-slate-200/90 bg-slate-950 p-6 text-slate-100 sm:p-10 lg:col-span-12 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7">
              <p className="text-xs font-medium text-indigo-300">
                05. Platform Admin &amp; API Architecture · Multi-Tenant Control
              </p>
              <h3 className="font-display mt-2 text-2xl font-semibold tracking-tight text-white">
                Built for operators managing multiple businesses—and engineers connecting any backend.
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">
                Provision tenant workspaces, adjust subscription tiers and seat limits, monitor
                platform MRR, and switch the entire frontend from sandbox mode to your production
                REST API with a single environment variable.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 border-t border-slate-800 pt-6 sm:grid-cols-2 lg:col-span-5 lg:border-t-0 lg:border-l lg:pl-8 lg:pt-0">
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Building2 className="h-4 w-4 text-indigo-400" aria-hidden="true" />
                  <span>Tenant Directory</span>
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
                  Manage active, trial, and suspended workspaces with CSV export and live MRR rollups.
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <ShieldCheck className="h-4 w-4 text-indigo-400" aria-hidden="true" />
                  <span>Role-Based Access</span>
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
                  Distinct permissions for Platform Admin, Business Owner, and Delegated Admin roles.
                </p>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
