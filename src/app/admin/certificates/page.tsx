"use client";

import React from "react";
import Link from "next/link";

export default function AdminCertificatesPage() {
  const certificatesList = [
    { id: "cert-2026-001", studentName: "Nguyễn Văn Hùng", type: "Cử nhân", major: "Khoa học máy tính", date: "22/06/2026", onChain: true, ipfs: "QmXoyp...", status: "Issued" },
    { id: "cert-2026-002", studentName: "Lê Thị Thu", type: "Cử nhân", major: "Kỹ thuật máy tính", date: "21/06/2026", onChain: true, ipfs: "QmPijW...", status: "Issued" },
    { id: "cert-2026-003", studentName: "Phạm Hoàng Minh", type: "Thạc sĩ", major: "Công nghệ thông tin", date: "20/06/2026", onChain: true, ipfs: "QmTknF...", status: "Issued" },
    { id: "cert-2026-004", studentName: "Vũ Phương Thảo", type: "Cử nhân", major: "Kỹ thuật điện tử", date: "15/06/2026", onChain: false, ipfs: "QmJnKL...", status: "Pending Blockchain" },
    { id: "cert-2026-005", studentName: "Trần Đức Hải", type: "Kỹ sư", major: "Cơ điện tử", date: "10/06/2026", onChain: false, ipfs: "", status: "Draft" },
    { id: "cert-2026-006", studentName: "Đỗ Minh Khang", type: "Cử nhân", major: "Khoa học máy tính", date: "01/06/2026", onChain: true, ipfs: "QmHC5x...", status: "Revoked" }
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Quản lý Văn bằng</h1>
          <p className="text-xs text-gray-500 mt-1">Xem, tìm kiếm thông tin văn bằng đã cấp phát, trạng thái ghi blockchain hoặc yêu cầu thu hồi.</p>
        </div>
        <Link
          href="/admin/certificates/issue"
          className="w-full sm:w-auto text-center px-4 py-2.5 text-xs font-bold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-sm transition-all select-none"
        >
          + Cấp bằng mới (Wizard)
        </Link>
      </div>

      {/* Filter panel */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800/60 rounded-2xl p-4 flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="Tìm kiếm theo mã văn bằng, tên sinh viên, số hiệu..."
          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
        />
        <div className="flex gap-2.5">
          <select className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs text-gray-700 dark:text-gray-300 focus:outline-none">
            <option>Tất cả trạng thái</option>
            <option>Issued</option>
            <option>Pending Blockchain</option>
            <option>Revoked</option>
            <option>Draft</option>
          </select>
          <select className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs text-gray-700 dark:text-gray-300 focus:outline-none">
            <option>Loại: Tất cả</option>
            <option>Cử nhân</option>
            <option>Thạc sĩ</option>
            <option>Kỹ sư</option>
          </select>
        </div>
      </div>

      {/* Table Cards */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800/60 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900 border-b border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-600 dark:text-gray-400">
                <th className="p-4 sm:p-5">Mã văn bằng</th>
                <th className="p-4 sm:p-5">Sinh viên</th>
                <th className="p-4 sm:p-5">Hệ đào tạo</th>
                <th className="p-4 sm:p-5">Chuyên ngành</th>
                <th className="p-4 sm:p-5">Ngày cấp</th>
                <th className="p-4 sm:p-5 text-center">IPFS Gateway</th>
                <th className="p-4 sm:p-5 text-center">Blockchain status</th>
                <th className="p-4 sm:p-5">Trạng thái</th>
                <th className="p-4 sm:p-5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-150 dark:divide-gray-850 text-xs text-gray-700 dark:text-gray-350">
              {certificatesList.map((cred) => (
                <tr key={cred.id} className="hover:bg-slate-55 dark:hover:bg-gray-800/10 transition-colors">
                  <td className="p-4 sm:p-5 font-bold text-gray-900 dark:text-white">{cred.id}</td>
                  <td className="p-4 sm:p-5 font-semibold text-gray-900 dark:text-white">{cred.studentName}</td>
                  <td className="p-4 sm:p-5 font-medium">{cred.type}</td>
                  <td className="p-4 sm:p-5 text-gray-500 dark:text-gray-400">{cred.major}</td>
                  <td className="p-4 sm:p-5">{cred.date}</td>
                  <td className="p-4 sm:p-5 text-center">
                    {cred.ipfs ? (
                      <span className="font-mono text-[10px] text-primary dark:text-teal-400 underline cursor-pointer">{cred.ipfs}</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="p-4 sm:p-5 text-center">
                    {cred.onChain ? (
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-blue-50 dark:bg-blue-950/20 text-secondary dark:text-blue-400 border border-blue-200/50">ON-CHAIN</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-slate-50 dark:bg-slate-800/20 text-gray-450 dark:text-gray-400 border border-gray-200/50">OFF-CHAIN</span>
                    )}
                  </td>
                  <td className="p-4 sm:p-5">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                      cred.status === "Issued"
                        ? "bg-green-55/10 text-green-600 dark:text-green-400 border-green-200/50"
                        : cred.status === "Pending Blockchain"
                        ? "bg-amber-55/10 text-warning border-amber-250/50 animate-pulse"
                        : cred.status === "Revoked"
                        ? "bg-red-50 dark:bg-red-950/20 text-danger border-red-200/50"
                        : "bg-slate-50 dark:bg-slate-800/20 text-gray-450 border-gray-200/50"
                    }`}>
                      {cred.status}
                    </span>
                  </td>
                  <td className="p-4 sm:p-5 text-right space-x-2">
                    <button className="text-xs font-semibold text-primary hover:underline">Chi tiết</button>
                    {cred.status !== "Revoked" && cred.status !== "Draft" && (
                      <button className="text-xs font-semibold text-danger hover:underline">Thu hồi</button>
                    )}
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
