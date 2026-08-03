"use client";
import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import styles from "./page.module.css";
import { useAuth } from "@/features/auth/components/AuthContext";
import { certificateApi, mapCertificateDtoToStudentCert } from "@/features/certificates/services/certificate.api";
import type { StudentCertificate } from "@/features/certificates/types";
import { disputeApi } from "@/features/dispute/services/dispute.api";

const TYPE_OPTIONS = [
  { value: "all", label: "Tất cả các loại" },
  { value: "BACHELOR_DEGREE", label: "Bằng cử nhân" },
  { value: "CERTIFICATE", label: "Chứng chỉ" },
];

const ITEMS_PER_PAGE = 6;

export default function StudentCertificatesPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [certs, setCerts] = useState<StudentCertificate[]>([]);
  
  // Tab state: "official" vs "draft"
  const [activeTab, setActiveTab] = useState<"official" | "draft">("official");
  
  // Filters & Search
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // Correction Request Modal
  const [requestCert, setRequestCert] = useState<StudentCertificate | null>(null);
  const [requestReason, setRequestReason] = useState("");
  const [requestDetails, setRequestDetails] = useState("");
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [requestError, setRequestError] = useState("");
  const [requestSuccess, setRequestSuccess] = useState("");

  const fetchCertificates = () => {
    if (!user?.id) return;
    setLoading(true);
    certificateApi.list({ student_id: user.id })
      .then((list) => {
        setCerts(list.map(mapCertificateDtoToStudentCert));
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCertificates();
  }, [user?.id]);

  // Reset pagination when active tab, filters or search query change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, filterType, filterStatus, searchQuery]);

  const officialCerts = useMemo(() => {
    return certs.filter((c) => c.rawStatus !== "DRAFT");
  }, [certs]);

  const draftCerts = useMemo(() => {
    return certs.filter((c) => c.rawStatus === "DRAFT");
  }, [certs]);

  const currentTabCerts = activeTab === "official" ? officialCerts : draftCerts;

  // Filter and sort by latest issue date first
  const filtered = useMemo(() => {
    const list = currentTabCerts.filter((c) => {
      if (filterType !== "all" && c.type !== filterType) return false;
      if (activeTab === "official") {
        if (filterStatus === "valid" && c.status !== "VALID") return false;
        if (filterStatus === "revoked" && c.status !== "REVOKED") return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = c.credentialTitle.toLowerCase().includes(q);
        const matchCode = c.credentialCode.toLowerCase().includes(q);
        const matchIssuer = c.issuerName.toLowerCase().includes(q);
        const matchName = c.studentName.toLowerCase().includes(q);
        if (!matchTitle && !matchCode && !matchIssuer && !matchName) return false;
      }
      return true;
    });

    // Sort by latest date
    return list.sort((a, b) => {
      const timeA = a.issueDate ? new Date(a.issueDate).getTime() : 0;
      const timeB = b.issueDate ? new Date(b.issueDate).getTime() : 0;
      return (isNaN(timeB) ? 0 : timeB) - (isNaN(timeA) ? 0 : timeA);
    });
  }, [currentTabCerts, filterType, filterStatus, searchQuery, activeTab]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  const handleOpenRequest = (cert: StudentCertificate, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setRequestCert(cert);
    setRequestReason("");
    setRequestDetails("");
    setRequestError("");
    setRequestSuccess("");
  };

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestCert) return;
    if (requestReason.trim().length < 10) {
      setRequestError("Lý do chỉnh sửa phải có ít nhất 10 ký tự.");
      return;
    }

    setSubmittingRequest(true);
    setRequestError("");
    try {
      await disputeApi.create({
        certificate_id: requestCert.id,
        reason: requestReason.trim(),
        details: requestDetails.trim() || undefined,
      });
      setRequestSuccess("Đã gửi yêu cầu chỉnh sửa thành công! Nhà trường sẽ xử lý bản thảo.");
      setTimeout(() => {
        setRequestCert(null);
        setRequestSuccess("");
      }, 2000);
    } catch (err: any) {
      setRequestError(err.message || "Gửi yêu cầu thất bại. Vui lòng thử lại.");
    } finally {
      setSubmittingRequest(false);
    }
  };

  return (
    <div className={styles._1}>
      <div className={styles._2}>
        <div>
          <h1 className={styles._3}>Văn bằng của tôi</h1>
          <p className={styles._4}>
            {loading ? "..." : `${officialCerts.length} văn bằng chính thức · ${draftCerts.length} bản thảo chờ cấp`}
          </p>
        </div>
      </div>

      {/* Tabs bar */}
      <div className="flex border-b border-gray-200 dark:border-gray-800 mb-6 gap-8">
        <button
          onClick={() => setActiveTab("official")}
          className={`pb-3 text-sm font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === "official"
              ? "border-primary text-primary"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          🎓 Văn bằng chính thức
          <span className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary">
            {officialCerts.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("draft")}
          className={`pb-3 text-sm font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === "draft"
              ? "border-amber-500 text-amber-600 dark:text-amber-400"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          ⏳ Văn bằng chờ duyệt (Bản thảo)
          <span className="px-2 py-0.5 text-xs rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
            {draftCerts.length}
          </span>
        </button>
      </div>

      {/* Filters and search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Tìm theo tên bằng, mã văn bằng, trường cấp..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs font-semibold text-gray-800 dark:text-gray-200 outline-none focus:border-primary transition-all"
          />
        </div>

        <div className="flex gap-3">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className={styles._8}
          >
            {TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          {activeTab === "official" && (
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={styles._8}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="valid">Hợp lệ</option>
              <option value="revoked">Đã thu hồi</option>
            </select>
          )}
        </div>
      </div>

      {loading ? (
        <div className={styles._13}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={`${styles._14} animate-pulse`}>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-gray-700" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-3 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className={styles._9}>
          <div className={styles._10}>
            <svg className={styles._11} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className={styles._12}>{error}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className={styles._9}>
          <div className={styles._10}>
            <svg className={styles._11} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className={styles._12}>
            {activeTab === "official"
              ? "Không tìm thấy văn bằng chính thức nào"
              : "Chưa có bản thảo văn bằng chờ duyệt nào"}
          </p>
        </div>
      ) : activeTab === "official" ? (
        <>
          <div className={styles._13}>
            {paginatedList.map((cert) => (
              <Link key={cert.id} href={`/student/certificates/${cert.id}`} className={styles._14}>
                <div className={styles._15}>
                  <div className={styles._16}>
                    <div className={styles._17}>
                      <svg className={styles._18} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={cert.type === "BACHELOR_DEGREE"
                          ? "M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
                          : "M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"}
                        />
                      </svg>
                    </div>
                    <div className={styles._19}>
                      <p className={styles._20}>{cert.type === "BACHELOR_DEGREE" ? "Bằng cử nhân" : "Chứng chỉ"}</p>
                      <h3 className={styles._21}>{cert.credentialTitle}</h3>
                      <p className={styles._22}>{cert.issuerName} · {cert.issueDate}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {cert.onChain && (
                      <span className={styles._24}>
                        <span className={styles._25} />
                        On-chain
                      </span>
                    )}
                    <span className={`${styles._0} ${cert.status === "VALID" ? styles._26 : styles._27}`}>
                      {cert.status === "VALID" ? "Hợp lệ" : "Đã thu hồi"}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-800 mt-6">
              <p className="text-xs text-gray-500 font-semibold">
                Hiển thị {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} trên tổng số {filtered.length} văn bằng
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
      ) : (
        /* Draft certificates list view with detailed info cards & pagination */
        <>
          <div className="space-y-4">
            {paginatedList.map((cert) => (
              <div key={cert.id} className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 shadow-sm hover:shadow-md transition-all">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center shrink-0">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-base text-gray-900 dark:text-white">{cert.credentialTitle}</h3>
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400">
                          Bản thảo / Chờ duyệt cấp
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Trường: {cert.issuerName || cert.schoolName || "Đang cập nhật"}</p>

                      {/* Detailed Info Card for checking draft info */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 text-xs">
                        <div>
                          <span className="text-gray-400 font-semibold block text-[11px] uppercase">Họ và tên</span>
                          <span className="font-bold text-gray-800 dark:text-gray-200">{cert.studentName}</span>
                        </div>
                        {cert.dob && (
                          <div>
                            <span className="text-gray-400 font-semibold block text-[11px] uppercase">Ngày sinh</span>
                            <span className="font-bold text-gray-800 dark:text-gray-200">{cert.dob}</span>
                          </div>
                        )}
                        {cert.gender && (
                          <div>
                            <span className="text-gray-400 font-semibold block text-[11px] uppercase">Giới tính</span>
                            <span className="font-bold text-gray-800 dark:text-gray-200">{cert.gender}</span>
                          </div>
                        )}
                        {cert.placeOfBirth && (
                          <div>
                            <span className="text-gray-400 font-semibold block text-[11px] uppercase">Nơi sinh</span>
                            <span className="font-bold text-gray-800 dark:text-gray-200">{cert.placeOfBirth}</span>
                          </div>
                        )}
                        {cert.ethnicity && (
                          <div>
                            <span className="text-gray-400 font-semibold block text-[11px] uppercase">Dân tộc</span>
                            <span className="font-bold text-gray-800 dark:text-gray-200">{cert.ethnicity}</span>
                          </div>
                        )}
                        {cert.examCohort && (
                          <div>
                            <span className="text-gray-400 font-semibold block text-[11px] uppercase">Khóa thi</span>
                            <span className="font-bold text-gray-800 dark:text-gray-200">{cert.examCohort}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end md:self-start pt-2 md:pt-0">
                    <Link
                      href={`/student/certificates/${cert.id}`}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                    >
                      Xem chi tiết đầy đủ
                    </Link>
                    <button
                      onClick={(e) => handleOpenRequest(cert, e)}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-300/60 hover:bg-amber-100 transition-all"
                    >
                      Yêu cầu chỉnh sửa
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls for Draft Tab */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-800 mt-6">
              <p className="text-xs text-gray-500 font-semibold">
                Hiển thị {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} trên tổng số {filtered.length} bản thảo
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
                          ? "bg-amber-600 text-white"
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

      {/* Correction Request Modal for Draft Certificates */}
      {requestCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => !submittingRequest && setRequestCert(null)}>
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-lg w-full p-6 animate-fadeIn" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">Yêu cầu chỉnh sửa bản thảo</h2>
                <p className="text-xs text-gray-500 mt-0.5">{requestCert.credentialTitle} - {requestCert.studentName}</p>
              </div>
              <button onClick={() => setRequestCert(null)} className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {requestSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold text-center">
                {requestSuccess}
              </div>
            ) : (
              <form onSubmit={handleSendRequest} className="space-y-4">
                {requestError && (
                  <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-600 text-xs font-semibold">
                    {requestError}
                  </div>
                )}

                <div className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 text-[11px] text-amber-800 dark:text-amber-300 space-y-1">
                  <p className="font-bold uppercase tracking-wider text-[10px]">Thông tin bản thảo hiện tại:</p>
                  <p>• Họ tên: {requestCert.studentName}</p>
                  {requestCert.dob && <p>• Ngày sinh: {requestCert.dob}</p>}
                  {requestCert.gender && <p>• Giới tính: {requestCert.gender}</p>}
                  {requestCert.placeOfBirth && <p>• Nơi sinh: {requestCert.placeOfBirth}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Lý do chỉnh sửa <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={requestReason}
                    onChange={(e) => setRequestReason(e.target.value)}
                    placeholder="Mô tả sai sót (ví dụ: Sai ngày sinh, sai chính tả tên, v.v.)"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs text-gray-800 dark:text-gray-200 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Chi tiết thông tin đúng</label>
                  <textarea
                    rows={3}
                    value={requestDetails}
                    onChange={(e) => setRequestDetails(e.target.value)}
                    placeholder="Ghi rõ thông tin chính xác bạn muốn nhà trường điều chỉnh"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs text-gray-800 dark:text-gray-200 outline-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setRequestCert(null)}
                    disabled={submittingRequest}
                    className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-xs font-bold text-gray-600 dark:text-gray-300"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={submittingRequest}
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-xs font-bold text-white transition-all disabled:opacity-50"
                  >
                    {submittingRequest ? "Đang gửi..." : "Gửi yêu cầu"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
