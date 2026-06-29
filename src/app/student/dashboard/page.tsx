"use client";
import React from "react";
import Link from "next/link";
import styles from "./page.module.css";

export default function StudentDashboard() {
  const stats = [
    {
      label: "Tổng văn bằng",
      value: "3",
      icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
      color: "text-primary bg-primary/10",
    },
    {
      label: "Đang hợp lệ",
      value: "2",
      icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
      color: "text-emerald-600 bg-emerald-100 dark:bg-emerald-950/30",
    },
    {
      label: "Đã xác thực on-chain",
      value: "3",
      icon: "M21 12a9 9 0 11-18 0 9 9 0 0118 0z M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z",
      color: "text-secondary bg-secondary/10",
    },
  ];

  return (
    <div className={styles._1}>
      <div className={styles._2}>
        <h1 className={styles._3}>Bảng điều khiển</h1>
        <p className={styles._4}>Chào mừng bạn đến với hệ thống quản lý văn bằng số</p>
      </div>

      <div className={styles._5}>
        {stats.map((s, i) => (
          <div key={i} className={styles._6}>
            <div className={`${styles._7} ${s.color}`}>
              <svg className={styles._8} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={s.icon} />
              </svg>
            </div>
            <p className={styles._9}>{s.value}</p>
            <p className={styles._10}>{s.label}</p>
          </div>
        ))}
      </div>

      <div className={styles._11}>
        <h2 className={styles._12}>Văn bằng gần đây</h2>
        <div className={styles._13}>
          <Link href="/student/certificates" className={styles._14}>
            <div className={styles._15}>
              <div className={styles._16}>
                <svg className={styles._17} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                </svg>
              </div>
              <div>
                <p className={styles._18}>Bằng cử nhân Công nghệ thông tin</p>
                <p className={styles._19}>Đại học Bách khoa Hà Nội · 20/06/2026</p>
              </div>
            </div>
            <span className={styles._20}>Hợp lệ</span>
          </Link>
          <Link href="/student/certificates" className={styles._14}>
            <div className={styles._15}>
              <div className={styles._16}>
                <svg className={styles._17} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className={styles._18}>Chứng chỉ Tiếng Anh B2</p>
                <p className={styles._19}>Đại học Bách khoa Hà Nội · 15/05/2026</p>
              </div>
            </div>
            <span className={styles._20}>Hợp lệ</span>
          </Link>
        </div>
        <Link href="/student/certificates" className={styles._21}>
          Xem tất cả văn bằng
          <svg className={styles._22} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
