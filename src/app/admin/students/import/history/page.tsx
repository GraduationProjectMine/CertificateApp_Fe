"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { studentApi, type ImportBatchDto } from "@/features/students/services/student.api";
import { useI18n } from "@/features/i18n/I18nContext";

export default function ImportHistoryPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [batches, setBatches] = useState<ImportBatchDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    studentApi.importHistory()
      .then(setBatches)
      .catch((err) => setError(err instanceof Error ? err.message : t("admin.students.load_history_failed")))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{t("admin.students.import_history_title")}</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t("admin.students.import_history_description")}</p>
        </div>
        <button
          onClick={() => router.push("/admin/students/import")}
          className="px-4 py-2 text-xs font-bold text-white bg-primary hover:bg-primary-hover rounded-xl transition-all"
        >
          + {t("admin.students.import_new")}
        </button>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-xs text-red-600 dark:bg-red-950/20">{error}</div>
      )}

      {loading ? (
        <div className="text-center py-16 text-gray-400 dark:text-gray-500 text-xs">{t("common.loading")}</div>
      ) : batches.length === 0 ? (
        <div className="text-center py-16 text-gray-400 dark:text-gray-500 text-xs">{t("admin.students.no_imports")}</div>
      ) : (
        <div className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800/60 rounded-3xl overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200/60 dark:border-gray-800/60">
                <th className="text-left px-4 py-3 font-bold text-gray-600 dark:text-gray-400">{t("admin.students.file_col")}</th>
                <th className="text-left px-4 py-3 font-bold text-gray-600 dark:text-gray-400">{t("admin.students.creator_col")}</th>
                <th className="text-center px-4 py-3 font-bold text-gray-600 dark:text-gray-400">{t("admin.students.total_col")}</th>
                <th className="text-center px-4 py-3 font-bold text-gray-600 dark:text-gray-400">{t("admin.students.success_col")}</th>
                <th className="text-center px-4 py-3 font-bold text-gray-600 dark:text-gray-400">{t("admin.students.failed_col")}</th>
                <th className="text-left px-4 py-3 font-bold text-gray-600 dark:text-gray-400">{t("admin.students.time_col")}</th>
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
