"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { BrowserProvider } from 'ethers';
import { useRouter, usePathname } from 'next/navigation';
import { authApi } from '../services/api';
import type { User } from '../types';
export type { UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isLoggingOut: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: (credential: string) => Promise<{ success: boolean; error?: string }>;
  loginWithMetaMask: () => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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

  return {
    token: data.accessToken,
    user: {
      id: data.id,
      email: data.email,
      name: data.name,
      role: appRole,
      studentId: null,
      institutionId: (appRole === 'issuer' || appRole === 'staff') ? data.id : null,
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
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err.message || 'Đăng nhập thất bại' };
    }
  }, []);

  const loginWithGoogle = useCallback(async (credential: string) => {
    setIsLoading(true);
    try {
      const data = await authApi.loginGoogle(credential);
      saveSession(data.token, { ...data.user, loginType: 'google' });
      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err.message || 'Đăng nhập Google thất bại' };
    }
  }, []);

  const loginWithMetaMask = useCallback(async () => {
    setIsLoading(true);
    try {
      const eth = typeof window !== 'undefined' ? (window as any).ethereum : null;
      if (!eth) {
        setIsLoading(false);
        return { success: false, error: 'Vui lòng cài đặt MetaMask' };
      }

      const provider = new BrowserProvider(eth);
      await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();
      const walletAddress = await signer.getAddress();

      const nonceRes = await authApi.getMetamaskLoginNonce(walletAddress);
      const signature = await signer.signMessage(nonceRes.message);
      const data = await authApi.loginMetamask(walletAddress, signature);

      saveSession(data.token, { ...data.user, loginType: 'metamask' });
      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      if (err.code === 4001) return { success: false, error: 'Bạn đã từ chối ký' };
      return { success: false, error: err.message || 'Lỗi MetaMask' };
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
    <AuthContext.Provider value={{ user, isLoading, isLoggingOut, login, loginWithGoogle, loginWithMetaMask, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
