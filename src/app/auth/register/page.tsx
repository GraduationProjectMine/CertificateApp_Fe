"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { authApi } from '../../../features/auth/services/api';

export default function RegisterPage() {
  const [form, setForm] = useState({
    institutionName: '',
    institutionCode: '',
    email: '',
    adminName: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (form.password !== form.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await authApi.registerInstitution({
        institutionName: form.institutionName,
        institutionCode: form.institutionCode.toUpperCase(),
        email: form.email,
        adminName: form.adminName,
        password: form.password,
      });
      setSuccess(result.message || 'Đăng ký thành công! Vui lòng chờ Super Admin phê duyệt.');
      setForm({ institutionName: '', institutionCode: '', email: '', adminName: '', password: '', confirmPassword: '' });
    } catch (err: any) {
      setError(err.message || 'Đăng ký thất bại');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-8">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 text-primary font-bold text-lg mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
              </svg>
              BlockCert
            </Link>
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Đăng ký trường học</h1>
            <p className="text-sm text-gray-500 mt-1">Đăng ký để được cấp hợp đồng thông minh riêng</p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm mb-4">{error}</div>
          )}
          {success && (
            <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/50 text-green-600 dark:text-green-400 p-4 rounded-xl text-sm mb-4">{success}</div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Tên trường / Học viện</label>
              <input type="text" name="institutionName" value={form.institutionName} onChange={handleChange} required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                placeholder="Trường Đại học Bách Khoa Hà Nội" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Mã trường (chữ in hoa, không dấu)</label>
              <input type="text" name="institutionCode" value={form.institutionCode} onChange={handleChange} required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm uppercase"
                placeholder="HUST" maxLength={20} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Email quản trị (email trường)</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                placeholder="admin@hust.edu.vn" />
              <p className="text-xs text-gray-400 mt-1">Không dùng email cá nhân (gmail, yahoo...)</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Tên người quản trị</label>
              <input type="text" name="adminName" value={form.adminName} onChange={handleChange} required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                placeholder="Nguyễn Văn A" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Mật khẩu</label>
              <input type="password" name="password" value={form.password} onChange={handleChange} required minLength={8}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                placeholder="Tối thiểu 8 ký tự, có chữ hoa, chữ thường và số" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Xác nhận mật khẩu</label>
              <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                placeholder="Nhập lại mật khẩu" />
            </div>
            <button type="submit" disabled={isSubmitting}
              className="w-full py-3 rounded-xl text-sm font-bold text-white bg-primary hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all disabled:opacity-60">
              {isSubmitting ? 'Đang gửi...' : 'Gửi yêu cầu đăng ký'}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-gray-500">
            Đã có tài khoản?{' '}
            <Link href="/auth/login" className="font-bold text-primary hover:underline">Đăng nhập</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
