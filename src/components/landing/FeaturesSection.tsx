"use client";

import React from "react";
import { useI18n } from "@/features/i18n/I18nContext";
import { integrations } from "./data";

export default function FeaturesSection() {
  const { t, tArr } = useI18n();

  return (
    <section id="features" className="bg-white py-20 dark:bg-[#030712] md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-xs font-bold text-primary dark:text-teal-400 uppercase tracking-widest mb-4">
            {t("features.badge")}
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
            {t("features.title")}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-4 max-w-2xl mx-auto">
            {t("features.desc")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(tArr("features.items") as { title: string; desc: string; tag: string }[]).map((f, idx) => (
            <div
              key={idx}
              className="group rounded-xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/50 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-lg hover:shadow-slate-200/80 dark:border-white/10 dark:bg-white/[0.03] dark:shadow-none dark:hover:border-emerald-400/30"
            >
              <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold transition-transform group-hover:scale-110 ${idx % 3 === 1 ? "bg-amber-50 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300" : idx % 3 === 2 ? "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200" : "bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300"}`}>
                {String(idx + 1).padStart(2, "0")}
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                {f.title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-4">
                {f.desc}
              </p>
              <p className="font-mono text-xs font-medium text-slate-500 dark:text-slate-400">
                {f.tag}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-gray-400 dark:text-gray-500">
            {t("features.integrations")}:{" "}
            {integrations.slice(0, 4).join(" • ")}{" "}
            <span className="font-medium text-emerald-700 dark:text-emerald-300">{t("features.integrations_more")}</span>
          </p>
        </div>
      </div>
    </section>
  );
}
