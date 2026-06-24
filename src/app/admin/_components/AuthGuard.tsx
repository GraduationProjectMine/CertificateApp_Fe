"use client";

import React from "react";
import Link from "next/link";

export function LoadingScreen() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 flex flex-col items-center justify-center">
      <svg className="animate-spin h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <span className="text-xs font-semibold text-gray-500 mt-4 select-none">Đang tải cấu hình cổng quản trị...</span>
    </div>
  );
}

export function UnauthorizedScreen() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 flex flex-col items-center justify-center p-6 text-center font-sans">
      <div className="w-16 h-16 bg-red-100 dark:bg-red-950/30 text-danger rounded-full flex items-center justify-center mb-6">
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m0-8v6m0 5h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      </div>
      <h1 className="text-2xl font-black text-gray-900 dark:text-white">Truy Cập Bị Chặn</h1>
      <p className="max-w-md text-sm text-gray-500 dark:text-gray-400 mt-3 leading-relaxed">
        Tài khoản đăng nhập hiện tại không thuộc nhóm quản lý nhà trường. Bạn cần đăng nhập bằng tài khoản HUST Admin hoặc ví MetaMask có thẩm quyền.
      </p>
      <div className="flex gap-4 mt-8">
        <Link
          href="/auth/login"
          className="px-6 py-3 text-xs font-bold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-md transition-all select-none"
        >
          Đăng nhập lại
        </Link>
        <Link
          href="/"
          className="px-6 py-3 text-xs font-bold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl transition-all select-none"
        >
          Quay về trang chủ
        </Link>
      </div>
    </div>
  );
}
