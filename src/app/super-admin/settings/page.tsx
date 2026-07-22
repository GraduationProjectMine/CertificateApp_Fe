"use client";
import React, { useState, useEffect } from "react";
import { superAdminApi } from "@/features/super-admin/services/api";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const [config, setConfig] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    superAdminApi.getSystemConfig()
      .then(setConfig)
      .catch((err) => toast.error(err.message || "Không thể tải cấu hình"))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (key: string, value: string) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await superAdminApi.updateSystemConfig(config);
      setConfig(res);
      toast.success("Cập nhật cấu hình hệ thống thành công");
    } catch (err: any) {
      toast.error(err.message || "Cập nhật cấu hình thất bại");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Cấu hình hệ thống</h1>
        <p className="text-xs text-gray-500 mt-1">Cấu hình các tham số hoạt động toàn hệ thống CertiChain</p>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400 text-xs">Đang tải cấu hình...</div>
      ) : (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Tên hệ thống</label>
              <input
                type="text"
                className="w-full rounded-xl border border-gray-200 bg-transparent px-3 py-2 text-xs dark:border-gray-700"
                value={config.system_name || ""}
                onChange={(e) => handleChange("system_name", e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Email liên hệ / hỗ trợ</label>
              <input
                type="email"
                className="w-full rounded-xl border border-gray-200 bg-transparent px-3 py-2 text-xs dark:border-gray-700"
                value={config.contact_email || ""}
                onChange={(e) => handleChange("contact_email", e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Thời gian chờ phiên đăng nhập (phút)</label>
              <input
                type="number"
                className="w-full rounded-xl border border-gray-200 bg-transparent px-3 py-2 text-xs dark:border-gray-700"
                value={config.session_timeout || ""}
                onChange={(e) => handleChange("session_timeout", e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800/40">
              <div>
                <span className="block text-xs font-bold text-gray-700 dark:text-gray-300">Cho phép các tổ chức tự đăng ký</span>
                <span className="block text-[10px] text-gray-400">Hiển thị nút đăng ký tài khoản cho tổ chức ngoài trang đăng nhập</span>
              </div>
              <select
                className="rounded-xl border border-gray-200 bg-transparent px-3 py-1.5 text-xs dark:border-gray-700 font-bold"
                value={config.allow_self_register || "true"}
                onChange={(e) => handleChange("allow_self_register", e.target.value)}
              >
                <option value="true">Cho phép</option>
                <option value="false">Không cho phép</option>
              </select>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800/40">
              <div>
                <span className="block text-xs font-bold text-gray-700 dark:text-gray-300">Yêu cầu xác thực Email đăng ký</span>
                <span className="block text-[10px] text-gray-400">Tổ chức phải xác thực OTP/Link qua email để bắt đầu phê duyệt</span>
              </div>
              <select
                className="rounded-xl border border-gray-200 bg-transparent px-3 py-1.5 text-xs dark:border-gray-700 font-bold"
                value={config.email_verification_required || "false"}
                onChange={(e) => handleChange("email_verification_required", e.target.value)}
              >
                <option value="true">Bắt buộc</option>
                <option value="false">Bỏ qua</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-primary py-2.5 text-xs font-bold text-white hover:bg-primary-hover transition-colors disabled:opacity-50 mt-2"
          >
            {saving ? "Đang lưu cấu hình..." : "Lưu cài đặt cấu hình"}
          </button>
        </form>
      )}
    </div>
  );
}
