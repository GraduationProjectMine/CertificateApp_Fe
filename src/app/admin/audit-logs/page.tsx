"use client";

import React, { useCallback, useEffect, useState } from "react";
import styles from "./page.module.css";
import { operationsApi, type AuditLog, type Paginated } from "@/features/admin/services/operations.api";

const actions = ["CREATE_CERTIFICATE", "ISSUE_CERTIFICATE", "CREATE_ISSUANCE_BATCH", "REVOKE_CERTIFICATE", "BLOCKCHAIN_TX_FAILED"];
const actionLabels: Record<string, string> = {
  CREATE_CERTIFICATE: "Tạo văn bằng",
  ISSUE_CERTIFICATE: "Cấp văn bằng",
  CREATE_ISSUANCE_BATCH: "Cấp hàng loạt",
  REVOKE_CERTIFICATE: "Thu hồi",
  BLOCKCHAIN_TX_FAILED: "Lỗi blockchain",
};

export default function AdminAuditLogsPage() {
  const [data, setData] = useState<Paginated<AuditLog>>({ items: [], total: 0, page: 1, limit: 20, totalPages: 0 });
  const [page, setPage] = useState(1);
  const [action, setAction] = useState("");
  const [actor, setActor] = useState("");
  const [search, setSearch] = useState("");
  const [applied, setApplied] = useState({ action: "", actor: "", search: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setData(await operationsApi.auditLogs({ page, limit: 20, ...applied }));
    } catch (err) { setError(err instanceof Error ? err.message : "Không thể tải audit log"); }
    finally { setLoading(false); }
  }, [page, applied]);
  useEffect(() => { void load(); }, [load]);

  function applyFilters(event: React.FormEvent) {
    event.preventDefault();
    setPage(1);
    setApplied({ action, actor: actor.trim(), search: search.trim() });
  }

  return (
    <div className={styles._1}>
      <div><h1 className={styles._2}>Nhật ký hoạt động (Audit Logs)</h1><p className={styles._3}>Dòng thời gian bất biến của thao tác cấp phát, blockchain và thu hồi.</p></div>
      <form className="grid gap-3 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:grid-cols-4" onSubmit={applyFilters}>
        <label className="text-xs font-bold text-gray-600 dark:text-gray-300">Hành động<select className="mt-1 w-full rounded-xl border border-gray-200 bg-transparent px-3 py-2.5 font-normal dark:border-gray-700" value={action} onChange={(event) => setAction(event.target.value)}><option value="">Tất cả</option>{actions.map((item) => <option key={item} value={item}>{actionLabels[item] || item}</option>)}</select></label>
        <label className="text-xs font-bold text-gray-600 dark:text-gray-300">Người thực hiện<input className="mt-1 w-full rounded-xl border border-gray-200 bg-transparent px-3 py-2.5 font-normal dark:border-gray-700" placeholder="Tên hoặc ID" value={actor} onChange={(event) => setActor(event.target.value)} /></label>
        <label className="text-xs font-bold text-gray-600 dark:text-gray-300">Đối tượng<input className="mt-1 w-full rounded-xl border border-gray-200 bg-transparent px-3 py-2.5 font-normal dark:border-gray-700" placeholder="Mã văn bằng/lô" value={search} onChange={(event) => setSearch(event.target.value)} /></label>
        <button className="self-end rounded-xl bg-teal-600 px-4 py-2.5 text-xs font-bold text-white">Lọc nhật ký</button>
      </form>
      {error && <div role="alert" className="rounded-xl bg-red-50 p-4 text-xs font-semibold text-red-600">{error}</div>}

      <div className={styles._4}><div className={styles._5}><table className={styles._6}><thead className={styles._7}><tr><th className={styles._8}>Thời gian</th><th className={styles._8}>Người thực hiện</th><th className={styles._8}>Hành động</th><th className={styles._8}>Đối tượng</th><th className={styles._8}>Kết quả</th><th className={styles._8}>Chi tiết</th></tr></thead><tbody className={styles._9}>
        {data.items.map((log) => <tr className={styles._10} key={log.id}><td className={styles._11}>{new Date(log.createdAt).toLocaleString("vi-VN")}</td><td className={styles._12}>{log.actorName || "Hệ thống"}<span className="mt-1 block text-[10px] font-normal text-gray-400 dark:text-gray-500">{log.ipAddress || "—"}</span></td><td className={styles._13}>{actionLabels[log.action] || log.action}</td><td className={styles._11}>{log.targetType}<span className="mt-1 block max-w-40 truncate font-mono text-[10px] text-gray-400 dark:text-gray-500" title={log.targetId || ""}>{log.targetId || "—"}</span></td><td className={`p-4 font-bold ${log.success ? "text-green-600" : "text-red-500"}`}>{log.success ? "THÀNH CÔNG" : "THẤT BẠI"}</td><td className={styles._14}><span className="block max-w-xs truncate" title={log.details ? JSON.stringify(log.details) : ""}>{log.details ? JSON.stringify(log.details) : "—"}</span></td></tr>)}
        {!loading && data.items.length === 0 && <tr><td className="p-8 text-center text-xs text-gray-400 dark:text-gray-500" colSpan={6}>Không có nhật ký phù hợp.</td></tr>}
        {loading && <tr><td className="p-8 text-center text-xs text-gray-400 dark:text-gray-500" colSpan={6}>Đang tải...</td></tr>}
      </tbody></table></div><div className="flex items-center justify-between border-t border-gray-100 p-4 text-xs dark:border-gray-800"><span>{data.total} bản ghi</span><div className="flex items-center gap-2"><button className="rounded-lg border px-3 py-1.5 disabled:opacity-40" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>Trước</button><strong>{page}/{Math.max(1, data.totalPages)}</strong><button className="rounded-lg border px-3 py-1.5 disabled:opacity-40" disabled={page >= data.totalPages} onClick={() => setPage((value) => value + 1)}>Sau</button></div></div></div>
    </div>
  );
}
