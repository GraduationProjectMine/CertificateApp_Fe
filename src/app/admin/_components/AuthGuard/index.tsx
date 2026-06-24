"use client";
import styles from "./AuthGuard.module.css";
import React from "react";
import Link from "next/link";

export function LoadingScreen() {
  return (
    <div className={styles._1}>
      <svg className={styles._2} fill="none" viewBox="0 0 24 24">
        <circle className={styles._3} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className={styles._4} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <span className={styles._5}>Đang tải cấu hình cổng quản trị...</span>
    </div>
  );
}

export function UnauthorizedScreen() {
  return (
    <div className={styles._6}>
      <div className={styles._7}>
        <svg className={styles._8} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m0-8v6m0 5h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      </div>
      <h1 className={styles._9}>Truy Cập Bị Chặn</h1>
      <p className={styles._10}>
        Tài khoản đăng nhập hiện tại không thuộc nhóm quản lý nhà trường. Bạn cần đăng nhập bằng tài khoản HUST Admin hoặc ví MetaMask có thẩm quyền.
      </p>
      <div className={styles._11}>
        <Link
          href="/auth/login"
          className={styles._12}
        >
          Đăng nhập lại
        </Link>
        <Link
          href="/"
          className={styles._13}
        >
          Quay về trang chủ
        </Link>
      </div>
    </div>
  );
}
