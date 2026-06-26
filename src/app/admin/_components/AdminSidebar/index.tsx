"use client";
import styles from "./AdminSidebar.module.css";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { menuItems } from "../MenuItems";
import type { User } from "@/features/auth/types";

interface AdminSidebarProps {
  user: User;
  open: boolean;
  collapsed: boolean;
  onClose: () => void;
  onToggleCollapse: () => void;
}

export default function AdminSidebar({ user, open, collapsed, onClose, onToggleCollapse }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={`${styles._0} ${
        open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      } ${collapsed ? "md:w-20" : "w-64 md:w-64"}`}
    >
      <div className={styles._1}>
        <Link href="/" className={styles._2}>
          <div className={styles._3}>
            C
          </div>
          {!collapsed && (
            <div className={styles._4}>
              <span className={styles._5}>CertiChain</span>
              <span className={styles._6}>ADMIN CỔNG</span>
            </div>
          )}
        </Link>

        <button
          onClick={onToggleCollapse}
          className={styles._7}
          aria-label="Collapse sidebar"
        >
          <svg
            className={`${styles._20} ${collapsed ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"></path>
          </svg>
        </button>
      </div>

      <nav className={styles._8}>
        {menuItems.map((item) => {
          const isActive = pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              href={item.path}
              onClick={onClose}
              className={`group ${styles._21} ${
                isActive
                  ? "bg-primary text-white shadow-md shadow-primary/10"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/40"
              }`}
            >
              <div className={`${styles._22} ${isActive ? "scale-105" : "group-hover:scale-105"}`}>
                {item.icon}
              </div>
              {!collapsed && <span className={styles._9}>{item.title}</span>}
              {!collapsed && !isActive && (
                <span className={styles._10}></span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className={styles._11}>
        {!collapsed ? (
          <div className={styles._12}>
            <div className={styles._13}>Người sử dụng</div>
            <div className={styles._14}>
              <div className={styles._15}>
                {user.name.charAt(0)}
              </div>
              <div className={styles._16}>
                <span className={styles._17}>{user.name}</span>
                <span className={styles._18}>{user.institutionName || ''}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className={styles._19}>
            <div className={styles._15} title={user.name}>
              {user.name.charAt(0)}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
