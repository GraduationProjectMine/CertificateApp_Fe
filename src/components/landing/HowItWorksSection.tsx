"use client";

import React from "react";
import { useI18n } from "@/features/i18n/I18nContext";

const steps = [
  {
    step: "01", titleKey: "step1_title", descKey: "step1_desc",
    color: "text-primary", bg: "bg-primary-lighter dark:bg-primary/10", border: "hover:border-primary/30",
  },
  {
    step: "02", titleKey: "step2_title", descKey: "step2_desc",
    color: "text-secondary", bg: "bg-secondary-light dark:bg-secondary/10", border: "hover:border-secondary/30",
  },
  {
    step: "03", titleKey: "step3_title", descKey: "step3_desc",
    color: "text-primary", bg: "bg-primary-lighter dark:bg-primary/10", border: "hover:border-primary/30",
  },
];

export default function HowItWorksSection() {
  const { t } = useI18n();

  return (
    <section id="how-it-works" className="bg-slate-100 py-20 dark:bg-slate-950 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16" data-reveal>
          <p className="text-xs font-bold text-primary dark:text-teal-400 uppercase tracking-widest mb-4">
            {t("howItWorks.badge")}
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
            {t("howItWorks.title")}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-4">
            {t("howItWorks.desc")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((item) => (
            <div
              key={item.step}
              data-reveal
              className={`group rounded-xl border border-slate-200 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-md dark:border-white/10 dark:bg-white/[0.03] ${item.border}`}
            >
              <div className={`w-12 h-12 rounded-xl ${item.bg} ${item.color} flex items-center justify-center font-bold text-lg mb-5 group-hover:scale-110 transition-transform`}>
                {item.step}
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                {t("howItWorks." + item.titleKey)}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                {t("howItWorks." + item.descKey)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
