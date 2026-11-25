'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import {
  validateDemoRequest,
  type DemoRequestInput,
} from '@/lib/landing-utils';

const WALKTHROUGH_STEPS = [
  {
    index: '01',
    title: 'Live 4-module operational tour',
    description:
      'Walk through Finance, CRM, Inventory, and HR & Payroll using realistic cross-module workflows matched to your team.',
  },
  {
    index: '02',
    title: 'Multi-tenant admin & role permissions',
    description:
      'Review how Platform Admins provision workspaces and enforce Business Admin, Manager, and Employee access boundaries.',
  },
  {
    index: '03',
    title: 'REST API & backend integration handoff',
    description:
      'Inspect the typed API client, environment switches, and endpoint map so your engineers can connect production data fast.',
  },
] as const;

const TEAM_SIZES = ['1–10 seats', '11–25 seats', '26–100 seats', '100+ seats'] as const;
const PRIMARY_FOCUSES = [
  'Full Operations Suite',
  'Finance & Invoicing',
  'CRM & Sales Pipeline',
  'Inventory & Purchasing',
  'HR & Payroll',
  'Multi-Tenant Platform Admin',
] as const;

const INITIAL_FORM: DemoRequestInput = {
  fullName: '',
  workEmail: '',
  companyName: '',
  teamSize: TEAM_SIZES[1],
  primaryFocus: PRIMARY_FOCUSES[0],
};

