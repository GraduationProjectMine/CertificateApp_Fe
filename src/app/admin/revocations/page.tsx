"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import styles from "./page.module.css";
import { operationsApi } from "@/features/admin/services/operations.api";
import { certificateApi, type CertificateDto } from "@/features/certificates/services/certificate.api";
import ConfirmModal from "@/components/common/Modal/ConfirmModal";

export default function AdminRevocationsPage() {
  const [issued, setIssued] = useState<CertificateDto[]>([]);
  const [revoked, setRevoked] = useState<CertificateDto[]>([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<CertificateDto | null>(null);
  const [showRevokeConfirm, setShowRevokeConfirm] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setError("");
      const [issuedData, revokedData] = await Promise.all([
        certificateApi.list({ status: "ISSUED" }),
        operationsApi.listRevoked(),
      ]);
      setIssued(issuedData);
      setRevoked(revokedData.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải dữ liệu thu hồi");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const matches = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return [];
    return issued.filter((certificate) => [certificate.serialNumber, certificate.registryNumber, certificate.student_fullName, certificate.certificate_id].some((value) => value?.toLowerCase().includes(normalized))).slice(0, 8);
  }, [issued, query]);

  function requestRevoke() {
    if (!selected || reason.trim().length < 5) {
      toast.error("Lý do thu hồi cần ít nhất 5 ký tự");
      return;
    }
    setShowRevokeConfirm(true);
  }

  async function executeRevoke() {
    if (!selected) return;
    setShowRevokeConfirm(false);
    try {
      setSubmitting(true);
      await operationsApi.revoke(selected.certificate_id, reason.trim());
      toast.success("Đã ghi giao dịch thu hồi lên blockchain");
      setSelected(null);
      setReason("");
      setQuery("");
      await load();
    } catch (err) { toast.error(err instanceof Error ? err.message : "Thu hồi thất bại"); }
    finally { setSubmitting(false); }
  }

  return (
    <div className={styles._1}>
      <ConfirmModal
        open={showRevokeConfirm}
        onClose={() => setShowRevokeConfirm(false)}
        title="Thu hồi văn bằng"
        message={`Bạn có chắc chắn muốn thu hồi vĩnh viễn văn bằng ${selected?.serialNumber || selected?.certificate_id || ""} trên blockchain? Hành động này không thể hoàn tác.`}
        confirmLabel="Xác nhận thu hồi"
        cancelLabel="Hủy"
        variant="danger"
        icon="danger"
        loading={submitting}
        onConfirm={() => void executeRevoke()}
      />

      <div className={styles._2}><div><h1 className={styles._3}>Thu hồi văn bằng</h1><p className={styles._4}>Chỉ văn bằng đã cấp mới có thể bị thu hồi; hành động được ghi trên blockchain và audit log.</p></div></div>
      {error && <div role="alert" className="rounded-xl bg-red-50 p-4 text-xs font-semibold text-red-600">{error}</div>}

      <section className={styles._5}>
        <h2 className={styles._6}>1. Tìm văn bằng đã cấp</h2>
        <div className={styles._9}><input aria-label="Tìm văn bằng" className={styles._10} placeholder="Số hiệu, số vào sổ, tên sinh viên..." value={query} onChange={(event) => setQuery(event.target.value)} /><button className={styles._11} type="button">Tìm kiếm</button></div>
        {query && <div className="divide-y rounded-2xl border border-gray-100 dark:border-gray-800">{matches.map((certificate) => <button className="flex w-full items-center justify-between gap-4 p-4 text-left text-xs hover:bg-gray-50 dark:hover:bg-gray-800" key={certificate.certificate_id} onClick={() => setSelected(certificate)}><span><strong className="block text-gray-900 dark:text-white">{certificate.student_fullName}</strong><span className="text-gray-500">{certificate.certificate_title}</span></span><span className="font-mono font-bold text-teal-600">{certificate.serialNumber || certificate.registryNumber}</span></button>)}{matches.length === 0 && <p className="p-4 text-xs text-gray-400">Không tìm thấy văn bằng ISSUED phù hợp.</p>}</div>}

        {selected && <div className="rounded-2xl border border-teal-200 bg-teal-50/40 p-5 dark:border-teal-900 dark:bg-teal-950/10"><div className="grid gap-3 text-xs sm:grid-cols-2"><p><span className="block text-gray-400">Sinh viên</span><strong>{selected.student_fullName}</strong></p><p><span className="block text-gray-400">Văn bằng</span><strong>{selected.certificate_title}</strong></p><p><span className="block text-gray-400">Số hiệu / Số vào sổ</span><strong>{selected.serialNumber} / {selected.registryNumber}</strong></p><p><span className="block text-gray-400">Transaction cấp</span><strong className="break-all font-mono">{selected.tx_hash}</strong></p></div><label className="mt-4 block text-xs font-bold text-gray-700 dark:text-gray-300">2. Lý do thu hồi<textarea className="mt-2 min-h-24 w-full rounded-xl border border-gray-200 bg-white p-3 font-normal dark:border-gray-700 dark:bg-gray-900" maxLength={500} placeholder="Mô tả quyết định thu hồi (bắt buộc)..." value={reason} onChange={(event) => setReason(event.target.value)} /></label><div className="mt-4 flex justify-end gap-2"><button className="rounded-xl border px-4 py-2 text-xs font-bold" onClick={() => setSelected(null)}>Hủy</button><button className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white disabled:opacity-50" disabled={submitting || reason.trim().length < 5} onClick={requestRevoke}>{submitting ? "Đang xác nhận Web3..." : "Xác nhận thu hồi"}</button></div></div>}
      </section>

      <section className={styles._13}><div className={styles._14}><h2 className={styles._6}>Lịch sử thu hồi</h2></div><div className={styles._15}><table className={styles._16}><thead className={styles._17}><tr><th className={styles._18}>Văn bằng</th><th className={styles._18}>Sinh viên</th><th className={styles._18}>Lý do</th><th className={styles._18}>Thời gian</th><th className={styles._19}>Tx thu hồi</th></tr></thead><tbody className={styles._20}>{revoked.map((certificate) => <tr className={styles._21} key={certificate.certificate_id}><td className={styles._22}>{certificate.serialNumber || certificate.registryNumber}<span className={styles._27}>REVOKED</span></td><td className={styles._23}>{certificate.student_fullName}</td><td className={styles._24} title={certificate.revokeReason || ""}>{certificate.revokeReason}</td><td className={styles._25}>{certificate.revokedAt ? new Date(certificate.revokedAt).toLocaleString("vi-VN") : "—"}</td><td className={styles._26} title={certificate.revoke_tx_hash || ""}>{certificate.revoke_tx_hash ? `${certificate.revoke_tx_hash.slice(0, 10)}…` : "—"}</td></tr>)}{!loading && revoked.length === 0 && <tr><td className="p-8 text-center text-xs text-gray-400" colSpan={5}>Chưa có văn bằng bị thu hồi.</td></tr>}{loading && <tr><td className="p-8 text-center text-xs text-gray-400" colSpan={5}>Đang tải...</td></tr>}</tbody></table></div></section>
    </div>
  );
}
