"use client";
import styles from "./page.module.css";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { templateApi } from "@/features/templates/services/api";
import type { CertificateTemplate } from "@/features/templates/types";
import ConfirmModal from "@/components/common/Modal/ConfirmModal";
import FormModal from "@/components/common/Modal/FormModal";

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
  const [deleteTargetId, setDeleteTargetId] = useState("");
  const [deleteTargetName, setDeleteTargetName] = useState("");

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

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await templateApi.delete(deleteTargetId);
      setTemplates((prev) => prev.filter((t) => t.id !== deleteTargetId));
      setDeleteTargetId("");
      setDeleteTargetName("");
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

      <FormModal
        open={showCreateModal}
        onClose={() => { setShowCreateModal(false); setNewName(""); setNewDesc(""); }}
        title="Tạo mẫu văn bằng mới"
        description="Thiết kế mẫu văn bằng chứng chỉ cho tổ chức của bạn."
        onSubmit={(e) => { e.preventDefault(); void handleCreate(); }}
        submitLabel="Tạo mẫu"
        size="md"
      >
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Tên mẫu *</label>
          <input
            type="text"
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs outline-none focus:ring-1 focus:ring-primary"
            placeholder="VD: Mẫu bằng tốt nghiệp ĐH"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            autoFocus
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Mô tả (tuỳ chọn)</label>
          <textarea
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs outline-none focus:ring-1 focus:ring-primary resize-none"
            rows={3}
            placeholder="VD: Mẫu mặc định cho kỹ sư CNTT"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
          />
        </div>
      </FormModal>

      <ConfirmModal
        open={!!deleteTargetId}
        onClose={() => { setDeleteTargetId(""); setDeleteTargetName(""); }}
        title="Xóa mẫu văn bằng"
        message={`Bạn có chắc chắn muốn xóa mẫu "${deleteTargetName}"? Hành động này không thể hoàn tác.`}
        confirmLabel="Xóa"
        cancelLabel="Hủy"
        variant="danger"
        icon="danger"
        onConfirm={() => void handleDelete()}
      />

      <div className={styles._6}>
        {loading ? (
          <div className="p-8 text-center text-gray-400 dark:text-gray-500 text-xs">Đang tải...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500 dark:text-red-400 text-xs">{error}</div>
        ) : templates.length === 0 ? (
          <div className="p-8 text-center text-gray-400 dark:text-gray-500 text-xs">Chưa có mẫu văn bằng nào. Hãy tạo mẫu đầu tiên!</div>
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
                    className="text-[10px] font-bold text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    onClick={() => handleSetDefault(template.id)}
                  >
                    Đặt mặc định
                  </button>
                )}
                <button
                  className="text-[10px] font-bold text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  onClick={() => handleDuplicate(template.id)}
                >
                  Nhân bản
                </button>
                {!template.is_default && (
                  <button
                    className="text-[10px] font-bold text-danger hover:text-red-600 transition-colors"
                    onClick={() => { setDeleteTargetId(template.id); setDeleteTargetName(template.name); }}
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
