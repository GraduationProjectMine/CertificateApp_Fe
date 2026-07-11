"use client";
import styles from "./page.module.css";
import React from "react";

export default function AdminTemplatesPage() {
  return (
    <div className={styles._1}>
      <div className={styles._2}>
        <div>
          <h1 className={styles._3}>Quản lý Mẫu Bằng</h1>
          <p className={styles._4}>Backend hiện chưa có API mẫu văn bằng, nên dữ liệu giả đã được gỡ khỏi màn này.</p>
        </div>
        <button className={styles._5} disabled>
          + Thiết kế mẫu bằng mới
        </button>
      </div>

      <div className={styles._6}>
        <div className="p-8 text-center text-xs text-gray-400">
          Chưa có dữ liệu mẫu văn bằng từ backend.
        </div>
      </div>
    </div>
  );
}
