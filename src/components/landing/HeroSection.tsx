"use client";

import React from "react";
import Link from "next/link";
import { useI18n } from "@/features/i18n/I18nContext";

export default function HeroSection() {
  const { t } = useI18n();

  return (
    <section className="relative overflow-hidden bg-white pt-32 pb-20 dark:bg-[#030712] md:pt-44 md:pb-28">
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_right,#0f172a08_1px,transparent_1px),linear-gradient(to_bottom,#0f172a08_1px,transparent_1px)] bg-[size:40px_40px] dark:bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)]" />
      <div className="absolute inset-x-0 top-0 h-80 pointer-events-none bg-[radial-gradient(circle_at_78%_20%,rgba(245,158,11,0.15),transparent_32%),radial-gradient(circle_at_22%_18%,rgba(15,118,110,0.12),transparent_34%)] dark:bg-[radial-gradient(circle_at_78%_20%,rgba(245,158,11,0.12),transparent_30%),radial-gradient(circle_at_22%_18%,rgba(20,184,166,0.12),transparent_32%)]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          <div className="lg:col-span-7 text-center lg:text-left" data-reveal>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs font-semibold tracking-wide text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
              {t("hero.badge")}
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-gray-900 dark:text-white leading-[1.05] mb-6">
              {t("hero.title1")}
              <span className="block mt-2 gradient-text-premium">
                {t("hero.title2")}
              </span>
            </h1>

            <p className="max-w-xl text-lg text-gray-500 dark:text-gray-400 leading-relaxed mb-8">
              {t("hero.desc")}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Link
                href="/public/verify"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base font-semibold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/35 transition-all hover:scale-[1.02]"
              >
                {t("hero.cta_verify")}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/80 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm transition-all hover:scale-[1.02]"
              >
                {t("hero.cta_login")}
              </Link>
            </div>

            <p className="mt-4 text-xs text-gray-400 dark:text-gray-500">
              {t("hero.no_card")}
            </p>

            <div className="mt-12 grid w-full max-w-md grid-cols-3 gap-6 border-t border-slate-200 pt-8 dark:border-white/10 sm:gap-8">
              <div>
                <span className="block text-2xl font-bold text-gray-900 dark:text-white">100%</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{t("hero.stat1_label")}</span>
              </div>
              <div>
                <span className="block text-2xl font-bold text-gray-900 dark:text-white">&lt; 3s</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{t("hero.stat2_label")}</span>
              </div>
              <div>
                <span className="block text-2xl font-bold text-gray-900 dark:text-white">0₫</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{t("hero.stat3_label")}</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 flex justify-center" data-reveal>
            <div className="relative w-full max-w-sm">
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-slate-900/10 via-amber-400/10 to-emerald-500/10 blur-2xl dark:from-white/10 dark:via-amber-400/10 dark:to-teal-400/10" />
              <div className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/80 animate-float dark:border-white/10 dark:bg-slate-950 dark:shadow-black/30">
                <div className="absolute top-0 left-0 h-1.5 w-full rounded-t-2xl bg-gradient-to-r from-slate-900 via-emerald-600 to-amber-400 dark:from-slate-100 dark:via-teal-300 dark:to-amber-300" />

                <div className="flex items-center justify-between mb-5 mt-1">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950 flex items-center justify-center text-primary">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">ĐẠI HỌC BÁCH KHOA HÀ NỘI</p>
                      <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Hanoi University of S&amp;T</p>
                    </div>
                  </div>
                  <span className="rounded border border-emerald-200/70 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300">
                    On-chain
                  </span>
                </div>

                <div className="mb-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 py-3 text-center dark:border-white/10 dark:bg-white/[0.04]">
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Bằng Cử Nhân</p>
                  <p className="text-base font-bold text-gray-800 dark:text-white mt-1">CÔNG NGHỆ THÔNG TIN</p>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-medium">Sinh viên</p>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Nguyễn Hoàng Nam</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-medium">Xếp loại</p>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Xuất Sắc (3.82)</p>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-200 pt-3 dark:border-white/10">
                  <div>
                    <p className="text-[9px] text-gray-400 uppercase font-bold tracking-wider">Blockchain Hash</p>
                    <p className="text-[10px] font-mono text-primary dark:text-teal-400 truncate w-32">0x71C7...8976F</p>
                  </div>
                  <div className="flex gap-1">
                    <div className="w-7 h-7 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center">
                      <svg className="w-3.5 h-3.5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="7" height="7" rx="1" />
                        <rect x="14" y="3" width="7" height="7" rx="1" />
                        <rect x="3" y="14" width="7" height="7" rx="1" />
                        <rect x="14" y="14" width="7" height="7" rx="1" />
                      </svg>
                    </div>
                    <div className="w-7 h-7 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center">
                      <svg className="w-3.5 h-3.5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" d="M7 17l9.2-9.2M17 17V7H7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
