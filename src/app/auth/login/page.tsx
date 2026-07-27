"use client";
import styles from "./page.module.css";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../features/auth/components/AuthContext";
import { authApi } from "../../../features/auth/services/api";
import Button from "@/components/ui/Button";
import LanguageSwitcher from "@/components/common/LanguageSwitcher";
import { useI18n } from "@/features/i18n/I18nContext";
import { BrowserProvider } from "ethers";

function getDashboardRedirect(role: string) {
  const normalizedRole = role?.toLowerCase();
  if (normalizedRole === "issuer" || normalizedRole === "staff" || normalizedRole === "super_admin" || normalizedRole === "sysadmin") {
    return "/admin/dashboard";
  }
  if (normalizedRole === "student") return "/student/dashboard";
  return "/public/verify";
}

export default function LoginPage() {
  const { user, login, loginWithMetaMask } = useAuth();
  const { t } = useI18n();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isWalletSubmitting, setIsWalletSubmitting] = useState(false);

  useEffect(() => {
    if (user) router.push(getDashboardRedirect(user.role));
  }, [user, router]);

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

  const handleMetaMaskLogin = async () => {
    setError("");
    if (typeof window === "undefined" || !(window as any).ethereum) {
      setError("Vui lòng cài đặt MetaMask để đăng nhập bằng ví");
      return;
    }

    setIsWalletSubmitting(true);
    try {
      const provider = new BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const walletAddress = await signer.getAddress();

      const { message, tempToken } = await authApi.getMetaMaskNonce(walletAddress);
      const signature = await signer.signMessage(message);
      const result = await loginWithMetaMask(walletAddress, signature, tempToken);

      if (!result.success) {
        setError(result.error || "Xác thực ví thất bại");
      }
    } catch (err: any) {
      setError(err?.message || "Kết nối ví thất bại");
    } finally {
      setIsWalletSubmitting(false);
    }
  };

  return (
    <div className={styles._1}>
      <div className={styles._2}>
        <div className={styles._3}>
          <a href="/" className={styles._4}>
            <div className={styles._5}>C</div>
            <span className={styles._6}>CertiChain</span>
          </a>
          <LanguageSwitcher />
        </div>
        <div className={styles._7}>
          <h1 className={styles._8}>{t("auth.login_title")}</h1>
          <p className={styles._9}>{t("auth.login_subtitle")}</p>
        </div>

        {error && <div className={styles._10}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles._11}>
          <div>
            <label className={styles._12}>{t("auth.email")}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles._13}
              placeholder="admin@truonghoc.edu.vn"
              autoComplete="email"
            />
          </div>

          <div>
            <label className={styles._12}>{t("auth.password")}</label>
            <div className={styles._14}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles._13}
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={styles._15}
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg className={styles._16} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className={styles._16} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className={styles._17}>
            <Link href="/auth/forgot-password" className={styles._18}>
              {t("auth.forgot_password")}
            </Link>
          </div>

          <Button type="submit" variant="primary" size="md" className="w-full" disabled={isSubmitting || isWalletSubmitting}>
            {isSubmitting ? t("auth.loading") : t("auth.login_btn")}
          </Button>
        </form>

        <div className={styles._19}>
          <span className={styles._20} />
          <span className={styles._21}>{t("auth.or")}</span>
          <span className={styles._20} />
        </div>

        <button
          onClick={handleMetaMaskLogin}
          disabled={isSubmitting || isWalletSubmitting}
          className={styles._22}
        >
          <svg className={styles._23} viewBox="0 0 256 238" fill="none">
            <path d="M247.9 104.8l-15-46.7-56-42.5-44.5 59 4.3.4 35.3-32.9L247.9 104.8z" fill="#E2761B"/>
            <path d="M8.1 104.8l15-46.7 56-42.5 44.5 59-4.3.4-35.3-32.9L8.1 104.8z" fill="#E4761B"/>
            <path d="M174.5 130.6l-20.2 38.6-26.3-5-26.3 5-20.2-38.6 30.2 5.5 16.3-26.8 16.3 26.8 30.2-5.5z" fill="#233447"/>
            <path d="M128 221.3l52.5-47.5-31.5-5.7-21 21.2-21-21.2-31.5 5.7 52.5 47.5z" fill="#E2761B"/>
            <path d="M128 75l-16.3 26.8 32.6 0L128 75z" fill="#F6851B"/>
          </svg>
          {t("auth.metamask")}
        </button>

        <p className={styles._24}>
          {t("auth.no_account")}{" "}
          <Link href="/auth/register" className={styles._25}>
            {t("auth.register_link")}
          </Link>
        </p>
      </div>
    </div>
  );
}
