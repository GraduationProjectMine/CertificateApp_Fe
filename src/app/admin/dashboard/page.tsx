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
    certificateApi.list()
      .then(setCerts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const issuedCount = certs.filter((c) => c.status === "Issued").length;
  const pendingCount = certs.filter((c) => c.status === "Pending" || c.status === "Pending Blockchain").length;
  const revokedCount = certs.filter((c) => c.status === "Revoked").length;

  const recentTx = certs
    .filter((c) => c.tx_hash)
    .sort((a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime())
    .slice(0, 4)
    .map((c) => ({
      id: c.certificate_id,
      txHash: shortHash(c.tx_hash!),
      studentName: c.student_fullName,
      credentialType: c.certificate_title,
      time: timeAgo(c.issuedAt),
      status: "Success" as const,
    }));

  const stats = [
    {
      title: "Tổng số sinh viên",
      value: loading ? "..." : String(new Set(certs.map((c) => c.student_id)).size),
      change: "Từ dữ liệu văn bằng",
      color: "border-l-primary bg-primary/5 text-primary",
      icon: (
        <svg className={styles._1} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
        </svg>
      )
    },
    {
      title: "Văn bằng đã cấp",
      value: loading ? "..." : String(issuedCount),
      change: `${certs.filter((c) => c.tx_hash).length} On-chain verified`,
      color: "border-l-teal-600 bg-teal-500/5 text-teal-600 dark:text-teal-400",
      icon: (
        <svg className={styles._1} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
        </svg>
      )
    },
    {
      title: "Chờ ghi Blockchain",
      value: loading ? "..." : String(pendingCount),
      change: pendingCount > 0 ? "Yêu cầu xử lý" : "Không có",
      color: "border-l-warning bg-amber-500/5 text-warning",
      icon: (
        <svg className={styles._1} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      )
    },
    {
      title: "Đã thu hồi",
      value: loading ? "..." : String(revokedCount),
      change: revokedCount > 0 ? "Cần theo dõi" : "Không có",
      color: "border-l-danger bg-red-500/5 text-danger",
      icon: (
        <svg className={styles._1} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path>
        </svg>
      )
    }
  ];

  return (
    <div className={styles._2}>
      <div className={styles._3}>
        <div>
          <h1 className={styles._4}>Tổng quan Hệ thống</h1>
          <p className={styles._5}>
            Chào mừng đại diện trường {user?.institutionName || "HUST"} quay trở lại cổng quản trị.
          </p>
        </div>
        <div className={styles._6}>
          <Link href="/admin/certificates/issue" className={styles._7}>
            <svg className={styles._8} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path>
            </svg>
            Cấp bằng đơn lẻ
          </Link>
          <Link href="/admin/batches" className={styles._9}>Cấp bằng hàng loạt</Link>
        </div>
      </div>

      {error && <div className="text-red-500 text-sm mb-4">{error}</div>}

      <div className={styles._10}>
        {stats.map((stat, idx) => (
          <div key={idx} className={`${styles._0} ${stat.color}`}>
            <div className={styles._11}>
              <span className={styles._12}>{stat.title}</span>
              <span className={styles._13}>{stat.value}</span>
              <span className={styles._14}>{stat.change}</span>
            </div>
            <div className={`bg-gray-55 ${styles._15}`}>{stat.icon}</div>
          </div>
        ))}
      </div>

      <div className={styles._16}>
        <div className={styles._17}>
          <div className={styles._18}>
            <h2 className={styles._19}>Giao dịch Blockchain gần đây</h2>
            <Link href="/admin/blockchain" className={styles._20}>Xem tất cả</Link>
          </div>
          <div className={styles._21}>
            <table className={styles._22}>
              <thead>
                <tr className={styles._23}>
                  <th className={styles._24}>Mã giao dịch</th>
                  <th className={styles._24}>Sinh viên</th>
                  <th className={styles._24}>Loại bằng</th>
                  <th className={styles._24}>Thời gian</th>
                  <th className={styles._25}>Trạng thái</th>
                </tr>
              </thead>
              <tbody className={styles._26}>
                {loading ? (
                  <tr><td colSpan={5} className="text-center py-4 text-gray-400">Đang tải...</td></tr>
                ) : recentTx.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-4 text-gray-400">Chưa có giao dịch nào</td></tr>
                ) : (
                  recentTx.map((tx) => (
                    <tr key={tx.id} className={styles._27}>
                      <td className={styles._28}>{tx.txHash}</td>
                      <td className={styles._29}>{tx.studentName}</td>
                      <td className={styles._30}>{tx.credentialType}</td>
                      <td className={styles._31}>{tx.time}</td>
                      <td className={styles._32}>
                        <span className={styles._33}>{tx.status}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className={styles._34}>
          <div className={styles._35}>
            <h2 className={styles._36}>Thao tác nhanh</h2>
            <div className={styles._37}>
              <Link href="/admin/students" className={`group ${styles._38}`}>
                <span>Nhập danh sách sinh viên</span>
                <svg className={styles._39} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path>
                </svg>
              </Link>
              <Link href="/admin/templates" className={`group ${styles._38}`}>
                <span>Thiết kế mẫu bằng mới</span>
                <svg className={styles._39} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path>
                </svg>
              </Link>
              <Link href="/admin/revocations" className={`group ${styles._40}`}>
                <span className={styles._41}>Yêu cầu thu hồi bằng</span>
                <svg className={styles._42} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path>
                </svg>
              </Link>
            </div>
          </div>

          <div className={styles._43}>
            <h3 className={styles._44}>Kết nối hạ tầng</h3>
            <div className={styles._45}>
              <div className={styles._46}>
                <span className={styles._47}>Node RPC:</span>
                <span className={styles._48}>Đã kết nối (12ms)</span>
              </div>
              <div className={styles._46}>
                <span className={styles._47}>IPFS Cluster:</span>
                <span className={styles._48}>Hoạt động (99.8%)</span>
              </div>
              <div className={styles._46}>
                <span className={styles._47}>Smart Contract:</span>
                <span className={`text-slate-350 ${styles._49}`}>0x3b82...b65f</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
