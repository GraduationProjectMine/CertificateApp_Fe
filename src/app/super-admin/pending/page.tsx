"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../features/auth/components/AuthContext";
import { superAdminApi, type Organization, type Paginated } from "@/features/super-admin/services/api";
import toast from "react-hot-toast";

export default function PendingApprovalsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<Paginated<Organization>>({ items: [], total: 0, page: 1, limit: 20, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState("");

  useEffect(() => {
    if (!authLoading && (!user || (user.role !== "super_admin" && user.role !== "sysadmin"))) {
      router.push("/auth/login");
    }
  }, [user, authLoading, router]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await superAdminApi.listOrganizations({ status: "pending", limit: 50 });
      setData(result);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (user) loadData(); }, [user, loadData]);

  async function handleVerify(id: string) {
    setProcessingId(id);
    try {
      await superAdminApi.verifyOrganization(id);
      toast.success("Đã duyệt tổ chức");
      loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Duyệt thất bại");
    } finally {
      setProcessingId("");
    }
  }

  async function handleReject(id: string) {
    if (!window.confirm("Xác nhận từ chối tổ chức này?")) return;
    setProcessingId(id);
    try {
      await superAdminApi.suspendOrganization(id);
      toast.success("Đã từ chối tổ chức");
      loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Từ chối thất bại");
    } finally {
      setProcessingId("");
    }
  }

  if (authLoading) return <div className="p-6 text-xs text-gray-400">Đang tải...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Phê duyệt tổ chức</h1>
        <p className="text-xs text-gray-500 mt-1">Duyệt hoặc từ chối các tổ chức đăng ký mới</p>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400 text-xs">Đang tải...</div>
      ) : data.items.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-sm">Không có tổ chức nào chờ duyệt</p>
          <p className="text-[10px] mt-1">Tất cả tổ chức đã được xử lý</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.items.map((org) => (
            <div
              key={org.organization_id}
              className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 font-bold text-primary text-sm">
                  {org.organization_name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-bold">{org.organization_name}</p>
                  <p className="text-[10px] text-gray-400">{org.contact_email}</p>
                  <p className="text-[10px] text-gray-400">
                    Đăng ký: {new Date(org.created_at).toLocaleDateString("vi-VN")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleVerify(org.organization_id)}
                  disabled={processingId === org.organization_id}
                  className="rounded-xl bg-teal-600 px-4 py-2 text-[10px] font-bold text-white hover:bg-teal-700 transition-colors disabled:opacity-50"
                >
                  {processingId === org.organization_id ? "..." : "Duyệt"}
                </button>
                <button
                  onClick={() => handleReject(org.organization_id)}
                  disabled={processingId === org.organization_id}
                  className="rounded-xl border border-red-200 px-4 py-2 text-[10px] font-bold text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  Từ chối
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
