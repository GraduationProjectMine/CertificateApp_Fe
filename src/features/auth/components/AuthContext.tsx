"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../services/api';
import type { User } from '../types';
export type { UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isLoggingOut: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithMetaMask: (walletAddress: string, signature: string, tempToken: string) => Promise<{ success: boolean; error?: string }>;
  registerWithMetaMask: (data: {
    walletAddress: string;
    signature: string;
    tempToken: string;
    email: string;
    name: string;
    adminName?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function decodeTokenPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const paddedPayload = payload.padEnd(Math.ceil(payload.length / 4) * 4, '=');
    const decoded = atob(paddedPayload);
    return JSON.parse(decoded);
  } catch (error) {
    console.warn('Unable to decode the authentication token.', error);
    return null;
  }
}

function isTokenValid(token: string): boolean {
  const payload = decodeTokenPayload(token);
  return typeof payload?.exp === 'number' && payload.exp * 1000 > Date.now();
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

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('auth_user');
    if (token && savedUser && isTokenValid(token)) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.warn('Unable to restore the stored authentication user.', error);
        localStorage.removeItem('token');
        localStorage.removeItem('auth_user');
      }
    } else if (token || savedUser) {
      localStorage.removeItem('token');
      localStorage.removeItem('auth_user');
    }
    setIsLoading(false);
  }, []);

  const saveSession = (token: string, user: User) => {
    localStorage.setItem('token', token);
    localStorage.setItem('auth_user', JSON.stringify(user));
    setUser(user);
  };

  const login = useCallback(async (email: string, password: string) => {
    try {
      const data = await authApi.login(email, password);
      const { token, user: appUser } = beUserToAppUser(data);
      saveSession(token, appUser);
      return { success: true };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : 'Đăng nhập thất bại' };
    }
  }, []);

  const loginWithMetaMask = useCallback(async (walletAddress: string, signature: string, tempToken: string) => {
    try {
      const data = await authApi.loginWithMetaMask(walletAddress, signature, tempToken);
      const { token, user: appUser } = beUserToAppUser(data);
      saveSession(token, appUser);
      return { success: true };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : 'Đăng nhập với MetaMask thất bại' };
    }
  }, []);

  const registerWithMetaMask = useCallback(async (data: {
    walletAddress: string;
    signature: string;
    tempToken: string;
    email: string;
    name: string;
    adminName?: string;
  }) => {
    try {
      const resData = await authApi.registerWithMetaMask(data);
      const { token, user: appUser } = beUserToAppUser(resData);
      saveSession(token, appUser);
      return { success: true };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : 'Đăng ký với MetaMask thất bại' };
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
      // Tear down the protected tree atomically. Unlike pathname-based state,
      // this also completes correctly when logout starts while already on `/`.
      window.location.replace('/');
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, isLoggingOut, login, loginWithMetaMask, registerWithMetaMask, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
