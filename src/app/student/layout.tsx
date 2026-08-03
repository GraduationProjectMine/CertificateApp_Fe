"use client";
import styles from "./layout.module.css";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../../features/auth/components/AuthContext";
import ThemeToggle from "@/components/common/ThemeToggle";
import Tooltip from "@/components/common/Tooltip";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const navItems = [
    { label: "Bảng điều khiển", href: "/student/dashboard", desc: "Tổng quan hoạt động & văn bằng", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
    { label: "Văn bằng của tôi", href: "/student/certificates", desc: "Danh sách bằng & chứng chỉ đã cấp", icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" },
    { label: "Yêu cầu chỉnh sửa", href: "/student/disputes", desc: "Yêu cầu chỉnh sửa thông tin văn bằng", icon: "M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" },
    { label: "Hồ sơ cá nhân", href: "/student/profile", desc: "Thông tin tài khoản sinh viên", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
    { label: "Cài đặt", href: "/student/settings", desc: "Tùy chỉnh & mật khẩu tài khoản", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
  ];

  const getClassName = (href: string) => {
    const isActive = pathname.startsWith(href);
    return `${styles._13} ${isActive ? styles._14 : styles._15}`;
  };

  return (
    <div className={styles._1}>
      <header className={styles._2}>
        <div className={styles._3}>
          <Tooltip content="Về trang chủ CertiChain" position="right">
            <Link href="/" className={styles._4}>
              CertiChain
            </Link>
          </Tooltip>
          <div className={styles._5}>
            <Tooltip content="Chuyển đổi giao diện Sáng / Tối" position="bottom">
              <ThemeToggle />
            </Tooltip>
            <Tooltip content="Tài khoản Sinh viên đang đăng nhập" position="bottom">
              <span className={styles._6}>{user?.name}</span>
            </Tooltip>
            <Tooltip content="Đăng xuất khỏi hệ thống" position="bottom">
              <button
                onClick={logout}
                className="flex items-center gap-1.5 font-semibold text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 11-6 0v-1m6-9V5a3 3 0 00-6 0v1" />
                </svg>
                <span>Đăng xuất</span>
              </button>
            </Tooltip>
          </div>
        </div>
      </header>
      <div className={styles._8}>
        <div className={styles._9}>
          <nav className={styles._10}>
            {navItems.map((item) => (
              <Tooltip key={item.href} content={item.desc} position="right" className="w-full">
                <Link href={item.href} className={`${getClassName(item.href)} w-full`}>
                  <svg className={styles._11} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
                  </svg>
                  {item.label}
                </Link>
              </Tooltip>
            ))}
          </nav>
          <main className={styles._12}>{children}</main>
        </div>
      </div>
    </div>
  );
}
