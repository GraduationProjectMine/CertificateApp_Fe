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
    title: "Văn bằng",
    path: "/super-admin/certificates",
    icon: (
      <svg className={styles._navIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
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
  {
    title: "Hạ tầng",
    path: "/super-admin/infrastructure",
    icon: (
      <svg className={styles._navIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
  },
  {
    title: "Ví điện tử",
    path: "/super-admin/wallets",
    icon: (
      <svg className={styles._navIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
  },
  {
    title: "Báo cáo",
    path: "/super-admin/reports",
    icon: (
      <svg className={styles._navIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2m32-12l-8 8m0 0l-4-4m4 4v20" />
      </svg>
    ),
  },
  {
    title: "Cấu hình",
    path: "/super-admin/settings",
    icon: (
      <svg className={styles._navIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    title: "Quản trị viên",
    path: "/super-admin/settings/admins",
    icon: (
      <svg className={styles._navIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
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
            
            {/* Notification Bell */}
            <NotificationBell />

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

function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<string[]>([
    "Hạ tầng blockchain đang hoạt động ổn định.",
    "Có tổ chức đăng ký mới cần duyệt.",
  ]);

  return (
    <div className="relative">
      <button 
        onClick={() => setOpen(!open)}
        className="relative p-1.5 text-gray-400 hover:text-gray-500 rounded-lg hover:bg-gray-150 transition"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {notifications.length > 0 && (
          <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg py-2 z-50 text-xs">
          <div className="px-4 py-1.5 border-b border-gray-100 dark:border-gray-800 font-bold text-gray-700 dark:text-gray-300">
            Thông báo hệ thống
          </div>
          <div className="max-h-48 overflow-y-auto">
            {notifications.map((notif, i) => (
              <div key={i} className="px-4 py-2 border-b border-gray-50 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/40 text-gray-600 dark:text-gray-400">
                {notif}
              </div>
            ))}
          </div>
          <button 
            onClick={() => setNotifications([])}
            className="w-full text-center pt-2 pb-1 border-t border-gray-100 dark:border-gray-800 text-[10px] text-primary font-bold hover:underline"
          >
            Đánh dấu đã đọc
          </button>
        </div>
      )}
    </div>
  );
}

