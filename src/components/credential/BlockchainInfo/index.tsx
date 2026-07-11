"use client";
import React from "react";
import styles from "./BlockchainInfo.module.css";

interface BlockchainInfoProps {
  network?: string;
  contractAddress?: string;
  transactionHash?: string;
  blockNumber?: number;
  gasUsed?: string;
  timestamp?: string;
}

export default function BlockchainInfo({
  network,
  contractAddress,
  transactionHash,
  blockNumber,
  gasUsed,
  timestamp,
}: BlockchainInfoProps) {
  const explorerUrl = transactionHash
    ? `https://sepolia.etherscan.io/tx/${transactionHash}`
    : null;

  return (
    <div className={styles._1}>
      <div className={styles._2}>
        <svg className={styles._3} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
        </svg>
        <span>Blockchain</span>
      </div>
      <dl className={styles._4}>
        {network && <div className={styles._5}>
          <dt className={styles._6}>Network</dt>
          <dd className={styles._7}>{network}</dd>
        </div>}
        {contractAddress && (
          <div className={styles._5}>
            <dt className={styles._6}>Contract</dt>
            <dd className={`${styles._7} font-mono text-xs`}>{contractAddress}</dd>
          </div>
        )}
        {transactionHash && (
          <div className={styles._5}>
            <dt className={styles._6}>Tx Hash</dt>
            <dd className={`${styles._7} font-mono text-xs text-primary`}>{transactionHash}</dd>
          </div>
        )}
        {blockNumber && (
          <div className={styles._5}>
            <dt className={styles._6}>Block</dt>
            <dd className={styles._7}>#{blockNumber.toLocaleString()}</dd>
          </div>
        )}
        {gasUsed && (
          <div className={styles._5}>
            <dt className={styles._6}>Gas Used</dt>
            <dd className={styles._7}>{gasUsed}</dd>
          </div>
        )}
        {timestamp && (
          <div className={styles._5}>
            <dt className={styles._6}>Thời gian</dt>
            <dd className={styles._7}>{timestamp}</dd>
          </div>
        )}
      </dl>
      {explorerUrl && (
        <a
          href={explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={styles._8}
        >
          Xem trên Etherscan
          <svg className={styles._9} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      )}
    </div>
  );
}
