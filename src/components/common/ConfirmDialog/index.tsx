import React from "react";
import styles from "./ConfirmDialog.module.css";

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
    <div className={styles._1}>
      <div className={styles._2} onClick={onCancel} />
      <div className={styles._3}>
        <h3 className={styles._4}>{title}</h3>
        <p className={styles._5}>{message}</p>
        <div className={styles._6}>
          <button onClick={onCancel} className={styles._7}>
            {cancelLabel}
          </button>
          <button onClick={onConfirm} className={`${styles._0} ${variant === "danger" ? "bg-danger hover:bg-red-600" : "bg-primary hover:bg-primary-hover"}`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
