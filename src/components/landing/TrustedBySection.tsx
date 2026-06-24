"use client";

import React from "react";
import { useI18n } from "@/features/i18n/I18nContext";

export default function TrustedBySection() {
  const { t } = useI18n();

  return (
    <section className="border-y border-slate-200 bg-slate-100/80 py-14 dark:border-white/10 dark:bg-slate-950/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="mb-8 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {t("trusted.title")}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-3 sm:gap-x-5">
          {["ĐH Bách Khoa HN", "ĐH Kinh tế QD", "ĐH Quốc gia HN", "ĐH FPT", "ĐH RMIT", "Vietcombank", "FPT", "VNG"].map((name) => (
            <span key={name} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold tracking-wide text-slate-500 shadow-sm shadow-slate-200/60 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-400 dark:shadow-none">
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
