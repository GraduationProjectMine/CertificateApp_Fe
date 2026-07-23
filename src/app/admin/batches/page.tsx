"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import styles from "./page.module.css";
import { operationsApi, type IssuanceBatch } from "@/features/admin/services/operations.api";
import { parseCsv, toCsv } from "@/features/admin/utils/csv";
import type { CreateCertificatePayload } from "@/features/certificates/services/certificate.api";
import { useAuth } from "@/features/auth/components/AuthContext";
import ConfirmModal from "@/components/common/Modal/ConfirmModal";

const fields: Array<{ key: keyof CreateCertificatePayload; label: string; aliases?: string[] }> = [
  { key: "student_id", label: "ID sinh viên", aliases: ["studentId"] },
  { key: "certificate_title", label: "Tên văn bằng", aliases: ["title"] },
  { key: "dob", label: "Ngày sinh" },
  { key: "placeOfBirth", label: "Nơi sinh" },
  { key: "gender", label: "Giới tính" },
  { key: "ethnicity", label: "Dân tộc" },
  { key: "schoolName", label: "Tên trường" },
  { key: "examCohort", label: "Khóa/Năm TN" },
  { key: "examBoard", label: "Hội đồng thi" },
  { key: "issueLocation", label: "Nơi cấp" },
  { key: "issueDate", label: "Ngày cấp" },
  { key: "serialNumber", label: "Số hiệu" },
  { key: "registryNumber", label: "Số vào sổ" },
];

const TEMPLATE_HEADER = 'student_id,certificate_title,student_fullName,dob,placeOfBirth,gender,ethnicity,schoolName,examCohort,examBoard,issueLocation,issueDate,serialNumber,registryNumber\n"SV001","Cử nhân CNTT","Nguyễn Văn A","2002-05-15","Hà Nội","Nam","Kinh","ĐH Bách Khoa Hà Nội","2025","Hội đồng 1","Hà Nội","2025-06-15","BK-2025-001","001"\n';

function downloadFile(content: Blob, filename: string) {
  const url = URL.createObjectURL(content);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function downloadCsvTemplate() {
  downloadFile(new Blob(["\uFEFF" + TEMPLATE_HEADER], { type: "text/csv;charset=utf-8" }), "certificate-import-template.csv");
}

function downloadExcelTemplate() {
  const wb = XLSX.utils.book_new();
  const data = [fields.map((f) => f.label), ["SV001", "Cử nhân CNTT", "Nguyễn Văn A", "2002-05-15", "Hà Nội", "Nam", "Kinh", "ĐH Bách Khoa Hà Nội", "2025", "Hội đồng 1", "Hà Nội", "2025-06-15", "BK-2025-001", "001"]];
  const ws = XLSX.utils.aoa_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, "Template");
  const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  downloadFile(new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), "certificate-import-template.xlsx");
}

