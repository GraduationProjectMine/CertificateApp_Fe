import React from "react";
import Modal from "./index";
import styles from "./modal.module.css";
import { useI18n } from "@/features/i18n/I18nContext";

interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "primary" | "warning";
  onConfirm: () => void;
  onCancel?: () => void;
  loading?: boolean;
  icon?: "danger" | "warning" | "info";
}

const icons: Record<string, React.ReactNode> = {
  danger: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M15 9l-6 6M9 9l6 6" />
    </svg>
  ),
  warning: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      <path d="M12 9v4M12 17h.01" />
    </svg>
  ),
  info: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0f766e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" />
    </svg>
  ),
};

const iconStyles: Record<string, string> = {
  danger: styles.iconDanger,
  warning: styles.iconWarning,
  info: styles.iconInfo,
};

const btnStyles: Record<string, string> = {
  danger: "bg-danger text-white hover:bg-red-600",
  primary: "bg-primary text-white hover:bg-primary-hover",
  warning: "bg-warning text-white hover:bg-amber-600",
};

export default function ConfirmModal({
  open,
  onClose,
  title = "Xác nhận",
  message,
  confirmLabel = "Xác nhận",
  cancelLabel = "Hủy",
  variant = "primary",
  onConfirm,
  onCancel,
  loading = false,
  icon,
}: ConfirmModalProps) {
  const { t } = useI18n();
  return (
    <Modal open={open} onClose={onClose} size="sm" hideClose>
      <div className="text-center">
        {icon && (
          <div className={`${styles.iconWrap} ${iconStyles[icon]}`}>
            {icons[icon]}
          </div>
        )}
        <h3 className="text-base font-black text-gray-900 dark:text-white">{title}</h3>
        <p className="mt-2 text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{message}</p>
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={onCancel ?? onClose}
          className="px-4 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-white/[0.08] transition-all"
        >
          {cancelLabel}
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className={`px-4 py-2.5 text-sm font-bold rounded-xl shadow-sm transition-all disabled:opacity-50 ${btnStyles[variant]}`}
        >
          {loading ? t("common.loading") : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
