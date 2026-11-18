import type { Invoice, Payment, Expense, Contact, Deal, Activity, Business, User } from '@/types';

export const mockBusiness: Business = {
  id: 'biz-001',
  name: 'Acme Corp',
  industry: 'Technology',
  plan: 'pro',
  ownerId: 'user-001',
  createdAt: '2024-01-15',
};

export const mockUsers: User[] = [
  { id: 'user-001', name: 'John Doe', email: 'john@acme.com', role: 'owner', businessId: 'biz-001' },
  { id: 'user-002', name: 'Sarah Admin', email: 'sarah@acme.com', role: 'admin', businessId: 'biz-001' },
  { id: 'user-003', name: 'Caibos Support', email: 'support@caibos.io', role: 'caibos' },
];

export const mockInvoices: Invoice[] = [
  {
    id: 'inv-001', number: 'INV-2024-001', clientName: 'TechStart Ltd', clientEmail: 'billing@techstart.io',
    amount: 4500, tax: 450, total: 4950, status: 'paid', dueDate: '2024-02-15', issuedDate: '2024-01-15',
    items: [{ description: 'Web Development', quantity: 1, unitPrice: 4500, total: 4500 }], businessId: 'biz-001',
  },
  {
    id: 'inv-002', number: 'INV-2024-002', clientName: 'Green Solutions', clientEmail: 'finance@green.co',
    amount: 2800, tax: 280, total: 3080, status: 'sent', dueDate: '2024-03-01', issuedDate: '2024-02-01',
    items: [{ description: 'Consulting Services', quantity: 14, unitPrice: 200, total: 2800 }], businessId: 'biz-001',
  },
  {
    id: 'inv-003', number: 'INV-2024-003', clientName: 'BlueSky Agency', clientEmail: 'ap@bluesky.com',
    amount: 7200, tax: 720, total: 7920, status: 'overdue', dueDate: '2024-02-10', issuedDate: '2024-01-10',
    items: [{ description: 'Brand Strategy', quantity: 1, unitPrice: 7200, total: 7200 }], businessId: 'biz-001',
  },
  {
    id: 'inv-004', number: 'INV-2024-004', clientName: 'Nova Retail', clientEmail: 'accounts@nova.retail',
    amount: 1200, tax: 120, total: 1320, status: 'draft', dueDate: '2024-04-01', issuedDate: '2024-03-01',
    items: [{ description: 'SEO Package', quantity: 1, unitPrice: 1200, total: 1200 }], businessId: 'biz-001',
  },
  {
    id: 'inv-005', number: 'INV-2024-005', clientName: 'Coral Media', clientEmail: 'finance@coral.media',
    amount: 3600, tax: 360, total: 3960, status: 'paid', dueDate: '2024-02-28', issuedDate: '2024-01-28',
    items: [{ description: 'Social Media Management', quantity: 3, unitPrice: 1200, total: 3600 }], businessId: 'biz-001',
  },
  {
    id: 'inv-006', number: 'INV-2024-006', clientName: 'Peak Analytics', clientEmail: 'billing@peak.ai',
    amount: 5500, tax: 550, total: 6050, status: 'sent', dueDate: '2024-03-20', issuedDate: '2024-02-20',
    items: [{ description: 'Data Analysis Report', quantity: 1, unitPrice: 5500, total: 5500 }], businessId: 'biz-001',
  },
];

export const mockPayments: Payment[] = [
  { id: 'pay-001', description: 'Payment from TechStart Ltd', amount: 4950, method: 'bank_transfer', date: '2024-02-20', type: 'incoming', reference: 'TXN-9821', businessId: 'biz-001' },
  { id: 'pay-002', description: 'Office Rent - February', amount: 2200, method: 'bank_transfer', date: '2024-02-01', type: 'outgoing', reference: 'RENT-FEB24', businessId: 'biz-001' },
  { id: 'pay-003', description: 'Payment from Coral Media', amount: 3960, method: 'card', date: '2024-02-25', type: 'incoming', reference: 'TXN-9845', businessId: 'biz-001' },
  { id: 'pay-004', description: 'Software Subscriptions', amount: 450, method: 'card', date: '2024-02-15', type: 'outgoing', businessId: 'biz-001' },
  { id: 'pay-005', description: 'Freelancer Payment - Design', amount: 800, method: 'mobile_money', date: '2024-02-18', type: 'outgoing', businessId: 'biz-001' },
];

export const mockExpenses: Expense[] = [
  { id: 'exp-001', description: 'Office Rent', category: 'Rent', amount: 2200, date: '2024-02-01', vendor: 'City Properties', businessId: 'biz-001' },
  { id: 'exp-002', description: 'AWS Cloud Services', category: 'Software', amount: 320, date: '2024-02-05', vendor: 'Amazon Web Services', businessId: 'biz-001' },
  { id: 'exp-003', description: 'Team Lunch', category: 'Meals', amount: 180, date: '2024-02-10', vendor: 'The Bistro', businessId: 'biz-001' },
  { id: 'exp-004', description: 'Marketing Campaign', category: 'Marketing', amount: 1500, date: '2024-02-12', vendor: 'AdsPro', businessId: 'biz-001' },
  { id: 'exp-005', description: 'Office Supplies', category: 'Supplies', amount: 95, date: '2024-02-14', vendor: 'Staples', businessId: 'biz-001' },
  { id: 'exp-006', description: 'Internet & Phone', category: 'Utilities', amount: 220, date: '2024-02-16', vendor: 'TelecomCo', businessId: 'biz-001' },
];

