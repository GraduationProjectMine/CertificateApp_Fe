"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import { disputeApi } from "@/features/dispute/services/dispute.api";
import { certificateApi, type CertificateDto } from "@/features/certificates/services/certificate.api";

export default function NewDisputePage() {
  const router = useRouter();
  const [certs, setCerts] = useState<CertificateDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formCertId, setFormCertId] = useState("");
  const [formReason, setFormReason] = useState("");
  const [formDetails, setFormDetails] = useState("");

  useEffect(() => {
    certificateApi.list()
      .then(setCerts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formCertId) { setError("Vui lòng chọn văn bằng"); return; }
    if (formReason.trim().length < 10) { setError("Lý do phải có ít nhất 10 ký tự"); return; }

    setSubmitting(true);
    try {
      await disputeApi.create({
        certificate_id: formCertId,
        reason: formReason.trim(),
        details: formDetails.trim() || undefined,
      });
      router.push("/student/disputes");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gửi yêu cầu thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles._1}>
      <div className={styles._2}>
        <div>
          <h1 className={styles._3}>Gửi yêu cầu chỉnh sửa</h1>
          <p className={styles._4}>Điền thông tin để yêu cầu chỉnh sửa văn bằng</p>
        </div>
      </div>

      <div className={styles._50}>
        <form onSubmit={handleSubmit} className={styles._40}>
          {error && <div className={styles._41}>{error}</div>}

          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-xl" />
              <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-xl" />
              <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl" />
            </div>
          ) : (
            <>
              <div className={styles._42}>
                <label className={styles._43}>Chọn văn bằng <span className={styles._45}>*</span></label>
                <select
                  value={formCertId}
                  onChange={(e) => setFormCertId(e.target.value)}
                  className={styles._44}
                >
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
                <p className={styles._51}>{formReason.length}/10 ký tự tối thiểu</p>
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
                <button
                  type="button"
                  onClick={() => router.push("/student/disputes")}
                  disabled={submitting}
                  className={styles._47}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={styles._48}
                >
                  {submitting ? "Đang gửi..." : "Gửi yêu cầu"}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
