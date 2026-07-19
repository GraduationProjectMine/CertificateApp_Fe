"use client";
import styles from "./layout.module.css";
import React, { useState, useEffect } from "react";
import { useAuth } from "../../features/auth/components/AuthContext";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  {
    title: "Dashboard",
    path: "/super-admin/dashboard",
    icon: (
      <svg className={styles._navIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
      </svg>
    ),
  },
  {
    title: "Tổ chức",
    path: "/super-admin/organizations",
    icon: (
      <svg className={styles._navIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    title: "Phê duyệt",
    path: "/super-admin/pending",
    icon: (
      <svg className={styles._navIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: "Người dùng",
    path: "/super-admin/users",
    icon: (
      <svg className={styles._navIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
  {
    title: "Nhật ký hệ thống",
    path: "/super-admin/audit-logs",
    icon: (
      <svg className={styles._navIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const activePath = navItems.reduce((acc, curr) => {
    if (pathname.startsWith(curr.path) && curr.path.length > acc.length) {
      return curr.path;
    }
    return acc;
  }, "");

  return (
    <div className={styles._shell}>
      <aside className={`${styles._sidebar} ${collapsed ? styles._sidebarCollapsed : ""}`}>
        <div className={styles._sidebarHeader}>
          <Link href="/super-admin/dashboard" className={styles._logo}>C</Link>
          {!collapsed && (
            <div className={styles._brand}>
              <span className={styles._brandName}>CertiChain</span>
              <span className={styles._brandSub}>Super Admin</span>
            </div>
          )}
        </div>

        <nav className={styles._nav}>
          {navItems.map((item) => {
            const isActive = item.path === activePath;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`${styles._navItem} ${isActive ? styles._navItemActive : ""}`}
              >
                {item.icon}
                {!collapsed && <span>{item.title}</span>}
              </Link>
            );
          })}
        </nav>

        <div className={styles._sidebarFooter}>
          <button onClick={() => setCollapsed(!collapsed)} className={styles._toggleBtn}>
            <svg className={`${styles._navIcon} transition-transform ${collapsed ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
            {!collapsed && <span>Thu gọn</span>}
          </button>
        </div>
      </aside>

      <div className={`${styles._main} ${collapsed ? styles._mainExpanded : ""}`}>
        <header className={styles._topbar}>
          <span className={styles._topbarTitle}>Quản trị hệ thống CertiChain</span>
          <div className={styles._topbarRight}>
            <div className={styles._userBadge}>
              <div className={styles._avatar}>{user?.name?.charAt(0) || "A"}</div>
              <span className={styles._userName}>{user?.name || user?.email}</span>
            </div>
            <button onClick={logout} className={styles._logoutBtn}>Đăng xuất</button>
          </div>
        </header>
        <main className={styles._content}>{children}</main>
      </div>
    </div>
  );
}
