'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import type { Role } from '@/types';
import { Building2, Shield, Wrench } from 'lucide-react';

const personas = [
  {
    role: 'owner' as Role,
    label: 'Business Owner',
    description: 'Full access to manage your business, team, finance, and CRM.',
    icon: Building2,
    color: 'indigo',
    email: 'john@acme.com',
  },
  {
    role: 'admin' as Role,
    label: 'Delegated Admin',
    description: 'Read/write access to Finance & CRM. No settings or team management.',
    icon: Shield,
    color: 'amber',
    email: 'sarah@acme.com',
  },
  {
    role: 'caibos' as Role,
    label: 'Caibos Admin',
    description: 'Platform admin. View all businesses, manage subscriptions.',
    icon: Wrench,
    color: 'purple',
    email: 'support@caibos.io',
  },
];

const colorMap = {
  indigo: {
    ring: 'ring-indigo-500',
    bg: 'bg-indigo-50',
    icon: 'text-indigo-600 bg-indigo-100',
    badge: 'bg-indigo-600 text-white',
  },
  amber: {
    ring: 'ring-amber-500',
    bg: 'bg-amber-50',
    icon: 'text-amber-600 bg-amber-100',
    badge: 'bg-amber-500 text-white',
  },
  purple: {
    ring: 'ring-purple-500',
    bg: 'bg-purple-50',
    icon: 'text-purple-600 bg-purple-100',
    badge: 'bg-purple-600 text-white',
  },
};

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [selected, setSelected] = useState<Role | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!selected) return;
    setLoading(true);
    login(selected);
    await new Promise(r => setTimeout(r, 600));
    router.push('/dashboard');
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 shadow-lg">
            <span className="text-xl font-bold text-white">C</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome to Caibos</h1>
          <p className="mt-1 text-sm text-gray-500">Select your persona to continue</p>
        </div>

        {/* Persona cards */}
        <div className="space-y-3">
          {personas.map(p => {
            const colors = colorMap[p.color as keyof typeof colorMap];
            const isSelected = selected === p.role;
            return (
              <button
                key={p.role}
                onClick={() => setSelected(p.role)}
                className={`w-full rounded-xl border-2 p-4 text-left transition-all ${
                  isSelected
                    ? `border-transparent ${colors.ring} ring-2 ${colors.bg}`
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${colors.icon}`}>
                    <p.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">{p.label}</span>
                      {isSelected && (
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${colors.badge}`}>Selected</span>
                      )}
                    </div>
                    <p className="mt-0.5 text-sm text-gray-500">{p.description}</p>
                    <p className="mt-1 text-xs text-gray-400">{p.email}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <button
          onClick={handleLogin}
          disabled={!selected || loading}
          className="mt-6 w-full rounded-xl bg-indigo-600 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? 'Signing in…' : 'Sign In'}
        </button>

        <p className="mt-4 text-center text-xs text-gray-400">
          This is a demo — no real authentication required.
        </p>
      </div>
    </div>
  );
}
