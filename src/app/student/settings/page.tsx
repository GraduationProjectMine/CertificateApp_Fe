"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/components/AuthContext";
import { useI18n } from "@/features/i18n/I18nContext";

export default function SettingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { locale, toggleLocale, t } = useI18n();

  const sections = [
    {
      title: t("dashboard.settings.accountInfo"),
      items: [
        { label: t("dashboard.studentNav.profile"), desc: "Cập nhật thông tin cá nhân của bạn", href: "/student/profile" },
        { label: "Đổi mật khẩu", desc: "Thay đổi mật khẩu đăng nhập", href: "/student/profile/change-password" },
      ],
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{t("dashboard.settings.title")}</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t("dashboard.settings.subtitle")}</p>
      </div>

      {/* Language Preference Card */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800/60 rounded-3xl p-5 text-sm space-y-4 shadow-2xs">
        <h3 className="text-xs font-bold uppercase text-gray-400 dark:text-gray-500 tracking-wider flex items-center gap-2">
          <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
          </svg>
          {t("dashboard.settings.languageTitle")}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {t("dashboard.settings.languageDesc")}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            onClick={() => locale !== "vi" && toggleLocale()}
            className={`p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${
              locale === "vi"
                ? "border-primary bg-primary/5 dark:bg-primary/10 ring-1 ring-primary"
                : "border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 hover:border-gray-300"
            }`}
          >
            <div>
              <span className="font-bold text-xs text-gray-900 dark:text-white block">🇻🇳 {t("dashboard.settings.vietnamese")}</span>
              <span className="text-[11px] text-gray-500 dark:text-gray-400 block mt-0.5">Giao diện Tiếng Việt</span>
            </div>
            {locale === "vi" && (
              <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                ✓ {t("dashboard.settings.active")}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => locale !== "en" && toggleLocale()}
            className={`p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${
              locale === "en"
                ? "border-primary bg-primary/5 dark:bg-primary/10 ring-1 ring-primary"
                : "border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 hover:border-gray-300"
            }`}
          >
            <div>
              <span className="font-bold text-xs text-gray-900 dark:text-white block">🇬🇧 {t("dashboard.settings.english")}</span>
              <span className="text-[11px] text-gray-500 dark:text-gray-400 block mt-0.5">English interface</span>
            </div>
            {locale === "en" && (
              <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                ✓ {t("dashboard.settings.active")}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800/60 rounded-3xl p-5 text-sm space-y-3">
        <h3 className="text-xs font-bold uppercase text-gray-400 dark:text-gray-500 tracking-wider">{t("dashboard.settings.accountInfo")}</h3>
        <dl className="space-y-2">
          <div className="flex justify-between">
            <dt className="text-gray-500 dark:text-gray-400 text-xs">{t("dashboard.settings.name")}</dt>
            <dd className="font-medium text-gray-900 dark:text-white text-xs">{user?.name}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500 dark:text-gray-400 text-xs">{t("dashboard.settings.email")}</dt>
            <dd className="font-medium text-gray-900 dark:text-white text-xs">{user?.email}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500 dark:text-gray-400 text-xs">{t("dashboard.settings.role")}</dt>
            <dd className="font-medium text-gray-900 dark:text-white text-xs">{t("dashboard.settings.studentRole")}</dd>
          </div>
        </dl>
      </div>

      {sections.map((section) => (
        section.items.length > 0 && (
          <div key={section.title} className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800/60 rounded-3xl overflow-hidden">
            <div className="px-5 pt-4 pb-2">
              <h3 className="text-xs font-bold uppercase text-gray-400 dark:text-gray-500 tracking-wider">{section.title}</h3>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-800/60">
              {section.items.map((item) => (
                <button
                  key={item.label}
                  onClick={() => router.push(item.href)}
                  className="w-full flex items-center justify-between px-5 py-3.5 text-left hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-all"
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.label}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.desc}</p>
                  </div>
                  <svg className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        )
      ))}
    </div>
  );
}