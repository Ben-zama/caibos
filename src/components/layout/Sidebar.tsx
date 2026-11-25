'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { appConfig } from '@/config/app.config';
import { clsx } from '@/lib/clsx';
import {
  LayoutDashboard,
  DollarSign,
  FileText,
  CreditCard,
  TrendingUp,
  Receipt,
  Users,
  Briefcase,
  Calendar,
  Settings,
  Building2,
  ChevronDown,
  ChevronRight,
  X,
  UserCog,
  ClipboardList,
  Clock4,
  Banknote,
  Package,
  ArrowLeftRight,
  RefreshCw,
  Truck,
  ShoppingCart,
} from 'lucide-react';

interface NavItem {
  label: string;
  href?: string;
  icon: React.ElementType;
  children?: NavItem[];
  roles?: ('owner' | 'admin' | 'caibos')[];
  featureKey?: keyof typeof appConfig.features;
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Finance',
    icon: DollarSign,
    featureKey: 'finance',
    children: [
      { label: 'Overview', href: '/dashboard/finance', icon: TrendingUp },
      { label: 'Invoices', href: '/dashboard/finance/invoices', icon: FileText },
      { label: 'Payments', href: '/dashboard/finance/payments', icon: CreditCard },
      { label: 'Expenses', href: '/dashboard/finance/expenses', icon: Receipt },
      { label: 'Reports', href: '/dashboard/finance/reports', icon: TrendingUp },
    ],
  },
  {
    label: 'CRM',
    icon: Users,
    featureKey: 'crm',
    children: [
      { label: 'Overview', href: '/dashboard/crm', icon: LayoutDashboard },
      { label: 'Contacts', href: '/dashboard/crm/contacts', icon: Users },
      { label: 'Deals', href: '/dashboard/crm/deals', icon: Briefcase },
      { label: 'Activities', href: '/dashboard/crm/activities', icon: Calendar },
    ],
  },
  {
    label: 'Inventory',
    icon: Package,
    featureKey: 'inventory',
    children: [
      { label: 'Overview', href: '/dashboard/inventory', icon: LayoutDashboard },
      { label: 'Products', href: '/dashboard/inventory/products', icon: Package },
      { label: 'Stock Movements', href: '/dashboard/inventory/movements', icon: ArrowLeftRight },
      { label: 'Adjustments', href: '/dashboard/inventory/adjustments', icon: RefreshCw },
      { label: 'Purchase Orders', href: '/dashboard/inventory/purchase-orders', icon: ShoppingCart },
      { label: 'Suppliers', href: '/dashboard/inventory/suppliers', icon: Truck },
    ],
  },
  {
    label: 'HR & Payroll',
    icon: UserCog,
    featureKey: 'hr',
    roles: ['owner', 'admin'],
    children: [
      { label: 'Overview', href: '/dashboard/hr', icon: LayoutDashboard },
      { label: 'Employees', href: '/dashboard/hr/employees', icon: Users },
      { label: 'Leave', href: '/dashboard/hr/leave', icon: ClipboardList },
      { label: 'Attendance', href: '/dashboard/hr/attendance', icon: Clock4 },
      { label: 'Payroll', href: '/dashboard/hr/payroll', icon: Banknote },
    ],
  },
  {
    label: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
    featureKey: 'settings',
    roles: ['owner'],
  },
  {
    label: 'All Businesses',
    href: '/dashboard/businesses',
    icon: Building2,
    featureKey: 'businesses',
    roles: ['caibos'],
  },
];

function getActiveGroupForPath(pathname: string): string | null {
  if (pathname.startsWith('/dashboard/finance')) return 'Finance';
  if (pathname.startsWith('/dashboard/crm')) return 'CRM';
  if (pathname.startsWith('/dashboard/inventory')) return 'Inventory';
  if (pathname.startsWith('/dashboard/hr')) return 'HR & Payroll';
  return null;
}

interface SidebarNavContentProps {
  filteredNav: NavItem[];
  isGroupOpen: (label: string) => boolean;
  toggleGroup: (label: string) => void;
  isActive: (href: string) => boolean;
  onClose: () => void;
  testId?: string;
}

