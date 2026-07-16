"use client";
import styles from "./page.module.css";
import React from 'react';
import Link from 'next/link';

export default function SuperAdminDashboard() {
  const stats = { pendingInstitutions: 0, activeInstitutions: 0, totalUsers: 0 };

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
        <p className="mb-3 text-xs text-gray-500">Backend hiện chưa có API quản trị hệ thống, nên số liệu này đang được ẩn ở trạng thái trống.</p>
        <Link href="/super-admin/pending" className={styles._10}>
          Xem yêu cầu đăng ký
        </Link>
      </div>
    </div>
  );
}
