"use client";

import React, { useState } from "react";
import Link from "next/link";
import { authApi } from "../../../features/auth/services/api";
import Button from "@/components/ui/button";

type RegisterForm = {
  institutionName: string;
  institutionCode: string;
  email: string;
  adminName: string;
  password: string;
  confirmPassword: string;
};

const initialForm: RegisterForm = {
  institutionName: "",
  institutionCode: "",
  email: "",
  adminName: "",
  password: "",
  confirmPassword: "",
};

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Đăng ký thất bại";
}

export default function RegisterPage() {
  const [form, setForm] = useState<RegisterForm>(initialForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((previous) => ({
      ...previous,
      [name]: name === "institutionCode" ? value.toUpperCase() : value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (form.password !== form.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await authApi.registerInstitution({
        institutionName: form.institutionName,
        institutionCode: form.institutionCode.toUpperCase(),
        email: form.email,
        adminName: form.adminName,
        password: form.password,
      });
      setSuccess(result.message || "Đăng ký thành công. Vui lòng chờ Super Admin phê duyệt.");
      setForm(initialForm);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-[100dvh] overflow-hidden bg-slate-50 text-slate-950 dark:bg-[#030712] dark:text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(15,118,110,0.18),transparent_30%),radial-gradient(circle_at_86%_12%,rgba(37,99,235,0.14),transparent_28%),linear-gradient(180deg,transparent,rgba(15,23,42,0.05))] dark:bg-[radial-gradient(circle_at_18%_20%,rgba(20,184,166,0.22),transparent_30%),radial-gradient(circle_at_86%_12%,rgba(37,99,235,0.2),transparent_28%),linear-gradient(180deg,transparent,rgba(15,23,42,0.76))]" />
      <div className="absolute inset-0 opacity-[0.2] dark:opacity-[0.14] bg-[linear-gradient(to_right,#94a3b812_1px,transparent_1px),linear-gradient(to_bottom,#94a3b812_1px,transparent_1px)] bg-[size:28px_28px]" />

      <div className="relative mx-auto grid min-h-[100dvh] max-w-7xl grid-cols-1 items-center gap-8 px-4 py-4 sm:px-6 lg:grid-cols-[0.88fr_1.12fr] lg:px-8">
        <section className="hidden lg:flex min-h-[660px] flex-col justify-between overflow-hidden rounded-[1.5rem] border border-white/10 bg-slate-950 p-8 text-white shadow-2xl shadow-slate-950/25">
          <div className="absolute left-16 top-16 h-36 w-36 rounded-full bg-teal-400/20 blur-3xl motion-float" />
          <div className="absolute bottom-24 right-14 h-48 w-48 rounded-full bg-blue-500/20 blur-3xl motion-float-slow" />

          <Link href="/" className="relative z-10 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-500 text-lg font-black text-white shadow-lg shadow-teal-500/25">
              C
            </span>
            <span className="text-lg font-bold tracking-tight">CertiChain</span>
          </Link>

          <div className="relative z-10 max-w-xl" data-reveal>
            <p className="mb-5 inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-teal-200">
              Khởi tạo tổ chức phát hành
            </p>
            <h1 className="max-w-xl text-4xl font-black leading-[1.04] tracking-tight">
              Một tài khoản cho toàn bộ quy trình cấp bằng.
            </h1>
            <p className="mt-5 max-w-md text-sm leading-7 text-slate-400">
              Gửi yêu cầu đăng ký trường học, chờ phê duyệt và nhận hợp đồng thông minh riêng cho tổ chức.
            </p>
          </div>

          <div className="relative z-10 grid grid-cols-3 gap-3 text-xs" data-reveal>
            {[
              ["01", "Xác thực trường"],
              ["02", "Tạo ví tổ chức"],
              ["03", "Deploy contract"],
            ].map(([step, label]) => (
              <div key={step} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <span className="font-mono text-teal-300">{step}</span>
                <span className="mt-3 block font-semibold text-slate-200">{label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-2xl" data-reveal>
          <div className="mb-5 flex items-center justify-between lg:hidden">
            <Link href="/" className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-base font-black text-white">
                C
              </span>
              <span className="font-bold">CertiChain</span>
            </Link>
            <Link href="/auth/login" className="text-sm font-semibold text-slate-500 hover:text-primary dark:text-slate-400">
              Đăng nhập
            </Link>
          </div>

          <div className="rounded-[1.5rem] border border-white/70 bg-white/85 p-5 shadow-2xl shadow-slate-200/80 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/72 dark:shadow-black/30 sm:p-6">
            <div className="mb-5">
              <p className="text-sm font-semibold text-primary dark:text-teal-300">
                Đăng ký trường học
              </p>
              <h2 className="mt-1.5 text-2xl font-black tracking-tight text-slate-950 dark:text-white">
                Tạo hồ sơ tổ chức
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                Thông tin này giúp Super Admin xác minh trường và cấp quyền phát hành văn bằng số.
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

            <form className="grid grid-cols-1 gap-3.5 sm:grid-cols-2" onSubmit={handleSubmit}>
              <label className="block sm:col-span-2">
                <span className="mb-2 block text-xs font-bold text-slate-600 dark:text-slate-300">
                  Tên trường / Học viện
                </span>
                <input
                  type="text"
                  name="institutionName"
                  value={form.institutionName}
                  onChange={handleChange}
                  required
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition-all placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-primary/10 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:focus:border-teal-300"
                  placeholder="Trường Đại học Bách Khoa Hà Nội"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-bold text-slate-600 dark:text-slate-300">
                  Mã trường
                </span>
                <input
                  type="text"
                  name="institutionCode"
                  value={form.institutionCode}
                  onChange={handleChange}
                  required
                  maxLength={20}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm uppercase text-slate-950 outline-none transition-all placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-primary/10 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:focus:border-teal-300"
                  placeholder="HUST"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-bold text-slate-600 dark:text-slate-300">
                  Tên quản trị
                </span>
                <input
                  type="text"
                  name="adminName"
                  value={form.adminName}
                  onChange={handleChange}
                  required
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition-all placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-primary/10 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:focus:border-teal-300"
                  placeholder="Nguyễn Văn A"
                />
              </label>

              <label className="block sm:col-span-2">
                <span className="mb-2 block text-xs font-bold text-slate-600 dark:text-slate-300">
                  Email quản trị
                </span>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition-all placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-primary/10 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:focus:border-teal-300"
                  placeholder="admin@hust.edu.vn"
                />
                <span className="mt-1.5 block text-xs text-slate-400">
                  Không dùng email cá nhân như Gmail, Yahoo hoặc Outlook.
                </span>
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-bold text-slate-600 dark:text-slate-300">
                  Mật khẩu
                </span>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  minLength={8}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition-all placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-primary/10 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:focus:border-teal-300"
                  placeholder="Tối thiểu 8 ký tự"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-bold text-slate-600 dark:text-slate-300">
                  Xác nhận mật khẩu
                </span>
                <input
                  type="password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition-all placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-primary/10 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:focus:border-teal-300"
                  placeholder="Nhập lại mật khẩu"
                />
              </label>

              <Button type="submit" disabled={isSubmitting} className="w-full h-11 sm:col-span-2">
                {isSubmitting ? "Đang gửi..." : "Gửi yêu cầu đăng ký"}
              </Button>
            </form>

            <div className="mt-5 text-center text-sm text-slate-500 dark:text-slate-400">
              Đã có tài khoản?{" "}
              <Button variant="ghost" href="/auth/login" className="text-primary dark:text-teal-300">
                Đăng nhập
              </Button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
