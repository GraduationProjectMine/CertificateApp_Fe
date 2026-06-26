"use client";
import styles from "./page.module.css";
import React, { useState } from "react";

export default function AdminRevocationsPage() {
  const [revocations] = useState([
    { id: "cert-2026-006", studentName: "Đỗ Minh Khang", reason: "Sai thông tin ngày tháng năm sinh trên phôi bằng", date: "21/06/2026", txHash: "0xfa39...bb21", authority: "Phòng Đào Tạo" },
    { id: "cert-2025-102", studentName: "Trần Thế Bảo", reason: "Phát hiện gian lận trong hồ sơ đầu vào tốt nghiệp", date: "10/12/2025", txHash: "0x88f2...00ae", authority: "Ban Giám Hiệu" }
  ]);

  return (
    <div className={styles._1}>
      <div className={styles._2}>
        <div>
          <h1 className={styles._3}>Yêu cầu thu hồi</h1>
          <p className={styles._4}>Thu hồi hiệu lực văn bằng đã cấp phát do sai lệch thông tin hoặc lý do kỷ luật.</p>
        </div>
      </div>

      <div className={styles._5}>
        <h2 className={styles._6}>Tạo yêu cầu thu hồi mới</h2>
        
        <div className={styles._7}>
          <div>
            <label className={styles._8}>Nhập mã số văn bằng cần thu hồi</label>
            <div className={styles._9}>
              <input
                type="text"
                placeholder="Ví dụ: cert-2026-001"
                className={styles._10}
              />
              <button className={styles._11}>
                Tìm kiếm
              </button>
            </div>
          </div>
          <div>
            <label className={styles._8}>Lý do thu hồi (Bắt buộc)</label>
            <input
              type="text"
              placeholder="Nhập lý do thu hồi chi tiết..."
              className={styles._12}
            />
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className={styles._13}>
        <div className={styles._14}>
          <h2 className={styles._6}>Lịch sử thu hồi</h2>
        </div>
        <div className={styles._15}>
          <table className={styles._16}>
            <thead>
              <tr className={styles._17}>
                <th className={styles._18}>Mã văn bằng</th>
                <th className={styles._18}>Sinh viên</th>
                <th className={styles._18}>Lý do thu hồi</th>
                <th className={styles._18}>Ngày thu hồi</th>
                <th className={styles._18}>Cơ quan quyết định</th>
                <th className={styles._18}>Mã giao dịch (Tx)</th>
                <th className={styles._19}>Trạng thái</th>
              </tr>
            </thead>
            <tbody className={styles._20}>
              {revocations.map((item) => (
                <tr key={item.id} className={`hover:bg-slate-55 ${styles._21}`}>
                  <td className={styles._22}>{item.id}</td>
                  <td className={styles._23}>{item.studentName}</td>
                  <td className={styles._24} title={item.reason}>{item.reason}</td>
                  <td className={styles._18}>{item.date}</td>
                  <td className={styles._25}>{item.authority}</td>
                  <td className={styles._26}>{item.txHash}</td>
                  <td className={styles._19}>
                    <span className={styles._27}>REVOKED</span>
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
