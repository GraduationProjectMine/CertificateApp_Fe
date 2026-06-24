import React from "react";

import styles from "./card.module.css";
interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
}

export default function Card({ children, className = "", padding = true }: CardProps) {
  return (
    <div className={`${styles._0} ${padding ? "p-6" : ""} ${className}`}>
      {children}
    </div>
  );
}
