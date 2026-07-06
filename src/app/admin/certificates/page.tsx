"use client";
import styles from "./page.module.css";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { certificateApi } from "@/features/certificates/services/certificate.api";
import type { CertificateDto } from "@/features/certificates/services/certificate.api";

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  DRAFT: { label: "Draft", className: "bg-slate-50 dark:bg-slate-800/20 text-gray-450 border-gray-200/50" },
  PENDING: { label: "Pending Blockchain", className: "bg-amber-55/10 text-warning border-amber-250/50 animate-pulse" },
  ISSUED: { label: "Issued", className: "bg-green-55/10 text-green-600 dark:text-green-400 border-green-200/50" },
  REVOKED: { label: "Revoked", className: "bg-red-50 dark:bg-red-950/20 text-danger border-red-200/50" },
};

export default function AdminCertificatesPage() {
  const [certificates, setCertificates] = useState<CertificateDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await certificateApi.list(filterStatus ? { status: filterStatus } : undefined);
      setCertificates(data);
    } catch (err: any) {
      setError(err.message || "Failed to load certificates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterStatus]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this certificate?")) return;
    try {
      await certificateApi.delete(id);
      setCertificates((prev) => prev.filter((c) => c.certificate_id !== id));
    } catch (err: any) {
      alert(err.message || "Delete failed");
    }
  };

  const filtered = certificates.filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.certificate_id.toLowerCase().includes(q) ||
      c.student_fullName.toLowerCase().includes(q) ||
      (c.serialNumber && c.serialNumber.toLowerCase().includes(q))
    );
  });

  return (
    <div className={styles._1}>
      <div className={styles._2}>
        <div>
          <h1 className={styles._3}>Quản lý Văn bằng</h1>
          <p className={styles._4}>Xem, tìm kiếm thông tin văn bằng đã cấp phát, trạng thái ghi blockchain hoặc yêu cầu thu hồi.</p>
        </div>
        <Link href="/admin/certificates/issue" className={styles._5}>
          + Cấp bằng mới
        </Link>
      </div>

      <div className={styles._6}>
        <input
          type="text"
          placeholder="Tìm kiếm theo mã văn bằng, tên sinh viên, số hiệu..."
          className={styles._7}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className={styles._8}>
          <select className={styles._9} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="">Tất cả trạng thái</option>
            <option value="DRAFT">Draft</option>
            <option value="PENDING">Pending Blockchain</option>
            <option value="ISSUED">Issued</option>
            <option value="REVOKED">Revoked</option>
          </select>
        </div>
      </div>

      <div className={styles._10}>
        <div className={styles._11}>
          {loading ? (
            <div className="p-8 text-center text-gray-400 text-xs">Đang tải...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-500 text-xs">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-xs">Không có văn bằng nào.</div>
          ) : (
            <table className={styles._12}>
              <thead>
                <tr className={styles._13}>
                  <th className={styles._14}>Mã văn bằng</th>
                  <th className={styles._14}>Sinh viên</th>
                  <th className={styles._14}>Loại bằng</th>
                  <th className={styles._14}>Ngày cấp</th>
                  <th className={styles._15}>IPFS Gateway</th>
                  <th className={styles._15}>Blockchain status</th>
                  <th className={styles._14}>Trạng thái</th>
                  <th className={styles._16}>Thao tác</th>
                </tr>
              </thead>
              <tbody className={styles._17}>
                {filtered.map((cert) => {
                  const statusStyle = STATUS_MAP[cert.status] || STATUS_MAP.DRAFT;
                  return (
                    <tr key={cert.certificate_id} className={`hover:bg-slate-55 ${styles._18}`}>
                      <td className={styles._19}>{cert.certificate_id.slice(0, 8)}...</td>
                      <td className={styles._20}>{cert.student_fullName}</td>
                      <td className={styles._21}>{cert.certificate_title}</td>
                      <td className={styles._14}>
                        {cert.issuedAt ? new Date(cert.issuedAt).toLocaleDateString("vi-VN") : "-"}
                      </td>
                      <td className={styles._15}>
                        {cert.ipfs_cid ? (
                          <span className={styles._23}>{cert.ipfs_cid.slice(0, 12)}...</span>
                        ) : (
                          <span className={styles._24}>-</span>
                        )}
                      </td>
                      <td className={styles._15}>
                        {cert.tx_hash ? (
                          <span className={styles._25}>ON-CHAIN</span>
                        ) : (
                          <span className={styles._26}>OFF-CHAIN</span>
                        )}
                      </td>
                      <td className={styles._14}>
                        <span className={`${styles._0} ${statusStyle.className}`}>
                          {statusStyle.label}
                        </span>
                      </td>
                      <td className={styles._27}>
                        <Link href={`/admin/certificates/${cert.certificate_id}`} className={styles._28}>
                          Chi tiết
                        </Link>
                        {cert.status !== "ISSUED" && cert.status !== "REVOKED" && (
                          <button onClick={() => handleDelete(cert.certificate_id)} className={styles._29}>
                            Xóa
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