export const mockContacts: Contact[] = [
  { id: 'con-001', name: 'Alice Johnson', email: 'alice@techstart.io', phone: '+1 555-0101', company: 'TechStart Ltd', type: 'client', tags: ['enterprise', 'active'], createdAt: '2024-01-10', businessId: 'biz-001' },
  { id: 'con-002', name: 'Bob Martinez', email: 'bob@green.co', phone: '+1 555-0102', company: 'Green Solutions', type: 'lead', tags: ['warm'], createdAt: '2024-01-20', businessId: 'biz-001' },
  { id: 'con-003', name: 'Carol White', email: 'carol@bluesky.com', phone: '+1 555-0103', company: 'BlueSky Agency', type: 'client', tags: ['enterprise'], createdAt: '2024-01-05', businessId: 'biz-001' },
  { id: 'con-004', name: 'David Lee', email: 'david@nova.retail', phone: '+1 555-0104', company: 'Nova Retail', type: 'lead', tags: ['cold'], createdAt: '2024-02-01', businessId: 'biz-001' },
  { id: 'con-005', name: 'Eva Chen', email: 'eva@coral.media', phone: '+1 555-0105', company: 'Coral Media', type: 'client', tags: ['active', 'retainer'], createdAt: '2023-12-15', businessId: 'biz-001' },
  { id: 'con-006', name: 'Frank Brown', email: 'frank@peak.ai', phone: '+1 555-0106', company: 'Peak Analytics', type: 'lead', tags: ['hot', 'enterprise'], createdAt: '2024-02-10', businessId: 'biz-001' },
];

export const mockDeals: Deal[] = [
  { id: 'deal-001', title: 'TechStart Platform Rebuild', contactId: 'con-001', contactName: 'Alice Johnson', value: 25000, stage: 'proposal', probability: 70, expectedCloseDate: '2024-04-15', createdAt: '2024-01-15', businessId: 'biz-001' },
  { id: 'deal-002', title: 'Green Solutions Consulting', contactId: 'con-002', contactName: 'Bob Martinez', value: 8000, stage: 'qualified', probability: 50, expectedCloseDate: '2024-03-30', createdAt: '2024-01-25', businessId: 'biz-001' },
  { id: 'deal-003', title: 'BlueSky Rebrand Project', contactId: 'con-003', contactName: 'Carol White', value: 15000, stage: 'negotiation', probability: 85, expectedCloseDate: '2024-03-10', createdAt: '2024-01-08', businessId: 'biz-001' },
  { id: 'deal-004', title: 'Nova Retail SEO Campaign', contactId: 'con-004', contactName: 'David Lee', value: 4800, stage: 'lead', probability: 20, expectedCloseDate: '2024-05-01', createdAt: '2024-02-05', businessId: 'biz-001' },
  { id: 'deal-005', title: 'Coral Media Annual Package', contactId: 'con-005', contactName: 'Eva Chen', value: 18000, stage: 'won', probability: 100, expectedCloseDate: '2024-02-20', createdAt: '2023-12-20', businessId: 'biz-001' },
  { id: 'deal-006', title: 'Peak Analytics Dashboard', contactId: 'con-006', contactName: 'Frank Brown', value: 32000, stage: 'proposal', probability: 60, expectedCloseDate: '2024-04-30', createdAt: '2024-02-12', businessId: 'biz-001' },
];

export const mockActivities: Activity[] = [
  { id: 'act-001', type: 'call', title: 'Follow-up call with Alice', contactId: 'con-001', contactName: 'Alice Johnson', dealId: 'deal-001', dueDate: '2024-03-05', completed: false, businessId: 'biz-001' },
  { id: 'act-002', type: 'email', title: 'Send proposal to Frank', contactId: 'con-006', contactName: 'Frank Brown', dealId: 'deal-006', dueDate: '2024-03-04', completed: false, businessId: 'biz-001' },
  { id: 'act-003', type: 'meeting', title: 'BlueSky contract review', contactId: 'con-003', contactName: 'Carol White', dealId: 'deal-003', dueDate: '2024-03-06', completed: false, businessId: 'biz-001' },
  { id: 'act-004', type: 'task', title: 'Prepare invoice for Coral Media', contactId: 'con-005', contactName: 'Eva Chen', dueDate: '2024-03-03', completed: true, businessId: 'biz-001' },
  { id: 'act-005', type: 'note', title: 'Bob interested in extended contract', contactId: 'con-002', contactName: 'Bob Martinez', dueDate: '2024-03-07', completed: false, businessId: 'biz-001' },
];

// Chart data
export const revenueChartData = [
  { month: 'Aug', revenue: 12400, expenses: 7800 },
  { month: 'Sep', revenue: 15200, expenses: 9100 },
  { month: 'Oct', revenue: 11800, expenses: 8400 },
  { month: 'Nov', revenue: 18600, expenses: 10200 },
  { month: 'Dec', revenue: 22000, expenses: 11500 },
  { month: 'Jan', revenue: 19500, expenses: 9800 },
  { month: 'Feb', revenue: 24300, expenses: 12100 },
];

export const expenseByCategory = [
  { category: 'Rent', amount: 2200 },
  { category: 'Software', amount: 320 },
  { category: 'Marketing', amount: 1500 },
  { category: 'Meals', amount: 180 },
  { category: 'Supplies', amount: 95 },
  { category: 'Utilities', amount: 220 },
];
