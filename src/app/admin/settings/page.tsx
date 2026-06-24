"use client";
import styles from "./page.module.css";
import React, { useState } from 'react';
import { BrowserProvider } from 'ethers';
import { useAuth } from '../../../features/auth/components/AuthContext';
import { authApi } from '../../../features/auth/services/api';
import toast from 'react-hot-toast';

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const [isLinking, setIsLinking] = useState(false);

  const handleLinkWallet = async () => {
    const eth = (window as any).ethereum;
    if (!eth) {
      toast.error('Vui lòng cài đặt MetaMask');
      return;
    }
    setIsLinking(true);
    try {
      const provider = new BrowserProvider(eth);
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
    <div className={styles._1}>
      <div>
        <h1 className={styles._2}>Cài đặt hệ thống</h1>
        <p className={styles._3}>Cấu hình tổ chức và kết nối ví blockchain</p>
      </div>

      <div className={styles._4}>
        <h2 className={styles._5}>
          Liên kết ví MetaMask
        </h2>
        <p className={styles._6}>
          Liên kết ví MetaMask để xác thực danh tính khi thực hiện các thao tác quan trọng.
        </p>

        {user?.walletAddress ? (
          <div className={styles._7}>
            <div className={styles._8}>
              <span className={styles._9}></span>
              <div>
                <p className={styles._10}>Đã liên kết</p>
                <code className={styles._11}>{user.walletAddress}</code>
              </div>
            </div>
            <button onClick={handleUnlinkWallet}
              className={styles._12}>
              Hủy liên kết
            </button>
          </div>
        ) : (
          <div className={styles._7}>
            <div className={styles._13}>
              <p className={styles._14}>Chưa liên kết ví</p>
              <p className={styles._15}>
                Liên kết ví MetaMask để tăng cường bảo mật tài khoản
              </p>
            </div>
            <button onClick={handleLinkWallet} disabled={isLinking}
              className={styles._16}>
              {isLinking ? 'Đang kết nối...' : 'Liên kết MetaMask'}
            </button>
          </div>
        )}
      </div>

      <div className={styles._4}>
        <h2 className={styles._5}>
          Thông tin tổ chức
        </h2>
        <div className={styles._17}>
          <div>
            <label className={styles._18}>Tên trường</label>
            <input type="text" defaultValue="Đại học Bách Khoa Hà Nội"
              className={styles._19} />
          </div>
          <div>
            <label className={styles._18}>Mã trường</label>
            <input type="text" defaultValue="HUST"
              className={styles._19} />
          </div>
        </div>
        <button className={styles._20}>
          Lưu cấu hình
        </button>
      </div>
    </div>
  );
}
