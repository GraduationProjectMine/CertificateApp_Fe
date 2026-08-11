"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { studentApi } from "@/features/students/services/student.api";
import { useI18n } from "@/features/i18n/I18nContext";

const emptyForm = { name: "", email: "", isActive: true, password: "" };

export default function StudentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { t } = useI18n();
  const [form, setForm] = useState(emptyForm);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    studentApi.get(id)
      .then((student) => setForm({
        name: student.student_fullName,
        email: student.email,
        isActive: student.isActive,
        password: "",
      }))
      .catch((err) => setError(err instanceof Error ? err.message : t("adminStudentDetail.errors.loadFailed")))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const payload = { ...form, password: form.password || undefined };
      const response = await studentApi.update(id, payload);
      setForm((current) => ({ ...current, name: response.student.student_fullName, password: "" }));
      setSuccess(t("adminStudentDetail.successUpdated"));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("adminStudentDetail.errors.updateFailed"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-xs text-gray-400 dark:text-gray-500">{t("adminStudentDetail.loading")}</div>;

  return (
    <div className="mx-auto max-w-xl space-y-6 p-6">
      <div>
        <h1 className="text-xl font-black uppercase tracking-tight text-gray-900 dark:text-white">{t("adminStudentDetail.title")}</h1>
        <p className="mt-1 break-all text-xs text-gray-500 dark:text-gray-400">{t("adminStudentDetail.idLabel")}: {id}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl border border-gray-200/60 bg-white p-6 dark:border-gray-800/60 dark:bg-gray-900">
        <label className="block text-xs font-bold">{t("adminStudentDetail.fullNameLabel")}
          <input required minLength={2} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1.5 w-full rounded-xl border border-gray-200 bg-transparent px-3 py-2.5 font-normal dark:border-gray-800" />
        </label>
        <label className="block text-xs font-bold">{t("adminStudentDetail.emailLabel")}
          <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1.5 w-full rounded-xl border border-gray-200 bg-transparent px-3 py-2.5 font-normal dark:border-gray-800" />
        </label>
        <label className="block text-xs font-bold">{t("adminStudentDetail.statusLabel")}
          <select value={form.isActive ? "ACTIVE" : "INACTIVE"} onChange={(e) => setForm({ ...form, isActive: e.target.value === "ACTIVE" })} className="mt-1.5 w-full rounded-xl border border-gray-200 bg-transparent px-3 py-2.5 font-normal dark:border-gray-800">
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>
        </label>
        <div className="space-y-1.5">
          <label className="block text-xs font-bold">{t("adminStudentDetail.newPasswordLabel")}</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              minLength={8}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder={t("adminStudentDetail.passwordPlaceholder")}
              className="w-full rounded-xl border border-gray-200 bg-transparent px-3 py-2.5 pr-10 font-normal dark:border-gray-800 focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none"
              title={showPassword ? t("adminStudentDetail.hidePassword") : t("adminStudentDetail.showPassword")}
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

        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600 dark:bg-red-950/20">{error}</p>}
        {success && <p className="rounded-lg bg-green-50 px-3 py-2 text-xs text-green-600 dark:bg-green-950/20">{success}</p>}

        <div className="flex gap-3">
          <button disabled={saving} className="rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-white disabled:opacity-50">{saving ? t("adminStudentDetail.saving") : t("adminStudentDetail.save")}</button>
          <button type="button" onClick={() => router.push("/admin/students")} className="rounded-xl bg-gray-100 px-4 py-2.5 text-xs font-bold text-gray-500 dark:bg-gray-800 dark:text-gray-400">{t("adminStudentDetail.back")}</button>
        </div>
      </form>
    </div>
  );
}
