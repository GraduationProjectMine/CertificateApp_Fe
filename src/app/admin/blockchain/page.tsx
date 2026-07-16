"use client";

import React, { useCallback, useEffect, useState } from "react";
import styles from "./page.module.css";
import { operationsApi, type MonitorOverview } from "@/features/admin/services/operations.api";
import toast from "react-hot-toast";

function short(value: string | null, size = 10) {
  if (!value) return "—";
  return value.length > size * 2 ? `${value.slice(0, size)}…${value.slice(-6)}` : value;
}

export default function AdminBlockchainMonitorPage() {
  const [data, setData] = useState<MonitorOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try { setLoading(true); setError(""); setData(await operationsApi.monitor()); }
    catch (err) { setError(err instanceof Error ? err.message : "Không thể kiểm tra hạ tầng"); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  async function retryRevocation(certificateId: string) {
    try {
      await operationsApi.retryRevocation(certificateId);
      toast.success("Retry giao dịch thu hồi thành công");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Retry thất bại");
    }
  }

  return (
    <div className={styles._1}>
      <div className="flex flex-wrap items-start justify-between gap-4"><div><h1 className={styles._2}>Giám sát mạng Web3 & IPFS</h1><p className={styles._3}>Trạng thái trực tiếp từ RPC, ví ký và Pinata; không hiển thị private key.</p></div><button className="rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white disabled:opacity-50" disabled={loading} onClick={load}>{loading ? "Đang kiểm tra..." : "Làm mới"}</button></div>
      {error && <div role="alert" className="rounded-xl bg-red-50 p-4 text-xs font-semibold text-red-600">{error}</div>}

      {data && <>
        <div className={styles._4}>
          <section className={styles._5}><h3 className={styles._6}>Blockchain RPC</h3><div className={styles._7}><p className={styles._8}><span className={styles._9}>Kết nối</span><strong className={data.blockchain.connected ? styles._11 : "font-bold text-red-500"}>{data.blockchain.connected ? "Hoạt động" : "Mất kết nối"}</strong></p><p className={styles._8}><span className={styles._9}>Network / Chain ID</span><strong className={styles._10}>{data.blockchain.network || "—"} / {data.blockchain.chainId ?? "—"}</strong></p><p className={styles._8}><span className={styles._9}>Block mới nhất</span><strong className={styles._10}>{data.blockchain.blockNumber ?? "—"}</strong></p><p><span className={styles._9}>Contract</span><span className={`mt-1 block break-all ${styles._13}`} title={data.blockchain.contractAddress || ""}>{data.blockchain.contractAddress || "Chưa cấu hình"}</span></p></div></section>
          <section className={styles._5}><h3 className={styles._6}>Ví ký giao dịch</h3><div className={styles._7}><p><span className={styles._9}>Địa chỉ public</span><span className={`mt-1 block break-all ${styles._13}`}>{data.blockchain.walletAddress || "Chưa cấu hình"}</span></p><p className={styles._8}><span className={styles._9}>Số dư</span><strong className={styles._10}>{data.blockchain.walletBalance ? `${Number(data.blockchain.walletBalance).toFixed(5)} ETH` : "—"}</strong></p><p className={styles._8}><span className={styles._9}>Giao dịch gần đây</span><strong className={styles._10}>{data.totals.transactions}</strong></p><p className={styles._8}><span className={styles._9}>Giao dịch lỗi</span><strong className={data.totals.failedTransactions ? "font-bold text-red-500" : styles._11}>{data.totals.failedTransactions}</strong></p></div></section>
          <section className={styles._5}><h3 className={styles._6}>IPFS / Pinata</h3><div className={styles._7}><p className={styles._8}><span className={styles._9}>Kết nối API</span><strong className={data.ipfs.connected ? styles._11 : "font-bold text-red-500"}>{data.ipfs.connected ? "Hoạt động" : "Không sẵn sàng"}</strong></p><p><span className={styles._9}>Gateway</span><span className={`mt-1 block break-all ${styles._14}`}>{data.ipfs.gateway}</span></p><p className={styles._8}><span className={styles._9}>Tổng CID</span><strong className={styles._10}>{data.totals.cids}</strong></p>{data.ipfs.error && <p className="rounded-lg bg-red-50 p-2 text-[10px] text-red-500">{data.ipfs.error}</p>}</div></section>
        </div>

        <section className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900"><div className="border-b border-gray-100 p-5 dark:border-gray-800"><h2 className="text-xs font-black uppercase tracking-wider">Giao dịch gần đây</h2></div><div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead><tr className="bg-gray-50 text-gray-500 dark:bg-gray-950"><th className="p-4">Thời gian</th><th className="p-4">Mã bằng</th><th className="p-4">Action</th><th className="p-4">Tx Hash</th><th className="p-4">Block</th><th className="p-4">Gas</th><th className="p-4">Trạng thái</th></tr></thead><tbody>{data.transactions.map((transaction, index) => <tr className="border-t border-gray-100 dark:border-gray-800" key={`${transaction.action}-${transaction.transactionHash || transaction.certificateId}-${index}`}><td className="p-4">{transaction.timestamp ? new Date(transaction.timestamp).toLocaleString("vi-VN") : "—"}</td><td className="p-4 font-bold">{transaction.certificateCode || short(transaction.certificateId)}</td><td className="p-4">{transaction.action}</td><td className="p-4 font-mono text-teal-600" title={transaction.transactionHash || ""}>{short(transaction.transactionHash)}</td><td className="p-4">{transaction.blockNumber ?? "—"}</td><td className="p-4">{transaction.gasUsed || "—"}</td><td className={`p-4 font-bold ${transaction.status === "SUCCESS" ? "text-green-600" : "text-red-500"}`}>{transaction.status}{transaction.status === "FAILED" && transaction.action === "REVOKE" && <button className="ml-2 rounded border border-red-300 px-2 py-1 text-[10px]" onClick={() => retryRevocation(transaction.certificateId)}>Retry</button>}</td></tr>)}{data.transactions.length === 0 && <tr><td className="p-8 text-center text-gray-400" colSpan={7}>Chưa có giao dịch blockchain.</td></tr>}</tbody></table></div></section>

        <section className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900"><div className="border-b border-gray-100 p-5 dark:border-gray-800"><h2 className="text-xs font-black uppercase tracking-wider">CID gần đây</h2></div><div className="divide-y dark:divide-gray-800">{data.cids.slice(0, 10).map((item) => <div className="grid gap-2 p-4 text-xs sm:grid-cols-[160px_1fr_180px]" key={item.certificateId}><strong>{item.certificateCode || short(item.certificateId)}</strong><a className="break-all font-mono text-teal-600 hover:underline" href={`${data.ipfs.gateway}/ipfs/${item.cid}`} rel="noreferrer" target="_blank">{item.cid}</a><span className="text-gray-400">{new Date(item.createdAt).toLocaleString("vi-VN")}</span></div>)}{data.cids.length === 0 && <p className="p-8 text-center text-xs text-gray-400">Chưa có CID.</p>}</div></section>
      </>}
    </div>
  );
}
