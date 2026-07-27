"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { staffApi, type StaffDto } from "@/features/staff/services/staff.api";
import { useAuth } from "@/features/auth/components/AuthContext";
import ConfirmModal from "@/components/common/Modal/ConfirmModal";
import FormModal from "@/components/common/Modal/FormModal";
import { ActionLink, ActionButton, ActionText } from "@/components/common/TableActions";
import Pagination from "@/components/common/Pagination";
import SearchInput from "@/components/common/SearchInput";
import EmptyState from "@/components/common/EmptyState";
import Button from "@/components/ui/Button";
import { useI18n } from "@/features/i18n/I18nContext";

const ITEMS_PER_PAGE = 10;

export default function StaffListPage() {
  const router = useRouter();
  const { t } = useI18n();
  const { user } = useAuth();
  const [staff, setStaff] = useState<StaffDto[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [lockingId, setLockingId] = useState("");
  const [lockTarget, setLockTarget] = useState<StaffDto | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ name: "", email: "", password: "" });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const canManageStaff = user?.role === "issuer";

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await staffApi.list();
      setStaff(data);
    } catch (err: any) {
      setError(err.message || t("admin.staff.load_failed"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const filtered = useMemo(() => {
    if (!search.trim()) return staff;
    const q = search.toLowerCase().trim();
    return staff.filter((s) =>
      s.name.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      s.staff_id.toLowerCase().includes(q)
    );
  }, [staff, search]);

  const [itemsPerPage, setItemsPerPage] = useState(10);
  useEffect(() => { setCurrentPage(1); }, [search, itemsPerPage]);

  const handleLock = async () => {
    if (!canManageStaff || !lockTarget) return;
    const id = lockTarget.staff_id;
    setLockingId(id);
    setLockTarget(null);
    try {
      await staffApi.update(id, { isActive: false });
      setStaff((prev) =>
        prev.map((s) => (s.staff_id === id ? { ...s, isActive: false } : s)),
      );
    } catch (err: any) {
      setError(err.message || t("admin.staff.lock_failed"));
    } finally {
      setLockingId("");
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name || !createForm.email || !createForm.password) {
      setCreateError(t("common.fill_all_fields"));
      return;
    }
    setCreating(true);
    setCreateError("");
    try {
      await staffApi.create(createForm);
      setShowCreate(false);
      setCreateForm({ name: "", email: "", password: "" });
      await fetchStaff();
    } catch (err: any) {
      setCreateError(err.message || t("admin.staff.create_failed"));
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <ConfirmModal
        open={!!lockTarget}
        onClose={() => setLockTarget(null)}
        title={t("common.lock_account")}
        message={lockTarget ? t("admin.staff.lock_confirm", { name: lockTarget.name }) : ""}
        confirmLabel={t("common.lock")}
        cancelLabel={t("common.cancel")}
        variant="warning"
        icon="warning"
        onConfirm={() => void handleLock()}
      />

      <FormModal
        open={showCreate}
        onClose={() => { setShowCreate(false); setCreateError(""); setCreateForm({ name: "", email: "", password: "" }); }}
        title={t("admin.staff.create_title")}
        description={t("admin.staff.create_description")}
        onSubmit={(e) => void handleCreate(e)}
        submitting={creating}
        submitLabel={t("admin.staff.create_submit")}
      >
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">{t("admin.staff.full_name")} *</label>
          <input
            type="text"
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            value={createForm.name}
            onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
            placeholder={t("admin.staff.name_placeholder")}
            autoFocus
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">{t("admin.staff.email")} *</label>
          <input
            type="email"
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            value={createForm.email}
            onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
            placeholder="staff@school.edu.vn"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">{t("common.password")} *</label>
          <input
            type="password"
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            value={createForm.password}
            onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
            placeholder={t("common.password_min_length")}
          />
        </div>
        {createError && <div className="text-[11px] text-red-500 bg-red-50 dark:bg-red-950/20 px-3 py-2 rounded-lg">{createError}</div>}
      </FormModal>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{t("admin.staff.title")}</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t("admin.staff.description")}</p>
        </div>
        {canManageStaff && (
          <button
            onClick={() => setShowCreate(true)}
            className="px-4 py-2 text-xs font-bold text-white bg-primary hover:bg-primary-hover rounded-xl transition-all"
          >
            + {t("admin.staff.add")}
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-xs text-red-600 dark:bg-red-950/20">
          {error} <button onClick={fetchStaff} className="ml-2 underline">{t("common.retry")}</button>
        </div>
      )}

      <div className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800/60 rounded-2xl p-4 mb-5">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder={t("admin.staff.search_placeholder")}
        >
          <Button variant="secondary" size="sm" onClick={fetchStaff} disabled={loading}>{t("common.refresh")}</Button>
        </SearchInput>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400 dark:text-gray-500 text-xs">{t("admin.staff.loading")}</div>
      ) : staff.length === 0 && !search ? (
        <EmptyState icon="👥" title={t("admin.staff.empty")} action={canManageStaff ? <Button variant="primary" size="sm" onClick={() => setShowCreate(true)}>{t("admin.staff.create_first")}</Button> : undefined} />
      ) : filtered.length === 0 ? (
        <EmptyState icon="🔍" title={t("common.no_results")} />
      ) : (
        <div className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800/60 rounded-3xl overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200/60 dark:border-gray-800/60">
                <th className="text-left px-4 py-3 font-bold text-gray-600 dark:text-gray-400">{t("common.table.name")}</th>
                <th className="text-left px-4 py-3 font-bold text-gray-600 dark:text-gray-400">{t("common.table.email")}</th>
                <th className="text-left px-4 py-3 font-bold text-gray-600 dark:text-gray-400">{t("common.table.role")}</th>
                <th className="text-left px-4 py-3 font-bold text-gray-600 dark:text-gray-400">{t("common.table.status")}</th>
                  {canManageStaff && <th className="text-right px-4 py-3 font-bold text-gray-600 dark:text-gray-400">{t("common.table.actions")}</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((s) => (
                <tr key={s.staff_id} className="border-b border-gray-100 dark:border-gray-800/40 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{s.name}</td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{s.email}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                      s.role === 'ISSUER'
                        ? 'bg-primary/10 text-primary'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                    }`}>
                      {s.role === 'ISSUER' ? t("admin.staff.role_admin") : t("admin.staff.role_staff")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                      s.isActive
                        ? 'bg-green-500/10 text-green-500'
                        : 'bg-red-500/10 text-red-500'
                    }`}>
                      {s.isActive ? t("admin.staff.status_active") : t("admin.staff.status_inactive")}
                    </span>
                  </td>
                  {canManageStaff && (
                    <td className="px-4 py-3 text-right space-x-2">
                      <ActionLink onClick={() => router.push(`/admin/staff/${s.staff_id}`)}>
                        {t("common.view_edit")}
                      </ActionLink>
                      {s.isActive ? (
                        <ActionButton onClick={() => setLockTarget(s)} disabled={lockingId === s.staff_id}>
                          {lockingId === s.staff_id ? t("common.locking") : t("common.lock")}
                        </ActionButton>
                      ) : (
                        <ActionText>{t("common.locked")}</ActionText>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(filtered.length / itemsPerPage)}
            totalItems={filtered.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(size) => {
              setItemsPerPage(size);
              setCurrentPage(1);
            }}
          />
        </div>
      )}
    </div>
  );
}
