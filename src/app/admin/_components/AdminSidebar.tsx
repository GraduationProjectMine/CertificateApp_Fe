"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { menuItems } from "./menu-items";
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
      className={`fixed inset-y-0 left-0 z-40 flex flex-col bg-slate-900 text-slate-300 border-r border-slate-800/80 transition-all duration-300 md:static ${
        open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      } ${collapsed ? "md:w-20" : "w-64 md:w-64"}`}
    >
      <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800/50">
        <Link href="/" className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-bold text-base flex-shrink-0">
            C
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-sm tracking-wide text-white block">CertiChain</span>
              <span className="text-[9px] text-teal-400 font-semibold tracking-wider block leading-none">ADMIN CỔNG</span>
            </div>
          )}
        </Link>

        <button
          onClick={onToggleCollapse}
          className="hidden md:flex p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Collapse sidebar"
        >
          <svg
            className={`w-4 h-4 transform transition-transform ${collapsed ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"></path>
          </svg>
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => {
          const isActive = pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              href={item.path}
              onClick={onClose}
              className={`flex items-center gap-3.5 px-3.5 py-3.5 rounded-xl text-xs font-semibold tracking-wide transition-all group select-none ${
                isActive
                  ? "bg-primary text-white shadow-md shadow-primary/10"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/40"
              }`}
            >
              <div className={`flex-shrink-0 transition-transform duration-300 ${isActive ? "scale-105" : "group-hover:scale-105"}`}>
                {item.icon}
              </div>
              {!collapsed && <span className="truncate">{item.title}</span>}
              {!collapsed && !isActive && (
                <span className="ml-auto w-1 h-1 rounded-full bg-transparent group-hover:bg-slate-500"></span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800/50 bg-slate-950/20">
        {!collapsed ? (
          <div className="flex flex-col gap-2">
            <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Người sử dụng</div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-teal-400">
                {user.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <span className="block text-xs font-bold text-white truncate">{user.name}</span>
                <span className="block text-[9px] text-slate-500 truncate">{user.institutionName || ''}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-teal-400" title={user.name}>
              {user.name.charAt(0)}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
