"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { studentApi, type ImportBatchDto } from "@/features/students/services/student.api";

export default function ImportHistoryPage() {
  const router = useRouter();
  const [batches, setBatches] = useState<ImportBatchDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    studentApi.importHistory()
      .then(setBatches)
      .catch((err) => setError(err instanceof Error ? err.message : "Không thể tải lịch sử import"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Lịch sử Import</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Các lần import sinh viên từ file CSV.</p>
        </div>
        <button
          onClick={() => router.push("/admin/students/import")}
          className="px-4 py-2 text-xs font-bold text-white bg-primary hover:bg-primary-hover rounded-xl transition-all"
        >
          + Import mới
        </button>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-xs text-red-600 dark:bg-red-950/20">{error}</div>
      )}

      {loading ? (
        <div className="text-center py-16 text-gray-400 dark:text-gray-500 text-xs">Đang tải...</div>
      ) : batches.length === 0 ? (
        <div className="text-center py-16 text-gray-400 dark:text-gray-500 text-xs">Chưa có lần import nào.</div>
      ) : (
        <div className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800/60 rounded-3xl overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200/60 dark:border-gray-800/60">
                <th className="text-left px-4 py-3 font-bold text-gray-600 dark:text-gray-400">File</th>
                <th className="text-left px-4 py-3 font-bold text-gray-600 dark:text-gray-400">Người tạo</th>
                <th className="text-center px-4 py-3 font-bold text-gray-600 dark:text-gray-400">Tổng</th>
                <th className="text-center px-4 py-3 font-bold text-gray-600 dark:text-gray-400">Thành công</th>
                <th className="text-center px-4 py-3 font-bold text-gray-600 dark:text-gray-400">Thất bại</th>
                <th className="text-left px-4 py-3 font-bold text-gray-600 dark:text-gray-400">Thời gian</th>
              </tr>
            </thead>
            <tbody>
              {batches.map((b) => (
                <tr key={b.id} className="border-b border-gray-100 dark:border-gray-800/40 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{b.file_name}</td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{b.created_by_name}</td>
                  <td className="px-4 py-3 text-center text-gray-900 dark:text-white font-bold">{b.total_rows}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-green-600 dark:text-green-400 font-bold">{b.success_rows}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`font-bold ${b.failed_rows > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-400 dark:text-gray-500'}`}>
                      {b.failed_rows}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{new Date(b.createdAt).toLocaleString('vi-VN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}