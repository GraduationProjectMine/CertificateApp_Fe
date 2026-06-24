"use client";
import styles from "./CtaSection.module.css";
import React from "react";
import Link from "next/link";
import { useI18n } from "@/features/i18n/I18nContext";

export default function CtaSection() {
  const { t } = useI18n();

  return (
    <section className={styles._1}>
      <div className={styles._2} data-reveal>
        <h2 className={styles._3}>
          {t("cta.title")}
        </h2>
        <p className={styles._4}>
          {t("cta.desc")}
        </p>
        <div className={styles._5}>
          <Link
            href="/auth/register"
            className={styles._6}
          >
            {t("cta.btn1")}
          </Link>
          <Link
            href="/public/verify"
            className={styles._7}
          >
            {t("cta.btn2")}
          </Link>
        </div>
      </div>
    </section>
  );
}
