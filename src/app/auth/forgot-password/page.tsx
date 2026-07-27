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
      setError("Vui lòng nhập email tài khoản");
      return;
    }

    if (!isValidEmail(email.trim())) {
      setError("Email không hợp lệ");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/forgot-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: email.trim() }) });
      if (res.ok) {
        setSuccess("Hướng dẫn đặt lại mật khẩu đã được gửi đến email của bạn.");
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data?.error || data?.message || "Không thể gửi yêu cầu đặt lại mật khẩu");
      }
    } catch (err: any) {
      setError(err?.message || "Có lỗi xảy ra. Vui lòng thử lại sau.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles._1}>
      <div className={styles._2}>
        <div className={styles._3}>
          <a href="/" className={styles._4}>
            <div className={styles._5}>C</div>
            <span className={styles._6}>CertiChain</span>
          </a>
          <LanguageSwitcher />
        </div>
        <div className={styles._7}>
          <h1 className={styles._8}>{t("auth.forgot_title")}</h1>
          <p className={styles._9}>{t("auth.forgot_subtitle")}</p>
        </div>

        {error && <div className={styles._10}>{error}</div>}
        {success && <div className={styles._11}>{success}</div>}

        <form onSubmit={handleSubmit} className={styles._12}>
          <div>
            <label className={styles._13}>{t("auth.email")}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles._14}
              placeholder="admin@truonghoc.edu.vn"
              autoComplete="email"
            />
          </div>

          <Button type="submit" variant="primary" size="md" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? t("auth.loading") : t("auth.send_btn")}
          </Button>
        </form>

        <p className={styles._15}>
          <Link href="/auth/login" className={styles._16}>
            {t("auth.back_to_login")}
          </Link>
        </p>
      </div>
    </div>
  );
}
