import React from 'react';

const OUTCOME_METRICS = [
  {
    value: '14.5 hrs/wk',
    label: 'Saved on month-end close',
    context: 'Measured across 18–45 seat service & retail teams',
  },
  {
    value: '99.4%',
    label: 'Inventory ledger accuracy',
    context: 'With automatic PO-to-stock reconciliation',
  },
  {
    value: '3.2 days',
    label: 'Faster invoice collection',
    context: 'Average reduction in days sales outstanding',
  },
  {
    value: '4 tools',
    label: 'Replaced by one workspace',
    context: 'Accounting, CRM, stock control, and payroll',
  },
] as const;

const CASE_STUDIES = [
  {
    company: 'Harbor & Finch Roasters',
    sector: 'Wholesale & Retail · 28 employees · Portland, OR',
    headline: 'Cut weekly inventory reconciliation from six hours to twenty minutes.',
    body: 'Before switching to Caibos, warehouse counts lived in spreadsheets disconnected from wholesale invoices. Linking purchase orders directly to stock levels eliminated double-entry errors and caught three recurring SKU stockouts in the first month.',
    author: 'Hannah Lindstrom',
    role: 'Director of Operations, Harbor & Finch Roasters',
  },
  {
    company: 'Kestrel Mechanical Group',
    sector: 'Commercial Services · 44 employees · Austin, TX',
    headline: 'Consolidated CRM, billing, and monthly payroll under one permission model.',
    body: 'Project leads used to chase finance every Friday for invoice statuses while managers tracked leave in email threads. Now field coordinators update deals and attendance in one place while owners keep salary and subscription settings strictly locked.',
    author: 'Marcus Delgado',
    role: 'Managing Partner, Kestrel Mechanical Group',
  },
  {
    company: 'Alderfield Holdings',
    sector: 'Multi-Unit Operator · 9 portfolio companies · Toronto, ON',
    headline: 'Live MRR and seat visibility across nine operating subsidiaries.',
    body: 'Using the Platform Admin console, our finance team provisions new business workspaces in under two minutes and audits subscription tiers, active seats, and workspace status from a single exportable ledger.',
    author: 'Priya Subramanian',
    role: 'VP of Finance, Alderfield Holdings',
  },
] as const;

export function ProofSection() {
  return (
    <section id="customers" className="border-b border-slate-200/80 bg-[#FAFAFC] py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-indigo-600">Operational Proof</p>
          <h2 className="font-display mt-3 text-3xl font-bold tracking-tight text-slate-950 text-balance sm:text-4xl">
            Measured results from teams running daily operations on Caibos.
          </h2>
        </div>

        {/* Full-width quantified metrics strip */}
        <div className="mt-12 grid grid-cols-1 gap-6 border-y border-slate-200 py-8 sm:grid-cols-2 lg:grid-cols-4">
          {OUTCOME_METRICS.map(metric => (
            <div key={metric.label}>
              <p className="font-mono text-3xl font-semibold tracking-tight text-slate-950 tabular-nums">
                {metric.value}
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-900">{metric.label}</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">{metric.context}</p>
            </div>
          ))}
        </div>

        {/* Attributable customer case studies */}
        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {CASE_STUDIES.map(study => (
            <article
              key={study.company}
              className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-7"
            >
              <div>
                <p className="text-xs font-medium text-slate-500">{study.sector}</p>
                <h3 className="font-display mt-3 text-lg font-semibold leading-snug text-slate-950">
                  {study.headline}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{study.body}</p>
              </div>

              <div className="mt-6 border-t border-slate-100 pt-4">
                <p className="text-sm font-semibold text-slate-950">{study.author}</p>
                <p className="text-xs text-slate-500">{study.role}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
