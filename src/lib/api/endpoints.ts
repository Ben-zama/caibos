/**
 * Central REST API endpoint registry.
 *
 * Backend developers: update any path here to match your API routing
 * convention without modifying UI components or hooks.
 */
export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    REFRESH: '/auth/refresh',
  },
  BUSINESSES: {
    LIST: '/admin/businesses',
    CREATE: '/admin/businesses',
    BY_ID: (id: string) => `/admin/businesses/${encodeURIComponent(id)}`,
    UPDATE_PLAN: (id: string) => `/admin/businesses/${encodeURIComponent(id)}/plan`,
    UPDATE_STATUS: (id: string) => `/admin/businesses/${encodeURIComponent(id)}/status`,
    METRICS: '/admin/businesses/metrics',
  },
  FINANCE: {
    INVOICES: '/finance/invoices',
    INVOICE_BY_ID: (id: string) => `/finance/invoices/${encodeURIComponent(id)}`,
    PAYMENTS: '/finance/payments',
    EXPENSES: '/finance/expenses',
    REVENUE_CHART: '/finance/reports/revenue-series',
    EXPENSE_BREAKDOWN: '/finance/reports/expense-breakdown',
  },
  CRM: {
    CONTACTS: '/crm/contacts',
    CONTACT_BY_ID: (id: string) => `/crm/contacts/${encodeURIComponent(id)}`,
    DEALS: '/crm/deals',
    DEAL_BY_ID: (id: string) => `/crm/deals/${encodeURIComponent(id)}`,
    ACTIVITIES: '/crm/activities',
    ACTIVITY_BY_ID: (id: string) => `/crm/activities/${encodeURIComponent(id)}`,
    TOGGLE_ACTIVITY: (id: string) => `/crm/activities/${encodeURIComponent(id)}/toggle`,
  },
  HR: {
    EMPLOYEES: '/hr/employees',
    EMPLOYEE_BY_ID: (id: string) => `/hr/employees/${encodeURIComponent(id)}`,
    LEAVE_REQUESTS: '/hr/leave-requests',
    APPROVE_LEAVE: (id: string) => `/hr/leave-requests/${encodeURIComponent(id)}/approve`,
    REJECT_LEAVE: (id: string) => `/hr/leave-requests/${encodeURIComponent(id)}/reject`,
    ATTENDANCE: '/hr/attendance',
    PAYROLL: '/hr/payroll',
    APPROVE_PAYROLL: (id: string) => `/hr/payroll/${encodeURIComponent(id)}/approve`,
  },
  INVENTORY: {
    PRODUCTS: '/inventory/products',
    PRODUCT_BY_ID: (id: string) => `/inventory/products/${encodeURIComponent(id)}`,
    MOVEMENTS: '/inventory/movements',
    ADJUSTMENTS: '/inventory/adjustments',
    SUPPLIERS: '/inventory/suppliers',
    SUPPLIER_BY_ID: (id: string) => `/inventory/suppliers/${encodeURIComponent(id)}`,
    PURCHASE_ORDERS: '/inventory/purchase-orders',
    PURCHASE_ORDER_STATUS: (id: string) =>
      `/inventory/purchase-orders/${encodeURIComponent(id)}/status`,
  },
  SETTINGS: {
    BUSINESS_PROFILE: '/settings/business',
    TEAM: '/settings/team',
    TEAM_MEMBER: (id: string) => `/settings/team/${encodeURIComponent(id)}`,
    SUBSCRIPTION: '/settings/subscription',
    NOTIFICATIONS: '/settings/notifications',
  },
} as const;
