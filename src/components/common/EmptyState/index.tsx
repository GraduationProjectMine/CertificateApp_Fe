import React from "react";
import styles from "./EmptyState.module.css";

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: string;
  action?: React.ReactNode;
}

export default function EmptyState({ title = "Không có dữ liệu", description, icon, action }: EmptyStateProps) {
  return (
    <div className={styles._1}>
      {icon ? (
        <div className="text-4xl mb-4">{icon}</div>
      ) : (
        <svg className={styles._2} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      )}
      <h3 className={styles._3}>{title}</h3>
      {description && <p className={styles._4}>{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
