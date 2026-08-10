"use client";
import styles from "./page.module.css";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { certificateApi } from "@/features/certificates/services/certificate.api";
import type { CertificateDto } from "@/features/certificates/services/certificate.api";
import { useAuth } from "@/features/auth/components/AuthContext";
import ConfirmModal from "@/components/common/Modal/ConfirmModal";
import { ActionLink, ActionButton } from "@/components/common/TableActions";
import Pagination from "@/components/common/Pagination";

const ITEMS_PER_PAGE = 10;

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  DRAFT: { label: "Draft", className: "bg-slate-50 dark:bg-slate-800/20 text-gray-450 border-gray-200/50" },
  PENDING: { label: "Pending Blockchain", className: "bg-amber-55/10 text-warning border-amber-250/50 animate-pulse" },
  ISSUED: { label: "Issued", className: "bg-green-55/10 text-green-600 dark:text-green-400 border-green-200/50" },
  REVOKED: { label: "Revoked", className: "bg-red-50 dark:bg-red-950/20 text-danger border-red-200/50" },
};

export default function AdminCertificatesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const isIssuer = user?.role === "issuer";
  const [certificates, setCertificates] = useState<CertificateDto[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteTargetId, setDeleteTargetId] = useState("");
  const [deleteError, setDeleteError] = useState("");

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [batchApproving, setBatchApproving] = useState(false);
  const [batchApproveResult, setBatchApproveResult] = useState<{
    results: { certificateId: string; status: string; error?: string }[];
    successCount: number;
    failCount: number;
    total: number;
  } | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await certificateApi.list(filterStatus ? { status: filterStatus } : undefined);
      setCertificates(data);
    } catch (err: any) {
      setError("Đã có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterStatus]);

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    setDeleteError("");
    try {
      await certificateApi.delete(deleteTargetId);
      setCertificates((prev) => prev.filter((c) => c.certificate_id !== deleteTargetId));
      setDeleteTargetId("");
    } catch (err: any) {
      setDeleteError("Đã có lỗi xảy ra");
    }
  };

  const handleBatchApprove = async () => {
    if (selectedIds.size === 0) return;
    setBatchApproving(true);
    setBatchApproveResult(null);
    try {
      const result = await certificateApi.batchApprove(Array.from(selectedIds));
      setBatchApproveResult(result);
      await fetchData();
      setSelectedIds(new Set());
    } catch (err: any) {
      setError("Đã có lỗi xảy ra");
    } finally {
      setBatchApproving(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.filter((c) => c.status === "PENDING").map((c) => c.certificate_id)));
    }
  };

  const filtered = certificates.filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.certificate_id.toLowerCase().includes(q) ||
      c.student_fullName.toLowerCase().includes(q) ||
      (c.serialNumber && c.serialNumber.toLowerCase().includes(q))
    );
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedCerts = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const pendingCount = filtered.filter((c) => c.status === "PENDING").length;

  return (
    <div className={styles._1}>
      {batchApproving && (
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

      <ConfirmModal
        open={!!deleteTargetId}
        onClose={() => { setDeleteTargetId(""); setDeleteError(""); }}
        title="Xóa văn bằng"
        message="Bạn có chắc chắn muốn xóa văn bằng này? Hành động này không thể hoàn tác."
        confirmLabel="Xóa"
        cancelLabel="Hủy"
        variant="danger"
        icon="danger"
        onConfirm={() => void handleDelete()}
      />

      <div className={styles._2}>
        <div>
          <h1 className={styles._3}>Quản lý Văn bằng</h1>
          <p className={styles._4}>Xem, tìm kiếm thông tin văn bằng đã cấp phát, trạng thái ghi blockchain hoặc yêu cầu thu hồi.</p>
        </div>
        <button onClick={() => router.push("/admin/certificates/issue")} className={styles._5}>
          + Cấp bằng mới
        </button>
      </div>

      <div className={styles._6}>
        <input
          type="text"
          placeholder="Tìm kiếm theo mã văn bằng, tên sinh viên, số hiệu..."
          className={styles._7}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className={styles._8}>
          <select className={styles._9} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="">Tất cả trạng thái</option>
            <option value="DRAFT">Draft</option>
            <option value="PENDING">Pending Blockchain</option>
            <option value="ISSUED">Issued</option>
            <option value="REVOKED">Revoked</option>
          </select>
        </div>
      </div>

      {isIssuer && selectedIds.size > 0 && (
        <div className="mb-4 flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50/50 px-4 py-3 dark:border-amber-900 dark:bg-amber-950/10">
          <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">Đã chọn {selectedIds.size} văn bằng PENDING</span>
          <button
            onClick={handleBatchApprove}
            disabled={batchApproving}
            className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary-hover disabled:opacity-50 transition-all"
          >
            {batchApproving ? "Đang ký blockchain..." : `Ký hàng loạt (${selectedIds.size})`}
          </button>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="rounded-xl border px-3 py-2 text-xs font-bold text-gray-500 dark:text-gray-400"
          >
            Bỏ chọn
          </button>
        </div>
      )}

      {batchApproveResult && (
        <div className="mb-4 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <h3 className="text-xs font-bold text-gray-900 dark:text-white mb-2">Kết quả ký hàng loạt</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Thành công: {batchApproveResult.successCount} / Thất bại: {batchApproveResult.failCount}</p>
          {batchApproveResult.failCount > 0 && (
            <div className="max-h-32 overflow-y-auto space-y-1">
              {batchApproveResult.results.filter((r) => r.status === "FAILED").map((r) => (
                <div key={r.certificateId} className="text-xs text-red-600">
                  <span className="font-mono">{r.certificateId.slice(0, 8)}...</span>: Đã có lỗi xảy ra
                </div>
              ))}
            </div>
          )}
          <button onClick={() => setBatchApproveResult(null)} className="mt-2 text-xs font-bold text-primary hover:underline">Đóng</button>
        </div>
      )}

      {error && <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-xs text-red-600">{error}</div>}
      {deleteError && <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-xs text-red-600">{deleteError}</div>}

      <div className={styles._10}>
        <div className={styles._11}>
          {loading ? (
            <div className="p-8 text-center text-gray-400 dark:text-gray-500 text-xs">Đang tải...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-500 text-xs">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-gray-400 dark:text-gray-500 text-xs">Không có văn bằng nào.</div>
          ) : (
            <>
              <table className={styles._12}>
                <thead>
                  <tr className={styles._13}>
                    {isIssuer && (
                      <th className={styles._14} style={{ width: 36 }}>
                        <input type="checkbox" checked={selectedIds.size === pendingCount && pendingCount > 0} onChange={toggleSelectAll} className="accent-primary" />
                      </th>
                    )}
                    <th className={styles._14}>Mã văn bằng</th>
                    <th className={styles._14}>Sinh viên</th>
                    <th className={styles._14}>Loại bằng</th>
                    <th className={styles._14}>Ngày cấp</th>
                    <th className={styles._15}>IPFS Gateway</th>
                    <th className={styles._15}>Blockchain status</th>
                    <th className={styles._14}>Trạng thái</th>
                    <th className={styles._16}>Thao tác</th>
                  </tr>
                </thead>
                <tbody className={styles._17}>
                  {paginatedCerts.map((cert) => {
                    const statusStyle = STATUS_MAP[cert.status] || STATUS_MAP.DRAFT;
                    const isPending = cert.status === "PENDING";
                    return (
                      <tr key={cert.certificate_id} className={`${styles._18} ${isPending && isIssuer ? "cursor-pointer" : ""}`}>
                        {isIssuer && (
                          <td className={styles._14}>
                            {isPending && (
                              <input type="checkbox" checked={selectedIds.has(cert.certificate_id)} onChange={() => toggleSelect(cert.certificate_id)} className="accent-primary" />
                            )}
                          </td>
                        )}
                        <td className={styles._19}>{cert.certificate_id.slice(0, 8)}...</td>
                        <td className={styles._20}>{cert.student_fullName}</td>
                        <td className={styles._21}>{cert.certificate_title}</td>
                        <td className={styles._14}>
                          {cert.issuedAt ? new Date(cert.issuedAt).toLocaleDateString("vi-VN") : "-"}
                        </td>
                        <td className={styles._15}>
                          {cert.ipfs_cid ? (
                            <span className={styles._23}>{cert.ipfs_cid.slice(0, 12)}...</span>
                          ) : (
                            <span className={styles._24}>-</span>
                          )}
                        </td>
                        <td className={styles._15}>
                          {cert.tx_hash ? (
                            <span className={styles._25}>ON-CHAIN</span>
                          ) : (
                            <span className={styles._26}>OFF-CHAIN</span>
                          )}
                        </td>
                        <td className={styles._14}>
                          <span className={`${styles._0} ${statusStyle.className}`}>
                            {statusStyle.label}
                          </span>
                        </td>
                        <td className={styles._27}>
                          <ActionLink onClick={() => router.push(`/admin/certificates/${cert.certificate_id}`)}>
                            Chi tiết
                          </ActionLink>
                          {cert.status !== "ISSUED" && cert.status !== "REVOKED" && (
                            <ActionButton onClick={() => setDeleteTargetId(cert.certificate_id)}>
                              Xóa
                            </ActionButton>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filtered.length}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={setCurrentPage}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
