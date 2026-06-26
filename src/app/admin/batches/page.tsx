"use client";
import styles from "./page.module.css";
import React from "react";

export default function AdminBatchesPage() {
  const batches = [
    { id: "batch-2026-01", name: "Đợt tốt nghiệp K65 khoa CNTT", total: 450, success: 450, failed: 0, date: "22/06/2026", status: "Completed" },
    { id: "batch-2026-02", name: "Chứng chỉ ngoại ngữ đợt 1 năm 2026", total: 120, success: 118, failed: 2, date: "18/06/2026", status: "Completed" },
    { id: "batch-2026-03", name: "Đợt tốt nghiệp thạc sĩ Viện CNTT", total: 35, success: 0, failed: 0, date: "15/06/2026", status: "Draft" }
  ];

  return (
    <div className={styles._1}>
      <div className={styles._2}>
        <div>
          <h1 className={styles._3}>Cấp bằng hàng loạt</h1>
          <p className={styles._4}>Cấp phát đồng thời hàng ngàn văn bằng thông qua việc import tệp Excel cấu trúc mẫu.</p>
        </div>
        <button className={styles._5}>
          + Khởi tạo đợt cấp phát mới
        </button>
      </div>

      <div className={styles._6}>
        <div className={styles._7}>
          <table className={styles._8}>
            <thead>
              <tr className={styles._9}>
                <th className={styles._10}>Mã lô</th>
                <th className={styles._10}>Tên đợt cấp phát</th>
                <th className={styles._11}>Tổng số bằng</th>
                <th className={styles._11}>Thành công</th>
                <th className={styles._11}>Thất bại</th>
                <th className={styles._10}>Ngày tạo</th>
                <th className={styles._10}>Trạng thái</th>
                <th className={styles._12}>Hành động</th>
              </tr>
            </thead>
            <tbody className={styles._13}>
              {batches.map((batch) => (
                <tr key={batch.id} className={`hover:bg-slate-55 ${styles._14}`}>
                  <td className={styles._15}>{batch.id}</td>
                  <td className={styles._16}>{batch.name}</td>
                  <td className={styles._17}>{batch.total}</td>
                  <td className={styles._18}>{batch.success}</td>
                  <td className={styles._19}>{batch.failed}</td>
                  <td className={styles._10}>{batch.date}</td>
                  <td className={styles._10}>
                    <span className={`${styles._0} ${
                      batch.status === "Completed"
                        ? "bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 border-green-200/50"
                        : "bg-slate-100 dark:bg-slate-800 text-gray-400 border-gray-200/50"
                    }`}>
                      {batch.status}
                    </span>
                  </td>
                  <td className={styles._12}>
                    <button className={styles._20}>Chi tiết</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
