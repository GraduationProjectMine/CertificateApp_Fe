"use client";
import styles from "./page.module.css";
import React from "react";

export default function AdminRevocationsPage() {
  return (
    <div className={styles._1}>
      <div className={styles._2}>
        <div>
          <h1 className={styles._3}>Yêu cầu thu hồi</h1>
          <p className={styles._4}>Backend hiện chưa có API thu hồi văn bằng, nên thao tác này đang được khóa.</p>
        </div>
      </div>

      <div className={styles._13}>
        <div className="p-8 text-center text-xs text-gray-400">
          Chưa có dữ liệu thu hồi từ backend.
        </div>
      </div>
    </div>
  );
}
