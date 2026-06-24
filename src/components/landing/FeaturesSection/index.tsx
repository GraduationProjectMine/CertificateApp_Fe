"use client";
import styles from "./FeaturesSection.module.css";
import React from "react";
import { useI18n } from "@/features/i18n/I18nContext";
import { integrations } from "../data";

export default function FeaturesSection() {
  const { t, tArr } = useI18n();

  return (
    <section id="features" className={styles._1}>
      <div className={styles._2}>
        <div className={styles._3} data-reveal>
          <p className={styles._4}>
            {t("features.badge")}
          </p>
          <h2 className={styles._5}>
            {t("features.title")}
          </h2>
          <p className={styles._6}>
            {t("features.desc")}
          </p>
        </div>

        <div className={styles._7}>
          {(tArr("features.items") as { title: string; desc: string; tag: string }[]).map((f, idx) => (
            <div
              key={idx}
              data-reveal
              className={`group ${styles._8}`}
            >
              <div className={`${styles._0} ${idx % 3 === 1 ? "bg-amber-50 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300" : idx % 3 === 2 ? "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200" : "bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300"}`}>
                {String(idx + 1).padStart(2, "0")}
              </div>
              <h3 className={styles._9}>
                {f.title}
              </h3>
              <p className={styles._10}>
                {f.desc}
              </p>
              <p className={styles._11}>
                {f.tag}
              </p>
            </div>
          ))}
        </div>

        <div className={styles._12}>
          <p className={styles._13}>
            {t("features.integrations")}:{" "}
            {integrations.slice(0, 4).join(" • ")}{" "}
            <span className={styles._14}>{t("features.integrations_more")}</span>
          </p>
        </div>
      </div>
    </section>
  );
}
