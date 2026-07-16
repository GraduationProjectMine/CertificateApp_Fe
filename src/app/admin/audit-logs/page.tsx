"use client";
import styles from "./page.module.css";
import React from "react";

export default function AdminAuditLogsPage() {
  return (
    <div className={styles._1}>
      <div>
        <h1 className={styles._2}>Nhật ký hoạt động (Audit Logs)</h1>
        <p className={styles._3}>Backend hiện chưa có API audit log, nên dữ liệu mẫu đã được gỡ khỏi màn này.</p>
      </div>

      <div className={styles._4}>
        <div className="p-8 text-center text-xs text-gray-400">
          Chưa có dữ liệu audit log từ backend.
        </div>
      </div>
    </div>
  );
}
