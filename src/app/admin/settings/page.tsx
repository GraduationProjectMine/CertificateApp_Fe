"use client";

import React from "react";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6 animate-fadeIn font-sans">
      <div>
        <h1 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Cài đặt hệ thống</h1>
        <p className="text-xs text-gray-500 mt-1">Cấu hình thông tin trường học, phân quyền tài khoản quản trị và kết nối cơ sở hạ tầng.</p>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800/60 rounded-3xl p-6 sm:p-8 space-y-6 text-xs">
        <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-widest border-b border-gray-100 dark:border-gray-850 pb-2">Thông tin tổ chức</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1.5">Tên trường đại học / Tổ chức giáo dục</label>
            <input
              type="text"
              defaultValue="Đại học Bách Khoa Hà Nội"
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-950 dark:text-white"
            />
          </div>
          <div>
            <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1.5">Mã định danh trường học</label>
            <input
              type="text"
              defaultValue="HUST"
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-950 dark:text-white"
            />
          </div>
        </div>

        <button className="px-5 py-2.5 text-xs font-bold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-sm transition-all select-none">
          Lưu cấu hình
        </button>
      </div>
    </div>
  );
}
