"use client";
import styles from "./page.module.css";
import React from "react";

export default function AdminBlockchainMonitorPage() {
  return (
    <div className={styles._1}>
      <div>
        <h1 className={styles._2}>Giám sát mạng Web3 & IPFS</h1>
        <p className={styles._3}>
          Backend hiện chưa cung cấp API trạng thái blockchain/IPFS, nên màn này không hiển thị số liệu hard-code.
        </p>
      </div>

      <div className={styles._4}>
        <div className={styles._5}>
          <h3 className={styles._6}>Trạng thái hạ tầng</h3>
          <div className="p-6 text-xs text-gray-400">
            Chưa có dữ liệu giám sát từ backend.
          </div>
        </div>
      </div>
    </div>
  );
}
