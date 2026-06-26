import React from "react";
import styles from "./DashboardLayout.module.css";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles._1}>
      <main className={styles._2}>{children}</main>
    </div>
  );
}
