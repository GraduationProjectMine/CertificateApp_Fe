"use client";
import React from "react";
import styles from "./page.module.css";
import { useAuth } from "@/features/auth/components/AuthContext";

export default function StudentProfile() {
  const { user } = useAuth();

  return (
    <div className={styles._1}>
      <h1 className={styles._2}>Hồ sơ sinh viên</h1>
      <div className="mt-4 rounded-2xl border border-gray-200/60 bg-white p-5 text-sm dark:border-gray-800/60 dark:bg-gray-900">
        <dl className="space-y-3">
          <div>
            <dt className="text-xs font-bold uppercase text-gray-400">Họ tên</dt>
            <dd className={styles._3}>{user?.name || "Chưa có thông tin"}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase text-gray-400">Email</dt>
            <dd className={styles._3}>{user?.email || "Chưa có thông tin"}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase text-gray-400">Mã tài khoản</dt>
            <dd className={styles._3}>{user?.id || "Chưa có thông tin"}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
