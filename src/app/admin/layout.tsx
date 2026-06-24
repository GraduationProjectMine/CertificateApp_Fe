"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/features/auth/components/AuthContext";
import AdminSidebar from "./_components/AdminSidebar";
import AdminTopbar from "./_components/AdminTopbar";
import { LoadingScreen, UnauthorizedScreen } from "./_components/AuthGuard";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || isLoading) return <LoadingScreen />;

  const isAuthorized = user && (user.role === "issuer" || user.role === "sysadmin");
  if (!isAuthorized) return <UnauthorizedScreen />;

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-[#030712] font-sans transition-colors duration-300">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <AdminSidebar
        user={user}
        open={sidebarOpen}
        collapsed={sidebarCollapsed}
        onClose={() => setSidebarOpen(false)}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <AdminTopbar
          user={user}
          onMenuToggle={() => setSidebarOpen(true)}
          onLogout={logout}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto bg-slate-50 dark:bg-slate-950/40">
          {children}
        </main>
      </div>
    </div>
  );
}
