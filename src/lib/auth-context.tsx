'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, Role } from '@/types';
import { mockUsers } from './mock-data';

interface AuthContextType {
  user: User | null;
  role: Role | null;
  login: (role: Role) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  login: () => {},
  logout: () => {},
  isLoading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Restore session from localStorage
    const stored = localStorage.getItem('caibos-user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {}
    }
    setIsLoading(false);
  }, []);

  const login = (role: Role) => {
    const selectedUser = mockUsers.find(u => u.role === role) || mockUsers[0];
    setUser(selectedUser);
    localStorage.setItem('caibos-user', JSON.stringify(selectedUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('caibos-user');
  };

  return (
    <AuthContext.Provider value={{ user, role: user?.role ?? null, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
