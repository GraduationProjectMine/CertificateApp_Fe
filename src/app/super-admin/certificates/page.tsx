"use client";
import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { superAdminApi, type CertificateSummary, type Paginated } from "@/features/super-admin/services/api";

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-600",
  PENDING: "bg-amber-50 text-amber-700",
  ISSUED: "bg-emerald-50 text-emerald-700",
  REVOKED: "bg-red-50 text-red-700",
  REVOKE_FAILED: "bg-orange-50 text-orange-700",
  REVOKE_PENDING: "bg-yellow-50 text-yellow-700",
};

const STATUS_OPTIONS = ["", "DRAFT", "PENDING", "ISSUED", "REVOKED", "REVOKE_FAILED"];

export default function CertificatesPage() {
  const [data, setData] = useState<Paginated<CertificateSummary>>({ items: [], total: 0, page: 1, limit: 20, totalPages: 0 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await superAdminApi.listCertificates({
        page,
        limit: 15,
        search: appliedSearch || undefined,
        status: statusFilter || undefined,
      });
      setData(result);
    } catch {
      /* toast or ignore */
    } finally {
      setLoading(false);
    }
  }, [page, appliedSearch, statusFilter]);

  useEffect(() => { loadData(); }, [loadData]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    setAppliedSearch(search.trim());
  }

  function shortHash(hash: string | null) {
    if (!hash) return "—";
    return hash.substring(0, 8) + "…" + hash.substring(hash.length - 6);
  }

  function formatDate(iso: string | null) {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
          Quản lý Văn bằng
        </h1>
        <p className="text-xs text-gray-500 mt-1">Tất cả văn bằng trong hệ thống CertiChain</p>
      </div>

      {/* Filters */}
      <form onSubmit={handleSearch} className="flex flex-wrap gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <input
          className="flex-1 min-w-[200px] rounded-xl border border-gray-200 bg-transparent px-3 py-2 text-xs dark:border-gray-700"
          placeholder="Tìm kiếm theo tên, sinh viên, số hiệu, tổ chức..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="rounded-xl border border-gray-200 bg-transparent px-3 py-2 text-xs dark:border-gray-700"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
        >
          <option value="">Tất cả trạng thái</option>
          {STATUS_OPTIONS.filter(Boolean).map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <button className="rounded-xl bg-primary px-4 py-2 text-[10px] font-bold text-white hover:bg-primary-hover transition-colors">
          Tìm kiếm
        </button>
      </form>

      {loading ? (
        <div className="text-center py-16 text-gray-400 text-xs">Đang tải...</div>
      ) : data.items.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">Không tìm thấy văn bằng nào</div>
      ) : (
        <div className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800/60 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200/60 dark:border-gray-800/60">
                <th className="text-left px-4 py-3 font-bold text-gray-600 dark:text-gray-400">Tên văn bằng</th>
                <th className="text-left px-4 py-3 font-bold text-gray-600 dark:text-gray-400">Sinh viên</th>
                <th className="text-left px-4 py-3 font-bold text-gray-600 dark:text-gray-400">Tổ chức</th>
                <th className="text-center px-4 py-3 font-bold text-gray-600 dark:text-gray-400">Số hiệu</th>
                <th className="text-center px-4 py-3 font-bold text-gray-600 dark:text-gray-400">Trạng thái</th>
                <th className="text-center px-4 py-3 font-bold text-gray-600 dark:text-gray-400">Tx Hash</th>
                <th className="text-center px-4 py-3 font-bold text-gray-600 dark:text-gray-400">Ngày cấp</th>
                <th className="text-right px-4 py-3 font-bold text-gray-600 dark:text-gray-400">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((cert) => (
                <tr key={cert.certificate_id} className="border-b border-gray-100 dark:border-gray-800/40 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                  <td className="px-4 py-3 font-semibold max-w-[200px] truncate">{cert.certificate_title}</td>
                  <td className="px-4 py-3 text-gray-500">{cert.student_fullName}</td>
                  <td className="px-4 py-3 text-gray-500 max-w-[140px] truncate">{cert.organization_name}</td>
                  <td className="px-4 py-3 text-center font-mono text-gray-400">{cert.serialNumber || "—"}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${STATUS_COLORS[cert.status] || "bg-gray-100 text-gray-600"}`}>
                      {cert.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center font-mono text-[10px] text-gray-400">{shortHash(cert.tx_hash)}</td>
                  <td className="px-4 py-3 text-center text-gray-400">{formatDate(cert.issuedAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/super-admin/certificates/${cert.certificate_id}`} className="text-[10px] text-primary font-bold hover:underline">
                      Chi tiết
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-100 p-4 text-xs dark:border-gray-800">
              <span>{data.total} văn bằng</span>
              <div className="flex items-center gap-2">
                <button
                  className="rounded-lg border px-3 py-1.5 disabled:opacity-40"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Trước
                </button>
                <strong>{page}/{data.totalPages}</strong>
                <button
                  className="rounded-lg border px-3 py-1.5 disabled:opacity-40"
                  disabled={page >= data.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
