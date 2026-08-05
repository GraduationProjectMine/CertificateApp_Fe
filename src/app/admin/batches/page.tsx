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
import ConfirmModal from "@/components/common/Modal/ConfirmModal";
import Pagination from "@/components/common/Pagination";

function downloadFile(content: Blob, filename: string) {
  const url = URL.createObjectURL(content);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const REQUIRED_BATCH_FIELDS: Array<{ key: string; label: string }> = [
  { key: "student_id", label: "Sinh viên" },
  { key: "student_fullName", label: "Tên sinh viên" },
  { key: "certificate_title", label: "Tên văn bằng" },
  { key: "dob", label: "Ngày sinh" },
  { key: "placeOfBirth", label: "Nơi sinh" },
  { key: "gender", label: "Giới tính" },
  { key: "ethnicity", label: "Dân tộc" },
  { key: "schoolName", label: "Trường" },
  { key: "examCohort", label: "Niên khóa" },
  { key: "examBoard", label: "Hội đồng thi" },
  { key: "issueLocation", label: "Nơi cấp" },
  { key: "issueDate", label: "Ngày cấp" },
  { key: "serialNumber", label: "Số hiệu văn bằng" },
  { key: "registryNumber", label: "Số vào sổ" },
];

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

const BATCHES_PER_PAGE = 5;

export default function AdminBatchesPage() {
  const { user } = useAuth();
  const isIssuer = user?.role === "issuer";
  const [mode, setMode] = useState<"DRAFT_ONLY" | "FULL">(isIssuer ? "FULL" : "DRAFT_ONLY");
  const [batches, setBatches] = useState<IssuanceBatch[]>([]);
  const [selected, setSelected] = useState<IssuanceBatch | null>(null);
  const [showConfirmBatch, setShowConfirmBatch] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");
  const [batchCurrentPage, setBatchCurrentPage] = useState(1);

  const paginatedBatches = useMemo(() => {
    return batches.slice((batchCurrentPage - 1) * BATCHES_PER_PAGE, batchCurrentPage * BATCHES_PER_PAGE);
  }, [batches, batchCurrentPage]);

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
      setError(err instanceof Error ? err.message : "Không thể tải lô cấp phát");
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
      toast.loading(`Đang quét OCR ${files.length} ảnh văn bằng...`, { id: "ocr-batch" });
      const res = await ocrApi.extractDiplomasBatch(files, ocrLang);
      toast.dismiss("ocr-batch");

      if (!res.results || res.results.length === 0) {
        toast.error("Không tìm thấy dữ liệu từ ảnh");
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
          certificate_title: d.diploma_title || "BẰNG TỐT NGHIỆP",
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

      setFileName(`Lô quét OCR (${files.length} văn bằng)`);
      setSourceRows(rows);
      setActiveRecordIndex(0);

      toast.success(`Đã quét thành công ${res.total} ảnh văn bằng!`);
    } catch (err: any) {
      toast.dismiss("ocr-batch");
      toast.error(err.message || "Quét OCR thất bại");
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

  useEffect(() => {
    if (!isIssuer) setMode("DRAFT_ONLY");
  }, [isIssuer]);

  async function executeBatch() {
    setShowConfirmBatch(false);
    setSubmitting(true);
    const activeMode = isIssuer ? mode : "DRAFT_ONLY";
    try {
      const result = await operationsApi.createBatch(fileName || `Lô cấp phát ${new Date().toLocaleDateString("vi-VN")}`, mappedRows, activeMode);
      setSelected(result);
      resetImport();
      await load();
      toast.success(
        activeMode === "FULL"
          ? `Đã phát hành và đẩy Blockchain thành công ${result.successRows}/${result.totalRows} văn bằng!`
          : `Đã lưu DRAFT chờ duyệt thành công ${result.successRows}/${result.totalRows} văn bằng!`
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Không thể tạo lô cấp phát");
    } finally {
      setSubmitting(false);
    }
  }

  function requestConfirm() {
    if (!mappedRows.length || invalidRowsCount > 0) {
      toast.error("Vui lòng điền đầy đủ tất cả các trường thông tin bắt buộc (*) trước khi cấp phát lô");
      return;
    }
    setShowConfirmBatch(true);
  }

  async function openBatch(batch: IssuanceBatch) {
    try { setSelected(await operationsApi.getBatch(batch.id)); }
    catch (err) { toast.error(err instanceof Error ? err.message : "Không thể xem chi tiết lô"); }
  }

  async function retry(itemId: string) {
    if (!selected) return;
    try {
      setSelected(await operationsApi.retryBatchItem(selected.id, itemId));
      await load();
      toast.success("Đã xử lý lại dòng bị lỗi");
    } catch (err) { toast.error(err instanceof Error ? err.message : "Xử lý lại thất bại"); }
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
      {submitting && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="w-14 h-14 border-4 border-[#147D74] border-t-transparent rounded-full animate-spin mx-auto" />
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                {mode === "FULL" ? "Đang phát hành lô lên Blockchain" : "Đang tạo nháp lô văn bằng"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Đang xử lý dữ liệu &amp; ghi mã hóa. Vui lòng không đóng hoặc làm mới trang...
              </p>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={showConfirmBatch}
        onClose={() => setShowConfirmBatch(false)}
        title="Xác nhận phát hành lô văn bằng"
        message={mode === "FULL" ? `Bạn có chắc chắn muốn cấp ${mappedRows.length} văn bằng và ghi trực tiếp lên Blockchain?` : `Tạo ${mappedRows.length} văn bằng ở trạng thái DRAFT / PENDING (chờ Issuer duyệt phát hành sau).`}
        confirmLabel={mode === "FULL" ? "Xác nhận phát hành" : "Xác nhận tạo DRAFT"}
        cancelLabel="Hủy"
        variant="warning"
        icon="warning"
        loading={submitting}
        onConfirm={() => void executeBatch()}
      />

      {/* Header aligned with Cấp bằng mới */}
      <div>
        <h1 className={styles._2}>Cấp phát văn bằng theo lô & OCR</h1>
        <p className={styles._3}>Quét danh sách ảnh văn bằng, trích xuất thông tin OCR, nhập đầy đủ thông tin và lưu nháp DRAFT trước khi phát hành.</p>
      </div>

      {/* OCR Drag-and-Drop Dropzone Panel matching Cấp bằng mới */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800/60 rounded-2xl p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wide">Tải lên ảnh văn bằng (Quét OCR hàng loạt)</div>
          <select
            value={ocrLang}
            onChange={(e) => setOcrLang(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="vie">Ngôn ngữ: Tiếng Việt</option>
            <option value="eng">Ngôn ngữ: English</option>
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
          <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">Kéo thả danh sách ảnh văn bằng vào đây</div>
          <div className="text-[10px] text-gray-400 dark:text-gray-500">hoặc nhấp để chọn nhiều ảnh cùng lúc (JPEG, PNG, WebP, TIFF)</div>
          <input type="file" accept="image/jpeg,image/png,image/webp,image/tiff" multiple onChange={onOcrFiles} className="hidden" disabled={scanningOcr} />
        </label>
      </div>

      {scanningOcr && (
        <div className="rounded-2xl border border-teal-200 bg-teal-50/80 p-4 text-xs font-bold text-teal-800 flex items-center gap-3 animate-pulse">
          <div className="w-5 h-5 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
          Đang trích xuất OCR văn bằng... Vui lòng chờ trong giây lát.
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
                <h2 className="text-sm font-bold text-gray-900 dark:text-white">{fileName || "Lô văn bằng mới"}</h2>
                <p className="text-xs text-gray-500">Đang nhập dữ liệu cho {sourceRows.length} văn bằng (Tất cả thông tin là bắt buộc)</p>
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
                    Phát hành Blockchain
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("DRAFT_ONLY")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${mode === "DRAFT_ONLY" ? "bg-primary text-white shadow-sm" : "text-gray-500 hover:text-gray-900 dark:text-gray-400"}`}
                  >
                    Tạo DRAFT / Gửi duyệt
                  </button>
                </div>
              ) : (
                <span className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 text-xs font-bold border border-amber-200/60">
                  Tạo DRAFT (Chờ Issuer duyệt)
                </span>
              )}

              <button
                type="button"
                onClick={addNewRecord}
                className="px-3 py-1.5 text-xs font-bold text-primary bg-primary/10 rounded-xl hover:bg-primary/20 transition-all flex items-center gap-1"
              >
                + Thêm văn bằng
              </button>

              <button
                type="button"
                onClick={resetImport}
                className="px-3 py-1.5 text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/30 rounded-xl hover:bg-rose-100 transition-all"
              >
                Làm mới
              </button>
            </div>
          </div>

          {/* Record Switcher Stepper */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wide mr-1">Văn bằng:</span>
            {sourceRows.map((row, idx) => {
              const title = row.student_fullName || row.student_id || `Văn bằng #${idx + 1}`;
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
                      title="Xóa văn bằng này"
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
              Thông tin văn bằng #{activeRecordIndex + 1} / {sourceRows.length} (Tất cả thông tin là bắt buộc)
            </span>
          </div>

          <div className={styles._28}>
            <div>
              <label className={styles._29}>Sinh viên *</label>
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
                  <option value="">-- Chọn sinh viên --</option>
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
                  placeholder="Nhập ID sinh viên..."
                  value={activeRecord.student_id || ""}
                  onChange={(e) => handleFieldEdit("student_id", e.target.value)}
                />
              )}
            </div>

            <div>
              <label className={styles._29}>Tên sinh viên *</label>
              <input
                type="text"
                className={styles._30}
                placeholder="Họ và tên sinh viên"
                value={activeRecord.student_fullName || ""}
                onChange={(e) => handleFieldEdit("student_fullName", e.target.value)}
              />
            </div>

            <div>
              <label className={styles._29}>Tên văn bằng *</label>
              <input
                type="text"
                className={styles._30}
                placeholder="VD: BẰNG CỬ NHÂN KỸ THUẬT"
                value={activeRecord.certificate_title || ""}
                onChange={(e) => handleFieldEdit("certificate_title", e.target.value)}
              />
            </div>

            <div>
              <label className={styles._29}>Ngày sinh *</label>
              <input
                type="text"
                className={styles._30}
                placeholder="VD: 15/08/2002"
                value={activeRecord.dob || ""}
                onChange={(e) => handleFieldEdit("dob", e.target.value)}
              />
            </div>

            <div>
              <label className={styles._29}>Nơi sinh *</label>
              <input
                type="text"
                className={styles._30}
                placeholder="VD: Hà Nội"
                value={activeRecord.placeOfBirth || ""}
                onChange={(e) => handleFieldEdit("placeOfBirth", e.target.value)}
              />
            </div>

            <div>
              <label className={styles._29}>Giới tính *</label>
              <input
                type="text"
                className={styles._30}
                placeholder="VD: Nam / Nữ"
                value={activeRecord.gender || ""}
                onChange={(e) => handleFieldEdit("gender", e.target.value)}
              />
            </div>

            <div>
              <label className={styles._29}>Dân tộc *</label>
              <input
                type="text"
                className={styles._30}
                placeholder="VD: Kinh"
                value={activeRecord.ethnicity || ""}
                onChange={(e) => handleFieldEdit("ethnicity", e.target.value)}
              />
            </div>

            <div>
              <label className={styles._29}>Trường *</label>
              <input
                type="text"
                className={styles._30}
                placeholder="Tên trường..."
                value={activeRecord.schoolName || ""}
                onChange={(e) => handleFieldEdit("schoolName", e.target.value)}
              />
            </div>

            <div>
              <label className={styles._29}>Niên khóa *</label>
              <input
                type="text"
                className={styles._30}
                placeholder="VD: 2022 - 2026"
                value={activeRecord.examCohort || ""}
                onChange={(e) => handleFieldEdit("examCohort", e.target.value)}
              />
            </div>

            <div>
              <label className={styles._29}>Hội đồng thi *</label>
              <input
                type="text"
                className={styles._30}
                placeholder="VD: Hội đồng thi Kỹ thuật"
                value={activeRecord.examBoard || ""}
                onChange={(e) => handleFieldEdit("examBoard", e.target.value)}
              />
            </div>

            <div>
              <label className={styles._29}>Nơi cấp *</label>
              <input
                type="text"
                className={styles._30}
                placeholder="VD: Hà Nội"
                value={activeRecord.issueLocation || ""}
                onChange={(e) => handleFieldEdit("issueLocation", e.target.value)}
              />
            </div>

            <div>
              <label className={styles._29}>Ngày cấp *</label>
              <input
                type="text"
                className={styles._30}
                placeholder="VD: 20/06/2026"
                value={activeRecord.issueDate || ""}
                onChange={(e) => handleFieldEdit("issueDate", e.target.value)}
              />
            </div>

            <div>
              <label className={styles._29}>Số hiệu văn bằng *</label>
              <input
                type="text"
                className={styles._30}
                placeholder="VD: B123456"
                value={activeRecord.serialNumber || ""}
                onChange={(e) => handleFieldEdit("serialNumber", e.target.value)}
              />
            </div>

            <div>
              <label className={styles._29}>Số vào sổ *</label>
              <input
                type="text"
                className={styles._30}
                placeholder="VD: 789/QĐ-ĐH"
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
              <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wide">Bảng tổng quan dữ liệu cấp phát lô</h3>
              <p className="text-[11px] text-gray-500">Xem lại và chỉnh sửa trực tiếp trên từng dòng (Tất cả thông tin là bắt buộc)</p>
            </div>

            {/* Filter Tabs & Search */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setPreviewTab("ALL")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${previewTab === "ALL" ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm" : "text-gray-500"}`}
                >
                  Tất cả ({mappedRowsWithStatus.length})
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTab("VALID")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${previewTab === "VALID" ? "bg-white dark:bg-gray-900 text-emerald-600 shadow-sm" : "text-gray-500"}`}
                >
                  ✓ Hợp lệ ({validRowsCount})
                </button>
                {invalidRowsCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setPreviewTab("INVALID")}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${previewTab === "INVALID" ? "bg-white dark:bg-gray-900 text-rose-600 shadow-sm" : "text-gray-500"}`}
                  >
                    ⚠ Thiếu thông tin ({invalidRowsCount})
                  </button>
                )}
              </div>

              <input
                type="text"
                placeholder="Tìm kiếm..."
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
                  <th className="py-3.5 px-3 w-12 text-center">STT</th>
                  <th className="py-3.5 px-3">Sinh viên *</th>
                  <th className="py-3.5 px-3">Tên sinh viên *</th>
                  <th className="py-3.5 px-3">Tên văn bằng *</th>
                  <th className="py-3.5 px-3">Ngày sinh *</th>
                  <th className="py-3.5 px-3">Nơi sinh *</th>
                  <th className="py-3.5 px-3">Trường *</th>
                  <th className="py-3.5 px-3">Số hiệu *</th>
                  <th className="py-3.5 px-3">Số vào sổ *</th>
                  <th className="py-3.5 px-3 text-center">Trạng thái</th>
                  <th className="py-3.5 px-3 text-center">Thao tác</th>
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
                        placeholder="Mã SV..."
                        onChange={(e) => handleTableRowEdit(item.originalIndex, "student_id", e.target.value)}
                        className="w-full bg-transparent px-2 py-1.5 rounded font-mono font-bold text-primary dark:text-teal-400 focus:bg-white dark:focus:bg-slate-800 border border-transparent focus:border-primary outline-none"
                      />
                    </td>
                    <td className="p-1">
                      <input
                        type="text"
                        value={item.record.student_fullName || ""}
                        placeholder="Họ tên..."
                        onChange={(e) => handleTableRowEdit(item.originalIndex, "student_fullName", e.target.value)}
                        className="w-full bg-transparent px-2 py-1.5 rounded font-semibold text-gray-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 border border-transparent focus:border-primary outline-none"
                      />
                    </td>
                    <td className="p-1">
                      <input
                        type="text"
                        value={item.record.certificate_title || ""}
                        placeholder="Tên văn bằng..."
                        onChange={(e) => handleTableRowEdit(item.originalIndex, "certificate_title", e.target.value)}
                        className="w-full bg-transparent px-2 py-1.5 rounded font-medium text-gray-800 dark:text-gray-200 focus:bg-white dark:focus:bg-slate-800 border border-transparent focus:border-primary outline-none"
                      />
                    </td>
                    <td className="p-1">
                      <input
                        type="text"
                        value={item.record.dob || ""}
                        placeholder="Ngày sinh..."
                        onChange={(e) => handleTableRowEdit(item.originalIndex, "dob", e.target.value)}
                        className="w-full bg-transparent px-2 py-1.5 rounded text-gray-600 dark:text-gray-400 focus:bg-white dark:focus:bg-slate-800 border border-transparent focus:border-primary outline-none"
                      />
                    </td>
                    <td className="p-1">
                      <input
                        type="text"
                        value={item.record.placeOfBirth || ""}
                        placeholder="Nơi sinh..."
                        onChange={(e) => handleTableRowEdit(item.originalIndex, "placeOfBirth", e.target.value)}
                        className="w-full bg-transparent px-2 py-1.5 rounded text-gray-600 dark:text-gray-400 focus:bg-white dark:focus:bg-slate-800 border border-transparent focus:border-primary outline-none"
                      />
                    </td>
                    <td className="p-1">
                      <input
                        type="text"
                        value={item.record.schoolName || ""}
                        placeholder="Trường..."
                        onChange={(e) => handleTableRowEdit(item.originalIndex, "schoolName", e.target.value)}
                        className="w-full bg-transparent px-2 py-1.5 rounded text-gray-600 dark:text-gray-400 focus:bg-white dark:focus:bg-slate-800 border border-transparent focus:border-primary outline-none"
                      />
                    </td>
                    <td className="p-1">
                      <input
                        type="text"
                        value={item.record.serialNumber || ""}
                        placeholder="Số hiệu..."
                        onChange={(e) => handleTableRowEdit(item.originalIndex, "serialNumber", e.target.value)}
                        className="w-full bg-transparent px-2 py-1.5 rounded font-mono text-gray-600 dark:text-gray-400 focus:bg-white dark:focus:bg-slate-800 border border-transparent focus:border-primary outline-none"
                      />
                    </td>
                    <td className="p-1">
                      <input
                        type="text"
                        value={item.record.registryNumber || ""}
                        placeholder="Số vào sổ..."
                        onChange={(e) => handleTableRowEdit(item.originalIndex, "registryNumber", e.target.value)}
                        className="w-full bg-transparent px-2 py-1.5 rounded font-mono text-gray-600 dark:text-gray-400 focus:bg-white dark:focus:bg-slate-800 border border-transparent focus:border-primary outline-none"
                      />
                    </td>
                    <td className="p-3 text-center">
                      {item.isValid ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold">
                          ✓ Sẵn sàng
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-[11px] font-bold" title={`Thiếu: ${item.missingFields.join(", ")}`}>
                          ⚠ Thiếu {item.missingFields.length} thông tin
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        type="button"
                        onClick={() => setActiveRecordIndex(item.originalIndex - 1)}
                        className="px-2.5 py-1 text-[11px] font-bold text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-all"
                      >
                        Sửa Form
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredPreviewRows.length === 0 && (
                  <tr>
                    <td colSpan={11} className="p-8 text-center text-xs text-gray-400">
                      {searchKeyword ? "Không tìm thấy kết quả phù hợp." : "Chưa có dữ liệu. Vui lòng nhập dữ liệu hoặc quét OCR ảnh văn bằng."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Execution Footer Bar */}
          <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-4 mt-4">
            <div className="text-xs text-gray-500">
              {validRowsCount} / {mappedRows.length} văn bằng hợp lệ (Đầy đủ tất cả trường thông tin)
            </div>
            <button
              type="button"
              disabled={submitting || mappedRows.length === 0 || invalidRowsCount > 0}
              onClick={requestConfirm}
              className="px-6 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-md transition-all disabled:opacity-50"
            >
              {submitting ? "Đang xử lý..." : mode === "FULL" ? `Xác nhận phát hành ${mappedRows.length} văn bằng` : `Xác nhận tạo ${mappedRows.length} DRAFT`}
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
                <th className={styles._10}>Tên lô</th>
                <th className={styles._11}>Tiến độ</th>
                <th className={styles._11}>Thành công</th>
                <th className={styles._11}>Lỗi</th>
                <th className={styles._10}>Người tạo</th>
                <th className={styles._12}>Thao tác</th>
              </tr>
            </thead>
            <tbody className={styles._13}>
              {paginatedBatches.map((batch) => (
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
                    <button className={styles._20} onClick={() => openBatch(batch)}>Chi tiết</button>
                  </td>
                </tr>
              ))}
              {!loading && batches.length === 0 && (
                <tr><td colSpan={6} className="p-8 text-center text-xs text-gray-400 dark:text-gray-500">Chưa có lô cấp phát.</td></tr>
              )}
              {loading && (
                <tr><td colSpan={6} className="p-8 text-center text-xs text-gray-400 dark:text-gray-500">Đang tải...</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          currentPage={batchCurrentPage}
          totalPages={Math.ceil(batches.length / BATCHES_PER_PAGE)}
          totalItems={batches.length}
          itemsPerPage={BATCHES_PER_PAGE}
          onPageChange={setBatchCurrentPage}
        />
      </div>

      {/* Batch Result Modal/Detail view */}
      {selected && (
        <section className="rounded-3xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-black text-gray-900 dark:text-white">Kết quả: {selected.name}</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">{selected.successRows} thành công · {selected.failedRows} lỗi</p>
            </div>
            <div className="flex gap-2">
              {selected.failedRows > 0 && <button className="rounded-lg border px-3 py-2 text-xs font-bold" onClick={exportErrors}>Xuất lỗi CSV</button>}
              <button aria-label="Đóng chi tiết" className="px-2" onClick={() => setSelected(null)}>✕</button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b text-gray-500 dark:text-gray-400">
                  <th className="p-3">Dòng</th>
                  <th className="p-3">Sinh viên</th>
                  <th className="p-3">Số hiệu</th>
                  <th className="p-3">Trạng thái</th>
                  <th className="p-3">Kết quả</th>
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
