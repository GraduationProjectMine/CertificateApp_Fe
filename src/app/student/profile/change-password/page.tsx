"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { studentApi } from "@/features/students/services/student.api";
import { useI18n } from "@/features/i18n/I18nContext";

export default function ChangePasswordPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.currentPassword) { setError(t("student.profile.enter_current_password")); return; }
    if (form.newPassword.length < 8) { setError(t("student.profile.password_min_length")); return; }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.newPassword)) {
      setError(t("student.profile.password_requirement")); return;
    }
    if (form.newPassword !== form.confirmPassword) { setError(t("student.profile.password_mismatch")); return; }

    setSaving(true);
    try {
      await studentApi.changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setSuccess(t("student.profile.change_password_success"));
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : t("student.profile.change_password_failed"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{t("student.profile.change_password")}</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t("student.profile.change_password_desc")}</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800/60 rounded-3xl p-6 space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">{t("student.profile.current_password")} *</label>
          <input type="password"
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            value={form.currentPassword}
            onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">{t("student.profile.new_password")} *</label>
          <input type="password"
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            value={form.newPassword}
            onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
            placeholder={t("student.profile.password_min_hint")}
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">{t("student.profile.confirm_new_password")} *</label>
          <input type="password"
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
          />
        </div>

        {error && <div className="text-[11px] text-red-500 bg-red-50 dark:bg-red-950/20 px-3 py-2 rounded-lg">{error}</div>}
        {success && <div className="text-[11px] text-green-600 bg-green-50 dark:bg-green-950/20 px-3 py-2 rounded-lg">{success}</div>}

        <div className="flex gap-3">
          <button type="submit" disabled={saving}
            className="px-5 py-2.5 text-xs font-bold text-white bg-primary hover:bg-primary-hover disabled:opacity-50 rounded-xl transition-all">
            {saving ? t("common.processing") : t("student.profile.change_password")}
          </button>
          <button type="button" onClick={() => router.push("/student/profile")}
            className="px-4 py-2.5 text-xs font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-all">
            {t("common.back")}
          </button>
        </div>
      </form>
    </div>
  );
}