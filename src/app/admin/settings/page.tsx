"use client";

import styles from "./page.module.css";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/components/AuthContext";
import { issuerApi, type IssuerProfile } from "@/features/issuer/services/issuer.api";
import toast from "react-hot-toast";
import { useI18n } from "@/features/i18n/I18nContext";

const emptyProfile = { organization_name: "", contact_email: "", logo_url: "" };

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const { t } = useI18n();
  const canEdit = user?.role === "issuer";
  const [profile, setProfile] = useState<IssuerProfile | null>(null);
  const [form, setForm] = useState(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileError, setProfileError] = useState("");

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
      .catch((err) => setProfileError(err instanceof Error ? err.message : t("admin.settings.load_failed")))
      .finally(() => setLoading(false));
  }, []);

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
      toast.success(t("admin.settings.update_success"));
    } catch (err) {
      const message = err instanceof Error ? err.message : t("admin.settings.update_failed");
      setProfileError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles._1}>
      <div><h1 className={styles._2}>{t("admin.settings.title")}</h1><p className={styles._3}>{canEdit ? t("admin.settings.edit_desc") : t("admin.settings.readonly_desc")}</p></div>

      <form onSubmit={handleSave} className={styles._4}>
        <div className="flex items-center justify-between gap-4">
          <h2 className={styles._5}>{t("admin.settings.profile")}</h2>
          {profile && <span className={`rounded-full px-3 py-1 text-[10px] font-bold ${profile.is_verified ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>{profile.is_verified ? t("admin.settings.verified") : t("admin.settings.unverified")}</span>}
        </div>
        {loading ? <p className={styles._6}>{t("admin.settings.loading_profile")}</p> : <>
          <div className={styles._17}>
            <Field label={t("admin.settings.org_name")}><input required minLength={2} disabled={!canEdit} value={form.organization_name} onChange={(e) => setForm({ ...form, organization_name: e.target.value })} className={styles._19} /></Field>
            <Field label={t("admin.settings.org_email")}><input required type="email" disabled={!canEdit} value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} className={styles._19} /></Field>
            <Field label={t("admin.settings.logo_url")}><input type="url" disabled={!canEdit} value={form.logo_url} onChange={(e) => setForm({ ...form, logo_url: e.target.value })} placeholder="https://.../logo.png" className={styles._19} /></Field>
            <Field label={t("admin.settings.wallet_address")}><input readOnly value={profile?.wallet_address || t("admin.settings.not_set")} className={styles._19} /></Field>
          </div>
          {profileError && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{profileError}</p>}
          {canEdit && <button disabled={saving} className={styles._20}>{saving ? t("common.saving") : t("admin.settings.save_info")}</button>}
        </>}
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className={styles._18}>{label}</label>{children}</div>;
}
