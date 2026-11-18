export type Role = 'owner' | 'admin' | 'caibos';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  businessId?: string;
  avatar?: string;
}

export interface Business {
  id: string;
  name: string;
  industry: string;
  plan: 'free' | 'pro' | 'enterprise';
  ownerId: string;
  createdAt: string;
}

// Finance types
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
export type PaymentMethod = 'bank_transfer' | 'card' | 'cash' | 'mobile_money';

export interface Invoice {
  id: string;
  number: string;
  clientName: string;
  clientEmail: string;
  amount: number;
  tax: number;
  total: number;
  status: InvoiceStatus;
  dueDate: string;
  issuedDate: string;
  items: InvoiceItem[];
  businessId: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Payment {
  id: string;
  description: string;
  amount: number;
  method: PaymentMethod;
  date: string;
  type: 'incoming' | 'outgoing';
  reference?: string;
  businessId: string;
}

export interface Expense {
  id: string;
  description: string;
  category: string;
  amount: number;
  date: string;
  vendor?: string;
  businessId: string;
}

// CRM types
export type DealStage = 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost';
export type ContactType = 'client' | 'lead' | 'vendor';

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  type: ContactType;
  tags: string[];
  createdAt: string;
  businessId: string;
}

export interface Deal {
  id: string;
  title: string;
  contactId: string;
  contactName: string;
  value: number;
  stage: DealStage;
  probability: number;
  expectedCloseDate: string;
  createdAt: string;
  businessId: string;
}

export type ActivityType = 'call' | 'email' | 'meeting' | 'task' | 'note';

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description?: string;
  contactId?: string;
  contactName?: string;
  dealId?: string;
  dueDate: string;
  completed: boolean;
  businessId: string;
}

// HR types
export type EmploymentStatus = 'active' | 'on_leave' | 'terminated';
export type LeaveStatus = 'pending' | 'approved' | 'rejected';
export type LeaveType = 'annual' | 'sick' | 'unpaid' | 'maternity' | 'paternity';
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'half_day';

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  jobTitle: string;
  employmentStatus: EmploymentStatus;
  startDate: string;
  salary: number;
  avatar?: string;
  businessId: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  type: LeaveType;
  status: LeaveStatus;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  businessId: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  clockIn?: string;
  clockOut?: string;
  status: AttendanceStatus;
  businessId: string;
}

export interface PayrollRun {
  id: string;
  period: string;
  employeeId: string;
  employeeName: string;
  basicSalary: number;
  deductions: number;
  netPay: number;
  status: 'draft' | 'approved' | 'paid';
  businessId: string;
}

// Inventory types
export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';
export type StockMovementType = 'in' | 'out' | 'adjustment';

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  sellingPrice: number;
  costPrice: number;
  stock: number;
  reorderLevel: number;
  unit: string;
  status: StockStatus;
  businessId: string;
  supplierId?: string;
  supplierName?: string;
  description?: string;
  barcode?: string;
  location?: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: StockMovementType;
  quantity: number;
  date: string;
  reference?: string;
  note?: string;
  businessId: string;
  unitCost?: number;
  balanceAfter?: number;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address?: string;
  leadTimeDays: number;
  categories: string[];
  status: 'active' | 'inactive';
  rating?: number;
  businessId: string;
}

export type PurchaseOrderStatus = 'draft' | 'ordered' | 'received' | 'cancelled';

export interface PurchaseOrderItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitCost: number;
  total: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  orderDate: string;
  expectedDate: string;
  status: PurchaseOrderStatus;
  items: PurchaseOrderItem[];
  totalAmount: number;
  notes?: string;
  businessId: string;
}
