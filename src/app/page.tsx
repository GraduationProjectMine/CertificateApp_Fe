"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "../core/context/AuthContext";

export default function Home() {
  const { user, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Monitor scroll position to apply background styling to Navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Navigation Header */}
      <header
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/80 dark:bg-[#030712]/80 backdrop-blur-md shadow-sm border-b border-gray-200/50 dark:border-gray-800/30 py-3"
            : "bg-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-bold text-xl shadow-md shadow-primary/20 group-hover:scale-105 transition-transform duration-300">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                ></path>
              </svg>
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-gray-900 dark:text-white block leading-none">
                CertiChain
              </span>
              <span className="text-[10px] text-primary dark:text-teal-400 font-semibold uppercase tracking-widest block mt-0.5">
                Blockchain Creds
              </span>
            </div>
          </Link>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center gap-8">
            <a
              href="#solution"
              className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-teal-400 transition-colors"
            >
              Giải pháp
            </a>
            <a
              href="#technology"
              className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-teal-400 transition-colors"
            >
              Công nghệ
            </a>
            <a
              href="#comparison"
              className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-teal-400 transition-colors"
            >
              So sánh
            </a>
            <Link
              href="/verify"
              className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-teal-400 transition-colors"
            >
              Xác minh bằng
            </Link>
          </nav>

          {/* CTA & Profile Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500 font-medium dark:text-gray-400 max-w-[150px] truncate" title={user.walletAddress || user.name}>
                  {user.loginType === "metamask" ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 border border-green-200/50">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                      {user.walletAddress?.slice(0, 6)}...{user.walletAddress?.slice(-4)}
                    </span>
                  ) : (
                    user.name
                  )}
                </span>
                <Link
                  href={
                    user.role === "issuer"
                      ? "/admin/dashboard"
                      : user.role === "student"
                      ? "/student/dashboard"
                      : user.role === "sysadmin"
                      ? "/admin/dashboard"
                      : "/verify"
                  }
                  className="px-4 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-sm transition-all hover:shadow-md hover:shadow-primary/10"
                >
                  Bảng điều khiển
                </Link>
                <button
                  onClick={logout}
                  className="px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:text-danger dark:hover:text-red-400 border border-gray-200 dark:border-gray-800 rounded-xl transition-all"
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-teal-400 transition-colors"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/login?register=employer"
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-md shadow-primary/15 transition-all hover:scale-[1.02]"
                >
                  Đăng ký tuyển dụng
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                ></path>
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden px-4 pt-2 pb-6 bg-white dark:bg-[#030712] border-b border-gray-100 dark:border-gray-800/50 shadow-lg animate-fadeIn">
            <div className="flex flex-col gap-4">
              <a
                href="#solution"
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium text-gray-700 dark:text-gray-300 py-1"
              >
                Giải pháp
              </a>
              <a
                href="#technology"
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium text-gray-700 dark:text-gray-300 py-1"
              >
                Công nghệ
              </a>
              <a
                href="#comparison"
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium text-gray-700 dark:text-gray-300 py-1"
              >
                So sánh
              </a>
              <Link
                href="/verify"
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium text-gray-700 dark:text-gray-300 py-1"
              >
                Xác minh bằng
              </Link>
              <hr className="border-gray-100 dark:border-gray-800" />
              {user ? (
                <div className="flex flex-col gap-3">
                  <span className="text-sm text-gray-500">
                    Xin chào,{" "}
                    {user.loginType === "metamask"
                      ? `${user.walletAddress?.slice(0, 6)}...${user.walletAddress?.slice(-4)} (MetaMask)`
                      : user.name}
                  </span>
                  <Link
                    href={
                      user.role === "issuer"
                        ? "/admin/dashboard"
                        : user.role === "student"
                        ? "/student/dashboard"
                        : user.role === "sysadmin"
                        ? "/admin/dashboard"
                        : "/verify"
                    }
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center px-4 py-2.5 text-sm font-semibold text-white bg-primary rounded-xl"
                  >
                    Bảng điều khiển
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-center px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800 rounded-xl"
                  >
                    Đăng xuất
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800 rounded-xl"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    href="/login?register=employer"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center px-4 py-2.5 text-sm font-semibold text-white bg-primary rounded-xl"
                  >
                    Đăng ký tuyển dụng
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-28 overflow-hidden bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary-light/30 via-transparent to-transparent dark:from-primary/10">
        {/* Background blobs */}
        <div className="absolute top-1/4 right-0 w-80 h-80 bg-secondary/10 dark:bg-secondary/5 rounded-full filter blur-3xl -z-10 animate-pulse-slow"></div>
        <div className="absolute top-1/3 left-10 w-72 h-72 bg-primary/10 dark:bg-primary/5 rounded-full filter blur-3xl -z-10 animate-float-delayed"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column Text */}
            <div className="lg:col-span-7 text-center lg:text-left flex flex-col items-center lg:items-start">
              {/* Badge */}
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary-light text-primary dark:bg-primary/20 dark:text-teal-300 text-xs font-semibold tracking-wide mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span>
                Ứng dụng Blockchain & IPFS Bảo mật cao
              </div>

              {/* Heading */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-[1.1] mb-6">
                Cấp phát & Xác minh
                <span className="block mt-2 gradient-text-teal-blue">
                  Văn Bằng Số Chống Giả
                </span>
              </h1>

              {/* Description */}
              <p className="max-w-xl text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-8">
                Giải pháp toàn diện tối ưu hóa W3C Verifiable Credentials. Số hóa quy trình cấp bằng, 
                đảm bảo tính toàn vẹn 100% bằng cách đối chiếu mã băm on-chain và lưu trữ 
                phi tập trung trên hệ thống IPFS.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <Link
                  href="/verify"
                  className="flex items-center justify-center gap-2 px-8 py-4 text-base font-bold text-white bg-primary hover:bg-primary-hover rounded-2xl shadow-lg shadow-primary/25 hover:shadow-primary/35 transition-all hover:scale-[1.02]"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    ></path>
                  </svg>
                  Xác minh ngay
                </Link>
                <Link
                  href="/login"
                  className="flex items-center justify-center gap-2 px-8 py-4 text-base font-bold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/80 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm transition-all hover:scale-[1.02]"
                >
                  Đăng nhập hệ thống
                </Link>
              </div>

              {/* Stats badges */}
              <div className="mt-12 grid grid-cols-3 gap-6 sm:gap-8 border-t border-gray-100 dark:border-gray-800/80 pt-8 w-full max-w-md">
                <div>
                  <span className="block text-2xl font-bold text-gray-900 dark:text-white">100%</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Không thể làm giả</span>
                </div>
                <div>
                  <span className="block text-2xl font-bold text-gray-900 dark:text-white">&lt; 3s</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Xác minh tức thì</span>
                </div>
                <div>
                  <span className="block text-2xl font-bold text-gray-900 dark:text-white">0đ</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Chi phí xác thực</span>
                </div>
              </div>
            </div>

            {/* Right Column Graphic */}
            <div className="lg:col-span-5 flex justify-center items-center relative">
              {/* Outer Decorative Circle */}
              <div className="absolute w-[420px] h-[420px] rounded-full border border-primary/20 dark:border-primary/10 animate-spin-slow -z-10"></div>
              
              {/* Interactive Certificate Card */}
              <div className="w-full max-w-sm relative bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl p-6 shadow-2xl shadow-primary/10 dark:shadow-black/60 animate-float">
                {/* Ribbon border effect */}
                <div className="absolute top-0 left-0 w-full h-2 rounded-t-3xl bg-gradient-to-r from-primary via-secondary to-teal-400"></div>
                
                {/* Header */}
                <div className="flex justify-between items-start mb-6 mt-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950 flex items-center justify-center text-primary dark:text-teal-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z"></path>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"></path>
                      </svg>
                    </div>
                    <div>
                      <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider">HUST UNIVERSITY</span>
                      <span className="block text-xs font-semibold text-gray-700 dark:text-gray-300">Đại học Bách Khoa</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400 text-[10px] font-bold border border-green-200/50 dark:border-green-900/50">
                    ✓ Verified on-chain
                  </span>
                </div>

                {/* Body */}
                <div className="space-y-4">
                  <div className="text-center py-2 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-gray-200/60 dark:border-gray-800">
                    <span className="block text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Bằng Cử Nhân Kỹ Thuật</span>
                    <span className="block text-lg font-bold text-gray-800 dark:text-white mt-1">CÔNG NGHỆ THÔNG TIN</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="block text-[10px] text-gray-400 uppercase font-medium">Sinh viên nhận</span>
                      <span className="block text-sm font-semibold text-gray-800 dark:text-gray-200">Nguyễn Hoàng Nam</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-gray-400 uppercase font-medium">Xếp loại tốt nghiệp</span>
                      <span className="block text-sm font-semibold text-gray-800 dark:text-gray-200">Xuất Sắc (GPA: 3.82)</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                    <div>
                      <span className="block text-[9px] text-gray-400 uppercase font-bold tracking-wider">IPFS CID</span>
                      <span className="block text-[10px] font-mono text-primary dark:text-teal-400 truncate w-36">QmXoypizjW3WknFiJnKLwHC...</span>
                    </div>
                    <div className="w-12 h-12 bg-white dark:bg-gray-800 p-1 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
                      <svg className="w-full h-full text-gray-800 dark:text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <rect x="2" y="2" width="6" height="6" rx="1" />
                        <rect x="16" y="2" width="6" height="6" rx="1" />
                        <rect x="2" y="16" width="6" height="6" rx="1" />
                        <rect x="16" y="16" width="4" height="4" rx="0.5" />
                        <path d="M10 4h2M10 7h2M4 10v2M7 10h5v2M12 12h2v4M16 10h4v2M10 16h2v4" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Sub blockchain details banner */}
                <div className="mt-4 bg-slate-900 text-slate-300 rounded-xl p-2.5 text-[9px] font-mono flex items-center gap-2 overflow-hidden border border-slate-800">
                  <span className="text-teal-400 font-bold">ETH:</span>
                  <span className="truncate">0x71C7656EC7ab88b098defB751B7401B5f6d8976F</span>
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-teal-400 animate-ping"></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section (3 Steps W3C VC Model) */}
      <section id="solution" className="py-20 bg-gray-50 dark:bg-gray-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-primary dark:text-teal-400 uppercase tracking-widest mb-3">
              MÔ HÌNH VẬN HÀNH
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">
              Quy Trình 3 Bước Chuẩn W3C Verifiable Credentials
            </p>
            <p className="text-gray-500 dark:text-gray-400 mt-4">
              Hệ thống hóa ba nhân tố cốt lõi của quy trình xác minh bằng công nghệ mật mã hóa.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1: Issuer */}
            <div className="bg-white dark:bg-gray-800/50 border border-gray-150 dark:border-gray-800/80 rounded-2xl p-8 shadow-sm hover:shadow-md hover:border-primary/30 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-primary dark:text-teal-400 flex items-center justify-center font-bold text-lg mb-6 group-hover:scale-110 transition-transform">
                01
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Trường Đại Học (Issuer)
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                Tổ chức giáo dục khai báo danh sách tốt nghiệp, sinh tệp tin PDF động từ mẫu bằng có sẵn, 
                sau đó ký số số hóa thông qua ví mật mã để xác thực quyền sở hữu nội dung.
              </p>
              <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-primary dark:text-teal-400">
                <span>Thiết kế & Cấp phát</span>
                <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </div>
            </div>

            {/* Step 2: Storage */}
            <div className="bg-white dark:bg-gray-800/50 border border-gray-150 dark:border-gray-800/80 rounded-2xl p-8 shadow-sm hover:shadow-md hover:border-primary/30 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-secondary dark:text-blue-400 flex items-center justify-center font-bold text-lg mb-6 group-hover:scale-110 transition-transform">
                02
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Blockchain & IPFS (Secure)
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                Tệp tin PDF được lưu phi tập trung lên IPFS để nhận mã băm CID. Tiếp theo, mã CID kèm thông tin 
                metadata được ghi nhận vĩnh viễn lên Blockchain, tạo thành hồ sơ bất biến.
              </p>
              <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-secondary dark:text-blue-400">
                <span>Lưu trữ phi tập trung</span>
                <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </div>
            </div>

            {/* Step 3: Verifier */}
            <div className="bg-white dark:bg-gray-800/50 border border-gray-150 dark:border-gray-800/80 rounded-2xl p-8 shadow-sm hover:shadow-md hover:border-primary/30 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-primary dark:text-teal-400 flex items-center justify-center font-bold text-lg mb-6 group-hover:scale-110 transition-transform">
                03
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Nhà Tuyển Dụng (Verifier)
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                Bên thứ ba/Nhà tuyển dụng truy cập công khai không cần tài khoản, quét mã QR trên bằng, 
                tra cứu ID hoặc tải tệp PDF để so khớp tức thì mã băm với dữ liệu đã lưu on-chain.
              </p>
              <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-primary dark:text-teal-400">
                <span>Đối chiếu tức thì</span>
                <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Details Section */}
      <section id="technology" className="py-20 bg-white dark:bg-[#030712]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left text description */}
            <div className="lg:col-span-5">
              <h2 className="text-xs font-bold text-secondary dark:text-blue-400 uppercase tracking-widest mb-3">
                CÔNG NGHỆ ÁP DỤNG
              </h2>
              <p className="text-3xl font-extrabold text-gray-900 dark:text-white mb-6">
                Những Công Nghệ Tiên Tiến Tạo Nên Sự Tin Cậy Tuyệt Đối
              </p>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                Hệ thống CertiChain kết hợp hài hòa giữa cơ sở dữ liệu truyền thống cùng các giao thức phi tập trung 
                Web3, mang đến trải nghiệm nhanh chóng nhưng vẫn đáp ứng tính an toàn, minh bạch cao nhất.
              </p>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-teal-50 dark:bg-teal-950 text-primary dark:text-teal-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                    ✓
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Tuân thủ tiêu chuẩn W3C Verifiable Credentials số hóa.
                  </span>
                </div>
                <div className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-teal-50 dark:bg-teal-950 text-primary dark:text-teal-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                    ✓
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Tối ưu hóa phí gas giao dịch bằng cấu trúc lưu hash thông minh.
                  </span>
                </div>
                <div className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-teal-50 dark:bg-teal-950 text-primary dark:text-teal-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                    ✓
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Hỗ trợ quét QR trên di động và trích xuất PDF trực tuyến.
                  </span>
                </div>
              </div>
            </div>

            {/* Right tech grid */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Tech 1 */}
              <div className="p-6 bg-slate-50 dark:bg-gray-800/30 rounded-2xl border border-gray-150 dark:border-gray-850">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary dark:text-teal-400 mb-4">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path>
                  </svg>
                </div>
                <h4 className="text-base font-bold text-gray-900 dark:text-white mb-2">Smart Contract</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  Lưu trữ trạng thái hợp lệ, thu hồi trực tiếp trên mạng Blockchain. Phân quyền chặt chẽ thông qua chữ ký số.
                </p>
              </div>

              {/* Tech 2 */}
              <div className="p-6 bg-slate-50 dark:bg-gray-800/30 rounded-2xl border border-gray-150 dark:border-gray-850">
                <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center text-secondary dark:text-blue-400 mb-4">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path>
                  </svg>
                </div>
                <h4 className="text-base font-bold text-gray-900 dark:text-white mb-2">IPFS Pinning</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  Lưu trữ dữ liệu phân tán, chống sửa đổi tập tin. File được trích xuất trực tiếp qua Cổng kết nối IPFS Gateway.
                </p>
              </div>

              {/* Tech 3 */}
              <div className="p-6 bg-slate-50 dark:bg-gray-800/30 rounded-2xl border border-gray-150 dark:border-gray-850">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary dark:text-teal-400 mb-4">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path>
                  </svg>
                </div>
                <h4 className="text-base font-bold text-gray-900 dark:text-white mb-2">QR Code & Hash PDF</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  Mã hóa đường dẫn xác thực thành QR code gắn liền với bằng. Khóa mã băm SHA-256 đối chiếu tập tin PDF tại chỗ.
                </p>
              </div>

              {/* Tech 4 */}
              <div className="p-6 bg-slate-50 dark:bg-gray-800/30 rounded-2xl border border-gray-150 dark:border-gray-850">
                <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center text-secondary dark:text-blue-400 mb-4">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                  </svg>
                </div>
                <h4 className="text-base font-bold text-gray-900 dark:text-white mb-2">Báo Cáo & Kiểm Toán</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  Lưu trữ vết hoạt động (Audit log) chi tiết, theo dõi lịch sử và tần suất xác minh cho người nhận bằng và tổ chức.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section id="comparison" className="py-20 bg-gray-50 dark:bg-gray-900/30 border-t border-b border-gray-200/50 dark:border-gray-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-primary dark:text-teal-400 uppercase tracking-widest mb-3">
              SO SÁNH CÔNG NGHỆ
            </h2>
            <p className="text-3xl font-extrabold text-gray-900 dark:text-white">
              Sự Khác Biệt Giữa Lưu Trữ Truyền Thống Và Blockchain
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/80 rounded-3xl overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                    <th className="p-6 text-sm font-bold text-gray-700 dark:text-gray-200">Tiêu chí so sánh</th>
                    <th className="p-6 text-sm font-bold text-gray-600 dark:text-gray-400">Lưu trữ truyền thống</th>
                    <th className="p-6 text-sm font-bold text-primary dark:text-teal-400 bg-teal-50/40 dark:bg-teal-950/20">Blockchain + IPFS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-150 dark:divide-gray-700">
                  <tr>
                    <td className="p-6 text-sm font-bold text-gray-900 dark:text-white">Khả năng sửa đổi dữ liệu</td>
                    <td className="p-6 text-sm text-gray-600 dark:text-gray-400">Dễ bị quản trị viên database sửa âm thầm hoặc do tấn công hacker</td>
                    <td className="p-6 text-sm text-gray-700 dark:text-gray-300 bg-teal-50/20 dark:bg-teal-950/10">Bất biến, không thể sửa đổi một khi đã ghi giao dịch thành công</td>
                  </tr>
                  <tr>
                    <td className="p-6 text-sm font-bold text-gray-900 dark:text-white">Xác minh công khai</td>
                    <td className="p-6 text-sm text-gray-600 dark:text-gray-400">Thủ công, phụ thuộc cổng thông tin nhà trường, phản hồi chậm</td>
                    <td className="p-6 text-sm text-gray-700 dark:text-gray-300 bg-teal-50/20 dark:bg-teal-950/10">Công khai tức thì 24/7 qua mã định danh, quét QR hoặc so sánh file</td>
                  </tr>
                  <tr>
                    <td className="p-6 text-sm font-bold text-gray-900 dark:text-white">Chống giả mạo tập tin</td>
                    <td className="p-6 text-sm text-gray-600 dark:text-gray-400">Thấp, file PDF dễ chỉnh sửa nội dung bằng phần mềm đồ họa</td>
                    <td className="p-6 text-sm text-gray-700 dark:text-gray-300 bg-teal-50/20 dark:bg-teal-950/10">Tuyệt đối, mọi thay đổi dù 1 ký tự sẽ làm thay đổi hoàn toàn mã hash</td>
                  </tr>
                  <tr>
                    <td className="p-6 text-sm font-bold text-gray-900 dark:text-white">Tính sẵn sàng dữ liệu</td>
                    <td className="p-6 text-sm text-gray-600 dark:text-gray-400">Phụ thuộc server đơn lẻ (SPOF - Single Point of Failure)</td>
                    <td className="p-6 text-sm text-gray-700 dark:text-gray-300 bg-teal-50/20 dark:bg-teal-950/10">Phân tán cao trên hàng nghìn node IPFS và Blockchain, không sợ sập server</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-16 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            {/* Brand column */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-bold text-sm">
                  C
                </div>
                <span className="font-bold text-white text-base">CertiChain</span>
              </div>
              <p className="text-xs leading-relaxed text-slate-500">
                Hệ thống xác thực và cấp phát văn bằng dựa trên nền tảng Blockchain. Đề tài tốt nghiệp phân tích và thiết kế hệ thống.
              </p>
            </div>

            {/* Quick links */}
            <div>
              <h5 className="font-bold text-slate-200 text-sm mb-4">Giải pháp</h5>
              <ul className="space-y-2 text-xs">
                <li><a href="#" className="hover:text-white transition-colors">Cho Trường đại học</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cho Nhà tuyển dụng</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cho Sinh viên</a></li>
              </ul>
            </div>

            {/* Tech references */}
            <div>
              <h5 className="font-bold text-slate-200 text-sm mb-4">Công nghệ Web3</h5>
              <ul className="space-y-2 text-xs">
                <li><a href="#" className="hover:text-white transition-colors">Smart Contract Solidity</a></li>
                <li><a href="#" className="hover:text-white transition-colors">IPFS Storage</a></li>
                <li><a href="#" className="hover:text-white transition-colors">W3C Credentials</a></li>
              </ul>
            </div>

            {/* Contact details */}
            <div>
              <h5 className="font-bold text-slate-200 text-sm mb-4">Thông tin liên hệ</h5>
              <p className="text-xs text-slate-500 leading-relaxed">
                Email: contact@certichain.edu.vn<br />
                Đồ án Tốt nghiệp CNTT 2026<br />
                Đại học Bách Khoa Hà Nội
              </p>
            </div>
          </div>

          <hr className="border-slate-800 my-8" />

          {/* Sub footer */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-600">
            <span>© 2026 CertiChain Project. All rights reserved.</span>
            <div className="flex gap-6">
              <a href="#" className="hover:text-slate-400">Điều khoản</a>
              <a href="#" className="hover:text-slate-400">Bảo mật</a>
              <a href="#" className="hover:text-slate-400">Github</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

