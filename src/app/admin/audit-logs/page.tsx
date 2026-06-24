"use client";

import React from "react";

export default function AdminAuditLogsPage() {
  const logs = [
    { id: "log-1", time: "22/06/2026 15:20:11", actor: "admin@hust.edu.vn", action: "Đăng nhập hệ thống", details: "Đăng nhập bằng phiên email từ địa chỉ IP: 192.168.1.12" },
    { id: "log-2", time: "22/06/2026 14:15:30", actor: "admin@hust.edu.vn", action: "Cấp phát văn bằng", details: "Cấp bằng cử nhân thành công cho Nguyễn Văn Hùng (Mã bằng: cert-2026-001)" },
    { id: "log-3", time: "21/06/2026 18:45:02", actor: "admin@hust.edu.vn", action: "Thu hồi văn bằng", details: "Thu hồi thành công văn bằng Đỗ Minh Khang (Mã bằng: cert-2026-006)" },
    { id: "log-4", time: "20/06/2026 09:30:45", actor: "admin@hust.edu.vn", action: "Thêm sinh viên", details: "Thêm mới sinh viên Nguyễn Văn Hùng (Mã SV: 20202345) vào cơ sở dữ liệu" }
  ];

  return (
    <div className="space-y-6 animate-fadeIn font-sans">
      <div>
        <h1 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Nhật ký hoạt động (Audit Logs)</h1>
        <p className="text-xs text-gray-500 mt-1">Lịch sử ghi lại tất cả các hoạt động quản trị trên cổng thông tin nhà trường để phục vụ mục đích kiểm toán.</p>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800/60 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900 border-b border-gray-200 dark:border-gray-850 font-bold text-gray-600 dark:text-gray-400">
                <th className="p-4 sm:p-5">Thời gian</th>
                <th className="p-4 sm:p-5">Người thực hiện</th>
                <th className="p-4 sm:p-5">Hành động</th>
                <th className="p-4 sm:p-5">Chi tiết hoạt động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-150 dark:divide-gray-850 text-gray-700 dark:text-gray-350">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-55 dark:hover:bg-gray-800/10 transition-colors">
                  <td className="p-4 sm:p-5 text-gray-450 font-semibold">{log.time}</td>
                  <td className="p-4 sm:p-5 font-bold text-gray-900 dark:text-white">{log.actor}</td>
                  <td className="p-4 sm:p-5 font-semibold text-primary dark:text-teal-400">{log.action}</td>
                  <td className="p-4 sm:p-5 text-gray-500 dark:text-gray-400">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
