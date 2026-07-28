"use client";
import { useState, useEffect } from "react";
import styles from "./page.module.css";

interface Dispute {
  id: string;
  student_id: string;
  certificate_id: string;
  reason: string;
  details?: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  reviewer_id?: string;
  reviewer_note?: string;
  createdAt: string;
  resolved_at?: string;
}

export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("PENDING");
  const [reviewingDispute, setReviewingDispute] = useState<Dispute | null>(null);
  const [decision, setDecision] = useState<"APPROVED" | "REJECTED">("APPROVED");
  const [reviewerNote, setReviewerNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  const getToken = () =>
    typeof window !== "undefined" ? localStorage.getItem("accessToken") || "" : "";

  useEffect(() => {
    fetchDisputes();
  }, [filter]);

  const fetchDisputes = async () => {
    setLoading(true);
    try {
      const query = filter !== "ALL" ? `?status=${filter}` : "";
      const res = await fetch(`${API_URL}/disputes/org/list${query}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) setDisputes(await res.json());
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async () => {
    if (!reviewingDispute) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/disputes/${reviewingDispute.id}/review`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          decision,
          reviewer_note: reviewerNote,
        }),
      });

      if (res.ok) {
        setReviewingDispute(null);
        setReviewerNote("");
        fetchDisputes();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>📌 Quản lý Yêu cầu Chỉnh sửa (Disputes)</h1>
          <p className={styles.subtitle}>
            Xem xét và xử lý các báo cáo sai sót thông tin bằng cấp từ sinh viên
          </p>
        </div>
      </div>

      <div className={styles.tabs}>
        {[
          { key: "PENDING", label: "⏳ Chờ xử lý" },
          { key: "APPROVED", label: "✅ Đã chấp thuận" },
          { key: "REJECTED", label: "❌ Đã từ chối" },
          { key: "ALL", label: "📂 Tất cả" },
        ].map((tab) => (
          <button
            key={tab.key}
            className={`${styles.tabBtn} ${filter === tab.key ? styles.tabActive : ""}`}
            onClick={() => setFilter(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className={styles.loader}>Đang tải danh sách...</div>
      ) : disputes.length === 0 ? (
        <div className={styles.empty}>Không có yêu cầu nào trong mục này.</div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Mã Bằng Cấp</th>
                <th>Lý do chỉnh sửa</th>
                <th>Chi tiết</th>
                <th>Ngày gửi</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {disputes.map((d) => (
                <tr key={d.id}>
                  <td className={styles.codeCell}>{d.certificate_id.slice(0, 8)}...</td>
                  <td className={styles.reasonCell}>{d.reason}</td>
                  <td>{d.details || "—"}</td>
                  <td>{new Date(d.createdAt).toLocaleDateString("vi-VN")}</td>
                  <td>
                    <span
                      className={`${styles.badge} ${
                        d.status === "APPROVED"
                          ? styles.badgeApproved
                          : d.status === "REJECTED"
                          ? styles.badgeRejected
                          : styles.badgePending
                      }`}
                    >
                      {d.status === "APPROVED"
                        ? "Chấp thuận"
                        : d.status === "REJECTED"
                        ? "Từ chối"
                        : "Chờ xử lý"}
                    </span>
                  </td>
                  <td>
                    {d.status === "PENDING" ? (
                      <button
                        className={styles.reviewBtn}
                        onClick={() => {
                          setReviewingDispute(d);
                          setDecision("APPROVED");
                          setReviewerNote("");
                        }}
                      >
                        ⚖️ Duyệt
                      </button>
                    ) : (
                      <span className={styles.doneText}>Đã xử lý</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {reviewingDispute && (
        <div className={styles.overlay} onClick={() => setReviewingDispute(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button
              className={styles.closeModal}
              onClick={() => setReviewingDispute(null)}
            >
              ×
            </button>

            <h2 className={styles.modalTitle}>Xử lý Yêu cầu Chỉnh sửa</h2>
            <div className={styles.disputeSummary}>
              <p><strong>Lý do sinh viên báo:</strong> {reviewingDispute.reason}</p>
              {reviewingDispute.details && (
                <p><strong>Mô tả chi tiết:</strong> {reviewingDispute.details}</p>
              )}
            </div>

            <div className={styles.formField}>
              <label className={styles.formLabel}>Quyết định</label>
              <div className={styles.radioGroup}>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="decision"
                    value="APPROVED"
                    checked={decision === "APPROVED"}
                    onChange={() => setDecision("APPROVED")}
                  />
                  ✅ Chấp thuận (Tạo phiên bản bằng cấp mới & thu hồi bằng cũ)
                </label>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="decision"
                    value="REJECTED"
                    checked={decision === "REJECTED"}
                    onChange={() => setDecision("REJECTED")}
                  />
                  ❌ Từ chối yêu cầu
                </label>
              </div>
            </div>

            <div className={styles.formField}>
              <label className={styles.formLabel}>Ghi chú phản hồi cho sinh viên</label>
              <textarea
                className={styles.formTextarea}
                value={reviewerNote}
                onChange={(e) => setReviewerNote(e.target.value)}
                placeholder="Nhập lý do hoặc hướng dẫn thêm..."
                rows={3}
              />
            </div>

            <button
              className={styles.submitBtn}
              onClick={handleReviewSubmit}
              disabled={submitting}
            >
              {submitting ? "Đang lưu..." : "Xác nhận kết quả"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
