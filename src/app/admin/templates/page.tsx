"use client";
import styles from "./page.module.css";
import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { templateApi } from "@/features/templates/services/api";
import type { CertificateTemplate } from "@/features/templates/types";
import ConfirmModal from "@/components/common/Modal/ConfirmModal";
import FormModal from "@/components/common/Modal/FormModal";
import Button from "@/components/ui/Button";
import SearchInput from "@/components/common/SearchInput";
import EmptyState from "@/components/common/EmptyState";

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
  const [search, setSearch] = useState("");

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

  const filtered = useMemo(() => {
    if (!search.trim()) return templates;
    const q = search.toLowerCase().trim();
    return templates.filter((t) =>
      t.name.toLowerCase().includes(q) ||
      (t.description || "").toLowerCase().includes(q)
    );
  }, [templates, search]);

  return (
    <div className={styles._1}>
      <div className={styles._2}>
        <div>
          <h1 className={styles._3}>Quản lý Mẫu Bằng</h1>
          <p className={styles._4}>Thiết kế và quản lý các mẫu văn bằng, chứng chỉ cho tổ chức của bạn.</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setShowCreateModal(true)}>
          + Thiết kế mẫu bằng mới
        </Button>
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

      <div className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800/60 rounded-2xl p-4 mb-5">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Tìm kiếm theo tên mẫu..."
        >
          <Button variant="secondary" size="sm" onClick={fetchData} disabled={loading}>Tải lại</Button>
        </SearchInput>
      </div>

      <div className={styles._6}>
        {loading ? (
          <div className="p-8 text-center text-gray-400 dark:text-gray-500 text-xs">Đang tải...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500 dark:text-red-400 text-xs">{error}</div>
        ) : templates.length === 0 && !search ? (
          <EmptyState icon="📄" title="Chưa có mẫu văn bằng nào" action={<Button variant="primary" size="sm" onClick={() => setShowCreateModal(true)}>Tạo mẫu đầu tiên</Button>} />
        ) : filtered.length === 0 ? (
          <EmptyState icon="🔍" title="Không tìm thấy kết quả" />
        ) : (
          filtered.map((template) => (
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
                <Button variant="ghost" size="sm" href={`/admin/templates/editor/${template.id}`}>
                  Thiết kế
                </Button>
                {!template.is_default && (
                  <Button variant="ghost" size="sm" onClick={() => handleSetDefault(template.id)}>
                    Đặt mặc định
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => handleDuplicate(template.id)}>
                  Nhân bản
                </Button>
                {!template.is_default && (
                  <Button variant="ghost" size="sm" className="!text-danger" onClick={() => { setDeleteTargetId(template.id); setDeleteTargetName(template.name); }}>
                    Xoá
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
