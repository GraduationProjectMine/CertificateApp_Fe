"use client";
import styles from "./IntegrationsSection.module.css";
import React from "react";
import { useI18n } from "@/features/i18n/I18nContext";
import { integrations } from "../data";

export default function IntegrationsSection() {
  const { t } = useI18n();

  return (
    <section className={styles._1}>
      <div className={styles._2}>
        <div data-reveal>
        <p className={styles._3}>
          {t("integrations.badge")}
        </p>
        <h2 className={styles._4}>
          {t("integrations.title")}
        </h2>
        <p className={styles._5}>
          {t("integrations.desc")}
        </p>
        </div>
        <div className={styles._6}>
          {integrations.map((name) => (
            <span
              key={name}
              data-reveal
              className={styles._7}
            >
              {name}
            </span>
          ))}
        </div>
        <p className={styles._8}>
          {t("integrations.more")}
        </p>
      </div>
    </section>
  );
}
