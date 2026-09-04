"use client";
import React, { useCallback, useState, useEffect, useMemo } from "react";
import styles from "./page.module.css";
import { disputeApi, type DisputeDto } from "@/features/dispute/services/dispute.api";
import { certificateApi, type CertificateDto } from "@/features/certificates/services/certificate.api";
import { useI18n } from "@/features/i18n/I18nContext";
import { useAuth } from "@/features/auth/components/AuthContext";
import toast from "react-hot-toast";
import DisputeComparison from "@/components/dispute/DisputeComparison";

const DISPUTES_PER_PAGE = 5;

export default function StudentDisputesPage() {
  const { user } = useAuth();
  const { t } = useI18n();
  const statusInfo = (status: string): { label: string; className: string } => {
    const STATUS_MAP: Record<string, { label: string; className: string }> = {
      PENDING: { label: t("studentDisputes.status.pending"), className: styles._26 },
      APPROVED: { label: t("studentDisputes.status.approved"), className: styles._27 },
      REJECTED: { label: t("studentDisputes.status.rejected"), className: styles._28 },
    };
    return STATUS_MAP[status] || STATUS_MAP.PENDING;
  };
  const [disputes, setDisputes] = useState<DisputeDto[]>([]);
  const [certs, setCerts] = useState<CertificateDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [viewTarget, setViewTarget] = useState<DisputeDto | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  const [formCertId, setFormCertId] = useState("");
  const [formReason, setFormReason] = useState("");
  const [formDetails, setFormDetails] = useState("");
  const [formError, setFormError] = useState("");

  const fetch = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError("");
    try {
      const [d, c] = await Promise.all([
        disputeApi.myDisputes(),
        certificateApi.list({ student_id: user.id }),
      ]);
      setDisputes(d);
      setCerts(c);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("studentDisputes.loadError"));
    } finally {
      setLoading(false);
    }
  }, [t, user?.id]);

  useEffect(() => { fetch(); }, [fetch]);

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

    if (!formCertId) { setFormError(t("studentDisputes.formError.noCert")); return; }
    if (formReason.trim().length < 10) { setFormError(t("studentDisputes.formError.reasonLength")); return; }

    setSubmitting(true);
    try {
      await disputeApi.create({
        certificate_id: formCertId,
        reason: formReason.trim(),
        details: formDetails.trim() || undefined,
      });
      toast.success(t("studentDisputes.successCreated"));
      setShowModal(false);
      setFormCertId("");
      setFormReason("");
      setFormDetails("");
      fetch();
    } catch (err) {
      const message = err instanceof Error ? err.message : t("studentDisputes.formError.failed");
      setFormError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles._1}>
      <div className={styles._2}>
        <div>
          <h1 className={styles._3}>{t("studentDisputes.header.title")}</h1>
          <p className={styles._4}>{t("studentDisputes.header.description")}</p>
        </div>
        <button onClick={() => setShowModal(true)} className={styles._5}>
          <svg className={styles._6} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {t("studentDisputes.newRequest")}
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
          <p className={styles._12}>{t("studentDisputes.empty.title")}</p>
          <p className={styles._30}>{t("studentDisputes.empty.hint")}</p>
        </div>
      ) : (
        <>
          <div className={styles._13}>
            {paginatedDisputes.map((d) => {
              const st = statusInfo(d.status);
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
                        <h3 className={styles._20}>{d.certificate?.certificate_title || t("studentDisputes.card.draftCertificate")}</h3>
                        <p className={styles._22}>{d.reason}</p>
                        {d.details && <p className="text-xs text-gray-500 mt-1">{t("studentDisputes.card.details")} {d.details}</p>}
                        <p className={styles._31}>{new Date(d.createdAt).toLocaleDateString("vi-VN", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                        {d.status !== "PENDING" && d.reviewer_note && (
                          <div className={styles._32}>
                            <span className={styles._33}>{t("studentDisputes.card.schoolResponse")}</span>
                            {d.reviewer_note}
                          </div>
                        )}
                        {d.status !== "PENDING" && d.resolved_at && (
                          <p className={styles._34}>
                            {t("studentDisputes.card.resolvedAt")} {new Date(d.resolved_at).toLocaleDateString("vi-VN", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`${styles._0} ${st.className}`}>{st.label}</span>
                      <button
                        onClick={() => setViewTarget(d)}
                        className="px-3 py-1.5 text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-all"
                      >
                        {t("studentDisputes.card.viewDetail")}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {sortedDisputes.length > 0 && (
            <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-800 mt-6">
              <p className="text-xs text-gray-500 font-semibold">
                {t("studentDisputes.pagination.showing")} {((currentPage - 1) * DISPUTES_PER_PAGE) + 1} - {Math.min(currentPage * DISPUTES_PER_PAGE, sortedDisputes.length)} {t("studentDisputes.pagination.of")} {sortedDisputes.length} {t("studentDisputes.pagination.requests")}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-600 dark:text-gray-300 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                >
                  {t("studentDisputes.pagination.previous")}
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
                  {t("studentDisputes.pagination.next")}
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
              <h2 className={styles._38}>{t("studentDisputes.form.title")}</h2>
              <button onClick={() => !submitting && setShowModal(false)} className={styles._39}>
                <svg className={styles._6} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles._40}>
              {formError && <div className={styles._41}>{formError}</div>}

              <div className={styles._42}>
                <label className={styles._43}>{t("studentDisputes.form.selectCert")}</label>
                <select value={formCertId} onChange={(e) => setFormCertId(e.target.value)} className={styles._44}>
                  <option value="">{t("studentDisputes.form.selectPlaceholder")}</option>
                  {certs.filter((c) => c.status !== "REVOKED").map((c) => (
                    <option key={c.certificate_id} value={c.certificate_id}>
                      {c.certificate_title} - {c.student_fullName} {c.status === "DRAFT" ? `(${t("studentDisputes.form.draftBadge")})` : c.status === "ISSUED" ? "(Đã phát hành)" : `(${c.status})`}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles._42}>
                <label className={styles._43}>{t("studentDisputes.form.reason")} <span className={styles._45}>*</span></label>
                <textarea
                  value={formReason}
                  onChange={(e) => setFormReason(e.target.value)}
                  rows={3}
                  placeholder={t("studentDisputes.form.reasonPlaceholder")}
                  className={styles._44}
                />
              </div>

              <div className={styles._42}>
                <label className={styles._43}>{t("studentDisputes.form.details")}</label>
                <textarea
                  value={formDetails}
                  onChange={(e) => setFormDetails(e.target.value)}
                  rows={4}
                  placeholder={t("studentDisputes.form.detailsPlaceholder")}
                  className={styles._44}
                />
              </div>

              <div className={styles._46}>
                <button type="button" onClick={() => setShowModal(false)} disabled={submitting} className={styles._47}>
                  {t("studentDisputes.form.cancel")}
                </button>
                <button type="submit" disabled={submitting} className={styles._48}>
                  {submitting ? t("studentDisputes.form.submitting") : t("studentDisputes.form.submit")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewTarget && (
        <div className={styles._35} onClick={() => !submitting && setViewTarget(null)}>
          <div className={styles._36} onClick={(e) => e.stopPropagation()}>
            <div className={styles._37}>
              <h2 className={styles._38}>{t("studentDisputes.view.title")}</h2>
              <button onClick={() => setViewTarget(null)} className={styles._39}>
                <svg className={styles._6} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className={styles._59}>
              <div className={styles._60}>
                <span className={styles._61}>{t("studentDisputes.view.certificate")}</span>
                <span className={styles._62}>{viewTarget.certificate?.certificate_title || "N/A"}</span>
              </div>
              <div className={styles._60}>
                <span className={styles._61}>{t("studentDisputes.view.reason")}</span>
                <span className={styles._62}>{viewTarget.reason}</span>
              </div>
              {viewTarget.details && (
                <div className={styles._60}>
                  <span className={styles._61}>{t("studentDisputes.view.details")}</span>
                  <span className={styles._62}>{viewTarget.details}</span>
                </div>
              )}
              <div className={styles._60}>
                <span className={styles._61}>{t("studentDisputes.view.submittedAt")}</span>
                <span className={styles._62}>{new Date(viewTarget.createdAt).toLocaleDateString("vi-VN")}</span>
              </div>
              <div className={styles._60}>
                <span className={styles._61}>{t("studentDisputes.view.status")}</span>
                <span className={`${styles._0} ${statusInfo(viewTarget.status).className}`}>{statusInfo(viewTarget.status).label}</span>
              </div>
              {viewTarget.reviewer_note && (
                <div className={styles._60}>
                  <span className={styles._61}>{t("studentDisputes.view.reviewerNote")}</span>
                  <span className={styles._62}>{viewTarget.reviewer_note}</span>
                </div>
              )}
              {viewTarget.resolved_at && (
                <div className={styles._60}>
                  <span className={styles._61}>{t("studentDisputes.view.resolvedAt")}</span>
                  <span className={styles._62}>{new Date(viewTarget.resolved_at).toLocaleDateString("vi-VN")}</span>
                </div>
              )}
            </div>

            {/* Comparison Table */}
            <DisputeComparison
              certificate={viewTarget.certificate || {}}
              disputeDetails={viewTarget.details}
              disputeReason={viewTarget.reason}
            />
          </div>
        </div>
      )}
    </div>
  );
}
