"use client";
import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
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
  const [actionLoading, setActionLoading] = useState<string | null>(null);

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
    } catch (err: any) {
      toast.error(err.message || "Không thể tải dữ liệu");
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

  async function handleLockToggle(userId: string, currentStatus: string) {
    setActionLoading(userId);
    try {
      if (currentStatus === "ACTIVE") {
        await superAdminApi.lockUser(userId);
        toast.success("Đã khóa tài khoản thành công");
      } else {
        await superAdminApi.unlockUser(userId);
        toast.success("Đã mở khóa tài khoản thành công");
      }
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Thao tác thất bại");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleResetPassword(userId: string) {
    if (!window.confirm("Bạn có chắc chắn muốn đặt lại mật khẩu của người dùng này về mặc định (Password123!) không?")) return;
    setActionLoading(userId + "-reset");
    try {
      const res = await superAdminApi.resetUserPassword(userId);
      toast.success(`Đặt lại mật khẩu thành công! Mật khẩu mới: ${res.defaultPassword || "Password123!"}`, {
        duration: 6000
      });
    } catch (err: any) {
      toast.error(err.message || "Không thể đặt lại mật khẩu");
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Quản lý người dùng</h1>
        <p className="text-xs text-gray-500 mt-1">Danh sách tất cả người dùng trong hệ thống (Staff & Students)</p>
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
                <th className="text-right px-4 py-3 font-bold text-gray-600 dark:text-gray-400">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((u) => {
                const userId = u.staff_id || u.student_id || "";
                return (
                  <tr key={userId} className="border-b border-gray-100 dark:border-gray-800/40 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                    <td className="px-4 py-3 font-medium">{u.name || u.student_fullName}</td>
                    <td className="px-4 py-3 text-gray-500">{u.email}</td>
                    <td className="px-4 py-3 text-gray-500">{u.organization_name}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.role === "ISSUER" ? "bg-primary/10 text-primary" :
                        u.role === "STAFF" ? "bg-gray-100 dark:bg-gray-800 text-gray-500" :
                        "bg-teal-50 text-teal-700"
                      }`}>
                        {roleLabels[u.role] || u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.status === "ACTIVE" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                      }`}>
                        {u.status === "ACTIVE" ? "Hoạt động" : "Bị khóa"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <Link
                        href={`/super-admin/users/${userId}`}
                        className="text-[10px] text-primary font-bold hover:underline"
                      >
                        Chi tiết
                      </Link>
                      <button
                        onClick={() => handleLockToggle(userId, u.status)}
                        disabled={actionLoading !== null}
                        className={`text-[10px] font-bold hover:underline ${
                          u.status === "ACTIVE" ? "text-red-500" : "text-emerald-600"
                        }`}
                      >
                        {actionLoading === userId ? "Đang xử lý..." : u.status === "ACTIVE" ? "Khóa" : "Mở khóa"}
                      </button>
                      <button
                        onClick={() => handleResetPassword(userId)}
                        disabled={actionLoading !== null}
                        className="text-[10px] text-amber-600 font-bold hover:underline"
                      >
                        {actionLoading === userId + "-reset" ? "Đang xử lý..." : "Đặt lại MK"}
                      </button>
                    </td>
                  </tr>
                );
              })}
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
