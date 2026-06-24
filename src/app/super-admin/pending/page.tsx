"use client";
import styles from "./page.module.css";
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

  if (authLoading || loading) return <div className={styles._1}>Đang tải...</div>;

  return (
    <div className={styles._2}>
      <h1 className={styles._3}>Phê duyệt trường học</h1>
      <p className={styles._4}>Duyệt đơn đăng ký của các trường. Hệ thống sẽ tự động deploy smart contract và tạo tài khoản quản trị.</p>

      {message && (
        <div className={`${styles._0} ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {message.text}
        </div>
      )}

      {showResult && (
        <div className={styles._5}>
          <h3 className={styles._6}>Kết quả phê duyệt</h3>
          <div className={styles._7}>
            <p><span className={styles._8}>Contract:</span> <code className={styles._9}>{showResult.contractAddress}</code></p>
            <p><span className={styles._8}>Email admin:</span> {showResult.adminEmail}</p>
            <p><span className={styles._8}>Mật khẩu tạm thời:</span> <code className={styles._10}>{showResult.tempPassword}</code></p>
          </div>
          <p className={styles._11}>Đã gửi email chứa thông tin trên đến admin trường.</p>
        </div>
      )}

      {institutions.length === 0 ? (
        <div className={styles._12}>
          <p className={styles._13}>Không có yêu cầu đăng ký nào</p>
          <p className={styles._14}>Các trường đăng ký sẽ xuất hiện ở đây.</p>
        </div>
      ) : (
        <div className={styles._15}>
          {institutions.map((inst) => (
            <div key={inst.id} className={styles._16}>
              <div>
                <h3 className={styles._17}>{inst.name}</h3>
                <p className={styles._18}>Mã: <span className={styles._19}>{inst.code}</span></p>
                <p className={styles._18}>Email: {inst.email}</p>
                <p className={styles._20}>Đăng ký: {new Date(inst.createdAt).toLocaleDateString('vi-VN')}</p>
              </div>
              <div className={styles._21}>
                <button onClick={() => handleReject(inst.id)} disabled={actionLoading === inst.id}
                  className={styles._22}>
                  Từ chối
                </button>
                <button onClick={() => handleApprove(inst.id)} disabled={actionLoading === inst.id}
                  className={styles._23}>
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
