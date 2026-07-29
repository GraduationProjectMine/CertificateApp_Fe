"use client";

import styles from "./page.module.css";
import React, { useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import LanguageSwitcher from "@/components/common/LanguageSwitcher";
import { useI18n } from "@/features/i18n/I18nContext";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function ForgotPasswordPage() {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!email.trim()) {
      setError(t("auth.forgot.email_required"));
      return;
    }

    if (!isValidEmail(email.trim())) {
      setError(t("auth.forgot.email_invalid"));
      return;
    }

    setIsSubmitting(true);
    await new Promise((resolve) => window.setTimeout(resolve, 650));
    setIsSubmitting(false);
    setSuccess(t("auth.forgot.success_message"));
  };

  return (
    <main className={`auth-page-shell ${styles._1}`}>
      <div className={styles._2} />
      <div className={styles._3} />

      <div className={styles._4}>
        <section className={`auth-visual-panel ${styles._5}`}>
          <div className={`motion-float ${styles._6}`} />
          <div className={`motion-float-slow ${styles._7}`} />

          <Link href="/" className={styles._8}>
            <span className={styles._9}>
              C
            </span>
            <span className={styles._10}>CertiChain</span>
          </Link>

          <div className={styles._11} data-reveal>
            <p className={styles._12}>
              {t("auth.forgot_visual_tag")}
            </p>
            <h1 className={styles._13}>
              {t("auth.forgot_visual_title")}
            </h1>
            <p className={styles._14}>
              {t("auth.forgot_visual_desc")}
            </p>
          </div>

          <div className={styles._15} data-reveal>
            {[
              t("auth.register.institution_verify"),
              t("auth.register.create_wallet"),
              t("auth.register.create_profile"),
            ].map((item) => (
              <div key={item} className={styles._16}>
                <span className={styles._17} />
                <span className={styles._18}>{item}</span>
              </div>
            ))}
          </div>
        </section>

        <section className={`auth-form-panel ${styles._19}`} data-reveal>
          <div className={styles._20}>
            <Link href="/" className={styles._21}>
              <span className={styles._22}>
                C
              </span>
              <span className={styles._23}>CertiChain</span>
            </Link>
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <Link href="/auth/login" className={`auth-switch-link ${styles._24}`}>
                {t("auth.login_btn")}
              </Link>
            </div>
          </div>

          <div className={`auth-card-surface ${styles._25}`}>
            <div className={styles._26}>
              <p className={styles._27}>
                {t("auth.forgot_title")}
              </p>
              <h2 className={styles._28}>
                {t("auth.forgot_subtitle")}
              </h2>
              <p className={styles._29}>
                {t("auth.forgot_form_subtitle")}
              </p>
            </div>

            {error && (
              <div className={styles._30} data-reveal>
                {error}
              </div>
            )}

            {success && (
              <div className={styles._31} data-reveal>
                {success}
              </div>
            )}

            <form className={styles._32} onSubmit={handleSubmit}>
              <label className={styles._33}>
                <span className={styles._34}>
                  {t("auth.email")}
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className={styles._35}
                  placeholder="admin@truonghoc.edu.vn"
                />
              </label>

              <Button type="submit" disabled={isSubmitting} className={styles._36}>
                {isSubmitting ? t("auth.loading") : t("auth.send_btn")}
              </Button>
            </form>

            <div className={styles._37}>
              <Button variant="ghost" href="/auth/login" className={`auth-switch-link ${styles._38}`}>
                {t("auth.back_to_login")}
              </Button>
              <Button variant="ghost" href="/auth/register" className={`auth-switch-link ${styles._39}`}>
                {t("auth.no_account_question")}
              </Button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}