"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { superAdminApi, type CertificateDetail } from "@/features/super-admin/services/api";

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-600",
  PENDING: "bg-amber-50 text-amber-700",
  ISSUED: "bg-emerald-50 text-emerald-700",
  REVOKED: "bg-red-50 text-red-700",
  REVOKE_FAILED: "bg-orange-50 text-orange-700",
  REVOKE_PENDING: "bg-yellow-50 text-yellow-700",
};

function InfoRow({ label, value, mono }: { label: string; value: string | null | undefined; mono?: boolean }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-gray-100 dark:border-gray-800/40 last:border-0">
      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 w-32 shrink-0 pt-0.5">{label}</span>
      <span className={`text-xs ${mono ? "font-mono text-[11px]" : ""} ${value ? "" : "text-gray-300"}`}>
        {value || "—"}
      </span>
    </div>
  );
}

export default function CertificateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [cert, setCert] = useState<CertificateDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    superAdminApi.getCertificate(id)
      .then(setCert)
      .catch((err) => setError(err.message || "Không thể tải dữ liệu"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="text-center py-16 text-gray-400 text-xs">Đang tải...</div>;
  if (error) return <div className="text-center py-16 text-red-500 text-xs">{error}</div>;
  if (!cert) return <div className="text-center py-16 text-gray-400 text-xs">Không tìm thấy văn bằng</div>;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-lg font-black text-gray-900 dark:text-white">{cert.certificate_title}</h1>
          <p className="text-[10px] text-gray-400 mt-0.5">ID: {cert.certificate_id}</p>
        </div>
        <span className={`ml-auto inline-block px-3 py-1 rounded-lg text-xs font-bold ${STATUS_COLORS[cert.status] || "bg-gray-100 text-gray-600"}`}>
          {cert.status}
        </span>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Student info */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h2 className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-3">Thông tin sinh viên</h2>
          <InfoRow label="Họ tên" value={cert.student_fullName} />
          <InfoRow label="Ngày sinh" value={cert.dob} />
          <InfoRow label="Nơi sinh" value={cert.placeOfBirth} />
          <InfoRow label="Giới tính" value={cert.gender} />
          <InfoRow label="Dân tộc" value={cert.ethnicity} />
          <InfoRow label="Student ID" value={cert.student_id} mono />
        </div>

        {/* Organization info */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h2 className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-3">Thông tin tổ chức & văn bằng</h2>
          <InfoRow label="Tổ chức" value={cert.organization_name} />
          <InfoRow label="Trường" value={cert.schoolName} />
          <InfoRow label="Khóa thi" value={cert.examCohort} />
          <InfoRow label="Hội đồng" value={cert.examBoard} />
          <InfoRow label="Nơi cấp" value={cert.issueLocation} />
          <InfoRow label="Ngày cấp" value={cert.issueDate} />
          <InfoRow label="Số hiệu" value={cert.serialNumber} mono />
          <InfoRow label="Số vào sổ" value={cert.registryNumber} mono />
        </div>
      </div>

      {/* Blockchain info */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h2 className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-3">Blockchain & IPFS</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
          <InfoRow label="IPFS CID" value={cert.ipfs_cid} mono />
          <InfoRow label="Tx Hash" value={cert.tx_hash} mono />
          <InfoRow label="Block" value={cert.block_number?.toString()} mono />
          <InfoRow label="Gas" value={cert.gas_used} mono />
        </div>
      </div>

      {/* Revocation info */}
      {(cert.status === "REVOKED" || cert.status === "REVOKE_FAILED" || cert.status === "REVOKE_PENDING") && (
        <div className="rounded-2xl border border-red-200 bg-red-50/30 p-5 shadow-sm dark:border-red-900/30 dark:bg-red-950/10">
          <h2 className="text-[10px] font-bold uppercase tracking-wider text-red-400 mb-3">Thông tin thu hồi</h2>
          <InfoRow label="Lý do" value={cert.revokeReason} />
          <InfoRow label="Thu hồi bởi" value={cert.revokedById} mono />
          <InfoRow label="Revoke Tx" value={cert.revoke_tx_hash} mono />
          <InfoRow label="Revoke Block" value={cert.revoke_block_number?.toString()} mono />
          <InfoRow label="Thời gian" value={cert.revokedAt ? new Date(cert.revokedAt).toLocaleString("vi-VN") : null} />
        </div>
      )}

      {/* Quick link */}
      {cert.ipfs_cid && (
        <div className="flex gap-3">
          <a
            href={`https://gateway.pinata.cloud/ipfs/${cert.ipfs_cid}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] font-bold text-primary hover:underline"
          >
            📁 Xem trên IPFS →
          </a>
        </div>
      )}
    </div>
  );
}
