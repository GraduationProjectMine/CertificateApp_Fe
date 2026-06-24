"use client";
import styles from "./NavHeader.module.css";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/features/auth/components/AuthContext";
import { useTheme } from "@/features/theme/ThemeContext";
import { useI18n } from "@/features/i18n/I18nContext";
import { navItems } from "../data";

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
      className={`${styles._0} ${
        isScrolled
          ? "bg-white/90 dark:bg-[#030712]/90 backdrop-blur-lg shadow-sm border-b border-gray-100 dark:border-gray-800/50 py-2"
          : "bg-transparent py-3"
      }`}
    >
      <div className={styles._1}>
        <Link href="/" className={`group ${styles._2}`}>
          <div className={styles._3}>
            C
          </div>
          <span className={styles._4}>
            CertiChain
          </span>
        </Link>

        <nav className={styles._5}>
          {navItems.map((item) =>
            item.href.startsWith("/") ? (
              <Link
                key={item.labelKey}
                href={item.href}
                className={styles._6}
              >
                {t(item.labelKey)}
              </Link>
            ) : (
              <a
                key={item.labelKey}
                href={item.href}
                className={styles._6}
              >
                {t(item.labelKey)}
              </a>
            )
          )}
        </nav>

        <div className={styles._7}>
          <button
            onClick={toggleTheme}
            className={styles._8}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <svg className={styles._9} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className={styles._9} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
          <button
            onClick={toggleLocale}
            className={styles._10}
            aria-label="Toggle language"
          >
            {locale === "vi" ? "EN" : "VI"}
          </button>

          <span className={styles._11} />
          {user ? (
            <div className={styles._12}>
              <span className={styles._13}>
                {user.loginType === "metamask" ? (
                  <span className={styles._14}>
                    <span className={styles._15}></span>
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
                className={styles._16}
              >
                {t("nav.dashboard")}
              </Link>
              <button
                onClick={logout}
                className={styles._17}
              >
                {t("nav.logout")}
              </button>
            </div>
          ) : (
            <>
              <Link
                href="/auth/login"
                className={styles._18}
              >
                {t("nav.login")}
              </Link>
              <Link
                href="/auth/register"
                className={styles._19}
              >
                {t("nav.register")}
              </Link>
            </>
          )}
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className={styles._20}
          aria-label="Toggle menu"
        >
          <svg className={styles._21} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {mobileMenuOpen && (
        <div className={styles._22}>
          <div className={styles._23}>
            {navItems.map((item) =>
              item.href.startsWith("/") ? (
                <Link
                  key={item.labelKey}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={styles._24}
                >
                  {t(item.labelKey)}
                </Link>
              ) : (
                <a
                  key={item.labelKey}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={styles._24}
                >
                  {t(item.labelKey)}
                </a>
              )
            )}
            <div className={styles._25}>
              <button
                onClick={toggleTheme}
                className={styles._26}
                aria-label="Toggle theme"
              >
                {theme === "dark" ? "☀️" : "🌙"}
              </button>
              <button
                onClick={toggleLocale}
                className={styles._27}
              >
                {locale === "vi" ? "EN" : "VI"}
              </button>
            </div>
            <hr className={styles._28} />
            {user ? (
              <div className={styles._29}>
                <span className={styles._30}>
                  {t("auth.hello")}, {user.name || `${user.walletAddress?.slice(0, 6)}...${user.walletAddress?.slice(-4)}`}
                </span>
                <Link
                  href="/admin/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className={styles._31}
                >
                  {t("nav.dashboard")}
                </Link>
                <button
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className={styles._32}
                >
                  {t("nav.logout")}
                </button>
              </div>
            ) : (
              <div className={styles._29}>
                <Link
                  href="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className={styles._33}
                >
                  {t("nav.login")}
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className={styles._31}
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
