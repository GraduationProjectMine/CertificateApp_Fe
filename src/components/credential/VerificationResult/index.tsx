"use client";
import React from "react";
import Link from "next/link";
import styles from "./VerificationResult.module.css";

export interface VerificationData {
  status: "VALID" | "INVALID" | "REVOKED";
  credentialCode: string;
  certificateId?: string;
  studentName?: string;
  credentialTitle?: string;
  issuerName?: string;
  issueDate?: string;
  major?: string;
  classification?: string;
  serialNumber?: string;
  registryNumber?: string;
  ipfsCid?: string;
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
          <p className={styles._6}>Văn bằng này đã được xác thực trên blockchain và không có dấu hiệu giả mạo.</p>
        </div>

        <div className={styles._7}>
          <h3 className={styles._8}>Thông tin văn bằng</h3>
          <dl className={styles._9}>
            <div className={styles._10}>
              <dt className={styles._11}>Họ tên người nhận</dt>
              <dd className={styles._12}>{result.studentName}</dd>
            </div>
            <div className={styles._10}>
              <dt className={styles._11}>Tên văn bằng</dt>
              <dd className={styles._12}>{result.credentialTitle}</dd>
            </div>
            <div className={styles._10}>
              <dt className={styles._11}>Trường/Tổ chức cấp</dt>
              <dd className={styles._12}>{result.issuerName}</dd>
            </div>
            <div className={styles._10}>
              <dt className={styles._11}>Ngày cấp</dt>
              <dd className={styles._12}>{result.issueDate}</dd>
            </div>
            <div className={styles._10}>
              <dt className={styles._11}>Mã văn bằng</dt>
              <dd className={styles._12}>{result.credentialCode}</dd>
            </div>
            <div className={styles._10}>
              <dt className={styles._11}>Số hiệu</dt>
              <dd className={styles._12}>{result.serialNumber}</dd>
            </div>
            {result.registryNumber && <div className={styles._10}>
              <dt className={styles._11}>Số vào sổ</dt>
              <dd className={styles._12}>{result.registryNumber}</dd>
            </div>}
            {result.major && <div className={styles._10}>
              <dt className={styles._11}>Ngành</dt>
              <dd className={styles._12}>{result.major}</dd>
            </div>}
            {result.classification && <div className={styles._10}>
              <dt className={styles._11}>Xếp loại</dt>
              <dd className={styles._12}>{result.classification}</dd>
            </div>}
          </dl>
        </div>

        <div className={styles._7}>
          <h3 className={styles._8}>Bảo mật & Blockchain</h3>
          <dl className={styles._9}>
            {result.credentialHash && (
              <div className={styles._10}>
                <dt className={styles._11}>Hash văn bằng</dt>
                <dd className={`${styles._12} font-mono text-xs`}>{result.credentialHash}</dd>
              </div>
            )}
            {result.ipfsCid && (
              <div className={styles._10}>
                <dt className={styles._11}>CID IPFS</dt>
                <dd className={`${styles._12} font-mono text-xs`}>{result.ipfsCid}</dd>
              </div>
            )}
            {result.transactionHash && (
              <div className={styles._10}>
                <dt className={styles._11}>Transaction Hash</dt>
                <dd className={`${styles._12} font-mono text-xs text-primary`}>{result.transactionHash}</dd>
              </div>
            )}
            {result.contractAddress && (
              <div className={styles._10}>
                <dt className={styles._11}>Contract Address</dt>
                <dd className={`${styles._12} font-mono text-xs`}>{result.contractAddress}</dd>
              </div>
            )}
            {result.network && (
              <div className={styles._10}>
                <dt className={styles._11}>Network</dt>
                <dd className={styles._12}>{result.network}</dd>
              </div>
            )}
            <div className={styles._10}>
              <dt className={styles._11}>Thời gian xác minh</dt>
              <dd className={styles._12}>{result.verifiedAt}</dd>
            </div>
          </dl>
        </div>

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

        <div className={styles._7}>
          <dl className={styles._9}>
            <div className={styles._10}>
              <dt className={styles._11}>Mã văn bằng</dt>
              <dd className={styles._12}>{result.credentialCode}</dd>
            </div>
            {result.studentName && (
              <div className={styles._10}>
                <dt className={styles._11}>Người nhận</dt>
                <dd className={styles._12}>{result.studentName}</dd>
              </div>
            )}
            {result.revokedAt && (
              <div className={styles._10}>
                <dt className={styles._11}>Ngày thu hồi</dt>
                <dd className={styles._12}>{result.revokedAt}</dd>
              </div>
            )}
            {result.revokeReason && (
              <div className={styles._10}>
                <dt className={styles._11}>Lý do thu hồi</dt>
                <dd className={styles._12}>{result.revokeReason}</dd>
              </div>
            )}
            {result.revokeTransactionHash && (
              <div className={styles._10}>
                <dt className={styles._11}>Transaction thu hồi</dt>
                <dd className={`${styles._12} font-mono text-xs`}>{result.revokeTransactionHash}</dd>
              </div>
            )}
          </dl>
        </div>

        <div className={styles._13}>
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
          <li>Quét mã QR trên văn bằng</li>
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
