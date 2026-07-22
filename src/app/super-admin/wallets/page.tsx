"use client";
import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { superAdminApi, type OrgWalletInfo, type WalletsOverview } from "@/features/super-admin/services/api";
import toast from "react-hot-toast";

export default function WalletsPage() {
  const [data, setData] = useState<WalletsOverview>({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [funding, setFunding] = useState<Record<string, boolean>>({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await superAdminApi.getWalletsOverview();
      setData(result);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleFund(orgId: string, orgName: string) {
    const amount = prompt(`Nhập số ETH để nạp vào ${orgName}:`, "0.1");
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return;
    setFunding((prev) => ({ ...prev, [orgId]: true }));
    try {
      const result = await superAdminApi.fundOrgWallet(orgId, amount);
      toast.success(`Đã nạp ${amount} ETH thành công`);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Nạp ETH thất bại");
    } finally {
      setFunding((prev) => ({ ...prev, [orgId]: false }));
    }
  }

  async function handleToggleAuth(org: OrgWalletInfo) {
    const action = org.is_authorized ? "thu hồi quyền" : "cấp quyền";
    if (!window.confirm(`Xác nhận ${action} trên blockchain cho "${org.organization_name}"?`)) return;
    try {
      const result = org.is_authorized
        ? await superAdminApi.deauthorizeOrg(org.organization_id)
        : await superAdminApi.reauthorizeOrg(org.organization_id);
      toast.success(result.message);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Thao tác thất bại");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Ví điện tử</h1>
          <p className="text-xs text-gray-500 mt-1">Quản lý ví blockchain của các tổ chức</p>
        </div>
        <button
          onClick={load}
          className="rounded-xl border border-gray-200 px-4 py-2 text-[10px] font-bold hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
        >
          Làm mới
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400 text-xs">Đang tải...</div>
      ) : data.items.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">Chưa có tổ chức nào có ví</div>
      ) : (
        <div className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800/60 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200/60 dark:border-gray-800/60">
                <th className="text-left px-4 py-3 font-bold text-gray-600 dark:text-gray-400">Tổ chức</th>
                <th className="text-left px-4 py-3 font-bold text-gray-600 dark:text-gray-400">Địa chỉ ví</th>
                <th className="text-right px-4 py-3 font-bold text-gray-600 dark:text-gray-400">Số dư</th>
                <th className="text-center px-4 py-3 font-bold text-gray-600 dark:text-gray-400">Ủy quyền</th>
                <th className="text-right px-4 py-3 font-bold text-gray-600 dark:text-gray-400">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((org) => (
                <tr key={org.organization_id} className="border-b border-gray-100 dark:border-gray-800/40 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                  <td className="px-4 py-3">
                    <Link href={`/super-admin/organizations/${org.organization_id}`} className="font-bold hover:text-primary transition-colors">
                      {org.organization_name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    {org.has_wallet ? (
                      <span className="font-mono text-[10px] text-gray-500 break-all">{org.wallet_address}</span>
                    ) : (
                      <span className="text-gray-400 italic">Chưa có ví</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-bold ${Number(org.balance) > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                      {Number(org.balance).toFixed(4)} ETH
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                      org.is_authorized ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                    }`}>
                      {org.is_authorized ? "Đã ủy quyền" : "Chưa ủy quyền"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    {org.has_wallet && (
                      <>
                        <button
                          onClick={() => handleFund(org.organization_id, org.organization_name)}
                          disabled={funding[org.organization_id]}
                          className="text-[10px] text-teal-600 font-bold hover:underline disabled:opacity-50"
                        >
                          {funding[org.organization_id] ? "..." : "Nạp ETH"}
                        </button>
                        <button
                          onClick={() => handleToggleAuth(org)}
                          className={`text-[10px] font-bold hover:underline ${
                            org.is_authorized ? "text-red-500" : "text-teal-600"
                          }`}
                        >
                          {org.is_authorized ? "Thu hồi" : "Cấp quyền"}
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h2 className="text-xs font-black uppercase tracking-wider mb-3">Hướng dẫn</h2>
        <ul className="text-[11px] text-gray-500 space-y-1.5 list-disc pl-4">
          <li>Mỗi tổ chức khi đăng ký sẽ được tạo một ví Ethereum riêng</li>
          <li><strong className="text-gray-700">Nạp ETH</strong>: Gửi ETH từ admin wallet vào ví tổ chức để trả phí gas</li>
          <li><strong className="text-gray-700">Cấp quyền</strong>: Ủy quyền ví tổ chức trên smart contract (authorizeIssuer)</li>
          <li><strong className="text-gray-700">Thu hồi</strong>: Thu hồi quyền truy cập smart contract của tổ chức (deauthorizeIssuer)</li>
          <li>Trên local Hardhat, mỗi ví có sẵn ETH ảo, không cần nạp thêm</li>
        </ul>
      </div>
    </div>
  );
}
