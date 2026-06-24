"use client";

import React from "react";

export default function AdminStudentsPage() {
  const students = [
    { code: "20202345", name: "Nguyễn Văn Hùng", email: "hung.nv202345@sis.hust.edu.vn", department: "CNTT", major: "Khoa học máy tính", status: "Active", count: 2 },
    { code: "20201192", name: "Lê Thị Thu", email: "thu.lt201192@sis.hust.edu.vn", department: "CNTT", major: "Kỹ thuật máy tính", status: "Active", count: 1 },
    { code: "20203498", name: "Phạm Hoàng Minh", email: "minh.ph203498@sis.hust.edu.vn", department: "CNTT", major: "Công nghệ thông tin", status: "Active", count: 1 },
    { code: "20205822", name: "Vũ Phương Thảo", email: "thao.vp205822@sis.hust.edu.vn", department: "Điện tử", major: "Kỹ thuật điện tử", status: "Active", count: 1 },
    { code: "20206190", name: "Trần Đức Hải", email: "hai.td206190@sis.hust.edu.vn", department: "Cơ khí", major: "Kỹ thuật cơ điện tử", status: "Pending", count: 0 }
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Quản lý Sinh viên</h1>
          <p className="text-xs text-gray-500 mt-1">Quản lý thông tin hồ sơ học tập và trạng thái tài khoản sinh viên nhận bằng.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button className="flex-1 sm:flex-initial px-4 py-2.5 text-xs font-bold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-sm transition-all select-none">
            + Thêm sinh viên
          </button>
          <button className="flex-1 sm:flex-initial px-4 py-2.5 text-xs font-bold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl transition-all">
            Import Excel
          </button>
        </div>
      </div>

      {/* Filter panel */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800/60 rounded-2xl p-4 flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="Tìm kiếm theo mã sinh viên, họ tên, email..."
          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
        />
        <div className="flex gap-2.5">
          <select className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs text-gray-700 dark:text-gray-300 focus:outline-none">
            <option>Tất cả các khoa</option>
            <option>CNTT</option>
            <option>Điện tử</option>
            <option>Cơ khí</option>
          </select>
          <select className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs text-gray-700 dark:text-gray-300 focus:outline-none">
            <option>Tất cả trạng thái</option>
            <option>Active</option>
            <option>Pending</option>
          </select>
        </div>
      </div>

      {/* List Table Card */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800/60 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900 border-b border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-600 dark:text-gray-400">
                <th className="p-4 sm:p-5">Mã SV</th>
                <th className="p-4 sm:p-5">Họ tên</th>
                <th className="p-4 sm:p-5">Email</th>
                <th className="p-4 sm:p-5">Khoa</th>
                <th className="p-4 sm:p-5">Chuyên ngành</th>
                <th className="p-4 sm:p-5">Trạng thái</th>
                <th className="p-4 sm:p-5">Bằng cấp</th>
                <th className="p-4 sm:p-5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-150 dark:divide-gray-850 text-xs text-gray-700 dark:text-gray-350">
              {students.map((student) => (
                <tr key={student.code} className="hover:bg-slate-55 dark:hover:bg-gray-800/10 transition-colors">
                  <td className="p-4 sm:p-5 font-bold text-gray-900 dark:text-white">{student.code}</td>
                  <td className="p-4 sm:p-5 font-semibold text-gray-900 dark:text-white">{student.name}</td>
                  <td className="p-4 sm:p-5">{student.email}</td>
                  <td className="p-4 sm:p-5 font-medium">{student.department}</td>
                  <td className="p-4 sm:p-5 text-gray-500 dark:text-gray-400">{student.major}</td>
                  <td className="p-4 sm:p-5">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                      student.status === "Active"
                        ? "bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 border-green-200/50"
                        : "bg-amber-50 dark:bg-amber-950/20 text-warning border-amber-250/50"
                    }`}>
                      {student.status}
                    </span>
                  </td>
                  <td className="p-4 sm:p-5 font-bold text-center">{student.count}</td>
                  <td className="p-4 sm:p-5 text-right space-x-2">
                    <button className="text-xs font-semibold text-primary hover:underline">Sửa</button>
                    <button className="text-xs font-semibold text-danger hover:underline">Khóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
