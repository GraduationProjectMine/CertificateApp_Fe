"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { staffApi, type StaffDto } from "@/features/staff/services/staff.api";
import { useAuth } from "@/features/auth/components/AuthContext";
import ConfirmModal from "@/components/common/Modal/ConfirmModal";
import FormModal from "@/components/common/Modal/FormModal";
import { ActionLink, ActionButton, ActionText } from "@/components/common/TableActions";
import Pagination from "@/components/common/Pagination";

const ITEMS_PER_PAGE = 10;

export default function StaffListPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [staff, setStaff] = useState<StaffDto[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lockingId, setLockingId] = useState("");
  const [lockTarget, setLockTarget] = useState<StaffDto | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ name: "", email: "", password: "" });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const canManageStaff = user?.role === "issuer";

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await staffApi.list();
      setStaff(data);
    } catch (err: any) {
      setError(err.message || "Không thể tải danh sách nhân viên");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const handleLock = async () => {
    if (!canManageStaff || !lockTarget) return;
    const id = lockTarget.staff_id;
    setLockingId(id);
    setLockTarget(null);
    try {
      await staffApi.update(id, { isActive: false });
      setStaff((prev) =>
        prev.map((s) => (s.staff_id === id ? { ...s, isActive: false } : s)),
      );
    } catch (err: any) {
      setError(err.message || "Khóa nhân viên thất bại");
    } finally {
      setLockingId("");
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name || !createForm.email || !createForm.password) {
      setCreateError("Vui lòng điền đầy đủ thông tin");
      return;
    }
    setCreating(true);
    setCreateError("");
    try {
      await staffApi.create(createForm);
      setShowCreate(false);
      setCreateForm({ name: "", email: "", password: "" });
      await fetchStaff();
    } catch (err: any) {
      setCreateError(err.message || "Tạo nhân viên thất bại");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <ConfirmModal
        open={!!lockTarget}
        onClose={() => setLockTarget(null)}
        title="Khóa tài khoản"
        message={lockTarget ? `Bạn có chắc chắn muốn khóa tài khoản của nhân viên ${lockTarget.name}? Nhân viên sẽ không thể đăng nhập vào hệ thống.` : ""}
        confirmLabel="Khóa"
        cancelLabel="Hủy"
        variant="warning"
        icon="warning"
        onConfirm={() => void handleLock()}
      />

      <FormModal
        open={showCreate}
        onClose={() => { setShowCreate(false); setCreateError(""); setCreateForm({ name: "", email: "", password: "" }); }}
        title="Thêm nhân viên"
        description="Tạo tài khoản nhân viên mới để hỗ trợ cấp văn bằng."
        onSubmit={(e) => void handleCreate(e)}
        submitting={creating}
        submitLabel="Tạo nhân viên"
      >
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">Họ và tên *</label>
          <input
            type="text"
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            value={createForm.name}
            onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
            placeholder="Nguyễn Văn B"
            autoFocus
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">Email *</label>
          <input
            type="email"
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            value={createForm.email}
            onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
            placeholder="staff@school.edu.vn"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">Mật khẩu *</label>
          <input
            type="password"
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            value={createForm.password}
            onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
            placeholder="Tối thiểu 8 ký tự"
          />
        </div>
        {createError && <div className="text-[11px] text-red-500 bg-red-50 dark:bg-red-950/20 px-3 py-2 rounded-lg">{createError}</div>}
      </FormModal>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Nhân viên</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Danh sách nhân viên trong trường.</p>
        </div>
        {canManageStaff && (
          <button
            onClick={() => setShowCreate(true)}
            className="px-4 py-2 text-xs font-bold text-white bg-primary hover:bg-primary-hover rounded-xl transition-all"
          >
            + Thêm nhân viên
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-xs text-red-600 dark:bg-red-950/20">
          {error} <button onClick={fetchStaff} className="ml-2 underline">Thử lại</button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 text-gray-400 dark:text-gray-500 text-xs">Đang tải danh sách nhân viên...</div>
      ) : staff.length === 0 ? (
        <div className="text-center py-16 text-gray-400 dark:text-gray-500">
          <p>Chưa có nhân viên nào.</p>
          {canManageStaff && (
            <button onClick={() => setShowCreate(true)} className="text-primary underline text-xs mt-2 inline-block">
              Tạo nhân viên đầu tiên
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800/60 rounded-3xl overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200/60 dark:border-gray-800/60">
                <th className="text-left px-4 py-3 font-bold text-gray-600 dark:text-gray-400">Tên</th>
                <th className="text-left px-4 py-3 font-bold text-gray-600 dark:text-gray-400">Email</th>
                <th className="text-left px-4 py-3 font-bold text-gray-600 dark:text-gray-400">Vai trò</th>
                <th className="text-left px-4 py-3 font-bold text-gray-600 dark:text-gray-400">Trạng thái</th>
                  {canManageStaff && <th className="text-right px-4 py-3 font-bold text-gray-600 dark:text-gray-400">Thao tác</th>}
              </tr>
            </thead>
            <tbody>
              {staff.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map((s) => (
                <tr key={s.staff_id} className="border-b border-gray-100 dark:border-gray-800/40 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{s.name}</td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{s.email}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                      s.role === 'ISSUER'
                        ? 'bg-primary/10 text-primary'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                    }`}>
                      {s.role === 'ISSUER' ? 'Quản trị' : 'Nhân viên'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                      s.isActive
                        ? 'bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 border border-green-200/50'
                        : 'bg-amber-50 dark:bg-amber-950/20 text-warning border border-amber-250/50'
                    }`}>
                      {s.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </td>
                  {canManageStaff && (
                    <td className="px-4 py-3 text-right space-x-2">
                      <ActionLink onClick={() => router.push(`/admin/staff/${s.staff_id}`)}>
                        Xem / Sửa
                      </ActionLink>
                      {s.isActive ? (
                        <ActionButton onClick={() => setLockTarget(s)} disabled={lockingId === s.staff_id}>
                          {lockingId === s.staff_id ? "Đang khóa..." : "Khóa"}
                        </ActionButton>
                      ) : (
                        <ActionText>Đã khóa</ActionText>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(staff.length / ITEMS_PER_PAGE)}
            totalItems={staff.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}
