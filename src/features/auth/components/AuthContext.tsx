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

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const SESSION_TIMEOUT_MS = 60 * 60 * 1000; // 1 hour

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    async function initAuth() {
      const token = localStorage.getItem('token');
      const savedUserStr = localStorage.getItem('auth_user');
      const loginTimeStr = localStorage.getItem('auth_login_time');

      let savedUser: User | null = null;
      if (savedUserStr) {
        try {
          savedUser = JSON.parse(savedUserStr);
        } catch {
          savedUser = null;
        }
      }

      let loginTime = loginTimeStr ? parseInt(loginTimeStr, 10) : NaN;

      if (token && isNaN(loginTime)) {
        loginTime = Date.now();
        localStorage.setItem('auth_login_time', loginTime.toString());
      }

      // Check if session has exceeded 1 hour
      if (!isNaN(loginTime) && Date.now() - loginTime >= SESSION_TIMEOUT_MS) {
        localStorage.removeItem('token');
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_login_time');
        setUser(null);
        setIsLoading(false);
        return;
      }

      if (token && savedUser && isTokenValid(token)) {
        setUser(savedUser);
        setIsLoading(false);
        return;
      }

      // If token is missing/expired or savedUser exists, try to silently refresh token via HTTP-only cookie
      if (token || savedUser) {
        try {
          const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
            method: 'POST',
            credentials: 'include',
          });

          if (refreshRes.ok) {
            const refreshData = await refreshRes.json();
            const newToken = refreshData.accessToken;
            localStorage.setItem('token', newToken);
            if (savedUser) {
              setUser(savedUser);
            }
          } else {
            localStorage.removeItem('token');
            localStorage.removeItem('auth_user');
            localStorage.removeItem('auth_login_time');
            setUser(null);
          }
        } catch {
          localStorage.removeItem('token');
          localStorage.removeItem('auth_user');
          localStorage.removeItem('auth_login_time');
          setUser(null);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    }

    initAuth();
  }, []);

  const saveSession = (token: string, user: User) => {
    localStorage.setItem('token', token);
    localStorage.setItem('auth_user', JSON.stringify(user));
    localStorage.setItem('auth_login_time', Date.now().toString());
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
      localStorage.removeItem('auth_login_time');
      setUser(null);
      setIsLoggingOut(false);
      if (typeof window !== 'undefined') {
        if (window.location.pathname === '/') {
          window.location.reload();
        } else {
          window.location.href = '/';
        }
      }
    }
  }, []);

  // 1-Hour Session Expiry Timer and Visibility/Focus Listener
  useEffect(() => {
    if (!mounted || !user) return;
    if (typeof window === 'undefined') return;

    const checkSessionExpiry = () => {
      const loginTimeStr = localStorage.getItem('auth_login_time');
      if (!loginTimeStr) return;
      const loginTime = parseInt(loginTimeStr, 10);
      if (isNaN(loginTime) || Date.now() - loginTime >= SESSION_TIMEOUT_MS) {
        logout();
      }
    };

    checkSessionExpiry();

    const loginTimeStr = localStorage.getItem('auth_login_time');
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    if (loginTimeStr) {
      const loginTime = parseInt(loginTimeStr, 10);
      if (!isNaN(loginTime)) {
        const timeElapsed = Date.now() - loginTime;
        const remainingTime = Math.max(0, SESSION_TIMEOUT_MS - timeElapsed);
        timeoutId = setTimeout(() => {
          logout();
        }, remainingTime);
      }
    }

    const intervalId = setInterval(checkSessionExpiry, 10000);
    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible') {
        checkSessionExpiry();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityOrFocus);
    window.addEventListener('focus', handleVisibilityOrFocus);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      window.removeEventListener('focus', handleVisibilityOrFocus);
    };
  }, [user, logout]);

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
