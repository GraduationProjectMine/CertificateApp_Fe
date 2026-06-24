"use client";

import React from "react";

export default function AdminBatchesPage() {
  const batches = [
    { id: "batch-2026-01", name: "Đợt tốt nghiệp K65 khoa CNTT", total: 450, success: 450, failed: 0, date: "22/06/2026", status: "Completed" },
    { id: "batch-2026-02", name: "Chứng chỉ ngoại ngữ đợt 1 năm 2026", total: 120, success: 118, failed: 2, date: "18/06/2026", status: "Completed" },
    { id: "batch-2026-03", name: "Đợt tốt nghiệp thạc sĩ Viện CNTT", total: 35, success: 0, failed: 0, date: "15/06/2026", status: "Draft" }
  ];

  return (
    <div className="space-y-6 animate-fadeIn font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Cấp bằng hàng loạt</h1>
          <p className="text-xs text-gray-500 mt-1">Cấp phát đồng thời hàng ngàn văn bằng thông qua việc import tệp Excel cấu trúc mẫu.</p>
        </div>
        <button className="w-full sm:w-auto px-4 py-2.5 text-xs font-bold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-sm transition-all select-none">
          + Khởi tạo đợt cấp phát mới
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800/60 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900 border-b border-gray-200 dark:border-gray-850 font-bold text-gray-600 dark:text-gray-400">
                <th className="p-4 sm:p-5">Mã lô</th>
                <th className="p-4 sm:p-5">Tên đợt cấp phát</th>
                <th className="p-4 sm:p-5 text-center">Tổng số bằng</th>
                <th className="p-4 sm:p-5 text-center">Thành công</th>
                <th className="p-4 sm:p-5 text-center">Thất bại</th>
                <th className="p-4 sm:p-5">Ngày tạo</th>
                <th className="p-4 sm:p-5">Trạng thái</th>
                <th className="p-4 sm:p-5 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-150 dark:divide-gray-850 text-gray-700 dark:text-gray-350">
              {batches.map((batch) => (
                <tr key={batch.id} className="hover:bg-slate-55 dark:hover:bg-gray-800/10 transition-colors">
                  <td className="p-4 sm:p-5 font-bold text-gray-900 dark:text-white">{batch.id}</td>
                  <td className="p-4 sm:p-5 font-semibold text-gray-900 dark:text-white">{batch.name}</td>
                  <td className="p-4 sm:p-5 text-center font-bold">{batch.total}</td>
                  <td className="p-4 sm:p-5 text-center text-green-500 font-bold">{batch.success}</td>
                  <td className="p-4 sm:p-5 text-center text-red-500 font-bold">{batch.failed}</td>
                  <td className="p-4 sm:p-5">{batch.date}</td>
                  <td className="p-4 sm:p-5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      batch.status === "Completed"
                        ? "bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 border-green-200/50"
                        : "bg-slate-100 dark:bg-slate-800 text-gray-400 border-gray-200/50"
                    }`}>
                      {batch.status}
                    </span>
                  </td>
                  <td className="p-4 sm:p-5 text-right">
                    <button className="text-xs font-semibold text-primary hover:underline">Chi tiết</button>
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
