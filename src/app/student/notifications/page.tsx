"use client";
import React, { useState, useEffect } from "react";
import { notificationApi, type NotificationDto } from "@/features/notifications/services/notification.api";
import { useI18n } from "@/features/i18n/I18nContext";

export default function NotificationsPage() {
  const { t } = useI18n();
  const TYPE_LABELS: Record<string, { label: string; color: string }> = {
    CERT_ISSUED: { label: t("student.notifications.cert_issued"), color: "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400" },
    CERT_REVOKED: { label: t("student.notifications.cert_revoked"), color: "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400" },
    INFO: { label: t("common.notification"), color: "bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400" },
  };

  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetch = async () => {
    setLoading(true);
    setError("");
    try {
      setNotifications(await notificationApi.list());
    } catch (err) {
      setError(err instanceof Error ? err.message : t("student.notifications.fetch_failed"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n));
    } catch {}
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch {}
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{t("student.notifications.title")}</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t("student.notifications.description")}</p>
        </div>
        {notifications.some((n) => !n.is_read) && (
          <button onClick={handleMarkAllAsRead}
            className="px-4 py-2 text-xs font-bold text-primary border border-primary/30 rounded-xl hover:bg-primary/5 transition-all">
            {t("student.notifications.mark_all_read")}
          </button>
        )}
      </div>

      {error && <div className="rounded-xl bg-red-50 px-4 py-3 text-xs text-red-600 dark:bg-red-950/20">{error}</div>}

      {loading ? (
        <div className="text-center py-16 text-gray-400 dark:text-gray-500 text-xs">{t("common.loading")}</div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-16 text-gray-400 dark:text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">{t("student.notifications.no_notifications")}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{t("student.notifications.no_notifications_desc")}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => {
            const typeInfo = TYPE_LABELS[n.type] || TYPE_LABELS.INFO;
            return (
              <div
                key={n.id}
                onClick={() => !n.is_read && handleMarkAsRead(n.id)}
                className={`rounded-2xl border p-4 cursor-pointer transition-all ${
                  n.is_read
                    ? "bg-white dark:bg-gray-900 border-gray-200/60 dark:border-gray-800/60"
                    : "bg-primary/5 border-primary/20 dark:border-primary/30"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${typeInfo.color}`}>
                        {typeInfo.label}
                      </span>
                      {!n.is_read && <span className="w-2 h-2 rounded-full bg-primary" />}
                    </div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{n.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{n.message}</p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1.5">{new Date(n.createdAt).toLocaleString('vi-VN')}</p>
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