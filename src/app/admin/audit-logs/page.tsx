"use client";

import React, { useCallback, useEffect, useState } from "react";
import styles from "./page.module.css";
import { operationsApi, type AuditLog, type Paginated } from "@/features/admin/services/operations.api";
import Pagination from "@/components/common/Pagination";
import SearchInput from "@/components/common/SearchInput";
import EmptyState from "@/components/common/EmptyState";
import Button from "@/components/ui/Button";
import { useI18n } from "@/features/i18n/I18nContext";

const actions = ["CREATE_CERTIFICATE", "ISSUE_CERTIFICATE", "CREATE_ISSUANCE_BATCH", "REVOKE_CERTIFICATE", "BLOCKCHAIN_TX_FAILED"];

const actionLabels: Record<string, string> = {};

export default function AdminAuditLogsPage() {
  const { t } = useI18n();
  actionLabels.CREATE_CERTIFICATE = t("admin.audit_logs.action_create");
  actionLabels.ISSUE_CERTIFICATE = t("admin.audit_logs.action_issue");
  actionLabels.CREATE_ISSUANCE_BATCH = t("admin.audit_logs.action_batch");
  actionLabels.REVOKE_CERTIFICATE = t("admin.audit_logs.action_revoke");
  actionLabels.BLOCKCHAIN_TX_FAILED = t("admin.audit_logs.action_blockchain_failed");

  const [data, setData] = useState<Paginated<AuditLog>>({ items: [], total: 0, page: 1, limit: 10, totalPages: 0 });
  const [page, setPage] = useState(1);
  const [action, setAction] = useState("");
  const [actor, setActor] = useState("");
  const [search, setSearch] = useState("");
  const [applied, setApplied] = useState({ action: "", actor: "", search: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setData(await operationsApi.auditLogs({ page, limit: 10, ...applied }));
    } catch (err) { setError(err instanceof Error ? err.message : t("admin.audit_logs.load_failed")); }
    finally { setLoading(false); }
  }, [page, applied]);
  useEffect(() => { void load(); }, [load]);

  function applyFilters(event: React.FormEvent) {
    event.preventDefault();
    setPage(1);
    setApplied({ action, actor: actor.trim(), search: search.trim() });
  }

  return (
    <div className={styles._1}>
      <div><h1 className={styles._2}>{t("admin.audit_logs.title")}</h1><p className={styles._3}>{t("admin.audit_logs.description")}</p></div>
      <div className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800/60 rounded-2xl p-4 mb-5">
        <form onSubmit={applyFilters} className="flex gap-3 items-end">
          <select className="shrink-0 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2 text-xs outline-none" value={action} onChange={(event) => setAction(event.target.value)}>
            <option value="">{t("admin.audit_logs.all_actions")}</option>
            {actions.map((item) => <option key={item} value={item}>{actionLabels[item] || item}</option>)}
          </select>
          <input
            className="shrink-0 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2 text-xs outline-none w-44"
            placeholder={t("admin.audit_logs.actor_placeholder")}
            value={actor}
            onChange={(event) => setActor(event.target.value)}
          />
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder={t("admin.audit_logs.search_placeholder")}
          />
          <Button type="submit" variant="secondary" size="sm">{t("common.filter")}</Button>
          <Button variant="ghost" size="sm" onClick={() => { setAction(""); setActor(""); setSearch(""); setPage(1); setApplied({ action: "", actor: "", search: "" }); }}>{t("common.clear")}</Button>
        </form>
      </div>
      {error && <div role="alert" className="rounded-xl bg-red-50 p-4 text-xs font-semibold text-red-600">{error}</div>}

      <div className={styles._4}>
        <div className={styles._5}>
          <table className={styles._6}>
            <thead className={styles._7}>
              <tr>
                <th className={styles._8}>{t("common.time")}</th>
                <th className={styles._8}>{t("admin.audit_logs.actor")}</th>
                <th className={styles._8}>{t("admin.audit_logs.action")}</th>
                <th className={styles._8}>{t("admin.audit_logs.target")}</th>
                <th className={styles._8}>{t("common.result")}</th>
                <th className={styles._8}>{t("common.detail")}</th>
              </tr>
            </thead>
            <tbody className={styles._9}>
              {data.items.map((log) => <tr className={styles._10} key={log.id}><td className={styles._11}>{new Date(log.createdAt).toLocaleString("vi-VN")}</td><td className={styles._12}>{log.actorName || t("admin.audit_logs.system")}<span className="mt-1 block text-[10px] font-normal text-gray-400 dark:text-gray-500">{log.ipAddress || "—"}</span></td><td className={styles._13}>{actionLabels[log.action] || log.action}</td><td className={styles._11}>{log.targetType}<span className="mt-1 block max-w-40 truncate font-mono text-[10px] text-gray-400 dark:text-gray-500" title={log.targetId || ""}>{log.targetId || "—"}</span></td><td className={`p-4 font-bold ${log.success ? "text-green-600" : "text-red-500"}`}>{log.success ? t("common.success_uppercase") : t("common.failed_uppercase")}</td><td className={styles._14}><span className="block max-w-xs truncate" title={log.details ? JSON.stringify(log.details) : ""}>{log.details ? JSON.stringify(log.details) : "—"}</span></td></tr>)}
              {!loading && data.items.length === 0 && <tr><td className="p-8 text-center text-xs text-gray-400 dark:text-gray-500" colSpan={6}>{t("admin.audit_logs.no_data")}</td></tr>}
              {loading && <tr><td className="p-8 text-center text-xs text-gray-400 dark:text-gray-500" colSpan={6}>{t("common.loading")}</td></tr>}
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
