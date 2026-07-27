"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import styles from "./page.module.css";
import { certificateApi, mapCertificateDtoToStudentCert } from "@/features/certificates/services/certificate.api";
import type { StudentCertificate } from "@/features/certificates/types";
import BlockchainInfo from "@/components/credential/BlockchainInfo";
import IPFSInfo from "@/components/credential/IPFSInfo";
import QRCodeBox from "@/components/credential/QRCodeBox";
import ShareDialog from "@/features/certificates/components/ShareDialog";
import Loading from "@/components/common/Loading";
import ErrorMessage from "@/components/common/ErrorMessage";
import { useI18n } from "@/features/i18n/I18nContext";

export default function StudentCertificateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cert, setCert] = useState<StudentCertificate | null>(null);
  const [showShare, setShowShare] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const dto = await certificateApi.get(params.id as string);
        setCert(mapCertificateDtoToStudentCert(dto));
      } catch (err: any) {
        setError(err.message || t("student.certificates.not_found"));
      }
      setLoading(false);
    };
    fetchDetail();
  }, [params.id]);

  if (loading) {
    return (
      <div className={styles._1}>
        <Loading message={t("student.certificates.loading_detail")} />
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
            {t("student.certificates.list")}
        </button>
      </div>

      <div className={styles._5}>
        {isRevoked && (
          <div className={styles._6}>
            <svg className={styles._7} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className={styles._8}>{t("student.certificates.revoked_message")}</p>
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
              <p className={styles._15}>{t("student.certificates.credential_code")}: {cert.credentialCode}</p>
            </div>
            <span className={`${styles._0} ${isRevoked ? styles._16 : styles._17}`}>
              {isRevoked ? t("common.revoked") : t("common.valid")}
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
                <p className={styles._25}>{t("student.certificates.student_code")}: {cert.studentCode}</p>
                <p className={styles._25}>{cert.major}</p>
                {cert.classification && (
                  <p className={styles._25}>{t("student.certificates.classification")}: {cert.classification}</p>
                )}
              </div>
            </div>
            <div className={styles._26}>
              <QRCodeBox
                value={`${typeof window !== "undefined" ? window.location.origin : ""}/public/certificate/${cert.credentialCode}`}
                size={140}
                title={t("student.certificates.scan_to_verify")}
              />
            </div>
          </div>

          <dl className={styles._27}>
            <div className={styles._28}>
              <dt className={styles._29}>{t("student.certificates.issuer")}</dt>
              <dd className={styles._30}>{cert.issuerName}</dd>
            </div>
            <div className={styles._28}>
              <dt className={styles._29}>{t("student.certificates.issue_date")}</dt>
              <dd className={styles._30}>{cert.issueDate}</dd>
            </div>
            <div className={styles._28}>
              <dt className={styles._29}>{t("student.certificates.serial_number")}</dt>
              <dd className={styles._30}>{cert.serialNumber}</dd>
            </div>
            <div className={styles._28}>
              <dt className={styles._29}>{t("student.certificates.major")}</dt>
              <dd className={styles._30}>{cert.major}</dd>
            </div>
            {cert.gpa && (
              <div className={styles._28}>
                <dt className={styles._29}>GPA</dt>
                <dd className={styles._30}>{cert.gpa}</dd>
              </div>
            )}
            <div className={styles._28}>
              <dt className={styles._29}>{t("student.certificates.classification")}</dt>
              <dd className={styles._30}>{cert.classification}</dd>
            </div>
            <div className={styles._28}>
              <dt className={styles._29}>{t("student.certificates.student_code")}</dt>
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
          <h3 className={styles._33}>{t("common.actions")}</h3>
          <div className={styles._34}>
            <button onClick={() => setShowShare(true)} className={styles._35}>
              <svg className={styles._36} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              {t("student.certificates.share_certificate")}
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
              {t("student.certificates.copy_verify_link")}
            </button>
          </div>
        </div>

        <div className={styles._37}>
          <p className={styles._38}>
            {t("student.certificates.blockchain_verify_note")}
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
