import React from "react";
import Modal from "./index";

interface FormModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  onSubmit: (e: React.FormEvent) => void;
  submitting?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
  size?: "md" | "lg" | "xl";
  children: React.ReactNode;
}

export default function FormModal({
  open,
  onClose,
  title,
  description,
  onSubmit,
  submitting = false,
  submitLabel = "Lưu",
  cancelLabel = "Hủy",
  size = "md",
  children,
}: FormModalProps) {
  return (
    <Modal open={open} onClose={onClose} title={title} description={description} size={size}>
      <form onSubmit={onSubmit}>
        <div className="space-y-4">{children}</div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-white/[0.08] transition-all"
          >
            {cancelLabel}
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2.5 text-sm font-bold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-sm transition-all disabled:opacity-50"
          >
            {submitting ? "Đang xử lý..." : submitLabel}
          </button>
        </div>
      </form>
    </Modal>
  );
}
