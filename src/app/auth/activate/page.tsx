"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import styles from "./activate.module.css";

interface TokenInfo {
  email: string;
  name: string;
  organizationName: string;
}

function ActivateForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [tokenError, setTokenError] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  useEffect(() => {
    if (!token) {
      setTokenError("Không tìm thấy token kích hoạt. Vui lòng kiểm tra lại đường dẫn.");
      setVerifying(false);
      return;
    }

    fetch(`${API_URL}/auth/activate/verify?token=${encodeURIComponent(token)}`)
      .then((r) => {
        if (!r.ok) return r.json().then((d) => Promise.reject(d));
        return r.json();
      })
      .then((data) => {
        setTokenInfo(data);
        setVerifying(false);
      })
      .catch((err) => {
        setTokenError(err?.message || "Token không hợp lệ hoặc đã hết hạn.");
        setVerifying(false);
      });
  }, [token, API_URL]);

  const validate = () => {
    const errs: string[] = [];
    if (password.length < 8) errs.push("Mật khẩu phải có ít nhất 8 ký tự");
    if (!/[A-Z]/.test(password)) errs.push("Mật khẩu phải chứa ít nhất 1 chữ HOA");
    if (!/[0-9]/.test(password)) errs.push("Mật khẩu phải chứa ít nhất 1 chữ số");
    if (password !== confirmPassword) errs.push("Mật khẩu xác nhận không khớp");
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (errs.length > 0) {
      setErrors(errs);
      return;
    }
    setErrors([]);
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/activate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, confirmPassword }),
      });

      if (!res.ok) {
        const err = await res.json();
        setErrors([err?.message || "Kích hoạt thất bại. Vui lòng thử lại."]);
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push("/auth/login"), 3000);
    } catch {
      setErrors(["Không thể kết nối đến máy chủ. Vui lòng thử lại."]);
    } finally {
      setLoading(false);
    }
  };

  const strengthScore = (() => {
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  })();

  const strengthLabel = ["", "Yếu", "Trung bình", "Khá", "Mạnh"][strengthScore];
  const strengthColor = ["", "#ef4444", "#f97316", "#eab308", "#22c55e"][strengthScore];

  if (verifying) {
    return (
      <div className={styles.card}>
        <div className={styles.loadingSpinner} />
        <p className={styles.loadingText}>Đang xác thực liên kết kích hoạt...</p>
      </div>
    );
  }

  if (tokenError) {
    return (
      <div className={styles.card}>
        <div className={styles.errorIcon}>⚠️</div>
        <h1 className={styles.title}>Liên kết không hợp lệ</h1>
        <p className={styles.subtitle}>{tokenError}</p>
        <Link href="/auth/login" className={styles.backBtn}>
          ← Quay về đăng nhập
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className={styles.card}>
        <div className={styles.successIcon}>🎉</div>
        <h1 className={styles.title}>Kích hoạt thành công!</h1>
        <p className={styles.subtitle}>
          Tài khoản của bạn đã được kích hoạt. Đang chuyển đến trang đăng nhập...
        </p>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.logo}>🎓</div>
        <h1 className={styles.title}>Kích hoạt tài khoản</h1>
        <p className={styles.subtitle}>
          Chào mừng <strong>{tokenInfo?.name}</strong> từ{" "}
          <strong>{tokenInfo?.organizationName}</strong>!
        </p>
        <p className={styles.emailBadge}>{tokenInfo?.email}</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.field}>
          <label className={styles.label}>Mật khẩu mới</label>
          <div className={styles.inputWrap}>
            <input
              id="activate-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ít nhất 8 ký tự, 1 chữ hoa, 1 số"
              className={styles.input}
              required
              autoFocus
            />
            <button
              type="button"
              className={styles.eyeBtn}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>
          {password && (
            <div className={styles.strength}>
              <div className={styles.strengthBars}>
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={styles.strengthBar}
                    style={{ background: i <= strengthScore ? strengthColor : "#e5e7eb" }}
                  />
                ))}
              </div>
              <span style={{ color: strengthColor }} className={styles.strengthLabel}>
                {strengthLabel}
              </span>
            </div>
          )}
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Xác nhận mật khẩu</label>
          <input
            id="activate-confirm"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Nhập lại mật khẩu"
            className={`${styles.input} ${
              confirmPassword && confirmPassword !== password ? styles.inputError : ""
            }`}
            required
          />
        </div>

        {errors.length > 0 && (
          <div className={styles.errorBox}>
            {errors.map((e, i) => (
              <p key={i} className={styles.errorItem}>
                ✕ {e}
              </p>
            ))}
          </div>
        )}

        <button
          id="activate-submit"
          type="submit"
          className={styles.submitBtn}
          disabled={loading}
        >
          {loading ? (
            <span className={styles.btnSpinner} />
          ) : (
            "✅ Kích hoạt tài khoản"
          )}
        </button>
      </form>

      <p className={styles.footer}>
        Đã có tài khoản?{" "}
        <Link href="/auth/login" className={styles.link}>
          Đăng nhập
        </Link>
      </p>
    </div>
  );
}

export default function ActivatePage() {
  return (
    <div className={styles.page}>
      <Suspense
        fallback={
          <div className={styles.card}>
            <div className={styles.loadingSpinner} />
            <p className={styles.loadingText}>Đang tải trang kích hoạt...</p>
          </div>
        }
      >
        <ActivateForm />
      </Suspense>
    </div>
  );
}
