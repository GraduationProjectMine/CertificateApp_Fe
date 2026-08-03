"use client";
import React from "react";
import Link from "next/link";
import styles from "./VerificationResult.module.css";
import IssuerBadge from "../IssuerBadge/IssuerBadge";

export interface VerificationData {
  status: "VALID" | "INVALID" | "REVOKED";
  credentialCode: string;
  certificateId?: string;
  studentName?: string;
  credentialTitle?: string;
  issuerName?: string;
  issuerLogo?: string | null;
  issuerWallet?: string | null;
  issueDate?: string;
  major?: string;
  classification?: string;
  serialNumber?: string;
  registryNumber?: string;
  ipfsCid?: string;
  fileUrl?: string;
  transactionHash?: string;
  contractAddress?: string;
  network?: string;
  credentialHash?: string;
  revokedAt?: string;
  revokeReason?: string;
  revokeTransactionHash?: string;
  error?: string;
  verifiedAt?: string;
}

interface Props {
  result: VerificationData;
  onReset: () => void;
}

export default function VerificationResult({ result, onReset }: Props) {
  if (result.status === "VALID") {
    return (
      <div className={styles._1}>
        <div className={styles._2}>
          <div className={styles._3}>
            <svg className={styles._4} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className={styles._5}>Văn bằng hợp lệ</h2>
        </div>

        {/* Issuer Organization Badge */}
        {result.issuerName && (
          <div className="mt-4 mb-4">
            <IssuerBadge
              organizationName={result.issuerName}
              logoUrl={result.issuerLogo}
              walletAddress={result.issuerWallet}
            />
          </div>
        )}

        <div className={styles._13}>
          <Link
            href={`/public/certificate/${result.certificateId || result.credentialCode}`}
            className={styles._14}
          >
            Xem chi tiết văn bằng
          </Link>
          <button onClick={onReset} className={styles._15}>
            Xác minh văn bằng khác
          </button>
        </div>
      </div>
    );
  }

  if (result.status === "REVOKED") {
    return (
      <div className={styles._1}>
        <div className={styles._16}>
          <div className={styles._17}>
            <svg className={styles._4} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className={styles._18}>Văn bằng đã bị thu hồi</h2>
          <p className={styles._6}>Văn bằng này không còn hiệu lực và đã bị thu hồi bởi tổ chức cấp.</p>
        </div>

        {result.issuerName && (
          <div className="mt-4 mb-4">
            <IssuerBadge
              organizationName={result.issuerName}
              logoUrl={result.issuerLogo}
              walletAddress={result.issuerWallet}
            />
          </div>
        )}

        <div className={styles._13}>
          <Link
            href={`/public/certificate/${result.certificateId || result.credentialCode}`}
            className={styles._14}
          >
            Xem chi tiết văn bằng
          </Link>
          <button onClick={onReset} className={styles._15}>
            Xác minh văn bằng khác
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles._1}>
      <div className={styles._19}>
        <div className={styles._20}>
          <svg className={styles._4} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        </div>
        <h2 className={styles._21}>Không tìm thấy văn bằng hợp lệ</h2>
        <p className={styles._22}>{result.error || "Mã văn bằng không tồn tại hoặc thông tin không khớp."}</p>
      </div>

      <div className={styles._23}>
        <p className={styles._24}>Bạn có thể thử:</p>
        <ul className={styles._25}>
          <li>Kiểm tra lại mã văn bằng đã nhập</li>
          <li>Quét ảnh văn bằng bằng camera OCR</li>
          <li>Liên hệ tổ chức cấp văn bằng để được hỗ trợ</li>
        </ul>
      </div>

      <div className={styles._13}>
        <button onClick={onReset} className={styles._15}>
          Thử lại
        </button>
      </div>
    </div>
  );
}
