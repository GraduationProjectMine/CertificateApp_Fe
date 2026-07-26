"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import styles from "./page.module.css";
import { operationsApi, type IssuanceBatch } from "@/features/admin/services/operations.api";
import { parseCsv, toCsv } from "@/features/admin/utils/csv";
import {
  certificateImportFields as fields,
  createCertificateTemplateCsv,
  createCertificateTemplateHtmlExcel,
} from "@/features/admin/utils/certificate-import-template";
import type { CreateCertificatePayload } from "@/features/certificates/services/certificate.api";
import { ipfsApi } from "@/features/ipfs/services/ipfs.api";
import {
  extractZipEntries,
  isSupportedDocumentPath,
  matchPackageDocument,
  type BatchDocument,
} from "@/features/admin/utils/batch-package";
import { useAuth } from "@/features/auth/components/AuthContext";
import ConfirmModal from "@/components/common/Modal/ConfirmModal";
import Tooltip from "@/components/common/Tooltip";

function downloadFile(content: Blob, filename: string) {
  const url = URL.createObjectURL(content);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function downloadCsvTemplate() {
  downloadFile(new Blob(["\uFEFF" + createCertificateTemplateCsv()], { type: "text/csv;charset=utf-8" }), "certificate-import-template.csv");
}

function downloadExcelTemplate() {
  const htmlContent = createCertificateTemplateHtmlExcel();
  downloadFile(
    new Blob(["\uFEFF" + htmlContent], { type: "application/vnd.ms-excel;charset=utf-8" }),
    "certificate-import-template.xls"
  );
}

const COL_MAP: Record<string, string> = {
  "id sinh viên": "student_id",
  "tên văn bằng": "certificate_title",
  "tên sinh viên": "student_fullName",
  "họ tên": "student_fullName",
  "họ tên sinh viên": "student_fullName",
  "ngày sinh": "dob",
  "nơi sinh": "placeOfBirth",
  "giới tính": "gender",
  "dân tộc": "ethnicity",
  "tên trường": "schoolName",
  "khóa": "examCohort",
  "năm tn": "examCohort",
  "hội đồng thi": "examBoard",
  "nơi cấp": "issueLocation",
  "ngày cấp": "issueDate",
  "số hiệu": "serialNumber",
  "số vào sổ": "registryNumber",
  "ipfs cid (file văn bằng)": "ipfs_cid",
  "ipfs cid": "ipfs_cid",
  "cid": "ipfs_cid",
  "mã ipfs": "ipfs_cid",
  "tên file văn bằng": "document_file",
  "document file": "document_file",
  "document_file": "document_file",
  "file văn bằng": "document_file",
  "tên file": "document_file",
};

function autoMapHeaders(headers: string[]): Record<string, string> {
  const mapping: Record<string, string> = {};
  const fieldKeys = fields.map((f) => f.key);
  const fieldLabels = fields.map((f) => f.label.toLowerCase());
  for (const key of fieldKeys) {
    mapping[key] = "";
  }
  for (const header of headers) {
    const h = header.toLowerCase().trim();
    const exact = fieldLabels.indexOf(h);
    if (exact >= 0) { mapping[fieldKeys[exact]] = header; continue; }
    const byKey = fields.find((f) => f.key.toLowerCase() === h);
    if (byKey) { mapping[byKey.key] = header; continue; }
    const byAlias = fields.find((f) => (f.aliases || []).some((a) => a.toLowerCase() === h));
    if (byAlias) { mapping[byAlias.key] = header; continue; }
    const byColMap = COL_MAP[h];
    if (byColMap) { mapping[byColMap] = header; }
  }
  return mapping;
}

export default function AdminBatchesPage() {
  const { user } = useAuth();
  const isIssuer = user?.role === "issuer";
  const [mode, setMode] = useState<"DRAFT_ONLY" | "FULL">(isIssuer ? "FULL" : "DRAFT_ONLY");
  const [batches, setBatches] = useState<IssuanceBatch[]>([]);
  const [selected, setSelected] = useState<IssuanceBatch | null>(null);
  const [showConfirmBatch, setShowConfirmBatch] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingDocuments, setUploadingDocuments] = useState(false);
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [sourceRows, setSourceRows] = useState<Record<string, string>[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [packageDocuments, setPackageDocuments] = useState<Map<string, File> | null>(null);

  // Preview & Accordion state
  const [showMappingConfig, setShowMappingConfig] = useState(false);
  const [previewTab, setPreviewTab] = useState<"ALL" | "VALID" | "INVALID">("ALL");
  const [searchKeyword, setSearchKeyword] = useState("");

  const packageDocumentList = useMemo<BatchDocument[]>(
    () => packageDocuments
      ? Array.from(packageDocuments.entries())
        .filter(([path]) => isSupportedDocumentPath(path))
        .map(([path, file]) => ({ path, name: file.name, file }))
      : [],
    [packageDocuments],
  );

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

  useEffect(() => { void load(); }, [load]);

  // Filter out empty rows and build rows with validation status
  const mappedRowsWithStatus = useMemo(() => {
    return sourceRows
      .map((source, originalIndex) => {
        const output: Record<string, string> = {};
        fields.forEach(({ key }) => { output[key] = source[mapping[key]] || ""; });
        const record = output as unknown as CreateCertificatePayload;
        const documentMatch = packageDocuments
          ? matchPackageDocument(record.document_file?.trim() || `${record.student_id}.pdf`, packageDocumentList)
          : null;
        const hasRequiredFields = !!(record.student_id?.trim() && record.certificate_title?.trim());
        const hasDocument = !packageDocuments || documentMatch?.status === "MATCHED";
        const isValid = hasRequiredFields && hasDocument;
        return {
          originalIndex: originalIndex + 1,
          record,
          isValid,
          missingFields: [
            !record.student_id?.trim() ? "ID sinh viên" : null,
            !record.certificate_title?.trim() ? "Tên văn bằng" : null,
            packageDocuments && !record.document_file?.trim() ? "Tên file văn bằng" : null,
            packageDocuments && documentMatch?.status === "MISSING_FILE" ? "Không tìm thấy file" : null,
            packageDocuments && documentMatch?.status === "DUPLICATE_FILE" ? "File trùng tên" : null,
          ].filter(Boolean) as string[],
          warnings: [
            !packageDocuments && !record.ipfs_cid?.trim() ? "Thiếu file văn bằng (ipfs_cid)" : null,
          ].filter(Boolean) as string[],
          documentMatch,
        };
      })
      .filter(({ record }) => !!(record.student_id?.trim() || record.certificate_title?.trim() || record.student_fullName?.trim()));
  }, [sourceRows, mapping, packageDocuments, packageDocumentList]);

  const mappedRows = useMemo(() => mappedRowsWithStatus.map((item) => item.record), [mappedRowsWithStatus]);

  const validRowsCount = useMemo(() => mappedRowsWithStatus.filter((item) => item.isValid).length, [mappedRowsWithStatus]);
  const invalidRowsCount = useMemo(() => mappedRowsWithStatus.filter((item) => !item.isValid).length, [mappedRowsWithStatus]);

  const mappedFieldsCount = useMemo(() => fields.filter((f) => !!mapping[f.key]).length, [mapping]);

  // Filtered rows for preview table based on active tab and search keyword
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

  async function onFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const lower = file.name.toLowerCase();
    let parsed: { headers: string[]; rows: Record<string, string>[] };
    let extractedDocuments: Map<string, File> | null = null;
    let sourceFile = file;
    if (lower.endsWith(".zip")) {
      try {
        const entries = await extractZipEntries(file);
        const dataEntry = Array.from(entries.entries()).find(([path]) => /(^|\/)data\.(csv|xlsx|xls)$/i.test(path))
          || Array.from(entries.entries()).find(([path]) => /\.(csv|xlsx|xls)$/i.test(path));
        if (!dataEntry) {
          toast.error("Gói ZIP phải chứa data.xlsx, data.xls hoặc data.csv");
          return;
        }
        sourceFile = dataEntry[1];
        extractedDocuments = new Map(Array.from(entries.entries()).filter(([path]) => isSupportedDocumentPath(path)));
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Không thể đọc gói ZIP");
        return;
      }
    }
    if (sourceFile.name.toLowerCase().endsWith(".csv")) {
      parsed = parseCsv(await sourceFile.text());
    } else if (sourceFile.name.toLowerCase().endsWith(".xlsx") || sourceFile.name.toLowerCase().endsWith(".xls")) {
      const buf = await sourceFile.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const aoa: unknown[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });
      if (aoa.length < 1) { toast.error("File Excel không có dữ liệu"); return; }
      
      let headerRowIdx = -1;
      for (let i = 0; i < aoa.length; i++) {
        const rowStr = (aoa[i] || []).map((c) => String(c ?? "").toLowerCase().trim()).join(" ");
        if (
          rowStr.includes("id sinh viên") ||
          rowStr.includes("student_id") ||
          rowStr.includes("mã sinh viên") ||
          rowStr.includes("tên văn bằng") ||
          rowStr.includes("tên sinh viên")
        ) {
          headerRowIdx = i;
          break;
        }
      }
      if (headerRowIdx === -1) {
        headerRowIdx = aoa.findIndex((r) => r && r.some((c) => String(c ?? "").trim().length > 0));
      }
      if (headerRowIdx === -1 || headerRowIdx >= aoa.length) {
        toast.error("File Excel không có dữ liệu hợp lệ"); return;
      }

      const rawHdrs = (aoa[headerRowIdx] as string[]).map((h) => String(h ?? "").trim());
      const validHdrIndices = rawHdrs.map((h, i) => (h ? i : -1)).filter((i) => i >= 0);
      const hdrs = validHdrIndices.map((i) => rawHdrs[i]);
      const rows = aoa.slice(headerRowIdx + 1).filter((r: unknown[]) => r && r.some((c) => String(c ?? "").trim()));
      parsed = {
        headers: hdrs,
        rows: rows.map((r: unknown[]) =>
          Object.fromEntries(validHdrIndices.map((hdrIdx, i) => [hdrs[i], String((r as unknown[])[hdrIdx] ?? "").trim()]))
        ),
      };
    } else {
      toast.error("Chỉ hỗ trợ ZIP, CSV hoặc Excel (.xlsx, .xls)");
      return;
    }
    if (!parsed.headers.length || !parsed.rows.length) {
      toast.error("File không có dữ liệu");
      return;
    }
    setFileName(file.name.replace(/\.(zip|csv|xlsx|xls)$/i, ""));
    setHeaders(parsed.headers);
    setSourceRows(parsed.rows);
    setMapping(autoMapHeaders(parsed.headers));
    setPackageDocuments(extractedDocuments);
    setShowMappingConfig(false);
  }

  function resetImport() {
    setFileName("");
    setHeaders([]);
    setSourceRows([]);
    setMapping({});
    setPackageDocuments(null);
    setShowMappingConfig(false);
    setSearchKeyword("");
    setPreviewTab("ALL");
  }

  async function executeBatch() {
    setSubmitting(true);
    setUploadingDocuments(Boolean(packageDocuments));
    try {
      const rowsForSubmission = mappedRows.map((row) => ({ ...row }));
      if (packageDocuments) {
        const uploadedByPath = new Map<string, { cid: string; ipfsUrl: string; sha3Hash: string }>();
        for (const row of rowsForSubmission) {
          const match = matchPackageDocument(row.document_file?.trim() || `${row.student_id}.pdf`, packageDocumentList);
          if (match.status !== "MATCHED") {
            throw new Error(`Không thể ghép file cho ${row.student_id}: ${row.document_file || "chưa khai báo tên file"}`);
          }
          const key = match.document.path.toLowerCase();
          let uploaded = uploadedByPath.get(key);
          if (!uploaded) {
            uploaded = await ipfsApi.uploadFile(match.document.file);
            uploadedByPath.set(key, uploaded);
          }
          row.document_file = match.document.path;
          row.ipfs_cid = uploaded.cid;
          row.file_url = uploaded.ipfsUrl;
          row.document_sha3 = uploaded.sha3Hash;
        }
      }
      setUploadingDocuments(false);
      const result = await operationsApi.createBatch(fileName || `Lô ${new Date().toLocaleDateString("vi-VN")}`, rowsForSubmission, mode);
      setSelected(result);
      resetImport();
      await load();
      toast.success(`Đã xử lý thành công ${result.successRows}/${result.totalRows} dòng`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Không thể tạo lô cấp phát");
    } finally {
      setSubmitting(false);
      setUploadingDocuments(false);
    }
  }

  function requestConfirm() {
    if (!mappedRows.length || invalidRowsCount > 0) {
      toast.error("Hãy kiểm tra và hoàn thiện dữ liệu bắt buộc trước khi cấp phát");
      return;
    }
    // Existing Excel/CSV imports still support a pre-uploaded CID. FULL mode must not issue without it.
    const rowsWithWarnings = mappedRowsWithStatus.filter(item => item.warnings.length > 0);
    if (rowsWithWarnings.length > 0 && mode === "FULL") {
      toast.error(`${rowsWithWarnings.length} dòng chưa có CID/file văn bằng. FULL mode yêu cầu tài liệu trước khi phát hành.`);
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
      <ConfirmModal
        open={showConfirmBatch}
        onClose={() => setShowConfirmBatch(false)}
        title="Xác nhận phát hành lô văn bằng"
        message={mode === "FULL" ? `Bạn có chắc chắn muốn cấp ${mappedRows.length} văn bằng và ghi trực tiếp lên Blockchain?` : `Tạo ${mappedRows.length} văn bằng ở trạng thái DRAFT (chờ Issuer duyệt sau).`}
        confirmLabel={mode === "FULL" ? "Xác nhận phát hành" : "Xác nhận tạo DRAFT"}
        cancelLabel="Hủy"
        variant="warning"
        icon="warning"
        loading={submitting}
        onConfirm={() => void executeBatch()}
      />

      {/* Title & Import Actions Bar */}
      <div className={styles._2}>
        <div>
          <h1 className={styles._3}>Cấp bằng hàng loạt</h1>
          <p className={styles._4}>Import CSV/Excel hoặc một gói ZIP gồm data.xlsx và thư mục documents/.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Tooltip content="Tải file mẫu CSV cơ bản" position="bottom">
            <button type="button" onClick={downloadCsvTemplate} className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 transition-all">Tải template CSV</button>
          </Tooltip>
          <Tooltip content="Tải file mẫu Excel định dạng sẵn" position="bottom">
            <button type="button" onClick={downloadExcelTemplate} className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 transition-all">Tải template Excel</button>
          </Tooltip>
          <Tooltip content="Tải lên CSV, Excel hoặc ZIP gồm data.xlsx và documents/" position="bottom">
            <label className={styles._5}>+ Chọn file<input className="hidden" type="file" accept=".zip,.csv,.xlsx,.xls,application/zip,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onChange={onFile} /></label>
          </Tooltip>
        </div>
      </div>

      {/* Main File Data Preview & Validation Section */}
      {headers.length > 0 && (
        <section className="space-y-4">
          {/* File Overview Banner */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200/50 dark:border-teal-900/50 flex items-center justify-center text-teal-600 dark:text-teal-400 font-bold text-sm">
                📄
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-black text-gray-900 dark:text-white">{fileName}</h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-400">
                    {mappedRows.length} bản ghi
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-3 text-xs">
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">✓ {validRowsCount} dòng hợp lệ</span>
                  {invalidRowsCount > 0 && (
                    <span className="text-rose-500 font-semibold">⚠ {invalidRowsCount} dòng thiếu thông tin</span>
                  )}
                </div>
              </div>
            </div>

            {/* Processing Mode Toggle & Accordion Button */}
            <div className="flex flex-wrap items-center gap-3">
              {isIssuer && (
                <div className="flex items-center bg-gray-100 dark:bg-gray-800/80 p-1 rounded-xl border border-gray-200/60 dark:border-gray-700/60">
                  <button
                    type="button"
                    onClick={() => setMode("FULL")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${mode === "FULL" ? "bg-primary text-white shadow-sm" : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"}`}
                  >
                    Tạo & phát hành (Blockchain)
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("DRAFT_ONLY")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${mode === "DRAFT_ONLY" ? "bg-primary text-white shadow-sm" : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"}`}
                  >
                    Chỉ tạo DRAFT
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={() => setShowMappingConfig(!showMappingConfig)}
                className="px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-750 text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2 transition-all"
              >
                ⚙ Cấu hình Mapping ({mappedFieldsCount}/{fields.length} cột)
                <span className={`transform transition-transform ${showMappingConfig ? "rotate-180" : ""}`}>▼</span>
              </button>

              <button
                type="button"
                onClick={resetImport}
                className="px-3.5 py-2 rounded-xl border border-red-200/60 dark:border-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs font-bold transition-all"
              >
                Hủy file
              </button>
            </div>
          </div>

          {/* Collapsible Mapping Configuration Section */}
          {showMappingConfig && (
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 animate-fadeIn">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">Tùy chỉnh ghép nối cột (Column Mapping)</h3>
                <span className="text-xs text-gray-400">Hệ thống đã tự động ghép cột từ file Excel</span>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {fields.map((field) => (
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-300" key={field.key}>
                    {field.label} {["student_id", "certificate_title"].includes(field.key) && <span className="text-red-500">*</span>}
                    <select
                      className="mt-1 w-full rounded-xl border border-gray-200 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-medium dark:border-gray-700 text-gray-900 dark:text-white"
                      value={mapping[field.key] || ""}
                      onChange={(event) => setMapping((current) => ({ ...current, [field.key]: event.target.value }))}
                    >
                      <option value="" className="bg-white dark:bg-slate-900 text-gray-900 dark:text-white">-- Không ghép cột --</option>
                      {headers.map((header) => (
                        <option key={header} value={header} className="bg-white dark:bg-slate-900 text-gray-900 dark:text-white">{header}</option>
                      ))}
                    </select>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Data Preview Table & Filtering Toolbar */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 dark:border-gray-800 pb-4">
              {/* Status Filter Tabs */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewTab("ALL")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${previewTab === "ALL" ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900" : "text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"}`}
                >
                  Tất cả ({mappedRowsWithStatus.length})
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTab("VALID")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${previewTab === "VALID" ? "bg-emerald-600 text-white" : "text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"}`}
                >
                  ✓ Hợp lệ ({validRowsCount})
                </button>
                {invalidRowsCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setPreviewTab("INVALID")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${previewTab === "INVALID" ? "bg-rose-600 text-white" : "text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30"}`}
                  >
                    ⚠ Cần kiểm tra ({invalidRowsCount})
                  </button>
                )}
              </div>

              {/* Search Bar & Action Button */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Tìm sinh viên, văn bằng..."
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    className="w-60 rounded-xl border border-gray-200 bg-transparent px-3 py-1.5 text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:border-gray-700"
                  />
                  {searchKeyword && (
                    <button onClick={() => setSearchKeyword("")} className="absolute right-2.5 top-1.5 text-xs text-gray-400 hover:text-gray-600">✕</button>
                  )}
                </div>

                <button
                  type="button"
                  disabled={submitting || mappedRows.length === 0 || invalidRowsCount > 0}
                  onClick={requestConfirm}
                  className={`${styles._5} disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {submitting ? (uploadingDocuments ? "Đang đưa file lên IPFS..." : "Đang xử lý lô...") : mode === "FULL" ? `Xác nhận phát hành ${mappedRows.length} bằng` : `Xác nhận tạo ${mappedRows.length} DRAFT`}
                </button>
              </div>
            </div>

            {/* Data Preview Table List */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-700/80">
                  <tr className="text-slate-700 dark:text-slate-200 font-bold text-xs uppercase tracking-wider">
                    <th className="py-3.5 px-3 w-12 text-center">STT</th>
                    <th className="py-3.5 px-3">ID sinh viên</th>
                    <th className="py-3.5 px-3">Họ và tên</th>
                    <th className="py-3.5 px-3">Tên văn bằng</th>
                    <th className="py-3.5 px-3">Ngày sinh</th>
                    <th className="py-3.5 px-3">Nơi sinh</th>
                    <th className="py-3.5 px-3">Số hiệu</th>
                    <th className="py-3.5 px-3">Số vào sổ</th>
                    <th className="py-3.5 px-3">File (IPFS)</th>
                    <th className="py-3.5 px-3 text-center">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filteredPreviewRows.map((item) => (
                    <tr
                      key={item.originalIndex}
                      className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${!item.isValid ? "bg-rose-50/30 dark:bg-rose-950/10" : ""}`}
                    >
                      <td className="p-3 text-center font-bold text-gray-400">{item.originalIndex}</td>
                      <td className="p-3 font-mono font-bold text-teal-600 dark:text-teal-400">{item.record.student_id || "—"}</td>
                      <td className="p-3 font-semibold text-gray-900 dark:text-white">{item.record.student_fullName || "—"}</td>
                      <td className="p-3 font-medium text-gray-800 dark:text-gray-200">{item.record.certificate_title || "—"}</td>
                      <td className="p-3 text-gray-600 dark:text-gray-400">{item.record.dob || "—"}</td>
                      <td className="p-3 text-gray-600 dark:text-gray-400">{item.record.placeOfBirth || "—"}</td>
                      <td className="p-3 font-mono text-gray-600 dark:text-gray-400">{item.record.serialNumber || "—"}</td>
                      <td className="p-3 font-mono text-gray-600 dark:text-gray-400">{item.record.registryNumber || "—"}</td>
                      <td className="p-3 font-mono text-xs text-gray-600 dark:text-gray-400 max-w-[120px] truncate" title={item.record.ipfs_cid || ""}>
                        {item.record.ipfs_cid ? (
                          <span className="text-emerald-600 dark:text-emerald-400">✓ Đã có</span>
                        ) : (
                          <span className="text-amber-500">Chưa có file</span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        {item.isValid ? (
                          item.warnings.length > 0 ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 text-[11px] font-bold" title={item.warnings.join(", ")}>
                              ⚠ {item.warnings[0]}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold">
                              ✓ Sẵn sàng
                            </span>
                          )
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-[11px] font-bold" title={`Thiếu: ${item.missingFields.join(", ")}`}>
                            ⚠ Thiếu {item.missingFields.join(", ")}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredPreviewRows.length === 0 && (
                    <tr>
                      <td colSpan={10} className="p-8 text-center text-xs text-gray-400">
                        {searchKeyword ? "Không tìm thấy sinh viên phù hợp." : "Không có dữ liệu ở mục này."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {error && <div role="alert" className="rounded-xl bg-red-50 p-4 text-xs font-semibold text-red-600">{error}</div>}

      {/* Historical Batches Table */}
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
