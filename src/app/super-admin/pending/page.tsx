"use client";
import styles from "./page.module.css";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../features/auth/components/AuthContext";

export default function PendingApprovalsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && (!user || (user.role !== "super_admin" && user.role !== "sysadmin"))) {
      router.push("/auth/login");
    }
  }, [user, authLoading, router]);

  if (authLoading) return <div className={styles._1}>Đang tải...</div>;

  return (
    <div className={styles._2}>
      <h1 className={styles._3}>Phê duyệt trường học</h1>
      <p className={styles._4}>
        Backend hiện chưa cung cấp API phê duyệt tổ chức, nên màn này chỉ hiển thị trạng thái trống.
      </p>

      <div className={styles._12}>
        <p className={styles._13}>Chưa có dữ liệu phê duyệt từ backend</p>
        <p className={styles._14}>Kết nối API super-admin trước khi bật thao tác duyệt hoặc từ chối.</p>
      </div>
    </div>
  );
}
