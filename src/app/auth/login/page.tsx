"use client";
import styles from "./page.module.css";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../features/auth/components/AuthContext";
import { authApi } from "../../../features/auth/services/api";
import Button from "@/components/ui/Button";
import { BrowserProvider } from "ethers";

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
  const { user, login, loginWithMetaMask } = useAuth();
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
      setError("Không tìm thấy MetaMask. Vui lòng cài đặt tiện ích mở rộng MetaMask.");
      return;
    }

    setIsWalletSubmitting(true);
    try {
      const provider = new BrowserProvider((window as any).ethereum);
      
      // Request account access
      await provider.send("eth_requestAccounts", []);
      
      const signer = await provider.getSigner();
      const walletAddress = await signer.getAddress();

      // 1. Request Nonce
      const { message, tempToken } = await authApi.getMetaMaskNonce(walletAddress);

      // 2. Sign the message
      const signature = await signer.signMessage(message);

      // 3. Login with MetaMask
      const result = await loginWithMetaMask(walletAddress, signature, tempToken);
      if (!result.success) {
        setError(result.error || "Đăng nhập MetaMask thất bại");
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Lỗi kết nối hoặc chữ ký bị từ chối.");
    } finally {
      setIsWalletSubmitting(false);
    }
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
            {["JWT bảo vệ", "Tài khoản tổ chức", "Phiên đăng nhập"].map((item) => (
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
              <p className={styles._29}>Sử dụng email và mật khẩu đã được cấp trong hệ thống.</p>
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
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

              <Button type="submit" disabled={isSubmitting || isWalletSubmitting} className={styles._35}>
                {isSubmitting ? "Đang xử lý..." : "Đăng nhập"}
              </Button>
            </form>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
              <span className="flex-shrink mx-4 text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase">Hoặc</span>
              <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
            </div>

            <Button
              type="button"
              variant="secondary"
              disabled={isSubmitting || isWalletSubmitting}
              onClick={handleMetaMaskLogin}
              className="w-full flex items-center justify-center gap-2 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors py-2.5 rounded-lg"
            >
              <svg className="w-5 h-5 mr-1" viewBox="0 0 318.6 318.6" xmlns="http://www.w3.org/2000/svg">
                <path d="m274.1 35.5-99.5 73.9-29.3-51.5 89.2-22.3z" fill="#e2761b" stroke="#e2761b" strokeLinecap="round" strokeLinejoin="round" strokeWidth="6"/>
                <path d="m44.4 35.5 99.5 73.9 29.3-51.5-89.2-22.3z" fill="#e4761b" stroke="#e4761b" strokeLinecap="round" strokeLinejoin="round" strokeWidth="6"/>
                <path d="m251.8 165.4 22.3-94.4-99.5 73.9z" fill="#e4761b" stroke="#e4761b" strokeLinecap="round" strokeLinejoin="round" strokeWidth="6"/>
                <path d="m66.7 165.4-22.3-94.4 99.5 73.9z" fill="#e4761b" stroke="#e4761b" strokeLinecap="round" strokeLinejoin="round" strokeWidth="6"/>
                <path d="m123.6 152.4-56.9 13 25.1 27.2z" fill="#e4761b" stroke="#e4761b" strokeLinecap="round" strokeLinejoin="round" strokeWidth="6"/>
                <path d="m194.9 152.4 56.9 13-25.1 27.2z" fill="#e4761b" stroke="#e4761b" strokeLinecap="round" strokeLinejoin="round" strokeWidth="6"/>
                <path d="m78.7 186.4 75.3 47.7-41-11.3z" fill="#e4761b" stroke="#e4761b" strokeLinecap="round" strokeLinejoin="round" strokeWidth="6"/>
                <path d="m239.8 186.4-75.3 47.7 41-11.3z" fill="#e4761b" stroke="#e4761b" strokeLinecap="round" strokeLinejoin="round" strokeWidth="6"/>
                <path d="m113 222.8 46.2 59.8 46.2-59.8-46.2-7.8z" fill="#e4761b" stroke="#e4761b" strokeLinecap="round" strokeLinejoin="round" strokeWidth="6"/>
                <path d="m174.6 144.9 20.3 7.5-16.2 24.2z" fill="#d7c1b1" stroke="#d7c1b1" strokeLinecap="round" strokeLinejoin="round" strokeWidth="6"/>
                <path d="m143.9 144.9-20.3 7.5 16.2 24.2z" fill="#d7c1b1" stroke="#d7c1b1" strokeLinecap="round" strokeLinejoin="round" strokeWidth="6"/>
                <path d="m113 222.8 46.2-7.8-46.2-4.1z" fill="#233447" stroke="#233447" strokeLinecap="round" strokeLinejoin="round" strokeWidth="6"/>
                <path d="m205.5 222.8-46.2-7.8 46.2-4.1z" fill="#233447" stroke="#233447" strokeLinecap="round" strokeLinejoin="round" strokeWidth="6"/>
                <path d="m66.7 165.4 12 21 44.9-34-16.2-24.2z" fill="#cd6116" stroke="#cd6116" strokeLinecap="round" strokeLinejoin="round" strokeWidth="6"/>
                <path d="m251.8 165.4-12 21-44.9-34 16.2-24.2z" fill="#cd6116" stroke="#cd6116" strokeLinecap="round" strokeLinejoin="round" strokeWidth="6"/>
                <path d="m159.3 215 46.2 7.8 34.3-36.4-45.5-34z" fill="#cd6116" stroke="#cd6116" strokeLinecap="round" strokeLinejoin="round" strokeWidth="6"/>
                <path d="m159.3 215-46.2 7.8-34.3-36.4 45.5-34z" fill="#cd6116" stroke="#cd6116" strokeLinecap="round" strokeLinejoin="round" strokeWidth="6"/>
              </svg>
              {isWalletSubmitting ? "Đang kết nối ví..." : "Đăng nhập với MetaMask"}
            </Button>

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
