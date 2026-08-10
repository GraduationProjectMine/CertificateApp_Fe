"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/components/AuthContext";
import { notificationApi } from "@/features/notifications/services/notification.api";

export default function SettingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [emailNotif, setEmailNotif] = useState(false);
  const [loadingPref, setLoadingPref] = useState(true);

  useEffect(() => {
    notificationApi.preferences()
      .then((data) => setEmailNotif(data.email_notifications))
      .catch(() => {})
      .finally(() => setLoadingPref(false));
  }, []);

  const toggleEmailNotif = async () => {
    const next = !emailNotif;
    setEmailNotif(next);
    try {
      await notificationApi.updatePreferences(next);
    } catch {
      setEmailNotif(!next);
    }
  };

  const sections = [
    {
      title: "Tài khoản",
      items: [
        { label: "Hồ sơ cá nhân", desc: "Cập nhật thông tin cá nhân của bạn", href: "/student/profile" },
        { label: "Đổi mật khẩu", desc: "Thay đổi mật khẩu đăng nhập", href: "/student/profile/change-password" },
      ],
    },
    {
      title: "Thông báo",
      items: [
        { label: "Thông báo", desc: "Xem các thông báo về văn bằng", href: "/student/notifications" },
      ],
    },
    {
      title: "Thông tin tài khoản",
      items: [],
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Cài đặt</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Quản lý tài khoản và tùy chỉnh.</p>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800/60 rounded-3xl p-5 text-sm space-y-3">
        <h3 className="text-xs font-bold uppercase text-gray-400 dark:text-gray-500 tracking-wider">Thông tin tài khoản</h3>
        <dl className="space-y-2">
          <div className="flex justify-between">
            <dt className="text-gray-500 dark:text-gray-400 text-xs">Họ tên</dt>
            <dd className="font-medium text-gray-900 dark:text-white text-xs">{user?.name}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500 dark:text-gray-400 text-xs">Email</dt>
            <dd className="font-medium text-gray-900 dark:text-white text-xs">{user?.email}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500 dark:text-gray-400 text-xs">Vai trò</dt>
            <dd className="font-medium text-gray-900 dark:text-white text-xs">Sinh viên</dd>
          </div>
        </dl>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800/60 rounded-3xl p-5 text-sm space-y-4">
        <h3 className="text-xs font-bold uppercase text-gray-400 dark:text-gray-500 tracking-wider">Tuỳ chọn thông báo</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Thông báo qua email</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Nhận thông báo qua email khi có văn bằng mới</p>
          </div>
          {loadingPref ? (
            <div className="w-10 h-6 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
          ) : (
            <button
              onClick={toggleEmailNotif}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                emailNotif ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                  emailNotif ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          )}
        </div>
      </div>

      {sections.map((section) => (
        section.items.length > 0 && (
          <div key={section.title} className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800/60 rounded-3xl overflow-hidden">
            <div className="px-5 pt-4 pb-2">
              <h3 className="text-xs font-bold uppercase text-gray-400 dark:text-gray-500 tracking-wider">{section.title}</h3>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-800/60">
              {section.items.map((item) => (
                <button
                  key={item.label}
                  onClick={() => router.push(item.href)}
                  className="w-full flex items-center justify-between px-5 py-3.5 text-left hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-all"
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.label}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.desc}</p>
                  </div>
                  <svg className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        )
      ))}
    </div>
  );
}