"use client";
import React, { useState, useEffect, useCallback } from "react";
import { superAdminApi, type AuditLog, type Paginated } from "@/features/super-admin/services/api";
import toast from "react-hot-toast";

const actions = ["CREATE_CERTIFICATE", "ISSUE_CERTIFICATE", "CREATE_ISSUANCE_BATCH", "REVOKE_CERTIFICATE", "BLOCKCHAIN_TX_FAILED"];
const actionLabels: Record<string, string> = {
  CREATE_CERTIFICATE: "Tạo văn bằng",
  ISSUE_CERTIFICATE: "Cấp văn bằng",
  CREATE_ISSUANCE_BATCH: "Cấp hàng loạt",
  REVOKE_CERTIFICATE: "Thu hồi",
  BLOCKCHAIN_TX_FAILED: "Lỗi blockchain",
};

export default function AuditLogsPage() {
  const [data, setData] = useState<Paginated<AuditLog>>({ items: [], total: 0, page: 1, limit: 20, totalPages: 0 });
  const [page, setPage] = useState(1);
  const [action, setAction] = useState("");
  const [search, setSearch] = useState("");
  const [applied, setApplied] = useState({ action: "", search: "" });
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await superAdminApi.listAuditLogs({ page, limit: 20, ...applied });
      setData(result);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, [page, applied]);

  useEffect(() => { loadData(); }, [loadData]);

  function handleFilter(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    setApplied({ action, search: search.trim() });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Nhật ký hệ thống</h1>
        <p className="text-xs text-gray-500 mt-1">Theo dõi tất cả hoạt động trên toàn hệ thống</p>
      </div>

      <form onSubmit={handleFilter} className="grid gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:grid-cols-3">
        <label className="text-xs font-bold text-gray-600 dark:text-gray-300">
          Hành động
          <select className="mt-1 w-full rounded-xl border border-gray-200 bg-transparent px-3 py-2 text-xs dark:border-gray-700" value={action} onChange={(e) => setAction(e.target.value)}>
            <option value="">Tất cả</option>
            {actions.map((a) => (
              <option key={a} value={a}>{actionLabels[a] || a}</option>
            ))}
          </select>
        </label>
        <label className="text-xs font-bold text-gray-600 dark:text-gray-300">
          Tìm kiếm
          <input className="mt-1 w-full rounded-xl border border-gray-200 bg-transparent px-3 py-2 text-xs dark:border-gray-700" placeholder="Tên, đối tượng..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </label>
        <button className="self-end rounded-xl bg-primary px-4 py-2 text-[10px] font-bold text-white hover:bg-primary-hover transition-colors">
          Lọc
        </button>
      </form>

      {loading ? (
        <div className="text-center py-16 text-gray-400 text-xs">Đang tải...</div>
      ) : (
        <div className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800/60 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200/60 dark:border-gray-800/60">
                  <th className="text-left px-4 py-3 font-bold text-gray-600 dark:text-gray-400">Thời gian</th>
                  <th className="text-left px-4 py-3 font-bold text-gray-600 dark:text-gray-400">Người thực hiện</th>
                  <th className="text-left px-4 py-3 font-bold text-gray-600 dark:text-gray-400">Hành động</th>
                  <th className="text-left px-4 py-3 font-bold text-gray-600 dark:text-gray-400">Đối tượng</th>
                  <th className="text-center px-4 py-3 font-bold text-gray-600 dark:text-gray-400">Kết quả</th>
                  <th className="text-left px-4 py-3 font-bold text-gray-600 dark:text-gray-400">Chi tiết</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((log) => (
                  <tr key={log.id} className="border-b border-gray-100 dark:border-gray-800/40 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                    <td className="px-4 py-3 whitespace-nowrap">{new Date(log.createdAt).toLocaleString("vi-VN")}</td>
                    <td className="px-4 py-3">
                      {log.actorName || "Hệ thống"}
                      <span className="mt-1 block text-[10px] text-gray-400">{log.ipAddress || "—"}</span>
                    </td>
                    <td className="px-4 py-3">{actionLabels[log.action] || log.action}</td>
                    <td className="px-4 py-3">
                      {log.targetType}
                      <span className="mt-1 block max-w-40 truncate font-mono text-[10px] text-gray-400" title={log.targetId || ""}>{log.targetId || "—"}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`font-bold ${log.success ? "text-green-600" : "text-red-500"}`}>
                        {log.success ? "THÀNH CÔNG" : "THẤT BẠI"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="block max-w-xs truncate text-[10px] text-gray-400" title={log.details ? JSON.stringify(log.details) : ""}>
                        {log.details ? JSON.stringify(log.details) : "—"}
                      </span>
                    </td>
                  </tr>
                ))}
                {data.items.length === 0 && (
                  <tr><td className="p-8 text-center text-xs text-gray-400" colSpan={6}>Không có nhật ký phù hợp</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {data.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-100 p-4 text-xs dark:border-gray-800">
              <span>{data.total} bản ghi</span>
              <div className="flex items-center gap-2">
                <button className="rounded-lg border px-3 py-1.5 disabled:opacity-40" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Trước</button>
                <strong>{page}/{data.totalPages}</strong>
                <button className="rounded-lg border px-3 py-1.5 disabled:opacity-40" disabled={page >= data.totalPages} onClick={() => setPage((p) => p + 1)}>Sau</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
