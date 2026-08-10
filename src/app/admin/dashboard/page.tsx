"use client";

import styles from "./page.module.css";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../../../features/auth/components/AuthContext";
import { certificateApi, type CertificateDto } from "../../../features/certificates/services/certificate.api";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Vừa xong";
  if (mins < 60) return `${mins} phút trước`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} giờ trước`;
  const days = Math.floor(hrs / 24);
  return `${days} ngày trước`;
}

function shortHash(h: string): string {
  return h.length > 10 ? h.slice(0, 6) + "..." + h.slice(-4) : h;
}

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [certs, setCerts] = useState<CertificateDto[]>([]);

  useEffect(() => {
    certificateApi
      .list()
      .then((certsData) => {
        setCerts(certsData);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const issuedCount = certs.filter((c) => c.status === "ISSUED").length;
  const pendingCount = certs.filter((c) => c.status === "PENDING").length;
  const revokedCount = certs.filter((c) => c.status === "REVOKED").length;

  const recentTx = certs
    .filter((c) => c.tx_hash)
    .sort((a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime())
    .slice(0, 5)
    .map((c) => ({
      id: c.certificate_id,
      txHash: shortHash(c.tx_hash!),
      studentName: c.student_fullName,
      credentialType: c.certificate_title,
      time: timeAgo(c.issuedAt),
    }));

  const stats = [
    {
      title: "Tổng số sinh viên",
      value: loading ? "..." : String(new Set(certs.map((c) => c.student_id)).size),
      change: "Dữ liệu sinh viên tổ chức",
      colorClass: "border-l-primary",
      icon: (
        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" />
        </svg>
      ),
    },
    {
      title: "Đã cấp bằng",
      value: loading ? "..." : String(issuedCount),
      change: "Xác thực trên Blockchain",
      colorClass: "border-l-emerald-500",
      icon: (
        <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: "Bản nháp / Chờ duyệt",
      value: loading ? "..." : String(pendingCount),
      change: "Cần ký duyệt cấp bằng",
      colorClass: "border-l-amber-500",
      icon: (
        <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: "Đã thu hồi",
      value: loading ? "..." : String(revokedCount),
      change: "Văn bằng bị hủy bỏ",
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
          <h1 className={styles._4}>Tổng quan Đơn vị Cấp bằng</h1>
          <p className={styles._5}>
            Quản lý văn bằng chứng chỉ, danh sách sinh viên và tiến trình cấp phát.
          </p>
        </div>
        <div className={styles._6}>
          <Link href="/admin/certificates/issue" className={styles._7}>
            <svg className={styles._8} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Tạo văn bằng mới
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
            <h2 className={styles._19}>Giao dịch Cấp bằng Gần đây</h2>
            <Link href="/admin/certificates" className={styles._20}>
              Xem tất cả
            </Link>
          </div>

          <div className={styles._21}>
            <table className={styles._22}>
              <thead>
                <tr className={styles._23}>
                  <th className={styles._24}>Tx Hash</th>
                  <th className={styles._24}>Sinh viên</th>
                  <th className={styles._24}>Văn bằng</th>
                  <th className={styles._24}>Thời gian</th>
                  <th className={styles._25}>Trạng thái</th>
                </tr>
              </thead>
              <tbody className={styles._26}>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">
                      Đang tải dữ liệu...
                    </td>
                  </tr>
                ) : recentTx.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">
                      Chưa có giao dịch cấp bằng nào
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
                        <span className={styles._33}>Thành công</span>
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
            <h3 className={styles._36}>Thao tác Nhanh</h3>
            <div className={styles._37}>
              <Link href="/admin/certificates/issue" className={`group ${styles._38}`}>
                <span>Cấp văn bằng đơn lẻ</span>
                <svg className={styles._39} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link href="/admin/students" className={`group ${styles._38}`}>
                <span>Quản lý danh sách sinh viên</span>
                <svg className={styles._39} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link href="/admin/templates" className={`group ${styles._38}`}>
                <span>Quản lý mẫu phôi văn bằng</span>
                <svg className={styles._39} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              {user?.role !== "staff" && (
                <Link href="/admin/revocations" className={`group ${styles._38}`}>
                  <span>Yêu cầu thu hồi bằng</span>
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
