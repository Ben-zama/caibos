import { isApiMode } from '@/config/app.config';
import { apiClient, setAuthToken } from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import { mockUsers } from '@/lib/mock-data';
import type { AuthSession, Role, User } from '@/types';

export interface LoginCredentials {
  email: string;
  password: string;
}

export const authService = {
  /** Demo persona sign-in (or backend role login if your API exposes it). */
  async loginWithRole(role: Role): Promise<AuthSession> {
    if (isApiMode()) {
      const session = await apiClient.post<AuthSession>(ENDPOINTS.AUTH.LOGIN, { role });
      if (session.token) setAuthToken(session.token);
      return session;
    }
    const user = mockUsers.find(u => u.role === role) || mockUsers[0];
    return { user };
  },

  /** Standard email/password login ready for real backend authentication. */
  async loginWithCredentials(credentials: LoginCredentials): Promise<AuthSession> {
    if (isApiMode()) {
      const session = await apiClient.post<AuthSession>(ENDPOINTS.AUTH.LOGIN, credentials);
      if (session.token) setAuthToken(session.token);
      return session;
    }
    const matched =
      mockUsers.find(u => u.email.toLowerCase() === credentials.email.toLowerCase()) ||
      mockUsers[0];
    return { user: matched };
  },

  async getCurrentUser(): Promise<User | null> {
    if (isApiMode()) {
      return apiClient.get<User>(ENDPOINTS.AUTH.ME);
    }
    return null;
  },

  async logout(): Promise<void> {
    if (isApiMode()) {
      try {
        await apiClient.post<void>(ENDPOINTS.AUTH.LOGOUT);
      } finally {
        setAuthToken(null);
      }
      return;
    }
    setAuthToken(null);
  },
};
