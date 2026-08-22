"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { staffApi } from "@/features/staff/services/staff.api";
import { useI18n } from "@/features/i18n/I18nContext";
import { validateEmail, validateMinLength, validatePassword } from "@/lib/validators";
import toast from "react-hot-toast";

const emptyForm = { name: "", email: "", role: "", isActive: true, password: "" };

export default function StaffDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [form, setForm] = useState(emptyForm);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { t } = useI18n();

  useEffect(() => {
    staffApi.get(id)
      .then((staff) => setForm({
        name: staff.name,
        email: staff.email,
        role: staff.role,
        isActive: staff.isActive,
        password: "",
      }))
      .catch((err) => setError(err instanceof Error ? err.message : t("adminStaffDetail.loadError")))
      .finally(() => setLoading(false));
  }, [id, t]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    const name = form.name.trim();
    const email = form.email.trim();
    const password = form.password.trim();
    if (!validateMinLength(name, 2)) {
      setError(t("common.validation.invalidName"));
      return;
    }
    if (!validateEmail(email)) {
      setError(t("common.validation.invalidEmail"));
      return;
    }
    if (password && !validatePassword(password)) {
      setError(t("common.validation.invalidPassword"));
      return;
    }
    setSaving(true);
    try {
      const payload: any = { name, email, isActive: form.isActive };
      if (password) payload.password = password;
      await staffApi.update(id, payload);
      setForm((current) => ({ ...current, name, email, password: "" }));
      setSuccess(t("adminStaffDetail.updateSuccess"));
      toast.success(t("adminStaffDetail.updateSuccess"));
    } catch (err) {
      const message = err instanceof Error ? err.message : t("adminStaffDetail.updateError");
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-xs text-gray-400 dark:text-gray-500">{t("adminStaffDetail.loading")}</div>;

  return (
    <div className="mx-auto max-w-xl space-y-6 p-6">
      <div>
        <h1 className="text-xl font-black uppercase tracking-tight text-gray-900 dark:text-white">{t("adminStaffDetail.title")}</h1>
        <p className="mt-1 break-all text-xs text-gray-500 dark:text-gray-400">ID: {id}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl border border-gray-200/60 bg-white p-6 dark:border-gray-800/60 dark:bg-gray-900">
        <label className="block text-xs font-bold">{t("adminStaffDetail.nameLabel")}
          <input required minLength={2} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1.5 w-full rounded-xl border border-gray-200 bg-transparent px-3 py-2.5 font-normal dark:border-gray-800" />
        </label>
        <label className="block text-xs font-bold">{t("adminStaffDetail.emailLabel")}
          <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1.5 w-full rounded-xl border border-gray-200 bg-transparent px-3 py-2.5 font-normal dark:border-gray-800" />
        </label>
        <label className="block text-xs font-bold">{t("adminStaffDetail.roleLabel")}
          <input readOnly value={form.role === 'ISSUER' ? t("adminStaffDetail.roleAdmin") : t("adminStaffDetail.roleStaff")} className="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 font-normal text-gray-500 dark:border-gray-800 dark:bg-gray-800/50 dark:text-gray-400" />
        </label>
        <label className="block text-xs font-bold">{t("adminStaffDetail.statusLabel")}
          <select value={form.isActive ? "ACTIVE" : "INACTIVE"} onChange={(e) => setForm({ ...form, isActive: e.target.value === "ACTIVE" })} className="mt-1.5 w-full rounded-xl border border-gray-200 bg-transparent px-3 py-2.5 font-normal dark:border-gray-800">
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>
        </label>
        <div className="space-y-1.5">
          <label className="block text-xs font-bold">{t("adminStaffDetail.passwordLabel")}</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              minLength={8}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder={t("adminStaffDetail.passwordPlaceholder")}
              className="w-full rounded-xl border border-gray-200 bg-transparent px-3 py-2.5 pr-10 font-normal dark:border-gray-800 focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none"
              title={showPassword ? t("adminStaffDetail.hidePassword") : t("adminStaffDetail.showPassword")}
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
          <button disabled={saving} className="rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-white disabled:opacity-50">{saving ? t("adminStaffDetail.saving") : t("adminStaffDetail.saveChanges")}</button>
          <button type="button" onClick={() => router.push("/admin/staff")} className="rounded-xl bg-gray-100 px-4 py-2.5 text-xs font-bold text-gray-500 dark:bg-gray-800">{t("adminStaffDetail.back")}</button>
        </div>
      </form>
    </div>
  );
}
