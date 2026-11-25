'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { appConfig } from '@/config/app.config';

const NAV_LINKS = [
  { label: 'Product', href: '#product' },
  { label: 'Modules', href: '#modules' },
  { label: 'Customers', href: '#customers' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Demo', href: '#demo' },
] as const;

export function LandingNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-8 px-6">
        {/* Zone 1: Single-element Brand Wordmark */}
        <Link
          href="/"
          className="font-display text-lg font-bold tracking-tight text-slate-950 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-600"
        >
          {appConfig.brand.name}
        </Link>

        {/* Zone 2: 5 concise single-line text navigation links */}
        <nav aria-label="Primary navigation" className="hidden md:flex items-center gap-7">
          {NAV_LINKS.map(item => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-slate-600 underline-offset-4 transition-colors duration-150 hover:text-slate-950 hover:underline whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-600"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Zone 3: Single primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/login"
            className="hidden sm:inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-indigo-700 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Open Workspace
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen(prev => !prev)}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-700 transition-colors hover:bg-slate-100 md:hidden focus-visible:outline-2 focus-visible:outline-indigo-600"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile navigation panel */}
      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white px-6 py-4 md:hidden">
          <nav aria-label="Mobile navigation" className="flex flex-col gap-3">
            {NAV_LINKS.map(item => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="py-1.5 text-sm font-medium text-slate-700 hover:text-slate-950"
              >
                {item.label}
              </a>
            ))}
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="mt-2 inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Open Workspace
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
