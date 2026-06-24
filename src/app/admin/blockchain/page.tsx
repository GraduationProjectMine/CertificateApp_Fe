"use client";

import React from "react";

export default function AdminBlockchainMonitorPage() {
  return (
    <div className="space-y-6 animate-fadeIn font-sans">
      <div>
        <h1 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Giám sát mạng Web3 & IPFS</h1>
        <p className="text-xs text-gray-500 mt-1">Theo dõi tình trạng hoạt động của các nút RPC kết nối, địa chỉ hợp đồng thông minh và cổng IPFS gateway.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
        {/* Node status */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800/60 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-[11px] border-b border-gray-100 dark:border-gray-800 pb-2">Blockchain Network</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Mạng kết nối:</span>
              <span className="font-bold">Ethereum Sepolia Testnet</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Trạng thái Node:</span>
              <span className="text-green-500 font-bold">✓ Online (100%)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Phí Gas trung bình:</span>
              <span className="font-semibold text-gray-800 dark:text-gray-200">18.5 Gwei</span>
            </div>
          </div>
        </div>

        {/* Smart contract status */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800/60 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-[11px] border-b border-gray-100 dark:border-gray-800 pb-2">Smart Contract</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Contract Address:</span>
              <span className="font-mono text-primary dark:text-teal-400">0x3b82...b65f</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Ví Deployer Admin:</span>
              <span className="font-mono text-primary dark:text-teal-400">0xf39f...2266</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Phiên bản ABI:</span>
              <span className="font-semibold text-gray-800 dark:text-gray-200">v1.2.4-Production</span>
            </div>
          </div>
        </div>

        {/* IPFS status */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800/60 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-[11px] border-b border-gray-100 dark:border-gray-800 pb-2">IPFS Cluster Node</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">IPFS Gateway URL:</span>
              <span className="font-semibold text-primary dark:text-teal-400">https://ipfs.io/ipfs/</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Trạng thái Pinning:</span>
              <span className="text-green-500 font-bold">✓ Active (Infura Node)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Tỷ lệ lưu trữ:</span>
              <span className="font-semibold text-gray-800 dark:text-gray-200">100% Khả dụng</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
