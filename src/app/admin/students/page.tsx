"use client";
import styles from "./page.module.css";
import React from "react";

export default function AdminStudentsPage() {
  const students = [
    { code: "20202345", name: "Nguyễn Văn Hùng", email: "hung.nv202345@sis.hust.edu.vn", department: "CNTT", major: "Khoa học máy tính", status: "Active", count: 2 },
    { code: "20201192", name: "Lê Thị Thu", email: "thu.lt201192@sis.hust.edu.vn", department: "CNTT", major: "Kỹ thuật máy tính", status: "Active", count: 1 },
    { code: "20203498", name: "Phạm Hoàng Minh", email: "minh.ph203498@sis.hust.edu.vn", department: "CNTT", major: "Công nghệ thông tin", status: "Active", count: 1 },
    { code: "20205822", name: "Vũ Phương Thảo", email: "thao.vp205822@sis.hust.edu.vn", department: "Điện tử", major: "Kỹ thuật điện tử", status: "Active", count: 1 },
    { code: "20206190", name: "Trần Đức Hải", email: "hai.td206190@sis.hust.edu.vn", department: "Cơ khí", major: "Kỹ thuật cơ điện tử", status: "Pending", count: 0 }
  ];

  return (
    <div className={styles._1}>
      {/* Title & Actions */}
      <div className={styles._2}>
        <div>
          <h1 className={styles._3}>Quản lý Sinh viên</h1>
          <p className={styles._4}>Quản lý thông tin hồ sơ học tập và trạng thái tài khoản sinh viên nhận bằng.</p>
        </div>
        <div className={styles._5}>
          <button className={styles._6}>
            + Thêm sinh viên
          </button>
          <button className={styles._7}>
            Import Excel
          </button>
        </div>
      </div>

      {/* Filter panel */}
      <div className={styles._8}>
        <input
          type="text"
          placeholder="Tìm kiếm theo mã sinh viên, họ tên, email..."
          className={styles._9}
        />
        <div className={styles._10}>
          <select className={styles._11}>
            <option>Tất cả các khoa</option>
            <option>CNTT</option>
            <option>Điện tử</option>
            <option>Cơ khí</option>
          </select>
          <select className={styles._11}>
            <option>Tất cả trạng thái</option>
            <option>Active</option>
            <option>Pending</option>
          </select>
        </div>
      </div>

      {/* List Table Card */}
      <div className={styles._12}>
        <div className={styles._13}>
          <table className={styles._14}>
            <thead>
              <tr className={styles._15}>
                <th className={styles._16}>Mã SV</th>
                <th className={styles._16}>Họ tên</th>
                <th className={styles._16}>Email</th>
                <th className={styles._16}>Khoa</th>
                <th className={styles._16}>Chuyên ngành</th>
                <th className={styles._16}>Trạng thái</th>
                <th className={styles._16}>Bằng cấp</th>
                <th className={styles._17}>Thao tác</th>
              </tr>
            </thead>
            <tbody className={styles._18}>
              {students.map((student) => (
                <tr key={student.code} className={`hover:bg-slate-55 ${styles._19}`}>
                  <td className={styles._20}>{student.code}</td>
                  <td className={styles._21}>{student.name}</td>
                  <td className={styles._16}>{student.email}</td>
                  <td className={styles._22}>{student.department}</td>
                  <td className={styles._23}>{student.major}</td>
                  <td className={styles._16}>
                    <span className={`${styles._0} ${
                      student.status === "Active"
                        ? "bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 border-green-200/50"
                        : "bg-amber-50 dark:bg-amber-950/20 text-warning border-amber-250/50"
                    }`}>
                      {student.status}
                    </span>
                  </td>
                  <td className={styles._24}>{student.count}</td>
                  <td className={styles._25}>
                    <button className={styles._26}>Sửa</button>
                    <button className={styles._27}>Khóa</button>
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