const COL_MAP: Record<string, string> = {
  "id sinh viên": "student_id",
  "tên văn bằng": "certificate_title",
  "họ tên": "student_fullName",
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
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [sourceRows, setSourceRows] = useState<Record<string, string>[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});

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

  const mappedRows = useMemo(() => sourceRows.map((source) => {
    const output: Record<string, string> = {};
    fields.forEach(({ key }) => { output[key] = source[mapping[key]] || ""; });
    return output as unknown as CreateCertificatePayload;
  }), [sourceRows, mapping]);

  const invalidRows = useMemo(
    () => mappedRows.filter((row) => fields.some(({ key }) => !String(row[key] || "").trim())).length,
    [mappedRows],
  );

  async function onFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const lower = file.name.toLowerCase();
    let parsed: { headers: string[]; rows: Record<string, string>[] };
    if (lower.endsWith(".csv")) {
      parsed = parseCsv(await file.text());
    } else if (lower.endsWith(".xlsx") || lower.endsWith(".xls")) {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const aoa: unknown[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });
      if (aoa.length < 2) { toast.error("File Excel không có dữ liệu"); return; }
      const hdrs = (aoa[0] as string[]).map((h) => String(h ?? "").trim());
      const rows = aoa.slice(1).filter((r: unknown[]) => r.some((c) => String(c ?? "").trim()));
      parsed = { headers: hdrs, rows: rows.map((r: unknown[]) => Object.fromEntries(hdrs.map((h, i) => [h, String((r as unknown[])[i] ?? "").trim()]))) };
    } else {
      toast.error("Chỉ hỗ trợ file CSV hoặc Excel (.xlsx, .xls)");
      return;
    }
    if (!parsed.headers.length || !parsed.rows.length) {
      toast.error("File không có dữ liệu");
      return;
    }
    setFileName(file.name.replace(/\.(csv|xlsx|xls)$/i, ""));
    setHeaders(parsed.headers);
    setSourceRows(parsed.rows);
    setMapping(autoMapHeaders(parsed.headers));
  }

  async function executeBatch() {
    setSubmitting(true);
    try {
      const result = await operationsApi.createBatch(fileName || `Lô ${new Date().toLocaleDateString("vi-VN")}`, mappedRows, mode);
      setSelected(result);
      setHeaders([]);
      setSourceRows([]);
      await load();
      toast.success(`Đã xử lý ${result.successRows}/${result.totalRows} dòng`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Không thể tạo lô");
    } finally {
      setSubmitting(false);
    }
  }

  function requestConfirm() {
    if (!mappedRows.length || invalidRows > 0) {
      toast.error("Hãy mapping đủ dữ liệu bắt buộc trước khi cấp phát");
      return;
    }
    setShowConfirmBatch(true);
  }

  async function openBatch(batch: IssuanceBatch) {
    try { setSelected(await operationsApi.getBatch(batch.id)); }
    catch (err) { toast.error(err instanceof Error ? err.message : "Không thể xem chi tiết"); }
  }

  async function retry(itemId: string) {
    if (!selected) return;
    try {
      setSelected(await operationsApi.retryBatchItem(selected.id, itemId));
      await load();
      toast.success("Đã retry dòng lỗi");
    } catch (err) { toast.error(err instanceof Error ? err.message : "Retry thất bại"); }
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
        title="Xác nhận cấp phát hàng loạt"
        message={mode === "FULL" ? `Bạn có chắc chắn muốn cấp ${mappedRows.length} văn bằng và ghi lên blockchain?` : `Tạo ${mappedRows.length} văn bằng ở trạng thái DRAFT (cần issuer duyệt sau).`}
        confirmLabel={mode === "FULL" ? "Xác nhận cấp phát" : "Xác nhận tạo DRAFT"}
        cancelLabel="Hủy"
        variant="warning"
        icon="warning"
        loading={submitting}
        onConfirm={() => void executeBatch()}
      />

      <div className={styles._2}>
        <div>
          <h1 className={styles._3}>Cấp bằng hàng loạt</h1>
          <p className={styles._4}>Import CSV hoặc Excel, kiểm tra từng dòng và phát hành văn bằng.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={downloadCsvTemplate} className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 transition-all">Tải template CSV</button>
          <button type="button" onClick={downloadExcelTemplate} className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 transition-all">Tải template Excel</button>
          <label className={styles._5}>+ Chọn file<input className="hidden" type="file" accept=".csv,.xlsx,.xls,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onChange={onFile} /></label>
        </div>
      </div>

      {isIssuer && (
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Chế độ xử lý:</span>
          <button
            type="button"
            onClick={() => setMode("FULL")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${mode === "FULL" ? "bg-primary text-white shadow-sm" : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"}`}
          >
            Tạo & phát hành (blockchain)
          </button>
          <button
            type="button"
            onClick={() => setMode("DRAFT_ONLY")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${mode === "DRAFT_ONLY" ? "bg-primary text-white shadow-sm" : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"}`}
          >
            Chỉ tạo DRAFT
          </button>
        </div>
      )}

      {headers.length > 0 && (
        <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div><h2 className="text-sm font-black text-gray-900 dark:text-white">Mapping cột — {fileName}</h2><p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{mappedRows.length} dòng · {invalidRows ? `${invalidRows} dòng thiếu dữ liệu` : "Dữ liệu hợp lệ"}</p></div>
            <button className={styles._5} disabled={submitting || invalidRows > 0} onClick={requestConfirm}>{submitting ? "Đang xử lý..." : "Xác nhận"}</button>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {fields.map((field) => <label className="text-xs font-semibold text-gray-600 dark:text-gray-300" key={field.key}>{field.label}<select className="mt-1 w-full rounded-xl border border-gray-200 bg-transparent px-3 py-2 dark:border-gray-700" value={mapping[field.key] || ""} onChange={(event) => setMapping((current) => ({ ...current, [field.key]: event.target.value }))}><option value="">-- Chọn cột --</option>{headers.map((header) => <option key={header}>{header}</option>)}</select></label>)}
          </div>
        </section>
      )}

      {error && <div role="alert" className="rounded-xl bg-red-50 p-4 text-xs font-semibold text-red-600">{error}</div>}
      <div className={styles._6}><div className={styles._7}><table className={styles._8}><thead className={styles._9}><tr><th className={styles._10}>Tên lô</th><th className={styles._11}>Tiến độ</th><th className={styles._11}>Thành công</th><th className={styles._11}>Lỗi</th><th className={styles._10}>Người tạo</th><th className={styles._12}>Thao tác</th></tr></thead><tbody className={styles._13}>
        {batches.map((batch) => <tr className={styles._14} key={batch.id}><td className={styles._15}>{batch.name}<div className="mt-1 text-[10px] font-normal text-gray-400 dark:text-gray-500">{new Date(batch.createdAt).toLocaleString("vi-VN")}</div></td><td className={styles._17}>{batch.status}<div className="mx-auto mt-2 h-1.5 w-24 overflow-hidden rounded-full bg-gray-100"><div className="h-full bg-teal-500" style={{ width: `${batch.totalRows ? ((batch.successRows + batch.failedRows) / batch.totalRows) * 100 : 0}%` }} /></div></td><td className={styles._18}>{batch.successRows}/{batch.totalRows}</td><td className={styles._19}>{batch.failedRows}</td><td className={styles._16}>{batch.createdByName}</td><td className={styles._12}><button className={styles._20} onClick={() => openBatch(batch)}>Chi tiết</button></td></tr>)}
        {!loading && batches.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-xs text-gray-400 dark:text-gray-500">Chưa có lô cấp phát.</td></tr>}
        {loading && <tr><td colSpan={6} className="p-8 text-center text-xs text-gray-400 dark:text-gray-500">Đang tải...</td></tr>}
      </tbody></table></div></div>

      {selected && <section className="rounded-3xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900"><div className="mb-4 flex items-center justify-between"><div><h2 className="text-sm font-black text-gray-900 dark:text-white">Kết quả: {selected.name}</h2><p className="text-xs text-gray-500 dark:text-gray-400">{selected.successRows} thành công · {selected.failedRows} lỗi</p></div><div className="flex gap-2">{selected.failedRows > 0 && <button className="rounded-lg border px-3 py-2 text-xs font-bold" onClick={exportErrors}>Xuất lỗi CSV</button>}<button aria-label="Đóng chi tiết" className="px-2" onClick={() => setSelected(null)}>✕</button></div></div><div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead><tr className="border-b text-gray-500 dark:text-gray-400"><th className="p-3">Dòng</th><th className="p-3">Sinh viên</th><th className="p-3">Số hiệu</th><th className="p-3">Trạng thái</th><th className="p-3">Kết quả</th></tr></thead><tbody>{selected.items?.map((item) => <tr className="border-b border-gray-100 dark:border-gray-800" key={item.id}><td className="p-3">{item.rowNumber}</td><td className="p-3 font-mono">{item.input.student_id}</td><td className="p-3">{item.input.serialNumber}</td><td className={`p-3 font-bold ${item.status === "SUCCESS" ? "text-green-600" : "text-red-500"}`}>{item.status}</td><td className="max-w-sm p-3 text-gray-500 dark:text-gray-400">{item.error || item.certificateId || "—"} {item.status === "FAILED" && <button className="ml-2 font-bold text-teal-600" onClick={() => retry(item.id)}>Retry</button>}</td></tr>)}</tbody></table></div></section>}
    </div>
  );
}
