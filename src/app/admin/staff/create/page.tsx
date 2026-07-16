"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { staffApi } from "@/features/staff/services/staff.api";
import { useAuth } from "@/features/auth/components/AuthContext";

export default function CreateStaffPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user?.role !== "issuer") {
      setError("Chỉ tài khoản quản trị tổ chức được tạo nhân viên");
      return;
    }
    if (!form.name || !form.email || !form.password) {
      setError("Vui lòng điền đầy đủ thông tin");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await staffApi.create(form);
      router.push("/admin/staff");
    } catch (err: any) {
      setError(err.message || "Tạo nhân viên thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  if (user?.role !== "issuer") {
    return (
      <div className="max-w-lg mx-auto p-6 space-y-4">
        <h1 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Không có quyền</h1>
        <p className="text-xs text-gray-500">Chỉ tài khoản quản trị tổ chức được tạo nhân viên.</p>
        <button
          type="button"
          onClick={() => router.push("/admin/staff")}
          className="px-4 py-2.5 text-xs font-bold text-gray-500 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-all"
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Thêm nhân viên</h1>
        <p className="text-xs text-gray-500 mt-1">Tạo tài khoản nhân viên mới để hỗ trợ cấp văn bằng.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800/60 rounded-3xl p-6 space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">Họ và tên *</label>
          <input
            type="text"
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Nguyễn Văn B"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">Email *</label>
          <input
            type="email"
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="staff@school.edu.vn"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">Mật khẩu *</label>
          <input
            type="password"
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="Tối thiểu 8 ký tự, 1 hoa, 1 thường, 1 số"
          />
        </div>

        {error && <div className="text-[11px] text-red-500 bg-red-50 dark:bg-red-950/20 px-3 py-2 rounded-lg">{error}</div>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2.5 text-xs font-bold text-white bg-primary hover:bg-primary-hover disabled:opacity-50 rounded-xl transition-all"
          >
            {submitting ? "Đang tạo..." : "Tạo nhân viên"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/staff")}
            className="px-4 py-2.5 text-xs font-bold text-gray-500 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-all"
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
}
