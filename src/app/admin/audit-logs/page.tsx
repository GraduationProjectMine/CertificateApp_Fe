"use client";
import styles from "./page.module.css";
import React from "react";

export default function AdminAuditLogsPage() {
  const logs = [
    { id: "log-1", time: "22/06/2026 15:20:11", actor: "admin@hust.edu.vn", action: "Đăng nhập hệ thống", details: "Đăng nhập bằng phiên email từ địa chỉ IP: 192.168.1.12" },
    { id: "log-2", time: "22/06/2026 14:15:30", actor: "admin@hust.edu.vn", action: "Cấp phát văn bằng", details: "Cấp bằng cử nhân thành công cho Nguyễn Văn Hùng (Mã bằng: cert-2026-001)" },
    { id: "log-3", time: "21/06/2026 18:45:02", actor: "admin@hust.edu.vn", action: "Thu hồi văn bằng", details: "Thu hồi thành công văn bằng Đỗ Minh Khang (Mã bằng: cert-2026-006)" },
    { id: "log-4", time: "20/06/2026 09:30:45", actor: "admin@hust.edu.vn", action: "Thêm sinh viên", details: "Thêm mới sinh viên Nguyễn Văn Hùng (Mã SV: 20202345) vào cơ sở dữ liệu" }
  ];

  return (
    <div className={styles._1}>
      <div>
        <h1 className={styles._2}>Nhật ký hoạt động (Audit Logs)</h1>
        <p className={styles._3}>Lịch sử ghi lại tất cả các hoạt động quản trị trên cổng thông tin nhà trường để phục vụ mục đích kiểm toán.</p>
      </div>

      <div className={styles._4}>
        <div className={styles._5}>
          <table className={styles._6}>
            <thead>
              <tr className={styles._7}>
                <th className={styles._8}>Thời gian</th>
                <th className={styles._8}>Người thực hiện</th>
                <th className={styles._8}>Hành động</th>
                <th className={styles._8}>Chi tiết hoạt động</th>
              </tr>
            </thead>
            <tbody className={styles._9}>
              {logs.map((log) => (
                <tr key={log.id} className={`hover:bg-slate-55 ${styles._10}`}>
                  <td className={styles._11}>{log.time}</td>
                  <td className={styles._12}>{log.actor}</td>
                  <td className={styles._13}>{log.action}</td>
                  <td className={styles._14}>{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
