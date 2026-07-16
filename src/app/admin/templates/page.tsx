"use client";
import styles from "./page.module.css";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { templateApi } from "@/features/templates/services/api";
import type { CertificateTemplate } from "@/features/templates/types";

const DEFAULT_DESIGN = {
  page: { width: 800, height: 600, bgColor: "#ffffff" },
  fields: [
    { id: "title_label", type: "text", x: 200, y: 180, w: 400, h: 25, font: "serif", size: 14, color: "#c9a84c", align: "center", text: "CHỨNG NHẬN" },
    { id: "student_name", type: "text", x: 200, y: 300, w: 400, h: 50, font: "serif", size: 36, color: "#1a1a1a", align: "center", dynamic: true, binding: "student_fullName", bold: true },
  ],
  decorations: [{ type: "border", style: "double", color: "#c9a84c", width: 4 }],
};

export default function AdminTemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await templateApi.list();
      setTemplates(data);
    } catch (err: any) {
      setError(err.message || "Failed to load templates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    try {
      await templateApi.create({ name: newName, description: newDesc, design_data: DEFAULT_DESIGN as any });
      setShowCreateModal(false);
      setNewName("");
      setNewDesc("");
      await fetchData();
    } catch (err: any) {
      alert(err.message || "Create failed");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xoá mẫu văn bằng này?")) return;
    try {
      await templateApi.delete(id);
      setTemplates((prev) => prev.filter((t) => t.id !== id));
    } catch (err: any) {
      alert(err.message || "Delete failed");
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await templateApi.duplicate(id);
      await fetchData();
    } catch (err: any) {
      alert(err.message || "Duplicate failed");
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await templateApi.update(id, { is_default: true });
      await fetchData();
    } catch (err: any) {
      alert(err.message || "Failed to set default");
    }
  };

  return (
    <div className={styles._1}>
      <div className={styles._2}>
        <div>
          <h1 className={styles._3}>Quản lý Mẫu Bằng</h1>
          <p className={styles._4}>Thiết kế và quản lý các mẫu văn bằng, chứng chỉ cho tổ chức của bạn.</p>
        </div>
        <button className={styles._5} onClick={() => setShowCreateModal(true)}>
          + Thiết kế mẫu bằng mới
        </button>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 max-w-md w-full">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Tạo mẫu văn bằng mới</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Tên mẫu</label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="VD: Mẫu bằng tốt nghiệp ĐH"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Mô tả (tuỳ chọn)</label>
                <textarea
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                  rows={3}
                  placeholder="VD: Mẫu mặc định cho kỹ sư CNTT"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                className="px-5 py-2.5 text-sm font-bold rounded-xl text-gray-600 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-white/[0.08] transition-all"
                onClick={() => { setShowCreateModal(false); setNewName(""); setNewDesc(""); }}
              >
                Huỷ
              </button>
              <button
                className="px-5 py-2.5 text-sm font-bold rounded-xl bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all disabled:opacity-60"
                onClick={handleCreate}
                disabled={!newName.trim()}
              >
                Tạo mẫu
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={styles._6}>
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-xs">Đang tải...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500 text-xs">{error}</div>
        ) : templates.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-xs">Chưa có mẫu văn bằng nào. Hãy tạo mẫu đầu tiên!</div>
        ) : (
          templates.map((template) => (
            <div key={template.id} className={styles._7}>
              <div className={styles._8}>
                <div className={styles._9}>
                  <div className={styles._10}>
                    {template.is_default ? "MẶC ĐỊNH" : "THƯỜNG"}
                  </div>
                </div>
                <div>
                  <h3 className={styles._11}>{template.name}</h3>
                  {template.description && (
                    <span className={styles._12}>{template.description}</span>
                  )}
                </div>
              </div>
              <div className={styles._13}>
                <Link
                  href={`/admin/templates/editor/${template.id}`}
                  className="text-[10px] font-bold text-primary hover:text-primary-hover transition-colors"
                >
                  Thiết kế
                </Link>
                {!template.is_default && (
                  <button
                    className="text-[10px] font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    onClick={() => handleSetDefault(template.id)}
                  >
                    Đặt mặc định
                  </button>
                )}
                <button
                  className="text-[10px] font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  onClick={() => handleDuplicate(template.id)}
                >
                  Nhân bản
                </button>
                {!template.is_default && (
                  <button
                    className="text-[10px] font-bold text-danger hover:text-red-600 transition-colors"
                    onClick={() => handleDelete(template.id)}
                  >
                    Xoá
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
