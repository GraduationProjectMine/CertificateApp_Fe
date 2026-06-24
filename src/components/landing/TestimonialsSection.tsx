"use client";

import React from "react";
import { useI18n } from "@/features/i18n/I18nContext";
import { testimonials } from "./data";

export default function TestimonialsSection() {
  const { t } = useI18n();

  return (
    <section className="border-y border-slate-200 bg-white py-16 dark:border-white/10 dark:bg-[#030712]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12" data-reveal>
          <p className="text-xs font-bold text-primary dark:text-teal-400 uppercase tracking-widest mb-4">
            {t("testimonials.badge")}
          </p>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t("testimonials.title")}
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((item) => (
            <div key={item.author} data-reveal className="rounded-xl border border-slate-200 bg-slate-50 p-6 dark:border-white/10 dark:bg-white/[0.03]">
              <svg className="mb-3 h-8 w-8 text-amber-400/50 dark:text-amber-300/30" fill="currentColor" viewBox="0 0 32 32">
                <path d="M10 8c-3.3 0-6 2.7-6 6v10h10V14H8c0-1.1.9-2 2-2V8zm16 0c-3.3 0-6 2.7-6 6v10h10V14h-6c0-1.1.9-2 2-2V8z" />
              </svg>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                {item.quote}
              </p>
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{item.author}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">{item.role}, {item.org}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
