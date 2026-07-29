"use client";

import React, { useState } from "react";
import Link from "next/link";
import styles from "./page.module.css";
import VerificationResult, { type VerificationData } from "@/components/credential/VerificationResult";
import { verifierApi, type VerifyCertificateResponse } from "@/features/verification/services/verifier.api";
import { useI18n } from "@/features/i18n/I18nContext";

function mapVerification(response: VerifyCertificateResponse, tFn: (key: string) => string): VerificationData {
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
    error: status === "INVALID" ? tFn("public.verify.data_mismatch") : undefined,
  };
}

export default function VerifyPublicPage() {
  const { t } = useI18n();
  const [serialNumber, setSerialNumber] = useState("");
  const [registryNumber, setRegistryNumber] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<VerificationData | null>(null);
  const [error, setError] = useState("");

  const handleVerify = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!serialNumber.trim() || !registryNumber.trim()) {
      setError(t("public.verify.input_required"));
      return;
    }
    setError("");
    setIsVerifying(true);
    try {
      setResult(mapVerification(await verifierApi.verifyAny(serialNumber.trim(), registryNumber.trim()), t));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("public.verify.verify_failed"));
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
        <span className={styles._47}>{t("public.verify.title")}</span>
      </div>
      <div className={styles._3}>
        <h1 className={styles._4}>{t("public.verify.title")}</h1>
        <p className={styles._5}>{t("public.verify.description")}</p>
      </div>
      <div className={styles._6}>
        <div className={styles._7}>
          <button className={`${styles._0} ${styles._8}`}>{t("public.verify.tab_input")}</button>
          <button disabled className={`${styles._0} ${styles._9}`} title={t("public.verify.not_supported")}>{t("public.verify.tab_qr")}</button>
          <button disabled className={`${styles._0} ${styles._9}`} title={t("public.verify.not_supported")}>{t("public.verify.tab_upload")}</button>
        </div>
        <form onSubmit={handleVerify} className={styles._11}>
          <div className={styles._12}>
            <div className={styles._13}><label className={styles._14}>{t("public.verify.serial_label")}</label><input value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} placeholder="B2026/001" className={styles._15} /></div>
            <div className={styles._13}><label className={styles._14}>{t("public.verify.registry_label")}</label><input value={registryNumber} onChange={(e) => setRegistryNumber(e.target.value)} placeholder="2026/001" className={styles._15} /></div>
            {error && <p className={styles._16}>{error}</p>}
            <button disabled={isVerifying} className={styles._17}>{isVerifying ? t("public.verify.verifying") : t("public.verify.button")}</button>
          </div>
        </form>
      </div>
      <div className={styles._35}><h2 className={styles._36}>{t("public.verify.how_title")}</h2><div className={styles._37}>
        <div className={styles._38}><div className={styles._39}>1</div><p className={styles._40}>{t("public.verify.how_step1")}</p></div>
        <div className={styles._38}><div className={styles._39}>2</div><p className={styles._40}>{t("public.verify.how_step2")}</p></div>
        <div className={styles._38}><div className={styles._39}>3</div><p className={styles._40}>{t("public.verify.how_step3")}</p></div>
      </div></div>
    </div>
  );
}
