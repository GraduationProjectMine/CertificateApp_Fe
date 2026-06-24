"use client";

import React, { useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/button";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!email.trim()) {
      setError("Vui lòng nhập email tài khoản");
      return;
    }

    if (!isValidEmail(email.trim())) {
      setError("Email không hợp lệ");
      return;
    }

    setIsSubmitting(true);
    await new Promise((resolve) => window.setTimeout(resolve, 650));
    setIsSubmitting(false);
    setSuccess("Nếu email thuộc hệ thống, hướng dẫn đặt lại mật khẩu sẽ được gửi trong vài phút.");
  };

  return (
    <main className="auth-page-shell relative min-h-[100dvh] overflow-hidden bg-slate-50 text-slate-950 dark:bg-[#030712] dark:text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_16%,rgba(20,184,166,0.18),transparent_30%),radial-gradient(circle_at_84%_18%,rgba(245,158,11,0.13),transparent_26%),linear-gradient(180deg,transparent,rgba(15,23,42,0.04))] dark:bg-[radial-gradient(circle_at_18%_16%,rgba(20,184,166,0.2),transparent_30%),radial-gradient(circle_at_84%_18%,rgba(245,158,11,0.12),transparent_26%),linear-gradient(180deg,transparent,rgba(15,23,42,0.78))]" />
      <div className="absolute inset-0 opacity-[0.22] dark:opacity-[0.15] bg-[linear-gradient(to_right,#94a3b810_1px,transparent_1px),linear-gradient(to_bottom,#94a3b810_1px,transparent_1px)] bg-[size:28px_28px]" />

      <div className="relative mx-auto grid min-h-[100dvh] max-w-7xl grid-cols-1 items-center gap-8 px-4 py-4 sm:px-6 lg:grid-cols-[1fr_440px] lg:px-8">
        <section className="auth-visual-panel hidden min-h-[660px] flex-col justify-between overflow-hidden rounded-[1.5rem] border border-white/10 bg-slate-950 p-8 text-white shadow-2xl shadow-slate-950/25 lg:flex">
          <div className="absolute left-12 top-12 h-36 w-36 rounded-full bg-teal-400/20 blur-3xl motion-float" />
          <div className="absolute bottom-16 right-16 h-44 w-44 rounded-full bg-amber-400/15 blur-3xl motion-float-slow" />

          <Link href="/" className="relative z-10 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-500 text-lg font-black text-white shadow-lg shadow-teal-500/25">
              C
            </span>
            <span className="text-lg font-bold tracking-tight">CertiChain</span>
          </Link>

          <div className="relative z-10 max-w-xl" data-reveal>
            <p className="mb-5 inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-teal-200">
              Khôi phục quyền truy cập
            </p>
            <h1 className="max-w-lg text-4xl font-black leading-[1.04] tracking-tight">
              Lấy lại tài khoản quản trị một cách an toàn.
            </h1>
            <p className="mt-5 max-w-md text-sm leading-7 text-slate-400">
              Gửi yêu cầu đặt lại mật khẩu qua email đã đăng ký, sau đó quay lại hệ thống để tiếp tục cấp phát và xác minh văn bằng.
            </p>
          </div>

          <div className="relative z-10 grid grid-cols-3 gap-3 text-xs text-slate-400" data-reveal>
            {["Email xác minh", "Liên kết giới hạn", "Bảo vệ phiên"].map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <span className="block h-1.5 w-8 rounded-full bg-amber-300" />
                <span className="mt-3 block font-semibold text-slate-200">{item}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="auth-form-panel mx-auto w-full max-w-md lg:max-w-none" data-reveal>
          <div className="mb-5 flex items-center justify-between lg:hidden">
            <Link href="/" className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-base font-black text-white">
                C
              </span>
              <span className="font-bold">CertiChain</span>
            </Link>
            <Link href="/auth/login" className="auth-switch-link text-sm font-semibold text-slate-500 hover:text-primary dark:text-slate-400">
              Đăng nhập
            </Link>
          </div>

          <div className="auth-card-surface rounded-[1.5rem] border border-white/70 bg-white/85 p-5 shadow-2xl shadow-slate-200/80 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/72 dark:shadow-black/30 sm:p-6">
            <div className="mb-5">
              <p className="text-sm font-semibold text-primary dark:text-teal-300">
                Quên mật khẩu
              </p>
              <h2 className="mt-1.5 text-2xl font-black tracking-tight text-slate-950 dark:text-white">
                Nhận hướng dẫn đặt lại
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                Nhập email quản trị đã đăng ký. Hệ thống sẽ gửi hướng dẫn khôi phục nếu tài khoản tồn tại.
              </p>
            </div>

            {error && (
              <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300" data-reveal>
                {error}
              </div>
            )}

            {success && (
              <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300" data-reveal>
                {success}
              </div>
            )}

            <form className="space-y-3.5" onSubmit={handleSubmit}>
              <label className="block">
                <span className="mb-2 block text-xs font-bold text-slate-600 dark:text-slate-300">
                  Email tài khoản
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

              <Button type="submit" disabled={isSubmitting} className="h-11 w-full">
                {isSubmitting ? "Đang gửi..." : "Gửi hướng dẫn khôi phục"}
              </Button>
            </form>

            <div className="mt-5 flex flex-col gap-1.5 text-center text-sm text-slate-500 dark:text-slate-400">
              <Button variant="ghost" href="/auth/login" className="auth-switch-link text-primary dark:text-teal-300">
                Quay lại đăng nhập
              </Button>
              <Button variant="ghost" href="/auth/register" className="auth-switch-link text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-teal-300">
                Chưa có tài khoản trường học?
              </Button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
