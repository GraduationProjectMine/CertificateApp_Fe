"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../features/auth/components/AuthContext';
import { authApi } from '../../../features/auth/services/api';

interface PendingInstitution {
  id: string;
  name: string;
  code: string;
  email: string;
  status: string;
  createdAt: string;
}

export default function PendingApprovalsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [institutions, setInstitutions] = useState<PendingInstitution[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showResult, setShowResult] = useState<{ contractAddress: string; adminEmail: string; tempPassword: string } | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || (user.role !== 'super_admin' && user.role !== 'sysadmin'))) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  const fetchData = useCallback(async () => {
    try {
      const data = await authApi.getPendingInstitutions();
      setInstitutions(data);
    } catch { } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) fetchData();
  }, [user, fetchData]);

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    setMessage(null);
    setShowResult(null);
    try {
      const result = await authApi.approveInstitution(id);
      setShowResult({
        contractAddress: result.contractAddress,
        adminEmail: result.adminEmail,
        tempPassword: result.tempPassword,
      });
      setMessage({ type: 'success', text: 'Phê duyệt thành công!' });
      fetchData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Lỗi phê duyệt' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm('Xác nhận từ chối trường này?')) return;
    setActionLoading(id);
    setMessage(null);
    try {
      await authApi.rejectInstitution(id);
      setMessage({ type: 'success', text: 'Đã từ chối' });
      fetchData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Lỗi' });
    } finally {
      setActionLoading(null);
    }
  };

  if (authLoading || loading) return <div className="p-8 text-center">Đang tải...</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">Phê duyệt trường học</h1>
      <p className="text-sm text-gray-500 mb-8">Duyệt đơn đăng ký của các trường. Hệ thống sẽ tự động deploy smart contract và tạo tài khoản quản trị.</p>

      {message && (
        <div className={`p-4 rounded-xl text-sm mb-6 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {message.text}
        </div>
      )}

      {showResult && (
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 rounded-xl p-6 mb-6 space-y-3">
          <h3 className="font-bold text-blue-800 dark:text-blue-300">Kết quả phê duyệt</h3>
          <div className="text-sm space-y-1 text-blue-700 dark:text-blue-400">
            <p><span className="font-semibold">Contract:</span> <code className="bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 rounded text-xs">{showResult.contractAddress}</code></p>
            <p><span className="font-semibold">Email admin:</span> {showResult.adminEmail}</p>
            <p><span className="font-semibold">Mật khẩu tạm thời:</span> <code className="bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 rounded text-xs font-bold">{showResult.tempPassword}</code></p>
          </div>
          <p className="text-xs text-blue-500">Đã gửi email chứa thông tin trên đến admin trường.</p>
        </div>
      )}

      {institutions.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg font-semibold">Không có yêu cầu đăng ký nào</p>
          <p className="text-sm mt-1">Các trường đăng ký sẽ xuất hiện ở đây.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {institutions.map((inst) => (
            <div key={inst.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">{inst.name}</h3>
                <p className="text-sm text-gray-500">Mã: <span className="font-mono font-bold">{inst.code}</span></p>
                <p className="text-sm text-gray-500">Email: {inst.email}</p>
                <p className="text-xs text-gray-400">Đăng ký: {new Date(inst.createdAt).toLocaleDateString('vi-VN')}</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => handleReject(inst.id)} disabled={actionLoading === inst.id}
                  className="px-4 py-2 text-sm font-semibold text-red-600 border border-red-200 rounded-xl hover:bg-red-50 disabled:opacity-50">
                  Từ chối
                </button>
                <button onClick={() => handleApprove(inst.id)} disabled={actionLoading === inst.id}
                  className="px-4 py-2 text-sm font-semibold text-white bg-primary rounded-xl hover:bg-primary-hover disabled:opacity-60">
                  {actionLoading === inst.id ? 'Đang xử lý...' : 'Phê duyệt'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
