"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { certificateApi } from "@/features/certificates/services/certificate.api";
import type { CertificateDto } from "@/features/certificates/services/certificate.api";
import { useAuth } from "@/features/auth/components/AuthContext";
import { useI18n } from "@/features/i18n/I18nContext";

function statusLabel(s: string, t: ReturnType<typeof useI18n>["t"]): { label: string; className: string } {
  const map: Record<string, { label: string; className: string }> = {
    DRAFT: { label: t("adminCertificateDetail.status.draft"), className: "bg-slate-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400" },
    PENDING: { label: t("adminCertificateDetail.status.pending"), className: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400" },
    ISSUED: { label: t("adminCertificateDetail.status.issued"), className: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" },
    REVOKED: { label: t("adminCertificateDetail.status.revoked"), className: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400" },
  };
  return map[s] || map.DRAFT;
}

export default function CertificateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useI18n();
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
      setError(err.message || t("adminCertificateDetail.loadFailed"));
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
      alert(t("adminCertificateDetail.genericError"));
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
      alert(t("adminCertificateDetail.genericError"));
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(t("adminCertificateDetail.deleteConfirm"))) return;
    setActionLoading(true);
    try {
      await certificateApi.delete(id);
      router.push("/admin/certificates");
    } catch (err: any) {
      alert(err.message || t("adminCertificateDetail.deleteFailed"));
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-400 dark:text-gray-500 text-sm">{t("adminCertificateDetail.loading")}</div>;
  }

  if (error || !cert) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 text-sm mb-4">{error || t("adminCertificateDetail.notFound")}</p>
        <Link href="/admin/certificates" className="text-primary text-sm underline">{t("adminCertificateDetail.backToList")}</Link>
      </div>
    );
  }

  const statusStyle = statusLabel(cert.status, t);
  const fields = [
    { label: t("adminCertificateDetail.fields.certificateId"), value: cert.certificate_id },
    { label: t("adminCertificateDetail.fields.student"), value: cert.student_fullName },
    { label: t("adminCertificateDetail.fields.certificateTitle"), value: cert.certificate_title },
    { label: t("adminCertificateDetail.fields.organization"), value: cert.organization_name },
    { label: t("adminCertificateDetail.fields.dob"), value: cert.dob },
    { label: t("adminCertificateDetail.fields.placeOfBirth"), value: cert.placeOfBirth },
    { label: t("adminCertificateDetail.fields.gender"), value: cert.gender },
    { label: t("adminCertificateDetail.fields.ethnicity"), value: cert.ethnicity },
    { label: t("adminCertificateDetail.fields.school"), value: cert.schoolName },
    { label: t("adminCertificateDetail.fields.examCohort"), value: cert.examCohort },
    { label: t("adminCertificateDetail.fields.examBoard"), value: cert.examBoard },
    { label: t("adminCertificateDetail.fields.issueLocation"), value: cert.issueLocation },
    { label: t("adminCertificateDetail.fields.issueDate"), value: cert.issueDate },
    { label: t("adminCertificateDetail.fields.serialNumber"), value: cert.serialNumber },
    { label: t("adminCertificateDetail.fields.registryNumber"), value: cert.registryNumber },
    { label: "IPFS CID", value: cert.ipfs_cid, mono: true },
    { label: "Tx Hash", value: cert.tx_hash, mono: true },
    { label: t("adminCertificateDetail.fields.issuedDate"), value: cert.issuedAt ? new Date(cert.issuedAt).toLocaleString("vi-VN") : "-" },
  ];

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      {actionLoading && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="w-14 h-14 border-4 border-[#147D74] border-t-transparent rounded-full animate-spin mx-auto" />
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">{t("adminCertificateDetail.processing.title")}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t("adminCertificateDetail.processing.message")}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/certificates" className="text-xs text-primary hover:underline">&larr; {t("adminCertificateDetail.backToList")}</Link>
          <h1 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight mt-1">{t("adminCertificateDetail.title")}</h1>
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
            {actionLoading ? t("adminCertificateDetail.actionProcessing") : t("adminCertificateDetail.submitForApproval")}
          </button>
        )}
        {cert.status === "PENDING" && user?.role === "issuer" && (
          <button
            onClick={handleApprove}
            disabled={actionLoading}
            className="px-5 py-2.5 text-xs font-bold text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded-xl transition-all"
          >
            {actionLoading ? t("adminCertificateDetail.actionProcessing") : t("adminCertificateDetail.approveAndIssue")}
          </button>
        )}
        {(cert.status === "DRAFT" || cert.status === "PENDING") && (
          <button
            onClick={handleDelete}
            disabled={actionLoading}
            className="px-5 py-2.5 text-xs font-bold text-red-600 bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/40 disabled:opacity-50 rounded-xl transition-all"
          >
            {t("adminCertificateDetail.delete")}
          </button>
        )}
      </div>
    </div>
  );
}
