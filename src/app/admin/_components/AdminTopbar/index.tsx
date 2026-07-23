"use client";
import styles from "./AdminTopbar.module.css";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { menuItems } from "../MenuItems";
import type { User } from "@/features/auth/types";
import ThemeToggle from "@/components/common/ThemeToggle";
import Tooltip from "@/components/common/Tooltip";

interface AdminTopbarProps {
  user: User;
  onMenuToggle: () => void;
  onLogout: () => void;
}

function getBreadcrumbs(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  return segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/");
    const item = menuItems.find((m) => m.path === href) || { title: segment };
    const displayTitle =
      segment === "admin"
        ? "Quản trị"
        : segment === "certificates"
        ? "Văn bằng"
        : segment === "issue"
        ? "Cấp mới "
        : item.title;

    return {
      title: displayTitle.charAt(0).toUpperCase() + displayTitle.slice(1),
      href,
      isLast: index === segments.length - 1
    };
  });
}

export default function AdminTopbar({ user, onMenuToggle, onLogout }: AdminTopbarProps) {
  const pathname = usePathname();
  const breadcrumbs = getBreadcrumbs(pathname);

  return (
    <header className={styles._1}>
      <div className={styles._2}>
        <Tooltip content="Mở danh mục Menu" position="bottom">
          <button
            onClick={onMenuToggle}
            className={styles._3}
            aria-label="Open sidebar"
          >
            <svg className={styles._4} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
        </Tooltip>

        <nav className={styles._5}>
          <span className={styles._6}>Cổng trường</span>
          {breadcrumbs.map((crumb) => (
            <React.Fragment key={crumb.href}>
              <span className={styles._7}>/</span>
              {crumb.isLast ? (
                <span className={styles._8}>{crumb.title}</span>
              ) : (
                <Link href={crumb.href} className={styles._6}>
                  {crumb.title}
                </Link>
              )}
            </React.Fragment>
          ))}
        </nav>
      </div>

      <div className={styles._2}>
        <Tooltip content={user.loginType === "metamask" ? `Ví MetaMask: ${user.walletAddress}` : "Phiên đăng nhập Email"} position="bottom">
          {user.loginType === "metamask" ? (
            <div className={styles._9}>
              <svg className={styles._10} viewBox="0 0 256 238" fill="none">
                <path d="M247.9 104.8l-15-46.7-56-42.5-44.5 59 4.3.4 35.3-32.9L247.9 104.8z" fill="#E2761B"/>
                <path d="M8.1 104.8l15-46.7 56-42.5 44.5 59-4.3.4-35.3-32.9L8.1 104.8z" fill="#E4761B"/>
                <path d="M174.5 130.6l-20.2 38.6-26.3-5-26.3 5-20.2-38.6 30.2 5.5 16.3-26.8 16.3 26.8 30.2-5.5z" fill="#233447"/>
                <path d="M128 221.3l52.5-47.5-31.5-5.7-21 21.2-21-21.2-31.5 5.7 52.5 47.5z" fill="#E2761B"/>
                <path d="M128 75l-16.3 26.8 32.6 0L128 75z" fill="#F6851B"/>
              </svg>
              <span className={styles._11}>{user.walletAddress?.slice(0, 6)}...{user.walletAddress?.slice(-4)}</span>
              <span className={styles._12}></span>
            </div>
          ) : (
            <div className={styles._13}>
              <span className={styles._14}></span>
              <span>Email Session</span>
            </div>
          )}
        </Tooltip>

        <Tooltip content="Chuyển đổi giao diện Sáng / Tối" position="bottom">
          <ThemeToggle className={styles._15} />
        </Tooltip>

        <Tooltip content="Thông báo hệ thống" position="bottom">
          <button
            className={`${styles._15}`}
            aria-label="View notifications"
          >
            <svg className={styles._16} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
            </svg>
            <span className={styles._17}></span>
          </button>
        </Tooltip>

        <Tooltip content="Đăng xuất khỏi hệ thống" position="bottom">
          <button
            onClick={onLogout}
            className={styles._18}
          >
            <svg className={styles._19} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 11-6 0v-1m6-9V5a3 3 0 00-6 0v1"></path>
            </svg>
            <span>Thoát</span>
          </button>
        </Tooltip>
      </div>
    </header>
  );
}
