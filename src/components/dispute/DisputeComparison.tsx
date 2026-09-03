"use client";

import React, { useMemo } from "react";
import { useI18n } from "@/features/i18n/I18nContext";

interface DisputeComparisonProps {
  certificate: Record<string, any>;
  disputeDetails: string | null;
  disputeReason: string;
}

const FIELD_LABELS: Record<string, string> = {
  student_id: "Mã sinh viên",
  student_fullName: "Họ tên sinh viên",
  certificate_title: "Tên văn bằng",
  dob: "Ngày sinh",
  placeOfBirth: "Nơi sinh",
  gender: "Giới tính",
  ethnicity: "Dân tộc",
  schoolName: "Trường / Cơ sở đào tạo",
  examCohort: "Khóa học / Niên khóa",
  examBoard: "Hội đồng thi / Cơ quan cấp",
  issueLocation: "Nơi cấp",
  issueDate: "Ngày cấp",
  serialNumber: "Số hiệu văn bằng",
  registryNumber: "Số vào sổ",
};

function parseDetails(details: string | null): Record<string, string> {
  if (!details || !details.trim()) return {};
  
  const result: Record<string, string> = {};
  
  // Try to parse as JSON first
  try {
    const parsed = JSON.parse(details);
    if (typeof parsed === 'object' && parsed !== null) {
      return parsed;
    }
  } catch {}
  
  // Fallback: parse as key-value pairs (field: value)
  const lines = details.split('\n');
  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.substring(0, colonIndex).trim();
      const value = line.substring(colonIndex + 1).trim();
      if (key && value) {
        result[key] = value;
      }
    }
  }
  
  // Also try comma-separated
  if (Object.keys(result).length === 0) {
    const pairs = details.split(',');
    for (const pair of pairs) {
      const colonIndex = pair.indexOf(':');
      if (colonIndex > 0) {
        const key = pair.substring(0, colonIndex).trim();
        const value = pair.substring(colonIndex + 1).trim();
        if (key && value) {
          result[key] = value;
        }
      }
    }
  }
  
  return result;
}

function getDisplayValue(obj: Record<string, any>, key: string): string {
  const val = obj[key];
  if (val === null || val === undefined || val === '') return '—';
  if (typeof val === 'object') return JSON.stringify(val);
  return String(val);
}

export default function DisputeComparison({
  certificate,
  disputeDetails,
  disputeReason,
}: DisputeComparisonProps) {
  const { t } = useI18n();
  
  const proposedChanges = useMemo(() => parseDetails(disputeDetails), [disputeDetails]);
  const changedFields = useMemo(() => {
    const fields: Array<{
      key: string;
      label: string;
      oldValue: string;
      newValue: string;
      isChanged: boolean;
    }> = [];
    
    // Check all known fields
    for (const key of Object.keys(FIELD_LABELS)) {
      const oldValue = getDisplayValue(certificate, key);
      const newValue = proposedChanges[key] !== undefined ? proposedChanges[key] : oldValue;
      const isChanged = oldValue !== newValue && newValue !== '—';
      
      if (isChanged || Object.keys(proposedChanges).includes(key)) {
        fields.push({
          key,
          label: FIELD_LABELS[key] || key,
          oldValue,
          newValue: newValue === '—' ? oldValue : newValue,
          isChanged,
        });
      }
    }
    
    // Add any extra fields from proposedChanges that aren't in FIELD_LABELS
    for (const key of Object.keys(proposedChanges)) {
      if (!FIELD_LABELS[key]) {
        fields.push({
          key,
          label: key,
          oldValue: '—',
          newValue: proposedChanges[key],
          isChanged: true,
        });
      }
    }
    
    return fields;
  }, [certificate, proposedChanges]);
  
  if (changedFields.length === 0) {
    return (
      <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-xl">
        <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
          {t("disputeComparison.noChangesDetected") || "Không phát hiện thay đổi cụ thể trong chi tiết khiếu nại."}
        </p>
        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
          {t("disputeComparison.reasonOnly") || "Chỉ có lý do khiếu nại: "} {disputeReason}
        </p>
      </div>
    );
  }
  
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950/50">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          {t("disputeComparison.title") || "Bảng so sánh: Dữ liệu hiện tại ↔ Đề xuất chỉnh sửa"}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {t("disputeComparison.highlightDesc") || "Màu đỏ = dữ liệu cũ (sẽ bị thay), Màu xanh = dữ liệu mới (đề xuất)"}
        </p>
      </div>
      
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
            <th className="px-3 py-2.5 text-left font-semibold text-gray-700 dark:text-gray-300 w-1/3">
              {t("disputeComparison.field") || "Trường thông tin"}
            </th>
            <th className="px-3 py-2.5 text-left font-semibold text-gray-700 dark:text-gray-300 w-1/3">
              <span className="inline-flex items-center gap-1 text-red-600 dark:text-red-400">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                {t("disputeComparison.current") || "Hiện tại"}
              </span>
            </th>
            <th className="px-3 py-2.5 text-left font-semibold text-gray-700 dark:text-gray-300 w-1/3">
              <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                {t("disputeComparison.proposed") || "Đề xuất"}
              </span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {changedFields.map((field, idx) => (
            <tr key={field.key} className={idx % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50 dark:bg-gray-950/50"}>
              <td className="px-3 py-2.5 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                {field.label}
              </td>
              <td className="px-3 py-2.5">
                <span className={field.isChanged ? "text-red-600 dark:text-red-400 line-through" : "text-gray-700 dark:text-gray-300"}>
                  {field.oldValue}
                </span>
              </td>
              <td className="px-3 py-2.5">
                <span className={field.isChanged ? "text-emerald-700 dark:text-emerald-400 font-bold" : "text-gray-700 dark:text-gray-300"}>
                  {field.newValue}
                  {field.isChanged && (
                    <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                      ✓
                    </span>
                  )}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950/50">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {t("disputeComparison.summary")
            .replace("{changed}", String(changedFields.filter(f => f.isChanged).length))
            .replace("{total}", String(changedFields.length)) 
            || `Có ${changedFields.filter(f => f.isChanged).length}/${changedFields.length} trường thông tin được yêu cầu thay đổi.`}
        </p>
      </div>
    </div>
  );
}