"use client";
import styles from "./page.module.css";
import React from "react";

export default function AdminBatchesPage() {
  return (
    <div className={styles._1}>
      <div className={styles._2}>
        <div>
          <h1 className={styles._3}>Cấp bằng hàng loạt</h1>
          <p className={styles._4}>Backend hiện chưa có API cấp phát hàng loạt, nên màn này chưa bật thao tác.</p>
        </div>
        <button className={styles._5} disabled>
          + Khởi tạo đợt cấp phát mới
        </button>
      </div>

      <div className={styles._6}>
        <div className="p-8 text-center text-xs text-gray-400">
          Chưa có dữ liệu lô cấp phát từ backend.
        </div>
      </div>
    </div>
  );
}
