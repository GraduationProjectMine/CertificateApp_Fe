"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  superAdminApi, 
  type DashboardStats, 
  type CertificateStats, 
  type SystemHealth, 
  type ActivityItem 
} from "@/features/super-admin/services/api";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from "recharts";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [certStats, setCertStats] = useState<CertificateStats | null>(null);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true);
      try {
        const [statsData, certStatsData, healthData, activitiesData] = await Promise.all([
          superAdminApi.dashboard(),
          superAdminApi.getCertificateStats(),
          superAdminApi.getSystemHealth(),
          superAdminApi.getRecentActivity(),
        ]);
        setStats(statsData);
        setCertStats(certStatsData);
        setHealth(healthData);
        setActivities(activitiesData);
      } catch (err: any) {
        setError(err.message || "Không thể tải dữ liệu phân tích hệ thống");
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  // Format chart data
  const pieData = certStats ? [
    { name: "Draft", value: certStats.statusDistribution.draft },
    { name: "Pending", value: certStats.statusDistribution.pending },
    { name: "Issued", value: certStats.statusDistribution.issued },
    { name: "Revoked", value: certStats.statusDistribution.revoked },
    { name: "Revoke Failed", value: certStats.statusDistribution.revokeFailed },
  ].filter(d => d.value > 0) : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
            Dashboard Hệ Thống
          </h1>
          <p className="text-xs text-gray-500 mt-1">Phân tích chuyên sâu & Giám sát hạ tầng CertiChain</p>
        </div>
        
        {/* Status indicators */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-xs dark:border-gray-800 dark:bg-gray-900 shadow-sm">
            <span className={`h-2.5 w-2.5 rounded-full ${health?.blockchain.connected ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`} />
            <span className="font-semibold text-[11px] text-gray-600 dark:text-gray-400">
              Blockchain: {health?.blockchain.connected ? "CONNECTED" : "DISCONNECTED"}
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-xs text-red-600 dark:bg-red-950/20">
          {error}
        </div>
      )}

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Tổ Chức Phát Hành"
          value={loading ? "..." : String(stats?.organizations.total ?? 0)}
          subtitle={`${stats?.organizations.pending ?? 0} yêu cầu đang chờ duyệt`}
          color="border-l-blue-500 bg-blue-500/5 text-blue-500"
          loading={loading}
        />
        <StatCard
          title="Tổng Số Văn Bằng"
          value={loading ? "..." : String(stats?.certificates.total ?? 0)}
          subtitle={`${stats?.certificates.issued ?? 0} đã đẩy lên blockchain`}
          color="border-l-emerald-500 bg-emerald-500/5 text-emerald-500"
          loading={loading}
        />
        <StatCard
          title="Tài Khoản Nhân Viên"
          value={loading ? "..." : String(stats?.users.staff ?? 0)}
          subtitle={`Phát hành bởi các tổ chức`}
          color="border-l-amber-500 bg-amber-500/5 text-amber-500"
          loading={loading}
        />
        <StatCard
          title="Tài Khoản Sinh Viên"
          value={loading ? "..." : String(stats?.users.students ?? 0)}
          subtitle={`Sinh viên có thể tra cứu`}
          color="border-l-violet-500 bg-violet-500/5 text-violet-500"
          loading={loading}
        />
      </div>

      {/* Main Charts & Health Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Trends and Performance */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Chart Card */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h3 className="text-xs font-black text-gray-800 dark:text-gray-200 uppercase tracking-wider mb-4">
              Thống kê cấp phát & thu hồi văn bằng (12 tháng)
            </h3>
            <div className="h-72 w-full">
              {!loading && certStats && certStats.monthly.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={certStats.monthly}>
                    <defs>
                      <linearGradient id="colorIssued" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorRevoked" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '12px' }} />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Area type="monotone" name="Cấp phát" dataKey="issued" stroke="#10b981" fillOpacity={1} fill="url(#colorIssued)" />
                    <Area type="monotone" name="Thu hồi" dataKey="revoked" stroke="#ef4444" fillOpacity={1} fill="url(#colorRevoked)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-gray-400">
                  Không đủ dữ liệu hoặc đang tải dữ liệu biểu đồ...
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Status Distribution (Pie Chart) */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <h3 className="text-xs font-black text-gray-800 dark:text-gray-200 uppercase tracking-wider mb-4">
                Phân bố Trạng Thái Văn Bằng
              </h3>
              <div className="h-56 w-full flex items-center justify-center">
                {!loading && pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} văn bằng`]} contentStyle={{ fontSize: '11px', borderRadius: '12px' }} />
                      <Legend wrapperStyle={{ fontSize: '10px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-xs text-gray-400">Không có dữ liệu văn bằng</div>
                )}
              </div>
            </div>

            {/* Top Orgs */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <h3 className="text-xs font-black text-gray-800 dark:text-gray-200 uppercase tracking-wider mb-4">
                Đơn Vị Cấp Bằng Hàng Đầu
              </h3>
              <div className="space-y-4">
                {!loading && certStats?.topOrganizations && certStats.topOrganizations.length > 0 ? (
                  certStats.topOrganizations.map((org, index) => (
                    <div key={org.organization_id} className="flex items-center justify-between border-b border-gray-50 pb-2 dark:border-gray-800/40 last:border-0 last:pb-0">
                      <div className="flex items-center gap-2 truncate">
                        <span className="flex h-5 w-5 items-center justify-center rounded bg-gray-100 text-[10px] font-bold text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                          {index + 1}
                        </span>
                        <p className="text-xs font-bold truncate max-w-[150px]">{org.organization_name}</p>
                      </div>
                      <span className="text-xs font-bold text-gray-500 bg-gray-50 px-2 py-0.5 rounded dark:bg-gray-800 dark:text-gray-400 shrink-0">
                        {org.count} bằng
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-gray-400 text-center py-6">Không có dữ liệu tổ chức</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: System Health & Activity Feed */}
        <div className="space-y-6">
          
          {/* Blockchain Node details */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h3 className="text-xs font-black text-gray-800 dark:text-gray-200 uppercase tracking-wider mb-4">
              Hạ Tầng Blockchain (Local Node)
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between border-b border-gray-50 pb-2 dark:border-gray-800/20">
                <span className="text-gray-400">Trạng thái:</span>
                <span className={`font-bold ${health?.blockchain.connected ? "text-emerald-500" : "text-red-500"}`}>
                  {health?.blockchain.connected ? "Hoạt động" : "Mất kết nối"}
                </span>
              </div>
              <div className="flex justify-between border-b border-gray-50 pb-2 dark:border-gray-800/20">
                <span className="text-gray-400">Mạng:</span>
                <span className="font-semibold text-gray-700 dark:text-gray-300">{health?.blockchain.network || "localhost"}</span>
              </div>
              <div className="flex justify-between border-b border-gray-50 pb-2 dark:border-gray-800/20">
                <span className="text-gray-400">Block Number:</span>
                <span className="font-mono font-bold text-gray-700 dark:text-gray-300">{health?.blockchain.blockNumber ?? "—"}</span>
              </div>
              <div className="flex justify-between border-b border-gray-50 pb-2 dark:border-gray-800/20">
                <span className="text-gray-400">Contract Address:</span>
                <span className="font-mono text-[9px] text-gray-500 truncate max-w-[130px]" title={health?.blockchain.contractAddress || ""}>
                  {health?.blockchain.contractAddress ? health.blockchain.contractAddress.substring(0, 10) + '...' : "—"}
                </span>
              </div>
              <div className="flex justify-between border-b border-gray-50 pb-2 dark:border-gray-800/20">
                <span className="text-gray-400">Admin Wallet:</span>
                <span className="font-mono text-[9px] text-gray-500 truncate max-w-[130px]" title={health?.blockchain.walletAddress || ""}>
                  {health?.blockchain.walletAddress ? health.blockchain.walletAddress.substring(0, 10) + '...' : "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Admin Balance:</span>
                <span className="font-bold text-gray-700 dark:text-gray-300">{health?.blockchain.walletBalance ? `${Number(health.blockchain.walletBalance).toFixed(4)} ETH` : "—"}</span>
              </div>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h3 className="text-xs font-black text-gray-800 dark:text-gray-200 uppercase tracking-wider mb-4">
              Nhật Ký Hoạt Động Hệ Thống
            </h3>
            <div className="flow-root">
              <ul className="-mb-8">
                {activities.length > 0 ? (
                  activities.map((act, index) => (
                    <li key={index}>
                      <div className="relative pb-6">
                        {index !== activities.length - 1 && (
                          <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-800" aria-hidden="true" />
                        )}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white dark:ring-gray-900 ${
                              act.type.includes("issued") ? "bg-emerald-500/10 text-emerald-600" :
                              act.type.includes("revoked") ? "bg-red-500/10 text-red-600" :
                              act.type.includes("org") ? "bg-blue-500/10 text-blue-600" : "bg-gray-100 text-gray-500"
                            }`}>
                              {act.type.includes("issued") && (
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                              )}
                              {act.type.includes("revoked") && (
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                              )}
                              {act.type.includes("org") && (
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                              )}
                              {act.type.includes("audit") && (
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                              )}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0 pt-1.5">
                            <p className="text-xs font-bold text-gray-800 dark:text-gray-200">{act.title}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">{act.subtitle}</p>
                          </div>
                          <div className="text-right text-[10px] whitespace-nowrap text-gray-400 pt-2 shrink-0">
                            {new Date(act.timestamp).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    </li>
                  ))
                ) : (
                  <div className="text-xs text-gray-400 text-center py-6">Không có hoạt động mới</div>
                )}
              </ul>
            </div>
          </div>
        </div>
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
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{title}</p>
          <p className="text-2xl font-black mt-1 text-gray-900 dark:text-white">{value}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">{subtitle}</p>
        </>
      )}
    </div>
  );
}
