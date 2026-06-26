import React from "react";
import styles from "./input.module.css";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({ label, error, className = "", ...props }: InputProps) {
  return (
    <div className={styles._1}>
      {label && <label className={styles._2}>{label}</label>}
      <input
        className={`${styles._0} ${className}`}
        {...props}
      />
      {error && <p className={styles._3}>{error}</p>}
    </div>
  );
}
