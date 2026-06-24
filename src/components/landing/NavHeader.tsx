"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/features/auth/components/AuthContext";
import { useTheme } from "@/features/theme/ThemeContext";
import { useI18n } from "@/features/i18n/I18nContext";
import { navItems } from "./data";

export default function NavHeader() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t, locale, toggleLocale } = useI18n();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/90 dark:bg-[#030712]/90 backdrop-blur-lg shadow-sm border-b border-gray-100 dark:border-gray-800/50 py-2"
          : "bg-transparent py-3"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center gap-6">
        <Link href="/" className="flex shrink-0 items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-bold text-base shadow-sm group-hover:scale-105 transition-transform duration-300">
            C
          </div>
          <span className="font-bold text-base tracking-tight text-gray-900 dark:text-white">
            CertiChain
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) =>
            item.href.startsWith("/") ? (
              <Link
                key={item.labelKey}
                href={item.href}
                className="rounded-lg px-3 py-2 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-100 hover:text-primary dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-teal-400"
              >
                {t(item.labelKey)}
              </Link>
            ) : (
              <a
                key={item.labelKey}
                href={item.href}
                className="rounded-lg px-3 py-2 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-100 hover:text-primary dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-teal-400"
              >
                {t(item.labelKey)}
              </a>
            )
          )}
        </nav>

        <div className="ml-auto hidden lg:flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
          <button
            onClick={toggleLocale}
            className="inline-flex h-9 items-center justify-center rounded-lg px-2.5 text-xs font-bold uppercase text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white"
            aria-label="Toggle language"
          >
            {locale === "vi" ? "EN" : "VI"}
          </button>

          <span className="mx-1 h-5 w-px bg-gray-200 dark:bg-white/10" />
          {user ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 dark:text-gray-400 max-w-[150px] truncate">
                {user.loginType === "metamask" ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 border border-green-200/50 text-[11px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                    {user.walletAddress?.slice(0, 6)}...{user.walletAddress?.slice(-4)}
                  </span>
                ) : (
                  user.name
                )}
              </span>
              <Link
                href={
                  user.role === "issuer" || user.role === "sysadmin"
                    ? "/admin/dashboard"
                    : user.role === "student"
                      ? "/student/dashboard"
                      : "/public/verify"
                }
                className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-xs font-bold text-white shadow-sm transition-all hover:bg-primary-hover hover:shadow-md"
              >
                {t("nav.dashboard")}
              </Link>
              <button
                onClick={logout}
                className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-200 px-4 text-xs font-bold text-gray-600 transition-all hover:border-danger/30 hover:text-danger dark:border-white/10 dark:text-gray-300"
              >
                {t("nav.logout")}
              </button>
            </div>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="inline-flex h-10 items-center rounded-lg px-2.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-100 hover:text-primary dark:text-gray-300 dark:hover:bg-white/5"
              >
                {t("nav.login")}
              </Link>
              <Link
                href="/auth/register"
                className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-5 text-sm font-bold text-white shadow-sm transition-all hover:bg-primary-hover hover:shadow-md hover:scale-[1.02]"
              >
                {t("nav.register")}
              </Link>
            </>
          )}
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="ml-auto lg:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden px-4 pt-2 pb-6 bg-white dark:bg-[#030712] border-b border-gray-100 dark:border-gray-800/50 shadow-lg animate-slideDown">
          <div className="flex flex-col gap-4">
            {navItems.map((item) =>
              item.href.startsWith("/") ? (
                <Link
                  key={item.labelKey}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-base font-medium text-gray-700 dark:text-gray-300 py-1"
                >
                  {t(item.labelKey)}
                </Link>
              ) : (
                <a
                  key={item.labelKey}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-base font-medium text-gray-700 dark:text-gray-300 py-1"
                >
                  {t(item.labelKey)}
                </a>
              )
            )}
            <div className="flex items-center gap-2 py-1">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? "☀️" : "🌙"}
              </button>
              <button
                onClick={toggleLocale}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors uppercase tracking-wider"
              >
                {locale === "vi" ? "EN" : "VI"}
              </button>
            </div>
            <hr className="border-gray-100 dark:border-gray-800" />
            {user ? (
              <div className="flex flex-col gap-3">
                <span className="text-sm text-gray-500">
                  {t("auth.hello")}, {user.name || `${user.walletAddress?.slice(0, 6)}...${user.walletAddress?.slice(-4)}`}
                </span>
                <Link
                  href="/admin/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center px-4 py-2.5 text-sm font-semibold text-white bg-primary rounded-lg"
                >
                  {t("nav.dashboard")}
                </Link>
                <button
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="w-full text-center px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  {t("nav.logout")}
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <Link
                  href="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  {t("nav.login")}
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center px-4 py-2.5 text-sm font-semibold text-white bg-primary rounded-lg"
                >
                  {t("nav.register")}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
