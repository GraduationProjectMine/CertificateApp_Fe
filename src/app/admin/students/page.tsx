"use client";
import styles from "./page.module.css";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { studentApi, type StudentDto } from "@/features/students/services/student.api";
import ConfirmModal from "@/components/common/Modal/ConfirmModal";
import FormModal from "@/components/common/Modal/FormModal";
import { ActionLink, ActionButton, ActionText } from "@/components/common/TableActions";
import Pagination from "@/components/common/Pagination";
import SearchInput from "@/components/common/SearchInput";
import EmptyState from "@/components/common/EmptyState";
import Button from "@/components/ui/Button";
import { useI18n } from "@/features/i18n/I18nContext";

const ITEMS_PER_PAGE = 10;

export default function AdminStudentsPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [students, setStudents] = useState<StudentDto[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedId, setCopiedId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lockingId, setLockingId] = useState("");
  const [lockTarget, setLockTarget] = useState<StudentDto | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [createForm, setCreateForm] = useState({ name: "", email: "", password: "" });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  useEffect(() => {
    studentApi.list()
      .then(setStudents)
      .catch((err) => setError(err instanceof Error ? err.message : t("admin.students.load_failed")))
      .finally(() => setLoading(false));
  }, []);

  const refresh = async () => {
    setLoading(true);
    setError("");
    try {
      setStudents(await studentApi.list());
    } catch (err) {
      setError(err instanceof Error ? err.message : t("admin.students.load_failed"));
    } finally {
      setLoading(false);
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
      await studentApi.create(createForm);
      setShowCreate(false);
      setShowPassword(false);
      setCreateForm({ name: "", email: "", password: "" });
      await refresh();
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : t("admin.students.create_failed"));
    } finally {
      setCreating(false);
    }
  };

  const handleLock = async () => {
    if (!lockTarget) return;
    const id = lockTarget.student_id;
    setLockingId(id);
    setLockTarget(null);
    setError("");
    try {
      await studentApi.update(id, { isActive: false });
      setStudents((current) =>
        current.map((s) => (s.student_id === id ? { ...s, isActive: false } : s)),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.lock_failed"));
    } finally {
      setLockingId("");
    }
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(""), 2000);
  };

  const filtered = students.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      s.student_fullName.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      s.student_id.toLowerCase().includes(q)
    );
  });

  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, itemsPerPage]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className={styles._1}>
      <ConfirmModal
        open={!!lockTarget}
        onClose={() => setLockTarget(null)}
        title={t("common.lock_account")}
        message={lockTarget ? t("admin.students.lock_confirm", { name: lockTarget.student_fullName }) : ""}
        confirmLabel={t("common.lock")}
        cancelLabel={t("common.cancel")}
        variant="warning"
        icon="warning"
        onConfirm={() => void handleLock()}
      />

      <FormModal
        open={showCreate}
        onClose={() => { setShowCreate(false); setShowPassword(false); setCreateError(""); setCreateForm({ name: "", email: "", password: "" }); }}
        title={t("admin.students.create_title")}
        description={t("admin.students.create_description")}
        onSubmit={(e) => void handleCreate(e)}
        submitting={creating}
        submitLabel={t("admin.students.create_submit")}
      >
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">{t("admin.students.full_name")} *</label>
          <input
            type="text"
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            value={createForm.name}
            onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
            placeholder={t("admin.students.name_placeholder")}
            autoFocus
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">{t("admin.students.email")} *</label>
          <input
            type="email"
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            value={createForm.email}
            onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
            placeholder="student@school.edu.vn"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">{t("common.password")} *</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              className="w-full px-3 py-2.5 pr-10 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              value={createForm.password}
              onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
              placeholder={t("common.password_min_length")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none"
              title={showPassword ? t("common.hide_password") : t("common.show_password")}
            >
              {showPassword ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-7 0-10-7-10-7a17.9 17.9 0 014.281-5.068m4.341-1.782A9.98 9.98 0 0112 5c7 0 10 7 10 7a17.896 17.896 0 01-2.924 3.864m-4.59 2.502a3 3 0 11-4.243-4.243m4.243 4.243L3 3l18 18" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
        </div>
        {createError && <div className="text-[11px] text-red-500 bg-red-50 dark:bg-red-950/20 px-3 py-2 rounded-lg">{createError}</div>}
      </FormModal>

      <div className={styles._2}>
        <div>
          <h1 className={styles._3}>{t("admin.students.title")}</h1>
          <p className={styles._4}>{t("admin.students.description")}</p>
        </div>
        <div className={styles._5}>
          <button onClick={() => setShowCreate(true)} className={styles._6}>
            + {t("admin.students.add")}
          </button>
          <button onClick={() => router.push("/admin/students/import")} className={styles._7}>
            Import CSV
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800/60 rounded-2xl p-4 mb-5">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder={t("admin.students.search_placeholder")}
        >
          <Button variant="secondary" size="sm" onClick={refresh} disabled={loading}>{t("common.refresh")}</Button>
        </SearchInput>
      </div>

      {error && (
        <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-xs text-red-600 dark:bg-red-950/20">
          {error}
        </div>
      )}

      <div className={styles._12}>
        <div className={styles._13}>
          {loading ? (
            <div className="p-8 text-center text-gray-400 dark:text-gray-500 text-xs">{t("admin.students.loading")}</div>
          ) : students.length === 0 ? (
            <div className="p-8 text-center text-gray-400 dark:text-gray-500 text-xs">
              {t("admin.students.empty")}{' '}
              <button onClick={() => setShowCreate(true)} className="text-primary underline">{t("admin.students.create_first")}</button>
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState icon="🔍" title={t("common.no_results")} />
          ) : (
            <>
              <table className={styles._14}>
                <thead>
                  <tr className={styles._15}>
                    <th className={styles._16}>{t("common.table.id")}</th>
                    <th className={styles._16}>{t("admin.students.full_name")}</th>
                    <th className={styles._16}>{t("admin.students.email")}</th>
                    <th className={styles._16}>{t("common.status")}</th>
                    <th className={styles._17}>{t("common.actions")}</th>
                  </tr>
                </thead>
                <tbody className={styles._18}>
                  {paginated.map((student) => (
                    <tr key={student.student_id} className={`${styles._19}`}>
                      <td className={styles._20}>
                        <span className="font-mono text-[10px]">{student.student_id.slice(0, 8)}...</span>
                        <button
                          onClick={() => handleCopyId(student.student_id)}
                          className="ml-2 text-[9px] text-primary hover:underline"
                        >
                          {copiedId === student.student_id ? "✓ Copied" : "Copy ID"}
                        </button>
                      </td>
                      <td className={styles._21}>{student.student_fullName}</td>
                      <td className={styles._16}>{student.email}</td>
                      <td className={styles._16}>
                        <span className={`${styles._0} ${student.isActive
                            ? "bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 border-green-200/50"
                            : "bg-amber-50 dark:bg-amber-950/20 text-warning border-amber-250/50"
                          }`}>
                          {student.isActive ? "ACTIVE" : "INACTIVE"}
                        </span>
                      </td>
                      <td className={styles._25}>
                        <ActionLink onClick={() => router.push(`/admin/students/${student.student_id}`)}>
                          {t("common.view_edit")}
                        </ActionLink>
                        {student.isActive ? (
                          <ActionButton onClick={() => setLockTarget(student)} disabled={lockingId === student.student_id}>
                            {lockingId === student.student_id ? t("common.locking") : t("common.lock")}
                          </ActionButton>
                        ) : (
                          <ActionText>{t("common.locked")}</ActionText>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filtered.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={(size) => {
                  setItemsPerPage(size);
                  setCurrentPage(1);
                }}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
