"use client";
import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import styles from "./page.module.css";
import { useAuth } from "@/features/auth/components/AuthContext";
import { certificateApi, mapCertificateDtoToStudentCert } from "@/features/certificates/services/certificate.api";
import type { StudentCertificate } from "@/features/certificates/types";

const TYPE_OPTIONS = [
  { value: "all", label: "Tất cả" },
  { value: "BACHELOR_DEGREE", label: "Bằng cử nhân" },
  { value: "CERTIFICATE", label: "Chứng chỉ" },
];

export default function StudentCertificatesPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [certs, setCerts] = useState<StudentCertificate[]>([]);
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    certificateApi.list({ student_id: user.id })
      .then((list) => {
        setCerts(list.map(mapCertificateDtoToStudentCert));
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [user?.id]);

  const filtered = useMemo(() => {
    return certs.filter((c) => {
      if (filterType !== "all" && c.type !== filterType) return false;
      if (filterStatus === "valid" && c.status !== "VALID") return false;
      if (filterStatus === "revoked" && c.status !== "REVOKED") return false;
      return true;
    });
  }, [certs, filterType, filterStatus]);

  return (
    <div className={styles._1}>
      <div className={styles._2}>
        <div>
          <h1 className={styles._3}>Văn bằng của tôi</h1>
          <p className={styles._4}>
            {loading ? "..." : `${certs.length} văn bằng đã được cấp`}
          </p>
        </div>
      </div>

      <div className={styles._5}>
        <div className={styles._6}>
          <label className={styles._7}>Loại</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className={styles._8}
          >
            {TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div className={styles._6}>
          <label className={styles._7}>Trạng thái</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={styles._8}
          >
            <option value="all">Tất cả</option>
            <option value="valid">Hợp lệ</option>
            <option value="revoked">Đã thu hồi</option>
          </select>
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
          <p className={styles._12}>Không tìm thấy văn bằng phù hợp</p>
        </div>
      ) : (
        <div className={styles._13}>
          {filtered.map((cert) => (
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
                <div className={styles._23}>
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
      )}
    </div>
  );
}
