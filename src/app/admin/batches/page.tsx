"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import styles from "./page.module.css";
import { operationsApi, type IssuanceBatch } from "@/features/admin/services/operations.api";
import { parseCsv, toCsv } from "@/features/admin/utils/csv";
import {
  certificateImportFields,
  createCertificateTemplateCsv,
  createCertificateTemplateHtmlExcel,
} from "@/features/admin/utils/certificate-import-template";
import type { CreateCertificatePayload } from "@/features/certificates/services/certificate.api";
import { ocrApi } from "@/features/ocr/services/api";
import { studentApi, type StudentDto } from "@/features/students/services/student.api";
import { useAuth } from "@/features/auth/components/AuthContext";
import ConfirmModal from "@/components/common/Modal/ConfirmModal";
import { ipfsApi } from "@/features/ipfs/services/ipfs.api";
import {
  type BatchDocument,
  type DocumentMatch,
  matchPackageDocument,
  parseZipPackageEntries,
} from "@/features/admin/utils/batch-package";

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

const FIELD_COL_MAP: Record<string, string> = {
  "id sinh viên": "student_id",
  "mã sinh viên": "student_id",
  "student_id": "student_id",
  "tên văn bằng": "certificate_title",
  "certificate_title": "certificate_title",
  "tên sinh viên": "student_fullName",
  "họ tên": "student_fullName",
  "student_fullName": "student_fullName",
  "fullName": "student_fullName",
  "ngày sinh": "dob",
  "nơi sinh": "placeOfBirth",
  "giới tính": "gender",
  "dân tộc": "ethnicity",
  "trường": "schoolName",
  "tên trường": "schoolName",
  "niên khóa": "examCohort",
  "khóa": "examCohort",
  "năm tn": "examCohort",
  "hội đồng thi": "examBoard",
  "nơi cấp": "issueLocation",
  "ngày cấp": "issueDate",
  "số hiệu": "serialNumber",
  "số hiệu văn bằng": "serialNumber",
  "số vào sổ": "registryNumber",
  "ipfs cid": "ipfs_cid",
  "cid": "ipfs_cid",
  "mã ipfs": "ipfs_cid",
  "tên file văn bằng": "document_file",
  "file văn bằng": "document_file",
  "tên file": "document_file",
};

function autoMapHeaders(headers: string[]): Record<string, string> {
  const mapping: Record<string, string> = {};
  for (const field of certificateImportFields) {
    mapping[field.key] = "";
  }
  for (const header of headers) {
    const h = header.toLowerCase().trim();
    const labelMatch = certificateImportFields.find((f) => f.label.toLowerCase() === h);
    if (labelMatch) { mapping[labelMatch.key] = header; continue; }
    const aliasMatch = certificateImportFields.find((f) => (f.aliases || []).some((a) => a.toLowerCase() === h));
    if (aliasMatch) { mapping[aliasMatch.key] = header; continue; }
    const keyMatch = certificateImportFields.find((f) => f.key.toLowerCase() === h);
    if (keyMatch) { mapping[keyMatch.key] = header; continue; }
    const colMatch = FIELD_COL_MAP[h];
    if (colMatch) { mapping[colMatch] = header; }
  }
  return mapping;
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
  ipfs_cid: "",
  document_file: "",
};

