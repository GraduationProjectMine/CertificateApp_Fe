"use client";
import React from "react";
import styles from "./page.module.css";
import { useI18n } from "@/features/i18n/I18nContext";

export default function Page() {
  const { t } = useI18n();
  return (
    <div className={styles._1}>
      <h1 className={styles._2}>{t("employer.history.title")}</h1>
      <p className={styles._3}>{t("employer.history.list")}</p>
    </div>
  );
}
