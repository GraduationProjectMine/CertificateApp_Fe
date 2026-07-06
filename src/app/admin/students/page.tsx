"use client";
import styles from "./page.module.css";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { StudentDto } from "@/features/students/services/student.api";

const STORAGE_KEY = "students";

function loadStudents(): StudentDto[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export default function AdminStudentsPage() {
  const router = useRouter();
  const [students, setStudents] = useState<StudentDto[]>([]);
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState("");

  useEffect(() => {
    setStudents(loadStudents());
  }, []);

  const refresh = () => {
    setStudents(loadStudents());
  };

  const handleDelete = (studentId: string) => {
    const updated = students.filter((s) => s.student_id !== studentId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setStudents(updated);
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(""), 2000);
  };

  const filtered = students.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      s.student_fullName.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      s.student_id.toLowerCase().includes(q)
    );
  });

  return (
    <div className={styles._1}>
      <div className={styles._2}>
        <div>
          <h1 className={styles._3}>Quản lý Sinh viên</h1>
          <p className={styles._4}>Quản lý danh sách sinh viên đã tạo để cấp văn bằng.</p>
        </div>
        <div className={styles._5}>
          <button onClick={() => router.push("/admin/students/create")} className={styles._6}>
            + Thêm sinh viên
          </button>
        </div>
      </div>

      <div className={styles._8}>
        <input
          type="text"
          placeholder="Tìm kiếm theo tên, email, ID..."
          className={styles._9}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className={styles._12}>
        <div className={styles._13}>
          {students.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-xs">
              Chưa có sinh viên nào.{' '}
              <button onClick={() => router.push("/admin/students/create")} className="text-primary underline">Tạo sinh viên đầu tiên</button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-xs">Không tìm thấy kết quả.</div>
          ) : (
            <table className={styles._14}>
              <thead>
                <tr className={styles._15}>
                  <th className={styles._16}>ID</th>
                  <th className={styles._16}>Họ tên</th>
                  <th className={styles._16}>Email</th>
                  <th className={styles._16}>Trạng thái</th>
                  <th className={styles._17}>Thao tác</th>
                </tr>
              </thead>
              <tbody className={styles._18}>
                {filtered.map((student) => (
                  <tr key={student.student_id} className={`hover:bg-slate-55 ${styles._19}`}>
                    <td className={styles._20}>
                      <span className="font-mono text-[10px]">{student.student_id.slice(0, 8)}...</span>
                      <button
                        onClick={() => handleCopyId(student.student_id)}
                        className="ml-2 text-[9px] text-primary hover:underline"
                      >
                        {copiedId === student.student_id ? "✓ Copied" : "Copy ID"}
                      </button>
                    </td>
                    <td className={styles._21}>{student.student_fullName}</td>
                    <td className={styles._16}>{student.email}</td>
                    <td className={styles._16}>
                      <span className={`${styles._0} ${
                        student.status === "ACTIVE"
                          ? "bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 border-green-200/50"
                          : "bg-amber-50 dark:bg-amber-950/20 text-warning border-amber-250/50"
                      }`}>
                        {student.status}
                      </span>
                    </td>
                    <td className={styles._25}>
                      <button onClick={() => handleDelete(student.student_id)} className={styles._27}>
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
