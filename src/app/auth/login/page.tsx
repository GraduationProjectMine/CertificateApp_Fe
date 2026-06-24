"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../features/auth/components/AuthContext";
import Button from "@/components/ui/button";

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
  if (normalizedRole === "institution_admin" || normalizedRole === "issuer") {
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
      setError("Không thể khởi tạo đăng nhập Google");
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
    <main className="relative min-h-[100dvh] overflow-hidden bg-slate-50 text-slate-950 dark:bg-[#030712] dark:text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_12%,rgba(20,184,166,0.18),transparent_30%),radial-gradient(circle_at_82%_18%,rgba(37,99,235,0.16),transparent_26%),linear-gradient(180deg,transparent,rgba(15,23,42,0.04))] dark:bg-[radial-gradient(circle_at_20%_12%,rgba(20,184,166,0.22),transparent_30%),radial-gradient(circle_at_82%_18%,rgba(37,99,235,0.18),transparent_26%),linear-gradient(180deg,transparent,rgba(15,23,42,0.78))]" />
      <div className="absolute inset-0 opacity-[0.22] dark:opacity-[0.16] bg-[linear-gradient(to_right,#94a3b810_1px,transparent_1px),linear-gradient(to_bottom,#94a3b810_1px,transparent_1px)] bg-[size:28px_28px]" />

      <div className="relative mx-auto grid min-h-[100dvh] max-w-7xl grid-cols-1 items-center gap-8 px-4 py-4 sm:px-6 lg:grid-cols-[1fr_440px] lg:px-8">
        <section className="hidden lg:flex min-h-[660px] flex-col justify-between rounded-[1.5rem] border border-white/10 bg-slate-950 p-8 text-white shadow-2xl shadow-slate-950/25 overflow-hidden">
          <div className="absolute left-10 top-10 h-36 w-36 rounded-full bg-teal-400/20 blur-3xl motion-float" />
          <div className="absolute bottom-16 right-20 h-44 w-44 rounded-full bg-blue-500/20 blur-3xl motion-float-slow" />

          <Link href="/" className="relative z-10 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-500 text-lg font-black text-white shadow-lg shadow-teal-500/25">
              C
            </span>
            <span className="text-lg font-bold tracking-tight">CertiChain</span>
          </Link>

          <div className="relative z-10 max-w-xl" data-reveal>
            <p className="mb-5 inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-teal-200">
              Bảo mật danh tính học thuật
            </p>
            <h1 className="max-w-lg text-4xl font-black leading-[1.04] tracking-tight">
              Truy cập hệ thống cấp phát văn bằng số.
            </h1>
            <p className="mt-5 max-w-md text-sm leading-7 text-slate-400">
              Quản trị, cấp bằng, xác minh và theo dõi dữ liệu blockchain từ một không gian làm việc thống nhất.
            </p>
          </div>

          <div className="relative z-10 grid grid-cols-3 gap-3 text-xs text-slate-400" data-reveal>
            {["Ví điện tử", "Google OAuth", "JWT bảo vệ"].map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <span className="block h-1.5 w-8 rounded-full bg-teal-400" />
                <span className="mt-3 block font-semibold text-slate-200">{item}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-md lg:max-w-none" data-reveal>
          <div className="mb-5 flex items-center justify-between lg:hidden">
            <Link href="/" className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-base font-black text-white">
                C
              </span>
              <span className="font-bold">CertiChain</span>
            </Link>
            <Link href="/" className="text-sm font-semibold text-slate-500 hover:text-primary dark:text-slate-400">
              Trang chủ
            </Link>
          </div>

          <div className="rounded-[1.5rem] border border-white/70 bg-white/85 p-5 shadow-2xl shadow-slate-200/80 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/72 dark:shadow-black/30 sm:p-6">
            <div className="mb-5">
              <p className="text-sm font-semibold text-primary dark:text-teal-300">
                Đăng nhập tài khoản
              </p>
              <h2 className="mt-1.5 text-2xl font-black tracking-tight text-slate-950 dark:text-white">
                Chào mừng trở lại
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                Sử dụng email trường học, Google hoặc ví MetaMask đã liên kết.
              </p>
            </div>

            {error && (
              <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300" data-reveal>
                {error}
              </div>
            )}

            <form className="space-y-3.5" onSubmit={handleSubmit}>
              <label className="block">
                <span className="mb-2 block text-xs font-bold text-slate-600 dark:text-slate-300">
                  Email
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition-all placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-primary/10 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:focus:border-teal-300"
                  placeholder="admin@truonghoc.edu.vn"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-bold text-slate-600 dark:text-slate-300">
                  Mật khẩu
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition-all placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-primary/10 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:focus:border-teal-300"
                  placeholder="Nhập mật khẩu"
                />
              </label>

              <Button type="submit" disabled={isSubmitting} className="w-full h-11">
                {isSubmitting ? "Đang xử lý..." : "Đăng nhập"}
              </Button>
            </form>

            <div className="my-4 flex items-center gap-3">
              <span className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
              <span className="text-xs font-bold uppercase text-slate-400">Hoặc</span>
              <span className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
            </div>

            <div className="space-y-3">
              <div ref={googleBtnRef} className="flex min-h-10 justify-center" />
              <Button variant="secondary" type="button" onClick={handleMetaMask} disabled={isSubmitting} className="h-11 w-full gap-3 border-orange-300/50 bg-orange-50 text-orange-700 hover:border-orange-400 hover:bg-orange-100 dark:border-orange-400/20 dark:bg-orange-400/10 dark:text-orange-300 dark:hover:bg-orange-400/15">
                <span className="h-2.5 w-2.5 rounded-full bg-orange-500 shadow-[0_0_18px_rgba(249,115,22,0.65)]" />
                Kết nối ví MetaMask
              </Button>
            </div>

            <div className="mt-5 flex flex-col gap-1.5 text-center text-sm text-slate-500 dark:text-slate-400">
              <Button variant="ghost" href="/auth/register" className="text-primary dark:text-teal-300">
                Đăng ký tài khoản trường học
              </Button>
              <Link href="/auth/forgot-password" className="text-xs font-medium hover:text-slate-900 dark:hover:text-white">
                Quên mật khẩu?
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
