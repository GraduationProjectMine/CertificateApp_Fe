"use client";
import styles from "./LandingFooter.module.css";
import React from "react";
import { useI18n } from "@/features/i18n/I18nContext";

export default function LandingFooter() {
  const { t } = useI18n();

  return (
    <footer className={styles._1}>
      <div className={styles._2}>
        <div className={styles._3}>
          <div className={styles._4}>
            <div className={styles._5}>
              <div className={styles._6}>
                C
              </div>
              <span className={styles._7}>CertiChain</span>
            </div>
            <p className={styles._8}>
              {t("footer.tagline")}
            </p>
          </div>

          <div>
            <h5 className={styles._9}>{t("footer.solutions")}</h5>
            <ul className={styles._10}>
              <li><a href="#" className={styles._11}>{t("footer.for_university")}</a></li>
              <li><a href="#" className={styles._11}>{t("footer.for_employer")}</a></li>
              <li><a href="#" className={styles._11}>{t("footer.for_student")}</a></li>
            </ul>
          </div>

          <div>
            <h5 className={styles._9}>{t("footer.features_title")}</h5>
            <ul className={styles._10}>
              <li><a href="#" className={styles._11}>{t("footer.feat_certificates")}</a></li>
              <li><a href="#" className={styles._11}>{t("footer.feat_verify")}</a></li>
              <li><a href="#" className={styles._11}>{t("footer.feat_analytics")}</a></li>
            </ul>
          </div>

          <div>
            <h5 className={styles._9}>{t("footer.resources")}</h5>
            <ul className={styles._10}>
              <li><a href="#" className={styles._11}>{t("footer.blog")}</a></li>
              <li><a href="#" className={styles._11}>{t("footer.api_docs")}</a></li>
              <li><a href="#" className={styles._11}>{t("footer.knowledge")}</a></li>
            </ul>
          </div>

          <div>
            <h5 className={styles._9}>{t("footer.company")}</h5>
            <ul className={styles._10}>
              <li><a href="#" className={styles._11}>{t("footer.about")}</a></li>
              <li><a href="#" className={styles._11}>{t("footer.contact")}</a></li>
              <li><a href="#" className={styles._11}>{t("footer.security")}</a></li>
            </ul>
          </div>
        </div>

        <hr className={styles._12} />

        <div className={styles._13}>
          <span>&copy; 2026 CertiChain. {t("footer.copyright")}</span>
          <div className={styles._14}>
            <a href="#" className={styles._15}>{t("footer.terms")}</a>
            <a href="#" className={styles._15}>{t("footer.privacy")}</a>
            <a href="#" className={styles._15}>{t("footer.cookie")}</a>
          </div>
        </div>

        <div className={styles._16}>
          <span className={styles._17}>
            <span className={styles._18} /> ISO 27001
          </span>
          <span className={styles._17}>
            <span className={styles._19} /> GDPR
          </span>
          <span className={styles._17}>
            <span className={styles._20} /> SOC 2
          </span>
        </div>
      </div>
    </footer>
  );
}
