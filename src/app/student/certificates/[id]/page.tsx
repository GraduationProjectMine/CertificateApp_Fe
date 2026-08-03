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
import { walletApi } from "@/features/wallet/services/wallet.api";
import Loading from "@/components/common/Loading";
import ErrorMessage from "@/components/common/ErrorMessage";

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
      try {
        const dto = await certificateApi.get(params.id as string);
        setCert(mapCertificateDtoToStudentCert(dto));
      } catch (err: any) {
        setError(err.message || "Không tìm thấy văn bằng.");
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
            <button onClick={() => window.print()} className={styles._35}>
              <svg className={styles._36} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Tải PDF văn bằng
            </button>
            <button onClick={() => walletApi.exportVC(cert.id)} className={styles._35}>
              <svg className={styles._36} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Xuất W3C VC 2.0
            </button>
            <button onClick={() => walletApi.exportOpenBadges(cert.id)} className={styles._35}>
              <svg className={styles._36} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              Xuất Open Badges 3.0
            </button>
          </div>
          <div className="mt-3">
            <button onClick={() => router.push('/student/shares')} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary/10 text-primary text-sm font-bold hover:bg-primary/20 transition-all">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Chia sẻ có kiểm soát
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
