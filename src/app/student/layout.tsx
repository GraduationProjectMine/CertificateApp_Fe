"use client";
import styles from "./layout.module.css";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../../features/auth/components/AuthContext";
import { useI18n } from "@/features/i18n/I18nContext";
import AppControls from "@/components/common/AppControls";
import Tooltip from "@/components/common/Tooltip";
import ConfirmModal from "@/components/common/Modal/ConfirmModal";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isLoggingOut, logout } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  const pathname = usePathname();
  const { t } = useI18n();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const navItems = [
    { label: t("studentShell.dashboard"), href: "/student/dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
    { label: t("studentShell.myCertificates"), href: "/student/certificates", icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" },
    { label: t("studentShell.disputes"), href: "/student/disputes", icon: "M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" },
    { label: t("studentShell.profile"), href: "/student/profile", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
    { label: t("studentShell.settings"), href: "/student/settings", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
  ];

  const activeIndex = navItems.findIndex((n) => pathname.startsWith(n.href));

  if (!mounted || isLoading || isLoggingOut) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", flexDirection: "column", gap: "12px" }}>
        <svg style={{ width: 40, height: 40, animation: "spin 1s linear infinite", color: "#14b8a6" }} fill="none" viewBox="0 0 24 24">
          <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span style={{ color: "#94a3b8", fontSize: 14 }}>{t("adminShell.authGuard.loading")}</span>
      </div>
    );
  }

  if (!user || user.role !== "student") {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", flexDirection: "column", gap: "16px", padding: "24px" }}>
        <svg style={{ width: 48, height: 48, color: "#f59e0b" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m0-8v6m0 5h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: "#f1f5f9", margin: 0 }}>{t("adminShell.authGuard.title")}</h1>
        <p style={{ color: "#94a3b8", textAlign: "center", maxWidth: 400, margin: 0 }}>{t("adminShell.authGuard.description")}</p>
        <div style={{ display: "flex", gap: "12px", marginTop: 8 }}>
          <Link href="/auth/login" style={{ padding: "10px 20px", borderRadius: 8, background: "#14b8a6", color: "#fff", fontWeight: 600, textDecoration: "none", fontSize: 14 }}>
            {t("adminShell.authGuard.loginAgain")}
          </Link>
          <Link href="/" style={{ padding: "10px 20px", borderRadius: 8, background: "#1e293b", color: "#94a3b8", fontWeight: 600, textDecoration: "none", fontSize: 14, border: "1px solid #334155" }}>
            {t("adminShell.authGuard.backHome")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles._1}>
      <ConfirmModal
        open={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        title={t("common.confirm.logoutTitle")}
        message={t("common.confirm.logoutBody")}
        confirmLabel={t("common.confirm.logoutConfirm")}
        cancelLabel={t("common.confirm.logoutCancel")}
        variant="danger"
        icon="danger"
        onConfirm={() => {
          setShowLogoutConfirm(false);
          logout();
        }}
      />
      <header className={styles._2}>
        <div className={styles._3}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white md:hidden rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <Tooltip content={t("studentShell.homeTooltip")} position="right">
              <Link href="/" className={styles._4}>
                CertiChain
              </Link>
            </Tooltip>
          </div>
          <div className={styles._5}>
            <AppControls />
            <span className={`${styles._6} hidden sm:inline`}>{user?.name}</span>
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="flex items-center gap-1.5 font-semibold text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors cursor-pointer text-xs sm:text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 11-6 0v-1m6-9V5a3 3 0 00-6 0v1" />
              </svg>
              <span className="hidden sm:inline">{t("studentShell.logout")}</span>
            </button>
          </div>
        </div>
      </header>

      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <div className={styles._8}>
        <div className="flex flex-col md:flex-row gap-6 md:gap-10">
          {/* Navigation Sidebar — ledger style */}
          <nav
            className={`fixed md:static top-16 md:top-0 bottom-0 md:bottom-auto left-0 z-50 w-64 md:w-56 p-4 md:p-0 bg-gray-900 md:bg-transparent border-r border-gray-800 md:border-none flex-shrink-0 self-start transform transition-transform duration-200 ease-in-out ${
              mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
            }`}
          >
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-gray-800 md:hidden">
              <span className="font-bold text-sm text-white">{t("studentShell.menuTitle")}</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-lg text-gray-500 hover:text-gray-300"
              >
                ✕
              </button>
            </div>

            <div className="relative pl-4">
              {navItems.map((item, index) => {
                const isActive = pathname.startsWith(item.href);
                const confirmed = activeIndex >= 0 && index <= activeIndex;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="relative flex items-center gap-3 py-2.5 pl-4 -ml-px"
                    style={{ borderLeft: `1px solid ${confirmed ? "#0f766e" : "#1e293b"}` }}
                  >
                    <span
                      className="absolute rounded-full"
                      style={
                        isActive
                          ? { left: "-6px", width: 9, height: 9, background: "#14b8a6", border: "2px solid #0b1220" }
                          : { left: "-5px", width: 7, height: 7, background: "#0b1220", border: "1.5px solid #334155" }
                      }
                    />
                    <svg
                      className="h-4 w-4 flex-shrink-0"
                      style={{ color: isActive ? "#5eead4" : "#64748b" }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
                    </svg>
                    <span
                      className="text-sm"
                      style={{ color: isActive ? "#5eead4" : "#94a3b8", fontWeight: isActive ? 500 : 400 }}
                    >
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </nav>

          <main className={styles._12}>{children}</main>
        </div>
      </div>
    </div>
  );
}