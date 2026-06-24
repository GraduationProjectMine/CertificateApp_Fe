"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth, mockUsers, UserRole } from "../../../features/auth/components/AuthContext";

export default function LoginPage() {
  const { login, loginWithMetaMask, user } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [metaMaskRole, setMetaMaskRole] = useState<UserRole>("employer");

  const handleMetaMaskLogin = async () => {
    setError("");
    setIsSubmitting(true);
    const result = await loginWithMetaMask(metaMaskRole);
    if (result.success) {
      // The useEffect on user state handles redirecting
    } else {
      setError(result.error || "Không thể kết nối ví MetaMask.");
      setIsSubmitting(false);
    }
  };

  // Slideshow for the left branding panel
  const slides = [
    {
      title: "Cấp phát nhanh chóng & Hàng loạt",
      description: "Thiết kế mẫu chứng chỉ trực tuyến bằng kéo thả, số hóa và ký số hàng loạt hàng ngàn văn bằng chỉ trong vài phút.",
      color: "from-teal-900 via-teal-950 to-slate-950",
      accent: "teal"
    },
    {
      title: "Xác minh tức thì qua Blockchain",
      description: "Nhà tuyển dụng và bên thứ ba đối chiếu tệp tin PDF hoặc mã QR code trực tuyến 24/7 để xác thực nguồn gốc trong 2 giây.",
      color: "from-blue-900 via-blue-950 to-slate-950",
      accent: "blue"
    },
    {
      title: "Lưu trữ IPFS phi tập trung",
      description: "Chống sửa đổi nội dung tệp tin bằng cấu trúc định danh CID duy nhất, bảo mật tuyệt đối và loại bỏ hoàn toàn rủi ro sập máy chủ.",
      color: "from-slate-900 via-slate-950 to-black",
      accent: "slate"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  // If already logged in, redirect to correct dashboard
  useEffect(() => {
    if (user) {
      redirectUser(user.role);
    }
  }, [user]);

  const redirectUser = (role: UserRole) => {
    switch (role) {
      case "issuer":
        router.push("/admin/dashboard");
        break;
      case "student":
        router.push("/student/dashboard");
        break;
      case "employer":
        router.push("/public/verify");
        break;
      case "sysadmin":
        router.push("/admin/dashboard");
        break;
      default:
        router.push("/");
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!email || !password) {
      setError("Vui lòng nhập đầy đủ email và mật khẩu.");
      return;
    }

    setIsSubmitting(true);

    // Identify role based on mock credentials mapping
    let matchedRole: UserRole | null = null;
    
    if (email === "admin@hust.edu.vn" && password === "Admin@123") {
      matchedRole = "issuer";
    } else if (email === "student@student.edu.vn" && password === "Student@123") {
      matchedRole = "student";
    } else if (email === "hr@company.com" && password === "Employer@123") {
      matchedRole = "employer";
    } else if (email === "sysadmin@blockchain.org" && password === "Sysadmin@123") {
      matchedRole = "sysadmin";
    }

    if (matchedRole) {
      const success = await login(email, matchedRole);
      if (success) {
        redirectUser(matchedRole);
      } else {
        setError("Có lỗi xảy ra trong quá trình đăng nhập.");
        setIsSubmitting(false);
      }
    } else {
      setError("Email hoặc mật khẩu không chính xác. Bạn có thể sử dụng các tài khoản Demo nhanh bên dưới.");
      setIsSubmitting(false);
    }
  };

  // Direct login wrapper for Demo Accounts buttons (1-click login)
  const handleQuickDemoLogin = async (role: UserRole) => {
    setError("");
    setIsSubmitting(true);
    
    let demoEmail = "";
    let demoPass = "";

    switch (role) {
      case "issuer":
        demoEmail = "admin@hust.edu.vn";
        demoPass = "Admin@123";
        break;
      case "student":
        demoEmail = "student@student.edu.vn";
        demoPass = "Student@123";
        break;
      case "employer":
        demoEmail = "hr@company.com";
        demoPass = "Employer@123";
        break;
      case "sysadmin":
        demoEmail = "sysadmin@blockchain.org";
        demoPass = "Sysadmin@123";
        break;
    }

    setEmail(demoEmail);
    setPassword(demoPass);

    const success = await login(demoEmail, role);
    if (success) {
      redirectUser(role);
    } else {
      setError("Đăng nhập tài khoản demo thất bại.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#f8fafc] dark:bg-[#030712] transition-colors duration-300">
      {/* Left Banner Panel (SaaS Branding Showcase) */}
      <div className={`relative hidden md:flex md:w-5/12 lg:w-1/2 flex-col justify-between p-12 text-white transition-all duration-1000 bg-gradient-to-br ${slides[activeSlide].color} overflow-hidden`}>
        {/* Dynamic decorative backdrop grids */}
        <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full filter blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-secondary/10 rounded-full filter blur-3xl"></div>

        {/* Brand Header */}
        <Link href="/" className="flex items-center gap-3 relative z-10">
          <div className="w-9 h-9 rounded-lg bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
            <svg className="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
            </svg>
          </div>
          <span className="font-bold text-lg tracking-wider text-white">CertiChain</span>
        </Link>

        {/* Floating animated card simulator in the center */}
        <div className="my-auto flex justify-center items-center relative z-10">
          <div className="w-full max-w-[340px] bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl animate-float">
            <div className="flex justify-between items-center mb-5">
              <div className="w-6 h-6 rounded bg-teal-400/20 flex items-center justify-center text-teal-400">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"></path>
                </svg>
              </div>
              <span className="text-[9px] uppercase tracking-widest font-bold text-teal-400">Secure Node #47</span>
            </div>
            
            <div className="space-y-3.5">
              <div className="h-6 bg-white/5 rounded-md flex items-center px-2 border border-white/5">
                <span className="text-[10px] font-mono text-white/40">Issuer: 0x93b4...10ec</span>
              </div>
              <div className="h-6 bg-white/5 rounded-md flex items-center px-2 border border-white/5">
                <span className="text-[10px] font-mono text-white/40">Holder: 0xae82...f92a</span>
              </div>
              <div className="h-6 bg-white/5 rounded-md flex items-center px-2 border border-white/5 overflow-hidden">
                <span className="text-[10px] font-mono text-teal-300">Hash: e3b0c44298fc1c149afbf4c8...996</span>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between">
              <span className="text-[9px] text-white/50">Status</span>
              <span className="text-[9px] font-bold text-green-400 px-2 py-0.5 rounded bg-green-500/10 border border-green-500/20">VALIDATED ON-CHAIN</span>
            </div>
          </div>
        </div>

        {/* Dynamic Carousel Text Footer */}
        <div className="relative z-10">
          <div className="h-28">
            <h2 className="text-xl font-bold text-white mb-2 transition-all duration-500">
              {slides[activeSlide].title}
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm transition-all duration-500">
              {slides[activeSlide].description}
            </p>
          </div>
          {/* Navigation dots */}
          <div className="flex gap-2.5 mt-4">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveSlide(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  activeSlide === i ? "bg-teal-400 w-6" : "bg-white/20"
                }`}
                aria-label={`Go to slide ${i + 1}`}
              ></button>
            ))}
          </div>
        </div>
      </div>

      {/* Right Login Form Panel */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 md:py-16 lg:px-16 xl:px-24">
        <div className="w-full max-w-md space-y-8">
          {/* Header Mobile Brand & Text */}
          <div className="text-center md:text-left">
            <div className="flex md:hidden justify-center items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-bold text-base">
                C
              </div>
              <span className="font-bold text-gray-900 dark:text-white text-lg">CertiChain</span>
            </div>
            
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Chào mừng trở lại!
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Hệ thống xác minh, cấp phát văn bằng & chứng chỉ số Blockchain.
            </p>
          </div>

          {/* Error message card */}
          {error && (
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 text-danger dark:text-red-400 p-4 rounded-xl text-sm leading-relaxed animate-fadeIn">
              <div className="flex gap-2">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Form */}
          <form className="space-y-5" onSubmit={handleFormSubmit}>
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                Địa chỉ Email
              </label>
              <input
                id="email"
                type="email"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                placeholder="ten@truonghoc.edu.vn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="password" className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Mật khẩu
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs font-bold text-primary hover:text-primary-hover dark:text-teal-400 transition-colors"
                >
                  Quên mật khẩu?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* Remember me checkbox */}
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label htmlFor="remember-me" className="ml-2 block text-xs text-gray-600 dark:text-gray-400 select-none">
                Ghi nhớ đăng nhập trên thiết bị này
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-primary hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 select-none active:scale-[0.99] ${
                isSubmitting ? "opacity-80 cursor-wait" : ""
              }`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang đăng nhập...
                </>
              ) : (
                "Đăng nhập bằng tài khoản"
              )}
            </button>
          </form>

          {/* Separator */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-[#030712] px-3 text-gray-500 font-semibold">Hoặc sử dụng ví Web3</span>
            </div>
          </div>

          {/* MetaMask Section with role selector */}
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-slate-50 dark:bg-gray-850 p-2 rounded-xl border border-gray-255 dark:border-gray-800">
              <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold px-2">Vai trò ví kết nối:</span>
              <div className="flex gap-1">
                {(["issuer", "student", "employer"] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setMetaMaskRole(r)}
                    className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition-all select-none ${
                      metaMaskRole === r
                        ? "bg-primary text-white"
                        : "bg-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
                  >
                    {r === "issuer" ? "Trường học" : r === "student" ? "Sinh viên" : "Tuyển dụng"}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleMetaMaskLogin}
              className={`w-full py-3 px-4 rounded-xl border border-orange-500/20 hover:border-orange-500 bg-orange-500/5 hover:bg-orange-500/10 text-orange-600 dark:text-orange-400 font-bold transition-all flex items-center justify-center gap-3 select-none active:scale-[0.99] ${
                isSubmitting ? "opacity-80 cursor-wait" : ""
              }`}
            >
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 256 238" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M247.9 104.8l-15-46.7-56-42.5-44.5 59 4.3.4 35.3-32.9L247.9 104.8z" fill="#E2761B"/>
                <path d="M8.1 104.8l15-46.7 56-42.5 44.5 59-4.3.4-35.3-32.9L8.1 104.8z" fill="#E4761B"/>
                <path d="M211.9 173.8l-30 46-53.9-9.8.5-5.9 45.4-13.8 38-16.5z" fill="#D7C1B1"/>
                <path d="M44.1 173.8l30 46 53.9-9.8-.5-5.9-45.4-13.8-38-16.5z" fill="#D7C1B1"/>
                <path d="M174.5 130.6l-20.2 38.6-26.3-5-26.3 5-20.2-38.6 30.2 5.5 16.3-26.8 16.3 26.8 30.2-5.5z" fill="#233447"/>
                <path d="M57.6 139.1l8.5-43.7 20.2-5.5-24.9 32.7-3.8 16.5z" fill="#CD7C2F"/>
                <path d="M198.4 139.1l-8.5-43.7-20.2-5.5 24.9 32.7 3.8 16.5z" fill="#CD7C2F"/>
                <path d="M128 221.3l52.5-47.5-31.5-5.7-21 21.2-21-21.2-31.5 5.7 52.5 47.5z" fill="#E2761B"/>
                <path d="M82.8 136l19.5 29.8-30.2-5.5 10.7-24.3z" fill="#E2761B"/>
                <path d="M173.2 136l-19.5 29.8 30.2-5.5-10.7-24.3z" fill="#E2761B"/>
                <path d="M35.6 109.1l40.7 4.1-13.8 36.3-26.9-40.4z" fill="#F6851B"/>
                <path d="M220.4 109.1l-40.7 4.1 13.8 36.3 26.9-40.4z" fill="#F6851B"/>
                <path d="M128 75l-16.3 26.8 32.6 0L128 75z" fill="#F6851B"/>
                <path d="M172.9 89.9l17 19.2-20.2 5.5 3.2-24.7z" fill="#F6851B"/>
                <path d="M83.1 89.9l-17 19.2 20.2 5.5-3.2-24.7z" fill="#F6851B"/>
                <path d="M243.6 113.1l-31.7 46 22 2.5 9.7-48.5z" fill="#E2761B"/>
                <path d="M12.4 113.1l31.7 46-22 2.5-9.7-48.5z" fill="#E2761B"/>
                <path d="M176.9 113.2l21.5 25.9-20.2 5.5-1.3-31.4z" fill="#F6851B"/>
                <path d="M79.1 113.2l-21.5 25.9 20.2 5.5 1.3-31.4z" fill="#F6851B"/>
              </svg>
              Kết nối ví MetaMask
            </button>
          </div>


          {/* Quick Demo Accounts section */}
          <div className="pt-6 border-t border-gray-100 dark:border-gray-800/80 space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                Đăng nhập nhanh (Chạy thử demo)
              </span>
              <span className="text-[10px] text-teal-500 dark:text-teal-400 font-bold bg-teal-50 dark:bg-teal-950/40 px-2 py-0.5 rounded border border-teal-200/30">
                1-Click Login
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {/* University Admin */}
              <button
                type="button"
                onClick={() => handleQuickDemoLogin("issuer")}
                className="p-3 text-left bg-slate-50 dark:bg-gray-850 hover:bg-teal-50/40 dark:hover:bg-teal-950/20 border border-gray-200 dark:border-gray-800 hover:border-primary/45 rounded-xl transition-all group flex flex-col justify-between"
              >
                <span className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 group-hover:text-primary transition-colors">
                  Trường Đại Học
                </span>
                <span className="block text-[9px] text-gray-450 dark:text-gray-500 mt-1 truncate">
                  admin@hust.edu.vn
                </span>
              </button>

              {/* Student */}
              <button
                type="button"
                onClick={() => handleQuickDemoLogin("student")}
                className="p-3 text-left bg-slate-50 dark:bg-gray-850 hover:bg-teal-50/40 dark:hover:bg-teal-950/20 border border-gray-200 dark:border-gray-800 hover:border-primary/45 rounded-xl transition-all group flex flex-col justify-between"
              >
                <span className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 group-hover:text-primary transition-colors">
                  Sinh Viên
                </span>
                <span className="block text-[9px] text-gray-450 dark:text-gray-500 mt-1 truncate">
                  student@student.edu.vn
                </span>
              </button>

              {/* Employer */}
              <button
                type="button"
                onClick={() => handleQuickDemoLogin("employer")}
                className="p-3 text-left bg-slate-50 dark:bg-gray-850 hover:bg-teal-50/40 dark:hover:bg-teal-950/20 border border-gray-200 dark:border-gray-800 hover:border-primary/45 rounded-xl transition-all group flex flex-col justify-between"
              >
                <span className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 group-hover:text-primary transition-colors">
                  Nhà Tuyển Dụng
                </span>
                <span className="block text-[9px] text-gray-450 dark:text-gray-500 mt-1 truncate">
                  hr@company.com
                </span>
              </button>

              {/* System Admin */}
              <button
                type="button"
                onClick={() => handleQuickDemoLogin("sysadmin")}
                className="p-3 text-left bg-slate-50 dark:bg-gray-850 hover:bg-teal-50/40 dark:hover:bg-teal-950/20 border border-gray-200 dark:border-gray-800 hover:border-primary/45 rounded-xl transition-all group flex flex-col justify-between"
              >
                <span className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 group-hover:text-primary transition-colors">
                  System Admin
                </span>
                <span className="block text-[9px] text-gray-450 dark:text-gray-500 mt-1 truncate">
                  sysadmin@blockchain.org
                </span>
              </button>
            </div>
          </div>

          {/* Footer links */}
          <div className="text-center text-xs text-gray-500">
            <span>Chưa có tài khoản tuyển dụng? </span>
            <Link
              href="/auth/register"
              className="font-bold text-primary hover:text-primary-hover dark:text-teal-400 underline transition-colors"
            >
              Đăng ký ngay
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
