import React, { Suspense } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';

export const instant = false;

export default function DashboardLayout({ children }: LayoutProps<'/dashboard'>) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        </div>
      }
    >
      <DashboardShell>{children}</DashboardShell>
    </Suspense>
  );
}
