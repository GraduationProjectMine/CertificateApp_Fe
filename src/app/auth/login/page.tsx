"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../features/auth/components/AuthContext';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, config: any) => void;
          prompt: () => void;
        };
      };
    };
  }
}

export default function LoginPage() {
  const { user, login, loginWithGoogle, loginWithMetaMask } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const googleBtnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) router.push(getDashboardRedirect(user.role));
  }, [user, router]);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.google || !googleBtnRef.current) return;
    try {
      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
      });
      window.google.accounts.id.renderButton(googleBtnRef.current, {
        theme: 'outline', size: 'large', width: 320,
      });
    } catch { }
  }, []);

  const handleGoogleResponse = async (response: any) => {
    setIsSubmitting(true);
    setError('');
    const result = await loginWithGoogle(response.credential);
    if (!result.success) setError(result.error || 'Google login failed');
    setIsSubmitting(false);
  };

  const getDashboardRedirect = (role: string) => {
    const r = role?.toLowerCase();
    if (r === 'super_admin' || r === 'sysadmin') return '/super-admin/dashboard';
    if (r === 'institution_admin' || r === 'issuer') return '/admin/dashboard';
    if (r === 'student') return '/student/dashboard';
    return '/public/verify';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Vui lòng nhập email và mật khẩu'); return; }
    setIsSubmitting(true);
    const result = await login(email, password);
    if (!result.success) setError(result.error || 'Sai email hoặc mật khẩu');
    setIsSubmitting(false);
  };

  const handleMetaMask = async () => {
    setError('');
    setIsSubmitting(true);
    const result = await loginWithMetaMask();
    if (!result.success) setError(result.error || 'Lỗi MetaMask');
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#f8fafc] dark:bg-[#030712]">
      <div className="relative hidden md:flex md:w-5/12 lg:w-1/2 flex-col justify-between p-12 text-white bg-gradient-to-br from-slate-900 via-slate-950 to-black overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
        <Link href="/" className="flex items-center gap-3 relative z-10">
          <div className="w-9 h-9 rounded-lg bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
            <svg className="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
            </svg>
          </div>
          <span className="font-bold text-lg tracking-wider text-white">BlockCert</span>
        </Link>
        <div className="my-auto relative z-10">
          <h2 className="text-3xl font-extrabold mb-4">Hệ thống quản lý văn bằng Blockchain</h2>
          <p className="text-slate-400 text-sm max-w-md leading-relaxed">
            Cấp phát, xác thực và lưu trữ văn bằng chứng chỉ trên nền tảng blockchain phi tập trung.
          </p>
        </div>
        <div className="relative z-10 text-xs text-slate-500">© 2026 BlockCert</div>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Đăng nhập</h1>
            <p className="text-sm text-gray-500 mt-2">Sử dụng tài khoản email hoặc kết nối ví</p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                placeholder="admin@truonghoc.edu.vn" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Mật khẩu</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                placeholder="••••••••" />
            </div>
            <button type="submit" disabled={isSubmitting}
              className="w-full py-3 rounded-xl text-sm font-bold text-white bg-primary hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all">
              {isSubmitting ? 'Đang xử lý...' : 'Đăng nhập'}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200 dark:border-gray-800"></div></div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-[#030712] px-3 text-gray-500 font-semibold">Hoặc</span>
            </div>
          </div>

          <div ref={googleBtnRef} className="flex justify-center"></div>

          <button type="button" onClick={handleMetaMask} disabled={isSubmitting}
            className="w-full py-3 px-4 rounded-xl border border-orange-500/20 hover:border-orange-500 bg-orange-500/5 hover:bg-orange-500/10 text-orange-600 dark:text-orange-400 font-bold transition-all flex items-center justify-center gap-3">
            <svg className="w-5 h-5" viewBox="0 0 256 238" fill="none"><path d="M247.9 104.8l-15-46.7-56-42.5-44.5 59 4.3.4 35.3-32.9L247.9 104.8z" fill="#E2761B"/><path d="M8.1 104.8l15-46.7 56-42.5 44.5 59-4.3.4-35.3-32.9L8.1 104.8z" fill="#E4761B"/><path d="M211.9 173.8l-30 46-53.9-9.8.5-5.9 45.4-13.8 38-16.5z" fill="#D7C1B1"/><path d="M44.1 173.8l30 46 53.9-9.8-.5-5.9-45.4-13.8-38-16.5z" fill="#D7C1B1"/><path d="M174.5 130.6l-20.2 38.6-26.3-5-26.3 5-20.2-38.6 30.2 5.5 16.3-26.8 16.3 26.8 30.2-5.5z" fill="#233447"/><path d="M57.6 139.1l8.5-43.7 20.2-5.5-24.9 32.7-3.8 16.5z" fill="#CD7C2F"/><path d="M198.4 139.1l-8.5-43.7-20.2-5.5 24.9 32.7 3.8 16.5z" fill="#CD7C2F"/><path d="M128 221.3l52.5-47.5-31.5-5.7-21 21.2-21-21.2-31.5 5.7 52.5 47.5z" fill="#E2761B"/><path d="M82.8 136l19.5 29.8-30.2-5.5 10.7-24.3z" fill="#E2761B"/><path d="M173.2 136l-19.5 29.8 30.2-5.5-10.7-24.3z" fill="#E2761B"/></svg>
            Kết nối ví MetaMask
          </button>

          <div className="text-center text-xs text-gray-500 space-y-2">
            <Link href="/auth/register" className="block font-bold text-primary hover:underline">Đăng ký tài khoản trường học</Link>
            <Link href="/auth/forgot-password" className="block text-gray-400 hover:underline">Quên mật khẩu?</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
