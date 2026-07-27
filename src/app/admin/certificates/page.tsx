"use client";
import styles from "./page.module.css";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { certificateApi } from "@/features/certificates/services/certificate.api";
import type { CertificateDto } from "@/features/certificates/services/certificate.api";
import { useAuth } from "@/features/auth/components/AuthContext";
import ConfirmModal from "@/components/common/Modal/ConfirmModal";
import { ActionLink, ActionButton } from "@/components/common/TableActions";
import Button from "@/components/ui/Button";
import Pagination from "@/components/common/Pagination";
import SearchInput from "@/components/common/SearchInput";
import EmptyState from "@/components/common/EmptyState";
import { useI18n } from "@/features/i18n/I18nContext";

const ITEMS_PER_PAGE = 10;

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  DRAFT: { label: "Draft", className: "bg-slate-50 dark:bg-slate-800/20 text-gray-450 border-gray-200/50" },
  PENDING: { label: "Pending Blockchain", className: "bg-amber-55/10 text-warning border-amber-250/50 animate-pulse" },
  ISSUED: { label: "Issued", className: "bg-green-55/10 text-green-600 dark:text-green-400 border-green-200/50" },
  REVOKED: { label: "Revoked", className: "bg-red-50 dark:bg-red-950/20 text-danger border-red-200/50" },
};

