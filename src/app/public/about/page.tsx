"use client";
import React from "react";
import styles from "./page.module.css";
import { useI18n } from "@/features/i18n/I18nContext";

export default function ComparisonPage() {
  const { t } = useI18n();
  const comparisons = [
    { criteria: t("public.about.comparison.0.criteria"), traditional: t("public.about.comparison.0.traditional"), blockchain: t("public.about.comparison.0.blockchain") },
    { criteria: t("public.about.comparison.1.criteria"), traditional: t("public.about.comparison.1.traditional"), blockchain: t("public.about.comparison.1.blockchain") },
    { criteria: t("public.about.comparison.2.criteria"), traditional: t("public.about.comparison.2.traditional"), blockchain: t("public.about.comparison.2.blockchain") },
    { criteria: t("public.about.comparison.3.criteria"), traditional: t("public.about.comparison.3.traditional"), blockchain: t("public.about.comparison.3.blockchain") },
    { criteria: t("public.about.comparison.4.criteria"), traditional: t("public.about.comparison.4.traditional"), blockchain: t("public.about.comparison.4.blockchain") },
    { criteria: t("public.about.comparison.5.criteria"), traditional: t("public.about.comparison.5.traditional"), blockchain: t("public.about.comparison.5.blockchain") },
    { criteria: t("public.about.comparison.6.criteria"), traditional: t("public.about.comparison.6.traditional"), blockchain: t("public.about.comparison.6.blockchain") },
    { criteria: t("public.about.comparison.7.criteria"), traditional: t("public.about.comparison.7.traditional"), blockchain: t("public.about.comparison.7.blockchain") },
    { criteria: t("public.about.comparison.8.criteria"), traditional: t("public.about.comparison.8.traditional"), blockchain: t("public.about.comparison.8.blockchain") },
    { criteria: t("public.about.comparison.9.criteria"), traditional: t("public.about.comparison.9.traditional"), blockchain: t("public.about.comparison.9.blockchain") },
  ];

  return (
    <div className={styles._1}>
      <div className={styles._2}>
        <h1 className={styles._3}>{t("public.about.comparison_title")}</h1>
        <p className={styles._4}>
          {t("public.about.comparison_subtitle")}
        </p>
      </div>

      <div className={styles._5}>
        <div className={styles._6}>
          <h2 className={styles._7}>{t("public.about.why_change_title")}</h2>
          <p className={styles._8}>
            {t("public.about.why_change_desc1")}
          </p>
          <p className={styles._8}>
            {t("public.about.why_change_desc2")}
          </p>
        </div>

        <div className={styles._9}>
          <h2 className={styles._10}>{t("public.about.table_title")}</h2>
          <div className={styles._11}>
            <table className={styles._12}>
              <thead>
                <tr>
                  <th className={styles._13}>{t("public.about.table_header_criteria")}</th>
                  <th className={styles._14}>{t("public.about.table_header_traditional")}</th>
                  <th className={styles._15}>{t("public.about.table_header_blockchain")}</th>
                </tr>
              </thead>
              <tbody className={styles._16}>
                {comparisons.map((item, idx) => (
                  <tr key={idx} className={styles._17}>
                    <td className={styles._18}>{item.criteria}</td>
                    <td className={styles._19}>{item.traditional}</td>
                    <td className={styles._20}>{item.blockchain}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className={styles._21}>
          <h2 className={styles._22}>{t("public.about.benefits_title")}</h2>
          <ul className={styles._23}>
            <li className={styles._24}>
              <svg className={styles._25} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span><strong>{t("public.about.benefit_integrity_title")}</strong> {t("public.about.benefit_integrity_desc")}</span>
            </li>
            <li className={styles._24}>
              <svg className={styles._25} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span><strong>{t("public.about.benefit_public_verify_title")}</strong> {t("public.about.benefit_public_verify_desc")}</span>
            </li>
            <li className={styles._24}>
              <svg className={styles._25} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span><strong>{t("public.about.benefit_transparency_title")}</strong> {t("public.about.benefit_transparency_desc")}</span>
            </li>
            <li className={styles._24}>
              <svg className={styles._25} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span><strong>{t("public.about.benefit_anti_forgery_title")}</strong> {t("public.about.benefit_anti_forgery_desc")}</span>
            </li>
            <li className={styles._24}>
              <svg className={styles._25} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span><strong>{t("public.about.benefit_decentralized_title")}</strong> {t("public.about.benefit_decentralized_desc")}</span>
            </li>
          </ul>
        </div>

        <div className={styles._26}>
          <h2 className={styles._27}>{t("public.about.limitations_title")}</h2>
          <ul className={styles._23}>
            <li className={styles._24}>
              <svg className={styles._28} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span><strong>{t("public.about.limitation_gas_title")}</strong> {t("public.about.limitation_gas_desc")}</span>
            </li>
            <li className={styles._24}>
              <svg className={styles._28} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span><strong>{t("public.about.limitation_perf_title")}</strong> {t("public.about.limitation_perf_desc")}</span>
            </li>
            <li className={styles._24}>
              <svg className={styles._28} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span><strong>{t("public.about.limitation_key_title")}</strong> {t("public.about.limitation_key_desc")}</span>
            </li>
            <li className={styles._24}>
              <svg className={styles._28} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span><strong>{t("public.about.limitation_ipfs_title")}</strong> {t("public.about.limitation_ipfs_desc")}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