function SidebarNavContent({
  filteredNav,
  isGroupOpen,
  toggleGroup,
  isActive,
  onClose,
  testId,
}: SidebarNavContentProps) {
  return (
    <nav
      aria-label="Sidebar navigation"
      data-testid={testId}
      className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto overscroll-contain px-3 py-4"
    >
      {filteredNav.map(item => {
        if (item.children) {
          const isOpen = isGroupOpen(item.label);
          return (
            <div key={item.label} className="shrink-0">
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => toggleGroup(item.label)}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span className="flex-1 text-left">{item.label}</span>
                {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
              {isOpen && (
                <div className="ml-4 mt-1 flex flex-col gap-0.5 border-l border-gray-200 pl-3 dark:border-gray-800">
                  {item.children.map(child => (
                    <Link
                      key={child.href}
                      href={child.href!}
                      onClick={onClose}
                      className={clsx(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                        isActive(child.href!)
                          ? 'bg-indigo-50 font-medium text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white'
                      )}
                    >
                      <child.icon className="h-4 w-4 shrink-0" />
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href!}
            onClick={onClose}
            className={clsx(
              'flex shrink-0 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              isActive(item.href!)
                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white'
            )}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const { user } = useAuth();
  const pathname = usePathname();
  const [groupOverrides, setGroupOverrides] = useState<Record<string, boolean>>({
    Inventory: true,
  });

  const activeGroup = getActiveGroupForPath(pathname);

  const isGroupOpen = (label: string) => {
    if (label in groupOverrides) {
      return groupOverrides[label];
    }
    return label === activeGroup;
  };

  const toggleGroup = (label: string) => {
    setGroupOverrides(prev => {
      const current = label in prev ? prev[label] : label === activeGroup;
      return { ...prev, [label]: !current };
    });
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname === href || pathname.startsWith(href + '/');
  };

  const filteredNav = navItems.filter(item => {
    if (item.featureKey && !appConfig.features[item.featureKey]) return false;
    if (!item.roles) return true;
    return user?.role && item.roles.includes(user.role);
  });

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:h-full lg:min-h-0 lg:w-60 lg:shrink-0 lg:flex-col lg:overflow-hidden lg:border-r lg:border-gray-200 lg:bg-white lg:dark:border-gray-800 lg:dark:bg-gray-900">
        <div className="flex h-16 shrink-0 items-center gap-2 border-b border-gray-200 px-5 dark:border-gray-800">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
            <span className="text-sm font-bold text-white">{appConfig.brand.logoLetter}</span>
          </div>
          <span className="text-lg font-bold text-gray-900 dark:text-white">{appConfig.brand.name}</span>
        </div>
        <SidebarNavContent
          filteredNav={filteredNav}
          isGroupOpen={isGroupOpen}
          toggleGroup={toggleGroup}
          isActive={isActive}
          onClose={onClose}
          testId="desktop-sidebar-nav"
        />
        <div className="shrink-0 border-t border-gray-200 p-4 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
              {user?.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{user?.name}</p>
              <p className="truncate text-xs capitalize text-gray-500">{user?.role}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/40" onClick={onClose} />
          <aside className="fixed bottom-0 left-0 top-0 flex h-full min-h-0 w-72 flex-col overflow-hidden bg-white shadow-xl dark:bg-gray-900">
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 px-5 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
                  <span className="text-sm font-bold text-white">{appConfig.brand.logoLetter}</span>
                </div>
                <span className="text-lg font-bold text-gray-900 dark:text-white">{appConfig.brand.name}</span>
              </div>
              <button
                type="button"
                aria-label="Close navigation menu"
                onClick={onClose}
                className="rounded p-1 text-gray-500 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <SidebarNavContent
              filteredNav={filteredNav}
              isGroupOpen={isGroupOpen}
              toggleGroup={toggleGroup}
              isActive={isActive}
              onClose={onClose}
              testId="mobile-sidebar-nav"
            />
            <div className="shrink-0 border-t border-gray-200 p-4 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
                  {user?.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{user?.name}</p>
                  <p className="truncate text-xs capitalize text-gray-500">{user?.role}</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
