"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../features/auth/components/AuthContext";
import { useTheme } from "../features/theme/ThemeContext";
import { useI18n } from "../features/i18n/I18nContext";

const staticNavItems = [
  { labelKey: "nav.solutions", href: "#features" },
  { labelKey: "nav.technology", href: "#how-it-works" },

  { labelKey: "nav.verify", href: "/public/verify" },
];

const faqs = [
  { q: "CertiChain hoạt động như thế nào?", a: "CertiChain là nền tảng cấp phát chứng chỉ số cho phép bạn cấp chứng chỉ và huy hiệu có thể xác thực trên blockchain. Kết nối hệ thống LMS, CRM của bạn. Đặt quy tắc cấp phát khi hoàn thành hoặc theo tiêu chí tùy chỉnh. Người nhận nhận được chứng chỉ có thể chia sẻ với URL công khai và mã QR." },
  { q: "Ai nên sử dụng CertiChain?", a: "Hai nhóm chính: (1) Các trường đại học, cao đẳng cần cấp phát bằng cấp số tuân thủ tiêu chuẩn. (2) Doanh nghiệp chạy chương trình đào tạo nội bộ và đào tạo khách hàng." },
  { q: "CertiChain giải quyết vấn đề gì so với bằng giấy truyền thống?", a: "Không còn mẫu bằng và bảng tính. Không còn PDF dễ bị làm giả. CertiChain tự động hóa cấp phát, thêm xác thực tức thì, mở khóa chia sẻ LinkedIn và cung cấp phân tích để chứng minh tương tác và ROI." },
  { q: "Làm thế nào để xác thực chứng chỉ?", a: "Mỗi chứng chỉ bao gồm một liên kết xác thực duy nhất và mã QR. Bất kỳ ai cũng có thể quét hoặc nhấp vào để xác nhận tính xác thực trong vài giây." },
  { q: "Người nhận có cần tài khoản để chia sẻ hoặc xác thực không?", a: "Không. Người nhận có trang chứng chỉ công khai mà họ có thể chia sẻ ở bất cứ đâu. Người xác thực có thể xác nhận tính xác thực mà không cần đăng nhập." },
  { q: "Làm thế nào để cấp phát ở quy mô lớn?", a: "Sử dụng trigger thông minh trong CertiChain hoặc gọi REST API và webhooks của chúng tôi." },
];

const testimonials = [
  { quote: "Sử dụng nền tảng thực sự hiệu quả. Dễ sử dụng và cho phép chúng tôi cung cấp dịch vụ hậu mãi xuất sắc.", author: "TS. Nguyễn Văn An", role: "Trưởng phòng Đào tạo", org: "Đại học Bách Khoa Hà Nội" },
  { quote: "Phản hồi từ sinh viên rất tích cực — bằng cấp số là yếu tố quan trọng trong nhận thức toàn bộ chương trình.", author: "PGS. Trần Thị Lan", role: "Phó Hiệu trưởng", org: "Đại học Kinh tế Quốc dân" },
  { quote: "An toàn, dễ sử dụng và là cách đáng tin cậy để xác nhận tính xác thực của bằng cấp phù hợp với quy trình của chúng tôi.", author: "Lê Hoàng Minh", role: "Giám đốc Nhân sự", org: "Tập đoàn FPT" },
  { quote: "Chúng tôi thiết kế chứng chỉ và huy hiệu theo ý muốn, gửi chúng và theo dõi nơi chúng được chia sẻ — tất cả tại một nơi.", author: "Nguyễn Thị Hương", role: "Chuyên viên Đào tạo", org: "Ngân hàng Vietcombank" },
];

const integrations = [
  "Canvas", "Moodle", "Blackboard", "Google Classroom",
  "Salesforce", "Zapier", "WordPress", "Zoom",
];

