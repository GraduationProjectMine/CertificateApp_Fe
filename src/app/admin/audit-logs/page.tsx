"use client";

import React, { useCallback, useEffect, useState } from "react";
import styles from "./page.module.css";
import { operationsApi, type AuditLog, type Paginated } from "@/features/admin/services/operations.api";
import Pagination from "@/components/common/Pagination";
import { useI18n } from "@/features/i18n/I18nContext";

const actions = ["CREATE_CERTIFICATE", "ISSUE_CERTIFICATE", "CREATE_ISSUANCE_BATCH", "REVOKE_CERTIFICATE", "BLOCKCHAIN_TX_FAILED"];
const actionLabel = (key: string, t: ReturnType<typeof useI18n>["t"]): string =>
  ({
    CREATE_CERTIFICATE: t("adminAuditLogs.action.createCertificate"),
    ISSUE_CERTIFICATE: t("adminAuditLogs.action.issueCertificate"),
    CREATE_ISSUANCE_BATCH: t("adminAuditLogs.action.createIssuanceBatch"),
    REVOKE_CERTIFICATE: t("adminAuditLogs.action.revokeCertificate"),
    BLOCKCHAIN_TX_FAILED: t("adminAuditLogs.action.blockchainTxFailed"),
  }[key] ?? key);

export default function AdminAuditLogsPage() {
  const [data, setData] = useState<Paginated<AuditLog>>({ items: [], total: 0, page: 1, limit: 10, totalPages: 0 });
  const [page, setPage] = useState(1);
  const [action, setAction] = useState("");
  const [actor, setActor] = useState("");
  const [search, setSearch] = useState("");
  const [applied, setApplied] = useState({ action: "", actor: "", search: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { t } = useI18n();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setData(await operationsApi.auditLogs({ page, limit: 10, ...applied }));
    } catch (err) { setError(err instanceof Error ? err.message : t("adminAuditLogs.loadError")); }
    finally { setLoading(false); }
  }, [page, applied, t]);
  useEffect(() => { void load(); }, [load]);

  function applyFilters(event: React.FormEvent) {
    event.preventDefault();
    setPage(1);
    setApplied({ action, actor: actor.trim(), search: search.trim() });
  }

  return (
    <div className={styles._1}>
      <div><h1 className={styles._2}>{t("adminAuditLogs.title")}</h1><p className={styles._3}>{t("adminAuditLogs.description")}</p></div>
      <form className="grid gap-3 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:grid-cols-4" onSubmit={applyFilters}>
        <label className="text-xs font-bold text-gray-600 dark:text-gray-300">{t("adminAuditLogs.table.action")}<select className="mt-1 w-full rounded-xl border border-gray-200 bg-transparent px-3 py-2.5 font-normal dark:border-gray-700" value={action} onChange={(event) => setAction(event.target.value)}><option value="">{t("adminAuditLogs.all")}</option>{actions.map((item) => <option key={item} value={item}>{actionLabel(item, t)}</option>)}</select></label>
        <label className="text-xs font-bold text-gray-600 dark:text-gray-300">{t("adminAuditLogs.table.actor")}<input className="mt-1 w-full rounded-xl border border-gray-200 bg-transparent px-3 py-2.5 font-normal dark:border-gray-700" placeholder={t("adminAuditLogs.actorPlaceholder")} value={actor} onChange={(event) => setActor(event.target.value)} /></label>
        <label className="text-xs font-bold text-gray-600 dark:text-gray-300">{t("adminAuditLogs.table.target")}<input className="mt-1 w-full rounded-xl border border-gray-200 bg-transparent px-3 py-2.5 font-normal dark:border-gray-700" placeholder={t("adminAuditLogs.targetPlaceholder")} value={search} onChange={(event) => setSearch(event.target.value)} /></label>
        <button className="self-end rounded-xl bg-teal-600 px-4 py-2.5 text-xs font-bold text-white">{t("adminAuditLogs.filterButton")}</button>
      </form>
      {error && <div role="alert" className="rounded-xl bg-red-50 p-4 text-xs font-semibold text-red-600">{error}</div>}

      <div className={styles._4}>
        <div className={styles._5}>
          <table className={styles._6}>
            <thead className={styles._7}>
              <tr>
                <th className={styles._8}>{t("adminAuditLogs.table.time")}</th>
                <th className={styles._8}>{t("adminAuditLogs.table.actor")}</th>
                <th className={styles._8}>{t("adminAuditLogs.table.action")}</th>
                <th className={styles._8}>{t("adminAuditLogs.table.target")}</th>
                <th className={styles._8}>{t("adminAuditLogs.table.result")}</th>
              </tr>
            </thead>
            <tbody className={styles._9}>
              {data.items.map((log) => <tr className={styles._10} key={log.id}><td className={styles._11}>{new Date(log.createdAt).toLocaleString("vi-VN")}</td><td className={styles._12}>{log.actorName || t("adminAuditLogs.system")}<span className="mt-1 block text-[10px] font-normal text-gray-400 dark:text-gray-500">{log.ipAddress || "—"}</span></td><td className={styles._13}>{actionLabel(log.action, t)}</td><td className={styles._11}>{log.targetType}<span className="mt-1 block max-w-40 truncate font-mono text-[10px] text-gray-400 dark:text-gray-500" title={log.targetId || ""}>{log.targetId || "—"}</span></td><td className={`p-4 font-bold ${log.success ? "text-green-600" : "text-red-500"}`}>{log.success ? t("adminAuditLogs.result.success") : t("adminAuditLogs.result.failed")}</td></tr>)}
              {!loading && data.items.length === 0 && <tr><td className="p-8 text-center text-xs text-gray-400 dark:text-gray-500" colSpan={5}>{t("adminAuditLogs.emptyState")}</td></tr>}
              {loading && <tr><td className="p-8 text-center text-xs text-gray-400 dark:text-gray-500" colSpan={5}>{t("adminAuditLogs.loading")}</td></tr>}
            </tbody>
          </table>
        </div>
        <Pagination
          currentPage={page}
          totalPages={data.totalPages}
          totalItems={data.total}
          itemsPerPage={10}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
