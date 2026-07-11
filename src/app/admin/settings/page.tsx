"use client";
import styles from "./page.module.css";
import React, { useState, useEffect } from 'react';
import { BrowserProvider } from 'ethers';
import { useAuth } from '../../../features/auth/components/AuthContext';
import { authApi } from '../../../features/auth/services/api';
import toast from 'react-hot-toast';

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const [isLinking, setIsLinking] = useState(false);
  const [orgName, setOrgName] = useState("");
  const [orgEmail, setOrgEmail] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchOrg = async () => {
      try {
        const data = await authApi.getOrganizationProfile();
        setOrgName(data.organization_name || "");
        setOrgEmail(data.contact_email || "");
        setLogoUrl(data.logo_url || "");
      } catch (err: any) {
        toast.error(err.message || "Không thể tải thông tin tổ chức");
      } finally {
        setLoading(false);
      }
    };
    fetchOrg();
  }, []);

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

  const handleSaveOrg = async () => {
    if (!orgName.trim() || !orgEmail.trim()) {
      toast.error("Vui lòng nhập đầy đủ tên và email tổ chức");
      return;
    }
    setSaving(true);
    try {
      await authApi.updateOrganizationProfile({
        organization_name: orgName,
        contact_email: orgEmail,
        logo_url: logoUrl,
      });
      toast.success("Cập nhật thông tin tổ chức thành công!");
    } catch (err: any) {
      toast.error(err.message || "Lỗi cập nhật thông tin tổ chức");
    } finally {
      setSaving(false);
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
        {loading ? (
          <p className="text-xs text-gray-400 py-4">Đang tải thông tin tổ chức...</p>
        ) : (
          <>
            <div className={styles._17}>
              <div>
                <label className={styles._18}>Tên trường *</label>
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className={styles._19}
                />
              </div>
              <div>
                <label className={styles._18}>Email liên hệ *</label>
                <input
                  type="email"
                  value={orgEmail}
                  onChange={(e) => setOrgEmail(e.target.value)}
                  className={styles._19}
                />
              </div>
              <div className="md:col-span-2">
                <label className={styles._18}>Đường dẫn ảnh Logo (URL)</label>
                <input
                  type="text"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  className={styles._19}
                  placeholder="https://example.com/logo.png"
                />
              </div>
            </div>
            <button
              onClick={handleSaveOrg}
              disabled={saving}
              className={`${styles._20} disabled:opacity-50`}
            >
              {saving ? "Đang lưu..." : "Lưu cấu hình"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
