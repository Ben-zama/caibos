import { isApiMode } from '@/config/app.config';
import { apiClient } from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import { mockBusiness, mockUsers } from '@/lib/mock-data';
import type { Business, User } from '@/types';

export interface BusinessProfilePayload {
  name: string;
  industry: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
}

export const settingsService = {
  async getBusinessProfile(): Promise<Business> {
    if (isApiMode()) {
      return apiClient.get<Business>(ENDPOINTS.SETTINGS.BUSINESS_PROFILE);
    }
    return mockBusiness;
  },

  async updateBusinessProfile(payload: BusinessProfilePayload): Promise<Business> {
    if (isApiMode()) {
      return apiClient.patch<Business>(ENDPOINTS.SETTINGS.BUSINESS_PROFILE, payload);
    }
    return { ...mockBusiness, ...payload };
  },

  async getTeamMembers(): Promise<User[]> {
    if (isApiMode()) {
      return apiClient.get<User[]>(ENDPOINTS.SETTINGS.TEAM);
    }
    return mockUsers.filter(u => u.businessId === mockBusiness.id);
  },

  async removeTeamMember(id: string): Promise<void> {
    if (isApiMode()) {
      await apiClient.delete<void>(ENDPOINTS.SETTINGS.TEAM_MEMBER(id));
    }
  },
};
