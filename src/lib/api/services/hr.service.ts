import { isApiMode } from '@/config/app.config';
import { apiClient } from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import {
  mockAttendance,
  mockEmployees,
  mockLeaveRequests,
  mockPayroll,
} from '@/lib/hr-mock-data';
import type { AttendanceRecord, Employee, LeaveRequest, PayrollRun } from '@/types';

export const hrService = {
  async getEmployees(): Promise<Employee[]> {
    if (isApiMode()) {
      return apiClient.get<Employee[]>(ENDPOINTS.HR.EMPLOYEES);
    }
    return mockEmployees;
  },

  async getLeaveRequests(): Promise<LeaveRequest[]> {
    if (isApiMode()) {
      return apiClient.get<LeaveRequest[]>(ENDPOINTS.HR.LEAVE_REQUESTS);
    }
    return mockLeaveRequests;
  },

  async approveLeave(id: string): Promise<LeaveRequest | null> {
    if (isApiMode()) {
      return apiClient.post<LeaveRequest>(ENDPOINTS.HR.APPROVE_LEAVE(id));
    }
    const found = mockLeaveRequests.find(r => r.id === id);
    return found ? { ...found, status: 'approved' } : null;
  },

  async rejectLeave(id: string): Promise<LeaveRequest | null> {
    if (isApiMode()) {
      return apiClient.post<LeaveRequest>(ENDPOINTS.HR.REJECT_LEAVE(id));
    }
    const found = mockLeaveRequests.find(r => r.id === id);
    return found ? { ...found, status: 'rejected' } : null;
  },

  async getAttendance(): Promise<AttendanceRecord[]> {
    if (isApiMode()) {
      return apiClient.get<AttendanceRecord[]>(ENDPOINTS.HR.ATTENDANCE);
    }
    return mockAttendance;
  },

  async getPayroll(): Promise<PayrollRun[]> {
    if (isApiMode()) {
      return apiClient.get<PayrollRun[]>(ENDPOINTS.HR.PAYROLL);
    }
    return mockPayroll;
  },

  async approvePayroll(id: string): Promise<PayrollRun | null> {
    if (isApiMode()) {
      return apiClient.post<PayrollRun>(ENDPOINTS.HR.APPROVE_PAYROLL(id));
    }
    const found = mockPayroll.find(p => p.id === id);
    return found ? { ...found, status: 'approved' } : null;
  },
};
