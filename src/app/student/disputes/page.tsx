"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/features/auth/components/AuthContext";
import styles from "./page.module.css";

interface Dispute {
  id: string;
  certificate_id: string;
  reason: string;
  details?: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  reviewer_note?: string;
  new_cert_id?: string;
  createdAt: string;
  updatedAt: string;
  resolved_at?: string;
}

interface Certificate {
  certificate_id: string;
  certificate_title: string;
}

const STATUS_CONFIG = {
  PENDING: { label: "Đang chờ xét", color: "#92400e", bg: "#fef3c7", icon: "⏳" },
  APPROVED: { label: "Được chấp thuận", color: "#166534", bg: "#dcfce7", icon: "✅" },
  REJECTED: { label: "Bị từ chối", color: "#991b1b", bg: "#fee2e2", icon: "❌" },
};

export default function StudentDisputesPage() {
  const { user } = useAuth();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("ALL");

  const [form, setForm] = useState({
    certificate_id: "",
    reason: "",
    details: "",
  });

  const getToken = () =>
    typeof window !== "undefined" ? localStorage.getItem("accessToken") || "" : "";

  useEffect(() => {
    fetchDisputes();
    fetchCerts();
  }, []);

  const fetchDisputes = async () => {
    try {
      const res = await fetch(`${API_URL}/disputes`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) setDisputes(await res.json());
    } finally {
      setLoading(false);
    }
  };

  const fetchCerts = async () => {
    const res = await fetch(`${API_URL}/certificates`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (res.ok) {
      const data = await res.json();
      setCerts(
        data.filter(
          (c: any) =>
            ["ISSUED", "VALID", "DRAFT"].includes(c.status) || !c.status
        )
      );
    }
  };


  const handleSubmit = async () => {
    if (!form.certificate_id || !form.reason.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/disputes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSubmitSuccess(true);
        setForm({ certificate_id: "", reason: "", details: "" });
        await fetchDisputes();
        setTimeout(() => {
          setSubmitSuccess(false);
          setShowModal(false);
        }, 1500);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const getCertTitle = (id: string) =>
    certs.find((c) => c.certificate_id === id)?.certificate_title || "Bằng cấp";

  const filtered = filter === "ALL" ? disputes : disputes.filter((d) => d.status === filter);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>📋 Yêu cầu chỉnh sửa</h1>
          <p className={styles.subtitle}>
            Báo cáo sai sót và theo dõi tiến trình xử lý từ đơn vị cấp bằng
          </p>
        </div>
        <button
          id="btn-new-dispute"
          className={styles.createBtn}
          onClick={() => setShowModal(true)}
        >
          + Báo cáo sai sót
        </button>
      </div>

      <div className={styles.filterRow}>
        {(["ALL", "PENDING", "APPROVED", "REJECTED"] as const).map((f) => (
          <button
            key={f}
            className={`${styles.filterBtn} ${filter === f ? styles.filterActive : ""}`}
            onClick={() => setFilter(f)}
          >
            {f === "ALL" ? "Tất cả" : STATUS_CONFIG[f].icon + " " + STATUS_CONFIG[f].label}
            <span className={styles.filterCount}>
              ({f === "ALL" ? disputes.length : disputes.filter((d) => d.status === f).length})
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className={styles.loader}>Đang tải...</div>
      ) : filtered.length === 0 ? (
        <div className={styles.empty}>
          {filter === "ALL"
            ? "Chưa có yêu cầu chỉnh sửa nào. Nhấn \"Báo cáo sai sót\" để bắt đầu."
            : "Không có yêu cầu nào trong trạng thái này."}
        </div>
      ) : (
        <div className={styles.list}>
          {filtered.map((d) => {
            const cfg = STATUS_CONFIG[d.status];
            return (
              <div key={d.id} className={styles.disputeCard}>
                <div className={styles.cardLeft}>
                  <div className={styles.cardIcon}>{cfg.icon}</div>
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.cardTop}>
                    <h3 className={styles.certTitle}>{getCertTitle(d.certificate_id)}</h3>
                    <span
                      className={styles.statusBadge}
                      style={{ color: cfg.color, background: cfg.bg }}
                    >
                      {cfg.label}
                    </span>
                  </div>
                  <p className={styles.reasonText}>
                    <strong>Lý do:</strong> {d.reason}
                  </p>
                  {d.details && (
                    <p className={styles.detailsText}>{d.details}</p>
                  )}
                  {d.reviewer_note && (
                    <div className={styles.reviewerNote}>
                      <strong>Ghi chú từ đơn vị:</strong> {d.reviewer_note}
                    </div>
                  )}
                  {d.new_cert_id && (
                    <div className={styles.newCertAlert}>
                      ✨ Bằng cấp mới đã được tạo. Kiểm tra trong mục Bằng cấp của bạn.
                    </div>
                  )}
                  <div className={styles.cardMeta}>
                    <span>
                      Gửi lúc: {new Date(d.createdAt).toLocaleDateString("vi-VN")}
                    </span>
                    {d.resolved_at && (
                      <span>
                        Giải quyết: {new Date(d.resolved_at).toLocaleDateString("vi-VN")}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className={styles.overlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button
              className={styles.closeModal}
              onClick={() => setShowModal(false)}
            >
              ×
            </button>

            {submitSuccess ? (
              <div className={styles.successState}>
                <div className={styles.successIcon}>✅</div>
                <h2>Đã gửi yêu cầu!</h2>
                <p>Đơn vị cấp bằng sẽ xem xét và phản hồi trong thời gian sớm nhất.</p>
              </div>
            ) : (
              <>
                <h2 className={styles.modalTitle}>Báo cáo sai sót</h2>

                <div className={styles.formField}>
                  <label className={styles.formLabel}>Bằng cấp có sai sót</label>
                  <select
                    id="dispute-cert-select"
                    className={styles.formSelect}
                    value={form.certificate_id}
                    onChange={(e) => setForm({ ...form, certificate_id: e.target.value })}
                  >
                    <option value="">-- Chọn bằng cấp --</option>
                    {certs.map((c: any) => (
                      <option
                        key={c.certificate_id || c.id}
                        value={c.certificate_id || c.id}
                      >
                        {c.certificate_title || c.credentialTitle || "Bằng cấp"}
                      </option>
                    ))}

                  </select>
                </div>

                <div className={styles.formField}>
                  <label className={styles.formLabel}>Thông tin bị sai sót</label>
                  <input
                    id="dispute-reason-input"
                    type="text"
                    className={styles.formInput}
                    value={form.reason}
                    onChange={(e) => setForm({ ...form, reason: e.target.value })}
                    placeholder="VD: Sai ngày sinh, sai tên, sai ngành học..."
                    minLength={10}
                  />
                </div>

                <div className={styles.formField}>
                  <label className={styles.formLabel}>
                    Chi tiết (tùy chọn)
                  </label>
                  <textarea
                    id="dispute-details-textarea"
                    className={styles.formTextarea}
                    value={form.details}
                    onChange={(e) => setForm({ ...form, details: e.target.value })}
                    placeholder="Mô tả chi tiết sai sót: giá trị sai, giá trị đúng là gì..."
                    rows={4}
                  />
                </div>

                <button
                  id="dispute-submit-btn"
                  className={styles.submitBtn}
                  onClick={handleSubmit}
                  disabled={!form.certificate_id || form.reason.length < 10 || submitting}
                >
                  {submitting ? "Đang gửi..." : "📤 Gửi yêu cầu"}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
