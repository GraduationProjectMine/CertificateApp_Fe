"use client";
import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { studentApi, type ImportResult } from "@/features/students/services/student.api";

export default function ImportStudentsPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ImportResult | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      if (!f.name.endsWith('.csv')) {
        setError('Chỉ hỗ trợ file CSV');
        setFile(null);
        return;
      }
      if (f.size > 5 * 1024 * 1024) {
        setError('File không được quá 5MB');
        setFile(null);
        return;
      }
      setFile(f);
      setError("");
      setResult(null);
    }
  };

  const handleImport = async () => {
    if (!file) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await studentApi.import(file);
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadTemplate = () => {
    studentApi.downloadTemplate();
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Import sinh viên từ CSV</h1>
        <p className="text-xs text-gray-500 mt-1">Tạo tài khoản hàng loạt cho sinh viên bằng file CSV.</p>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800/60 rounded-3xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">File mẫu</h3>
            <p className="text-xs text-gray-500 mt-0.5">Tải file mẫu để biết định dạng đúng.</p>
          </div>
          <button
            onClick={handleDownloadTemplate}
            className="px-4 py-2 text-xs font-bold text-primary border border-primary/30 rounded-xl hover:bg-primary/5 transition-all"
          >
            Tải file mẫu
          </button>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-800" />

        <div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Upload file CSV</h3>
          <label
            className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-8 cursor-pointer transition-all ${
              file
                ? "border-primary bg-primary/5"
                : "border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600"
            }`}
          >
            <svg className="w-8 h-8 mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            {file ? (
              <div className="text-center">
                <p className="text-sm font-semibold text-primary">{file.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">Nhấn để chọn file CSV</p>
                <p className="text-xs text-gray-400 mt-0.5">Cột bắt buộc: name, email</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>

        {file && !result && (
          <button
            onClick={handleImport}
            disabled={submitting}
            className="w-full px-5 py-3 text-sm font-bold text-white bg-primary hover:bg-primary-hover disabled:opacity-50 rounded-xl transition-all"
          >
            {submitting ? "Đang xử lý..." : `Import ${file.name}`}
          </button>
        )}

        {error && (
          <div className="text-[11px] text-red-500 bg-red-50 dark:bg-red-950/20 px-3 py-2 rounded-lg">{error}</div>
        )}

        {result && (
          <div className="space-y-4">
            <div className={`rounded-2xl p-4 ${
              result.failed_rows === 0
                ? "bg-green-50 dark:bg-green-950/20 border border-green-200/50"
                : result.success_rows > 0
                ? "bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50"
                : "bg-red-50 dark:bg-red-950/20 border border-red-200/50"
            }`}>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Kết quả import</h3>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-2xl font-black text-gray-900 dark:text-white">{result.total_rows}</p>
                  <p className="text-[10px] text-gray-500 uppercase font-bold">Tổng dòng</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-green-600">{result.success_rows}</p>
                  <p className="text-[10px] text-gray-500 uppercase font-bold">Thành công</p>
                </div>
                <div>
                  <p className={`text-2xl font-black ${result.failed_rows > 0 ? "text-red-600" : "text-gray-400"}`}>
                    {result.failed_rows}
                  </p>
                  <p className="text-[10px] text-gray-500 uppercase font-bold">Thất bại</p>
                </div>
              </div>
            </div>

            <div className="max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-800 rounded-xl">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                    <th className="text-left px-3 py-2 font-bold text-gray-600">Dòng</th>
                    <th className="text-left px-3 py-2 font-bold text-gray-600">Họ tên</th>
                    <th className="text-left px-3 py-2 font-bold text-gray-600">Email</th>
                    <th className="text-left px-3 py-2 font-bold text-gray-600">Trạng thái</th>
                    <th className="text-left px-3 py-2 font-bold text-gray-600">Mật khẩu</th>
                  </tr>
                </thead>
                <tbody>
                  {result.results.map((r) => (
                    <tr key={r.row} className="border-b border-gray-100 dark:border-gray-800/40">
                      <td className="px-3 py-2 text-gray-500">{r.row}</td>
                      <td className="px-3 py-2 font-medium text-gray-900 dark:text-white">{r.name}</td>
                      <td className="px-3 py-2 text-gray-500">{r.email}</td>
                      <td className="px-3 py-2">
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          r.status === 'success'
                            ? 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400'
                        }`}>
                          {r.status === 'success' ? 'OK' : r.error || 'Lỗi'}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        {r.password ? (
                          <span className="font-mono text-[10px] text-gray-600 dark:text-gray-400 select-all">{r.password}</span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setFile(null); setResult(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                className="flex-1 px-4 py-2.5 text-xs font-bold text-gray-500 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-all"
              >
                Import tiếp
              </button>
              <button
                onClick={() => router.push("/admin/students")}
                className="flex-1 px-4 py-2.5 text-xs font-bold text-white bg-primary hover:bg-primary-hover rounded-xl transition-all"
              >
                Xem danh sách sinh viên
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}