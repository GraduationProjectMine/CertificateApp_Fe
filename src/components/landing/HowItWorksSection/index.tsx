"use client";
import styles from "./HowItWorksSection.module.css";
import React from "react";
import { useI18n } from "@/features/i18n/I18nContext";

const steps = [
  {
    step: "01", titleKey: "step1_title", descKey: "step1_desc",
    color: "text-primary", bg: "bg-primary-lighter dark:bg-primary/10", border: "hover:border-primary/30",
  },
  {
    step: "02", titleKey: "step2_title", descKey: "step2_desc",
    color: "text-secondary", bg: "bg-secondary-light dark:bg-secondary/10", border: "hover:border-secondary/30",
  },
  {
    step: "03", titleKey: "step3_title", descKey: "step3_desc",
    color: "text-primary", bg: "bg-primary-lighter dark:bg-primary/10", border: "hover:border-primary/30",
  },
];

export default function HowItWorksSection() {
  const { t } = useI18n();

  return (
    <section id="how-it-works" className={styles._1}>
      <div className={styles._2}>
        <div className={styles._3} data-reveal>
          <p className={styles._4}>
            {t("howItWorks.badge")}
          </p>
          <h2 className={styles._5}>
            {t("howItWorks.title")}
          </h2>
          <p className={styles._6}>
            {t("howItWorks.desc")}
          </p>
        </div>

        <div className={styles._7}>
          {steps.map((item) => (
            <div
              key={item.step}
              data-reveal
              className={`group ${styles._0} ${item.border}`}
            >
              <div className={`${styles._10} ${item.bg} ${item.color} ${styles._11}`}>
                {item.step}
              </div>
              <h3 className={styles._8}>
                {t("howItWorks." + item.titleKey)}
              </h3>
              <p className={styles._9}>
                {t("howItWorks." + item.descKey)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
