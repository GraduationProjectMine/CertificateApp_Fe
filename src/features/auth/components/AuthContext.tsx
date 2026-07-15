"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authApi } from '../services/api';
import type { User } from '../types';
export type { UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isLoggingOut: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function decodeTokenPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

function beUserToAppUser(data: {
  id: string;
  email: string;
  name: string;
  role: string;
  accessToken: string;
}): { token: string; user: User } {
  let appRole: User['role'] = 'student';
  const roleLower = data.role?.toLowerCase();
  
  if (roleLower === 'issuer') {
    appRole = 'issuer';
  } else if (roleLower === 'staff') {
    appRole = 'staff';
  } else if (roleLower === 'sysadmin') {
    appRole = 'sysadmin';
  }

  const payload = decodeTokenPayload(data.accessToken);
  const organizationId = (payload?.organization_id as string) ?? null;

  return {
    token: data.accessToken,
    user: {
      id: data.id,
      email: data.email,
      name: data.name,
      role: appRole,
      studentId: null,
      institutionId: organizationId,
      walletAddress: null,
    },
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoggingOut) {
      setIsLoggingOut(false);
    }
  }, [pathname]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('auth_user');
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch { }
    }
    setIsLoading(false);
  }, []);

  const saveSession = (token: string, user: User) => {
    localStorage.setItem('token', token);
    localStorage.setItem('auth_user', JSON.stringify(user));
    setUser(user);
  };

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const data = await authApi.login(email, password);
      const { token, user: appUser } = beUserToAppUser(data);
      saveSession(token, appUser);
      setIsLoading(false);
      return { success: true };
    } catch (err: unknown) {
      setIsLoading(false);
      return { success: false, error: err instanceof Error ? err.message : 'Đăng nhập thất bại' };
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoggingOut(true);
    try {
      await authApi.logout();
    } catch (err) {
      console.error("Failed to call backend logout api", err);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('auth_user');
      setUser(null);
      setIsLoggingOut(false);
      router.replace('/');
    }
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, isLoading, isLoggingOut, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
