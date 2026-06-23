import React from "react";

interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "primary";
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({ open, title = "Xác nhận", message, confirmLabel = "Xác nhận", cancelLabel = "Hủy", variant = "primary", onConfirm, onCancel }: ConfirmDialogProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-md w-full mx-4 z-10 border border-gray-200 dark:border-gray-800 shadow-xl">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800 rounded-xl hover:bg-gray-50">
            {cancelLabel}
          </button>
          <button onClick={onConfirm} className={`px-4 py-2 text-sm font-semibold text-white rounded-xl shadow-sm ${variant === "danger" ? "bg-danger hover:bg-red-600" : "bg-primary hover:bg-primary-hover"}`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
