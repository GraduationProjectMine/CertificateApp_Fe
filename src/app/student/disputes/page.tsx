"use client";
import React, { useState, useEffect, useMemo } from "react";
import styles from "./page.module.css";
import { disputeApi, type DisputeDto } from "@/features/dispute/services/dispute.api";
import { certificateApi, type CertificateDto } from "@/features/certificates/services/certificate.api";

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  PENDING: { label: "Chờ xử lý", className: styles._26 },
  APPROVED: { label: "Đã chấp thuận", className: styles._27 },
  REJECTED: { label: "Từ chối", className: styles._28 },
};

const DISPUTES_PER_PAGE = 5;

export default function StudentDisputesPage() {
  const [disputes, setDisputes] = useState<DisputeDto[]>([]);
  const [certs, setCerts] = useState<CertificateDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  const [formCertId, setFormCertId] = useState("");
  const [formReason, setFormReason] = useState("");
  const [formDetails, setFormDetails] = useState("");
  const [formError, setFormError] = useState("");

  const fetch = async () => {
    setLoading(true);
    setError("");
    try {
      const [d, c] = await Promise.all([
        disputeApi.myDisputes(),
        certificateApi.list(),
      ]);
      setDisputes(d);
      setCerts(c);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  // Sort disputes by latest date
  const sortedDisputes = useMemo(() => {
    return [...disputes].sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return (isNaN(timeB) ? 0 : timeB) - (isNaN(timeA) ? 0 : timeA);
    });
  }, [disputes]);

  const totalPages = Math.max(1, Math.ceil(sortedDisputes.length / DISPUTES_PER_PAGE));
  const paginatedDisputes = useMemo(() => {
    const start = (currentPage - 1) * DISPUTES_PER_PAGE;
    return sortedDisputes.slice(start, start + DISPUTES_PER_PAGE);
  }, [sortedDisputes, currentPage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!formCertId) { setFormError("Vui lòng chọn văn bằng bản thảo"); return; }
    if (formReason.trim().length < 10) { setFormError("Lý do phải có ít nhất 10 ký tự"); return; }

    setSubmitting(true);
    try {
      await disputeApi.create({
        certificate_id: formCertId,
        reason: formReason.trim(),
        details: formDetails.trim() || undefined,
      });
      setShowModal(false);
      setFormCertId("");
      setFormReason("");
      setFormDetails("");
      fetch();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Gửi yêu cầu thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles._1}>
      <div className={styles._2}>
        <div>
          <h1 className={styles._3}>Yêu cầu chỉnh sửa</h1>
          <p className={styles._4}>Quản lý các yêu cầu chỉnh sửa thông tin văn bằng bản thảo</p>
        </div>
        <button onClick={() => setShowModal(true)} className={styles._5}>
          <svg className={styles._6} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Gửi yêu cầu chỉnh sửa
        </button>
      </div>

      {error && <div className={styles._29}>{error}</div>}

      {loading ? (
        <div className={styles._7}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={`${styles._8} animate-pulse`}>
              <div className="space-y-3">
                <div className="h-5 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-3 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-3 w-64 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : disputes.length === 0 ? (
        <div className={styles._9}>
          <div className={styles._10}>
            <svg className={styles._11} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <p className={styles._12}>Chưa có yêu cầu chỉnh sửa nào</p>
          <p className={styles._30}>Nhấn &ldquo;Gửi yêu cầu chỉnh sửa&rdquo; để tạo yêu cầu mới</p>
        </div>
      ) : (
        <>
          <div className={styles._13}>
            {paginatedDisputes.map((d) => {
              const st = STATUS_MAP[d.status] || STATUS_MAP.PENDING;
              return (
                <div key={d.id} className={styles._14}>
                  <div className={styles._15}>
                    <div className={styles._16}>
                      <div className={styles._17}>
                        <svg className={styles._18} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </div>
                      <div className={styles._19}>
                        <h3 className={styles._20}>{d.certificate?.certificate_title || "Văn bằng bản thảo"}</h3>
                        <p className={styles._22}>{d.reason}</p>
                        {d.details && <p className="text-xs text-gray-500 mt-1">Chi tiết: {d.details}</p>}
                        <p className={styles._31}>{new Date(d.createdAt).toLocaleDateString("vi-VN", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                        {d.status !== "PENDING" && d.reviewer_note && (
                          <div className={styles._32}>
                            <span className={styles._33}>Phản hồi từ nhà trường: </span>
                            {d.reviewer_note}
                          </div>
                        )}
                        {d.status !== "PENDING" && d.resolved_at && (
                          <p className={styles._34}>
                            Đã xử lý: {new Date(d.resolved_at).toLocaleDateString("vi-VN", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className={`${styles._0} ${st.className}`}>{st.label}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-800 mt-6">
              <p className="text-xs text-gray-500 font-semibold">
                Hiển thị {((currentPage - 1) * DISPUTES_PER_PAGE) + 1} - {Math.min(currentPage * DISPUTES_PER_PAGE, sortedDisputes.length)} trên tổng số {sortedDisputes.length} yêu cầu
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-600 dark:text-gray-300 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                >
                  Trang trước
                </button>
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pageNum = idx + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                        currentPage === pageNum
                          ? "bg-primary text-white"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-600 dark:text-gray-300 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                >
                  Trang sau
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {showModal && (
        <div className={styles._35} onClick={() => !submitting && setShowModal(false)}>
          <div className={styles._36} onClick={(e) => e.stopPropagation()}>
            <div className={styles._37}>
              <h2 className={styles._38}>Gửi yêu cầu chỉnh sửa</h2>
              <button onClick={() => !submitting && setShowModal(false)} className={styles._39}>
                <svg className={styles._6} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles._40}>
              {formError && <div className={styles._41}>{formError}</div>}

              <div className={styles._42}>
                <label className={styles._43}>Chọn văn bằng</label>
                <select value={formCertId} onChange={(e) => setFormCertId(e.target.value)} className={styles._44}>
                  <option value="">-- Chọn văn bằng bản thảo --</option>
                  {certs.filter((c) => c.status === "DRAFT").map((c) => (
                    <option key={c.certificate_id} value={c.certificate_id}>
                      {c.certificate_title} - {c.student_fullName} (Bản thảo)
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles._42}>
                <label className={styles._43}>Lý do <span className={styles._45}>*</span></label>
                <textarea
                  value={formReason}
                  onChange={(e) => setFormReason(e.target.value)}
                  rows={3}
                  placeholder="Mô tả lý do yêu cầu chỉnh sửa (tối thiểu 10 ký tự)"
                  className={styles._44}
                />
              </div>

              <div className={styles._42}>
                <label className={styles._43}>Chi tiết thêm</label>
                <textarea
                  value={formDetails}
                  onChange={(e) => setFormDetails(e.target.value)}
                  rows={4}
                  placeholder="Thông tin chi tiết bổ sung (không bắt buộc)"
                  className={styles._44}
                />
              </div>

              <div className={styles._46}>
                <button type="button" onClick={() => setShowModal(false)} disabled={submitting} className={styles._47}>
                  Hủy
                </button>
                <button type="submit" disabled={submitting} className={styles._48}>
                  {submitting ? "Đang gửi..." : "Gửi yêu cầu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
