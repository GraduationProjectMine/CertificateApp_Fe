"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import { useAuth } from "@/features/auth/components/AuthContext";
import { studentApi } from "@/features/students/services/student.api";
import { useI18n } from "@/features/i18n/I18nContext";

export default function StudentProfile() {
  const { user, login } = useAuth();
  const router = useRouter();
  const { t } = useI18n();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!name.trim()) { setError(t("studentProfile.error.nameRequired")); return; }
    setSaving(true);
    try {
      const res = await studentApi.updateProfile({ name: name.trim(), email: email.trim() || undefined });
      setSuccess(t("studentProfile.success.updated"));
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("studentProfile.error.failed"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles._1}>
      <div className="flex items-center justify-between mb-6">
        <h1 className={styles._2}>{t("studentProfile.header.title")}</h1>
        {!editing && (
          <button onClick={() => setEditing(true)} className="px-4 py-2 text-xs font-bold text-primary border border-primary/30 rounded-xl hover:bg-primary/5 transition-all">
            {t("studentProfile.edit")}
          </button>
        )}
      </div>

      {error && <div className="mb-4 text-[11px] text-red-500 bg-red-50 dark:bg-red-950/20 px-3 py-2 rounded-lg">{error}</div>}
      {success && <div className="mb-4 text-[11px] text-green-600 bg-green-50 dark:bg-green-950/20 px-3 py-2 rounded-lg">{success}</div>}

      {editing ? (
        <form onSubmit={handleSave} className="rounded-2xl border border-gray-200/60 bg-white p-5 text-sm dark:border-gray-800/60 dark:bg-gray-900 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">{t("studentProfile.form.nameLabel")}</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">{t("studentProfile.form.emailLabel")}</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={saving}
              className="px-5 py-2.5 text-xs font-bold text-white bg-primary hover:bg-primary-hover disabled:opacity-50 rounded-xl transition-all">
              {saving ? t("studentProfile.form.saving") : t("studentProfile.form.save")}
            </button>
            <button type="button" onClick={() => { setEditing(false); setName(user?.name || ""); setEmail(user?.email || ""); }}
              className="px-4 py-2.5 text-xs font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-all">
              {t("studentProfile.form.cancel")}
            </button>
          </div>
        </form>
      ) : (
        <div className="rounded-2xl border border-gray-200/60 bg-white p-5 text-sm dark:border-gray-800/60 dark:bg-gray-900">
          <dl className="space-y-3">
            <div>
              <dt className="text-xs font-bold uppercase text-gray-400 dark:text-gray-500">{t("studentProfile.info.fullName")}</dt>
              <dd className={styles._3}>{user?.name || t("studentProfile.info.notAvailable")}</dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase text-gray-400 dark:text-gray-500">{t("studentProfile.info.email")}</dt>
              <dd className={styles._3}>{user?.email || t("studentProfile.info.notAvailable")}</dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase text-gray-400 dark:text-gray-500">{t("studentProfile.info.accountCode")}</dt>
              <dd className={styles._3}>{user?.id || t("studentProfile.info.notAvailable")}</dd>
            </div>
          </dl>
        </div>
      )}

      <div className="mt-6">
        <button onClick={() => router.push("/student/profile/change-password")}
          className="text-xs font-semibold text-primary hover:underline">
          {t("studentProfile.changePassword")}
        </button>
      </div>
    </div>
  );
}