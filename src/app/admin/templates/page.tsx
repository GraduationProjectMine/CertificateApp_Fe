"use client";

import React from "react";

export default function AdminTemplatesPage() {
  const templates = [
    { id: "temp-1", name: "Mẫu bằng Đại học Bách Khoa (Mặc định)", type: "Cử nhân kỹ sư", date: "20/06/2026", creator: "GS. TS. Huỳnh Quyết Thắng", active: true },
    { id: "temp-2", name: "Mẫu chứng chỉ tiếng Anh liên kết", type: "Chứng chỉ ngắn hạn", date: "15/06/2026", creator: "Phòng Đào tạo", active: true },
    { id: "temp-3", name: "Mẫu bằng Thạc sĩ công nghệ", type: "Thạc sĩ", date: "10/06/2026", creator: "GS. TS. Huỳnh Quyết Thắng", active: false }
  ];

  return (
    <div className="space-y-6 animate-fadeIn font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Quản lý Mẫu Bằng</h1>
          <p className="text-xs text-gray-500 mt-1">Thiết kế mẫu bằng kéo thả, định nghĩa các thuộc tính động và chữ ký số mặc định.</p>
        </div>
        <button className="w-full sm:w-auto px-4 py-2.5 text-xs font-bold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-sm transition-all select-none">
          + Thiết kế mẫu bằng mới
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {templates.map((temp) => (
          <div key={temp.id} className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800/60 rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between">
            <div className="p-6 space-y-4">
              <div className="h-32 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex items-center justify-center border border-dashed border-gray-200/60 dark:border-gray-800">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Preview Template</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">{temp.name}</h3>
                <span className="text-[10px] text-gray-450 dark:text-gray-500 block mt-1">Phân hệ: {temp.type}</span>
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900 border-t border-gray-150 dark:border-gray-850 flex items-center justify-between text-[10px]">
              <div>
                <span className="block text-gray-400">Người tạo: {temp.creator}</span>
                <span className="block text-gray-400">Ngày tạo: {temp.date}</span>
              </div>
              <span className={`px-2 py-0.5 rounded font-bold border ${
                temp.active
                  ? "bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 border-green-200/50"
                  : "bg-slate-100 dark:bg-slate-800 text-gray-400 border-gray-200/50"
              }`}>
                {temp.active ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
