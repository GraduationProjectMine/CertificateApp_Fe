"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useI18n } from "@/features/i18n/I18nContext";

export default function VerifyTeaserSection() {
  const { t } = useI18n();
  const [certificateCode, setCertificateCode] = useState("");

  const verifyHref = useMemo(() => {
    const trimmed = certificateCode.trim();
    if (!trimmed) return "/public/verify";
    return `/public/verify?code=${encodeURIComponent(trimmed)}`;
  }, [certificateCode]);

  return (
    <section id="verify" className="border-y border-slate-200 bg-white py-16 dark:border-white/10 dark:bg-[#030712]">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div data-reveal>
          <p className="mb-4 text-xs font-bold uppercase tracking-widest text-primary dark:text-teal-400">
            {t("verifyTeaser.badge")}
          </p>
          <h2 className="max-w-xl text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
            {t("verifyTeaser.title")}
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-7 text-slate-500 dark:text-slate-400">
            {t("verifyTeaser.desc")}
          </p>

          <div className="mt-7 grid gap-3 text-sm sm:grid-cols-3">
            {[
              t("verifyTeaser.point1"),
              t("verifyTeaser.point2"),
              t("verifyTeaser.point3"),
            ].map((item, index) => (
              <div key={item} className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                <span className="mb-3 flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 font-mono text-xs font-bold text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div data-reveal className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 shadow-xl shadow-slate-200/70 dark:border-white/10 dark:bg-white/[0.03] dark:shadow-black/20 sm:p-5">
          <div className="rounded-[1.25rem] border border-white bg-white p-5 dark:border-white/10 dark:bg-slate-950/80">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  {t("verifyTeaser.panelLabel")}
                </p>
                <h3 className="mt-2 text-xl font-black tracking-tight text-slate-950 dark:text-white">
                  {t("verifyTeaser.panelTitle")}
                </h3>
              </div>
              <div className="grid h-16 w-16 shrink-0 grid-cols-4 gap-1 rounded-xl border border-slate-200 bg-white p-2 dark:border-white/10 dark:bg-white/[0.04]">
                {Array.from({ length: 16 }).map((_, index) => (
                  <span
                    key={index}
                    className={`rounded-[2px] ${
                      [0, 1, 3, 4, 6, 9, 10, 12, 15].includes(index)
                        ? "bg-slate-900 dark:bg-white"
                        : "bg-slate-200 dark:bg-white/20"
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <label className="block">
                <span className="mb-2 block text-xs font-bold text-slate-600 dark:text-slate-300">
                  {t("verifyTeaser.inputLabel")}
                </span>
                <input
                  value={certificateCode}
                  onChange={(event) => setCertificateCode(event.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 font-mono text-sm text-slate-950 outline-none transition-all placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-primary/10 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:focus:border-teal-300"
                  placeholder="CERT-2026-8F2A"
                />
              </label>

              <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                <Link
                  href={verifyHref}
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary-hover hover:scale-[1.01]"
                >
                  {t("verifyTeaser.primaryCta")}
                </Link>
                <Link
                  href="/public/verify"
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 transition-all hover:border-primary/30 hover:text-primary dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:text-teal-300"
                >
                  {t("verifyTeaser.secondaryCta")}
                </Link>
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-medium leading-6 text-amber-800 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-200">
              {t("verifyTeaser.privacyNote")}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
