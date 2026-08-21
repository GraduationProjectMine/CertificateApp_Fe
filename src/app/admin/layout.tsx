"use client";
import styles from "./layout.module.css";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/features/auth/components/AuthContext";
import AdminSidebar from "./_components/AdminSidebar";
import AdminTopbar from "./_components/AdminTopbar";
import { LoadingScreen, UnauthorizedScreen } from "./_components/AuthGuard";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isLoggingOut, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || isLoading || isLoggingOut) return <LoadingScreen />;

  const isAuthorized = user && (user.role === "issuer" || user.role === "staff" || user.role === "sysadmin");
  if (!isAuthorized) return <UnauthorizedScreen />;

  return (
    <>
      <div className={styles._1}>
      {sidebarOpen && (
        <div
          className={styles._2}
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

      <div className={styles._3}>
        <AdminTopbar
          user={user}
          onMenuToggle={() => setSidebarOpen(true)}
          onLogout={logout}
        />

        <main className={styles._4}>
          {children}
        </main>
      </div>
    </div>
    </>
  );
}
