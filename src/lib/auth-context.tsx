'use client';

import React, { createContext, useContext, useEffect, useSyncExternalStore } from 'react';
import { appConfig } from '@/config/app.config';
import { authService, setAuthToken, setUnauthorizedHandler } from '@/lib/api';
import type { LoginCredentials } from '@/lib/api/services/auth.service';
import type { User, Role } from '@/types';
import { mockUsers } from './mock-data';

interface AuthContextType {
  user: User | null;
  role: Role | null;
  login: (role: Role) => void;
  loginWithCredentials: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  login: () => {},
  loginWithCredentials: async () => {},
  logout: () => {},
  isLoading: true,
});

const STORAGE_KEY = appConfig.api.userStorageKey;
const listeners = new Set<() => void>();
let cachedRaw: string | null | undefined = undefined;
let cachedUser: User | null = null;

function notifyAuthListeners() {
  listeners.forEach(listener => listener());
}

function subscribeAuth(listener: () => void) {
  listeners.add(listener);
  const handleStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      notifyAuthListeners();
    }
  };
  window.addEventListener('storage', handleStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', handleStorage);
  };
}

function getAuthSnapshot(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw !== cachedRaw) {
      cachedRaw = raw;
      cachedUser = raw ? (JSON.parse(raw) as User) : null;
    }
    return cachedUser;
  } catch {
    return null;
  }
}

function getAuthServerSnapshot(): User | null {
  return null;
}

function persistUser(user: User | null) {
  cachedUser = user;
  if (user) {
    const serialized = JSON.stringify(user);
    cachedRaw = serialized;
    try {
      localStorage.setItem(STORAGE_KEY, serialized);
    } catch {}
  } else {
    cachedRaw = null;
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }
  notifyAuthListeners();
}

const emptySubscribe = () => () => {};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const isHydrated = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const user = useSyncExternalStore(subscribeAuth, getAuthSnapshot, getAuthServerSnapshot);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setAuthToken(null);
      persistUser(null);
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  const login = (role: Role) => {
    const fallbackUser = mockUsers.find(u => u.role === role) || mockUsers[0];
    persistUser(fallbackUser);
    void authService.loginWithRole(role).then(session => {
      if (session?.user) {
        persistUser(session.user);
      }
    }).catch(() => {
      // Keep fallback demo user when backend is unreachable
    });
  };

  const loginWithCredentials = async (credentials: LoginCredentials) => {
    const session = await authService.loginWithCredentials(credentials);
    persistUser(session.user);
  };

  const logout = () => {
    persistUser(null);
    void authService.logout().catch(() => {});
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role ?? null,
        login,
        loginWithCredentials,
        logout,
        isLoading: !isHydrated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
