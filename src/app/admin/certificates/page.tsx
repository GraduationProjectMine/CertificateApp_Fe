"use client";
import styles from "./page.module.css";
import React from "react";
import Link from "next/link";

export default function AdminCertificatesPage() {
  const certificatesList = [
    { id: "cert-2026-001", studentName: "Nguyễn Văn Hùng", type: "Cử nhân", major: "Khoa học máy tính", date: "22/06/2026", onChain: true, ipfs: "QmXoyp...", status: "Issued" },
    { id: "cert-2026-002", studentName: "Lê Thị Thu", type: "Cử nhân", major: "Kỹ thuật máy tính", date: "21/06/2026", onChain: true, ipfs: "QmPijW...", status: "Issued" },
    { id: "cert-2026-003", studentName: "Phạm Hoàng Minh", type: "Thạc sĩ", major: "Công nghệ thông tin", date: "20/06/2026", onChain: true, ipfs: "QmTknF...", status: "Issued" },
    { id: "cert-2026-004", studentName: "Vũ Phương Thảo", type: "Cử nhân", major: "Kỹ thuật điện tử", date: "15/06/2026", onChain: false, ipfs: "QmJnKL...", status: "Pending Blockchain" },
    { id: "cert-2026-005", studentName: "Trần Đức Hải", type: "Kỹ sư", major: "Cơ điện tử", date: "10/06/2026", onChain: false, ipfs: "", status: "Draft" },
    { id: "cert-2026-006", studentName: "Đỗ Minh Khang", type: "Cử nhân", major: "Khoa học máy tính", date: "01/06/2026", onChain: true, ipfs: "QmHC5x...", status: "Revoked" }
  ];

  return (
    <div className={styles._1}>
      {/* Title & Actions */}
      <div className={styles._2}>
        <div>
          <h1 className={styles._3}>Quản lý Văn bằng</h1>
          <p className={styles._4}>Xem, tìm kiếm thông tin văn bằng đã cấp phát, trạng thái ghi blockchain hoặc yêu cầu thu hồi.</p>
        </div>
        <Link
          href="/admin/certificates/issue"
          className={styles._5}
        >
          + Cấp bằng mới
        </Link>
      </div>

      {/* Filter panel */}
      <div className={styles._6}>
        <input
          type="text"
          placeholder="Tìm kiếm theo mã văn bằng, tên sinh viên, số hiệu..."
          className={styles._7}
        />
        <div className={styles._8}>
          <select className={styles._9}>
            <option>Tất cả trạng thái</option>
            <option>Issued</option>
            <option>Pending Blockchain</option>
            <option>Revoked</option>
            <option>Draft</option>
          </select>
          <select className={styles._9}>
            <option>Loại: Tất cả</option>
            <option>Cử nhân</option>
            <option>Thạc sĩ</option>
            <option>Kỹ sư</option>
          </select>
        </div>
      </div>

      {/* Table Cards */}
      <div className={styles._10}>
        <div className={styles._11}>
          <table className={styles._12}>
            <thead>
              <tr className={styles._13}>
                <th className={styles._14}>Mã văn bằng</th>
                <th className={styles._14}>Sinh viên</th>
                <th className={styles._14}>Hệ đào tạo</th>
                <th className={styles._14}>Chuyên ngành</th>
                <th className={styles._14}>Ngày cấp</th>
                <th className={styles._15}>IPFS Gateway</th>
                <th className={styles._15}>Blockchain status</th>
                <th className={styles._14}>Trạng thái</th>
                <th className={styles._16}>Thao tác</th>
              </tr>
            </thead>
            <tbody className={styles._17}>
              {certificatesList.map((cred) => (
                <tr key={cred.id} className={`hover:bg-slate-55 ${styles._18}`}>
                  <td className={styles._19}>{cred.id}</td>
                  <td className={styles._20}>{cred.studentName}</td>
                  <td className={styles._21}>{cred.type}</td>
                  <td className={styles._22}>{cred.major}</td>
                  <td className={styles._14}>{cred.date}</td>
                  <td className={styles._15}>
                    {cred.ipfs ? (
                      <span className={styles._23}>{cred.ipfs}</span>
                    ) : (
                      <span className={styles._24}>-</span>
                    )}
                  </td>
                  <td className={styles._15}>
                    {cred.onChain ? (
                      <span className={styles._25}>ON-CHAIN</span>
                    ) : (
                      <span className={styles._26}>OFF-CHAIN</span>
                    )}
                  </td>
                  <td className={styles._14}>
                    <span className={`${styles._0} ${
                      cred.status === "Issued"
                        ? "bg-green-55/10 text-green-600 dark:text-green-400 border-green-200/50"
                        : cred.status === "Pending Blockchain"
                        ? "bg-amber-55/10 text-warning border-amber-250/50 animate-pulse"
                        : cred.status === "Revoked"
                        ? "bg-red-50 dark:bg-red-950/20 text-danger border-red-200/50"
                        : "bg-slate-50 dark:bg-slate-800/20 text-gray-450 border-gray-200/50"
                    }`}>
                      {cred.status}
                    </span>
                  </td>
                  <td className={styles._27}>
                    <button className={styles._28}>Chi tiết</button>
                    {cred.status !== "Revoked" && cred.status !== "Draft" && (
                      <button className={styles._29}>Thu hồi</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