export default function AdminBatchesPage() {
  const { user } = useAuth();
  const isIssuer = user?.role === "issuer";
  const [mode, setMode] = useState<"DRAFT_ONLY" | "FULL">(isIssuer ? "FULL" : "DRAFT_ONLY");
  const [inputTab, setInputTab] = useState<"ZIP_PACKAGE" | "OCR" | "MANUAL">("ZIP_PACKAGE");
  const [batches, setBatches] = useState<IssuanceBatch[]>([]);
  const [selected, setSelected] = useState<IssuanceBatch | null>(null);
  const [showConfirmBatch, setShowConfirmBatch] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");

  // Source rows state
  const [sourceRows, setSourceRows] = useState<Record<string, string>[]>([{ ...EMPTY_RECORD }]);

  // Attached files & documents mapping for ZIP / Direct Drag-and-Drop Mode
  const [packageDocuments, setPackageDocuments] = useState<BatchDocument[]>([]);
  const [uploadingIpfs, setUploadingIpfs] = useState(false);
  const [ipfsProgress, setIpfsProgress] = useState({ current: 0, total: 0 });

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

  async function processPackageFiles(files: File[]) {
    try {
      toast.loading("Đang đọc gói dữ liệu & tài liệu...", { id: "pkg-parse" });
      let excelFile: File | null = null;
      const documents: BatchDocument[] = [];

      // Case A: Đính kèm 1 file ZIP
      const zipFile = files.find((f) => f.name.toLowerCase().endsWith(".zip"));
      if (zipFile) {
        const zipBuffer = await zipFile.arrayBuffer();
        const entriesMap = await parseZipPackageEntries(zipBuffer);
        entriesMap.forEach((file, pathKey) => {
          const ext = file.name.substring(file.name.lastIndexOf(".") + 1).toLowerCase();
          if (["xlsx", "xls", "csv"].includes(ext) && !excelFile) {
            excelFile = file;
          } else if (["pdf", "png", "jpg", "jpeg", "webp"].includes(ext)) {
            documents.push({ name: file.name, path: pathKey, file });
          }
        });
        setFileName(`Gói ZIP: ${zipFile.name}`);
      } else {
        // Case B: Kéo thả trực tiếp 1 file Excel + các file PDF/Ảnh cùng lúc
        files.forEach((file) => {
          const ext = file.name.substring(file.name.lastIndexOf(".") + 1).toLowerCase();
          if (["xlsx", "xls", "csv"].includes(ext) && !excelFile) {
            excelFile = file;
          } else if (["pdf", "png", "jpg", "jpeg", "webp"].includes(ext)) {
            documents.push({ name: file.name, path: file.name.toLowerCase(), file });
          }
        });
        setFileName(excelFile ? `Gói nạp: ${(excelFile as File).name}` : `Danh sách (${documents.length} file tài liệu)`);
      }

      if (!excelFile) {
        toast.dismiss("pkg-parse");
        toast.error("Vui lòng đính kèm ít nhất 1 file Excel (.xlsx, .xls) hoặc .csv chứa danh sách sinh viên");
        return;
      }

      // Parse Excel file
      const arrayBuffer = await (excelFile as File).arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const aoa: unknown[][] = XLSX.utils.sheet_to_json(firstSheet, { header: 1, defval: "" });

      if (aoa.length < 2) {
        toast.dismiss("pkg-parse");
        toast.error("File Excel không chứa dữ liệu");
        return;
      }

      const headers = (aoa[0] as string[]).map((h) => String(h ?? "").trim()).filter(Boolean);
      const mapping = autoMapHeaders(headers);
      const dataRows = aoa.slice(1).filter((r) => r?.some((c: any) => String(c ?? "").trim()));

      const mapped: Record<string, string>[] = dataRows.map((r: any) => {
        const row: Record<string, string> = {};
        certificateImportFields.forEach((f) => {
          const colName = mapping[f.key];
          const idx = colName ? headers.indexOf(colName) : -1;
          row[f.key] = idx >= 0 ? String(r[idx] ?? "").trim() : "";
        });
        // Default certificate_title if empty
        if (!row.certificate_title) row.certificate_title = "BẰNG TỐT NGHIỆP";
        return row;
      });

      if (!mapped.length) {
        toast.dismiss("pkg-parse");
        toast.error("File Excel không chứa dữ liệu hợp lệ");
        return;
      }

      setSourceRows(mapped);
      setPackageDocuments(documents);
      setActiveRecordIndex(0);
      toast.dismiss("pkg-parse");

      toast.success(
        documents.length > 0
          ? `Đã nạp ${mapped.length} bản ghi Excel & ${documents.length} file tài liệu (Tự động ghép Smart Auto-Match theo Mã SV)!`
          : `Đã nạp thành công ${mapped.length} bản ghi từ Excel!`
      );
    } catch (err: any) {
      toast.dismiss("pkg-parse");
      toast.error(err.message || "Không thể nạp gói file dữ liệu");
    }
  }

  // Handle Drag-and-drop Package (ZIP or Excel + PDFs)
  function handlePackageDrop(e: React.DragEvent) {
    e.preventDefault();
    if (!e.dataTransfer.files || e.dataTransfer.files.length === 0) return;
    const files = Array.from(e.dataTransfer.files);
    void processPackageFiles(files);
  }

  // Handle Input Package Files Change
  async function onPackageFilesChange(event: React.ChangeEvent<HTMLInputElement>) {
    const fileList = event.target.files;
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList);
    await processPackageFiles(files);
    event.target.value = "";
  }

  // Handle Drag-and-drop OCR scan
  function handleOcrDrop(e: React.DragEvent) {
    e.preventDefault();
    if (!e.dataTransfer.files || e.dataTransfer.files.length === 0) return;
    const files = Array.from(e.dataTransfer.files);
    void processOcrFiles(files);
  }

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
          ipfs_cid: "",
          document_file: "",
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

  // Validate only core fields; rest are warnings; FULL mode needs CID
  const mappedRowsWithStatus = useMemo(() => {
    return sourceRows
      .map((source, originalIndex) => {
        const record = source as unknown as CreateCertificatePayload;
        const docMatch: DocumentMatch = packageDocuments.length > 0
          ? matchPackageDocument(record, packageDocuments)
          : { status: "MISSING_FILE" };

        const hasRequired = !!(record.student_id?.trim() && record.certificate_title?.trim());
        const hasDoc = packageDocuments.length === 0 || docMatch.status === "MATCHED";
        const isValid = hasRequired && hasDoc;

        const missingRequired = [];
        if (!record.student_id?.trim()) missingRequired.push("ID sinh viên");
        if (!record.certificate_title?.trim()) missingRequired.push("Tên văn bằng");

        const warnings: string[] = [];
        if (!record.student_fullName?.trim()) warnings.push("Thiếu tên SV");
        if (!record.dob?.trim()) warnings.push("Thiếu ngày sinh");
        if (!record.serialNumber?.trim()) warnings.push("Thiếu số hiệu");
        if (!record.registryNumber?.trim()) warnings.push("Thiếu số vào sổ");
        if (packageDocuments.length > 0) {
          if (docMatch.status === "MISSING_FILE") warnings.push("Không tìm thấy file đính kèm");
          if (docMatch.status === "DUPLICATE_FILE") warnings.push("File đính kèm bị trùng tên");
        }
        if (!packageDocuments.length && !record.ipfs_cid?.trim()) {
          warnings.push("Chưa có file IPFS CID");
        }

        return {
          originalIndex: originalIndex + 1,
          record,
          isValid,
          missingFields: missingRequired,
          warnings,
          docMatch,
        };
      })
      .filter(({ record }) =>
        !!(record.student_id?.trim() || record.certificate_title?.trim() || record.student_fullName?.trim())
      );
  }, [sourceRows, packageDocuments]);

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
    setPackageDocuments([]);
    setSearchKeyword("");
    setActiveRecordIndex(0);
    setPreviewTab("ALL");
  }

  // Upload attached documents to IPFS before issuing batch
  async function uploadDocumentsToIpfsIfNeeded(): Promise<CreateCertificatePayload[]> {
    if (packageDocuments.length === 0) return mappedRows;

    setUploadingIpfs(true);
    const updatedRows = [...mappedRows];
    let uploadCount = 0;
    const itemsToUpload = mappedRowsWithStatus.filter(
      (item) => !item.record.ipfs_cid && item.docMatch.status === "MATCHED" && item.docMatch.document
    );

    setIpfsProgress({ current: 0, total: itemsToUpload.length });

    try {
      toast.loading(`Đang tải ${itemsToUpload.length} file tài liệu văn bằng lên IPFS...`, { id: "ipfs-upload" });

      for (let i = 0; i < itemsToUpload.length; i++) {
        const item = itemsToUpload[i];
        const doc = item.docMatch.document!;
        setIpfsProgress({ current: i + 1, total: itemsToUpload.length });

        const res = await ipfsApi.uploadFile(doc.file);
        const sourceIndex = item.originalIndex - 1;
        if (updatedRows[sourceIndex]) {
          updatedRows[sourceIndex] = {
            ...updatedRows[sourceIndex],
            ipfs_cid: res.cid,
            file_url: res.ipfsUrl,
            document_file: doc.name,
            document_sha3: res.sha3Hash,
          };
        }
        uploadCount++;
      }

      toast.dismiss("ipfs-upload");
      if (uploadCount > 0) {
        toast.success(`Đã đính kèm và tải lên IPFS thành công ${uploadCount} file văn bằng!`);
      }
      return updatedRows;
    } catch (err: any) {
      toast.dismiss("ipfs-upload");
      toast.error(err.message || "Tải file lên IPFS thất bại");
      throw err;
    } finally {
      setUploadingIpfs(false);
    }
  }

  async function executeBatch() {
    setShowConfirmBatch(false);
    setSubmitting(true);
    try {
      const finalRows = await uploadDocumentsToIpfsIfNeeded();
      const result = await operationsApi.createBatch(
        fileName || `Lô cấp phát ${new Date().toLocaleDateString("vi-VN")}`,
        finalRows,
        mode
      );
      setSelected(result);
      resetImport();
      await load();
      toast.success(
        mode === "FULL"
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
      toast.error("Vui lòng điền đầy đủ ID sinh viên và Tên văn bằng trước khi cấp phát lô");
      return;
    }
    if (mode === "FULL") {
      const rowsMissingCid = mappedRowsWithStatus.filter(
        (item) => !item.record.ipfs_cid?.trim() && item.docMatch?.status !== "MATCHED"
      );
      if (rowsMissingCid.length > 0) {
        toast.error(
          `${rowsMissingCid.length} dòng chưa có file văn bằng (IPFS CID). Vui lòng upload ZIP có PDF đính kèm hoặc thêm CID thủ công trước khi phát hành Blockchain.`
        );
        return;
      }
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
        message={mode === "FULL" ? `Bạn có chắc chắn muốn cấp ${mappedRows.length} văn bằng và ghi trực tiếp lên Blockchain?` : `Tạo ${mappedRows.length} văn bằng ở trạng thái DRAFT / PENDING (chờ Issuer duyệt phát hành sau).`}
        confirmLabel={mode === "FULL" ? "Xác nhận phát hành" : "Xác nhận tạo DRAFT"}
        cancelLabel="Hủy"
        variant="warning"
        icon="warning"
        loading={submitting || uploadingIpfs}
        onConfirm={() => void executeBatch()}
      />

      {/* Header Aligned */}
      <div>
        <h1 className={styles._2}>Cấp phát văn bằng theo lô (CIP/Hybrid)</h1>
        <p className={styles._3}>Hỗ trợ kéo thả Gói ZIP (Excel + PDFs Smart Auto-Match), Import Excel/CSV, Quét OCR ảnh văn bằng hoặc Nhập tay. File PDF đính kèm tự động upload lên IPFS trước khi phát hành.</p>
      </div>

      {/* Input Mode Selector Switcher */}
      <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 w-fit">
        <button
          type="button"
          onClick={() => setInputTab("ZIP_PACKAGE")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            inputTab === "ZIP_PACKAGE"
              ? "bg-white dark:bg-gray-900 text-primary shadow-sm"
              : "text-gray-500 hover:text-gray-900 dark:text-gray-400"
          }`}
        >
          <span>📦 Gói ZIP / Excel + PDFs</span>
          <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px]">Smart Match</span>
        </button>
        <button
          type="button"
          onClick={() => setInputTab("OCR")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            inputTab === "OCR"
              ? "bg-white dark:bg-gray-900 text-primary shadow-sm"
              : "text-gray-500 hover:text-gray-900 dark:text-gray-400"
          }`}
        >
          <span>🔍 Quét OCR Ảnh văn bằng</span>
        </button>
        <button
          type="button"
          onClick={() => setInputTab("MANUAL")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            inputTab === "MANUAL"
              ? "bg-white dark:bg-gray-900 text-primary shadow-sm"
              : "text-gray-500 hover:text-gray-900 dark:text-gray-400"
          }`}
        >
          <span>📝 Nhập tay / Form</span>
        </button>
      </div>

      {/* Mode 1: Drag-and-Drop Package (ZIP or Excel + PDFs) */}
      {inputTab === "ZIP_PACKAGE" && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800/60 rounded-2xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wide">Nạp gói dữ liệu (Excel + File văn bằng PDF/Ảnh)</div>
              <p className="text-[11px] text-gray-500">Kéo thả 1 file ZIP hoặc chọn file Excel VÀ các file PDF cùng lúc. Tên file PDF trùng với Mã SV sẽ được tự động ghép nối (Smart Auto-Match).</p>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={downloadCsvTemplate} className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 transition-all">📥 Tải template CSV</button>
              <button type="button" onClick={downloadExcelTemplate} className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 transition-all">📥 Tải template Excel</button>
            </div>
          </div>

          <label
            className="relative border-2 border-dashed border-primary/40 dark:border-primary/30 rounded-2xl p-8 text-center cursor-pointer hover:border-primary transition-colors flex flex-col items-center gap-3 bg-primary/5 dark:bg-primary/10"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handlePackageDrop}
          >
            <svg className="w-12 h-12 text-primary/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <div className="text-sm font-bold text-gray-800 dark:text-gray-200">Kéo thả File ZIP hoặc File Excel + các File PDF văn bằng vào đây</div>
            <div className="text-xs text-gray-400">Tự động nhận diện file Excel dữ liệu & match file PDF theo Mã sinh viên (VD: SV001.pdf)</div>
            <input type="file" multiple accept=".zip,.xlsx,.xls,.csv,.pdf,.png,.jpg,.jpeg,.webp" onChange={onPackageFilesChange} className="hidden" />
          </label>

          {/* Standalone CSV/Excel import (no ZIP) */}
          <div className="flex items-center gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
            <span className="text-[11px] text-gray-400">Hoặc nhập file riêng lẻ:</span>
            <label className="px-3 py-1.5 rounded-xl bg-primary/10 text-primary text-xs font-bold cursor-pointer hover:bg-primary/20 transition-all">
              + Chọn file Excel/CSV
              <input type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                toast.loading("Đang đọc file...", { id: "xls-parse" });
                try {
                  let rows: Record<string, string>[];
                  let headers: string[];
                  if (file.name.toLowerCase().endsWith(".csv")) {
                    const parsed = parseCsv(await file.text());
                    headers = parsed.headers;
                    rows = parsed.rows.map((r: Record<string, string>) => {
                      const row: any = {};
                      certificateImportFields.forEach((f) => { row[f.key] = r[f.key] || r[f.label] || ""; });
                      return row;
                    });
                  } else {
                    const buf = await file.arrayBuffer();
                    const wb = XLSX.read(buf, { type: "array" });
                    const ws = wb.Sheets[wb.SheetNames[0]];
                    const aoa: unknown[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });
                    const hdrRow = aoa.find((r) => r?.some((c: any) => String(c ?? "").trim()));
                    if (!hdrRow) { toast.dismiss("xls-parse"); toast.error("File không có dữ liệu"); return; }
                    headers = (hdrRow as string[]).map((h) => String(h ?? "").trim()).filter(Boolean);
                    const mapping = autoMapHeaders(headers);
                    const dataRows = aoa.slice(aoa.indexOf(hdrRow) + 1).filter((r) => r?.some((c: any) => String(c ?? "").trim()));
                    rows = dataRows.map((r: any) => {
                      const row: Record<string, string> = {};
                      certificateImportFields.forEach((f) => {
                        const colName = mapping[f.key];
                        const idx = colName ? headers.indexOf(colName) : -1;
                        row[f.key] = idx >= 0 ? String(r[idx] ?? "").trim() : "";
                      });
                      return row;
                    });
                  }
                  if (!rows.length) { toast.dismiss("xls-parse"); toast.error("File không có dữ liệu"); return; }
                  setFileName(file.name.replace(/\.(csv|xlsx|xls)$/i, ""));
                  setSourceRows(rows);
                  toast.dismiss("xls-parse");
                  toast.success(`Đã nạp ${rows.length} bản ghi từ file!`);
                } catch (err: any) {
                  toast.dismiss("xls-parse");
                  toast.error(err.message || "Đọc file thất bại");
                }
              }} />
            </label>
          </div>
        </div>
      )}

      {/* Mode 2: OCR Batch Scanning */}
      {inputTab === "OCR" && (
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
      )}

      {/* Mode 3: Manual Entry */}
      {inputTab === "MANUAL" && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800/60 rounded-2xl p-5 space-y-4 shadow-sm">
          <div className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wide">Nhập tay / Form thủ công</div>
          <p className="text-[11px] text-gray-500">Sử dụng form bên dưới để thêm/sửa từng văn bằng một. Bấm "+ Thêm văn bằng" để bắt đầu.</p>
        </div>
      )}

      {scanningOcr && (
        <div className="rounded-2xl border border-teal-200 bg-teal-50/80 p-4 text-xs font-bold text-teal-800 flex items-center gap-3 animate-pulse">
          <div className="w-5 h-5 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
          Đang trích xuất OCR văn bằng... Vui lòng chờ trong giây lát.
        </div>
      )}

      {uploadingIpfs && (
        <div className="rounded-2xl border border-primary/30 bg-primary/10 p-4 text-xs font-bold text-primary flex items-center gap-3 animate-pulse">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          Đang tải file văn bằng lên IPFS ({ipfsProgress.current} / {ipfsProgress.total})... Vui lòng chờ trong giây lát.
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
                <p className="text-xs text-gray-500">{sourceRows.length} văn bằng · Bắt buộc: ID sinh viên + Tên văn bằng</p>
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
              const isValid = !!(row.student_id?.trim() && row.certificate_title?.trim());
              return (
                <div key={idx} className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => setActiveRecordIndex(idx)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      activeRecordIndex === idx
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

        {/* Form Editor Card for Active Record */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800/60 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">
              Thông tin văn bằng #{activeRecordIndex + 1} / {sourceRows.length}
              <span className="ml-2 font-normal text-amber-500">* Bắt buộc · Khác tùy chọn</span>
            </span>
          </div>

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
              <label className={styles._29}>Tên sinh viên</label>
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
              <label className={styles._29}>Ngày sinh</label>
              <input
                type="text"
                className={styles._30}
                placeholder="VD: 15/08/2002"
                value={activeRecord.dob || ""}
                onChange={(e) => handleFieldEdit("dob", e.target.value)}
              />
            </div>

            <div>
              <label className={styles._29}>Nơi sinh</label>
              <input
                type="text"
                className={styles._30}
                placeholder="VD: Hà Nội"
                value={activeRecord.placeOfBirth || ""}
                onChange={(e) => handleFieldEdit("placeOfBirth", e.target.value)}
              />
            </div>

            <div>
              <label className={styles._29}>Giới tính</label>
              <input
                type="text"
                className={styles._30}
                placeholder="VD: Nam / Nữ"
                value={activeRecord.gender || ""}
                onChange={(e) => handleFieldEdit("gender", e.target.value)}
              />
            </div>

            <div>
              <label className={styles._29}>Dân tộc</label>
              <input
                type="text"
                className={styles._30}
                placeholder="VD: Kinh"
                value={activeRecord.ethnicity || ""}
                onChange={(e) => handleFieldEdit("ethnicity", e.target.value)}
              />
            </div>

            <div>
              <label className={styles._29}>Trường</label>
              <input
                type="text"
                className={styles._30}
                placeholder="Tên trường..."
                value={activeRecord.schoolName || ""}
                onChange={(e) => handleFieldEdit("schoolName", e.target.value)}
              />
            </div>

            <div>
              <label className={styles._29}>Niên khóa</label>
              <input
                type="text"
                className={styles._30}
                placeholder="VD: 2022 - 2026"
                value={activeRecord.examCohort || ""}
                onChange={(e) => handleFieldEdit("examCohort", e.target.value)}
              />
            </div>

            <div>
              <label className={styles._29}>Hội đồng thi</label>
              <input
                type="text"
                className={styles._30}
                placeholder="VD: Hội đồng thi Kỹ thuật"
                value={activeRecord.examBoard || ""}
                onChange={(e) => handleFieldEdit("examBoard", e.target.value)}
              />
            </div>

            <div>
              <label className={styles._29}>Nơi cấp</label>
              <input
                type="text"
                className={styles._30}
                placeholder="VD: Hà Nội"
                value={activeRecord.issueLocation || ""}
                onChange={(e) => handleFieldEdit("issueLocation", e.target.value)}
              />
            </div>

            <div>
              <label className={styles._29}>Ngày cấp</label>
              <input
                type="text"
                className={styles._30}
                placeholder="VD: 20/06/2026"
                value={activeRecord.issueDate || ""}
                onChange={(e) => handleFieldEdit("issueDate", e.target.value)}
              />
            </div>

            <div>
              <label className={styles._29}>Số hiệu văn bằng</label>
              <input
                type="text"
                className={styles._30}
                placeholder="VD: B123456"
                value={activeRecord.serialNumber || ""}
                onChange={(e) => handleFieldEdit("serialNumber", e.target.value)}
              />
            </div>

            <div>
              <label className={styles._29}>Số vào sổ</label>
              <input
                type="text"
                className={styles._30}
                placeholder="VD: 789/QĐ-ĐH"
                value={activeRecord.registryNumber || ""}
                onChange={(e) => handleFieldEdit("registryNumber", e.target.value)}
              />
            </div>

            <div>
              <label className={styles._29}>File văn bằng (Smart Match / ZIP)</label>
              <input
                type="text"
                className={styles._30}
                placeholder="Tự động theo Mã SV (VD: SV001.pdf)"
                value={activeRecord.document_file || ""}
                onChange={(e) => handleFieldEdit("document_file", e.target.value)}
              />
            </div>

            <div>
              <label className={styles._29}>IPFS CID (Nếu có sẵn)</label>
              <input
                type="text"
                className={styles._30}
                placeholder="Mã IPFS CID..."
                value={activeRecord.ipfs_cid || ""}
                onChange={(e) => handleFieldEdit("ipfs_cid", e.target.value)}
              />
            </div>
          </div>

        {/* Lô Cấp Phát Scanned Data Overview Data Grid */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800/60 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 dark:border-gray-800 pb-4">
            <div>
              <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wide">Bảng tổng quan dữ liệu cấp phát lô</h3>
              <p className="text-[11px] text-gray-500">Bắt buộc: ID sinh viên + Tên văn bằng · Các trường còn lại tùy chọn · Smart Match file tự động</p>
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
                  <th className="py-3.5 px-3">Tên</th>
                  <th className="py-3.5 px-3">Văn bằng *</th>
                  <th className="py-3.5 px-3">Số hiệu</th>
                  <th className="py-3.5 px-3">File/IPFS CID</th>
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
                        value={item.record.serialNumber || ""}
                        placeholder="Số hiệu..."
                        onChange={(e) => handleTableRowEdit(item.originalIndex, "serialNumber", e.target.value)}
                        className="w-full bg-transparent px-2 py-1.5 rounded font-mono text-gray-600 dark:text-gray-400 focus:bg-white dark:focus:bg-slate-800 border border-transparent focus:border-primary outline-none"
                      />
                    </td>
                    <td className="p-3 max-w-[140px]">
                      <div className="flex flex-col gap-0.5">
                        {item.record.ipfs_cid ? (
                          <span className="text-[11px] font-mono text-emerald-600 font-bold truncate" title={item.record.ipfs_cid}>✓ CID: {item.record.ipfs_cid.slice(0, 14)}...</span>
                        ) : item.docMatch?.status === "MATCHED" && item.docMatch.document ? (
                          <span className="text-[11px] font-medium text-primary truncate" title={item.docMatch.document.path}>
                            📄 {item.docMatch.document.name}
                          </span>
                        ) : item.record.document_file ? (
                          <span className="text-[11px] text-amber-500 truncate">{item.record.document_file}</span>
                        ) : (
                          <span className="text-[11px] text-gray-400 italic">—</span>
                        )}
                        {item.record.document_file && !item.record.ipfs_cid && item.docMatch?.status !== "MATCHED" && (
                          <span className="text-[10px] text-amber-500">⚠ chưa upload IPFS</span>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex flex-col items-center gap-0.5">
                        {item.isValid ? (
                          item.warnings.length > 0 ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 text-[11px] font-bold" title={item.warnings.join("; ")}>
                              ⚠ {item.warnings[0]}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold">
                              ✓ Sẵn sàng
                            </span>
                          )
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-[11px] font-bold">
                            ⚠ {item.missingFields.join(", ")}
                          </span>
                        )}
                      </div>
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
                    <td colSpan={8} className="p-8 text-center text-xs text-gray-400">
                      {searchKeyword ? "Không tìm thấy kết quả phù hợp." : "Chưa có dữ liệu. Vui lòng chọn gói ZIP, thả file Excel + PDFs hoặc quét OCR ảnh văn bằng."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Execution Footer Bar */}
          <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-4 mt-4">
            <div className="text-xs text-gray-500">
              <span className="font-semibold text-gray-700">{validRowsCount}/{mappedRows.length}</span> dòng hợp lệ
              {packageDocuments.length > 0 && (
                <span className="ml-2 text-primary"> · 📄 {packageDocuments.length} file đính kèm (Smart Match)</span>
              )}
            </div>
            <button
              type="button"
              disabled={submitting || uploadingIpfs || mappedRows.length === 0 || invalidRowsCount > 0}
              onClick={requestConfirm}
              className="px-6 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-md transition-all disabled:opacity-50"
            >
              {submitting || uploadingIpfs
                ? "Đang xử lý..."
                : mode === "FULL"
                ? `Xác nhận phát hành ${mappedRows.length} văn bằng`
                : `Xác nhận tạo ${mappedRows.length} DRAFT`}
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
