"use client";

import React from "react";
import Link from "next/link";
import { useI18n } from "@/features/i18n/I18nContext";

export default function CtaSection() {
  const { t } = useI18n();

  return (
    <section className="border-t border-slate-200 bg-slate-950 py-16 dark:border-white/10 dark:bg-black">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center" data-reveal>
        <h2 className="text-3xl sm:text-4xl font-bold text-white dark:text-white mb-4">
          {t("cta.title")}
        </h2>
        <p className="mx-auto mb-8 max-w-2xl text-slate-300">
          {t("cta.desc")}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/auth/register"
            className="rounded-xl bg-white px-8 py-3.5 font-bold text-slate-950 shadow-lg shadow-black/10 transition-all hover:scale-[1.02] hover:bg-slate-100"
          >
            {t("cta.btn1")}
          </Link>
          <Link
            href="/public/verify"
            className="rounded-xl border border-white/20 bg-white/10 px-8 py-3.5 font-semibold text-white transition-all hover:scale-[1.02] hover:bg-white/20"
          >
            {t("cta.btn2")}
          </Link>
        </div>
      </div>
    </section>
  );
}
