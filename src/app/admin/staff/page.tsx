"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";

interface StaffMember {
  id?: string;
  user_id?: string;
  name: string;
  email: string;
}

export default function StaffListPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);

  useEffect(() => {
    const cached = JSON.parse(localStorage.getItem("staff") || "[]");
    setStaff(cached);
  }, []);

  const handleDelete = (idx: number) => {
    const updated = staff.filter((_, i) => i !== idx);
    setStaff(updated);
    localStorage.setItem("staff", JSON.stringify(updated));
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

      {staff.length === 0 ? (
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
                <th className="text-right px-4 py-3 font-bold text-gray-600 dark:text-gray-400">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((s, i) => (
                <tr key={i} className="border-b border-gray-100 dark:border-gray-800/40 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{s.name}</td>
                  <td className="px-4 py-3 text-gray-500">{s.email}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(i)}
                      className="text-[10px] text-red-500 hover:text-red-700 font-bold uppercase tracking-wider"
                    >
                      Xóa
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
