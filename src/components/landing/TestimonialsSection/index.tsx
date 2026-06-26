"use client";
import styles from "./TestimonialsSection.module.css";
import React from "react";
import { useI18n } from "@/features/i18n/I18nContext";
import { testimonials } from "../data";

export default function TestimonialsSection() {
  const { t } = useI18n();

  return (
    <section className={styles._1}>
      <div className={styles._2}>
        <div className={styles._3} data-reveal>
          <p className={styles._4}>
            {t("testimonials.badge")}
          </p>
          <h2 className={styles._5}>
            {t("testimonials.title")}
          </h2>
        </div>
        <div className={styles._6}>
          {testimonials.map((item) => (
            <div key={item.author} data-reveal className={styles._7}>
              <svg className={styles._8} fill="currentColor" viewBox="0 0 32 32">
                <path d="M10 8c-3.3 0-6 2.7-6 6v10h10V14H8c0-1.1.9-2 2-2V8zm16 0c-3.3 0-6 2.7-6 6v10h10V14h-6c0-1.1.9-2 2-2V8z" />
              </svg>
              <p className={styles._9}>
                {item.quote}
              </p>
              <div>
                <p className={styles._10}>{item.author}</p>
                <p className={styles._11}>{item.role}, {item.org}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
