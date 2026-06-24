"use client";

import React from "react";
import { useI18n } from "@/features/i18n/I18nContext";

export default function StatsSection() {
  const { t } = useI18n();

  return (
    <section className="border-y border-slate-200 bg-[linear-gradient(135deg,#f8fafc_0%,#eef2f7_52%,#fff7ed_100%)] py-16 dark:border-white/10 dark:bg-[linear-gradient(135deg,#030712_0%,#0f172a_55%,#1c1917_100%)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-4 text-center md:grid-cols-3">
          <div data-reveal className="rounded-xl border border-slate-200 bg-white/80 p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
            <p className="text-4xl font-bold text-gray-900 dark:text-white">8K+</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t("stats.issued")}</p>
          </div>
          <div data-reveal className="rounded-xl border border-slate-200 bg-white/80 p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
            <p className="text-4xl font-bold text-gray-900 dark:text-white">34%</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t("stats.engagement")}</p>
          </div>
          <div data-reveal className="rounded-xl border border-slate-200 bg-white/80 p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
            <p className="text-4xl font-bold text-gray-900 dark:text-white">&lt; 24h</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t("stats.response")}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
