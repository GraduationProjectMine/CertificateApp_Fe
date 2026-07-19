"use client";
import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { superAdminApi, type Organization, type Paginated } from "@/features/super-admin/services/api";
import toast from "react-hot-toast";

export default function OrganizationsPage() {
  const [data, setData] = useState<Paginated<Organization>>({ items: [], total: 0, page: 1, limit: 20, totalPages: 0 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await superAdminApi.listOrganizations({
        page,
        limit: 15,
        search: appliedSearch || undefined,
        status: statusFilter || undefined,
      });
      setData(result);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Không thể tải dữ liệu");
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

  async function handleVerify(id: string) {
    setProcessingId(id);
    try {
      await superAdminApi.verifyOrganization(id);
      toast.success("Đã duyệt tổ chức");
      loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Duyệt thất bại");
    } finally {
      setProcessingId("");
    }
  }

  async function handleSuspend(id: string) {
    if (!window.confirm("Xác nhận tạm ngưng tổ chức này?")) return;
    setProcessingId(id);
    try {
      await superAdminApi.suspendOrganization(id);
      toast.success("Đã tạm ngưng tổ chức");
      loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Tạm ngưng thất bại");
    } finally {
      setProcessingId("");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Quản lý tổ chức</h1>
        <p className="text-xs text-gray-500 mt-1">Danh sách tất cả tổ chức trong hệ thống</p>
      </div>

      {/* Filters */}
      <form onSubmit={handleSearch} className="flex flex-wrap gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <input
          className="flex-1 min-w-[200px] rounded-xl border border-gray-200 bg-transparent px-3 py-2 text-xs dark:border-gray-700"
          placeholder="Tìm kiếm tên hoặc email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="rounded-xl border border-gray-200 bg-transparent px-3 py-2 text-xs dark:border-gray-700"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
        >
          <option value="">Tất cả</option>
          <option value="verified">Đã xác minh</option>
          <option value="pending">Chờ duyệt</option>
        </select>
        <button className="rounded-xl bg-primary px-4 py-2 text-[10px] font-bold text-white hover:bg-primary-hover transition-colors">
          Tìm kiếm
        </button>
      </form>

      {loading ? (
        <div className="text-center py-16 text-gray-400 text-xs">Đang tải...</div>
      ) : data.items.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">Không tìm thấy tổ chức nào</div>
      ) : (
        <div className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800/60 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200/60 dark:border-gray-800/60">
                <th className="text-left px-4 py-3 font-bold text-gray-600 dark:text-gray-400">Tổ chức</th>
                <th className="text-left px-4 py-3 font-bold text-gray-600 dark:text-gray-400">Email</th>
                <th className="text-center px-4 py-3 font-bold text-gray-600 dark:text-gray-400">Nhân viên</th>
                <th className="text-center px-4 py-3 font-bold text-gray-600 dark:text-gray-400">Sinh viên</th>
                <th className="text-center px-4 py-3 font-bold text-gray-600 dark:text-gray-400">Văn bằng</th>
                <th className="text-center px-4 py-3 font-bold text-gray-600 dark:text-gray-400">Trạng thái</th>
                <th className="text-right px-4 py-3 font-bold text-gray-600 dark:text-gray-400">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((org) => (
                <tr key={org.organization_id} className="border-b border-gray-100 dark:border-gray-800/40 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-[10px] font-bold text-primary">
                        {org.organization_name.charAt(0)}
                      </div>
                      <Link href={`/super-admin/organizations/${org.organization_id}`} className="font-bold hover:text-primary transition-colors">
                        {org.organization_name}
                      </Link>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{org.contact_email}</td>
                  <td className="px-4 py-3 text-center">{org.stats?.staff ?? 0}</td>
                  <td className="px-4 py-3 text-center">{org.stats?.students ?? 0}</td>
                  <td className="px-4 py-3 text-center">{org.stats?.certificates ?? 0}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                      org.is_verified ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
                    }`}>
                      {org.is_verified ? "Đã xác minh" : "Chờ duyệt"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <Link href={`/super-admin/organizations/${org.organization_id}`} className="text-[10px] text-primary font-bold hover:underline">
                      Chi tiết
                    </Link>
                    {org.is_verified ? (
                      <button
                        onClick={() => handleSuspend(org.organization_id)}
                        disabled={processingId === org.organization_id}
                        className="text-[10px] text-red-500 font-bold hover:underline disabled:opacity-50"
                      >
                        Tạm ngưng
                      </button>
                    ) : (
                      <button
                        onClick={() => handleVerify(org.organization_id)}
                        disabled={processingId === org.organization_id}
                        className="text-[10px] text-teal-600 font-bold hover:underline disabled:opacity-50"
                      >
                        Duyệt
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-100 p-4 text-xs dark:border-gray-800">
              <span>{data.total} tổ chức</span>
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
