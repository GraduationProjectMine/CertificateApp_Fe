"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { superAdminApi, type Organization, type OrgWalletInfo } from "@/features/super-admin/services/api";
import toast from "react-hot-toast";

export default function OrganizationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [org, setOrg] = useState<Organization | null>(null);
  const [wallet, setWallet] = useState<OrgWalletInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [funding, setFunding] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await superAdminApi.getOrganization(id);
      setOrg(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Không thể tải dữ liệu");
      router.push("/super-admin/organizations");
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  const loadWallet = useCallback(async () => {
    try {
      const w = await superAdminApi.getOrgWallet(id);
      setWallet(w);
    } catch {}
  }, [id]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (org) loadWallet();
  }, [org, loadWallet]);

  async function handleVerify() {
    setProcessing(true);
    try {
      await superAdminApi.verifyOrganization(id);
      toast.success("Đã duyệt tổ chức");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Duyệt thất bại");
    } finally {
      setProcessing(false);
    }
  }

  async function handleSuspend() {
    if (!window.confirm("Xác nhận tạm ngưng tổ chức này?")) return;
    setProcessing(true);
    try {
      await superAdminApi.suspendOrganization(id);
      toast.success("Đã tạm ngưng tổ chức");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Tạm ngưng thất bại");
    } finally {
      setProcessing(false);
    }
  }

  if (loading) return <div className="p-6 text-xs text-gray-400">Đang tải...</div>;
  if (!org) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/super-admin/organizations" className="text-[10px] text-gray-400 hover:text-primary mb-2 inline-block">
            &larr; Quay lại danh sách
          </Link>
          <h1 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{org.organization_name}</h1>
          <p className="text-xs text-gray-500 mt-1">{org.contact_email}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-3 py-1 text-[10px] font-bold ${org.is_verified ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
            {org.is_verified ? "Đã xác minh" : "Chờ duyệt"}
          </span>
          {org.is_verified ? (
            <button onClick={handleSuspend} disabled={processing} className="rounded-xl border border-red-200 px-4 py-2 text-[10px] font-bold text-red-500 hover:bg-red-50 disabled:opacity-50">
              Tạm ngưng
            </button>
          ) : (
            <button onClick={handleVerify} disabled={processing} className="rounded-xl bg-teal-600 px-4 py-2 text-[10px] font-bold text-white hover:bg-teal-700 disabled:opacity-50">
              {processing ? "..." : "Duyệt"}
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <p className="text-[10px] font-bold uppercase text-gray-500">Nhân viên</p>
          <p className="text-2xl font-black mt-1">{org.staff_accounts?.length ?? 0}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <p className="text-[10px] font-bold uppercase text-gray-500">Sinh viên</p>
          <p className="text-2xl font-black mt-1">{org.stats?.students ?? 0}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <p className="text-[10px] font-bold uppercase text-gray-500">Văn bằng</p>
          <p className="text-2xl font-black mt-1">{org.stats?.certificates ?? 0}</p>
        </div>
      </div>

      {/* Info */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h2 className="text-xs font-black uppercase tracking-wider mb-4">Thông tin tổ chức</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <p className="text-gray-400 mb-1">Email liên hệ</p>
            <p className="font-semibold">{org.contact_email}</p>
          </div>
          <div>
            <p className="text-gray-400 mb-1">Địa chỉ ví</p>
            <p className="font-mono text-[10px] break-all">{org.wallet_address || "Chưa thiết lập"}</p>
          </div>
          <div>
            <p className="text-gray-400 mb-1">Ngày đăng ký</p>
            <p className="font-semibold">{new Date(org.created_at).toLocaleDateString("vi-VN")}</p>
          </div>
          <div>
            <p className="text-gray-400 mb-1">Logo</p>
            <p className="font-semibold">{org.logo_url || "Chưa có"}</p>
          </div>
        </div>
      </div>

      {/* Wallet info */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-black uppercase tracking-wider">Ví điện tử</h2>
          <button onClick={loadWallet} className="text-[10px] text-primary font-bold hover:underline">
            Làm mới
          </button>
        </div>
        {wallet ? (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-gray-400 mb-1">Địa chỉ ví</p>
                <p className="font-mono text-[10px] break-all">{wallet.wallet_address}</p>
              </div>
              <div>
                <p className="text-gray-400 mb-1">Số dư</p>
                <p className={`font-bold text-sm ${Number(wallet.balance) > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                  {Number(wallet.balance).toFixed(4)} ETH
                </p>
              </div>
              <div>
                <p className="text-gray-400 mb-1">Trạng thái ủy quyền</p>
                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                  wallet.is_authorized ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                }`}>
                  {wallet.is_authorized ? "Đã ủy quyền (authorizedIssuer)" : "Chưa ủy quyền"}
                </span>
              </div>
              <div>
                <p className="text-gray-400 mb-1">Khóa riêng tư</p>
                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                  wallet.has_private_key ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
                }`}>
                  {wallet.has_private_key ? "Đã lưu (mã hóa AES-256)" : "Chưa có"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
              <button
                onClick={async () => {
                  const amount = prompt("Nhập số ETH để nạp:", "0.1");
                  if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return;
                  setFunding(true);
                  try {
                    await superAdminApi.fundOrgWallet(id, amount);
                    toast.success(`Đã nạp ${amount} ETH`);
                    loadWallet();
                  } catch (err) {
                    toast.error(err instanceof Error ? err.message : "Nạp thất bại");
                  } finally {
                    setFunding(false);
                  }
                }}
                disabled={funding}
                className="rounded-xl bg-teal-600 px-4 py-2 text-[10px] font-bold text-white hover:bg-teal-700 disabled:opacity-50"
              >
                {funding ? "..." : "Nạp ETH"}
              </button>
              <button
                onClick={async () => {
                  const action = wallet.is_authorized ? "thu hồi quyền" : "cấp quyền";
                  if (!window.confirm(`Xác nhận ${action} trên blockchain?`)) return;
                  try {
                    const result = wallet.is_authorized
                      ? await superAdminApi.deauthorizeOrg(id)
                      : await superAdminApi.reauthorizeOrg(id);
                    toast.success(result.message);
                    loadWallet();
                  } catch (err) {
                    toast.error(err instanceof Error ? err.message : "Thao tác thất bại");
                  }
                }}
                className={`rounded-xl border px-4 py-2 text-[10px] font-bold ${
                  wallet.is_authorized
                    ? "border-red-200 text-red-500 hover:bg-red-50"
                    : "border-teal-200 text-teal-600 hover:bg-teal-50"
                }`}
              >
                {wallet.is_authorized ? "Thu hồi quyền" : "Cấp quyền on-chain"}
              </button>
            </div>
          </div>
        ) : (
          <p className="text-xs text-gray-400 italic">Đang tải thông tin ví...</p>
        )}
      </div>

      {/* Staff list */}
      {org.staff_accounts && org.staff_accounts.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 overflow-hidden">
          <div className="border-b border-gray-100 dark:border-gray-800 p-5">
            <h2 className="text-xs font-black uppercase tracking-wider">Danh sách nhân viên ({org.staff_accounts.length})</h2>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50">
                <th className="text-left px-4 py-2 font-bold text-gray-500">Tên</th>
                <th className="text-left px-4 py-2 font-bold text-gray-500">Email</th>
                <th className="text-center px-4 py-2 font-bold text-gray-500">Vai trò</th>
                <th className="text-center px-4 py-2 font-bold text-gray-500">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {org.staff_accounts.map((s) => (
                <tr key={s.staff_id} className="border-t border-gray-100 dark:border-gray-800">
                  <td className="px-4 py-2.5 font-medium">{s.name}</td>
                  <td className="px-4 py-2.5 text-gray-500">{s.email}</td>
                  <td className="px-4 py-2.5 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                      s.role === "ISSUER" ? "bg-primary/10 text-primary" : "bg-gray-100 dark:bg-gray-800 text-gray-500"
                    }`}>
                      {s.role === "ISSUER" ? "Quản trị" : "Nhân viên"}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                      s.status === "ACTIVE" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                    }`}>
                      {s.status === "ACTIVE" ? "Hoạt động" : "Ngừng hoạt động"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
