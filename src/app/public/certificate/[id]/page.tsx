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

export default function PublicCredentialPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<VerifyCertificateResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    verifierApi.getCertificate(id)
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : "Không tìm thấy văn bằng."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="mx-auto max-w-5xl p-8"><Loading message="Đang xác minh thông tin văn bằng..." /></div>;
  if (error) return <div className="mx-auto max-w-3xl p-8"><ErrorMessage message={error} onRetry={() => window.location.reload()} /></div>;
  if (!data) return null;

  const detail = data.certificateDetails;
  const isRevoked = data.status === "REVOKED";
  const isValid = data.isValid && !isRevoked;
  const verifyUrl = typeof window === "undefined" ? "" : window.location.href;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 dark:bg-slate-950">
      <div className="mx-auto max-w-5xl space-y-6">
        <Link href="/public/verify" className="text-xs font-bold text-primary hover:underline">← Xác minh văn bằng khác</Link>

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className={`px-6 py-5 ${isValid ? "bg-emerald-600" : isRevoked ? "bg-amber-600" : "bg-red-600"} text-white`}>
            <p className="text-xs font-bold uppercase tracking-[0.2em]">Kết quả xác minh</p>
            <h1 className="mt-2 text-2xl font-black">{isValid ? "Văn bằng hợp lệ" : isRevoked ? "Văn bằng đã bị thu hồi" : "Không thể xác thực blockchain"}</h1>
            <p className="mt-1 text-sm opacity-90">{detail.certificateTitle}</p>
          </div>

          <div className="grid gap-8 p-6 md:grid-cols-[1fr_auto]">
            <dl className="grid gap-4 text-sm sm:grid-cols-2">
              <Field label="Người được cấp" value={detail.studentFullName} />
              <Field label="Tổ chức cấp" value={detail.organizationName} />
              <Field label="Số hiệu" value={detail.serialNumber} />
              <Field label="Số vào sổ" value={detail.registryNumber} />
              <Field label="Ngày cấp" value={detail.issueDate || detail.issuedAt} />
              <Field label="Nơi cấp" value={detail.issueLocation} />
              <Field label="Ngày sinh" value={detail.dob} />
              <Field label="Nơi sinh" value={detail.placeOfBirth} />
              <Field label="Khóa thi" value={detail.examCohort} />
              <Field label="Hội đồng thi" value={detail.examBoard} />
              {isRevoked && <Field label="Ngày thu hồi" value={detail.revokedAt ? new Date(detail.revokedAt).toLocaleString("vi-VN") : null} />}
              {isRevoked && <Field label="Lý do thu hồi" value={detail.revokeReason} />}
              {isRevoked && <Field label="Transaction thu hồi" value={detail.revokeTransactionHash} />}
            </dl>
            {verifyUrl && <QRCodeBox value={verifyUrl} size={140} title="Quét để xem bản xác minh" />}
          </div>

          {(detail.fileUrl || data.blockchain?.cid) && (
            <div className="border-t border-slate-100 p-6 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Tệp ảnh văn bằng gốc trên IPFS</h2>
              <div className="flex flex-col items-center justify-center">
                <img
                  src={detail.fileUrl || `https://gateway.pinata.cloud/ipfs/${data.blockchain?.cid}`}
                  alt="Original Certificate Scan"
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
                  <span>Xem ảnh gốc trực tiếp trên IPFS Gateway</span>
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
          <IPFSInfo cid={data.blockchain?.cid} metadataHash={data.blockchain?.sha3Hash} pinStatus={data.ipfsFetchSuccess ? "Pinned" : "Không truy xuất được"} />
        </div>

        {!data.blockchain && <p className="rounded-xl bg-amber-50 px-4 py-3 text-xs text-amber-700 dark:bg-amber-950/20">Dịch vụ blockchain chưa trả dữ liệu. Thông tin trên chỉ phản ánh bản ghi hiện có trong hệ thống.</p>}
      </div>
    </main>
  );
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return <div><dt className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</dt><dd className="mt-1 font-semibold text-slate-800 dark:text-slate-100">{value}</dd></div>;
}