export default function AdminCertificatesPage() {
  const { t } = useI18n();
  const router = useRouter();
  const { user } = useAuth();
  const isIssuer = user?.role === "issuer";
  const [certificates, setCertificates] = useState<CertificateDto[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteTargetId, setDeleteTargetId] = useState("");
  const [deleteError, setDeleteError] = useState("");

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [batchApproving, setBatchApproving] = useState(false);
  const [batchApproveResult, setBatchApproveResult] = useState<{
    results: { certificateId: string; status: string; error?: string }[];
    successCount: number;
    failCount: number;
    total: number;
  } | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await certificateApi.list(filterStatus ? { status: filterStatus } : undefined);
      setCertificates(data);
    } catch (err: any) {
      setError(err.message || "Failed to load certificates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterStatus]);

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    setDeleteError("");
    try {
      await certificateApi.delete(deleteTargetId);
      setCertificates((prev) => prev.filter((c) => c.certificate_id !== deleteTargetId));
      setDeleteTargetId("");
    } catch (err: any) {
      setDeleteError(err.message || "Delete failed");
    }
  };

  const handleBatchApprove = async () => {
    if (selectedIds.size === 0) return;
    setBatchApproving(true);
    setBatchApproveResult(null);
    try {
      const result = await certificateApi.batchApprove(Array.from(selectedIds));
      setBatchApproveResult(result);
      await fetchData();
      setSelectedIds(new Set());
    } catch (err: any) {
      setError(err.message || "Batch approve failed");
    } finally {
      setBatchApproving(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.filter((c) => c.status === "PENDING").map((c) => c.certificate_id)));
    }
  };

  const filtered = certificates.filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.certificate_id.toLowerCase().includes(q) ||
      c.student_fullName.toLowerCase().includes(q) ||
      (c.serialNumber && c.serialNumber.toLowerCase().includes(q))
    );
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedCerts = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const pendingCount = filtered.filter((c) => c.status === "PENDING").length;

  return (
    <div className={styles._1}>
      <ConfirmModal
        open={!!deleteTargetId}
        onClose={() => { setDeleteTargetId(""); setDeleteError(""); }}
        title={t("admin.certificates.delete_title")}
        message={t("admin.certificates.delete_confirm")}
        confirmLabel={t("common.delete")}
        cancelLabel={t("common.cancel")}
        variant="danger"
        icon="danger"
        onConfirm={() => void handleDelete()}
      />

      <div className={styles._2}>
        <div>
          <h1 className={styles._3}>{t("admin.certificates.title")}</h1>
          <p className={styles._4}>{t("admin.certificates.description")}</p>
        </div>
        <button onClick={() => router.push("/admin/certificates/issue")} className={styles._5}>
          + {t("admin.certificates.issue_title")}
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800/60 rounded-2xl p-4 mb-5">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={t("admin.certificates.search_placeholder")}
        >
          <select className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="">{t("common.all_status")}</option>
            <option value="DRAFT">Draft</option>
            <option value="PENDING">Pending Blockchain</option>
            <option value="ISSUED">Issued</option>
            <option value="REVOKED">Revoked</option>
          </select>
          <Button variant="secondary" size="sm" onClick={fetchData} disabled={loading}>{t("common.refresh")}</Button>
        </SearchInput>
      </div>

      {isIssuer && selectedIds.size > 0 && (
        <div className="mb-4 flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50/50 px-4 py-3 dark:border-amber-900 dark:bg-amber-950/10">
          <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">{t("admin.certificates.selected_pending", { count: selectedIds.size })}</span>
          <button
            onClick={handleBatchApprove}
            disabled={batchApproving}
            className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary-hover disabled:opacity-50 transition-all"
          >
            {batchApproving ? t("admin.certificates.signing_blockchain") : t("admin.certificates.batch_sign", { count: selectedIds.size })}
          </button>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="rounded-xl border px-3 py-2 text-xs font-bold text-gray-500 dark:text-gray-400"
          >
            {t("common.clear_selection")}
          </button>
        </div>
      )}

      {batchApproveResult && (
        <div className="mb-4 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <h3 className="text-xs font-bold text-gray-900 dark:text-white mb-2">{t("admin.certificates.batch_result")}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{t("common.success")}: {batchApproveResult.successCount} / {t("common.failed")}: {batchApproveResult.failCount}</p>
          {batchApproveResult.failCount > 0 && (
            <div className="max-h-32 overflow-y-auto space-y-1">
              {batchApproveResult.results.filter((r) => r.status === "FAILED").map((r) => (
                <div key={r.certificateId} className="text-xs text-red-600">
                  <span className="font-mono">{r.certificateId.slice(0, 8)}...</span>: {r.error}
                </div>
              ))}
            </div>
          )}
          <button onClick={() => setBatchApproveResult(null)} className="mt-2 text-xs font-bold text-primary hover:underline">{t("common.close")}</button>
        </div>
      )}

      {error && <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-xs text-red-600">{error}</div>}
      {deleteError && <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-xs text-red-600">{deleteError}</div>}

      <div className={styles._10}>
        <div className={styles._11}>
          {loading ? (
            <div className="p-8 text-center text-gray-400 dark:text-gray-500 text-xs">{t("common.loading")}</div>
          ) : error ? (
            <div className="p-8 text-center text-red-500 text-xs">{error}</div>
          ) : filtered.length === 0 ? (
            <EmptyState icon="📭" title={t("admin.certificates.no_certificates")} description={searchQuery ? t("common.try_different_search") : undefined} />
          ) : (
            <>
              <table className={styles._12}>
                <thead>
                  <tr className={styles._13}>
                    {isIssuer && (
                      <th className={styles._14} style={{ width: 36 }}>
                        <input type="checkbox" checked={selectedIds.size === pendingCount && pendingCount > 0} onChange={toggleSelectAll} className="accent-primary" />
                      </th>
                    )}
                    <th className={styles._14}>{t("admin.certificates.code")}</th>
                    <th className={styles._14}>{t("admin.certificates.student_name")}</th>
                    <th className={styles._14}>{t("admin.certificates.type")}</th>
                    <th className={styles._14}>{t("admin.certificates.issue_date")}</th>
                    <th className={styles._15}>IPFS Gateway</th>
                    <th className={styles._15}>Blockchain</th>
                    <th className={styles._14}>{t("common.status")}</th>
                    <th className={styles._16}>{t("common.actions")}</th>
                  </tr>
                </thead>
                <tbody className={styles._17}>
                  {paginatedCerts.map((cert) => {
                    const statusStyle = STATUS_MAP[cert.status] || STATUS_MAP.DRAFT;
                    const isPending = cert.status === "PENDING";
                    return (
                      <tr key={cert.certificate_id} className={`${styles._18} ${isPending && isIssuer ? "cursor-pointer" : ""}`}>
                        {isIssuer && (
                          <td className={styles._14}>
                            {isPending && (
                              <input type="checkbox" checked={selectedIds.has(cert.certificate_id)} onChange={() => toggleSelect(cert.certificate_id)} className="accent-primary" />
                            )}
                          </td>
                        )}
                        <td className={styles._19}>{cert.certificate_id.slice(0, 8)}...</td>
                        <td className={styles._20}>{cert.student_fullName}</td>
                        <td className={styles._21}>{cert.certificate_title}</td>
                        <td className={styles._14}>
                          {cert.issuedAt ? new Date(cert.issuedAt).toLocaleDateString("vi-VN") : "-"}
                        </td>
                        <td className={styles._15}>
                          {cert.ipfs_cid ? (
                            <span className={styles._23}>{cert.ipfs_cid.slice(0, 12)}...</span>
                          ) : (
                            <span className={styles._24}>-</span>
                          )}
                        </td>
                        <td className={styles._15}>
                          {cert.tx_hash ? (
                            <span className={styles._25}>ON-CHAIN</span>
                          ) : (
                            <span className={styles._26}>OFF-CHAIN</span>
                          )}
                        </td>
                        <td className={styles._14}>
                          <span className={`${styles._0} ${statusStyle.className}`}>
                            {statusStyle.label}
                          </span>
                        </td>
                        <td className={styles._27}>
                          <ActionLink onClick={() => router.push(`/admin/certificates/${cert.certificate_id}`)}>
                            {t("common.detail")}
                          </ActionLink>
                          {cert.status !== "ISSUED" && cert.status !== "REVOKED" && (
                            <ActionButton onClick={() => setDeleteTargetId(cert.certificate_id)}>
                              {t("common.delete")}
                            </ActionButton>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filtered.length}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={setCurrentPage}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