export function DemoRequestSection() {
  const [form, setForm] = useState<DemoRequestInput>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof DemoRequestInput, string>>>({});
  const [submittedRequest, setSubmittedRequest] = useState<DemoRequestInput | null>(null);

  const handleFieldChange = (field: keyof DemoRequestInput, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validation = validateDemoRequest(form);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    setSubmittedRequest({
      ...form,
      fullName: form.fullName.trim(),
      workEmail: form.workEmail.trim(),
      companyName: form.companyName.trim(),
    });
  };

  const handleReset = () => {
    setForm(INITIAL_FORM);
    setErrors({});
    setSubmittedRequest(null);
  };

  return (
    <section id="demo" className="bg-[#FAFAFC] py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-start">
          {/* Left column: Walkthrough Agenda */}
          <div className="lg:col-span-5">
            <p className="text-sm font-medium text-indigo-600">Product Walkthrough</p>
            <h2 className="font-display mt-3 text-3xl font-bold tracking-tight text-slate-950 text-balance sm:text-4xl">
              See Caibos configured for your team in 20 minutes.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-600">
              Schedule a focused session with an implementation specialist, or jump straight into the live sandbox workspace right now.
            </p>

            <ol className="mt-8 space-y-6 border-t border-slate-200 pt-8">
              {WALKTHROUGH_STEPS.map(step => (
                <li key={step.index} className="flex gap-4">
                  <span className="font-mono text-xs font-semibold text-indigo-600 pt-1 tabular-nums">
                    {step.index}
                  </span>
                  <div>
                    <h3 className="font-display text-sm font-semibold text-slate-950">
                      {step.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">
                      {step.description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* Right column: Validated Lead-Capture Form */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-slate-200/90 bg-white p-7 sm:p-9">
              {submittedRequest ? (
                <div data-demo-confirmation className="py-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <h3 className="font-display mt-5 text-2xl font-bold tracking-tight text-slate-950">
                    Walkthrough request received.
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">
                    Thanks, <span className="font-semibold text-slate-950">{submittedRequest.fullName}</span>. We&apos;ve logged a tailored session for{' '}
                    <span className="font-semibold text-slate-950">{submittedRequest.companyName}</span> ({submittedRequest.teamSize}) focused on{' '}
                    <span className="font-semibold text-slate-950">{submittedRequest.primaryFocus}</span> and sent calendar slots to{' '}
                    <span className="font-mono text-slate-900">{submittedRequest.workEmail}</span>.
                  </p>

                  <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-slate-100 pt-6">
                    <Link
                      href="/login"
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
                    >
                      <span>Launch Live Workspace</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={handleReset}
                      className="text-sm font-medium text-slate-600 underline-offset-4 hover:text-slate-950 hover:underline"
                    >
                      Submit another request
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="space-y-5">
                  <div>
                    <h3 className="font-display text-lg font-semibold text-slate-950">
                      Request a guided demo or rollout plan
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      We reply within one business day with a dedicated environment link.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="demo-full-name"
                        className="block text-sm font-medium text-slate-800"
                      >
                        Full Name
                      </label>
                      <input
                        id="demo-full-name"
                        name="fullName"
                        type="text"
                        autoComplete="name"
                        placeholder="Claire Bennett"
                        value={form.fullName}
                        onChange={e => handleFieldChange('fullName', e.target.value)}
                        aria-invalid={Boolean(errors.fullName)}
                        aria-describedby={errors.fullName ? 'demo-full-name-error' : undefined}
                        className={`mt-1.5 block w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-950 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                          errors.fullName
                            ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100'
                            : 'border-slate-300 focus:border-indigo-600 focus:ring-indigo-100'
                        }`}
                      />
                      {errors.fullName && (
                        <p id="demo-full-name-error" role="alert" className="mt-1.5 text-xs text-rose-600">
                          {errors.fullName}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="demo-work-email"
                        className="block text-sm font-medium text-slate-800"
                      >
                        Work Email
                      </label>
                      <input
                        id="demo-work-email"
                        name="workEmail"
                        type="email"
                        autoComplete="email"
                        placeholder="claire@northwind.co"
                        value={form.workEmail}
                        onChange={e => handleFieldChange('workEmail', e.target.value)}
                        aria-invalid={Boolean(errors.workEmail)}
                        aria-describedby={errors.workEmail ? 'demo-work-email-error' : undefined}
                        className={`mt-1.5 block w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-950 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                          errors.workEmail
                            ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100'
                            : 'border-slate-300 focus:border-indigo-600 focus:ring-indigo-100'
                        }`}
                      />
                      {errors.workEmail && (
                        <p id="demo-work-email-error" role="alert" className="mt-1.5 text-xs text-rose-600">
                          {errors.workEmail}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="demo-company-name"
                      className="block text-sm font-medium text-slate-800"
                    >
                      Company Name
                    </label>
                    <input
                      id="demo-company-name"
                      name="companyName"
                      type="text"
                      autoComplete="organization"
                      placeholder="Northwind Craft"
                      value={form.companyName}
                      onChange={e => handleFieldChange('companyName', e.target.value)}
                      aria-invalid={Boolean(errors.companyName)}
                      aria-describedby={errors.companyName ? 'demo-company-name-error' : undefined}
                      className={`mt-1.5 block w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-950 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                        errors.companyName
                          ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100'
                          : 'border-slate-300 focus:border-indigo-600 focus:ring-indigo-100'
                      }`}
                    />
                    {errors.companyName && (
                      <p id="demo-company-name-error" role="alert" className="mt-1.5 text-xs text-rose-600">
                        {errors.companyName}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="demo-team-size"
                        className="block text-sm font-medium text-slate-800"
                      >
                        Team Size
                      </label>
                      <select
                        id="demo-team-size"
                        name="teamSize"
                        value={form.teamSize}
                        onChange={e => handleFieldChange('teamSize', e.target.value)}
                        className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-950 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                      >
                        {TEAM_SIZES.map(size => (
                          <option key={size} value={size}>
                            {size}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="demo-primary-focus"
                        className="block text-sm font-medium text-slate-800"
                      >
                        Primary Focus
                      </label>
                      <select
                        id="demo-primary-focus"
                        name="primaryFocus"
                        value={form.primaryFocus}
                        onChange={e => handleFieldChange('primaryFocus', e.target.value)}
                        className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-950 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                      >
                        {PRIMARY_FOCUSES.map(focus => (
                          <option key={focus} value={focus}>
                            {focus}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                      <span>Schedule Product Walkthrough</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                    <p className="text-xs text-slate-500">
                      No credit card required · Direct workspace access
                    </p>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
