"use client";
import styles from "./page.module.css";
import React from "react";

export default function AdminBlockchainMonitorPage() {
  return (
    <div className={styles._1}>
      <div>
        <h1 className={styles._2}>Giám sát mạng Web3 & IPFS</h1>
        <p className={styles._3}>Theo dõi tình trạng hoạt động của các nút RPC kết nối, địa chỉ hợp đồng thông minh và cổng IPFS gateway.</p>
      </div>

      <div className={styles._4}>
        {/* Node status */}
        <div className={styles._5}>
          <h3 className={styles._6}>Blockchain Network</h3>
          <div className={styles._7}>
            <div className={styles._8}>
              <span className={styles._9}>Mạng kết nối:</span>
              <span className={styles._10}>Ethereum Sepolia Testnet</span>
            </div>
            <div className={styles._8}>
              <span className={styles._9}>Trạng thái Node:</span>
              <span className={styles._11}>✓ Online (100%)</span>
            </div>
            <div className={styles._8}>
              <span className={styles._9}>Phí Gas trung bình:</span>
              <span className={styles._12}>18.5 Gwei</span>
            </div>
          </div>
        </div>

        {/* Smart contract status */}
        <div className={styles._5}>
          <h3 className={styles._6}>Smart Contract</h3>
          <div className={styles._7}>
            <div className={styles._8}>
              <span className={styles._9}>Contract Address:</span>
              <span className={styles._13}>0x3b82...b65f</span>
            </div>
            <div className={styles._8}>
              <span className={styles._9}>Ví Deployer Admin:</span>
              <span className={styles._13}>0xf39f...2266</span>
            </div>
            <div className={styles._8}>
              <span className={styles._9}>Phiên bản ABI:</span>
              <span className={styles._12}>v1.2.4-Production</span>
            </div>
          </div>
        </div>

        {/* IPFS status */}
        <div className={styles._5}>
          <h3 className={styles._6}>IPFS Cluster Node</h3>
          <div className={styles._7}>
            <div className={styles._8}>
              <span className={styles._9}>IPFS Gateway URL:</span>
              <span className={styles._14}>https://ipfs.io/ipfs/</span>
            </div>
            <div className={styles._8}>
              <span className={styles._9}>Trạng thái Pinning:</span>
              <span className={styles._11}>✓ Active (Infura Node)</span>
            </div>
            <div className={styles._8}>
              <span className={styles._9}>Tỷ lệ lưu trữ:</span>
              <span className={styles._12}>100% Khả dụng</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
