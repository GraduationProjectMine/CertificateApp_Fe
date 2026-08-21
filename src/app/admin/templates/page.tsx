"use client";
import styles from "./page.module.css";
import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { templateApi } from "@/features/templates/services/api";
import type { CertificateTemplate } from "@/features/templates/types";
import ConfirmModal from "@/components/common/Modal/ConfirmModal";
import FormModal from "@/components/common/Modal/FormModal";
import { useI18n } from "@/features/i18n/I18nContext";
import { validateMinLength } from "@/lib/validators";
import toast from "react-hot-toast";

const DEFAULT_DESIGN = {
  page: { width: 800, height: 600, bgColor: "#ffffff" },
  fields: [
    { id: "title_label", type: "text", x: 200, y: 180, w: 400, h: 25, font: "serif", size: 14, color: "#c9a84c", align: "center", text: "CHỨNG NHẬN" },
    { id: "student_name", type: "text", x: 200, y: 300, w: 400, h: 50, font: "serif", size: 36, color: "#1a1a1a", align: "center", dynamic: true, binding: "student_fullName", bold: true },
  ],
  decorations: [{ type: "border", style: "double", color: "#c9a84c", width: 4 }],
};

export default function AdminTemplatesPage() {
  const { t } = useI18n();
  const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [deleteTargetId, setDeleteTargetId] = useState("");
  const [deleteTargetName, setDeleteTargetName] = useState("");
const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await templateApi.list();
      setTemplates(data);
    } catch (err: any) {
      setError(err.message || t("adminTemplates.error.load"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleCreate = async () => {
    const name = newName.trim();
    const description = newDesc.trim();
    if (!validateMinLength(name, 2)) {
      toast.error(t("common.validation.invalidName"));
      return;
    }
    setCreating(true);
    try {
      await templateApi.create({ name, description: description || undefined, design_data: DEFAULT_DESIGN as any });
      toast.success(t("adminTemplates.createSuccess"));
      setShowCreateModal(false);
      setNewName("");
      setNewDesc("");
      await fetchData();
    } catch (err: any) {
      toast.error(err.message || t("adminTemplates.error.create"));
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    setDeleting(true);
    try {
      await templateApi.delete(deleteTargetId);
      toast.success(t("adminTemplates.deleteSuccess"));
      setTemplates((prev) => prev.filter((t) => t.id !== deleteTargetId));
      setDeleteTargetId("");
      setDeleteTargetName("");
    } catch (err: any) {
      toast.error(err.message || t("adminTemplates.error.delete"));
    } finally {
      setDeleting(false);
    }
  };

const handleDuplicate = async (id: string) => {
    setActionId(id);
    try {
      await templateApi.duplicate(id);
      toast.success(t("adminTemplates.duplicateSuccess"));
      await fetchData();
    } catch (err: any) {
      toast.error(err.message || t("adminTemplates.error.duplicate"));
    } finally {
      setActionId(null);
    }
  };

  const handleSetDefault = async (id: string) => {
    setActionId(id);
    try {
      await templateApi.update(id, { is_default: true });
      toast.success(t("adminTemplates.setDefaultSuccess"));
      await fetchData();
    } catch (err: any) {
      toast.error(err.message || t("adminTemplates.error.setDefault"));
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className={styles._1}>
      <div className={styles._2}>
        <div>
          <h1 className={styles._3}>{t("adminTemplates.title")}</h1>
          <p className={styles._4}>{t("adminTemplates.description")}</p>
        </div>
        <button className={styles._5} onClick={() => setShowCreateModal(true)}>
          {t("adminTemplates.createButton")}
        </button>
      </div>

      <FormModal
        open={showCreateModal}
        onClose={() => { setShowCreateModal(false); setNewName(""); setNewDesc(""); }}
        title={t("adminTemplates.createModal.title")}
        description={t("adminTemplates.createModal.description")}
        onSubmit={(e) => { e.preventDefault(); void handleCreate(); }}
        submitting={creating}
        submitLabel={t("adminTemplates.createModal.submit")}
        size="md"
      >
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{t("adminTemplates.createModal.nameLabel")}</label>
          <input
            type="text"
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs outline-none focus:ring-1 focus:ring-primary"
            placeholder={t("adminTemplates.createModal.namePlaceholder")}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            autoFocus
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{t("adminTemplates.createModal.descLabel")}</label>
          <textarea
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs outline-none focus:ring-1 focus:ring-primary resize-none"
            rows={3}
            placeholder={t("adminTemplates.createModal.descPlaceholder")}
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
          />
        </div>
      </FormModal>

      <ConfirmModal
        open={!!deleteTargetId}
        onClose={() => { setDeleteTargetId(""); setDeleteTargetName(""); }}
        title={t("adminTemplates.deleteModal.title")}
        message={`${t("adminTemplates.deleteModal.messagePrefix")} "${deleteTargetName}"${t("adminTemplates.deleteModal.messageSuffix")}`}
        confirmLabel={t("adminTemplates.deleteModal.confirm")}
        cancelLabel={t("adminTemplates.deleteModal.cancel")}
        variant="danger"
        icon="danger"
        loading={deleting}
        onConfirm={() => void handleDelete()}
      />

      <div className={styles._6}>
        {loading ? (
          <div className="p-8 text-center text-gray-400 dark:text-gray-500 text-xs">{t("adminTemplates.loading")}</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500 dark:text-red-400 text-xs">{error}</div>
        ) : templates.length === 0 ? (
          <div className="p-8 text-center text-gray-400 dark:text-gray-500 text-xs">{t("adminTemplates.empty")}</div>
        ) : (
          templates.map((template) => (
            <div key={template.id} className={styles._7}>
              <div className={styles._8}>
                <div className={styles._9}>
                  <div className={styles._10}>
                    {template.is_default ? t("adminTemplates.defaultBadge") : t("adminTemplates.regularBadge")}
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
                  {t("adminTemplates.design")}
                </Link>
                {!template.is_default && (
                  <button
                    className="text-[10px] font-bold text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => handleSetDefault(template.id)}
                    disabled={actionId !== null}
                  >
                    {t("adminTemplates.setDefault")}
                  </button>
                )}
                <button
                  className="text-[10px] font-bold text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => handleDuplicate(template.id)}
                  disabled={actionId !== null}
                >
                  {t("adminTemplates.duplicate")}
                </button>
                {!template.is_default && (
                  <button
                    className="text-[10px] font-bold text-danger hover:text-red-600 transition-colors"
                    onClick={() => { setDeleteTargetId(template.id); setDeleteTargetName(template.name); }}
                  >
                    {t("adminTemplates.delete")}
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
