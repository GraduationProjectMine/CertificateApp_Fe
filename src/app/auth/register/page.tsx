"use client";
import styles from "./page.module.css";
import React, { useState } from "react";
import Link from "next/link";
import { authApi } from "../../../features/auth/services/api";
import Button from "@/components/ui/Button";

type RegisterForm = {
  institutionName: string;
  institutionCode: string;
  email: string;
  adminName: string;
  password: string;
  confirmPassword: string;
};

const initialForm: RegisterForm = {
  institutionName: "",
  institutionCode: "",
  email: "",
  adminName: "",
  password: "",
  confirmPassword: "",
};

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Đăng ký thất bại";
}

export default function RegisterPage() {
  const [form, setForm] = useState<RegisterForm>(initialForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((previous) => ({
      ...previous,
      [name]: name === "institutionCode" ? value.toUpperCase() : value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (form.password !== form.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    setIsSubmitting(true);
    try {
      await authApi.registerInstitution({
        institutionName: form.institutionName,
        institutionCode: form.institutionCode.toUpperCase(),
        email: form.email,
        adminName: form.adminName,
        password: form.password,
      });
      setSuccess("Đăng ký thành công! Vui lòng kiểm tra email để đăng nhập.");
      setForm(initialForm);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
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
              Khởi tạo tổ chức phát hành
            </p>
            <h1 className={styles._13}>
              Một tài khoản cho toàn bộ quy trình cấp bằng.
            </h1>
            <p className={styles._14}>
              Gửi yêu cầu đăng ký trường học, chờ phê duyệt và nhận hợp đồng thông minh riêng cho tổ chức.
            </p>
          </div>

          <div className={styles._15} data-reveal>
            {[
              ["01", "Xác thực trường"],
              ["02", "Tạo ví tổ chức"],
              ["03", "Deploy contract"],
            ].map(([step, label]) => (
              <div key={step} className={styles._16}>
                <span className={styles._17}>{step}</span>
                <span className={styles._18}>{label}</span>
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
            <Link href="/auth/login" className={`auth-switch-link ${styles._24}`}>
              Đăng nhập
            </Link>
          </div>

          <div className={`auth-card-surface ${styles._25}`}>
            <div className={styles._26}>
              <p className={styles._27}>
                Đăng ký trường học
              </p>
              <h2 className={styles._28}>
                Tạo hồ sơ tổ chức
              </h2>
              <p className={styles._29}>
                Thông tin này giúp Super Admin xác minh trường và cấp quyền phát hành văn bằng số.
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
                  Tên trường / Học viện
                </span>
                <input
                  type="text"
                  name="institutionName"
                  value={form.institutionName}
                  onChange={handleChange}
                  required
                  className={styles._35}
                  placeholder="Trường Đại học Bách Khoa Hà Nội"
                />
              </label>

              <label className={styles._36}>
                <span className={styles._34}>
                  Mã trường
                </span>
                <input
                  type="text"
                  name="institutionCode"
                  value={form.institutionCode}
                  onChange={handleChange}
                  required
                  maxLength={20}
                  className={styles._37}
                  placeholder="HUST"
                />
              </label>

              <label className={styles._36}>
                <span className={styles._34}>
                  Tên quản trị
                </span>
                <input
                  type="text"
                  name="adminName"
                  value={form.adminName}
                  onChange={handleChange}
                  required
                  className={styles._35}
                  placeholder="Nguyễn Văn A"
                />
              </label>

              <label className={styles._33}>
                <span className={styles._34}>
                  Email quản trị
                </span>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className={styles._35}
                  placeholder="admin@hust.edu.vn"
                />
                <span className={styles._38}>
                  Không dùng email cá nhân như Gmail, Yahoo hoặc Outlook.
                </span>
              </label>

              <label className={styles._36}>
                <span className={styles._34}>
                  Mật khẩu
                </span>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  minLength={8}
                  className={styles._35}
                  placeholder="Tối thiểu 8 ký tự"
                />
              </label>

              <label className={styles._36}>
                <span className={styles._34}>
                  Xác nhận mật khẩu
                </span>
                <input
                  type="password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                  className={styles._35}
                  placeholder="Nhập lại mật khẩu"
                />
              </label>

              <Button type="submit" disabled={isSubmitting} className={styles._39}>
                {isSubmitting ? "Đang tạo tài khoản..." : "Đăng ký tạo tài khoản"}
              </Button>
            </form>

            <div className={styles._40}>
              Đã có tài khoản?{" "}
              <Button variant="ghost" href="/auth/login" className={`auth-switch-link ${styles._41}`}>
                Đăng nhập
              </Button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
