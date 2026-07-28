"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/features/auth/components/AuthContext";
import styles from "./page.module.css";

interface Share {
  id: string;
  certificate_id: string;
  share_token: string;
  expires_at: string | null;
  revoked: boolean;
  verify_count: number;
  createdAt: string;
  is_expired: boolean;
  share_url: string;
  scope: string | null;
}

interface Certificate {
  certificate_id: string;
  certificate_title: string;
  status: string;
}

const AVAILABLE_FIELDS = [
  { key: "dob", label: "Ngày sinh" },
  { key: "placeOfBirth", label: "Nơi sinh" },
  { key: "gender", label: "Giới tính" },
  { key: "schoolName", label: "Trường/Đơn vị" },
  { key: "examCohort", label: "Khóa học" },
  { key: "serialNumber", label: "Số hiệu" },
  { key: "registryNumber", label: "Số vào sổ" },
  { key: "issueDate", label: "Ngày cấp" },
];

export default function StudentSharePage() {
  const { user } = useAuth();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  const [shares, setShares] = useState<Share[]>([]);
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newShareUrl, setNewShareUrl] = useState("");

  const [form, setForm] = useState({
    certificate_id: "",
    expires_in_days: "30",
    scope: [] as string[],
  });

  const getToken = () =>
    typeof window !== "undefined" ? localStorage.getItem("accessToken") || "" : "";

  useEffect(() => {
    fetchShares();
    fetchCerts();
  }, []);

  const fetchShares = async () => {
    try {
      const res = await fetch(`${API_URL}/share`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) setShares(await res.json());
    } finally {
      setLoading(false);
    }
  };

  const fetchCerts = async () => {
    const res = await fetch(`${API_URL}/certificates`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (res.ok) {
      const data = await res.json();
      setCerts(
        data.filter(
          (c: any) =>
            c.status === "ISSUED" || c.status === "VALID" || !c.status
        )
      );
    }
  };


  const handleCreate = async () => {
    if (!form.certificate_id) return;
    setCreating(true);
    try {
      const res = await fetch(`${API_URL}/share`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          certificate_id: form.certificate_id,
          expires_in_days: form.expires_in_days
            ? parseInt(form.expires_in_days)
            : undefined,
          scope: form.scope.length > 0 ? form.scope : undefined,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const fullUrl = `${window.location.origin}/verify/share/${data.share_token}`;
        setNewShareUrl(fullUrl);
        await fetchShares();
        setForm({ certificate_id: "", expires_in_days: "30", scope: [] });
        setShowModal(false);
      }
    } finally {
      setCreating(false);
    }
  };

  const handleRevoke = async (shareId: string) => {
    if (!confirm("Bạn có chắc muốn thu hồi link chia sẻ này?")) return;
    const res = await fetch(`${API_URL}/share/${shareId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (res.ok) fetchShares();
  };

  const copyToClipboard = (token: string) => {
    const url = `${window.location.origin}/verify/share/${token}`;
    navigator.clipboard.writeText(url);
  };

  const activeShares = shares.filter((s) => !s.revoked && !s.is_expired);
  const inactiveShares = shares.filter((s) => s.revoked || s.is_expired);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>🔗 Chia sẻ bằng cấp</h1>
          <p className={styles.subtitle}>
            Tạo link chia sẻ có kiểm soát, giới hạn thời gian và phạm vi thông tin
          </p>
        </div>
        <button
          id="btn-create-share"
          className={styles.createBtn}
          onClick={() => setShowModal(true)}
        >
          + Tạo link mới
        </button>
      </div>

      {newShareUrl && (
        <div className={styles.newShareBanner}>
          <span>✅ Link chia sẻ mới:</span>
          <code className={styles.shareUrlCode}>{newShareUrl}</code>
          <button
            className={styles.copyBtn}
            onClick={() => navigator.clipboard.writeText(newShareUrl)}
          >
            📋 Copy
          </button>
          <button className={styles.closeBanner} onClick={() => setNewShareUrl("")}>
            ×
          </button>
        </div>
      )}

      {loading ? (
        <div className={styles.loader}>Đang tải...</div>
      ) : (
        <>
          <section>
            <h2 className={styles.sectionTitle}>
              Đang hoạt động ({activeShares.length})
            </h2>
            {activeShares.length === 0 ? (
              <div className={styles.empty}>
                Chưa có link chia sẻ nào. Tạo link đầu tiên!
              </div>
            ) : (
              <div className={styles.grid}>
                {activeShares.map((s) => (
                  <ShareCard
                    key={s.id}
                    share={s}
                    certs={certs}
                    onRevoke={() => handleRevoke(s.id)}
                    onCopy={() => copyToClipboard(s.share_token)}
                  />
                ))}
              </div>
            )}
          </section>

          {inactiveShares.length > 0 && (
            <section style={{ marginTop: 32 }}>
              <h2 className={styles.sectionTitle}>
                Đã hết hạn / Thu hồi ({inactiveShares.length})
              </h2>
              <div className={styles.grid}>
                {inactiveShares.map((s) => (
                  <ShareCard
                    key={s.id}
                    share={s}
                    certs={certs}
                    inactive
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {showModal && (
        <div className={styles.overlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeModal} onClick={() => setShowModal(false)}>
              ×
            </button>
            <h2 className={styles.modalTitle}>Tạo Link Chia Sẻ</h2>

            <div className={styles.formField}>
              <label className={styles.formLabel}>Bằng cấp</label>
              <select
                id="share-cert-select"
                className={styles.formSelect}
                value={form.certificate_id}
                onChange={(e) => setForm({ ...form, certificate_id: e.target.value })}
              >
                <option value="">-- Chọn bằng cấp --</option>
                {certs.map((c: any) => (
                  <option
                    key={c.certificate_id || c.id}
                    value={c.certificate_id || c.id}
                  >
                    {c.certificate_title || c.credentialTitle || "Bằng cấp"}
                  </option>
                ))}

              </select>
            </div>

            <div className={styles.formField}>
              <label className={styles.formLabel}>Hết hạn sau (ngày)</label>
              <input
                id="share-expires-input"
                type="number"
                className={styles.formInput}
                value={form.expires_in_days}
                onChange={(e) => setForm({ ...form, expires_in_days: e.target.value })}
                min={1}
                max={365}
                placeholder="Để trống = không giới hạn"
              />
            </div>

            <div className={styles.formField}>
              <label className={styles.formLabel}>
                Phạm vi thông tin (để trống = chia sẻ tất cả)
              </label>
              <div className={styles.checkGrid}>
                {AVAILABLE_FIELDS.map((f) => (
                  <label key={f.key} className={styles.checkItem}>
                    <input
                      type="checkbox"
                      checked={form.scope.includes(f.key)}
                      onChange={(e) => {
                        const next = e.target.checked
                          ? [...form.scope, f.key]
                          : form.scope.filter((k) => k !== f.key);
                        setForm({ ...form, scope: next });
                      }}
                    />
                    {f.label}
                  </label>
                ))}
              </div>
            </div>

            <button
              id="share-create-submit"
              className={styles.createBtn}
              onClick={handleCreate}
              disabled={!form.certificate_id || creating}
              style={{ width: "100%", marginTop: 8 }}
            >
              {creating ? "Đang tạo..." : "✅ Tạo Link"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ShareCard({
  share,
  certs,
  onRevoke,
  onCopy,
  inactive,
}: {
  share: Share;
  certs: Certificate[];
  onRevoke?: () => void;
  onCopy?: () => void;
  inactive?: boolean;
}) {
  const cert = certs.find((c) => c.certificate_id === share.certificate_id);
  const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/verify/share/${share.share_token}`;

  return (
    <div className={`${styles.shareCard} ${inactive ? styles.inactive : ""}`}>
      <div className={styles.cardTop}>
        <span className={styles.certName}>{cert?.certificate_title || "Bằng cấp"}</span>
        <span
          className={`${styles.badge} ${share.revoked ? styles.badgeRevoked : share.is_expired ? styles.badgeExpired : styles.badgeActive}`}
        >
          {share.revoked ? "Đã thu hồi" : share.is_expired ? "Hết hạn" : "Đang hoạt động"}
        </span>
      </div>

      <div className={styles.cardStats}>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Lượt xem</span>
          <span className={styles.statValue}>{share.verify_count}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Hết hạn</span>
          <span className={styles.statValue}>
            {share.expires_at
              ? new Date(share.expires_at).toLocaleDateString("vi-VN")
              : "Không giới hạn"}
          </span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Phạm vi</span>
          <span className={styles.statValue}>
            {share.scope ? "Giới hạn" : "Toàn bộ"}
          </span>
        </div>
      </div>

      <div className={styles.tokenRow}>
        <code className={styles.tokenCode}>{share.share_token.slice(0, 20)}...</code>
      </div>

      {!inactive && (
        <div className={styles.cardActions}>
          <button className={styles.copyBtn} onClick={onCopy}>
            📋 Copy Link
          </button>
          <button className={styles.revokeBtn} onClick={onRevoke}>
            🚫 Thu hồi
          </button>
        </div>
      )}
    </div>
  );
}
