"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { staffApi } from "@/features/staff/services/staff.api";
import { useAuth } from "@/features/auth/components/AuthContext";
import { useI18n } from "@/features/i18n/I18nContext";

export default function CreateStaffPage() {
  const router = useRouter();
  const { t } = useI18n();
  const { user } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user?.role !== "issuer") {
      setError(t("admin.staff.no_permission_create"));
      return;
    }
    if (!form.name || !form.email || !form.password) {
      setError(t("common.fill_all_fields"));
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await staffApi.create(form);
      router.push("/admin/staff");
    } catch (err: any) {
      setError(err.message || t("admin.staff.create_failed"));
    } finally {
      setSubmitting(false);
    }
  };

  if (user?.role !== "issuer") {
    return (
      <div className="max-w-lg mx-auto p-6 space-y-4">
        <h1 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{t("admin.staff.no_permission_title")}</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400">{t("admin.staff.no_permission_desc")}</p>
        <button
          type="button"
          onClick={() => router.push("/admin/staff")}
          className="px-4 py-2.5 text-xs font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-all"
        >
          {t("admin.staff.back_to_list")}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{t("admin.staff.create_title")}</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t("admin.staff.create_description")}</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800/60 rounded-3xl p-6 space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">{t("admin.staff.full_name")} *</label>
          <input
            type="text"
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder={t("admin.staff.name_placeholder")}
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">{t("admin.staff.email")} *</label>
          <input
            type="email"
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="staff@school.edu.vn"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">{t("common.password")} *</label>
          <input
            type="password"
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder={t("common.password_min_complex")}
          />
        </div>

        {error && <div className="text-[11px] text-red-500 bg-red-50 dark:bg-red-950/20 px-3 py-2 rounded-lg">{error}</div>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2.5 text-xs font-bold text-white bg-primary hover:bg-primary-hover disabled:opacity-50 rounded-xl transition-all"
          >
            {submitting ? t("common.creating") : t("admin.staff.create_submit")}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/staff")}
className="px-4 py-2.5 text-xs font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-all"
          >
            {t("common.cancel")}
          </button>
        </div>
      </form>
    </div>
  );
}
