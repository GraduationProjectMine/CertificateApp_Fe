import React, { useEffect, useCallback } from "react";
import ReactDOM from "react-dom";
import styles from "./modal.module.css";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: "sm" | "md" | "lg" | "xl";
  hideClose?: boolean;
  closeOnOverlay?: boolean;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

function ModalContent({
  open,
  onClose,
  title,
  description,
  size = "md",
  hideClose = false,
  closeOnOverlay = true,
  children,
  footer,
}: ModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  const sizeClass = {
    sm: styles.containerSm,
    md: styles.containerMd,
    lg: styles.containerLg,
    xl: styles.containerXl,
  }[size];

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label={title}>
      <div className={styles.backdrop} onClick={closeOnOverlay ? onClose : undefined} />
      <div className={`${styles.container} ${sizeClass}`}>
        {(title || !hideClose) && (
          <div className={styles.header}>
            <div className="min-w-0 flex-1">
              {title && <h2 className={styles.title}>{title}</h2>}
              {description && <p className={styles.description}>{description}</p>}
            </div>
            {!hideClose && (
              <button onClick={onClose} className={styles.closeBtn} aria-label="Đóng">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M4 4l10 10M14 4L4 14" />
                </svg>
              </button>
            )}
          </div>
        )}
        <div className={styles.body}>{children}</div>
        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </div>
  );
}

export default function Modal(props: ModalProps) {
  return ReactDOM.createPortal(<ModalContent {...props} />, document.body);
}
