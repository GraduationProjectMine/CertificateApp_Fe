"use client";
import React from "react";
import { QRCodeSVG } from "qrcode.react";
import styles from "./QRCodeBox.module.css";

interface QRCodeBoxProps {
  value: string;
  size?: number;
  title?: string;
}

export default function QRCodeBox({ value, size = 160, title }: QRCodeBoxProps) {
  const handleDownload = () => {
    const svg = document.getElementById("qrcode-svg") as SVGElement | null;
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new window.Image();
    img.onload = () => {
      canvas.width = size;
      canvas.height = size;
      ctx?.drawImage(img, 0, 0);
      const link = document.createElement("a");
      link.download = "qrcode.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  return (
    <div className={styles._1}>
      {title && <p className={styles._2}>{title}</p>}
      <div className={styles._3}>
        <QRCodeSVG id="qrcode-svg" value={value} size={size} level="M" />
      </div>
      <button onClick={handleDownload} className={styles._4}>
        Tải QR
      </button>
    </div>
  );
}
