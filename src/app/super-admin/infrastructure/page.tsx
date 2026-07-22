"use client";
import React, { useState, useEffect } from "react";
import { 
  superAdminApi, 
  type DetailedBlockchainInfo, 
  type DetailedIpfsInfo, 
  type DetailedContractInfo 
} from "@/features/super-admin/services/api";
import toast from "react-hot-toast";

export default function InfrastructurePage() {
  const [blockchain, setBlockchain] = useState<DetailedBlockchainInfo | null>(null);
  const [ipfs, setIpfs] = useState<DetailedIpfsInfo | null>(null);
  const [contract, setContract] = useState<DetailedContractInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [bcData, ipfsData, contractData] = await Promise.all([
        superAdminApi.getDetailedBlockchainInfo(),
        superAdminApi.getDetailedIpfsInfo(),
        superAdminApi.getDetailedContractInfo()
      ]);
      setBlockchain(bcData);
      setIpfs(ipfsData);
      setContract(contractData);
    } catch (err: any) {
      toast.error(err.message || "Không thể tải thông tin hạ tầng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Giám sát hạ tầng</h1>
          <p className="text-xs text-gray-500 mt-1">Quản lý kết nối node Blockchain Hardhat & Pinata IPFS</p>
        </div>
        <button 
          onClick={loadData}
          className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold hover:bg-gray-50 transition shadow-sm dark:border-gray-800 dark:bg-gray-900"
        >
          Làm mới
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400 text-xs">Đang tải trạng thái hạ tầng...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Blockchain Node */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800/40">
              <h2 className="text-xs font-black text-gray-800 dark:text-gray-200 uppercase tracking-wider">Blockchain Local Node</h2>
              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                blockchain?.connected ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
              }`}>
                {blockchain?.connected ? "CONNECTED" : "DISCONNECTED"}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs">
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">RPC Endpoint</span>
                <span className="font-mono text-[11px]">{blockchain?.rpcUrl || "—"}</span>
              </div>
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Network Name</span>
                <span>{blockchain?.network || "—"}</span>
              </div>
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Chain ID</span>
                <span className="font-mono">{blockchain?.chainId ?? "—"}</span>
              </div>
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Current Block</span>
                <span className="font-mono font-bold text-primary">{blockchain?.blockNumber ?? "—"}</span>
              </div>
              <div className="col-span-2">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">System Admin Wallet</span>
                <span className="font-mono text-[10px] text-gray-500 break-all">{blockchain?.walletAddress || "—"}</span>
              </div>
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Admin Wallet Balance</span>
                <span className="font-bold">{blockchain?.walletBalance ? `${parseFloat(blockchain.walletBalance).toFixed(4)} ETH` : "—"}</span>
              </div>
            </div>

            {/* Smart Contract details */}
            <div className="pt-4 border-t border-gray-150 space-y-3">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Smart Contract</h3>
              <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs">
                <div className="col-span-2">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Contract Address</span>
                  <span className="font-mono text-[10px] text-gray-500 break-all">{contract?.contractAddress || "—"}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Contract Owner</span>
                  <span className="font-mono text-[10px] text-gray-500 break-all">{contract?.owner || "—"}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Status</span>
                  <span className="font-bold text-emerald-600">{contract?.isInitialized ? "Active (Deployed)" : "Inactive"}</span>
                </div>
              </div>
            </div>

            {/* Recent Blocks */}
            <div className="pt-4 border-t border-gray-150 space-y-2">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Khối mới nhất</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {blockchain?.recentBlocks && blockchain.recentBlocks.length > 0 ? (
                  blockchain.recentBlocks.map((b) => (
                    <div key={b.number} className="flex justify-between items-center bg-gray-50 p-2 rounded-lg text-[10px] font-mono dark:bg-gray-800/40">
                      <div>
                        <span className="font-bold text-gray-700 dark:text-gray-300">#{b.number}</span>
                        <span className="text-gray-400 text-[9px] ml-2">{b.hash.substring(0, 10)}...</span>
                      </div>
                      <div className="text-right">
                        <span className="text-emerald-600">{b.transactionsCount} txs</span>
                        <span className="text-gray-400 ml-2">{new Date(b.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-[10px] text-gray-400 text-center py-2">Chưa có giao dịch nào được ghi</p>
                )}
              </div>
            </div>
          </div>

          {/* IPFS / Pinata Status */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 space-y-4 h-fit">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800/40">
              <h2 className="text-xs font-black text-gray-800 dark:text-gray-200 uppercase tracking-wider">Pinata IPFS Gateway</h2>
              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                ipfs?.connected ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
              }`}>
                {ipfs?.connected ? "CONNECTED" : "DISCONNECTED"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs">
              <div className="col-span-2">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Gateway URL</span>
                <span className="font-mono text-gray-500">{ipfs?.gateway || "—"}</span>
              </div>
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Tổng số File CIDs</span>
                <span className="font-mono font-bold text-primary text-sm">{ipfs?.totalCids ?? 0} file</span>
              </div>
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Kết nối Pinata API</span>
                <span className="font-bold text-emerald-600">{ipfs?.connected ? "Xác thực thành công" : "Lỗi xác thực"}</span>
              </div>
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Pinata JWT Token</span>
                <span>{ipfs?.pinataJwtConfigured ? "Đã cấu hình ✅" : "Chưa cấu hình ❌"}</span>
              </div>
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Pinata API Key / Secret</span>
                <span>{ipfs?.pinataApiKeyConfigured ? "Đã cấu hình ✅" : "Chưa cấu hình (Sử dụng JWT)"}</span>
              </div>
            </div>

            {ipfs?.error && (
              <div className="rounded-xl bg-red-50 p-3 text-[10px] text-red-600 dark:bg-red-950/20 font-mono">
                Lỗi kết nối: {ipfs.error}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
