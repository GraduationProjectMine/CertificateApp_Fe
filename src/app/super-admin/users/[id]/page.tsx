"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { superAdminApi, type User } from "@/features/super-admin/services/api";

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [userInfo, setUserInfo] = useState<User & { type: string; staff_id: string; name: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    superAdminApi.getUser(id)
      .then(setUserInfo)
      .catch((err) => setError(err.message || "Không thể tải chi tiết người dùng"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="text-center py-16 text-gray-400 text-xs">Đang tải...</div>;
  if (error) return <div className="text-center py-16 text-red-500 text-xs">{error}</div>;
  if (!userInfo) return <div className="text-center py-16 text-gray-400 text-xs">Không tìm thấy người dùng</div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-lg font-black text-gray-900 dark:text-white">{userInfo.name}</h1>
          <p className="text-[10px] text-gray-400 mt-0.5">ID: {userInfo.staff_id || userInfo.student_id}</p>
        </div>
        <span className={`ml-auto inline-block px-3 py-1 rounded-lg text-xs font-bold ${
          userInfo.status === "ACTIVE" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
        }`}>
          {userInfo.status === "ACTIVE" ? "Hoạt động" : "Bị khóa"}
        </span>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 space-y-4">
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Họ tên</span>
            <span className="font-semibold">{userInfo.name}</span>
          </div>
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Email</span>
            <span>{userInfo.email}</span>
          </div>
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Vai trò</span>
            <span className="font-semibold text-primary">{userInfo.role}</span>
          </div>
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Loại tài khoản</span>
            <span className="capitalize">{userInfo.type}</span>
          </div>
          <div className="col-span-2">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Tổ chức trực thuộc</span>
            <span>{userInfo.organization_name}</span>
          </div>
          <div className="col-span-2">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Ngày tham gia hệ thống</span>
            <span>{new Date(userInfo.createdAt).toLocaleString("vi-VN")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
