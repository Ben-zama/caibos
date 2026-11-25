import { isApiMode } from '@/config/app.config';
import { apiClient } from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import { mockActivities, mockContacts, mockDeals } from '@/lib/mock-data';
import type { Activity, Contact, Deal } from '@/types';

export const crmService = {
  async getContacts(): Promise<Contact[]> {
    if (isApiMode()) {
      return apiClient.get<Contact[]>(ENDPOINTS.CRM.CONTACTS);
    }
    return mockContacts;
  },

  async getDeals(): Promise<Deal[]> {
    if (isApiMode()) {
      return apiClient.get<Deal[]>(ENDPOINTS.CRM.DEALS);
    }
    return mockDeals;
  },

  async getActivities(): Promise<Activity[]> {
    if (isApiMode()) {
      return apiClient.get<Activity[]>(ENDPOINTS.CRM.ACTIVITIES);
    }
    return mockActivities;
  },

  async toggleActivity(id: string, completed: boolean): Promise<Activity | null> {
    if (isApiMode()) {
      return apiClient.patch<Activity>(ENDPOINTS.CRM.TOGGLE_ACTIVITY(id), { completed });
    }
    const found = mockActivities.find(a => a.id === id);
    return found ? { ...found, completed } : null;
  },
};
