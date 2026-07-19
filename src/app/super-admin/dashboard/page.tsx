"use client";
import styles from "./page.module.css";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { superAdminApi, type DashboardStats } from "@/features/super-admin/services/api";

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    superAdminApi.dashboard()
      .then(setStats)
      .catch((err) => setError(err.message || "Không thể tải dữ liệu"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
          Quản trị hệ thống
        </h1>
        <p className="text-xs text-gray-500 mt-1">Tổng quan toàn bộ hệ thống CertiChain</p>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-xs text-red-600 dark:bg-red-950/20">
          {error}
        </div>
      )}

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Tổ chức"
          value={loading ? "..." : String(stats?.organizations.total ?? 0)}
          subtitle={`${stats?.organizations.pending ?? 0} chờ duyệt`}
          color="border-l-primary bg-primary/5"
          loading={loading}
        />
        <StatCard
          title="Văn bằng"
          value={loading ? "..." : String(stats?.certificates.total ?? 0)}
          subtitle={`${stats?.certificates.issued ?? 0} đã cấp`}
          color="border-l-teal-600 bg-teal-500/5"
          loading={loading}
        />
        <StatCard
          title="Người dùng"
          value={loading ? "..." : String(stats?.users.total ?? 0)}
          subtitle={`${stats?.users.staff ?? 0} nhân viên · ${stats?.users.students ?? 0} SV`}
          color="border-l-amber-500 bg-amber-500/5"
          loading={loading}
        />
        <StatCard
          title="Đang chờ"
          value={loading ? "..." : String(stats?.certificates.pending ?? 0)}
          subtitle={stats?.certificates.pending ? "Yêu cầu xử lý" : "Không có"}
          color="border-l-red-500 bg-red-500/5"
          loading={loading}
        />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/super-admin/pending"
          className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-all dark:border-gray-800 dark:bg-gray-900"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-bold">Phê duyệt tổ chức</p>
            <p className="text-[10px] text-gray-400">{stats?.organizations.pending ?? 0} chờ duyệt</p>
          </div>
        </Link>

        <Link
          href="/super-admin/organizations"
          className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-all dark:border-gray-800 dark:bg-gray-900"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10">
            <svg className="h-5 w-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-bold">Quản lý tổ chức</p>
            <p className="text-[10px] text-gray-400">{stats?.organizations.total ?? 0} tổ chức</p>
          </div>
        </Link>

        <Link
          href="/super-admin/audit-logs"
          className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-all dark:border-gray-800 dark:bg-gray-900"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
            <svg className="h-5 w-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-bold">Nhật ký hệ thống</p>
            <p className="text-[10px] text-gray-400">Theo dõi hoạt động</p>
          </div>
        </Link>
      </div>
    </div>
  );
}

function StatCard({
  title, value, subtitle, color, loading,
}: {
  title: string; value: string; subtitle: string; color: string; loading: boolean;
}) {
  return (
    <div className={`rounded-2xl border-l-4 ${color} border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900`}>
      {loading ? (
        <div className="animate-pulse space-y-2">
          <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-7 w-12 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      ) : (
        <>
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">{title}</p>
          <p className="text-2xl font-black mt-1">{value}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">{subtitle}</p>
        </>
      )}
    </div>
  );
}
