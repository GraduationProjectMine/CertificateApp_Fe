"use client";

import React from 'react';
import { useAuth } from '../../features/auth/components/AuthContext';
import Link from 'next/link';

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/super-admin/dashboard" className="font-bold text-lg">BlockCert Admin</Link>
          <nav className="flex gap-4 text-sm">
            <Link href="/super-admin/dashboard" className="text-gray-600 hover:text-primary">Dashboard</Link>
            <Link href="/super-admin/pending" className="text-gray-600 hover:text-primary">Phê duyệt</Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">{user?.email}</span>
          <button onClick={logout} className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-100">Đăng xuất</button>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
