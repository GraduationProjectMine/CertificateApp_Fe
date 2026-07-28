"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useI18n } from "@/features/i18n/I18nContext";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  event_type?: string;
  related_id?: string;
  deep_link?: string;
  is_read: boolean;
  createdAt: string;
}

const EVENT_ICONS: Record<string, string> = {
  CERT_ISSUED: "🎓",
  CERT_REVOKED: "🚫",
  CERT_SUSPENDED: "⏸️",
  DISPUTE_APPROVED: "✅",
  DISPUTE_REJECTED: "❌",
  SHARE_EXPIRING: "⏰",
  INFO: "🔔",
};

export default function NotificationsPage() {
  const { t } = useI18n();
  const router = useRouter();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [emailPref, setEmailPref] = useState(true);
  const [updatingPref, setUpdatingPref] = useState(false);
  const [filter, setFilter] = useState("ALL");

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
  const getToken = () =>
    typeof window !== "undefined" ? localStorage.getItem("accessToken") || "" : "";

  const fetchNotifications = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) setNotifications(await res.json());
      else setError(t("student.notifications.fetch_failed"));
    } catch {
      setError(t("student.notifications.fetch_failed"));
    } finally {
      setLoading(false);
    }
  };

  const fetchPreferences = async () => {
    try {
      const res = await fetch(`${API_URL}/notifications/preferences`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) {
        const data = await res.json();
        setEmailPref(data.email_notifications);
      }
    } catch {}
  };

  useEffect(() => {
    fetchNotifications();
    fetchPreferences();
  }, []);

  const handleToggleEmailPref = async () => {
    setUpdatingPref(true);
    const nextVal = !emailPref;
    try {
      const res = await fetch(`${API_URL}/notifications/preferences`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ email_notifications: nextVal }),
      });
      if (res.ok) setEmailPref(nextVal);
    } finally {
      setUpdatingPref(false);
    }
  };

  const handleMarkAsRead = async (id: string, deepLink?: string) => {
    try {
      await fetch(`${API_URL}/notifications/${id}/read`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch {}
    if (deepLink) router.push(deepLink);
  };

  const handleMarkAllAsRead = async () => {
    try {
      await fetch(`${API_URL}/notifications/read-all`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch {}
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fetch(`${API_URL}/notifications/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch {}
  };

  const filtered = notifications.filter((n) => {
    if (filter === "UNREAD") return !n.is_read;
    if (filter === "CERTS") return ["CERT_ISSUED", "CERT_REVOKED", "CERT_SUSPENDED"].includes(n.event_type || n.type);
    if (filter === "DISPUTES") return ["DISPUTE_APPROVED", "DISPUTE_REJECTED"].includes(n.event_type || "");
    return true;
  });

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
            🔔 {t("student.notifications.title")}
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {t("student.notifications.description")}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Email Notification Preference Toggle */}
          <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-xl cursor-pointer">
            <span>✉️ Nhận email:</span>
            <input
              id="toggle-email-notif"
              type="checkbox"
              checked={emailPref}
              onChange={handleToggleEmailPref}
              disabled={updatingPref}
              className="accent-primary"
            />
          </label>

          {notifications.some((n) => !n.is_read) && (
            <button
              onClick={handleMarkAllAsRead}
              className="px-4 py-2 text-xs font-bold text-primary border border-primary/30 rounded-xl hover:bg-primary/5 transition-all"
            >
              {t("student.notifications.mark_all_read")}
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-800 pb-3">
        {[
          { key: "ALL", label: "Tất cả" },
          { key: "UNREAD", label: "Chưa đọc" },
          { key: "CERTS", label: "🎓 Bằng cấp" },
          { key: "DISPUTES", label: "⚖️ Chỉnh sửa" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filter === tab.key
                ? "bg-primary text-white"
                : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-xs text-red-600 dark:bg-red-950/20">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 text-gray-400 text-xs">
          {t("common.loading")}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-sm font-semibold text-gray-500">
            {t("student.notifications.no_notifications")}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((n) => {
            const icon = EVENT_ICONS[n.event_type || n.type] || "🔔";
            return (
              <div
                key={n.id}
                onClick={() => handleMarkAsRead(n.id, n.deep_link)}
                className={`rounded-2xl border p-4 cursor-pointer transition-all flex items-start gap-4 ${
                  n.is_read
                    ? "bg-white dark:bg-gray-900 border-gray-200/60 dark:border-gray-800/60 opacity-80"
                    : "bg-primary/5 border-primary/20 dark:border-primary/30"
                }`}
              >
                <div className="text-2xl pt-1">{icon}</div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      {n.title}
                    </p>
                    <button
                      onClick={(e) => handleDelete(n.id, e)}
                      className="text-gray-400 hover:text-red-500 text-xs p-1"
                      title="Xóa thông báo"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">
                    {n.message}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-400">
                    <span>{new Date(n.createdAt).toLocaleString("vi-VN")}</span>
                    {n.deep_link && (
                      <span className="text-primary font-semibold">Xem chi tiết ↗</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}