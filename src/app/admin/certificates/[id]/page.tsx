"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { certificateApi } from "@/features/certificates/services/certificate.api";
import type { CertificateDto } from "@/features/certificates/services/certificate.api";
import { useAuth } from "@/features/auth/components/AuthContext";

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  DRAFT: { label: "Draft", className: "bg-slate-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400" },
  PENDING: { label: "Pending Blockchain", className: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400" },
  ISSUED: { label: "Issued", className: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" },
  REVOKED: { label: "Revoked", className: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400" },
};

export default function CertificateDetailPage() {
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
      alert("Đã có lỗi xảy ra");
    } finally {
      setActionLoading(false);
    }
  };

  const [showApproveConfirmModal, setShowApproveConfirmModal] = useState(false);

  const handleApprove = async () => {
    if (!cert) return;
    setActionLoading(true);
    try {
      await certificateApi.approve(id);
      await fetchCert();
    } catch (err: any) {
      alert("Đã có lỗi xảy ra");
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
    return <div className="p-8 text-center text-gray-400 dark:text-gray-500 text-sm">Đang tải...</div>;
  }

  if (error || !cert) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 text-sm mb-4">{error || "Certificate not found"}</p>
        <Link href="/admin/certificates" className="text-primary text-sm underline">Quay lại danh sách</Link>
      </div>
    );
  }

  const statusStyle = STATUS_MAP[cert.status] || STATUS_MAP.DRAFT;
  const fields = [
    { label: "Mã văn bằng", value: cert.certificate_id },
    { label: "Sinh viên", value: cert.student_fullName },
    { label: "Tên văn bằng", value: cert.certificate_title },
    { label: "Tổ chức", value: cert.organization_name },
    { label: "Ngày sinh", value: cert.dob },
    { label: "Nơi sinh", value: cert.placeOfBirth },
    { label: "Giới tính", value: cert.gender },
    { label: "Dân tộc", value: cert.ethnicity },
    { label: "Trường", value: cert.schoolName },
    { label: "Niên khóa", value: cert.examCohort },
    { label: "Hội đồng thi", value: cert.examBoard },
    { label: "Nơi cấp", value: cert.issueLocation },
    { label: "Ngày cấp", value: cert.issueDate },
    { label: "Số hiệu", value: cert.serialNumber },
    { label: "Số vào sổ", value: cert.registryNumber },
    { label: "IPFS CID", value: cert.ipfs_cid, mono: true },
    { label: "Tx Hash", value: cert.tx_hash, mono: true },
    { label: "Ngày phát hành", value: cert.issuedAt ? new Date(cert.issuedAt).toLocaleString("vi-VN") : "-" },
  ];

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      {actionLoading && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="w-14 h-14 border-4 border-[#147D74] border-t-transparent rounded-full animate-spin mx-auto" />
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">Đang phát hành văn bằng</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Đang ghi dữ liệu &amp; tạo văn bằng. Vui lòng không đóng trang...</p>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal before Blockchain Issuance */}
      {showApproveConfirmModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-[9999] p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 text-slate-900 dark:text-white">
            <div className="text-center p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 space-y-2">
              <div className="mx-auto w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-base font-extrabold text-amber-800 dark:text-amber-300">
                Xác nhận phát hành lên Blockchain
              </h3>
              <p className="text-xs text-amber-700 dark:text-amber-400 font-medium leading-relaxed">
                Văn bằng sau khi được tải/phát hành lên Blockchain &amp; IPFS sẽ <strong>KHÔNG THỂ CHỈNH SỬA Hoặc THAY ĐỔI</strong> dữ liệu.
              </p>
              <p className="text-[11px] text-amber-600 dark:text-amber-500 font-normal italic">
                &ldquo;The certificate can&apos;t be changed after uploaded to chain&rdquo;
              </p>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => setShowApproveConfirmModal(false)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-95"
              >
                Quay lại
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowApproveConfirmModal(false);
                  void handleApprove();
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-95"
              >
                Xác nhận phát hành
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/certificates" className="text-xs text-primary hover:underline">&larr; Quay lại danh sách</Link>
          <h1 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight mt-1">Chi tiết Văn bằng</h1>
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
            className="px-5 py-2.5 text-xs font-bold text-white bg-primary hover:bg-primary-hover disabled:opacity-50 rounded-xl transition-all cursor-pointer"
          >
            {actionLoading ? "Đang xử lý..." : "Gửi duyệt (PENDING)"}
          </button>
        )}
        {cert.status === "PENDING" && user?.role === "issuer" && (
          <button
            onClick={() => setShowApproveConfirmModal(true)}
            disabled={actionLoading}
            className="px-5 py-2.5 text-xs font-bold text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded-xl transition-all cursor-pointer shadow-2xs active:scale-95"
          >
            {actionLoading ? "Đang xử lý..." : "Duyệt & Phát hành (IPFS + Blockchain)"}
          </button>
        )}
        {(cert.status === "DRAFT" || cert.status === "PENDING") && (
          <button
            onClick={handleDelete}
            disabled={actionLoading}
            className="px-5 py-2.5 text-xs font-bold text-red-600 bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/40 disabled:opacity-50 rounded-xl transition-all"
          >
            Xóa
          </button>
        )}
      </div>
    </div>
  );
}
