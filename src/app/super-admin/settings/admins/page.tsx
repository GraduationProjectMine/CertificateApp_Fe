"use client";
import React, { useState, useEffect } from "react";
import { superAdminApi, type SuperAdminUser } from "@/features/super-admin/services/api";
import toast from "react-hot-toast";

export default function SuperAdminsPage() {
  const [admins, setAdmins] = useState<SuperAdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadAdmins = async () => {
    setLoading(true);
    try {
      const res = await superAdminApi.listSuperAdmins();
      setAdmins(res);
    } catch (err: any) {
      toast.error(err.message || "Không thể tải danh sách Super Admin");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      toast.error("Vui lòng nhập tên và email");
      return;
    }
    setSubmitting(true);
    try {
      const res = await superAdminApi.createSuperAdmin({ name, email, password: password || undefined });
      toast.success(`Tạo Super Admin thành công! Mật khẩu: ${res.defaultPassword || "Password123!"}`, {
        duration: 8000
      });
      setName("");
      setEmail("");
      setPassword("");
      loadAdmins();
    } catch (err: any) {
      toast.error(err.message || "Tạo Super Admin thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Quản trị viên hệ thống</h1>
        <p className="text-xs text-gray-500 mt-1">Quản lý danh sách các tài khoản Super Admin truy cập hệ thống</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Form */}
        <div className="lg:col-span-1 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 h-fit">
          <h2 className="text-xs font-black text-gray-800 dark:text-gray-200 uppercase tracking-wider mb-4">Thêm Super Admin Mới</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Họ tên</label>
              <input
                type="text"
                required
                className="w-full rounded-xl border border-gray-200 bg-transparent px-3 py-2 text-xs dark:border-gray-700"
                placeholder="Nguyễn Văn A"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Email</label>
              <input
                type="email"
                required
                className="w-full rounded-xl border border-gray-200 bg-transparent px-3 py-2 text-xs dark:border-gray-700"
                placeholder="admin2@certichain.vn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Mật khẩu (Tùy chọn)</label>
              <input
                type="password"
                className="w-full rounded-xl border border-gray-200 bg-transparent px-3 py-2 text-xs dark:border-gray-700"
                placeholder="Để trống để sinh mặc định"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-primary py-2 text-[10px] font-bold text-white hover:bg-primary-hover transition-colors disabled:opacity-50"
            >
              {submitting ? "Đang tạo..." : "Tạo tài khoản"}
            </button>
          </form>
        </div>

        {/* List Table */}
        <div className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h2 className="text-xs font-black text-gray-800 dark:text-gray-200 uppercase tracking-wider mb-4">Danh Sách Super Admin</h2>
          {loading ? (
            <div className="text-center py-6 text-gray-400 text-xs">Đang tải...</div>
          ) : admins.length === 0 ? (
            <div className="text-center py-6 text-gray-400 text-xs">Không có admin nào khác</div>
          ) : (
            <div className="overflow-hidden border border-gray-150 rounded-xl">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-150">
                    <th className="text-left px-3 py-2 font-bold text-gray-600">Tên</th>
                    <th className="text-left px-3 py-2 font-bold text-gray-600">Email</th>
                    <th className="text-center px-3 py-2 font-bold text-gray-600">Ngày tạo</th>
                    <th className="text-center px-3 py-2 font-bold text-gray-600">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map((admin) => (
                    <tr key={admin.admin_id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="px-3 py-2 font-medium">{admin.name}</td>
                      <td className="px-3 py-2 text-gray-500">{admin.email}</td>
                      <td className="px-3 py-2 text-center text-gray-400">{new Date(admin.createdAt).toLocaleDateString("vi-VN")}</td>
                      <td className="px-3 py-2 text-center">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-green-50 text-green-700">
                          {admin.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
