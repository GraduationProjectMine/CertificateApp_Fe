"use client";
import React, { useState, useEffect } from "react";
import styles from "./page.module.css";
import { disputeApi, type DisputeDto } from "@/features/dispute/services/dispute.api";

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  PENDING: { label: "Chờ xử lý", className: styles._26 },
  APPROVED: { label: "Đã chấp thuận", className: styles._27 },
  REJECTED: { label: "Từ chối", className: styles._28 },
};

const STATUS_FILTERS = [
  { value: "", label: "Tất cả" },
  { value: "PENDING", label: "Chờ xử lý" },
  { value: "APPROVED", label: "Đã chấp thuận" },
  { value: "REJECTED", label: "Từ chối" },
];

export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState<DisputeDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [reviewTarget, setReviewTarget] = useState<DisputeDto | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [decision, setDecision] = useState<"APPROVED" | "REJECTED">("APPROVED");
  const [reviewerNote, setReviewerNote] = useState("");
  const [newCertData, setNewCertData] = useState("");
  const [reviewError, setReviewError] = useState("");

  const fetch = async (status?: string) => {
    setLoading(true);
    setError("");
    try {
      setDisputes(await disputeApi.orgList(status || undefined));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(statusFilter); }, [statusFilter]);

  const openReview = (d: DisputeDto) => {
    setReviewTarget(d);
    setDecision("APPROVED");
    setReviewerNote("");
    setNewCertData("");
    setReviewError("");
  };

  const handleReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewTarget) return;
    setReviewError("");
    setSubmitting(true);

    let parsed: any;
    if (decision === "APPROVED" && newCertData.trim()) {
      try {
        parsed = JSON.parse(newCertData);
      } catch {
        setReviewError("Dữ liệu chỉnh sửa không đúng định dạng JSON");
        setSubmitting(false);
        return;
      }
    }

    try {
      await disputeApi.review(reviewTarget.id, {
        decision,
        reviewer_note: reviewerNote.trim() || undefined,
        new_cert_data: parsed,
      });
      setReviewTarget(null);
      fetch(statusFilter);
    } catch (err) {
      setReviewError(err instanceof Error ? err.message : "Xử lý thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles._1}>
      <div className={styles._2}>
        <div>
          <h1 className={styles._3}>Yêu cầu chỉnh sửa</h1>
          <p className={styles._4}>Quản lý các yêu cầu chỉnh sửa thông tin văn bằng</p>
        </div>
      </div>

      <div className={styles._52}>
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={`${styles._53} ${statusFilter === f.value ? styles._54 : styles._55}`}
          >
            {f.label}
          </button>
        ))}
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className={styles._12}>Không có yêu cầu nào</p>
        </div>
      ) : (
        <div className={styles._13}>
          {disputes.map((d) => {
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
                      <h3 className={styles._20}>{d.certificate?.certificate_title || "Văn bằng"}</h3>
                      <p className={styles._56}>Sinh viên: {d.certificate?.student_fullName || "N/A"}</p>
                      <p className={styles._22}>{d.reason}</p>
                      <p className={styles._31}>{new Date(d.createdAt).toLocaleDateString("vi-VN", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                      {d.status !== "PENDING" && d.reviewer_note && (
                        <div className={styles._32}>
                          <span className={styles._33}>Phản hồi: </span>
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
                  <div className={styles._57}>
                    <span className={`${styles._0} ${st.className}`}>{st.label}</span>
                    {d.status === "PENDING" && (
                      <button onClick={() => openReview(d)} className={styles._58}>
                        Xem xét
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {reviewTarget && (
        <div className={styles._35} onClick={() => !submitting && setReviewTarget(null)}>
          <div className={styles._36} onClick={(e) => e.stopPropagation()}>
            <div className={styles._37}>
              <h2 className={styles._38}>Xem xét yêu cầu</h2>
              <button onClick={() => !submitting && setReviewTarget(null)} className={styles._39}>
                <svg className={styles._6} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className={styles._59}>
              <div className={styles._60}>
                <span className={styles._61}>Văn bằng</span>
                <span className={styles._62}>{reviewTarget.certificate?.certificate_title || "N/A"}</span>
              </div>
              <div className={styles._60}>
                <span className={styles._61}>Sinh viên</span>
                <span className={styles._62}>{reviewTarget.certificate?.student_fullName || "N/A"}</span>
              </div>
              <div className={styles._60}>
                <span className={styles._61}>Lý do</span>
                <span className={styles._62}>{reviewTarget.reason}</span>
              </div>
              {reviewTarget.details && (
                <div className={styles._60}>
                  <span className={styles._61}>Chi tiết</span>
                  <span className={styles._62}>{reviewTarget.details}</span>
                </div>
              )}
              <div className={styles._60}>
                <span className={styles._61}>Ngày gửi</span>
                <span className={styles._62}>{new Date(reviewTarget.createdAt).toLocaleDateString("vi-VN")}</span>
              </div>
            </div>

            <form onSubmit={handleReview} className={styles._40}>
              {reviewError && <div className={styles._41}>{reviewError}</div>}

              <div className={styles._42}>
                <label className={styles._43}>Quyết định</label>
                <div className={styles._63}>
                  <label className={`${styles._64} ${decision === "APPROVED" ? styles._65 : styles._66}`}>
                    <input
                      type="radio"
                      name="decision"
                      value="APPROVED"
                      checked={decision === "APPROVED"}
                      onChange={() => setDecision("APPROVED")}
                      className="sr-only"
                    />
                    Chấp thuận
                  </label>
                  <label className={`${styles._64} ${decision === "REJECTED" ? styles._67 : styles._66}`}>
                    <input
                      type="radio"
                      name="decision"
                      value="REJECTED"
                      checked={decision === "REJECTED"}
                      onChange={() => setDecision("REJECTED")}
                      className="sr-only"
                    />
                    Từ chối
                  </label>
                </div>
              </div>

              <div className={styles._42}>
                <label className={styles._43}>Ghi chú của người xem xét</label>
                <textarea
                  value={reviewerNote}
                  onChange={(e) => setReviewerNote(e.target.value)}
                  rows={3}
                  placeholder="Nhập ghi chú (không bắt buộc)"
                  className={styles._44}
                />
              </div>

              {decision === "APPROVED" && (
                <div className={styles._42}>
                  <label className={styles._43}>Dữ liệu chỉnh sửa (JSON)</label>
                  <textarea
                    value={newCertData}
                    onChange={(e) => setNewCertData(e.target.value)}
                    rows={4}
                    placeholder='{"certificate_title": "Tên mới", "issueDate": "2025-01-01", ...}'
                    className={styles._44}
                  />
                  <p className={styles._68}>Nhập JSON với các trường cần chỉnh sửa (không bắt buộc)</p>
                </div>
              )}

              <div className={styles._46}>
                <button type="button" onClick={() => setReviewTarget(null)} disabled={submitting} className={styles._47}>
                  Hủy
                </button>
                <button type="submit" disabled={submitting} className={styles._48}>
                  {submitting ? "Đang xử lý..." : "Xác nhận"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
