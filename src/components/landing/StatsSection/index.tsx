"use client";
import styles from "./StatsSection.module.css";
import React from "react";
import { useI18n } from "@/features/i18n/I18nContext";

export default function StatsSection() {
  const { t } = useI18n();

  return (
    <section className={styles._1}>
      <div className={styles._2}>
        <div className={styles._3}>
          <div data-reveal className={styles._4}>
            <p className={styles._5}>8K+</p>
            <p className={styles._6}>{t("stats.issued")}</p>
          </div>
          <div data-reveal className={styles._4}>
            <p className={styles._5}>34%</p>
            <p className={styles._6}>{t("stats.engagement")}</p>
          </div>
          <div data-reveal className={styles._4}>
            <p className={styles._5}>&lt; 24h</p>
            <p className={styles._6}>{t("stats.response")}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
