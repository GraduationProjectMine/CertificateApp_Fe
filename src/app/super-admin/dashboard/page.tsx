"use client";
import styles from "./page.module.css";
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
    <div className={styles._1}>
      <h1 className={styles._2}>Quản trị hệ thống</h1>

      <div className={styles._3}>
        <div className={styles._4}>
          <p className={styles._5}>{stats.pendingInstitutions}</p>
          <p className={styles._6}>Chờ duyệt</p>
        </div>
        <div className={styles._4}>
          <p className={styles._7}>{stats.activeInstitutions}</p>
          <p className={styles._6}>Đã kích hoạt</p>
        </div>
        <div className={styles._4}>
          <p className={styles._8}>{stats.totalUsers}</p>
          <p className={styles._6}>Người dùng</p>
        </div>
      </div>

      <div className={styles._9}>
        <Link href="/super-admin/pending" className={styles._10}>
          Xem yêu cầu đăng ký
        </Link>
      </div>
    </div>
  );
}
