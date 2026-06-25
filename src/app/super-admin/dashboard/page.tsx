"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../features/auth/components/AuthContext';
import { authApi } from '../../../features/auth/services/api';

export default function SuperAdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ pendingInstitutions: 0, activeInstitutions: 0, totalUsers: 0 });

  useEffect(() => {
    authApi.superAdminStats().then(setStats).catch(() => {});
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-6">Quản trị hệ thống</h1>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <p className="text-3xl font-bold text-primary">{stats.pendingInstitutions}</p>
          <p className="text-sm text-gray-500">Chờ duyệt</p>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <p className="text-3xl font-bold text-green-600">{stats.activeInstitutions}</p>
          <p className="text-sm text-gray-500">Đã kích hoạt</p>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <p className="text-3xl font-bold text-blue-600">{stats.totalUsers}</p>
          <p className="text-sm text-gray-500">Người dùng</p>
        </div>
      </div>

      <div className="flex gap-4">
        <Link href="/super-admin/pending" className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-hover">
          Xem yêu cầu đăng ký
        </Link>
      </div>
    </div>
  );
}
