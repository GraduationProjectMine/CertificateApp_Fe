"use client";
import styles from "./page.module.css";
import React, { useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import AppControls from "@/components/common/AppControls";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function ForgotPasswordPage() {
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
    await new Promise((resolve) => window.setTimeout(resolve, 650));
    setIsSubmitting(false);
    setSuccess("Nếu email thuộc hệ thống, hướng dẫn đặt lại mật khẩu sẽ được gửi trong vài phút.");
  };

  return (
    <main className={`auth-page-shell ${styles._1}`}>
      <div className={styles._2} />
      <div className={styles._3} />

      <div className={styles._4}>
        <section className={`auth-visual-panel ${styles._5}`}>
          <div className={`motion-float ${styles._6}`} />
          <div className={`motion-float-slow ${styles._7}`} />

          <div className="flex w-full items-center justify-between">
            <Link href="/" className={styles._8}>
              <span className={styles._9}>
                C
              </span>
              <span className={styles._10}>CertiChain</span>
            </Link>
            <AppControls />
          </div>

          <div className={styles._11} data-reveal>
            <p className={styles._12}>
              Khôi phục quyền truy cập
            </p>
            <h1 className={styles._13}>
              Lấy lại tài khoản quản trị một cách an toàn.
            </h1>
            <p className={styles._14}>
              Gửi yêu cầu đặt lại mật khẩu qua email đã đăng ký, sau đó quay lại hệ thống để tiếp tục cấp phát và xác minh văn bằng.
            </p>
          </div>

          <div className={styles._15} data-reveal>
            {["Email xác minh", "Liên kết giới hạn", "Bảo vệ phiên"].map((item) => (
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
            <div className="flex items-center gap-3">
              <AppControls />
              <Link href="/auth/login" className={`auth-switch-link ${styles._24}`}>
                Đăng nhập
              </Link>
            </div>
          </div>

          <div className={`auth-card-surface ${styles._25}`}>
            <div className={styles._26}>
              <p className={styles._27}>
                Quên mật khẩu
              </p>
              <h2 className={styles._28}>
                Nhận hướng dẫn đặt lại
              </h2>
              <p className={styles._29}>
                Nhập email quản trị đã đăng ký. Hệ thống sẽ gửi hướng dẫn khôi phục nếu tài khoản tồn tại.
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
                  Email tài khoản
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
                {isSubmitting ? "Đang gửi..." : "Gửi hướng dẫn khôi phục"}
              </Button>
            </form>

            <div className={styles._37}>
              <Button variant="ghost" href="/auth/login" className={`auth-switch-link ${styles._38}`}>
                Quay lại đăng nhập
              </Button>
              <Button variant="ghost" href="/auth/register" className={`auth-switch-link ${styles._39}`}>
                Chưa có tài khoản trường học?
              </Button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
