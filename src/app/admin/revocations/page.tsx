"use client";

import React, { useState } from "react";

export default function AdminRevocationsPage() {
  const [revocations] = useState([
    { id: "cert-2026-006", studentName: "Đỗ Minh Khang", reason: "Sai thông tin ngày tháng năm sinh trên phôi bằng", date: "21/06/2026", txHash: "0xfa39...bb21", authority: "Phòng Đào Tạo" },
    { id: "cert-2025-102", studentName: "Trần Thế Bảo", reason: "Phát hiện gian lận trong hồ sơ đầu vào tốt nghiệp", date: "10/12/2025", txHash: "0x88f2...00ae", authority: "Ban Giám Hiệu" }
  ]);

  return (
    <div className="space-y-6 animate-fadeIn font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Yêu cầu thu hồi</h1>
          <p className="text-xs text-gray-500 mt-1">Thu hồi hiệu lực văn bằng đã cấp phát do sai lệch thông tin hoặc lý do kỷ luật.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800/60 rounded-3xl p-6 sm:p-8 space-y-6">
        <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-widest">Tạo yêu cầu thu hồi mới</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1.5">Nhập mã số văn bằng cần thu hồi</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ví dụ: cert-2026-001"
                className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
              />
              <button className="px-4 py-2.5 text-xs font-bold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-sm transition-all select-none">
                Tìm kiếm
              </button>
            </div>
          </div>
          <div>
            <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1.5">Lý do thu hồi (Bắt buộc)</label>
            <input
              type="text"
              placeholder="Nhập lý do thu hồi chi tiết..."
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
            />
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800/60 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-gray-150 dark:border-gray-850">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-widest">Lịch sử thu hồi</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900 border-b border-gray-200 dark:border-gray-850 font-bold text-gray-600 dark:text-gray-400">
                <th className="p-4 sm:p-5">Mã văn bằng</th>
                <th className="p-4 sm:p-5">Sinh viên</th>
                <th className="p-4 sm:p-5">Lý do thu hồi</th>
                <th className="p-4 sm:p-5">Ngày thu hồi</th>
                <th className="p-4 sm:p-5">Cơ quan quyết định</th>
                <th className="p-4 sm:p-5">Mã giao dịch (Tx)</th>
                <th className="p-4 sm:p-5 text-right">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-150 dark:divide-gray-850 text-gray-700 dark:text-gray-350">
              {revocations.map((item) => (
                <tr key={item.id} className="hover:bg-slate-55 dark:hover:bg-gray-800/10 transition-colors">
                  <td className="p-4 sm:p-5 font-bold text-gray-900 dark:text-white">{item.id}</td>
                  <td className="p-4 sm:p-5 font-semibold text-gray-900 dark:text-white">{item.studentName}</td>
                  <td className="p-4 sm:p-5 text-gray-500 dark:text-gray-400 max-w-xs truncate" title={item.reason}>{item.reason}</td>
                  <td className="p-4 sm:p-5">{item.date}</td>
                  <td className="p-4 sm:p-5 font-medium">{item.authority}</td>
                  <td className="p-4 sm:p-5 font-mono text-danger">{item.txHash}</td>
                  <td className="p-4 sm:p-5 text-right">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 dark:bg-red-950/20 text-danger border border-red-200/50">REVOKED</span>
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
