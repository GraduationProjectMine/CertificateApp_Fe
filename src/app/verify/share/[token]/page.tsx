"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import styles from "./page.module.css";

interface ShareVerifyResult {
  certificate: {
    certificate_id: string;
    certificate_title: string;
    student_fullName: string;
    organization_name: string;
    status: string;
    issuedAt: string;
    ipfs_cid?: string;
    tx_hash?: string;
    serialNumber?: string;
    issueDate?: string;
    schoolName?: string;
    dob?: string;
    gender?: string;
  };
  share: {
    expires_at: string | null;
    verify_count: number;
  };
}

const FIELD_LABELS: Record<string, string> = {
  certificate_title: "Tên bằng cấp",
  student_fullName: "Họ và tên",
  organization_name: "Đơn vị cấp",
  status: "Trạng thái",
  issuedAt: "Thời gian cấp",
  serialNumber: "Số hiệu",
  issueDate: "Ngày cấp",
  schoolName: "Trường/Đơn vị",
  dob: "Ngày sinh",
  gender: "Giới tính",
  ipfs_cid: "IPFS CID",
  tx_hash: "Blockchain Tx",
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  ISSUED: { label: "✅ Hợp lệ", color: "#166534" },
  REVOKED: { label: "❌ Đã thu hồi", color: "#991b1b" },
  SUPERSEDED: { label: "🔄 Đã cập nhật", color: "#92400e" },
  DRAFT: { label: "📝 Nháp", color: "#374151" },
};

export default function ShareVerifyPage() {
  const params = useParams();
  const token = params.token as string;

  const [result, setResult] = useState<ShareVerifyResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  useEffect(() => {
    fetch(`${API_URL}/share/verify/${token}`)
      .then((r) => {
        if (!r.ok) return r.json().then((d) => Promise.reject(d));
        return r.json();
      })
      .then((data) => {
        setResult(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err?.message || "Link chia sẻ không hợp lệ hoặc đã hết hạn.");
        setLoading(false);
      });
  }, [token]);

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.spinner} />
          <p className={styles.loadingText}>Đang xác thực bằng cấp...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.errorIcon}>⚠️</div>
          <h1 className={styles.title}>Không thể xác thực</h1>
          <p className={styles.subtitle}>{error}</p>
          <Link href="/" className={styles.homeLink}>← Về trang chủ</Link>
        </div>
      </div>
    );
  }

  const cert = result!.certificate;
  const share = result!.share;
  const statusInfo = STATUS_LABELS[cert.status] || { label: cert.status, color: "#374151" };

  const displayFields = Object.entries(cert).filter(
    ([k, v]) => k !== "certificate_id" && v !== null && v !== undefined && v !== ""
  );

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.heroHeader}>
          <div className={styles.logoRow}>
            <span className={styles.logoIcon}>🎓</span>
            <span className={styles.logoText}>CertiChain</span>
          </div>
          <div className={styles.verifiedBadge}>
            <span className={styles.verifiedIcon}>✓</span>
            Bằng cấp được xác thực
          </div>
        </div>

        <div className={styles.certHeader}>
          <h1 className={styles.certTitle}>{cert.certificate_title}</h1>
          <span className={styles.statusBadge} style={{ color: statusInfo.color, background: `${statusInfo.color}18` }}>
            {statusInfo.label}
          </span>
        </div>

        <div className={styles.infoGrid}>
          {displayFields.map(([key, value]) => {
            const label = FIELD_LABELS[key];
            if (!label) return null;
            let displayValue = String(value);
            if (key === "issuedAt") displayValue = new Date(value as string).toLocaleDateString("vi-VN");
            if (key === "tx_hash") displayValue = `${displayValue.slice(0, 20)}...`;
            if (key === "ipfs_cid") displayValue = `${displayValue.slice(0, 20)}...`;
            return (
              <div key={key} className={styles.infoRow}>
                <span className={styles.infoLabel}>{label}</span>
                <span className={styles.infoValue}>{displayValue}</span>
              </div>
            );
          })}
        </div>

        {cert.tx_hash && (
          <div className={styles.blockchainSection}>
            <h3 className={styles.sectionTitle}>⛓️ Xác thực blockchain</h3>
            <div className={styles.blockchainRow}>
              <span className={styles.blockchainLabel}>Transaction Hash:</span>
              <a
                href={`https://sepolia.etherscan.io/tx/${cert.tx_hash}`}
                target="_blank"
                rel="noreferrer"
                className={styles.txLink}
              >
                {cert.tx_hash.slice(0, 30)}...↗
              </a>
            </div>
          </div>
        )}

        {cert.ipfs_cid && (
          <a
            href={`https://gateway.pinata.cloud/ipfs/${cert.ipfs_cid}`}
            target="_blank"
            rel="noreferrer"
            className={styles.viewOriginalBtn}
          >
            📄 Xem tài liệu gốc trên IPFS
          </a>
        )}

        <div className={styles.shareInfo}>
          <div className={styles.shareInfoRow}>
            <span>🔍 Lượt xem:</span>
            <span>{share.verify_count}</span>
          </div>
          {share.expires_at && (
            <div className={styles.shareInfoRow}>
              <span>⏰ Hết hạn:</span>
              <span>{new Date(share.expires_at).toLocaleDateString("vi-VN")}</span>
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <p className={styles.footerText}>
            Link chia sẻ này được tạo bởi chủ sở hữu bằng cấp qua hệ thống CertiChain.
          </p>
          <Link href="/" className={styles.homeLink}>
            🏠 Về trang chủ CertiChain
          </Link>
        </div>
      </div>
    </div>
  );
}
