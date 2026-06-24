"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { menuItems } from "./menu-items";
import type { User } from "@/features/auth/types";

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
        ? "Cấp mới (Wizard)"
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
    <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200/50 dark:border-gray-800/50 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30 transition-colors">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-850 md:hidden"
          aria-label="Open sidebar"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>

        <nav className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400">
          <span className="hover:text-primary transition-colors">Cổng trường</span>
          {breadcrumbs.map((crumb) => (
            <React.Fragment key={crumb.href}>
              <span className="text-gray-300 dark:text-gray-700">/</span>
              {crumb.isLast ? (
                <span className="text-gray-800 dark:text-white font-bold">{crumb.title}</span>
              ) : (
                <Link href={crumb.href} className="hover:text-primary transition-colors">
                  {crumb.title}
                </Link>
              )}
            </React.Fragment>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-4">
        {user.loginType === "metamask" ? (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500/5 dark:bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 text-xs font-bold">
            <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 256 238" fill="none">
              <path d="M247.9 104.8l-15-46.7-56-42.5-44.5 59 4.3.4 35.3-32.9L247.9 104.8z" fill="#E2761B"/>
              <path d="M8.1 104.8l15-46.7 56-42.5 44.5 59-4.3.4-35.3-32.9L8.1 104.8z" fill="#E4761B"/>
              <path d="M174.5 130.6l-20.2 38.6-26.3-5-26.3 5-20.2-38.6 30.2 5.5 16.3-26.8 16.3 26.8 30.2-5.5z" fill="#233447"/>
              <path d="M128 221.3l52.5-47.5-31.5-5.7-21 21.2-21-21.2-31.5 5.7 52.5 47.5z" fill="#E2761B"/>
              <path d="M128 75l-16.3 26.8 32.6 0L128 75z" fill="#F6851B"/>
            </svg>
            <span className="hidden sm:inline font-mono">{user.walletAddress?.slice(0, 6)}...{user.walletAddress?.slice(-4)}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/20 border border-teal-200/40 dark:border-teal-900/50 text-primary dark:text-teal-400 text-xs font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
            <span>Email Session</span>
          </div>
        )}

        <button
          className="p-2 rounded-xl text-gray-500 hover:bg-gray-150 dark:hover:bg-gray-850 transition-colors relative"
          aria-label="View notifications"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
          </svg>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-danger animate-ping"></span>
        </button>

        <button
          onClick={onLogout}
          className="px-3 py-2 text-xs font-bold text-gray-700 dark:text-gray-300 hover:text-danger dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 border border-gray-200 dark:border-gray-800 rounded-xl transition-all flex items-center gap-1.5"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 11-6 0v-1m6-9V5a3 3 0 00-6 0v1"></path>
          </svg>
          <span>Thoát</span>
        </button>
      </div>
    </header>
  );
}
