"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type VerifyMode = "code" | "qr";

function normalizeCode(value: string) {
  return value.trim().toUpperCase();
}

export default function VerifyPage() {
  const [mode, setMode] = useState<VerifyMode>("code");
  const [code, setCode] = useState("");
  const [submittedCode, setSubmittedCode] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const codeParam = params.get("code");
    if (codeParam) {
      const normalized = normalizeCode(codeParam);
      setCode(normalized);
      setSubmittedCode(normalized);
    }
  }, []);

  const mockStatus = useMemo(() => {
    if (!submittedCode) return null;
    return {
      code: submittedCode,
      status: "Hợp lệ",
      issuer: "Trường Đại học Bách Khoa Hà Nội",
      credential: "Bằng Cử Nhân Công Nghệ Thông Tin",
      issuedAt: "12/06/2026",
      chain: "Sepolia Testnet",
      hash: `0x${submittedCode.replace(/[^A-Z0-9]/g, "").slice(0, 8).padEnd(8, "0")}...A91F`,
    };
  }, [submittedCode]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    const normalized = normalizeCode(code);
    if (!normalized) {
      setError("Vui lòng nhập mã chứng chỉ hoặc mã băm.");
      return;
    }
    setSubmittedCode(normalized);
  };

  return (
    <main className="min-h-[100dvh] bg-slate-50 text-slate-950 dark:bg-[#030712] dark:text-white">
      <div className="border-b border-slate-200 bg-white/80 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-base font-black text-white">
              C
            </span>
            <span className="font-bold tracking-tight">CertiChain</span>
          </Link>
          <Link href="/auth/login" className="text-sm font-semibold text-slate-500 transition-colors hover:text-primary dark:text-slate-400 dark:hover:text-teal-300">
            Đăng nhập
          </Link>
        </div>
      </div>

      <section className="relative overflow-hidden py-12 md:py-16">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a08_1px,transparent_1px),linear-gradient(to_bottom,#0f172a08_1px,transparent_1px)] bg-[size:36px_36px] dark:bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)]" />
        <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
          <div className="pt-4" data-reveal>
            <p className="mb-4 inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300">
              Xác minh không cần đăng nhập
            </p>
            <h1 className="max-w-xl text-4xl font-black tracking-tight text-slate-950 dark:text-white sm:text-5xl">
              Kiểm tra tính xác thực của văn bằng số
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-7 text-slate-500 dark:text-slate-400">
              Nhập mã chứng chỉ, mã băm hoặc dùng QR in trên văn bằng. Trang này chỉ xác minh khi bạn đã có mã cụ thể, không hỗ trợ tìm kiếm theo tên, email hoặc mã sinh viên.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {["Có mã", "Có QR", "Có hash"].map((item) => (
                <div key={item} className="rounded-xl border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-700 shadow-sm dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-200">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div data-reveal className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-200/80 dark:border-white/10 dark:bg-slate-950/80 dark:shadow-black/30">
            <div className="mb-5 grid grid-cols-2 rounded-xl border border-slate-200 bg-slate-100 p-1 dark:border-white/10 dark:bg-white/[0.04]">
              {[
                ["code", "Nhập mã"],
                ["qr", "Quét QR"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setMode(value as VerifyMode)}
                  className={`h-10 rounded-lg text-sm font-bold transition-all ${
                    mode === value
                      ? "bg-white text-primary shadow-sm dark:bg-slate-950 dark:text-teal-300"
                      : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {mode === "code" ? (
              <form className="space-y-4" onSubmit={handleSubmit}>
                <label className="block">
                  <span className="mb-2 block text-xs font-bold text-slate-600 dark:text-slate-300">
                    Mã chứng chỉ hoặc hash
                  </span>
                  <input
                    value={code}
                    onChange={(event) => setCode(event.target.value)}
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 font-mono text-sm text-slate-950 outline-none transition-all placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-primary/10 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:focus:border-teal-300"
                    placeholder="CERT-2026-8F2A"
                  />
                </label>

                {error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
                    {error}
                  </div>
                )}

                <button className="h-12 w-full rounded-xl bg-primary px-5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary-hover hover:scale-[1.01]">
                  Xác minh
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="grid place-items-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 dark:border-white/10 dark:bg-white/[0.03]">
                  <div className="grid h-36 w-36 grid-cols-6 gap-1 rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-950">
                    {Array.from({ length: 36 }).map((_, index) => (
                      <span
                        key={index}
                        className={`rounded-[2px] ${
                          [0, 1, 2, 5, 6, 8, 11, 12, 15, 18, 20, 21, 23, 25, 28, 30, 31, 35].includes(index)
                            ? "bg-slate-950 dark:bg-white"
                            : "bg-slate-200 dark:bg-white/20"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm leading-7 text-slate-500 dark:text-slate-400">
                  Bản demo này chưa mở camera trực tiếp. Trên bản hoàn chỉnh, nút quét QR sẽ xin quyền camera tại trang xác minh, hoặc người dùng có thể nhập mã nằm dưới QR.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {mockStatus && (
        <section className="pb-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div data-reveal className="grid gap-5 rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-400/20 dark:bg-emerald-400/10 lg:grid-cols-[0.8fr_1.2fr]">
              <div>
                <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">Kết quả xác minh</p>
                <h2 className="mt-2 text-3xl font-black text-slate-950 dark:text-white">{mockStatus.status}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                  Đây là giao diện minh họa kết quả. Khi nối API thật, dữ liệu sẽ lấy từ cơ sở dữ liệu và bằng chứng on-chain.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  ["Mã", mockStatus.code],
                  ["Đơn vị cấp", mockStatus.issuer],
                  ["Văn bằng", mockStatus.credential],
                  ["Ngày cấp", mockStatus.issuedAt],
                  ["Mạng", mockStatus.chain],
                  ["Hash", mockStatus.hash],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl border border-white/70 bg-white/80 p-4 dark:border-white/10 dark:bg-slate-950/60">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">{label}</p>
                    <p className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-100">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
