'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
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
  Menu,
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
    roles: ['owner'],
  },
  {
    label: 'All Businesses',
    href: '/dashboard/businesses',
    icon: Building2,
    roles: ['caibos'],
  },
];

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const { user } = useAuth();
  const pathname = usePathname();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    Finance: false,
    CRM: false,
    Inventory: true,
    'HR & Payroll': false,
  });

  useEffect(() => {
    if (pathname.startsWith('/dashboard/finance')) setOpenGroups(p => ({ ...p, Finance: true }));
    if (pathname.startsWith('/dashboard/crm')) setOpenGroups(p => ({ ...p, CRM: true }));
    if (pathname.startsWith('/dashboard/inventory')) setOpenGroups(p => ({ ...p, Inventory: true }));
    if (pathname.startsWith('/dashboard/hr')) setOpenGroups(p => ({ ...p, 'HR & Payroll': true }));
  }, [pathname]);

  const toggleGroup = (label: string) => {
    setOpenGroups(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  const filteredNav = navItems.filter(item => {
    if (!item.roles) return true;
    return user?.role && item.roles.includes(user.role);
  });

  const SidebarContent = () => (
    <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
      {filteredNav.map(item => {
        if (item.children) {
          const isOpen = openGroups[item.label];
          return (
            <div key={item.label}>
              <button
                onClick={() => toggleGroup(item.label)}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span className="flex-1 text-left">{item.label}</span>
                {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
              {isOpen && (
                <div className="ml-4 mt-1 flex flex-col gap-0.5 border-l border-gray-200 pl-3">
                  {item.children.map(child => (
                    <Link
                      key={child.href}
                      href={child.href!}
                      onClick={onClose}
                      className={clsx(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                        isActive(child.href!)
                          ? 'bg-indigo-50 font-medium text-indigo-700'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
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
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              isActive(item.href!)
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            )}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-60 lg:flex-col lg:border-r lg:border-gray-200 lg:bg-white lg:dark:border-gray-800 lg:dark:bg-gray-900">
        <div className="flex h-16 items-center gap-2 border-b border-gray-200 px-5 dark:border-gray-800">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
            <span className="text-sm font-bold text-white">C</span>
          </div>
          <span className="text-lg font-bold text-gray-900 dark:text-white">Caibos</span>
        </div>
        <SidebarContent />
        <div className="border-t border-gray-200 p-4 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-sm font-semibold">
              {user?.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{user?.name}</p>
              <p className="truncate text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/40" onClick={onClose} />
          <aside className="fixed left-0 top-0 bottom-0 w-72 flex flex-col bg-white dark:bg-gray-900 shadow-xl">
            <div className="flex h-16 items-center justify-between border-b border-gray-200 px-5 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
                  <span className="text-sm font-bold text-white">C</span>
                </div>
                <span className="text-lg font-bold text-gray-900 dark:text-white">Caibos</span>
              </div>
              <button onClick={onClose} className="p-1 rounded text-gray-500 hover:bg-gray-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <SidebarContent />
            <div className="border-t border-gray-200 p-4 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-sm font-semibold">
                  {user?.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{user?.name}</p>
                  <p className="truncate text-xs text-gray-500 capitalize">{user?.role}</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
