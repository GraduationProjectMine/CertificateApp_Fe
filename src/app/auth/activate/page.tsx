"use client";
import styles from "./page.module.css";
import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Button from "@/components/ui/Button";
import AppControls from "@/components/common/AppControls";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

type ActivateState = "loading" | "error" | "form" | "success";

interface VerifyData {
  name: string;
  email: string;
  organizationName: string;
}

function ActivateForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [state, setState] = useState<ActivateState>("loading");
  const [verifyData, setVerifyData] = useState<VerifyData | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      setState("error");
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API_URL}/auth/activate/verify?token=${encodeURIComponent(token)}`);
        if (!res.ok) {
          if (!cancelled) setState("error");
          return;
        }
        const data = await res.json();
        if (!cancelled) {
          setVerifyData({
            name: data.name ?? data.studentName ?? "",
            email: data.email ?? "",
            organizationName: data.organizationName ?? data.organization ?? "",
          });
          setState("form");
        }
      } catch {
        if (!cancelled) setState("error");
      }
    })();

    return () => { cancelled = true; };
  }, [token]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (!password || password.length < 8) {
      setError("Mật khẩu phải có ít nhất 8 ký tự");
      return;
    }
    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/auth/activate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, confirmPassword }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.message || body?.error || "Kích hoạt tài khoản thất bại");
        setIsSubmitting(false);
        return;
      }
      setState("success");
    } catch {
      setError("Không thể kết nối đến máy chủ. Vui lòng thử lại sau.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const leftPanel = (
    <section className={`auth-visual-panel ${styles._5}`}>
      <div className={`motion-float ${styles._6}`} />
      <div className={`motion-float-slow ${styles._7}`} />

      <div className="flex w-full items-center justify-between">
        <Link href="/" className={styles._8}>
          <span className={styles._9}>C</span>
          <span className={styles._10}>CertiChain</span>
        </Link>
        <AppControls />
      </div>

      <div className={styles._11}>
        <p className={styles._12}>Bảo mật danh tính học thuật</p>
        <h1 className={styles._13}>
          Kích hoạt tài khoản sinh viên.
        </h1>
        <p className={styles._46}>
          Thiết lập mật khẩu để hoàn tất quy trình kích hoạt tài khoản
          và bắt đầu nhận văn bằng số từ tổ chức của bạn.
        </p>
      </div>

      <div className={styles._15}>
        {["Xác thực danh tính", "Tạo mật khẩu", "Văn bằng số"].map((item) => (
          <div key={item} className={styles._16}>
            <span className={styles._17} />
            <span className={styles._18}>{item}</span>
          </div>
        ))}
      </div>
    </section>
  );

  const renderFormPanel = () => {
    if (state === "loading") {
      return (
        <div className={styles._39}>
          <div className={styles._40}>
            <div className={styles._41} />
            <p className={styles._42}>Đang xác thực token...</p>
          </div>
        </div>
      );
    }

    if (state === "error") {
      return (
        <>
          <div className={styles._26}>
            <p className={styles._27}>Kích hoạt thất bại</p>
            <h2 className={styles._28}>Liên kết không hợp lệ</h2>
            <p className={styles._43}>
              Liên kết kích hoạt này không hợp lệ hoặc đã hết hạn. Vui lòng
              liên hệ với tổ chức của bạn để nhận liên kết mới.
            </p>
          </div>
          <div className={styles._30}>
            Token không hợp lệ hoặc đã hết hạn
          </div>
          <div className={styles._37}>
            <Button variant="ghost" href="/auth/login">
              Quay lại đăng nhập
            </Button>
          </div>
        </>
      );
    }

    if (state === "form" && verifyData) {
      return (
        <>
          <div className={styles._26}>
            <p className={styles._27}>Kích hoạt tài khoản</p>
            <h2 className={styles._28}>Tạo mật khẩu</h2>
            <p className={styles._29}>Vui lòng kiểm tra thông tin và tạo mật khẩu mới.</p>
          </div>

          {error && (
            <div className={styles._30}>
              {error}
            </div>
          )}

          <form className={styles._31} onSubmit={handleSubmit}>
            <label className={styles._32}>
              <span className={styles._33}>Họ và tên</span>
              <input
                type="text"
                value={verifyData.name}
                readOnly
                className={`${styles._34} opacity-60 cursor-not-allowed`}
                tabIndex={-1}
              />
            </label>

            <label className={styles._32}>
              <span className={styles._33}>Email</span>
              <input
                type="email"
                value={verifyData.email}
                readOnly
                className={`${styles._34} opacity-60 cursor-not-allowed`}
                tabIndex={-1}
              />
            </label>

            <label className={styles._32}>
              <span className={styles._33}>Tổ chức</span>
              <input
                type="text"
                value={verifyData.organizationName}
                readOnly
                className={`${styles._34} opacity-60 cursor-not-allowed`}
                tabIndex={-1}
              />
            </label>

            <label className={styles._32}>
              <span className={styles._33}>Mật khẩu mới</span>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${styles._34} pr-10`}
                  placeholder="Ít nhất 8 ký tự"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </label>

            <label className={styles._32}>
              <span className={styles._33}>Xác nhận mật khẩu</span>
              <input
                type="password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={styles._34}
                placeholder="Nhập lại mật khẩu"
              />
            </label>

            <Button type="submit" disabled={isSubmitting} className={styles._44}>
              {isSubmitting ? "Đang xử lý..." : "Kích hoạt tài khoản"}
            </Button>
          </form>
        </>
      );
    }

    if (state === "success") {
      return (
        <>
          <div className={styles._26}>
            <p className={styles._27}>Kích hoạt thành công</p>
            <h2 className={styles._28}>Tài khoản đã sẵn sàng</h2>
            <p className={styles._43}>
              Tài khoản của bạn đã được kích hoạt thành công. Giờ đây bạn có thể
              đăng nhập để xem và quản lý văn bằng số của mình.
            </p>
          </div>
          <div className={styles._36}>
            Tài khoản đã được kích hoạt thành công
          </div>
          <Button className={styles._44} href="/auth/login">
            Đăng nhập
          </Button>
        </>
      );
    }

    return null;
  };

  return (
    <div className={styles._4}>
      {leftPanel}

      <section className={`auth-form-panel ${styles._19}`}>
        <div className={styles._20}>
          <Link href="/" className={styles._21}>
            <span className={styles._22}>C</span>
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
          {renderFormPanel()}
        </div>
      </section>
    </div>
  );
}

export default function ActivatePage() {
  return (
    <main className={`auth-page-shell ${styles._1}`}>
      <div className={styles._2} />
      <div className={styles._3} />
      <Suspense fallback={null}>
        <ActivateForm />
      </Suspense>
    </main>
  );
}
