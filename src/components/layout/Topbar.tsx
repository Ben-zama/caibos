'use client';

import React from 'react';
import { useAuth } from '@/lib/auth-context';
import { appConfig } from '@/config/app.config';
import { Bell, Menu, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface TopbarProps {
  onMenuClick: () => void;
  title?: string;
}

export function Topbar({ onMenuClick, title }: TopbarProps) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const roleBadgeColor: Record<string, string> = {
    owner: 'bg-indigo-100 text-indigo-700',
    admin: 'bg-amber-100 text-amber-700',
    caibos: 'bg-purple-100 text-purple-700',
  };

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 dark:border-gray-800 dark:bg-gray-900 lg:px-6">
      <div className="flex items-center gap-4">
        <button
          type="button"
          aria-label="Open navigation menu"
          onClick={onMenuClick}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        {title && (
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h1>
        )}
      </div>

      <div className="flex items-center gap-3">
        {user?.role && (
          <span className={`hidden sm:inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${roleBadgeColor[user.role]}`}>
            {user.role === 'caibos' ? `${appConfig.brand.name} Admin` : user.role === 'owner' ? 'Business Owner' : 'Admin'}
          </span>
        )}
        <button
          type="button"
          aria-label="Notifications"
          className="relative rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
        </button>
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          title="Sign out"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Sign out</span>
        </button>
      </div>
    </header>
  );
}
