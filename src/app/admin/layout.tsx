"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../../features/auth/components/AuthContext";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Menu items config matching the user stories
  const menuItems = [
    {
      title: "Bảng điều khiển",
      path: "/admin/dashboard",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z"></path>
        </svg>
      )
    },
    {
      title: "Sinh viên",
      path: "/admin/students",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
        </svg>
      )
    },
    {
      title: "Văn bằng đã cấp",
      path: "/admin/credentials",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
        </svg>
      )
    },
    {
      title: "Cấp bằng mới",
      path: "/admin/credentials/create",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      )
    },
    {
      title: "Mẫu văn bằng",
      path: "/admin/templates",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"></path>
        </svg>
      )
    },
    {
      title: "Lô cấp phát",
      path: "/admin/batches",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
        </svg>
      )
    },
    {
      title: "Thu hồi bằng",
      path: "/admin/revocations",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      )
    },
    {
      title: "Giám sát Web3",
      path: "/admin/blockchain",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
        </svg>
      )
    },
    {
      title: "Hoạt động (Audit)",
      path: "/admin/audit-logs",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      )
    },
    {
      title: "Cài đặt",
      path: "/admin/settings",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
        </svg>
      )
    }
  ];

  // Helper to parse pathname into a readable breadcrumb
  const getBreadcrumbs = () => {
    const segments = pathname.split("/").filter(Boolean);
    return segments.map((segment, index) => {
      const href = "/" + segments.slice(0, index + 1).join("/");
      const item = menuItems.find((m) => m.path === href) || { title: segment };
      const displayTitle = 
        segment === "admin" 
          ? "Quản trị" 
          : segment === "credentials" 
          ? "Văn bằng" 
          : segment === "create" 
          ? "Cấp mới (Wizard)" 
          : item.title;
      
      return {
        title: displayTitle.charAt(0).toUpperCase() + displayTitle.slice(1),
        href,
        isLast: index === segments.length - 1
      };
    });
  };

  const breadcrumbs = getBreadcrumbs();
  const currentItem = menuItems.find((item) => pathname.startsWith(item.path)) || menuItems[0];

  // Guard loading state
  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-gray-950 flex flex-col items-center justify-center">
        <svg className="animate-spin h-10 w-10 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="text-xs font-semibold text-gray-500 mt-4 select-none">Đang tải cấu hình cổng quản trị...</span>
      </div>
    );
  }

  // Auth Guard Verification: only 'issuer' and 'sysadmin' allowed
  const isAuthorized = user && (user.role === "issuer" || user.role === "sysadmin");

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-gray-950 flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-950/30 text-danger rounded-full flex items-center justify-center mb-6">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m0-8v6m0 5h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">Truy Cập Bị Chặn</h1>
        <p className="max-w-md text-sm text-gray-500 dark:text-gray-400 mt-3 leading-relaxed">
          Tài khoản đăng nhập hiện tại không thuộc nhóm quản lý nhà trường. Bạn cần đăng nhập bằng tài khoản HUST Admin hoặc ví MetaMask có thẩm quyền.
        </p>
        <div className="flex gap-4 mt-8">
          <Link
            href="/auth/login"
            className="px-6 py-3 text-xs font-bold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-md transition-all select-none"
          >
            Đăng nhập lại
          </Link>
          <Link
            href="/"
            className="px-6 py-3 text-xs font-bold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl transition-all select-none"
          >
            Quay về trang chủ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-[#030712] font-sans transition-colors duration-300">
      
      {/* 1. Backdrop Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* 2. Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col bg-slate-900 text-slate-300 border-r border-slate-800/80 transition-all duration-300 md:static ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } ${sidebarCollapsed ? "md:w-20" : "w-64 md:w-64"}`}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800/50">
          <Link href="/" className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-bold text-base flex-shrink-0">
              C
            </div>
            {!sidebarCollapsed && (
              <div className="flex flex-col">
                <span className="font-bold text-sm tracking-wide text-white block">CertiChain</span>
                <span className="text-[9px] text-teal-400 font-semibold tracking-wider block leading-none">ADMIN CỔNG</span>
              </div>
            )}
          </Link>
          
          {/* Collapse toggle (Desktop only) */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden md:flex p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Collapse sidebar"
          >
            <svg
              className={`w-4 h-4 transform transition-transform ${sidebarCollapsed ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"></path>
            </svg>
          </button>
        </div>

        {/* Sidebar Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => {
            const isActive = pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3.5 px-3.5 py-3.5 rounded-xl text-xs font-semibold tracking-wide transition-all group select-none ${
                  isActive
                    ? "bg-primary text-white shadow-md shadow-primary/10"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/40"
                }`}
              >
                <div className={`flex-shrink-0 transition-transform duration-300 ${isActive ? "scale-105" : "group-hover:scale-105"}`}>
                  {item.icon}
                </div>
                {!sidebarCollapsed && <span className="truncate">{item.title}</span>}
                {!sidebarCollapsed && !isActive && (
                  <span className="ml-auto w-1 h-1 rounded-full bg-transparent group-hover:bg-slate-500"></span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer Account Status */}
        <div className="p-4 border-t border-slate-800/50 bg-slate-950/20">
          {!sidebarCollapsed ? (
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

      {/* 3. Main Page Layout */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        
        {/* Topbar Panel */}
        <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200/50 dark:border-gray-800/50 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30 transition-colors">
          {/* Topbar Left ( Hamburger + Breadcrumbs ) */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-850 md:hidden"
              aria-label="Open sidebar"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>

            {/* Breadcrumb path indicator */}
            <nav className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400">
              <span className="hover:text-primary transition-colors">Cổng trường</span>
              {breadcrumbs.map((crumb, idx) => (
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

          {/* Topbar Right ( Metamask Indicator + Notification + Profile ) */}
          <div className="flex items-center gap-4">
            {/* MetaMask Badge Status */}
            {user.loginType === "metamask" ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500/5 dark:bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 text-xs font-bold">
                <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 256 238" fill="none" xmlns="http://www.w3.org/2000/svg">
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

            {/* Notification Drawer trigger (mock) */}
            <button
              className="p-2 rounded-xl text-gray-500 hover:bg-gray-150 dark:hover:bg-gray-850 transition-colors relative"
              aria-label="View notifications"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
              </svg>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-danger animate-ping"></span>
            </button>

            {/* Profile trigger & signout button */}
            <button
              onClick={logout}
              className="px-3 py-2 text-xs font-bold text-gray-700 dark:text-gray-300 hover:text-danger dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 border border-gray-200 dark:border-gray-800 rounded-xl transition-all flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 11-6 0v-1m6-9V5a3 3 0 00-6 0v1"></path>
              </svg>
              <span>Thoát</span>
            </button>
          </div>
        </header>

        {/* Dynamic Nested Page Content Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto bg-slate-50 dark:bg-slate-950/40">
          {children}
        </main>
      </div>
    </div>
  );
}
