"use client";
import React from "react";
import styles from "./IPFSInfo.module.css";

interface IPFSInfoProps {
  cid?: string;
  metadataHash?: string;
  gatewayUrl?: string;
  pinStatus?: string;
}

export default function IPFSInfo({ cid, metadataHash, gatewayUrl, pinStatus = "Pinned" }: IPFSInfoProps) {
  const gatewayLink = cid
    ? gatewayUrl
      ? `${gatewayUrl}${cid}`
      : `https://ipfs.io/ipfs/${cid}`
    : null;

  return (
    <div className={styles._1}>
      <div className={styles._2}>
        <svg className={styles._3} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
        </svg>
        <span>IPFS</span>
      </div>
      <dl className={styles._4}>
        {cid && (
          <div className={styles._5}>
            <dt className={styles._6}>CID</dt>
            <dd className={`${styles._7} font-mono text-xs`}>{cid}</dd>
          </div>
        )}
        {metadataHash && (
          <div className={styles._5}>
            <dt className={styles._6}>Metadata Hash</dt>
            <dd className={`${styles._7} font-mono text-xs`}>{metadataHash}</dd>
          </div>
        )}
        <div className={styles._5}>
          <dt className={styles._6}>Pin Status</dt>
          <dd className={styles._7}>
            <span className={pinStatus === "Pinned" ? "text-green-600" : "text-amber-600"}>
              {pinStatus}
            </span>
          </dd>
        </div>
      </dl>
      {gatewayLink && (
        <a
          href={gatewayLink}
          target="_blank"
          rel="noopener noreferrer"
          className={styles._8}
        >
          Xem trên IPFS Gateway
          <svg className={styles._9} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      )}
    </div>
  );
}
