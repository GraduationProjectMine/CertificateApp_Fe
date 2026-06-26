"use client";
import styles from "./page.module.css";
import React from "react";

export default function AdminTemplatesPage() {
  const templates = [
    { id: "temp-1", name: "Mẫu bằng Đại học Bách Khoa (Mặc định)", type: "Cử nhân kỹ sư", date: "20/06/2026", creator: "GS. TS. Huỳnh Quyết Thắng", active: true },
    { id: "temp-2", name: "Mẫu chứng chỉ tiếng Anh liên kết", type: "Chứng chỉ ngắn hạn", date: "15/06/2026", creator: "Phòng Đào tạo", active: true },
    { id: "temp-3", name: "Mẫu bằng Thạc sĩ công nghệ", type: "Thạc sĩ", date: "10/06/2026", creator: "GS. TS. Huỳnh Quyết Thắng", active: false }
  ];

  return (
    <div className={styles._1}>
      <div className={styles._2}>
        <div>
          <h1 className={styles._3}>Quản lý Mẫu Bằng</h1>
          <p className={styles._4}>Thiết kế mẫu bằng kéo thả, định nghĩa các thuộc tính động và chữ ký số mặc định.</p>
        </div>
        <button className={styles._5}>
          + Thiết kế mẫu bằng mới
        </button>
      </div>

      <div className={styles._6}>
        {templates.map((temp) => (
          <div key={temp.id} className={styles._7}>
            <div className={styles._8}>
              <div className={styles._9}>
                <span className={styles._10}>Preview Template</span>
              </div>
              <div>
                <h3 className={styles._11}>{temp.name}</h3>
                <span className={styles._12}>Phân hệ: {temp.type}</span>
              </div>
            </div>
            <div className={styles._13}>
              <div>
                <span className={styles._14}>Người tạo: {temp.creator}</span>
                <span className={styles._14}>Ngày tạo: {temp.date}</span>
              </div>
              <span className={`${styles._0} ${
                temp.active
                  ? "bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 border-green-200/50"
                  : "bg-slate-100 dark:bg-slate-800 text-gray-400 border-gray-200/50"
              }`}>
                {temp.active ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
