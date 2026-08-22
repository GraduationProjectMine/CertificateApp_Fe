"use client";
import styles from "./AdminTopbar.module.css";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { menuItems } from "../MenuItems";
import type { User } from "@/features/auth/types";
import ThemeToggle from "@/components/common/ThemeToggle";
import Tooltip from "@/components/common/Tooltip";
import { useI18n } from "@/features/i18n/I18nContext";

interface AdminTopbarProps {
  user: User;
  onMenuToggle: () => void;
  onLogout: () => void;
}

function getBreadcrumbs(pathname: string, t: (path: string) => string) {
  const segments = pathname.split("/").filter(Boolean);
  return segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/");
    const item = menuItems.find((m) => m.path === href);
    let displayTitle = segment;
    if (segment === "admin") {
      displayTitle = t("dashboard.adminNav.portalTitle");
    } else if (item?.translationKey) {
      displayTitle = t(item.translationKey);
    } else if (item) {
      displayTitle = item.title;
    }

    return {
      title: displayTitle.charAt(0).toUpperCase() + displayTitle.slice(1),
      href,
      isLast: index === segments.length - 1
    };
  });
}

export default function AdminTopbar({ user, onMenuToggle, onLogout }: AdminTopbarProps) {
  const pathname = usePathname();
  const { locale, toggleLocale, t } = useI18n();
  const breadcrumbs = getBreadcrumbs(pathname, t);

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
          <span className={styles._6}>{t("dashboard.adminNav.portalTitle")}</span>
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
        {user.loginType === "metamask" && (
          <Tooltip content={`Ví MetaMask: ${user.walletAddress}`} position="bottom">
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
          </Tooltip>
        )}

        <Tooltip content="Chuyển đổi giao diện Sáng / Tối" position="bottom">
          <ThemeToggle className={styles._15} />
        </Tooltip>

        <Tooltip content="Chuyển đổi ngôn ngữ / Switch Language" position="bottom">
          <button
            onClick={toggleLocale}
            className="flex items-center justify-center min-w-[32px] h-8 px-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-200 hover:border-primary hover:text-primary transition-all cursor-pointer shadow-2xs"
            aria-label="Toggle Language"
          >
            {locale === "vi" ? "EN" : "VI"}
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
            <span>{t("nav.logout")}</span>
          </button>
        </Tooltip>
      </div>
    </header>
  );
}

