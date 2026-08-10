"use client";
import styles from "./page.module.css";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../features/auth/components/AuthContext";
import { authApi } from "../../../features/auth/services/api";
import Button from "@/components/ui/Button";
import { BrowserProvider } from "ethers";

type RegisterForm = {
  institutionName: string;
  institutionCode: string;
  email: string;
  adminName: string;
};

const initialForm: RegisterForm = {
  institutionName: "",
  institutionCode: "",
  email: "",
  adminName: "",
};

function isUserRejectedError(err: any): boolean {
  if (!err) return false;
  if (err.code === 4001 || err.code === "ACTION_REJECTED") return true;
  if (err.info?.error?.code === 4001) return true;
  const msg = (err.message || "").toLowerCase();
  return (
    msg.includes("user rejected") ||
    msg.includes("action_rejected") ||
    msg.includes("user denied") ||
    msg.includes("ethers-user-denied") ||
    msg.includes("rejected the request")
  );
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Đăng ký thất bại";
}

export default function RegisterPage() {
  const [form, setForm] = useState<RegisterForm>(initialForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isWalletSubmitting, setIsWalletSubmitting] = useState(false);
  const router = useRouter();
  const { registerWithMetaMask } = useAuth();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((previous) => ({
      ...previous,
      [name]: name === "institutionCode" ? value.toUpperCase() : value,
    }));
  };

  const handleMetaMaskRegister = async () => {
    setError("");
    setSuccess("");

    if (!form.institutionName || !form.email) {
      setError("Vui lòng nhập tên trường và email quản trị");
      return;
    }

    if (typeof window === "undefined" || !(window as any).ethereum) {
      setError("Không tìm thấy MetaMask. Vui lòng cài đặt tiện ích mở rộng MetaMask.");
      return;
    }

    setIsWalletSubmitting(true);
    try {
      const provider = new BrowserProvider((window as any).ethereum);
      
      // Request account access
      await provider.send("eth_requestAccounts", []);
      
      const signer = await provider.getSigner();
      const walletAddress = await signer.getAddress();

      // 1. Request Nonce
      const { message, tempToken } = await authApi.getMetaMaskNonce(walletAddress);

      // 2. Sign the message
      const signature = await signer.signMessage(message);

      // 3. Register with MetaMask
      const result = await registerWithMetaMask({
        walletAddress,
        signature,
        tempToken,
        email: form.email,
        name: form.institutionName,
        adminName: form.adminName || undefined,
      });

      if (result.success) {
        setSuccess("Đăng ký và đăng nhập thành công!");
        router.push("/admin/dashboard");
      } else {
        setError("Đã có lỗi xảy ra");
      }
    } catch (err: any) {
      console.error(err);
      if (isUserRejectedError(err)) {
        return;
      }
      setError("Đã có lỗi xảy ra");
    } finally {
      setIsWalletSubmitting(false);
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

            <form className={styles._32} onSubmit={(event) => { event.preventDefault(); handleMetaMaskRegister(); }}>
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

              <Button type="submit" disabled={isWalletSubmitting} className={styles._39}>
                <svg className="w-5 h-5 mr-2 inline-block align-middle" viewBox="0 0 318.6 318.6" xmlns="http://www.w3.org/2000/svg">
                  <path d="m274.1 35.5-99.5 73.9-29.3-51.5 89.2-22.3z" fill="#e2761b" stroke="#e2761b" strokeLinecap="round" strokeLinejoin="round" strokeWidth="6"/>
                  <path d="m44.4 35.5 99.5 73.9 29.3-51.5-89.2-22.3z" fill="#e4761b" stroke="#e4761b" strokeLinecap="round" strokeLinejoin="round" strokeWidth="6"/>
                  <path d="m251.8 165.4 22.3-94.4-99.5 73.9z" fill="#e4761b" stroke="#e4761b" strokeLinecap="round" strokeLinejoin="round" strokeWidth="6"/>
                  <path d="m66.7 165.4-22.3-94.4 99.5 73.9z" fill="#e4761b" stroke="#e4761b" strokeLinecap="round" strokeLinejoin="round" strokeWidth="6"/>
                  <path d="m123.6 152.4-56.9 13 25.1 27.2z" fill="#e4761b" stroke="#e4761b" strokeLinecap="round" strokeLinejoin="round" strokeWidth="6"/>
                  <path d="m194.9 152.4 56.9 13-25.1 27.2z" fill="#e4761b" stroke="#e4761b" strokeLinecap="round" strokeLinejoin="round" strokeWidth="6"/>
                  <path d="m78.7 186.4 75.3 47.7-41-11.3z" fill="#e4761b" stroke="#e4761b" strokeLinecap="round" strokeLinejoin="round" strokeWidth="6"/>
                  <path d="m239.8 186.4-75.3 47.7 41-11.3z" fill="#e4761b" stroke="#e4761b" strokeLinecap="round" strokeLinejoin="round" strokeWidth="6"/>
                  <path d="m113 222.8 46.2 59.8 46.2-59.8-46.2-7.8z" fill="#e4761b" stroke="#e4761b" strokeLinecap="round" strokeLinejoin="round" strokeWidth="6"/>
                  <path d="m174.6 144.9 20.3 7.5-16.2 24.2z" fill="#d7c1b1" stroke="#d7c1b1" strokeLinecap="round" strokeLinejoin="round" strokeWidth="6"/>
                  <path d="m143.9 144.9-20.3 7.5 16.2 24.2z" fill="#d7c1b1" stroke="#d7c1b1" strokeLinecap="round" strokeLinejoin="round" strokeWidth="6"/>
                  <path d="m113 222.8 46.2-7.8-46.2-4.1z" fill="#233447" stroke="#233447" strokeLinecap="round" strokeLinejoin="round" strokeWidth="6"/>
                  <path d="m205.5 222.8-46.2-7.8 46.2-4.1z" fill="#233447" stroke="#233447" strokeLinecap="round" strokeLinejoin="round" strokeWidth="6"/>
                  <path d="m66.7 165.4 12 21 44.9-34-16.2-24.2z" fill="#cd6116" stroke="#cd6116" strokeLinecap="round" strokeLinejoin="round" strokeWidth="6"/>
                  <path d="m251.8 165.4-12 21-44.9-34 16.2-24.2z" fill="#cd6116" stroke="#cd6116" strokeLinecap="round" strokeLinejoin="round" strokeWidth="6"/>
                  <path d="m159.3 215 46.2 7.8 34.3-36.4-45.5-34z" fill="#cd6116" stroke="#cd6116" strokeLinecap="round" strokeLinejoin="round" strokeWidth="6"/>
                  <path d="m159.3 215-46.2 7.8-34.3-36.4 45.5-34z" fill="#cd6116" stroke="#cd6116" strokeLinecap="round" strokeLinejoin="round" strokeWidth="6"/>
                </svg>
                {isWalletSubmitting ? "Đang đăng ký ví..." : "Đăng ký với MetaMask"}
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
