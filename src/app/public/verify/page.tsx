"use client";

import React, { useState } from "react";
import Link from "next/link";
import styles from "./page.module.css";
import VerificationResult, { type VerificationData } from "@/components/credential/VerificationResult";
import { verifierApi, type VerifyCertificateResponse } from "@/features/verification/services/verifier.api";

function mapVerification(response: VerifyCertificateResponse): VerificationData {
  const detail = response.certificateDetails;
  const status: VerificationData["status"] = response.status === "REVOKED"
    ? "REVOKED"
    : response.isValid ? "VALID" : "INVALID";

  return {
    status,
    credentialCode: detail.registryNumber || detail.certificateId,
    certificateId: detail.certificateId,
    studentName: detail.studentFullName,
    credentialTitle: detail.certificateTitle,
    issuerName: detail.organizationName,
    issueDate: detail.issueDate || detail.issuedAt || undefined,
    serialNumber: detail.serialNumber || undefined,
    registryNumber: detail.registryNumber || undefined,
    ipfsCid: response.blockchain?.cid,
    fileUrl:
      detail.fileUrl ||
      (response.blockchain?.cid
        ? `https://gateway.pinata.cloud/ipfs/${response.blockchain.cid}`
        : undefined),
    transactionHash: detail.txHash || undefined,
    credentialHash: response.blockchain?.sha3Hash,
    revokedAt: detail.revokedAt ? new Date(detail.revokedAt).toLocaleString("vi-VN") : undefined,
    revokeReason: detail.revokeReason || undefined,
    revokeTransactionHash: detail.revokeTransactionHash || undefined,
    verifiedAt: new Date().toLocaleString("vi-VN"),
    error: status === "INVALID" ? "Dữ liệu văn bằng không khớp với bản ghi blockchain." : undefined,
  };
}

export default function VerifyPublicPage() {
  const [serialNumber, setSerialNumber] = useState("");
  const [registryNumber, setRegistryNumber] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<VerificationData | null>(null);
  const [error, setError] = useState("");

  const handleVerify = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!serialNumber.trim() || !registryNumber.trim()) {
      setError("Vui lòng nhập đầy đủ số hiệu và số vào sổ cấp bằng.");
      return;
    }
    setError("");
    setIsVerifying(true);
    try {
      setResult(mapVerification(await verifierApi.verifyAny(serialNumber.trim(), registryNumber.trim())));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể xác minh văn bằng.");
    } finally {
      setIsVerifying(false);
    }
  };

  const reset = () => {
    setResult(null);
    setError("");
  };

  if (result) {
    return <div className={styles._1}><div className={styles._2}><VerificationResult result={result} onReset={reset} /></div></div>;
  }

  return (
    <div className={styles._1}>
      <div className={styles._41}>
        <Link href="/" className={`group ${styles._42}`}><span className={styles._43}>C</span><span className={styles._44}>CertiChain</span></Link>
        <span className={styles._47}>Xác minh văn bằng</span>
      </div>
      <div className={styles._3}>
        <h1 className={styles._4}>Xác minh văn bằng</h1>
        <p className={styles._5}>Đối chiếu số hiệu và số vào sổ với dữ liệu blockchain và IPFS.</p>
      </div>
      <div className={styles._6}>
        <div className={styles._7}>
          <button className={`${styles._0} ${styles._8}`}>Nhập thông tin văn bằng</button>
          <button disabled className={`${styles._0} ${styles._9}`} title="Backend chưa hỗ trợ">Quét QR — sắp hỗ trợ</button>
          <button disabled className={`${styles._0} ${styles._9}`} title="Backend chưa hỗ trợ">Upload PDF — sắp hỗ trợ</button>
        </div>
        <form onSubmit={handleVerify} className={styles._11}>
          <div className={styles._12}>
            <div className={styles._13}><label className={styles._14}>Số hiệu văn bằng *</label><input value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} placeholder="B2026/001" className={styles._15} /></div>
            <div className={styles._13}><label className={styles._14}>Số vào sổ cấp bằng *</label><input value={registryNumber} onChange={(e) => setRegistryNumber(e.target.value)} placeholder="2026/001" className={styles._15} /></div>
            {error && <p className={styles._16}>{error}</p>}
            <button disabled={isVerifying} className={styles._17}>{isVerifying ? "Đang đối chiếu blockchain..." : "Xác minh"}</button>
          </div>
        </form>
      </div>
      <div className={styles._35}><h2 className={styles._36}>Cách xác minh</h2><div className={styles._37}>
        <div className={styles._38}><div className={styles._39}>1</div><p className={styles._40}>Nhập đúng hai mã in trên văn bằng</p></div>
        <div className={styles._38}><div className={styles._39}>2</div><p className={styles._40}>Hệ thống kiểm tra cơ sở dữ liệu, IPFS và blockchain</p></div>
        <div className={styles._38}><div className={styles._39}>3</div><p className={styles._40}>Xem trạng thái hợp lệ, thu hồi hoặc sai lệch</p></div>
      </div></div>
    </div>
  );
}
