"use client";
import styles from "./FaqSection.module.css";
import React, { useState } from "react";
import { useI18n } from "@/features/i18n/I18nContext";
import { faqs } from "../data";

export default function FaqSection() {
  const { t } = useI18n();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <section className={styles._1}>
      <div className={styles._2}>
        <div className={styles._3} data-reveal>
          <p className={styles._4}>
            {t("faq.badge")}
          </p>
          <h2 className={styles._5}>
            {t("faq.title")}
          </h2>
        </div>

        <div className={styles._6}>
          {faqs.map((faq, i) => (
            <div
              key={i}
              data-reveal
              className={styles._7}
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className={styles._8}
              >
                <span className={styles._9}>{faq.q}</span>
                <svg
                  className={`${styles._0} ${openFaq === i ? "rotate-180" : ""}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openFaq === i && (
                <div className={styles._10}>
                  <p className={styles._11}>{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
