"use client";
import React, { useState, useEffect, useMemo } from "react";
import styles from "./page.module.css";
import { useAuth } from "@/features/auth/components/AuthContext";
import { shareApi } from "@/features/share/services/share.api";
import type { ShareDto } from "@/features/share/services/share.api";
import { certificateApi } from "@/features/certificates/services/certificate.api";
import type { CertificateDto } from "@/features/certificates/services/certificate.api";

const SCOPE_OPTIONS = [
  { value: "dob", label: "Ngày sinh" },
  { value: "placeOfBirth", label: "Nơi sinh" },
  { value: "gender", label: "Giới tính" },
  { value: "ethnicity", label: "Dân tộc" },
  { value: "schoolName", label: "Trường" },
  { value: "examCohort", label: "Khóa thi" },
];

const EXPIRY_OPTIONS = [
  { value: "", label: "Không hết hạn" },
  { value: "1", label: "1 ngày" },
  { value: "7", label: "7 ngày" },
  { value: "30", label: "30 ngày" },
  { value: "90", label: "90 ngày" },
  { value: "365", label: "365 ngày" },
];

function formatDate(dateStr: string | null) {
  if (!dateStr) return null;
  try {
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

export default function SharesPage() {
  const { user } = useAuth();
  const [shares, setShares] = useState<ShareDto[]>([]);
  const [certs, setCerts] = useState<CertificateDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [formCert, setFormCert] = useState("");
  const [formExpiry, setFormExpiry] = useState("");
  const [formScope, setFormScope] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchShares = () => {
    if (!user?.id) return;
    setLoading(true);
    setError("");
    Promise.all([
      shareApi.list(),
      certificateApi.list({ student_id: user.id }),
    ])
      .then(([shareList, certList]) => {
        const certMap = new Map(
          certList.map((c) => [c.certificate_id, c.certificate_title])
        );
        const enriched = shareList.map((s) => ({
          ...s,
          certificate_title:
            s.certificate_title || certMap.get(s.certificate_id) || "Không rõ",
        }));
        setShares(enriched);
        setCerts(certList);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchShares();
  }, [user?.id]);

  const handleCreate = async () => {
    if (!formCert) return;
    setSubmitting(true);
    try {
      await shareApi.create({
        certificate_id: formCert,
        expires_in_days: formExpiry ? parseInt(formExpiry, 10) : undefined,
        scope: formScope.length > 0 ? formScope : undefined,
      });
      setShowModal(false);
      setFormCert("");
      setFormExpiry("");
      setFormScope([]);
      fetchShares();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevoke = async (id: string) => {
    if (!confirm("Bạn có chắc muốn thu hồi link chia sẻ này?")) return;
    try {
      await shareApi.revoke(id);
      fetchShares();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleCopy = async (url: string, id: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const toggleScope = (value: string) => {
    setFormScope((prev) =>
      prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value]
    );
  };

  const activeShares = useMemo(
    () => shares.filter((s) => !s.revoked && !s.is_expired),
    [shares]
  );
  const inactiveShares = useMemo(
    () => shares.filter((s) => s.revoked || s.is_expired),
    [shares]
  );

  const statusBadge = (share: ShareDto) => {
    if (share.revoked)
      return <span className={`${styles._15} ${styles._18}`}>Đã thu hồi</span>;
    if (share.is_expired)
      return <span className={`${styles._15} ${styles._17}`}>Hết hạn</span>;
    return (
      <span className={`${styles._15} ${styles._16}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        Đang hoạt động
      </span>
    );
  };

  return (
    <div className={styles._1}>
      <div className={styles._2}>
        <div>
          <h1 className={styles._3}>Chia sẻ văn bằng</h1>
          <p className={styles._4}>
            Quản lý các liên kết chia sẻ văn bằng của bạn
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className={styles._23}>
          <svg className={styles._24} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Thêm liên kết
        </button>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200/50 text-sm font-semibold text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {loading ? (
        <div className={styles._5}>
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className={`${styles._6} animate-pulse`}>
              <div className="space-y-2">
                <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-3 w-64 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-3 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : shares.length === 0 ? (
        <div className={styles._19}>
          <div className={styles._20}>
            <svg className={styles._21} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </div>
          <p className={styles._22}>Chưa có liên kết chia sẻ nào</p>
        </div>
      ) : (
        <div className={styles._5}>
          {activeShares.map((share) => (
            <div key={share.id} className={styles._6}>
              <div className={styles._7}>
                <div className={styles._8}>
                  <h3 className={styles._9}>{share.certificate_title}</h3>
                  <p className={styles._10}>
                    {formatDate(share.createdAt)} &middot; {share.verify_count} lượt xác minh
                  </p>
                  <div className={styles._11}>
                    <div className="flex items-center gap-1.5 max-w-full">
                      <span className="text-xs text-gray-400 truncate max-w-[240px] sm:max-w-[360px]">
                        {share.share_url}
                      </span>
                      <button
                        onClick={() => handleCopy(share.share_url, share.id)}
                        className="shrink-0 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        {copiedId === share.id ? (
                          <svg className={styles._14} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className={styles._14} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                          </svg>
                        )}
                      </button>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      {share.expires_at && (
                        <span className={styles._25}>
                          <svg className={styles._26} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Hết hạn: {formatDate(share.expires_at)}
                        </span>
                      )}
                      {!share.expires_at && (
                        <span className={styles._25}>
                          <svg className={styles._26} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          Không hết hạn
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className={styles._12}>
                  {statusBadge(share)}
                  <button
                    onClick={() => handleRevoke(share.id)}
                    className="px-3 py-1.5 rounded-xl text-[11px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200/50 hover:bg-red-100 dark:hover:bg-red-950/50 transition-all"
                  >
                    Thu hồi
                  </button>
                </div>
              </div>
            </div>
          ))}

          {inactiveShares.length > 0 && (
            <details className="group">
              <summary className="cursor-pointer text-sm font-bold text-gray-500 dark:text-gray-400 py-2 hover:text-gray-700 dark:hover:text-gray-300 transition-all list-none flex items-center gap-1.5">
                <svg className="w-4 h-4 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
                Liên kết đã thu hồi / hết hạn ({inactiveShares.length})
              </summary>
              <div className="mt-3 space-y-3">
                {inactiveShares.map((share) => (
                  <div key={share.id} className={styles._6}>
                    <div className={styles._7}>
                      <div className={styles._8}>
                        <h3 className={styles._9}>{share.certificate_title}</h3>
                        <p className={styles._10}>
                          {formatDate(share.createdAt)} &middot; {share.verify_count} lượt xác minh
                        </p>
                      </div>
                      <div className={styles._12}>
                        {statusBadge(share)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </details>
          )}
        </div>
      )}

      {showModal && (
        <div className={styles._27} onClick={() => setShowModal(false)}>
          <div className={styles._28} onClick={(e) => e.stopPropagation()}>
            <div className={styles._29}>
              <h2 className={styles._30}>Thêm liên kết chia sẻ</h2>
              <button onClick={() => setShowModal(false)} className={styles._31}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className={styles._32}>
              <div className={styles._33}>
                <label className={styles._34}>Chọn văn bằng</label>
                <select
                  value={formCert}
                  onChange={(e) => setFormCert(e.target.value)}
                  className={styles._35}
                >
                  <option value="">-- Chọn văn bằng --</option>
                  {certs.map((c) => (
                    <option key={c.certificate_id} value={c.certificate_id}>
                      {c.certificate_title}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles._33}>
                <label className={styles._34}>Thời hạn</label>
                <select
                  value={formExpiry}
                  onChange={(e) => setFormExpiry(e.target.value)}
                  className={styles._35}
                >
                  {EXPIRY_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles._33}>
                <label className={styles._34}>Phạm vi thông tin</label>
                <div className={styles._36}>
                  {SCOPE_OPTIONS.map((o) => {
                    const selected = formScope.includes(o.value);
                    return (
                      <label
                        key={o.value}
                        className={`${styles._37} ${selected ? styles._38 : styles._39}`}
                      >
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => toggleScope(o.value)}
                          className="hidden"
                        />
                        {selected && (
                          <svg className={styles._40} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                        {o.label}
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className={styles._41}>
                <button
                  onClick={() => setShowModal(false)}
                  className={styles._42}
                >
                  Hủy
                </button>
                <button
                  onClick={handleCreate}
                  disabled={!formCert || submitting}
                  className={styles._43}
                >
                  {submitting ? "Đang tạo..." : "Tạo liên kết"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
