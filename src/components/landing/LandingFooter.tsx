import React from 'react';
import Link from 'next/link';
import { appConfig } from '@/config/app.config';

export function LandingFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
          {/* Brand column */}
          <div className="md:col-span-5">
            <Link
              href="/"
              className="font-display text-lg font-bold tracking-tight text-slate-950"
            >
              {appConfig.brand.name}
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-slate-600">
              {appConfig.brand.tagline}. Built for operators who want one clear source of truth across finance, sales, stock, and people.
            </p>
            <p className="mt-4 text-xs text-slate-500">
              Support:{' '}
              <a
                href={`mailto:${appConfig.brand.supportEmail}`}
                className="font-mono text-slate-700 underline-offset-4 hover:text-indigo-600 hover:underline"
              >
                {appConfig.brand.supportEmail}
              </a>
            </p>
          </div>

          {/* Product links */}
          <div className="md:col-span-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900">
              Product
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-600">
              <li>
                <a href="#product" className="hover:text-slate-950">
                  Overview
                </a>
              </li>
              <li>
                <a href="#modules" className="hover:text-slate-950">
                  Core Modules
                </a>
              </li>
              <li>
                <a href="#customers" className="hover:text-slate-950">
                  Customer Proof
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-slate-950">
                  Pricing
                </a>
              </li>
            </ul>
          </div>

          {/* Workspace links */}
          <div className="md:col-span-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900">
              Workspace
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-600">
              <li>
                <Link href="/login" className="hover:text-slate-950">
                  Sign In to Sandbox
                </Link>
              </li>
              <li>
                <Link href="/dashboard/finance" className="hover:text-slate-950">
                  Finance & Billing
                </Link>
              </li>
              <li>
                <Link href="/dashboard/crm" className="hover:text-slate-950">
                  CRM Pipeline
                </Link>
              </li>
              <li>
                <Link href="/dashboard/inventory" className="hover:text-slate-950">
                  Inventory Control
                </Link>
              </li>
              <li>
                <Link href="/dashboard/hr" className="hover:text-slate-950">
                  HR & Payroll
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="md:col-span-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900">
              Rollout
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-600">
              <li>
                <a href="#demo" className="hover:text-slate-950">
                  Book Walkthrough
                </a>
              </li>
              <li>
                <Link href="/dashboard/businesses" className="hover:text-slate-950">
                  Platform Admin
                </Link>
              </li>
              <li>
                <Link href="/dashboard/settings" className="hover:text-slate-950">
                  Workspace Settings
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-slate-200/80 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; 2026 {appConfig.brand.name}. All rights reserved.</p>
          <p>Finance · CRM · Inventory · HR &amp; Payroll · Multi-Tenant Admin</p>
        </div>
      </div>
    </footer>
  );
}
