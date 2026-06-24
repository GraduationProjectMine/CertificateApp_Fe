"use client";

import React, { useState } from 'react';
import { BrowserProvider } from 'ethers';
import { useAuth } from '../../../features/auth/components/AuthContext';
import { authApi } from '../../../features/auth/services/api';
import toast from 'react-hot-toast';

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const [isLinking, setIsLinking] = useState(false);

  const handleLinkWallet = async () => {
    if (!window.ethereum) {
      toast.error('Vui lòng cài đặt MetaMask');
      return;
    }
    setIsLinking(true);
    try {
      const provider = new BrowserProvider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();
      const walletAddress = await signer.getAddress();

      const nonceRes = await authApi.getLinkWalletNonce(walletAddress);
      const signature = await signer.signMessage(nonceRes.message);
      const result = await authApi.linkWallet(walletAddress, signature);

      toast.success(result.message || 'Liên kết ví thành công!');
      if (result.user) {
        localStorage.setItem('auth_user', JSON.stringify({ ...user, walletAddress: result.user.walletAddress }));
        window.location.reload();
      }
    } catch (err: any) {
      toast.error(err.message || 'Lỗi liên kết ví');
    } finally {
      setIsLinking(false);
    }
  };

  const handleUnlinkWallet = async () => {
    if (!confirm('Xác nhận hủy liên kết ví MetaMask?')) return;
    try {
      const result = await authApi.unlinkWallet();
      toast.success(result.message || 'Hủy liên kết thành công');
      localStorage.setItem('auth_user', JSON.stringify({ ...user, walletAddress: null }));
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message || 'Lỗi hủy liên kết');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Cài đặt hệ thống</h1>
        <p className="text-xs text-gray-500 mt-1">Cấu hình tổ chức và kết nối ví blockchain</p>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800/60 rounded-3xl p-6 sm:p-8 space-y-6 text-xs">
        <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-widest border-b border-gray-100 dark:border-gray-850 pb-2">
          Liên kết ví MetaMask
        </h2>
        <p className="text-gray-500">
          Liên kết ví MetaMask để xác thực danh tính khi thực hiện các thao tác quan trọng.
        </p>

        {user?.walletAddress ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/30 rounded-xl">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              <div>
                <p className="font-semibold text-green-800 dark:text-green-300">Đã liên kết</p>
                <code className="text-xs text-green-600 dark:text-green-400">{user.walletAddress}</code>
              </div>
            </div>
            <button onClick={handleUnlinkWallet}
              className="px-4 py-2 text-xs font-bold text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-all">
              Hủy liên kết
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900/30 rounded-xl">
              <p className="font-semibold text-yellow-800 dark:text-yellow-300">Chưa liên kết ví</p>
              <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                Liên kết ví MetaMask để tăng cường bảo mật tài khoản
              </p>
            </div>
            <button onClick={handleLinkWallet} disabled={isLinking}
              className="px-4 py-2.5 text-xs font-bold text-white bg-primary rounded-xl hover:bg-primary-hover disabled:opacity-60 transition-all flex items-center gap-2">
              {isLinking ? 'Đang kết nối...' : 'Liên kết MetaMask'}
            </button>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800/60 rounded-3xl p-6 sm:p-8 space-y-6 text-xs">
        <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-widest border-b border-gray-100 dark:border-gray-850 pb-2">
          Thông tin tổ chức
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1.5">Tên trường</label>
            <input type="text" defaultValue="Đại học Bách Khoa Hà Nội"
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-950 dark:text-white" />
          </div>
          <div>
            <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1.5">Mã trường</label>
            <input type="text" defaultValue="HUST"
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-950 dark:text-white" />
          </div>
        </div>
        <button className="px-5 py-2.5 text-xs font-bold text-white bg-primary hover:bg-primary-hover rounded-xl transition-all">
          Lưu cấu hình
        </button>
      </div>
    </div>
  );
}
