"use client";

import React, { useState } from "react";
import { useI18n } from "@/features/i18n/I18nContext";
import { faqs } from "./data";

export default function FaqSection() {
  const { t } = useI18n();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <section className="border-y border-slate-200 bg-white py-20 dark:border-white/10 dark:bg-[#030712] md:py-28">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12" data-reveal>
          <p className="text-xs font-bold text-primary dark:text-teal-400 uppercase tracking-widest mb-4">
            {t("faq.badge")}
          </p>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t("faq.title")}
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              data-reveal
              className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/[0.03]"
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between gap-4 p-5 text-left"
              >
                <span className="text-sm font-semibold text-gray-900 dark:text-white">{faq.q}</span>
                <svg
                  className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-200 ${openFaq === i ? "rotate-180" : ""}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openFaq === i && (
                <div className="px-5 pb-5 animate-fadeIn">
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
