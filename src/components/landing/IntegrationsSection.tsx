"use client";

import React from "react";
import { useI18n } from "@/features/i18n/I18nContext";
import { integrations } from "./data";

export default function IntegrationsSection() {
  const { t } = useI18n();

  return (
    <section className="bg-slate-100 py-16 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div data-reveal>
        <p className="text-xs font-bold text-primary dark:text-teal-400 uppercase tracking-widest mb-4">
          {t("integrations.badge")}
        </p>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          {t("integrations.title")}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-10">
          {t("integrations.desc")}
        </p>
        </div>
        <div className="flex flex-wrap justify-center items-center gap-4">
          {integrations.map((name) => (
            <span
              key={name}
              data-reveal
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400"
            >
              {name}
            </span>
          ))}
        </div>
        <p className="mt-6 text-sm font-medium text-emerald-700 dark:text-emerald-300">
          {t("integrations.more")}
        </p>
      </div>
    </section>
  );
}
