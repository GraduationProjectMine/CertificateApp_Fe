"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import QRCodeBox from "@/components/credential/QRCodeBox";
import BlockchainInfo from "@/components/credential/BlockchainInfo";
import IPFSInfo from "@/components/credential/IPFSInfo";
import Loading from "@/components/common/Loading";
import ErrorMessage from "@/components/common/ErrorMessage";
import { verifierApi, type VerifyCertificateResponse } from "@/features/verification/services/verifier.api";
import { useI18n } from "@/features/i18n/I18nContext";

export default function PublicCredentialPage() {
  const { t } = useI18n();
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<VerifyCertificateResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    verifierApi.getAnyCertificate(id)
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : t("public.certificate.not_found")))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="mx-auto max-w-5xl p-8"><Loading message={t("public.certificate.loading")} /></div>;
  if (error) return <div className="mx-auto max-w-3xl p-8"><ErrorMessage message={error} onRetry={() => window.location.reload()} /></div>;
  if (!data) return null;

  const detail = data.certificateDetails;
  const isRevoked = data.status === "REVOKED";
  const isValid = data.isValid && !isRevoked;
  const verifyUrl = typeof window === "undefined" ? "" : window.location.href;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 dark:bg-slate-950">
      <div className="mx-auto max-w-5xl space-y-6">
        <Link href="/public/verify" className="text-xs font-bold text-primary hover:underline">{t("public.certificate.verify_another")}</Link>

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className={`px-6 py-5 ${isValid ? "bg-emerald-600" : isRevoked ? "bg-amber-600" : "bg-red-600"} text-white`}>
            <p className="text-xs font-bold uppercase tracking-[0.2em]">{t("public.certificate.result_label")}</p>
            <h1 className="mt-2 text-2xl font-black">{isValid ? t("public.certificate.result_valid") : isRevoked ? t("public.certificate.result_revoked") : t("public.certificate.result_invalid")}</h1>
            <p className="mt-1 text-sm opacity-90">{detail.certificateTitle}</p>
          </div>

          <div className="grid gap-8 p-6 md:grid-cols-[1fr_auto]">
            <dl className="grid gap-4 text-sm sm:grid-cols-2">
              <Field label={t("public.certificate.field_recipient")} value={detail.studentFullName} />
              <Field label={t("public.certificate.field_issuer")} value={detail.organizationName} />
              <Field label={t("public.certificate.field_serial")} value={detail.serialNumber} />
              <Field label={t("public.certificate.field_registry")} value={detail.registryNumber} />
              <Field label={t("public.certificate.field_issue_date")} value={detail.issueDate || detail.issuedAt} />
              <Field label={t("public.certificate.field_issue_location")} value={detail.issueLocation} />
              <Field label={t("public.certificate.field_dob")} value={detail.dob} />
              <Field label={t("public.certificate.field_pob")} value={detail.placeOfBirth} />
              <Field label={t("public.certificate.field_exam_cohort")} value={detail.examCohort} />
              <Field label={t("public.certificate.field_exam_board")} value={detail.examBoard} />
              {isRevoked && <Field label={t("public.certificate.field_revoked_date")} value={detail.revokedAt ? new Date(detail.revokedAt).toLocaleString("vi-VN") : null} />}
              {isRevoked && <Field label={t("public.certificate.field_revoke_reason")} value={detail.revokeReason} />}
              {isRevoked && <Field label={t("public.certificate.field_revoke_tx")} value={detail.revokeTransactionHash} />}
            </dl>
            {verifyUrl && <QRCodeBox value={verifyUrl} size={140} title={t("public.certificate.qr_title")} />}
          </div>

          {(detail.fileUrl || data.blockchain?.cid) && (
            <div className="border-t border-slate-100 p-6 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">{t("public.certificate.ipfs_image_title")}</h2>
              <div className="flex flex-col items-center justify-center">
                <img
                  src={detail.fileUrl || `https://gateway.pinata.cloud/ipfs/${data.blockchain?.cid}`}
                  alt={t("public.certificate.image_alt")}
                  className="max-h-[500px] w-auto object-contain rounded-2xl border border-slate-200 shadow-md dark:border-slate-800"
                  onError={(e) => {
                    if (data.blockchain?.cid && !(e.target as HTMLImageElement).src.includes('ipfs.io')) {
                      (e.target as HTMLImageElement).src = `https://ipfs.io/ipfs/${data.blockchain.cid}`;
                    }
                  }}
                />
                <a
                  href={detail.fileUrl || `https://gateway.pinata.cloud/ipfs/${data.blockchain?.cid}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
                >
                  <span>{t("public.certificate.ipfs_view_original")}</span>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          )}
        </section>

        <div className="grid gap-6 md:grid-cols-2">
          <BlockchainInfo transactionHash={detail.txHash || undefined} timestamp={detail.issuedAt || undefined} />
          <IPFSInfo cid={data.blockchain?.cid} metadataHash={data.blockchain?.sha3Hash} pinStatus={data.ipfsFetchSuccess ? "Pinned" : t("public.certificate.ipfs_unavailable")} />
        </div>

        {!data.blockchain && <p className="rounded-xl bg-amber-50 px-4 py-3 text-xs text-amber-700 dark:bg-amber-950/20">{t("public.certificate.blockchain_unavailable")}</p>}
      </div>
    </main>
  );
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return <div><dt className="text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">{label}</dt><dd className="mt-1 font-semibold text-slate-800 dark:text-slate-100">{value}</dd></div>;
}
