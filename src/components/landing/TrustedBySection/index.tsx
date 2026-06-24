"use client";
import styles from "./TrustedBySection.module.css";
import React from "react";
import { useI18n } from "@/features/i18n/I18nContext";

export default function TrustedBySection() {
  const { t } = useI18n();

  return (
    <section className={styles._1}>
      <div className={styles._2}>
        <p data-reveal className={styles._3}>
          {t("trusted.title")}
        </p>
        <div className={styles._4}>
          {["ĐH Bách Khoa HN", "ĐH Kinh tế QD", "ĐH Quốc gia HN", "ĐH FPT", "ĐH RMIT", "Vietcombank", "FPT", "VNG"].map((name) => (
            <span key={name} data-reveal className={styles._5}>
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
