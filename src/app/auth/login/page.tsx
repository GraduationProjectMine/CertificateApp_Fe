"use client";
import styles from "./page.module.css";
import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../features/auth/components/AuthContext";
import Button from "@/components/ui/Button";

type GoogleCredentialResponse = {
  credential: string;
};

type GoogleButtonConfig = {
  theme: string;
  size: string;
  width: number;
  shape?: string;
  text?: string;
};

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id?: string;
            callback: (response: GoogleCredentialResponse) => void;
          }) => void;
          renderButton: (element: HTMLElement, config: GoogleButtonConfig) => void;
          prompt: () => void;
        };
      };
    };
  }
}

function getDashboardRedirect(role: string) {
  const normalizedRole = role?.toLowerCase();
  if (normalizedRole === "super_admin" || normalizedRole === "sysadmin") {
    return "/super-admin/dashboard";
  }
  if (normalizedRole === "issuer" || normalizedRole === "staff") {
    return "/admin/dashboard";
  }
  if (normalizedRole === "student") return "/student/dashboard";
  return "/public/verify";
}

export default function LoginPage() {
  const { user, login, loginWithGoogle, loginWithMetaMask } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const googleBtnRef = useRef<HTMLDivElement>(null);

  const handleGoogleResponse = useCallback(
    async (response: GoogleCredentialResponse) => {
      setIsSubmitting(true);
      setError("");
      const result = await loginWithGoogle(response.credential);
      if (!result.success) setError(result.error || "Google login failed");
      setIsSubmitting(false);
    },
    [loginWithGoogle],
  );

  useEffect(() => {
    if (user) router.push(getDashboardRedirect(user.role));
  }, [user, router]);

  useEffect(() => {
    if (typeof window === "undefined" || !window.google || !googleBtnRef.current) {
      return;
    }

    try {
      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
      });
      window.google.accounts.id.renderButton(googleBtnRef.current, {
        theme: "outline",
        size: "large",
        width: 336,
        shape: "rectangular",
        text: "signin_with",
      });
    } catch {
      window.setTimeout(() => setError("Không thể khởi tạo đăng nhập Google"), 0);
    }
  }, [handleGoogleResponse]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Vui lòng nhập email và mật khẩu");
      return;
    }

    setIsSubmitting(true);
    const result = await login(email, password);
    if (!result.success) setError(result.error || "Sai email hoặc mật khẩu");
    setIsSubmitting(false);
  };

  const handleMetaMask = async () => {
    setError("");
    setIsSubmitting(true);
    const result = await loginWithMetaMask();
    if (!result.success) setError(result.error || "Lỗi MetaMask");
    setIsSubmitting(false);
  };

  return (
    <main className={`auth-page-shell ${styles._1}`}>
      <div className={styles._2} />
      <div className={styles._3} />
      <div className={styles._4}>
        <section className={`auth-visual-panel ${styles._5}`}>
          <div className={`motion-float ${styles._6}`} />
          <div className={`motion-float-slow ${styles._7}`} />

          <Link href="/" className={styles._8}>
            <span className={styles._9}>
              C
            </span>
            <span className={styles._10}>CertiChain</span>
          </Link>

          <div className={styles._11} data-reveal>
            <p className={styles._12}>
              Bảo mật danh tính học thuật
            </p>
            <h1 className={styles._13}>
              Truy cập hệ thống cấp phát văn bằng số.
            </h1>
            <p className={styles._14}>
              Quản trị, cấp bằng, xác minh và theo dõi dữ liệu blockchain từ một không gian làm việc thống nhất.
            </p>
          </div>

          <div className={styles._15} data-reveal>
            {["Ví điện tử", "Google OAuth", "JWT bảo vệ"].map((item) => (
              <div key={item} className={styles._16}>
                <span className={styles._17} />
                <span className={styles._18}>{item}</span>
              </div>
            ))}
          </div>
        </section>

        <section className={`auth-form-panel ${styles._19}`} data-reveal>
          <div className={styles._20}>
            <Link href="/" className={styles._21}>
              <span className={styles._22}>
                C
              </span>
              <span className={styles._23}>CertiChain</span>
            </Link>
            <Link href="/" className={`auth-switch-link ${styles._24}`}>
              Trang chủ
            </Link>
          </div>

          <div className={`auth-card-surface ${styles._25}`}>
            <div className={styles._26}>
              <p className={styles._27}>
                Đăng nhập tài khoản
              </p>
              <h2 className={styles._28}>
                Chào mừng trở lại
              </h2>
              <p className={styles._29}>
                Sử dụng email trường học, Google hoặc ví MetaMask đã liên kết.
              </p>
            </div>

            {error && (
              <div className={styles._30} data-reveal>
                {error}
              </div>
            )}

            <form className={styles._31} onSubmit={handleSubmit}>
              <label className={styles._32}>
                <span className={styles._33}>
                  Email
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className={styles._34}
                  placeholder="admin@truonghoc.edu.vn"
                />
              </label>

              <label className={styles._32}>
                <span className={styles._33}>
                  Mật khẩu
                </span>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className={`${styles._34} pr-10`}
                    placeholder="Nhập mật khẩu"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"></path>
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                      </svg>
                    )}
                  </button>
                </div>
              </label>

              <Button type="submit" disabled={isSubmitting} className={styles._35}>
                {isSubmitting ? "Đang xử lý..." : "Đăng nhập"}
              </Button>
            </form>

            <div className={styles._36}>
              <span className={styles._37} />
              <span className={styles._38}>Hoặc</span>
              <span className={styles._37} />
            </div>

            <div className={styles._39}>
              <div ref={googleBtnRef} className={styles._40} />
              <Button variant="secondary" type="button" onClick={handleMetaMask} disabled={isSubmitting} className={styles._41}>
                <span className={styles._42} />
                Kết nối ví MetaMask
              </Button>
            </div>

            <div className={styles._43}>
              <Button variant="ghost" href="/auth/register" className={`auth-switch-link ${styles._44}`}>
                Đăng ký tài khoản trường học
              </Button>
              <Link href="/auth/forgot-password" className={`auth-switch-link ${styles._45}`}>
                Quên mật khẩu?
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