export default function Home() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t, tArr, locale, toggleLocale } = useI18n();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-white dark:bg-[#030712]">
      {/* ===== NAVIGATION ===== */}
      <header
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/90 dark:bg-[#030712]/90 backdrop-blur-lg shadow-sm border-b border-gray-100 dark:border-gray-800/50 py-2"
            : "bg-transparent py-3"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center gap-6">
          <Link href="/" className="flex shrink-0 items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-bold text-base shadow-sm group-hover:scale-105 transition-transform duration-300">
              C
            </div>
            <span className="font-bold text-base tracking-tight text-gray-900 dark:text-white">
              CertiChain
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {staticNavItems.map((item) =>
              item.href.startsWith("/") ? (
                <Link
                  key={item.labelKey}
                  href={item.href}
                  className="rounded-lg px-3 py-2 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-100 hover:text-primary dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-teal-400"
                >
                  {t(item.labelKey)}
                </Link>
              ) : (
                <a
                  key={item.labelKey}
                  href={item.href}
                  className="rounded-lg px-3 py-2 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-100 hover:text-primary dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-teal-400"
                >
                  {t(item.labelKey)}
                </a>
              )
            )}
          </nav>

          <div className="ml-auto hidden lg:flex items-center gap-2">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            {/* Locale toggle */}
            <button
              onClick={toggleLocale}
              className="inline-flex h-9 items-center justify-center rounded-lg px-2.5 text-xs font-bold uppercase text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white"
              aria-label="Toggle language"
            >
              {locale === "vi" ? "EN" : "VI"}
            </button>

            <span className="mx-1 h-5 w-px bg-gray-200 dark:bg-white/10" />
            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 dark:text-gray-400 max-w-[150px] truncate">
                  {user.loginType === "metamask" ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 border border-green-200/50 text-[11px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                      {user.walletAddress?.slice(0, 6)}...{user.walletAddress?.slice(-4)}
                    </span>
                  ) : (
                    user.name
                  )}
                </span>
                <Link
                  href={
                    user.role === "issuer" || user.role === "sysadmin"
                      ? "/admin/dashboard"
                      : user.role === "student"
                        ? "/student/dashboard"
                        : "/public/verify"
                  }
                  className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-xs font-bold text-white shadow-sm transition-all hover:bg-primary-hover hover:shadow-md"
                >
                  {t("nav.dashboard")}
                </Link>
                <button
                  onClick={logout}
                  className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-200 px-4 text-xs font-bold text-gray-600 transition-all hover:border-danger/30 hover:text-danger dark:border-white/10 dark:text-gray-300"
                >
                  {t("nav.logout")}
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="inline-flex h-10 items-center rounded-lg px-2.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-100 hover:text-primary dark:text-gray-300 dark:hover:bg-white/5"
                >
                  {t("nav.login")}
                </Link>


                <Link
                  href="/auth/register"
                  className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-5 text-sm font-bold text-white shadow-sm transition-all hover:bg-primary-hover hover:shadow-md hover:scale-[1.02]"
                >
                  {t("nav.register")}
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="ml-auto lg:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden px-4 pt-2 pb-6 bg-white dark:bg-[#030712] border-b border-gray-100 dark:border-gray-800/50 shadow-lg animate-slideDown">
            <div className="flex flex-col gap-4">
              {staticNavItems.map((item) =>
                item.href.startsWith("/") ? (
                  <Link
                    key={item.labelKey}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-base font-medium text-gray-700 dark:text-gray-300 py-1"
                  >
                    {t(item.labelKey)}
                  </Link>
                ) : (
                  <a
                    key={item.labelKey}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-base font-medium text-gray-700 dark:text-gray-300 py-1"
                  >
                    {t(item.labelKey)}
                  </a>
                )
              )}
              {/* Theme & locale toggles for mobile */}
              <div className="flex items-center gap-2 py-1">
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm"
                  aria-label="Toggle theme"
                >
                  {theme === "dark" ? "☀️" : "🌙"}
                </button>
                <button
                  onClick={toggleLocale}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors uppercase tracking-wider"
                >
                  {locale === "vi" ? "EN" : "VI"}
                </button>
              </div>
              <hr className="border-gray-100 dark:border-gray-800" />
              {user ? (
                <div className="flex flex-col gap-3">
                  <span className="text-sm text-gray-500">
                    {t("auth.hello")}, {user.name || `${user.walletAddress?.slice(0, 6)}...${user.walletAddress?.slice(-4)}`}
                  </span>
                  <Link
                    href="/admin/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center px-4 py-2.5 text-sm font-semibold text-white bg-primary rounded-lg"
                  >
                    {t("nav.dashboard")}
                  </Link>
                  <button
                    onClick={() => { logout(); setMobileMenuOpen(false); }}
                    className="w-full text-center px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    {t("nav.logout")}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <Link
                    href="/auth/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    {t("nav.login")}
                  </Link>

                  <Link
                    href="/auth/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center px-4 py-2.5 text-sm font-semibold text-white bg-primary rounded-lg"
                  >
                    {t("nav.register")}
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ===== HERO ===== */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_#ccfbf1_0%,_transparent_60%)] dark:bg-[radial-gradient(ellipse_at_top_right,_#0f766e15_0%,_transparent_60%)] pointer-events-none" />
        <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-secondary/5 dark:bg-secondary/3 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 left-1/3 w-[600px] h-[600px] bg-primary/5 dark:bg-primary/3 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            <div className="lg:col-span-7 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-lighter dark:bg-primary/10 text-primary dark:text-teal-300 text-xs font-semibold tracking-wide mb-6 border border-primary/10 dark:border-primary/20">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                {t("hero.badge")}
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-gray-900 dark:text-white leading-[1.05] mb-6">
                {t("hero.title1")}
                <span className="block mt-2 gradient-text-premium">
                  {t("hero.title2")}
                </span>
              </h1>

              <p className="max-w-xl text-lg text-gray-500 dark:text-gray-400 leading-relaxed mb-8">
                {t("hero.desc")}
              </p>

              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <Link
                  href="/public/verify"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base font-semibold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/35 transition-all hover:scale-[1.02]"
                >
                  {t("hero.cta_verify")}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                <Link
                  href="/auth/login"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/80 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm transition-all hover:scale-[1.02]"
                >
                  {t("hero.cta_login")}
                </Link>
              </div>

              <p className="mt-4 text-xs text-gray-400 dark:text-gray-500">
                {t("hero.no_card")}
              </p>

              <div className="mt-12 grid grid-cols-3 gap-6 sm:gap-8 border-t border-gray-100 dark:border-gray-800 pt-8 w-full max-w-md">
                <div>
                  <span className="block text-2xl font-bold text-gray-900 dark:text-white">100%</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{t("hero.stat1_label")}</span>
                </div>
                <div>
                  <span className="block text-2xl font-bold text-gray-900 dark:text-white">&lt; 3s</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{t("hero.stat2_label")}</span>
                </div>
                <div>
                  <span className="block text-2xl font-bold text-gray-900 dark:text-white">0₫</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{t("hero.stat3_label")}</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-sm">
                <div className="absolute -inset-4 bg-gradient-to-br from-primary/10 via-secondary/5 to-transparent rounded-3xl blur-2xl" />
                <div className="relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-xl shadow-primary/5 animate-float">
                  <div className="absolute top-0 left-0 w-full h-1.5 rounded-t-2xl bg-gradient-to-r from-primary via-teal-400 to-secondary" />

                  <div className="flex items-center justify-between mb-5 mt-1">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950 flex items-center justify-center text-primary">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">ĐẠI HỌC BÁCH KHOA HÀ NỘI</p>
                        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Hanoi University of S&amp;T</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400 text-[10px] font-semibold border border-green-200/50">
                      ✓ On-chain
                    </span>
                  </div>

                  <div className="text-center py-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-gray-200/60 dark:border-gray-700 mb-4">
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Bằng Cử Nhân</p>
                    <p className="text-base font-bold text-gray-800 dark:text-white mt-1">CÔNG NGHỆ THÔNG TIN</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase font-medium">Sinh viên</p>
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Nguyễn Hoàng Nam</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase font-medium">Xếp loại</p>
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Xuất Sắc (3.82)</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                    <div>
                      <p className="text-[9px] text-gray-400 uppercase font-bold tracking-wider">Blockchain Hash</p>
                      <p className="text-[10px] font-mono text-primary dark:text-teal-400 truncate w-32">0x71C7...8976F</p>
                    </div>
                    <div className="flex gap-1">
                      <div className="w-7 h-7 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center">
                        <svg className="w-3.5 h-3.5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="3" width="7" height="7" rx="1" />
                          <rect x="14" y="3" width="7" height="7" rx="1" />
                          <rect x="3" y="14" width="7" height="7" rx="1" />
                          <rect x="14" y="14" width="7" height="7" rx="1" />
                        </svg>
                      </div>
                      <div className="w-7 h-7 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center">
                        <svg className="w-3.5 h-3.5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" d="M7 17l9.2-9.2M17 17V7H7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== TRUSTED BY ===== */}
      <section className="py-14 border-y border-gray-100 dark:border-gray-800/50 bg-gray-50/50 dark:bg-gray-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-8">
            {t("trusted.title")}
          </p>
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-6">
            {["ĐH Bách Khoa HN", "ĐH Kinh tế QD", "ĐH Quốc gia HN", "ĐH FPT", "ĐH RMIT", "Vietcombank", "FPT", "VNG"].map((name) => (
              <span key={name} className="text-sm font-semibold text-gray-400 dark:text-gray-600 tracking-wide">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section id="features" className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="text-xs font-bold text-primary dark:text-teal-400 uppercase tracking-widest mb-4">
              {t("features.badge")}
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
              {t("features.title")}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-4 max-w-2xl mx-auto">
              {t("features.desc")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(tArr("features.items") as { title: string; desc: string; tag: string }[]).map((f, idx) => (
              <div
                key={idx}
                className="group bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-xl p-6 hover:border-primary/20 dark:hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-lg bg-primary-lighter dark:bg-primary/10 text-primary dark:text-teal-400 flex items-center justify-center font-bold text-sm mb-4 group-hover:scale-110 transition-transform">
                  {String(idx + 1).padStart(2, "0")}
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {f.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-4">
                  {f.desc}
                </p>
                <p className="text-xs text-primary dark:text-teal-400 font-medium">
                  {f.tag}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-sm text-gray-400 dark:text-gray-500">
              {t("features.integrations")}:{" "}
              {integrations.slice(0, 4).join(" • ")}{" "}
              <span className="text-primary font-medium">{t("features.integrations_more")}</span>
            </p>
          </div>
        </div>
      </section>

      {/* ===== STATISTICS ===== */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900/30 border-y border-gray-100 dark:border-gray-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold text-gray-900 dark:text-white">8K+</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t("stats.issued")}</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-gray-900 dark:text-white">34%</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t("stats.engagement")}</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-gray-900 dark:text-white">&lt; 24h</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t("stats.response")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="how-it-works" className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="text-xs font-bold text-primary dark:text-teal-400 uppercase tracking-widest mb-4">
              {t("howItWorks.badge")}
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
              {t("howItWorks.title")}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-4">
              {t("howItWorks.desc")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: "01", titleKey: "step1_title", descKey: "step1_desc",
                color: "text-primary", bg: "bg-primary-lighter dark:bg-primary/10", border: "hover:border-primary/30",
              },
              {
                step: "02", titleKey: "step2_title", descKey: "step2_desc",
                color: "text-secondary", bg: "bg-secondary-light dark:bg-secondary/10", border: "hover:border-secondary/30",
              },
              {
                step: "03", titleKey: "step3_title", descKey: "step3_desc",
                color: "text-primary", bg: "bg-primary-lighter dark:bg-primary/10", border: "hover:border-primary/30",
              },
            ].map((item) => (
              <div
                key={item.step}
                className={`bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-xl p-8 shadow-sm hover:shadow-md ${item.border} transition-all duration-300 group`}
              >
                <div className={`w-12 h-12 rounded-xl ${item.bg} ${item.color} flex items-center justify-center font-bold text-lg mb-5 group-hover:scale-110 transition-transform`}>
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {t("howItWorks." + item.titleKey)}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  {t("howItWorks." + item.descKey)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900/30 border-y border-gray-100 dark:border-gray-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <p className="text-xs font-bold text-primary dark:text-teal-400 uppercase tracking-widest mb-4">
              {t("testimonials.badge")}
            </p>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t("testimonials.title")}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {testimonials.map((item) => (
              <div key={item.author} className="bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-xl p-6">
                <svg className="w-8 h-8 text-primary/20 dark:text-primary/10 mb-3" fill="currentColor" viewBox="0 0 32 32">
                  <path d="M10 8c-3.3 0-6 2.7-6 6v10h10V14H8c0-1.1.9-2 2-2V8zm16 0c-3.3 0-6 2.7-6 6v10h10V14h-6c0-1.1.9-2 2-2V8z" />
                </svg>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                  {item.quote}
                </p>
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{item.author}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{item.role}, {item.org}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== INTEGRATIONS ===== */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-bold text-primary dark:text-teal-400 uppercase tracking-widest mb-4">
            {t("integrations.badge")}
          </p>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {t("integrations.title")}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-10">
            {t("integrations.desc")}
          </p>
          <div className="flex flex-wrap justify-center items-center gap-4">
            {integrations.map((name) => (
              <span
                key={name}
                className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 shadow-sm"
              >
                {name}
              </span>
            ))}
          </div>
          <p className="mt-6 text-sm text-primary dark:text-teal-400 font-medium">
            {t("integrations.more")}
          </p>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="py-20 md:py-28 bg-gray-50 dark:bg-gray-900/30 border-y border-gray-100 dark:border-gray-800/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <p className="text-xs font-bold text-primary dark:text-teal-400 uppercase tracking-widest mb-4">
              {t("faq.badge")}
            </p>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t("faq.title")}
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between gap-4 p-5 text-left"
                >
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{faq.q}</span>
                  <svg
                    className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-200 ${openFaq === i ? "rotate-180" : ""}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 animate-fadeIn">
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="py-16 bg-primary dark:bg-primary/10 border-t border-gray-100 dark:border-gray-800/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white dark:text-white mb-4">
            {t("cta.title")}
          </h2>
          <p className="text-primary-100 dark:text-teal-200/80 max-w-2xl mx-auto mb-8">
            {t("cta.desc")}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/auth/register"
              className="px-8 py-3.5 bg-white text-primary font-bold rounded-xl hover:bg-gray-50 shadow-lg shadow-black/10 transition-all hover:scale-[1.02]"
            >
              {t("cta.btn1")}
            </Link>
            <Link
              href="/public/verify"
              className="px-8 py-3.5 bg-white/10 text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-all hover:scale-[1.02]"
            >
              {t("cta.btn2")}
            </Link>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="bg-gray-900 dark:bg-black text-gray-400 py-16 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2 md:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-bold text-sm">
                  C
                </div>
                <span className="font-bold text-white text-base">CertiChain</span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                {t("footer.tagline")}
              </p>
            </div>

            <div>
              <h5 className="font-bold text-gray-200 text-sm mb-4">{t("footer.solutions")}</h5>
              <ul className="space-y-2 text-xs">
                <li><a href="#" className="hover:text-white transition-colors">{t("footer.for_university")}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t("footer.for_employer")}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t("footer.for_student")}</a></li>
              </ul>
            </div>

            <div>
              <h5 className="font-bold text-gray-200 text-sm mb-4">{t("footer.features_title")}</h5>
              <ul className="space-y-2 text-xs">
                <li><a href="#" className="hover:text-white transition-colors">{t("footer.feat_certificates")}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t("footer.feat_verify")}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t("footer.feat_analytics")}</a></li>
              </ul>
            </div>

            <div>
              <h5 className="font-bold text-gray-200 text-sm mb-4">{t("footer.resources")}</h5>
              <ul className="space-y-2 text-xs">
                <li><a href="#" className="hover:text-white transition-colors">{t("footer.blog")}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t("footer.api_docs")}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t("footer.knowledge")}</a></li>
              </ul>
            </div>

            <div>
              <h5 className="font-bold text-gray-200 text-sm mb-4">{t("footer.company")}</h5>
              <ul className="space-y-2 text-xs">
                <li><a href="#" className="hover:text-white transition-colors">{t("footer.about")}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t("footer.contact")}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t("footer.security")}</a></li>
              </ul>
            </div>
          </div>

          <hr className="border-gray-800 my-8" />

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-600">
            <span>© 2026 CertiChain. {t("footer.copyright")}</span>
            <div className="flex gap-6">
              <a href="#" className="hover:text-gray-400 transition-colors">{t("footer.terms")}</a>
              <a href="#" className="hover:text-gray-400 transition-colors">{t("footer.privacy")}</a>
              <a href="#" className="hover:text-gray-400 transition-colors">{t("footer.cookie")}</a>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center gap-4 text-[10px] text-gray-600">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500" /> ISO 27001
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500" /> GDPR
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-teal-500" /> SOC 2
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
