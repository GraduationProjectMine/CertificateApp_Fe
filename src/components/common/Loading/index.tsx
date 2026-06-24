import React from "react";
import styles from "./Loading.module.css";

export default function Loading({ message = "Đang tải..." }: { message?: string }) {
  return (
    <div className={styles._1}>
      <svg className={styles._2} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className={styles._3} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className={styles._4} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      <span className={styles._5}>{message}</span>
    </div>
  );
}
