"use client";
import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { staffApi, type StaffDto } from "@/features/staff/services/staff.api";

export default function StaffListPage() {
  const [staff, setStaff] = useState<StaffDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState("");

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await staffApi.list();
      setStaff(data);
    } catch (err: any) {
      setError(err.message || "Không thể tải danh sách nhân viên");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Xác nhận xóa nhân viên này?")) return;
    setDeletingId(id);
    try {
      await staffApi.delete(id);
      setStaff((prev) => prev.filter((s) => s.staff_id !== id));
    } catch (err: any) {
      alert(err.message || "Xóa nhân viên thất bại");
    } finally {
      setDeletingId("");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Nhân viên</h1>
          <p className="text-xs text-gray-500 mt-1">Danh sách nhân viên trong trường.</p>
        </div>
        <Link
          href="/admin/staff/create"
          className="px-4 py-2 text-xs font-bold text-white bg-primary hover:bg-primary-hover rounded-xl transition-all"
        >
          + Thêm nhân viên
        </Link>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-xs text-red-600 dark:bg-red-950/20">
          {error} <button onClick={fetchStaff} className="ml-2 underline">Thử lại</button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 text-gray-400 text-xs">Đang tải danh sách nhân viên...</div>
      ) : staff.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p>Chưa có nhân viên nào.</p>
          <Link href="/admin/staff/create" className="text-primary underline text-xs mt-2 inline-block">
            Tạo nhân viên đầu tiên
          </Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800/60 rounded-3xl overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200/60 dark:border-gray-800/60">
                <th className="text-left px-4 py-3 font-bold text-gray-600 dark:text-gray-400">Tên</th>
                <th className="text-left px-4 py-3 font-bold text-gray-600 dark:text-gray-400">Email</th>
                <th className="text-left px-4 py-3 font-bold text-gray-600 dark:text-gray-400">Vai trò</th>
                <th className="text-right px-4 py-3 font-bold text-gray-600 dark:text-gray-400">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((s) => (
                <tr key={s.staff_id} className="border-b border-gray-100 dark:border-gray-800/40 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{s.name}</td>
                  <td className="px-4 py-3 text-gray-500">{s.email}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                      s.role === 'ISSUER'
                        ? 'bg-primary/10 text-primary'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                    }`}>
                      {s.role === 'ISSUER' ? 'Quản trị' : 'Nhân viên'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(s.staff_id)}
                      disabled={deletingId === s.staff_id}
                      className="text-[10px] text-red-500 hover:text-red-700 font-bold uppercase tracking-wider disabled:opacity-50"
                    >
                      {deletingId === s.staff_id ? "Đang xóa..." : "Xóa"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
