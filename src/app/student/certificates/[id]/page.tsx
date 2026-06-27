"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import styles from "./page.module.css";
import type { StudentCertificate } from "@/features/certificates/types";
import BlockchainInfo from "@/components/credential/BlockchainInfo";
import IPFSInfo from "@/components/credential/IPFSInfo";
import QRCodeBox from "@/components/credential/QRCodeBox";
import ShareDialog from "@/features/certificates/components/ShareDialog";
import Loading from "@/components/common/Loading";
import ErrorMessage from "@/components/common/ErrorMessage";

const MOCK_DETAIL: Record<string, StudentCertificate> = {
  cred_001: {
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
  cred_002: {
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
  cred_003: {
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
};

export default function StudentCertificateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cert, setCert] = useState<StudentCertificate | null>(null);
  const [showShare, setShowShare] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      await new Promise((r) => setTimeout(r, 600));
      const id = params.id as string;
      const found = MOCK_DETAIL[id];
      if (found) {
        setCert(found);
      } else {
        setError("Không tìm thấy văn bằng.");
      }
      setLoading(false);
    };
    fetchDetail();
  }, [params.id]);

  if (loading) {
    return (
      <div className={styles._1}>
        <Loading message="Đang tải thông tin văn bằng..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles._1}>
        <ErrorMessage message={error} onRetry={() => router.push("/student/certificates")} />
      </div>
    );
  }

  if (!cert) return null;

  const isRevoked = cert.status === "REVOKED";

  return (
    <div className={styles._1}>
      <div className={styles._2}>
        <button onClick={() => router.push("/student/certificates")} className={styles._3}>
          <svg className={styles._4} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Danh sách văn bằng
        </button>
      </div>

      <div className={styles._5}>
        {isRevoked && (
          <div className={styles._6}>
            <svg className={styles._7} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className={styles._8}>Văn bằng đã bị thu hồi</p>
            </div>
          </div>
        )}

        <div className={styles._9}>
          <div className={styles._10}>
            {isRevoked ? (
              <div className={styles._11}>
                <svg className={styles._12} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </div>
            ) : (
              <div className={styles._13}>
                <svg className={styles._12} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            )}
            <div>
              <h1 className={styles._14}>{cert.credentialTitle}</h1>
              <p className={styles._15}>Mã văn bằng: {cert.credentialCode}</p>
            </div>
            <span className={`${styles._0} ${isRevoked ? styles._16 : styles._17}`}>
              {isRevoked ? "Đã thu hồi" : "Hợp lệ"}
            </span>
          </div>

          <div className={styles._18}>
            <div className={styles._19}>
              <div className={styles._20}>
                <div className={styles._21}>
                  <svg className={styles._22} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <p className={styles._23}>{cert.studentName}</p>
              </div>
              <div className={styles._24}>
                <p className={styles._25}>Mã SV: {cert.studentCode}</p>
                <p className={styles._25}>{cert.major}</p>
                {cert.classification && (
                  <p className={styles._25}>Xếp loại: {cert.classification}</p>
                )}
              </div>
            </div>
            <div className={styles._26}>
              <QRCodeBox
                value={`${typeof window !== "undefined" ? window.location.origin : ""}/public/certificate/${cert.credentialCode}`}
                size={140}
                title="Quét để xác minh"
              />
            </div>
          </div>

          <dl className={styles._27}>
            <div className={styles._28}>
              <dt className={styles._29}>Trường cấp</dt>
              <dd className={styles._30}>{cert.issuerName}</dd>
            </div>
            <div className={styles._28}>
              <dt className={styles._29}>Ngày cấp</dt>
              <dd className={styles._30}>{cert.issueDate}</dd>
            </div>
            <div className={styles._28}>
              <dt className={styles._29}>Số hiệu văn bằng</dt>
              <dd className={styles._30}>{cert.serialNumber}</dd>
            </div>
            <div className={styles._28}>
              <dt className={styles._29}>Ngành</dt>
              <dd className={styles._30}>{cert.major}</dd>
            </div>
            {cert.gpa && (
              <div className={styles._28}>
                <dt className={styles._29}>GPA</dt>
                <dd className={styles._30}>{cert.gpa}</dd>
              </div>
            )}
            <div className={styles._28}>
              <dt className={styles._29}>Xếp loại</dt>
              <dd className={styles._30}>{cert.classification}</dd>
            </div>
            <div className={styles._28}>
              <dt className={styles._29}>Mã sinh viên</dt>
              <dd className={styles._30}>{cert.studentCode}</dd>
            </div>
          </dl>
        </div>

        <div className={styles._31}>
          <BlockchainInfo
            network={cert.network}
            contractAddress={cert.contractAddress}
            transactionHash={cert.transactionHash}
            timestamp={cert.issueDate}
          />
          <IPFSInfo
            cid={cert.ipfsCid}
            metadataHash={cert.metadataHash}
          />
        </div>

        <div className={styles._32}>
          <h3 className={styles._33}>Thao tác</h3>
          <div className={styles._34}>
            <button onClick={() => setShowShare(true)} className={styles._35}>
              <svg className={styles._36} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Chia sẻ văn bằng
            </button>
            <button
              onClick={() => {
                const url = `${typeof window !== "undefined" ? window.location.origin : ""}/public/certificate/${cert.credentialCode}`;
                navigator.clipboard.writeText(url);
              }}
              className={styles._35}
            >
              <svg className={styles._36} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              Sao chép link xác minh
            </button>
          </div>
        </div>

        <div className={styles._37}>
          <p className={styles._38}>
            Thông tin trên được xác thực bằng công nghệ blockchain và lưu trữ trên IPFS.
            Dữ liệu không thể bị chỉnh sửa sau khi đã ghi nhận.
          </p>
        </div>
      </div>

      {showShare && (
        <ShareDialog
          credentialCode={cert.credentialCode}
          credentialTitle={cert.credentialTitle}
          onClose={() => setShowShare(false)}
        />
      )}
    </div>
  );
}
