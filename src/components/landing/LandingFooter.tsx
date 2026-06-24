"use client";

import React from "react";
import { useI18n } from "@/features/i18n/I18nContext";

export default function LandingFooter() {
  const { t } = useI18n();

  return (
    <footer className="bg-gray-900 dark:bg-black text-gray-400 py-16 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2 md:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-bold text-sm">
                C
              </div>
              <span className="font-bold text-white text-base">CertiChain</span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              {t("footer.tagline")}
            </p>
          </div>

          <div>
            <h5 className="font-bold text-gray-200 text-sm mb-4">{t("footer.solutions")}</h5>
            <ul className="space-y-2 text-xs">
              <li><a href="#" className="hover:text-white transition-colors">{t("footer.for_university")}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t("footer.for_employer")}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t("footer.for_student")}</a></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-gray-200 text-sm mb-4">{t("footer.features_title")}</h5>
            <ul className="space-y-2 text-xs">
              <li><a href="#" className="hover:text-white transition-colors">{t("footer.feat_certificates")}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t("footer.feat_verify")}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t("footer.feat_analytics")}</a></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-gray-200 text-sm mb-4">{t("footer.resources")}</h5>
            <ul className="space-y-2 text-xs">
              <li><a href="#" className="hover:text-white transition-colors">{t("footer.blog")}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t("footer.api_docs")}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t("footer.knowledge")}</a></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-gray-200 text-sm mb-4">{t("footer.company")}</h5>
            <ul className="space-y-2 text-xs">
              <li><a href="#" className="hover:text-white transition-colors">{t("footer.about")}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t("footer.contact")}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t("footer.security")}</a></li>
            </ul>
          </div>
        </div>

        <hr className="border-gray-800 my-8" />

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-600">
          <span>&copy; 2026 CertiChain. {t("footer.copyright")}</span>
          <div className="flex gap-6">
            <a href="#" className="hover:text-gray-400 transition-colors">{t("footer.terms")}</a>
            <a href="#" className="hover:text-gray-400 transition-colors">{t("footer.privacy")}</a>
            <a href="#" className="hover:text-gray-400 transition-colors">{t("footer.cookie")}</a>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-4 text-[10px] text-gray-600">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500" /> ISO 27001
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500" /> GDPR
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-teal-500" /> SOC 2
          </span>
        </div>
      </div>
    </footer>
  );
}
