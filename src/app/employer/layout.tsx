"use client";
import styles from "./layout.module.css";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../../features/auth/components/AuthContext";

export default function EmployerLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const pathname = usePathname();

  const navItems = [
    { label: "Bảng điều khiển", href: "/employer/dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
    { label: "Xác minh văn bằng", href: "/employer/verify", icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" },
    { label: "Lịch sử tra cứu", href: "/employer/history", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
  ];

  const getClassName = (href: string) => {
    const isActive = pathname.startsWith(href);
    return `${styles._13} ${isActive ? styles._14 : styles._15}`;
  };

  return (
    <div className={styles._1}>
      <header className={styles._2}>
        <div className={styles._3}>
          <Link href="/" className={styles._4}>
            CertiChain
          </Link>
          <div className={styles._5}>
            <span className={styles._6}>{user?.name || "Nhà tuyển dụng"}</span>
            <Link href="/" className={styles._7}>Trang chủ</Link>
          </div>
        </div>
      </header>
      <div className={styles._8}>
        <div className={styles._9}>
          <nav className={styles._10}>
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className={getClassName(item.href)}>
                <svg className={styles._11} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
                </svg>
                {item.label}
              </Link>
            ))}
          </nav>
          <main className={styles._12}>{children}</main>
        </div>
      </div>
    </div>
  );
}
