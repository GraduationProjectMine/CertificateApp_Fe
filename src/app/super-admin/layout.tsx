"use client";
import styles from "./layout.module.css";
import React from 'react';
import { useAuth } from '../../features/auth/components/AuthContext';
import Link from 'next/link';

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();

  return (
    <div className={styles._1}>
      <header className={styles._2}>
        <div className={styles._3}>
          <Link href="/super-admin/dashboard" className={styles._4}>BlockCert Admin</Link>
          <nav className={styles._5}>
            <Link href="/super-admin/dashboard" className={styles._6}>Dashboard</Link>
            <Link href="/super-admin/pending" className={styles._6}>Phê duyệt</Link>
          </nav>
        </div>
        <div className={styles._7}>
          <span className={styles._8}>{user?.email}</span>
          <button onClick={logout} className={styles._9}>Đăng xuất</button>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
