"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import styles from "./page.module.css";
import QRCodeBox from "@/components/credential/QRCodeBox";
import BlockchainInfo from "@/components/credential/BlockchainInfo";
import IPFSInfo from "@/components/credential/IPFSInfo";
import Loading from "@/components/common/Loading";
import ErrorMessage from "@/components/common/ErrorMessage";

interface CredentialDetail {
  id: string;
  credentialCode: string;
  studentName: string;
  studentCode: string;
  credentialTitle: string;
  type: string;
  major: string;
  classification: string;
  gpa: string;
  issueDate: string;
  serialNumber: string;
  registryNumber: string;
  issuerName: string;
  issuerLogo: string;
  status: "VALID" | "REVOKED";
  revokedAt?: string;
  revokeReason?: string;
  ipfsCid: string;
  metadataHash: string;
  transactionHash: string;
  contractAddress: string;
  network: string;
  credentialHash: string;
  signature: string;
  issuerWallet: string;
}

export default function PublicCredentialPage() {
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [credential, setCredential] = useState<CredentialDetail | null>(null);

  useEffect(() => {
    const fetchCredential = async () => {
      setLoading(true);
      await new Promise((r) => setTimeout(r, 800));
      const id = params.id as string;
      if (id === "VD-2026-000001" || id === "cred_001") {
        setCredential({
          id: "cred_001",
          credentialCode: "VD-2026-000001",
          studentName: "Nguyễn Văn Hùng",
          studentCode: "SV2024001",
          credentialTitle: "Bằng cử nhân Công nghệ thông tin",
          type: "BACHELOR_DEGREE",
          major: "Kỹ thuật phần mềm",
          classification: "Giỏi",
          gpa: "3.45/4.0",
          issueDate: "20/06/2026",
          serialNumber: "B2026/001",
          registryNumber: "2026/001",
          issuerName: "Đại học Bách khoa Hà Nội",
          issuerLogo: "",
          status: "VALID",
          ipfsCid: "bafybeigdyrzt5mmp4l6s5h3h3p4p5k5q5z5y5x5w5v5u5t5s5r5q5p5o5n5m",
          metadataHash: "0xmetadata1234567890abcdef1234567890abcdef12",
          transactionHash: "0x71c7e3b8a9c1d4f6e2a0b3c5d7e9f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e",
          contractAddress: "0x3b82f6a7b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4",
          network: "Sepolia",
          credentialHash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
          signature: "0xsignature1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
          issuerWallet: "0x1234567890abcdef1234567890abcdef12345678",
        });
      } else if (id === "REVOKED-001") {
        setCredential({
          id: "cred_002",
          credentialCode: "REVOKED-001",
          studentName: "Trần Văn B",
          studentCode: "SV2024002",
          credentialTitle: "Chứng chỉ Tiếng Anh B2",
          type: "CERTIFICATE",
          major: "Ngoại ngữ",
          classification: "Khá",
          gpa: "",
          issueDate: "15/05/2026",
          serialNumber: "C2026/015",
          registryNumber: "2026/015",
          issuerName: "Đại học Bách khoa Hà Nội",
          issuerLogo: "",
          status: "REVOKED",
          revokedAt: "10/06/2026",
          revokeReason: "Phát hiện sai lệch thông tin điểm số sau khi đối chiếu hồ sơ gốc.",
          ipfsCid: "bafybeigdyrzt5mmp4l6s5h3h3p4p5k5q5z5y5x5w5v5u5t5s5r5q5p5o5n5m",
          metadataHash: "0xmetadata567890abcdef1234567890abcdef12345678",
          transactionHash: "0xrevoketx1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
          contractAddress: "0x3b82f6a7b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4",
          network: "Sepolia",
          credentialHash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
          signature: "0xsignature1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
          issuerWallet: "0x1234567890abcdef1234567890abcdef12345678",
        });
      } else {
        setError("Không tìm thấy văn bằng.");
      }
      setLoading(false);
    };
    fetchCredential();
  }, [params.id]);

  if (loading) {
    return (
      <div className={styles._1}>
        <div className={styles._2}>
          <Loading message="Đang tải thông tin văn bằng..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles._1}>
        <div className={styles._2}>
          <ErrorMessage message={error} onRetry={() => window.location.reload()} />
        </div>
      </div>
    );
  }

  if (!credential) return null;

  const verifyUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/public/verify?code=${credential.credentialCode}`;
  const explorerUrl = credential.transactionHash
    ? `https://sepolia.etherscan.io/tx/${credential.transactionHash}`
    : null;
  const isRevoked = credential.status === "REVOKED";

  return (
    <div className={styles._1}>
      <div className={styles._2}>
        {isRevoked && (
          <div className={styles._3}>
            <svg className={styles._4} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className={styles._5}>Văn bằng đã bị thu hồi</p>
              <p className={styles._6}>Ngày thu hồi: {credential.revokedAt} — Lý do: {credential.revokeReason}</p>
            </div>
          </div>
        )}

        <div className={styles._7}>
          <div className={styles._8}>
            {isRevoked ? (
              <div className={styles._9}>
                <svg className={styles._10} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </div>
            ) : (
              <div className={styles._11}>
                <svg className={styles._10} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            )}
            <div>
              <h1 className={styles._12}>{credential.credentialTitle}</h1>
              <p className={styles._13}>Mã văn bằng: {credential.credentialCode}</p>
            </div>
            <span className={`${styles._0} ${isRevoked ? styles._14 : styles._15}`}>
              {isRevoked ? "Đã thu hồi" : "Hợp lệ"}
            </span>
          </div>

          <div className={styles._16}>
            <div className={styles._17}>
              <div className={styles._18}>
                <div className={styles._19}>
                  <div className={styles._20}>
                    <svg className={styles._21} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <p className={styles._22}>{credential.studentName}</p>
                </div>
                <div className={styles._23}>
                  <p className={styles._24}>Mã SV: {credential.studentCode}</p>
                  <p className={styles._24}>{credential.major}</p>
                  {credential.classification && (
                    <p className={styles._24}>Xếp loại: {credential.classification}</p>
                  )}
                </div>
              </div>
              <div className={styles._25}>
                <QRCodeBox value={verifyUrl} size={140} title="Quét để xác minh" />
              </div>
            </div>

            <div className={styles._26}>
              <div className={styles._27}>
                <dt className={styles._28}>Trường cấp</dt>
                <dd className={styles._29}>{credential.issuerName}</dd>
              </div>
              <div className={styles._27}>
                <dt className={styles._28}>Ngày cấp</dt>
                <dd className={styles._29}>{credential.issueDate}</dd>
              </div>
              <div className={styles._27}>
                <dt className={styles._28}>Số hiệu văn bằng</dt>
                <dd className={styles._29}>{credential.serialNumber}</dd>
              </div>
              <div className={styles._27}>
                <dt className={styles._28}>Số vào sổ</dt>
                <dd className={styles._29}>{credential.registryNumber}</dd>
              </div>
              {credential.gpa && (
                <div className={styles._27}>
                  <dt className={styles._28}>GPA</dt>
                  <dd className={styles._29}>{credential.gpa}</dd>
                </div>
              )}
            </div>
          </div>
        </div>

        {isRevoked && (
          <div className={styles._30}>
            <h3 className={styles._31}>Thông tin thu hồi</h3>
            <dl className={styles._32}>
              <div className={styles._27}>
                <dt className={styles._28}>Ngày thu hồi</dt>
                <dd className={styles._29}>{credential.revokedAt}</dd>
              </div>
              <div className={styles._27}>
                <dt className={styles._28}>Lý do thu hồi</dt>
                <dd className={styles._29}>{credential.revokeReason}</dd>
              </div>
              <div className={styles._27}>
                <dt className={styles._28}>Đơn vị thu hồi</dt>
                <dd className={styles._29}>{credential.issuerName}</dd>
              </div>
            </dl>
          </div>
        )}

        <div className={styles._33}>
          <BlockchainInfo
            network={credential.network}
            contractAddress={credential.contractAddress}
            transactionHash={credential.transactionHash}
            timestamp={credential.issueDate}
          />
          <IPFSInfo
            cid={credential.ipfsCid}
            metadataHash={credential.metadataHash}
          />
        </div>

        <div className={styles._34}>
          <h3 className={styles._35}>Liên kết nhanh</h3>
          <div className={styles._36}>
            <a
              href={explorerUrl || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className={styles._37}
            >
              <svg className={styles._38} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Xem trên Etherscan
            </a>
            <button
              onClick={() => navigator.clipboard.writeText(verifyUrl)}
              className={styles._37}
            >
              <svg className={styles._38} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              Sao chép link xác minh
            </button>
            <button
              onClick={() => window.print()}
              className={styles._37}
            >
              <svg className={styles._38} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              In trang này
            </button>
          </div>
        </div>

        <div className={styles._39}>
          <p className={styles._40}>
            Thông tin trên được xác thực bằng công nghệ blockchain và lưu trữ trên IPFS.
            Dữ liệu không thể bị chỉnh sửa sau khi đã ghi nhận.
          </p>
        </div>
      </div>
    </div>
  );
}
