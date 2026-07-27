"use client";

import { useI18n } from "@/features/i18n/I18nContext";
import styles from "./language-switcher.module.css";

type LanguageSwitcherProps = {
  className?: string;
};

export default function LanguageSwitcher({ className = "" }: LanguageSwitcherProps) {
  const { locale, toggleLocale } = useI18n();
  const isEn = locale === "en";

  return (
    <button
      type="button"
      onClick={toggleLocale}
      className={[styles.toggle, className].filter(Boolean).join(" ")}
      aria-label={isEn ? "Chuyển sang Tiếng Việt" : "Switch to English"}
      title={isEn ? "Chuyển sang Tiếng Việt" : "Switch to English"}
    >
      <span className={styles.label}>{isEn ? "VI" : "EN"}</span>
    </button>
  );
}
