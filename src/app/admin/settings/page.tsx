"use client";

import styles from "./page.module.css";
import React, { useEffect, useState } from "react";
import { BrowserProvider } from "ethers";
import { useAuth } from "@/features/auth/components/AuthContext";
import { authApi } from "@/features/auth/services/api";
import { issuerApi, type IssuerProfile } from "@/features/issuer/services/issuer.api";
import toast from "react-hot-toast";

type EthereumProvider = ConstructorParameters<typeof BrowserProvider>[0];
const emptyProfile = { organization_name: "", contact_email: "", logo_url: "" };

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const canEdit = user?.role === "issuer";
  const [profile, setProfile] = useState<IssuerProfile | null>(null);
  const [form, setForm] = useState(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const [profileError, setProfileError] = useState("");

  useEffect(() => {
    issuerApi.getProfile()
      .then((data) => {
        setProfile(data);
        setForm({
          organization_name: data.organization_name,
          contact_email: data.contact_email,
          logo_url: data.logo_url || "",
        });
      })
      .catch((err) => setProfileError(err instanceof Error ? err.message : "Không thể tải thông tin tổ chức"))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canEdit) return;
    setSaving(true);
    setProfileError("");
    try {
      const updated = await issuerApi.updateProfile({
        organization_name: form.organization_name.trim(),
        contact_email: form.contact_email.trim(),
        logo_url: form.logo_url.trim(),
      });
      setProfile(updated);
      setForm({
        organization_name: updated.organization_name,
        contact_email: updated.contact_email,
        logo_url: updated.logo_url || "",
      });
      toast.success("Đã cập nhật thông tin tổ chức");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Cập nhật tổ chức thất bại";
      setProfileError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleLinkWallet = async () => {
    const eth = (window as Window & { ethereum?: EthereumProvider }).ethereum;
    if (!eth) return toast.error("Vui lòng cài đặt MetaMask");
    setIsLinking(true);
    try {
      const provider = new BrowserProvider(eth);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const walletAddress = await signer.getAddress();
      const nonceRes = await authApi.getLinkWalletNonce(walletAddress);
      const signature = await signer.signMessage(nonceRes.message);
      const result = await authApi.linkWallet(walletAddress, signature);
      toast.success(result.message || "Liên kết ví thành công!");
      if (result.user) {
        localStorage.setItem("auth_user", JSON.stringify({ ...user, walletAddress: result.user.walletAddress }));
        window.location.reload();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Lỗi liên kết ví");
    } finally {
      setIsLinking(false);
    }
  };

  const handleUnlinkWallet = async () => {
    if (!confirm("Xác nhận hủy liên kết ví MetaMask?")) return;
    try {
      const result = await authApi.unlinkWallet();
      toast.success(result.message || "Hủy liên kết thành công");
      localStorage.setItem("auth_user", JSON.stringify({ ...user, walletAddress: null }));
      window.location.reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Lỗi hủy liên kết");
    }
  };

  return (
    <div className={styles._1}>
      <div><h1 className={styles._2}>Thông tin tổ chức</h1><p className={styles._3}>{canEdit ? "Cập nhật hồ sơ tổ chức phát hành" : "Bạn đang xem hồ sơ tổ chức ở chế độ chỉ đọc"}</p></div>

      <form onSubmit={handleSave} className={styles._4}>
        <div className="flex items-center justify-between gap-4">
          <h2 className={styles._5}>Hồ sơ tổ chức</h2>
          {profile && <span className={`rounded-full px-3 py-1 text-[10px] font-bold ${profile.is_verified ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>{profile.is_verified ? "Đã xác minh" : "Chưa xác minh"}</span>}
        </div>
        {loading ? <p className={styles._6}>Đang tải thông tin tổ chức...</p> : <>
          <div className={styles._17}>
            <Field label="Tên tổ chức"><input required minLength={2} disabled={!canEdit} value={form.organization_name} onChange={(e) => setForm({ ...form, organization_name: e.target.value })} className={styles._19} /></Field>
            <Field label="Email liên hệ"><input required type="email" disabled={!canEdit} value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} className={styles._19} /></Field>
            <Field label="URL logo"><input type="url" disabled={!canEdit} value={form.logo_url} onChange={(e) => setForm({ ...form, logo_url: e.target.value })} placeholder="https://.../logo.png" className={styles._19} /></Field>
            <Field label="Địa chỉ ví tổ chức"><input readOnly value={profile?.wallet_address || "Chưa thiết lập"} className={styles._19} /></Field>
          </div>
          {profileError && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{profileError}</p>}
          {canEdit && <button disabled={saving} className={styles._20}>{saving ? "Đang lưu..." : "Lưu thông tin"}</button>}
        </>}
      </form>

      {canEdit && <div className={styles._4}>
        <h2 className={styles._5}>Liên kết ví MetaMask</h2>
        <p className={styles._6}>Liên kết ví để xác thực danh tính khi thực hiện thao tác blockchain.</p>
        {user?.walletAddress ? <div className={styles._7}><div className={styles._8}><span className={styles._9} /><div><p className={styles._10}>Đã liên kết</p><code className={styles._11}>{user.walletAddress}</code></div></div><button onClick={handleUnlinkWallet} className={styles._12}>Hủy liên kết</button></div>
          : <div className={styles._7}><div className={styles._13}><p className={styles._14}>Chưa liên kết ví</p><p className={styles._15}>Kết nối ví MetaMask của tài khoản quản trị tổ chức.</p></div><button onClick={handleLinkWallet} disabled={isLinking} className={styles._16}>{isLinking ? "Đang kết nối..." : "Liên kết MetaMask"}</button></div>}
      </div>}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className={styles._18}>{label}</label>{children}</div>;
}
