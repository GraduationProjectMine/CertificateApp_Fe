"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import Link from "next/link";
import styles from "./page.module.css";
import { operationsApi, type IssuanceBatch } from "@/features/admin/services/operations.api";
import { toCsv } from "@/features/admin/utils/csv";
import type { CreateCertificatePayload } from "@/features/certificates/services/certificate.api";
import { ocrApi } from "@/features/ocr/services/api";
import { studentApi, type StudentDto } from "@/features/students/services/student.api";
import { useAuth } from "@/features/auth/components/AuthContext";
import { useI18n } from "@/features/i18n/I18nContext";
import ConfirmModal from "@/components/common/Modal/ConfirmModal";

function downloadFile(content: Blob, filename: string) {
  const url = URL.createObjectURL(content);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const EMPTY_RECORD: Record<string, string> = {
  student_id: "",
  student_fullName: "",
  certificate_title: "",
  dob: "",
  placeOfBirth: "",
  gender: "",
  ethnicity: "",
  schoolName: "",
  examCohort: "",
  examBoard: "",
  issueLocation: "",
  issueDate: "",
  serialNumber: "",
  registryNumber: "",
};

export default function AdminBatchesPage() {
  const { user } = useAuth();
  const { t } = useI18n();

  const REQUIRED_BATCH_FIELDS: Array<{ key: string; label: string }> = [
    { key: "student_id", label: t("common.student") },
    { key: "student_fullName", label: t("common.student_name") },
    { key: "certificate_title", label: t("admin.batches.certificate_title") },
    { key: "dob", label: t("admin.batches.dob") },
    { key: "placeOfBirth", label: t("admin.batches.place_of_birth") },
    { key: "gender", label: t("admin.batches.gender") },
    { key: "ethnicity", label: t("admin.batches.ethnicity") },
    { key: "schoolName", label: t("admin.batches.school_name") },
    { key: "examCohort", label: t("admin.batches.exam_cohort") },
    { key: "examBoard", label: t("admin.batches.exam_board") },
    { key: "issueLocation", label: t("admin.batches.issue_location") },
    { key: "issueDate", label: t("admin.batches.issue_date") },
    { key: "serialNumber", label: t("admin.batches.serial_number") },
    { key: "registryNumber", label: t("admin.batches.registry_number") },
  ];
  const isIssuer = user?.role === "issuer";
  const [mode, setMode] = useState<"DRAFT_ONLY" | "FULL">(isIssuer ? "FULL" : "DRAFT_ONLY");
  const [batches, setBatches] = useState<IssuanceBatch[]>([]);
  const [selected, setSelected] = useState<IssuanceBatch | null>(null);
  const [showConfirmBatch, setShowConfirmBatch] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");

  // Initialize with 1 editable record so the UI Form is always visible by default
  const [sourceRows, setSourceRows] = useState<Record<string, string>[]>([{ ...EMPTY_RECORD }]);

  // OCR state
  const [scanningOcr, setScanningOcr] = useState(false);
  const [ocrLang, setOcrLang] = useState("vie");

  // Student accounts list
  const [students, setStudents] = useState<StudentDto[]>([]);

  // Active record index in batch editor
  const [activeRecordIndex, setActiveRecordIndex] = useState(0);

  // Tab preview & search keyword
  const [previewTab, setPreviewTab] = useState<"ALL" | "VALID" | "INVALID">("ALL");
  const [searchKeyword, setSearchKeyword] = useState("");

  const load = useCallback(async () => {
    try {
      setError("");
      setBatches(await operationsApi.listBatches());
    } catch (err) {
      setError(err instanceof Error ? err.message : t("admin.batches.failed_load"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    studentApi.list().then(setStudents).catch(() => {});
  }, [load]);

  // Handle Drag-and-drop OCR scan
  const handleOcrDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!e.dataTransfer.files || e.dataTransfer.files.length === 0) return;
    const files = Array.from(e.dataTransfer.files);
    void processOcrFiles(files);
  }, [ocrLang]);

  // Handle OCR Batch Files Upload
  async function onOcrFiles(event: React.ChangeEvent<HTMLInputElement>) {
    const fileList = event.target.files;
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList);
    await processOcrFiles(files);
    event.target.value = "";
  }

  async function processOcrFiles(files: File[]) {
    setScanningOcr(true);
    try {
      toast.loading(t("admin.batches.ocr_scanning", { count: files.length }), { id: "ocr-batch" });
      const res = await ocrApi.extractDiplomasBatch(files, ocrLang);
      toast.dismiss("ocr-batch");

      if (!res.results || res.results.length === 0) {
        toast.error(t("admin.batches.ocr_no_data"));
        return;
      }

      const base64List = await Promise.all(
        files.map((file) =>
          new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
            reader.onerror = () => resolve("");
            reader.readAsDataURL(file);
          })
        )
      );

      const rows: Record<string, string>[] = res.results.map((r, idx) => {
        const d = r.data || {};
        return {
          student_id: d.student_id || "",
          student_fullName: d.full_name || "",
          certificate_title: d.diploma_title || t("admin.batches.default_diploma_title"),
          dob: d.dob || "",
          placeOfBirth: d.place_of_birth || "",
          gender: d.gender || "",
          ethnicity: d.ethnicity || "",
          schoolName: d.school_name || "",
          examCohort: d.exam_cohort || "",
          examBoard: d.exam_board || "",
          issueLocation: d.issue_location || "",
          issueDate: d.issue_date || "",
          serialNumber: d.serial_number || "",
          registryNumber: d.registry_number || "",
          file_url: base64List[idx] || "",
        };
      });

      setFileName(t("admin.batches.ocr_batch_name", { count: files.length }));
      setSourceRows(rows);
      setActiveRecordIndex(0);

      toast.success(t("admin.batches.ocr_success", { total: res.total }));
    } catch (err: any) {
      toast.dismiss("ocr-batch");
      toast.error(err.message || t("admin.batches.ocr_failed"));
    } finally {
      setScanningOcr(false);
    }
  }

  const handleFieldEdit = (fieldKey: string, newValue: string) => {
    setSourceRows((prev) => {
      const next = [...prev];
      if (next[activeRecordIndex]) {
        next[activeRecordIndex] = {
          ...next[activeRecordIndex],
          [fieldKey]: newValue,
        };
      }
      return next;
    });
  };

  const handleTableRowEdit = (originalIndex: number, fieldKey: string, newValue: string) => {
    setSourceRows((prev) => {
      const next = [...prev];
      const sourceRowIndex = originalIndex - 1;
      if (next[sourceRowIndex]) {
        next[sourceRowIndex] = {
          ...next[sourceRowIndex],
          [fieldKey]: newValue,
        };
      }
      return next;
    });
  };

  const addNewRecord = () => {
    setSourceRows((prev) => [...prev, { ...EMPTY_RECORD }]);
    setActiveRecordIndex(sourceRows.length);
  };

  const removeActiveRecord = (idx: number) => {
    if (sourceRows.length <= 1) {
      setSourceRows([{ ...EMPTY_RECORD }]);
      setActiveRecordIndex(0);
      return;
    }
    setSourceRows((prev) => prev.filter((_, i) => i !== idx));
    setActiveRecordIndex((prev) => Math.max(0, prev - 1));
  };

  // Require ALL 14 fields in the batch form
  const mappedRowsWithStatus = useMemo(() => {
    return sourceRows
      .map((source, originalIndex) => {
        const record = source as unknown as CreateCertificatePayload;
        const missingFields = REQUIRED_BATCH_FIELDS
          .filter(({ key }) => !source[key]?.trim())
          .map(({ label }) => label);

        const isValid = missingFields.length === 0;

        return {
          originalIndex: originalIndex + 1,
          record,
          isValid,
          missingFields,
        };
      })
      .filter(({ record }) =>
        Object.values(record).some((val) => typeof val === "string" && val.trim() !== "")
      );
  }, [sourceRows]);

  const mappedRows = useMemo(() => mappedRowsWithStatus.map((item) => item.record), [mappedRowsWithStatus]);
  const validRowsCount = useMemo(() => mappedRowsWithStatus.filter((item) => item.isValid).length, [mappedRowsWithStatus]);
  const invalidRowsCount = useMemo(() => mappedRowsWithStatus.filter((item) => !item.isValid).length, [mappedRowsWithStatus]);

  const activeRecord = sourceRows[activeRecordIndex] || { ...EMPTY_RECORD };

  const filteredPreviewRows = useMemo(() => {
    return mappedRowsWithStatus.filter((item) => {
      if (previewTab === "VALID" && !item.isValid) return false;
      if (previewTab === "INVALID" && item.isValid) return false;
      if (searchKeyword.trim()) {
        const kw = searchKeyword.toLowerCase().trim();
        const studentId = (item.record.student_id || "").toLowerCase();
        const fullName = (item.record.student_fullName || "").toLowerCase();
        const certTitle = (item.record.certificate_title || "").toLowerCase();
        const serial = (item.record.serialNumber || "").toLowerCase();
        return studentId.includes(kw) || fullName.includes(kw) || certTitle.includes(kw) || serial.includes(kw);
      }
      return true;
    });
  }, [mappedRowsWithStatus, previewTab, searchKeyword]);

  function resetImport() {
    setFileName("");
    setSourceRows([{ ...EMPTY_RECORD }]);
    setSearchKeyword("");
    setActiveRecordIndex(0);
    setPreviewTab("ALL");
  }

  async function executeBatch() {
    setShowConfirmBatch(false);
    setSubmitting(true);
    try {
      const result = await operationsApi.createBatch(fileName || t("admin.batches.default_batch_name", { date: new Date().toLocaleDateString("vi-VN") }), mappedRows, mode);
      setSelected(result);
      resetImport();
      await load();
      toast.success(
        mode === "FULL"
          ? t("admin.batches.batch_success_full", { success: result.successRows, total: result.totalRows })
          : t("admin.batches.batch_success_draft", { success: result.successRows, total: result.totalRows })
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("admin.batches.create_batch_failed"));
    } finally {
      setSubmitting(false);
    }
  }

  function requestConfirm() {
    if (!mappedRows.length || invalidRowsCount > 0) {
      toast.error(t("admin.batches.fill_required_fields"));
      return;
    }
    setShowConfirmBatch(true);
  }

  async function openBatch(batch: IssuanceBatch) {
    try { setSelected(await operationsApi.getBatch(batch.id)); }
    catch (err) { toast.error(err instanceof Error ? err.message : t("admin.batches.view_batch_failed")); }
  }

  async function retry(itemId: string) {
    if (!selected) return;
    try {
      setSelected(await operationsApi.retryBatchItem(selected.id, itemId));
      await load();
      toast.success(t("admin.batches.retry_success"));
    } catch (err) { toast.error(err instanceof Error ? err.message : t("admin.batches.retry_failed")); }
  }

  function exportErrors() {
    const rows = (selected?.items || []).filter((item) => item.status === "FAILED").map((item) => ({
      row: item.rowNumber,
      ...item.input,
      error: item.error,
    }));
    downloadFile(new Blob(["\uFEFF" + toCsv(rows)], { type: "text/csv;charset=utf-8" }), `${selected?.name || "batch"}-errors.csv`);
  }

  return (
    <div className={styles._1}>
      <ConfirmModal
        open={showConfirmBatch}
        onClose={() => setShowConfirmBatch(false)}
        title={t("admin.batches.confirm_batch_title")}
        message={mode === "FULL" ? t("admin.batches.confirm_batch_full", { count: mappedRows.length }) : t("admin.batches.confirm_batch_draft", { count: mappedRows.length })}
        confirmLabel={mode === "FULL" ? t("admin.batches.confirm_issue") : t("admin.batches.confirm_draft")}
        cancelLabel={t("common.cancel")}
        variant="warning"
        icon="warning"
        loading={submitting}
        onConfirm={() => void executeBatch()}
      />

      {/* Header aligned with Cấp bằng mới */}
      <div>
        <h1 className={styles._2}>{t("admin.batches.title")}</h1>
        <p className={styles._3}>{t("admin.batches.description")}</p>
      </div>

      {/* OCR Drag-and-Drop Dropzone Panel matching Cấp bằng mới */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800/60 rounded-2xl p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wide">{t("admin.batches.ocr_upload_title")}</div>
          <select
            value={ocrLang}
            onChange={(e) => setOcrLang(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="vie">{t("admin.batches.lang_vietnamese")}</option>
            <option value="eng">{t("admin.batches.lang_english")}</option>
          </select>
        </div>

        <label
          className="relative border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors flex flex-col items-center gap-3"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleOcrDrop}
        >
          <svg className="w-12 h-12 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t("admin.batches.dropzone_text")}</div>
          <div className="text-[10px] text-gray-400 dark:text-gray-500">{t("admin.batches.dropzone_hint")}</div>
          <input type="file" accept="image/jpeg,image/png,image/webp,image/tiff" multiple onChange={onOcrFiles} className="hidden" disabled={scanningOcr} />
        </label>
      </div>

      {scanningOcr && (
        <div className="rounded-2xl border border-teal-200 bg-teal-50/80 p-4 text-xs font-bold text-teal-800 flex items-center gap-3 animate-pulse">
          <div className="w-5 h-5 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
          {t("admin.batches.ocr_scanning_indicator")}
        </div>
      )}

      {/* Main Form & Edit Section (ALWAYS VISIBLE BY DEFAULT) */}
      <section className="space-y-6">
        {/* Header Banner & Record Switcher */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800/60 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary font-black text-sm flex items-center justify-center">
                🎓
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-900 dark:text-white">{fileName || t("admin.batches.new_batch")}</h2>
                <p className="text-xs text-gray-500">{t("admin.batches.entering_data", { count: sourceRows.length })}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {isIssuer ? (
                <div className="flex items-center bg-gray-100 dark:bg-gray-800/80 p-1 rounded-xl border border-gray-200/60 dark:border-gray-700/60">
                  <button
                    type="button"
                    onClick={() => setMode("FULL")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${mode === "FULL" ? "bg-primary text-white shadow-sm" : "text-gray-500 hover:text-gray-900 dark:text-gray-400"}`}
                  >
                    {t("admin.batches.blockchain_issue")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("DRAFT_ONLY")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${mode === "DRAFT_ONLY" ? "bg-primary text-white shadow-sm" : "text-gray-500 hover:text-gray-900 dark:text-gray-400"}`}
                  >
                    {t("admin.batches.create_draft")}
                  </button>
                </div>
              ) : (
                <span className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 text-xs font-bold border border-amber-200/60">
                  {t("admin.batches.draft_pending_issuer")}
                </span>
              )}

              <button
                type="button"
                onClick={addNewRecord}
                className="px-3 py-1.5 text-xs font-bold text-primary bg-primary/10 rounded-xl hover:bg-primary/20 transition-all flex items-center gap-1"
              >
                + {t("admin.batches.add_certificate")}
              </button>

              <button
                type="button"
                onClick={resetImport}
                className="px-3 py-1.5 text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/30 rounded-xl hover:bg-rose-100 transition-all"
              >
                {t("common.refresh")}
              </button>
            </div>
          </div>

          {/* Record Switcher Stepper */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wide mr-1">{t("admin.batches.certificate_label")}</span>
            {sourceRows.map((row, idx) => {
              const title = row.student_fullName || row.student_id || t("admin.batches.certificate_number", { number: idx + 1 });
              const isValid = REQUIRED_BATCH_FIELDS.every(({ key }) => !!row[key]?.trim());
              return (
                <div key={idx} className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => setActiveRecordIndex(idx)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${activeRecordIndex === idx
                      ? "bg-primary text-white shadow-sm"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200"
                    }`}
                  >
                    <span>#{idx + 1} {title}</span>
                    {!isValid && <span className="text-[10px] text-amber-400 font-extrabold">⚠</span>}
                  </button>
                  {sourceRows.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeActiveRecord(idx)}
                      title={t("admin.batches.remove_certificate")}
                      className="text-xs text-gray-400 hover:text-rose-500 px-1"
                    >
                      ✕
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Editor Card for Active Record (ALL 14 LABELS ARE REQUIRED *) */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800/60 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">
              {t("admin.batches.form_header", { current: activeRecordIndex + 1, total: sourceRows.length })}
            </span>
          </div>

          <div className={styles._28}>
            <div>
              <label className={styles._29}>{t("common.student")} *</label>
              {students.length > 0 ? (
                <select
                  className={styles._30}
                  value={activeRecord.student_id || ""}
                  onChange={(e) => {
                    const s = students.find((st) => st.student_id === e.target.value);
                    handleFieldEdit("student_id", e.target.value);
                    if (s) handleFieldEdit("student_fullName", s.student_fullName);
                  }}
                >
                  <option value="">{t("admin.batches.select_student")}</option>
                  {students.map((s) => (
                    <option key={s.student_id} value={s.student_id}>
                      {s.student_fullName} ({s.email})
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  className={styles._30}
                  placeholder={t("admin.batches.student_id_placeholder")}
                  value={activeRecord.student_id || ""}
                  onChange={(e) => handleFieldEdit("student_id", e.target.value)}
                />
              )}
            </div>

            <div>
              <label className={styles._29}>{t("common.student_name")} *</label>
              <input
                type="text"
                className={styles._30}
                placeholder={t("admin.batches.student_name_placeholder")}
                value={activeRecord.student_fullName || ""}
                onChange={(e) => handleFieldEdit("student_fullName", e.target.value)}
              />
            </div>

            <div>
              <label className={styles._29}>{t("admin.batches.certificate_title")} *</label>
              <input
                type="text"
                className={styles._30}
                placeholder={t("admin.batches.cert_title_placeholder")}
                value={activeRecord.certificate_title || ""}
                onChange={(e) => handleFieldEdit("certificate_title", e.target.value)}
              />
            </div>

            <div>
              <label className={styles._29}>{t("admin.batches.dob")} *</label>
              <input
                type="text"
                className={styles._30}
                placeholder={t("admin.batches.dob_placeholder")}
                value={activeRecord.dob || ""}
                onChange={(e) => handleFieldEdit("dob", e.target.value)}
              />
            </div>

            <div>
              <label className={styles._29}>{t("admin.batches.place_of_birth")} *</label>
              <input
                type="text"
                className={styles._30}
                placeholder={t("admin.batches.place_of_birth_placeholder")}
                value={activeRecord.placeOfBirth || ""}
                onChange={(e) => handleFieldEdit("placeOfBirth", e.target.value)}
              />
            </div>

            <div>
              <label className={styles._29}>{t("admin.batches.gender")} *</label>
              <input
                type="text"
                className={styles._30}
                placeholder={t("admin.batches.gender_placeholder")}
                value={activeRecord.gender || ""}
                onChange={(e) => handleFieldEdit("gender", e.target.value)}
              />
            </div>

            <div>
              <label className={styles._29}>{t("admin.batches.ethnicity")} *</label>
              <input
                type="text"
                className={styles._30}
                placeholder={t("admin.batches.ethnicity_placeholder")}
                value={activeRecord.ethnicity || ""}
                onChange={(e) => handleFieldEdit("ethnicity", e.target.value)}
              />
            </div>

            <div>
              <label className={styles._29}>{t("admin.batches.school_name")} *</label>
              <input
                type="text"
                className={styles._30}
                placeholder={t("admin.batches.school_name_placeholder")}
                value={activeRecord.schoolName || ""}
                onChange={(e) => handleFieldEdit("schoolName", e.target.value)}
              />
            </div>

            <div>
              <label className={styles._29}>{t("admin.batches.exam_cohort")} *</label>
              <input
                type="text"
                className={styles._30}
                placeholder={t("admin.batches.exam_cohort_placeholder")}
                value={activeRecord.examCohort || ""}
                onChange={(e) => handleFieldEdit("examCohort", e.target.value)}
              />
            </div>

            <div>
              <label className={styles._29}>{t("admin.batches.exam_board")} *</label>
              <input
                type="text"
                className={styles._30}
                placeholder={t("admin.batches.exam_board_placeholder")}
                value={activeRecord.examBoard || ""}
                onChange={(e) => handleFieldEdit("examBoard", e.target.value)}
              />
            </div>

            <div>
              <label className={styles._29}>{t("admin.batches.issue_location")} *</label>
              <input
                type="text"
                className={styles._30}
                placeholder={t("admin.batches.issue_location_placeholder")}
                value={activeRecord.issueLocation || ""}
                onChange={(e) => handleFieldEdit("issueLocation", e.target.value)}
              />
            </div>

            <div>
              <label className={styles._29}>{t("admin.batches.issue_date")} *</label>
              <input
                type="text"
                className={styles._30}
                placeholder={t("admin.batches.issue_date_placeholder")}
                value={activeRecord.issueDate || ""}
                onChange={(e) => handleFieldEdit("issueDate", e.target.value)}
              />
            </div>

            <div>
              <label className={styles._29}>{t("admin.batches.serial_number")} *</label>
              <input
                type="text"
                className={styles._30}
                placeholder={t("admin.batches.serial_number_placeholder")}
                value={activeRecord.serialNumber || ""}
                onChange={(e) => handleFieldEdit("serialNumber", e.target.value)}
              />
            </div>

            <div>
              <label className={styles._29}>{t("admin.batches.registry_number")} *</label>
              <input
                type="text"
                className={styles._30}
                placeholder={t("admin.batches.registry_number_placeholder")}
                value={activeRecord.registryNumber || ""}
                onChange={(e) => handleFieldEdit("registryNumber", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Lô Cấp Phát Scanned Data Overview Data Grid (All 14 labels required) */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800/60 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 dark:border-gray-800 pb-4">
            <div>
              <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wide">{t("admin.batches.overview_table_title")}</h3>
              <p className="text-[11px] text-gray-500">{t("admin.batches.overview_table_desc")}</p>
            </div>

            {/* Filter Tabs & Search */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setPreviewTab("ALL")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${previewTab === "ALL" ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm" : "text-gray-500"}`}
                >
                  {t("common.all")} ({mappedRowsWithStatus.length})
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTab("VALID")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${previewTab === "VALID" ? "bg-white dark:bg-gray-900 text-emerald-600 shadow-sm" : "text-gray-500"}`}
                >
                  ✓ {t("admin.batches.valid")} ({validRowsCount})
                </button>
                {invalidRowsCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setPreviewTab("INVALID")}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${previewTab === "INVALID" ? "bg-white dark:bg-gray-900 text-rose-600 shadow-sm" : "text-gray-500"}`}
                  >
                    {t("admin.batches.missing_info", { count: invalidRowsCount })}
                  </button>
                )}
              </div>

              <input
                type="text"
                placeholder={t("common.search")}
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-48 rounded-xl border border-gray-200 bg-transparent px-3 py-1.5 text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:border-gray-700"
              />
            </div>
          </div>

          {/* Scanned Data Table View */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-700/80">
                <tr className="text-slate-700 dark:text-slate-200 font-bold text-xs uppercase tracking-wider">
                  <th className="py-3.5 px-3 w-12 text-center">{t("common.table.no")}</th>
                  <th className="py-3.5 px-3">{t("common.student")} *</th>
                  <th className="py-3.5 px-3">{t("common.student_name")} *</th>
                  <th className="py-3.5 px-3">{t("admin.batches.certificate_title")} *</th>
                  <th className="py-3.5 px-3">{t("admin.batches.dob")} *</th>
                  <th className="py-3.5 px-3">{t("admin.batches.place_of_birth")} *</th>
                  <th className="py-3.5 px-3">{t("admin.batches.school_name")} *</th>
                  <th className="py-3.5 px-3">{t("admin.batches.serial_number")} *</th>
                  <th className="py-3.5 px-3">{t("admin.batches.registry_number")} *</th>
                  <th className="py-3.5 px-3 text-center">{t("common.status")}</th>
                  <th className="py-3.5 px-3 text-center">{t("common.actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredPreviewRows.map((item) => (
                  <tr
                    key={item.originalIndex}
                    className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${!item.isValid ? "bg-rose-50/30 dark:bg-rose-950/10" : ""}`}
                  >
                    <td className="p-3 text-center font-bold text-gray-400">{item.originalIndex}</td>
                    <td className="p-1">
                      <input
                        type="text"
                        value={item.record.student_id || ""}
                        placeholder={t("admin.batches.student_code_placeholder")}
                        onChange={(e) => handleTableRowEdit(item.originalIndex, "student_id", e.target.value)}
                        className="w-full bg-transparent px-2 py-1.5 rounded font-mono font-bold text-primary dark:text-teal-400 focus:bg-white dark:focus:bg-slate-800 border border-transparent focus:border-primary outline-none"
                      />
                    </td>
                    <td className="p-1">
                      <input
                        type="text"
                        value={item.record.student_fullName || ""}
                        placeholder={t("admin.batches.full_name_placeholder")}
                        onChange={(e) => handleTableRowEdit(item.originalIndex, "student_fullName", e.target.value)}
                        className="w-full bg-transparent px-2 py-1.5 rounded font-semibold text-gray-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 border border-transparent focus:border-primary outline-none"
                      />
                    </td>
                    <td className="p-1">
                      <input
                        type="text"
                        value={item.record.certificate_title || ""}
                        placeholder={t("admin.batches.cert_title_short_placeholder")}
                        onChange={(e) => handleTableRowEdit(item.originalIndex, "certificate_title", e.target.value)}
                        className="w-full bg-transparent px-2 py-1.5 rounded font-medium text-gray-800 dark:text-gray-200 focus:bg-white dark:focus:bg-slate-800 border border-transparent focus:border-primary outline-none"
                      />
                    </td>
                    <td className="p-1">
                      <input
                        type="text"
                        value={item.record.dob || ""}
                        placeholder={t("admin.batches.dob_short_placeholder")}
                        onChange={(e) => handleTableRowEdit(item.originalIndex, "dob", e.target.value)}
                        className="w-full bg-transparent px-2 py-1.5 rounded text-gray-600 dark:text-gray-400 focus:bg-white dark:focus:bg-slate-800 border border-transparent focus:border-primary outline-none"
                      />
                    </td>
                    <td className="p-1">
                      <input
                        type="text"
                        value={item.record.placeOfBirth || ""}
                        placeholder={t("admin.batches.place_of_birth_short_placeholder")}
                        onChange={(e) => handleTableRowEdit(item.originalIndex, "placeOfBirth", e.target.value)}
                        className="w-full bg-transparent px-2 py-1.5 rounded text-gray-600 dark:text-gray-400 focus:bg-white dark:focus:bg-slate-800 border border-transparent focus:border-primary outline-none"
                      />
                    </td>
                    <td className="p-1">
                      <input
                        type="text"
                        value={item.record.schoolName || ""}
                        placeholder={t("admin.batches.school_short_placeholder")}
                        onChange={(e) => handleTableRowEdit(item.originalIndex, "schoolName", e.target.value)}
                        className="w-full bg-transparent px-2 py-1.5 rounded text-gray-600 dark:text-gray-400 focus:bg-white dark:focus:bg-slate-800 border border-transparent focus:border-primary outline-none"
                      />
                    </td>
                    <td className="p-1">
                      <input
                        type="text"
                        value={item.record.serialNumber || ""}
                        placeholder={t("admin.batches.serial_short_placeholder")}
                        onChange={(e) => handleTableRowEdit(item.originalIndex, "serialNumber", e.target.value)}
                        className="w-full bg-transparent px-2 py-1.5 rounded font-mono text-gray-600 dark:text-gray-400 focus:bg-white dark:focus:bg-slate-800 border border-transparent focus:border-primary outline-none"
                      />
                    </td>
                    <td className="p-1">
                      <input
                        type="text"
                        value={item.record.registryNumber || ""}
                        placeholder={t("admin.batches.registry_short_placeholder")}
                        onChange={(e) => handleTableRowEdit(item.originalIndex, "registryNumber", e.target.value)}
                        className="w-full bg-transparent px-2 py-1.5 rounded font-mono text-gray-600 dark:text-gray-400 focus:bg-white dark:focus:bg-slate-800 border border-transparent focus:border-primary outline-none"
                      />
                    </td>
                    <td className="p-3 text-center">
                      {item.isValid ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold">
                          ✓ {t("admin.batches.ready")}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-[11px] font-bold" title={t("admin.batches.missing_tooltip", { fields: item.missingFields.join(", ") })}>
                          {t("admin.batches.missing_count", { count: item.missingFields.length })}
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        type="button"
                        onClick={() => setActiveRecordIndex(item.originalIndex - 1)}
                        className="px-2.5 py-1 text-[11px] font-bold text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-all"
                      >
                        {t("admin.batches.edit_form")}
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredPreviewRows.length === 0 && (
                  <tr>
                    <td colSpan={11} className="p-8 text-center text-xs text-gray-400">
                      {searchKeyword ? t("admin.batches.no_search_results") : t("admin.batches.no_data")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Execution Footer Bar */}
          <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-4 mt-4">
            <div className="text-xs text-gray-500">
              {t("admin.batches.valid_summary", { valid: validRowsCount, total: mappedRows.length })}
            </div>
            <button
              type="button"
              disabled={submitting || mappedRows.length === 0 || invalidRowsCount > 0}
              onClick={requestConfirm}
              className="px-6 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-md transition-all disabled:opacity-50"
            >
              {submitting ? t("common.processing") : mode === "FULL" ? t("admin.batches.confirm_issue_count", { count: mappedRows.length }) : t("admin.batches.confirm_draft_count", { count: mappedRows.length })}
            </button>
          </div>
        </div>
      </section>

      {error && <div role="alert" className="rounded-xl bg-red-50 p-4 text-xs font-semibold text-red-600">{error}</div>}

      {/* Historical Batches List */}
      <div className={styles._6}>
        <div className={styles._7}>
          <table className={styles._8}>
            <thead className={styles._9}>
              <tr>
                <th className={styles._10}>{t("admin.batches.batch_name")}</th>
                <th className={styles._11}>{t("admin.batches.progress")}</th>
                <th className={styles._11}>{t("common.success")}</th>
                <th className={styles._11}>{t("common.error")}</th>
                <th className={styles._10}>{t("admin.batches.created_by")}</th>
                <th className={styles._12}>{t("common.actions")}</th>
              </tr>
            </thead>
            <tbody className={styles._13}>
              {batches.map((batch) => (
                <tr className={styles._14} key={batch.id}>
                  <td className={styles._15}>
                    {batch.name}
                    <div className="mt-1 text-[10px] font-normal text-gray-400 dark:text-gray-500">{new Date(batch.createdAt).toLocaleString("vi-VN")}</div>
                  </td>
                  <td className={styles._17}>
                    {batch.status}
                    <div className="mx-auto mt-2 h-1.5 w-24 overflow-hidden rounded-full bg-gray-100">
                      <div className="h-full bg-teal-500" style={{ width: `${batch.totalRows ? ((batch.successRows + batch.failedRows) / batch.totalRows) * 100 : 0}%` }} />
                    </div>
                  </td>
                  <td className={styles._18}>{batch.successRows}/{batch.totalRows}</td>
                  <td className={styles._19}>{batch.failedRows}</td>
                  <td className={styles._16}>{batch.createdByName}</td>
                  <td className={styles._12}>
                    <button className={styles._20} onClick={() => openBatch(batch)}>{t("common.detail")}</button>
                  </td>
                </tr>
              ))}
              {!loading && batches.length === 0 && (
                <tr><td colSpan={6} className="p-8 text-center text-xs text-gray-400 dark:text-gray-500">{t("admin.batches.no_batches")}</td></tr>
              )}
              {loading && (
                <tr><td colSpan={6} className="p-8 text-center text-xs text-gray-400 dark:text-gray-500">{t("common.loading")}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Batch Result Modal/Detail view */}
      {selected && (
        <section className="rounded-3xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-black text-gray-900 dark:text-white">{t("admin.batches.result_title")}: {selected.name}</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t("admin.batches.result_summary", { success: selected.successRows, failed: selected.failedRows })}</p>
            </div>
            <div className="flex gap-2">
              {selected.failedRows > 0 && <button className="rounded-lg border px-3 py-2 text-xs font-bold" onClick={exportErrors}>{t("admin.batches.export_errors_csv")}</button>}
              <button aria-label={t("common.close")} className="px-2" onClick={() => setSelected(null)}>✕</button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b text-gray-500 dark:text-gray-400">
                  <th className="p-3">{t("admin.batches.row")}</th>
                  <th className="p-3">{t("common.student")}</th>
                  <th className="p-3">{t("admin.batches.serial_number")}</th>
                  <th className="p-3">{t("common.status")}</th>
                  <th className="p-3">{t("admin.batches.result")}</th>
                </tr>
              </thead>
              <tbody>
                {selected.items?.map((item) => (
                  <tr className="border-b border-gray-100 dark:border-gray-800" key={item.id}>
                    <td className="p-3">{item.rowNumber}</td>
                    <td className="p-3 font-mono">{item.input.student_id}</td>
                    <td className="p-3">{item.input.serialNumber}</td>
                    <td className={`p-3 font-bold ${item.status === "SUCCESS" ? "text-green-600" : "text-red-500"}`}>{item.status}</td>
                    <td className="max-w-sm p-3 text-gray-500 dark:text-gray-400">
                      {item.error || item.certificateId || "—"}{" "}
                      {item.status === "FAILED" && <button className="ml-2 font-bold text-teal-600" onClick={() => retry(item.id)}>Retry</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
