import React from "react";
import styles from "./dialog.module.css";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export default function Dialog({ open, onClose, title, children }: DialogProps) {
  if (!open) return null;
  return (
    <div className={styles._1}>
      <div className={styles._2} onClick={onClose} />
      <div className={styles._3}>
        {title && <h2 className={styles._4}>{title}</h2>}
        {children}
      </div>
    </div>
  );
}
