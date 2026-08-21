"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import { disputeApi } from "@/features/dispute/services/dispute.api";
import { certificateApi, type CertificateDto } from "@/features/certificates/services/certificate.api";
import { useI18n } from "@/features/i18n/I18nContext";
import toast from "react-hot-toast";

export default function NewDisputePage() {
  const router = useRouter();
  const { t } = useI18n();
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

    if (!formCertId) { setError(t("studentDisputeNew.error.noCert")); return; }
    if (formReason.trim().length < 10) { setError(t("studentDisputeNew.error.reasonLength")); return; }

    setSubmitting(true);
    try {
      await disputeApi.create({
        certificate_id: formCertId,
        reason: formReason.trim(),
        details: formDetails.trim() || undefined,
      });
      toast.success(t("studentDisputeNew.successCreated"));
      router.push("/student/disputes");
    } catch (err) {
      const message = err instanceof Error ? err.message : t("studentDisputeNew.error.failed");
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles._1}>
      <div className={styles._2}>
        <div>
          <h1 className={styles._3}>{t("studentDisputeNew.header.title")}</h1>
          <p className={styles._4}>{t("studentDisputeNew.header.description")}</p>
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
                <label className={styles._43}>{t("studentDisputeNew.form.selectCert")} <span className={styles._45}>*</span></label>
                <select
                  value={formCertId}
                  onChange={(e) => setFormCertId(e.target.value)}
                  className={styles._44}
                >
                  <option value="">{t("studentDisputeNew.form.selectPlaceholder")}</option>
                  {certs.filter((c) => c.status === "DRAFT").map((c) => (
                    <option key={c.certificate_id} value={c.certificate_id}>
                      {c.certificate_title} - {c.student_fullName} ({t("studentDisputeNew.form.draftBadge")})
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles._42}>
                <label className={styles._43}>{t("studentDisputeNew.form.reason")} <span className={styles._45}>*</span></label>
                <textarea
                  value={formReason}
                  onChange={(e) => setFormReason(e.target.value)}
                  rows={3}
                  placeholder={t("studentDisputeNew.form.reasonPlaceholder")}
                  className={styles._44}
                />
                <p className={styles._51}>{formReason.length}/10 {t("studentDisputeNew.form.minChars")}</p>
              </div>

              <div className={styles._42}>
                <label className={styles._43}>{t("studentDisputeNew.form.details")}</label>
                <textarea
                  value={formDetails}
                  onChange={(e) => setFormDetails(e.target.value)}
                  rows={4}
                  placeholder={t("studentDisputeNew.form.detailsPlaceholder")}
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
                  {t("studentDisputeNew.form.cancel")}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={styles._48}
                >
                  {submitting ? t("studentDisputeNew.form.submitting") : t("studentDisputeNew.form.submit")}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
