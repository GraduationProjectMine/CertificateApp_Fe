"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import styles from "./page.module.css";
import { certificateApi, mapCertificateDtoToStudentCert } from "@/features/certificates/services/certificate.api";
import type { StudentCertificate } from "@/features/certificates/types";
import QRCodeBox from "@/components/credential/QRCodeBox";
import ShareDialog from "@/features/certificates/components/ShareDialog";
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
  const isDraft = cert.rawStatus === "DRAFT";

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

        {isDraft && (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/50 text-amber-800 dark:text-amber-300 mb-4">
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1 text-xs font-semibold">
              Văn bằng này đang ở trạng thái bản thảo (chờ duyệt cấp). Nếu có sai sót về thông tin, bạn có thể gửi yêu cầu chỉnh sửa cho nhà trường.
            </div>
            <button
              onClick={() => router.push("/student/disputes")}
              className="shrink-0 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all"
            >
              Gửi yêu cầu chỉnh sửa
            </button>
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
            ) : isDraft ? (
              <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
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
            <span className={`${styles._0} ${isRevoked ? styles._16 : isDraft ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400" : styles._17}`}>
              {isRevoked ? "Đã thu hồi" : isDraft ? "Bản thảo / Chờ cấp" : "Hợp lệ"}
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
            {!isDraft && (
              <div className={styles._26}>
                <QRCodeBox
                  value={`${typeof window !== "undefined" ? window.location.origin : ""}/public/certificate/${cert.id}`}
                  size={140}
                  title="Quét để xác minh"
                />
              </div>
            )}
          </div>

          <dl className={styles._27}>
            <div className={styles._28}>
              <dt className={styles._29}>Họ và tên sinh viên</dt>
              <dd className={styles._30}>{cert.studentName}</dd>
            </div>
            <div className={styles._28}>
              <dt className={styles._29}>Tên văn bằng</dt>
              <dd className={styles._30}>{cert.credentialTitle}</dd>
            </div>
            <div className={styles._28}>
              <dt className={styles._29}>Trường cấp</dt>
              <dd className={styles._30}>{cert.issuerName || cert.schoolName}</dd>
            </div>
            {cert.dob && (
              <div className={styles._28}>
                <dt className={styles._29}>Ngày sinh</dt>
                <dd className={styles._30}>{cert.dob}</dd>
              </div>
            )}
            {cert.placeOfBirth && (
              <div className={styles._28}>
                <dt className={styles._29}>Nơi sinh</dt>
                <dd className={styles._30}>{cert.placeOfBirth}</dd>
              </div>
            )}
            {cert.gender && (
              <div className={styles._28}>
                <dt className={styles._29}>Giới tính</dt>
                <dd className={styles._30}>{cert.gender}</dd>
              </div>
            )}
            {cert.ethnicity && (
              <div className={styles._28}>
                <dt className={styles._29}>Dân tộc</dt>
                <dd className={styles._30}>{cert.ethnicity}</dd>
              </div>
            )}
            {cert.schoolName && (
              <div className={styles._28}>
                <dt className={styles._29}>Trường đào tạo</dt>
                <dd className={styles._30}>{cert.schoolName}</dd>
              </div>
            )}
            {cert.examCohort && (
              <div className={styles._28}>
                <dt className={styles._29}>Khóa thi</dt>
                <dd className={styles._30}>{cert.examCohort}</dd>
              </div>
            )}
            {cert.examBoard && (
              <div className={styles._28}>
                <dt className={styles._29}>Hội đồng thi</dt>
                <dd className={styles._30}>{cert.examBoard}</dd>
              </div>
            )}
            {cert.issueLocation && (
              <div className={styles._28}>
                <dt className={styles._29}>Nơi cấp</dt>
                <dd className={styles._30}>{cert.issueLocation}</dd>
              </div>
            )}
            <div className={styles._28}>
              <dt className={styles._29}>Ngày cấp</dt>
              <dd className={styles._30}>{cert.issueDate || "Đang chờ phát hành"}</dd>
            </div>
            {cert.serialNumber && (
              <div className={styles._28}>
                <dt className={styles._29}>Số hiệu văn bằng</dt>
                <dd className={styles._30}>{cert.serialNumber}</dd>
              </div>
            )}
            {cert.registryNumber && (
              <div className={styles._28}>
                <dt className={styles._29}>Số vào sổ</dt>
                <dd className={styles._30}>{cert.registryNumber}</dd>
              </div>
            )}
          </dl>
        </div>

        {!isDraft && (
          <div className={styles._32}>
            <h3 className={styles._33}>Thao tác</h3>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => setShowShare(true)} className={styles._35}>
                <svg className={styles._36} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Chia sẻ văn bằng
              </button>
            </div>
          </div>
        )}
      </div>

      {showShare && (
        <ShareDialog
          credentialCode={cert.id}
          credentialTitle={cert.credentialTitle}
          onClose={() => setShowShare(false)}
        />
      )}
    </div>
  );
}
