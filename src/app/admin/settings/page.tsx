"use client";

import styles from "./page.module.css";
import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "@/features/auth/components/AuthContext";
import { issuerApi, type IssuerProfile } from "@/features/issuer/services/issuer.api";
import toast from "react-hot-toast";
import { useI18n } from "@/features/i18n/I18nContext";

const emptyProfile = { organization_name: "", contact_email: "", logo_url: "" };

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const canEdit = user?.role === "issuer";
  const [profile, setProfile] = useState<IssuerProfile | null>(null);
  const [form, setForm] = useState(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [profileError, setProfileError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useI18n();

  useEffect(() => {
    issuerApi.getProfile()
      .then((data) => {
        setProfile(data);
        setForm({
          organization_name: data.organization_name,
          contact_email: data.contact_email,
          logo_url: data.logo_url || "",
        });
      })
      .catch((err) => setProfileError(err instanceof Error ? err.message : t("adminSettings.loadError")))
      .finally(() => setLoading(false));
  }, [t]);

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canEdit) return;
    setSaving(true);
    setProfileError("");
    try {
      const updated = await issuerApi.updateProfile({
        organization_name: form.organization_name.trim(),
        contact_email: form.contact_email.trim(),
        logo_url: form.logo_url.trim(),
      });
      setProfile(updated);
      setForm({
        organization_name: updated.organization_name,
        contact_email: updated.contact_email,
        logo_url: updated.logo_url || "",
      });
      toast.success(t("adminSettings.saveSuccess"));
    } catch (err) {
      const message = err instanceof Error ? err.message : t("adminSettings.saveError");
      setProfileError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error(t("adminSettings.logoTypeError"));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(t("adminSettings.logoSizeError"));
      return;
    }

    setUploadingLogo(true);
    setProfileError("");

    try {
      const res = await issuerApi.uploadLogo(file);
      setForm((prev) => ({ ...prev, logo_url: res.logo_url }));
      if (profile) {
        setProfile({ ...profile, logo_url: res.logo_url });
      }
      toast.success(t("adminSettings.logoUploadSuccess"));
    } catch (err) {
      const message = err instanceof Error ? err.message : t("adminSettings.logoUploadError");
      setProfileError(message);
      toast.error(message);
    } finally {
      setUploadingLogo(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className={styles._1}>
      <div>
        <h1 className={styles._2}>{t("adminSettings.title")}</h1>
        <p className={styles._3}>
          {canEdit ? t("adminSettings.descriptionEdit") : t("adminSettings.descriptionReadOnly")}
        </p>
      </div>

      <form onSubmit={handleSave} className={styles._4}>
        <div className="flex items-center justify-between gap-4">
          <h2 className={styles._5}>{t("adminSettings.profileTitle")}</h2>
          {profile && (
            <span
              className={`rounded-full px-3 py-1 text-[10px] font-bold ${profile.is_verified ? "bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400" : "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400"
                }`}
            >
              {profile.is_verified ? t("adminSettings.verified") : t("adminSettings.unverified")}
            </span>
          )}
        </div>

        {loading ? (
          <p className={styles._6}>{t("adminSettings.loading")}</p>
        ) : (
          <>
            {/* Logo Section */}
            <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl bg-slate-50 dark:bg-gray-800/40 border border-slate-100 dark:border-gray-800 mb-2">
              <div className="relative w-24 h-24 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 bg-white dark:bg-gray-900 flex items-center justify-center overflow-hidden shadow-sm shrink-0">
                {form.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={form.logo_url}
                    alt={t("adminSettings.logoAlt")}
                    className="w-full h-full object-contain p-1"
                  />
                ) : (
                  <div className="text-center p-2 text-slate-400 dark:text-slate-500">
                    <svg className="w-8 h-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-[10px] block mt-1">{t("adminSettings.noLogo")}</span>
                  </div>
                )}
                {uploadingLogo && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-xs font-semibold backdrop-blur-[1px]">
                    {t("adminSettings.uploading")}
                  </div>
                )}
              </div>

              <div className="flex-1 text-center sm:text-left space-y-2">
                <h3 className="text-sm font-semibold text-slate-800 dark:text-white">{t("adminSettings.logoTitle")}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t("adminSettings.logoDescription")}
                </p>

                {canEdit && (
                  <div className="flex flex-wrap gap-2 pt-1 justify-center sm:justify-start">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png, image/jpeg, image/webp, image/svg+xml, image/gif"
                      className="hidden"
                      onChange={handleLogoFileChange}
                      disabled={uploadingLogo}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingLogo}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-medium rounded-lg transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      {uploadingLogo ? t("adminSettings.uploadingLogo") : t("adminSettings.uploadLogo")}
                    </button>
                    {form.logo_url && (
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, logo_url: "" })}
                        disabled={uploadingLogo}
                        className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-medium rounded-lg transition-colors"
                      >
                        {t("adminSettings.removeLogo")}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className={styles._17}>
              <Field label={t("adminSettings.fields.organizationName")}>
                <input
                  required
                  minLength={2}
                  disabled={!canEdit}
                  value={form.organization_name}
                  onChange={(e) => setForm({ ...form, organization_name: e.target.value })}
                  className={styles._19}
                />
              </Field>
              <Field label={t("adminSettings.fields.contactEmail")}>
                <input
                  required
                  type="email"
                  disabled={!canEdit}
                  value={form.contact_email}
                  onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
                  className={styles._19}
                />
              </Field>
              <Field label={t("adminSettings.fields.logoUrl")}>
                <input
                  type="url"
                  disabled={!canEdit}
                  value={form.logo_url}
                  onChange={(e) => setForm({ ...form, logo_url: e.target.value })}
                  placeholder="https://res.cloudinary.com/.../logo.png"
                  className={styles._19}
                />
              </Field>
              <Field label={t("adminSettings.fields.walletAddress")}>
                <input readOnly value={profile?.wallet_address || t("adminSettings.walletNotSet")} className={styles._19} />
              </Field>
            </div>
            {profileError && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{profileError}</p>}
            {canEdit && (
              <button disabled={saving} className={styles._20}>
                {saving ? t("adminSettings.saving") : t("adminSettings.save")}
              </button>
            )}
          </>
        )}
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className={styles._18}>{label}</label>
      {children}
    </div>
  );
}
