"use client";

import styles from "./page.module.css";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../../../features/auth/components/AuthContext";
import { useI18n } from "@/features/i18n/I18nContext";
import { certificateApi, type CertificateDto, type OnlineCertificateDto } from "../../../features/certificates/services/certificate.api";

function timeAgo(dateStr: string, t: ReturnType<typeof useI18n>['t']): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return t("adminDashboard.timeAgo.justNow");
  if (mins < 60) return `${mins} ${t("adminDashboard.timeAgo.minutes")}`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} ${t("adminDashboard.timeAgo.hours")}`;
  const days = Math.floor(hrs / 24);
  return `${days} ${t("adminDashboard.timeAgo.days")}`;
}

function shortHash(h: string): string {
  return h.length > 10 ? h.slice(0, 6) + "..." + h.slice(-4) : h;
}

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [certs, setCerts] = useState<CertificateDto[]>([]);
  const [onlineCerts, setOnlineCerts] = useState<OnlineCertificateDto[]>([]);
  const { t } = useI18n();

  useEffect(() => {
    Promise.all([
      certificateApi.list(),
      certificateApi.listOnline().catch(() => []),
    ])
      .then(([certsData, onlineData]) => {
        setCerts(certsData);
        setOnlineCerts(onlineData);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const totalStudents = new Set(
    [...certs.map((c) => c.student_id), ...onlineCerts.map((c) => c.student_id)].filter(Boolean)
  ).size;
  const issuedCount =
    certs.filter((c) => c.status === "ISSUED").length +
    onlineCerts.filter((c) => c.status === "ISSUED").length;
  const pendingCount =
    certs.filter((c) => c.status === "PENDING").length +
    onlineCerts.filter((c) => c.status === "PENDING").length;
  const revokedCount =
    certs.filter((c) => c.status === "REVOKED").length +
    onlineCerts.filter((c) => c.status === "REVOKED").length;

  const allTxItems = [
    ...certs.filter((c) => c.tx_hash).map((c) => ({
      id: c.certificate_id,
      txHash: shortHash(c.tx_hash!),
      studentName: c.student_fullName,
      credentialType: c.certificate_title,
      issuedAt: c.issuedAt,
    })),
    ...onlineCerts.filter((c) => c.tx_hash).map((c) => ({
      id: c.certificate_id,
      txHash: shortHash(c.tx_hash!),
      studentName: c.student_fullName,
      credentialType: c.certificate_title,
      issuedAt: c.issuedAt,
    })),
  ];

  const recentTx = allTxItems
    .sort((a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime())
    .slice(0, 5)
    .map((c) => ({
      id: c.id,
      txHash: c.txHash,
      studentName: c.studentName,
      credentialType: c.credentialType,
      time: timeAgo(c.issuedAt, t),
    }));

  const stats = [
    {
      title: t("adminDashboard.stats.totalStudents"),
      value: loading ? "..." : String(totalStudents),
      change: t("adminDashboard.stats.studentData"),
      colorClass: "border-l-primary",
      icon: (
        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" />
        </svg>
      ),
    },
    {
      title: t("adminDashboard.stats.issuedCertificates"),
      value: loading ? "..." : String(issuedCount),
      change: t("adminDashboard.stats.blockchainVerification"),
      colorClass: "border-l-emerald-500",
      icon: (
        <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: t("adminDashboard.stats.pendingDraft"),
      value: loading ? "..." : String(pendingCount),
      change: t("adminDashboard.stats.pendingApproval"),
      colorClass: "border-l-amber-500",
      icon: (
        <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: t("adminDashboard.stats.revokedCertificates"),
      value: loading ? "..." : String(revokedCount),
      change: t("adminDashboard.stats.certificateRevoked"),
      colorClass: "border-l-rose-500",
      icon: (
        <svg className="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
        </svg>
      ),
    },
  ];

  return (
    <div className={styles._2}>
      {/* Header section */}
      <div className={styles._3}>
        <div>
          <h1 className={styles._4}>{t("adminDashboard.header.title")}</h1>
        </div>
        <div className={styles._6}>
          <Link href="/admin/certificates/issue" className={styles._7}>
            <svg className={styles._8} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            {t("adminDashboard.actions.createCertificate")}
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-sm">
          {error}
        </div>
      )}

      {/* Stats Cards Grid */}
      <div className={styles._10}>
        {stats.map((s, idx) => (
          <div key={idx} className={`${styles._0} ${s.colorClass}`}>
            <div className={styles._11}>
              <span className={styles._12}>{s.title}</span>
              <span className={styles._13}>{s.value}</span>
              <span className={styles._14}>{s.change}</span>
            </div>
            <div className={styles._15}>{s.icon}</div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className={styles._16}>
        {/* Recent Transactions Table */}
        <div className={styles._17}>
          <div className={styles._18}>
            <h2 className={styles._19}>{t("adminDashboard.recentTransactions.title")}</h2>
            <Link href="/admin/certificates" className={styles._20}>
              {t("adminDashboard.actions.viewAll")}
            </Link>
          </div>

          <div className={styles._21}>
            <table className={styles._22}>
              <thead>
                <tr className={styles._23}>
                  <th className={styles._24}>{t("adminDashboard.table.txHash")}</th>
                  <th className={styles._24}>{t("adminDashboard.table.student")}</th>
                  <th className={styles._24}>{t("adminDashboard.table.certificate")}</th>
                  <th className={styles._24}>{t("adminDashboard.table.time")}</th>
                  <th className={styles._25}>{t("adminDashboard.table.status")}</th>
                </tr>
              </thead>
              <tbody className={styles._26}>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">
                      {t("adminDashboard.recentTransactions.loading")}
                    </td>
                  </tr>
                ) : recentTx.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">
                      {t("adminDashboard.recentTransactions.noTransactions")}
                    </td>
                  </tr>
                ) : (
                  recentTx.map((tx) => (
                    <tr key={tx.id} className={styles._27}>
                      <td className={styles._28}>{tx.txHash}</td>
                      <td className={styles._29}>{tx.studentName}</td>
                      <td className={styles._30}>{tx.credentialType}</td>
                      <td className={styles._31}>{tx.time}</td>
                      <td className={styles._32}>
                        <span className={styles._33}>{t("adminDashboard.recentTransactions.statusSuccess")}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className={styles._34}>
          <div className={styles._35}>
            <h3 className={styles._36}>{t("adminDashboard.actions.quickActions")}</h3>
            <div className={styles._37}>
              <Link href="/admin/certificates/issue" className={`group ${styles._38}`}>
                <span>{t("adminDashboard.actions.createSingleCertificate")}</span>
                <svg className={styles._39} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link href="/admin/students" className={`group ${styles._38}`}>
                <span>{t("adminDashboard.actions.manageStudents")}</span>
                <svg className={styles._39} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link href="/admin/templates" className={`group ${styles._38}`}>
                <span>{t("adminDashboard.actions.manageTemplates")}</span>
                <svg className={styles._39} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              {user?.role !== "staff" && (
                <Link href="/admin/revocations" className={`group ${styles._38}`}>
                  <span>{t("adminDashboard.actions.revokeRequest")}</span>
                  <svg className={styles._39} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
