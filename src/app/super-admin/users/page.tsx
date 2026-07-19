"use client";
import React, { useState, useEffect, useCallback } from "react";
import { superAdminApi, type User, type Paginated } from "@/features/super-admin/services/api";
import toast from "react-hot-toast";

const roleLabels: Record<string, string> = {
  ISSUER: "Quản trị",
  STAFF: "Nhân viên",
  STUDENT: "Sinh viên",
};

export default function UsersPage() {
  const [data, setData] = useState<Paginated<User>>({ items: [], total: 0, page: 1, limit: 20, totalPages: 0 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await superAdminApi.listUsers({
        page,
        limit: 20,
        role: roleFilter || undefined,
        search: appliedSearch || undefined,
      });
      setData(result);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, [page, appliedSearch, roleFilter]);

  useEffect(() => { loadData(); }, [loadData]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    setAppliedSearch(search.trim());
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Quản lý người dùng</h1>
        <p className="text-xs text-gray-500 mt-1">Danh sách tất cả người dùng trong hệ thống</p>
      </div>

      <form onSubmit={handleSearch} className="flex flex-wrap gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <input
          className="flex-1 min-w-[200px] rounded-xl border border-gray-200 bg-transparent px-3 py-2 text-xs dark:border-gray-700"
          placeholder="Tìm kiếm tên hoặc email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="rounded-xl border border-gray-200 bg-transparent px-3 py-2 text-xs dark:border-gray-700"
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
        >
          <option value="">Tất cả vai trò</option>
          <option value="issuer">Quản trị (Issuer)</option>
          <option value="staff">Nhân viên (Staff)</option>
          <option value="student">Sinh viên (Student)</option>
        </select>
        <button className="rounded-xl bg-primary px-4 py-2 text-[10px] font-bold text-white hover:bg-primary-hover transition-colors">
          Tìm kiếm
        </button>
      </form>

      {loading ? (
        <div className="text-center py-16 text-gray-400 text-xs">Đang tải...</div>
      ) : data.items.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">Không tìm thấy người dùng nào</div>
      ) : (
        <div className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800/60 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200/60 dark:border-gray-800/60">
                <th className="text-left px-4 py-3 font-bold text-gray-600 dark:text-gray-400">Tên</th>
                <th className="text-left px-4 py-3 font-bold text-gray-600 dark:text-gray-400">Email</th>
                <th className="text-left px-4 py-3 font-bold text-gray-600 dark:text-gray-400">Tổ chức</th>
                <th className="text-center px-4 py-3 font-bold text-gray-600 dark:text-gray-400">Vai trò</th>
                <th className="text-center px-4 py-3 font-bold text-gray-600 dark:text-gray-400">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((user) => (
                <tr key={user.staff_id || user.student_id} className="border-b border-gray-100 dark:border-gray-800/40 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                  <td className="px-4 py-3 font-medium">{user.name || user.student_fullName}</td>
                  <td className="px-4 py-3 text-gray-500">{user.email}</td>
                  <td className="px-4 py-3 text-gray-500">{user.organization_name}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                      user.role === "ISSUER" ? "bg-primary/10 text-primary" :
                      user.role === "STAFF" ? "bg-gray-100 dark:bg-gray-800 text-gray-500" :
                      "bg-teal-50 text-teal-700"
                    }`}>
                      {roleLabels[user.role] || user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                      user.status === "ACTIVE" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                    }`}>
                      {user.status === "ACTIVE" ? "Hoạt động" : "Ngừng"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {data.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-100 p-4 text-xs dark:border-gray-800">
              <span>{data.total} người dùng</span>
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
