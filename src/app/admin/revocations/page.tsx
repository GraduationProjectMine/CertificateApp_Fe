"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import styles from "./page.module.css";
import { operationsApi } from "@/features/admin/services/operations.api";
import { certificateApi, type CertificateDto } from "@/features/certificates/services/certificate.api";
import ConfirmModal from "@/components/common/Modal/ConfirmModal";
import Pagination from "@/components/common/Pagination";
import { useI18n } from "@/features/i18n/I18nContext";

const ITEMS_PER_PAGE = 10;

interface ExtendedCertDto extends CertificateDto {
  isOnline?: boolean;
}

export default function AdminRevocationsPage() {
  const [issued, setIssued] = useState<ExtendedCertDto[]>([]);
  const [revoked, setRevoked] = useState<ExtendedCertDto[]>([]);
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selected, setSelected] = useState<ExtendedCertDto | null>(null);
  const [showRevokeConfirm, setShowRevokeConfirm] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const { t } = useI18n();

  const load = useCallback(async () => {
    try {
      setError("");
      const [issuedData, onlineData, revokedData] = await Promise.all([
        certificateApi.list({ status: "ISSUED" }),
        certificateApi.listOnline(),
        operationsApi.listRevoked(),
      ]);

      const onlineIssued: ExtendedCertDto[] = onlineData
        .filter((c: any) => c.status === "ISSUED" || c.status === "REVOKE_FAILED" || !c.status)
        .map((c: any) => ({
          ...c,
          isOnline: true,
          student_id: c.student_id || "",
          organization_name: c.organization_name || "",
          issuedAt: c.issuedAt || new Date().toISOString(),
          status: c.status || "ISSUED",
        }));

      const physicalIssued: ExtendedCertDto[] = issuedData.map((c) => ({
        ...c,
        isOnline: false,
      }));

      setIssued([...physicalIssued, ...onlineIssued]);
      setRevoked(revokedData.items as ExtendedCertDto[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("adminRevocations.loadError"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  const matches = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return [];
    return issued
      .filter((certificate) =>
        [
          certificate.serialNumber,
          certificate.registryNumber,
          certificate.student_fullName,
          certificate.certificate_title,
          certificate.certificate_id,
        ].some((value) => value?.toLowerCase().includes(normalized))
      )
      .slice(0, 8);
  }, [issued, query]);

  function requestRevoke() {
    if (!selected || reason.trim().length < 5) {
      toast.error(t("adminRevocations.reasonTooShort"));
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
      toast.success(t("adminRevocations.revokeSuccess"));
      setSelected(null);
      setReason("");
      setQuery("");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("adminRevocations.revokeError"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles._1}>
      <ConfirmModal
        open={showRevokeConfirm}
        onClose={() => setShowRevokeConfirm(false)}
        title={t("adminRevocations.confirm.title")}
        message={`${t("adminRevocations.confirm.message1")} ${
          selected?.serialNumber || selected?.certificate_id || ""
        } ${t("adminRevocations.confirm.message2")}`}
        confirmLabel={t("adminRevocations.confirm.confirm")}
        cancelLabel={t("adminRevocations.confirm.cancel")}
        variant="danger"
        icon="danger"
        loading={submitting}
        onConfirm={() => void executeRevoke()}
      />

      <div className={styles._2}>
        <div>
          <h1 className={styles._3}>{t("adminRevocations.headerTitle")}</h1>
        </div>
      </div>
      {error && (
        <div role="alert" className="rounded-xl bg-red-50 p-4 text-xs font-semibold text-red-600">
          {error}
        </div>
      )}

      <section className={styles._5}>
        <h2 className={styles._6}>{t("adminRevocations.step1Title")}</h2>
        <div className={styles._9}>
          <input
            aria-label={t("adminRevocations.searchAriaLabel")}
            className={styles._10}
            placeholder={t("adminRevocations.searchPlaceholder")}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <button className={styles._11} type="button">
            {t("adminRevocations.searchButton")}
          </button>
        </div>
        {query && (
          <div className="divide-y rounded-2xl border border-gray-100 dark:border-gray-800">
            {matches.map((certificate) => (
              <button
                className="flex w-full items-center justify-between gap-4 p-4 text-left text-xs hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                key={certificate.certificate_id}
                onClick={() => setSelected(certificate)}
              >
                <span>
                  <strong className="block text-gray-900 dark:text-white flex items-center gap-2">
                    {certificate.student_fullName}
                    {certificate.isOnline && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-800">
                        Văn bằng số
                      </span>
                    )}
                  </strong>
                  <span className="text-gray-500 dark:text-gray-400">{certificate.certificate_title}</span>
                </span>
                <span className="font-mono font-bold text-teal-600">
                  {certificate.serialNumber || certificate.registryNumber || certificate.certificate_id.slice(0, 8)}
                </span>
              </button>
            ))}
            {matches.length === 0 && (
              <p className="p-4 text-xs text-gray-400 dark:text-gray-500">{t("adminRevocations.noMatches")}</p>
            )}
          </div>
        )}

        {selected && (
          <div className="rounded-2xl border border-teal-200 bg-teal-50/40 p-5 dark:border-teal-900 dark:bg-teal-950/10">
            <div className="grid gap-3 text-xs sm:grid-cols-3">
              <p>
                <span className="block text-gray-400 dark:text-gray-500">{t("adminRevocations.student")}</span>
                <strong className="text-slate-900 dark:text-white">{selected.student_fullName}</strong>
              </p>
              <p>
                <span className="block text-gray-400 dark:text-gray-500">{t("adminRevocations.certificate")}</span>
                <strong className="text-slate-900 dark:text-white flex items-center gap-1.5">
                  {selected.certificate_title}
                  {selected.isOnline && (
                    <span className="text-[10px] text-teal-600 dark:text-teal-400 font-bold">(Văn bằng số)</span>
                  )}
                </strong>
              </p>
              <p>
                <span className="block text-gray-400 dark:text-gray-500">{t("adminRevocations.serialRegistry")}</span>
                <strong className="text-slate-900 dark:text-white">
                  {selected.serialNumber || "—"} / {selected.registryNumber || "—"}
                </strong>
              </p>
            </div>
            <label className="mt-4 block text-xs font-bold text-gray-700 dark:text-gray-300">
              {t("adminRevocations.step2Title")}
              <textarea
                className="mt-2 min-h-24 w-full rounded-xl border border-gray-200 bg-white p-3 font-normal dark:border-gray-700 dark:bg-gray-900 text-slate-900 dark:text-white"
                maxLength={500}
                placeholder={t("adminRevocations.reasonPlaceholder")}
                value={reason}
                onChange={(event) => setReason(event.target.value)}
              />
            </label>
            <div className="mt-4 flex justify-end gap-2">
              <button
                className="rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300"
                onClick={() => setSelected(null)}
              >
                {t("adminRevocations.cancel")}
              </button>
              <button
                className="rounded-xl bg-red-600 hover:bg-red-700 px-4 py-2 text-xs font-bold text-white disabled:opacity-50 transition-colors shadow-sm"
                disabled={submitting || reason.trim().length < 5}
                onClick={requestRevoke}
              >
                {submitting ? t("adminRevocations.revoking") : t("adminRevocations.confirmRevoke")}
              </button>
            </div>
          </div>
        )}
      </section>

      <section className={styles._13}>
        <div className={styles._14}>
          <h2 className={styles._6}>{t("adminRevocations.historyTitle")}</h2>
        </div>
        <div className={styles._15}>
          <table className={styles._16}>
            <thead className={styles._17}>
              <tr>
                <th className={styles._18}>{t("adminRevocations.certificate")}</th>
                <th className={styles._18}>{t("adminRevocations.student")}</th>
                <th className={styles._18}>{t("adminRevocations.reason")}</th>
                <th className={styles._18}>{t("adminRevocations.time")}</th>
              </tr>
            </thead>
            <tbody className={styles._20}>
              {revoked.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map((certificate) => (
                <tr className={styles._21} key={certificate.certificate_id}>
                  <td className={styles._22}>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900 dark:text-white">
                        {certificate.serialNumber || certificate.registryNumber || certificate.certificate_id.slice(0, 8)}
                      </span>
                      {certificate.isOnline && (
                        <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-800">
                          Văn bằng số
                        </span>
                      )}
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800">
                        REVOKED
                      </span>
                    </div>
                  </td>
                  <td className={styles._23}>{certificate.student_fullName}</td>
                  <td className={styles._24} title={certificate.revokeReason || ""}>
                    {certificate.revokeReason || "—"}
                  </td>
                  <td className={styles._25}>
                    {certificate.revokedAt ? new Date(certificate.revokedAt).toLocaleString("vi-VN") : "—"}
                  </td>
                </tr>
              ))}
              {!loading && revoked.length === 0 && (
                <tr>
                  <td className="p-8 text-center text-xs text-gray-400 dark:text-gray-500" colSpan={4}>
                    {t("adminRevocations.emptyState")}
                  </td>
                </tr>
              )}
              {loading && (
                <tr>
                  <td className="p-8 text-center text-xs text-gray-400 dark:text-gray-500" colSpan={4}>
                    {t("adminRevocations.loading")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(revoked.length / ITEMS_PER_PAGE)}
            totalItems={revoked.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
          />
        </div>
      </section>
    </div>
  );
}
