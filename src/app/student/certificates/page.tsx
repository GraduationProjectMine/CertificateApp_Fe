"use client";
import React, { useState, useMemo } from "react";
import Link from "next/link";
import styles from "./page.module.css";
import type { StudentCertificate } from "@/features/certificates/types";

const MOCK_CERTIFICATES: StudentCertificate[] = [
  {
    id: "cred_001",
    credentialCode: "VD-2026-000001",
    serialNumber: "B2026/001",
    studentName: "Nguyễn Văn Hùng",
    studentCode: "SV2024001",
    credentialTitle: "Bằng cử nhân Công nghệ thông tin",
    type: "BACHELOR_DEGREE",
    major: "Kỹ thuật phần mềm",
    classification: "Giỏi",
    gpa: "3.45/4.0",
    issueDate: "20/06/2026",
    issuerName: "Đại học Bách khoa Hà Nội",
    issuerLogo: "",
    status: "VALID",
    onChain: true,
    ipfsCid: "bafybeigdyrzt5mmp4l6s5h3h3p4p5k5q5z5y5x5w5v5u5t5s5r5q5p5o5n5m",
    metadataHash: "0xmetadata1234567890abcdef1234567890abcdef12",
    transactionHash: "0x71c7e3b8a9c1d4f6e2a0b3c5d7e9f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e",
    contractAddress: "0x3b82f6a7b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4",
    network: "Sepolia",
    credentialHash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
  },
  {
    id: "cred_002",
    credentialCode: "VD-2026-000002",
    serialNumber: "B2026/002",
    studentName: "Nguyễn Văn Hùng",
    studentCode: "SV2024001",
    credentialTitle: "Chứng chỉ Tiếng Anh B2",
    type: "CERTIFICATE",
    major: "Ngoại ngữ",
    classification: "Khá",
    gpa: "",
    issueDate: "15/05/2026",
    issuerName: "Đại học Bách khoa Hà Nội",
    issuerLogo: "",
    status: "VALID",
    onChain: true,
    ipfsCid: "bafybeigdyrzt5mmp4l6s5h3h3p4p5k5q5z5y5x5w5v5u5t5s5r5q5p5o5n5m",
    metadataHash: "0xmetadata567890abcdef1234567890abcdef12345678",
    transactionHash: "0x71c7e3b8a9c1d4f6e2a0b3c5d7e9f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e",
    contractAddress: "0x3b82f6a7b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4",
    network: "Sepolia",
    credentialHash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
  },
  {
    id: "cred_003",
    credentialCode: "VD-2026-000003",
    serialNumber: "C2026/015",
    studentName: "Nguyễn Văn Hùng",
    studentCode: "SV2024001",
    credentialTitle: "Bằng cử nhân Khoa học máy tính",
    type: "BACHELOR_DEGREE",
    major: "Khoa học máy tính",
    classification: "Xuất sắc",
    gpa: "3.78/4.0",
    issueDate: "15/08/2026",
    issuerName: "Đại học Công nghệ - ĐHQG HN",
    issuerLogo: "",
    status: "REVOKED",
    onChain: true,
    ipfsCid: "bafybeigdyrzt5mmp4l6s5h3h3p4p5k5q5z5y5x5w5v5u5t5s5r5q5p5o5n5m",
    metadataHash: "0xmetadata901234567890abcdef1234567890abcdef34",
    transactionHash: "0x71c7e3b8a9c1d4f6e2a0b3c5d7e9f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e",
    contractAddress: "0x3b82f6a7b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4",
    network: "Sepolia",
    credentialHash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
  },
];

const TYPE_OPTIONS = [
  { value: "all", label: "Tất cả" },
  { value: "BACHELOR_DEGREE", label: "Bằng cử nhân" },
  { value: "CERTIFICATE", label: "Chứng chỉ" },
];

export default function StudentCertificatesPage() {
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const filtered = useMemo(() => {
    return MOCK_CERTIFICATES.filter((c) => {
      if (filterType !== "all" && c.type !== filterType) return false;
      if (filterStatus === "valid" && c.status !== "VALID") return false;
      if (filterStatus === "revoked" && c.status !== "REVOKED") return false;
      return true;
    });
  }, [filterType, filterStatus]);

  return (
    <div className={styles._1}>
      <div className={styles._2}>
        <div>
          <h1 className={styles._3}>Văn bằng của tôi</h1>
          <p className={styles._4}>{MOCK_CERTIFICATES.length} văn bằng đã được cấp</p>
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

      {filtered.length === 0 ? (
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
