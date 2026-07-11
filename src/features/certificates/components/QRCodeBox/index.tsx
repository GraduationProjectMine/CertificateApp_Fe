import React from "react";
import styles from "./QRCodeBox.module.css";

export default function QRCodeBox({ value, size = 80 }: { value?: string; size?: number }) {
  return (
    <div className={styles._1} style={{ width: size, height: size }} title={value}>
      <div className={styles._2}>
        QR Code
      </div>
    </div>
  );
}
