"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { certificateApi } from "@/features/certificates/services/certificate.api";
import type { CertificateDto } from "@/features/certificates/services/certificate.api";
import { useAuth } from "@/features/auth/components/AuthContext";
import { useI18n } from "@/features/i18n/I18nContext";

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  DRAFT: { label: "Draft", className: "bg-slate-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400" },
  PENDING: { label: "Pending Blockchain", className: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400" },
  ISSUED: { label: "Issued", className: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" },
  REVOKED: { label: "Revoked", className: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400" },
};

export default function CertificateDetailPage() {
  const { t } = useI18n();
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [cert, setCert] = useState<CertificateDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchCert = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await certificateApi.get(id);
      setCert(data);
    } catch (err: any) {
      setError(err.message || "Failed to load certificate");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCert();
  }, [id]);

  const handleSubmit = async () => {
    if (!cert) return;
    setActionLoading(true);
    try {
      await certificateApi.updateStatus(id, "PENDING");
      await fetchCert();
    } catch (err: any) {
      alert(err.message || "Failed to submit");
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!cert) return;
    setActionLoading(true);
    try {
      await certificateApi.approve(id);
      await fetchCert();
    } catch (err: any) {
      alert(err.message || "Failed to approve");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this certificate?")) return;
    setActionLoading(true);
    try {
      await certificateApi.delete(id);
      router.push("/admin/certificates");
    } catch (err: any) {
      alert(err.message || "Delete failed");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-400 dark:text-gray-500 text-sm">{t("common.loading")}</div>;
  }

  if (error || !cert) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 text-sm mb-4">{error || "Certificate not found"}</p>
        <Link href="/admin/certificates" className="text-primary text-sm underline">{t("common.back_to_list")}</Link>
      </div>
    );
  }

  const statusStyle = STATUS_MAP[cert.status] || STATUS_MAP.DRAFT;
  const fields = [
    { label: t("admin.certificates.code"), value: cert.certificate_id },
    { label: t("admin.certificates.student_name"), value: cert.student_fullName },
    { label: t("admin.certificates.name"), value: cert.certificate_title },
    { label: t("admin.certificates.organization"), value: cert.organization_name },
    { label: t("admin.certificates.dob"), value: cert.dob },
    { label: t("admin.certificates.place_of_birth"), value: cert.placeOfBirth },
    { label: t("admin.certificates.gender"), value: cert.gender },
    { label: t("admin.certificates.ethnicity"), value: cert.ethnicity },
    { label: t("admin.certificates.school"), value: cert.schoolName },
    { label: t("admin.certificates.exam_cohort"), value: cert.examCohort },
    { label: t("admin.certificates.exam_board"), value: cert.examBoard },
    { label: t("admin.certificates.issue_location"), value: cert.issueLocation },
    { label: t("admin.certificates.issue_date"), value: cert.issueDate },
    { label: t("admin.certificates.serial_number"), value: cert.serialNumber },
    { label: t("admin.certificates.registry_number"), value: cert.registryNumber },
    { label: "IPFS CID", value: cert.ipfs_cid, mono: true },
    { label: "Tx Hash", value: cert.tx_hash, mono: true },
    { label: t("admin.certificates.issued_at"), value: cert.issuedAt ? new Date(cert.issuedAt).toLocaleString("vi-VN") : "-" },
  ];

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/certificates" className="text-xs text-primary hover:underline">&larr; {t("common.back_to_list")}</Link>
          <h1 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight mt-1">{t("admin.certificates.detail")}</h1>
        </div>
        <span className={`px-3 py-1 rounded-md text-xs font-bold border ${statusStyle.className}`}>
          {statusStyle.label}
        </span>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800/60 rounded-3xl overflow-hidden">
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {fields.map((f) => (
            f.value ? (
              <div key={f.label} className="flex items-center px-6 py-3">
                <span className="w-36 text-xs font-semibold text-gray-500 dark:text-gray-400 shrink-0">{f.label}</span>
                <span className={`text-xs text-gray-900 dark:text-white ${f.mono ? "font-mono text-[11px]" : ""}`}>
                  {f.value}
                </span>
              </div>
            ) : null
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        {cert.status === "DRAFT" && (
          <button
            onClick={handleSubmit}
            disabled={actionLoading}
            className="px-5 py-2.5 text-xs font-bold text-white bg-primary hover:bg-primary-hover disabled:opacity-50 rounded-xl transition-all"
          >
            {actionLoading ? t("common.processing") : t("admin.certificates.submit_for_review")}
          </button>
        )}
        {cert.status === "PENDING" && user?.role === "issuer" && (
          <button
            onClick={handleApprove}
            disabled={actionLoading}
            className="px-5 py-2.5 text-xs font-bold text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded-xl transition-all"
          >
            {actionLoading ? t("common.processing") : t("admin.certificates.approve_and_issue")}
          </button>
        )}
        {(cert.status === "DRAFT" || cert.status === "PENDING") && (
          <button
            onClick={handleDelete}
            disabled={actionLoading}
            className="px-5 py-2.5 text-xs font-bold text-red-600 bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/40 disabled:opacity-50 rounded-xl transition-all"
          >
            {t("common.delete")}
          </button>
        )}
      </div>
    </div>
  );
}
