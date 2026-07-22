"use client";
import React, { useState, useEffect } from "react";
import { superAdminApi, type CertificateStats } from "@/features/super-admin/services/api";
import toast from "react-hot-toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function ReportsPage() {
  const [stats, setStats] = useState<CertificateStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState<string | null>(null);

  useEffect(() => {
    superAdminApi.getCertificateStats()
      .then(setStats)
      .catch((err) => toast.error(err.message || "Không thể tải báo cáo thống kê"))
      .finally(() => setLoading(false));
  }, []);

  const downloadCsv = async (endpoint: string, filename: string) => {
    setExporting(endpoint);
    try {
      const token = localStorage.getItem("token");
      const headers: HeadersInit = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_URL}/super-admin/export/${endpoint}`, { headers });
      if (!res.ok) {
        throw new Error(`Tải tệp lỗi: HTTP ${res.status}`);
      }

      const text = await res.text();
      const blob = new Blob([text], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`Xuất dữ liệu ${filename} thành công`);
    } catch (err: any) {
      toast.error(err.message || "Xuất dữ liệu thất bại");
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Báo cáo & Xuất dữ liệu</h1>
        <p className="text-xs text-gray-500 mt-1">Xuất báo cáo định dạng CSV và xem phân tích thống kê toàn hệ thống</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Export options */}
        <div className="lg:col-span-1 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 space-y-4 h-fit">
          <h2 className="text-xs font-black text-gray-800 dark:text-gray-200 uppercase tracking-wider">Xuất dữ liệu thô</h2>
          <p className="text-[11px] text-gray-400">Xuất dữ liệu dạng CSV hỗ trợ đầy đủ font UTF-8 tiếng Việt mở trên Excel.</p>
          
          <div className="space-y-3">
            <button
              onClick={() => downloadCsv("organizations", "organizations.csv")}
              disabled={exporting !== null}
              className="w-full flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3 text-left hover:bg-gray-50 transition text-xs font-semibold"
            >
              <span>Tổ chức cấp bằng (.csv)</span>
              <span className="text-[10px] text-primary font-bold">
                {exporting === "organizations" ? "Đang xuất..." : "Xuất file 📁"}
              </span>
            </button>

            <button
              onClick={() => downloadCsv("certificates", "certificates.csv")}
              disabled={exporting !== null}
              className="w-full flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3 text-left hover:bg-gray-50 transition text-xs font-semibold"
            >
              <span>Văn bằng chứng chỉ (.csv)</span>
              <span className="text-[10px] text-primary font-bold">
                {exporting === "certificates" ? "Đang xuất..." : "Xuất file 📁"}
              </span>
            </button>

            <button
              onClick={() => downloadCsv("users", "users.csv")}
              disabled={exporting !== null}
              className="w-full flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3 text-left hover:bg-gray-50 transition text-xs font-semibold"
            >
              <span>Người dùng hệ thống (.csv)</span>
              <span className="text-[10px] text-primary font-bold">
                {exporting === "users" ? "Đang xuất..." : "Xuất file 📁"}
              </span>
            </button>
          </div>
        </div>

        {/* Statistical Overview */}
        <div className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 space-y-4">
          <h2 className="text-xs font-black text-gray-800 dark:text-gray-200 uppercase tracking-wider">Tình trạng phân phối văn bằng</h2>
          {loading ? (
            <div className="text-center py-6 text-gray-400 text-xs">Đang tải thống kê...</div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl dark:bg-gray-800/40 text-center">
                  <span className="block text-[10px] font-bold text-gray-400 uppercase">Đã cấp phát</span>
                  <span className="text-xl font-black text-emerald-600 mt-1 block">
                    {stats?.statusDistribution.issued ?? 0}
                  </span>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl dark:bg-gray-800/40 text-center">
                  <span className="block text-[10px] font-bold text-gray-400 uppercase">Đang chờ</span>
                  <span className="text-xl font-black text-amber-500 mt-1 block">
                    {stats?.statusDistribution.pending ?? 0}
                  </span>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl dark:bg-gray-800/40 text-center">
                  <span className="block text-[10px] font-bold text-gray-400 uppercase">Đã thu hồi</span>
                  <span className="text-xl font-black text-red-500 mt-1 block">
                    {stats?.statusDistribution.revoked ?? 0}
                  </span>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl dark:bg-gray-800/40 text-center">
                  <span className="block text-[10px] font-bold text-gray-400 uppercase">Tổng cộng</span>
                  <span className="text-xl font-black text-gray-800 dark:text-white mt-1 block">
                    {stats?.statusDistribution.total ?? 0}
                  </span>
                </div>
              </div>

              {/* Organization chart list */}
              <div className="space-y-3 pt-3">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Top 5 trường cấp bằng nhiều nhất</h3>
                <div className="space-y-2">
                  {stats?.topOrganizations.map((org) => {
                    const pct = stats.statusDistribution.total > 0 
                      ? (org.count / stats.statusDistribution.total) * 100 
                      : 0;
                    return (
                      <div key={org.organization_id} className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="font-bold">{org.organization_name}</span>
                          <span className="font-semibold text-gray-500">{org.count} văn bằng ({pct.toFixed(1)}%)</span>
                        </div>
                        <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
