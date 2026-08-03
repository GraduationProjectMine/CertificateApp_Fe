"use client";
import React, { useState } from "react";
import styles from "./ShareDialog.module.css";
import QRCodeBox from "@/components/credential/QRCodeBox";
import Link from "next/link";

interface ShareDialogProps {
  credentialCode: string;
  credentialTitle: string;
  onClose: () => void;
}

export default function ShareDialog({ credentialCode, credentialTitle, onClose }: ShareDialogProps) {
  const [activeTab, setActiveTab] = useState<"link" | "qr">("link");
  const [copied, setCopied] = useState(false);

  const directUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/public/certificate/${credentialCode}`;
  const verifyUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/public/verify?code=${credentialCode}`;

  const handleCopyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: credentialTitle,
          text: `Xác thực văn bằng: ${credentialTitle} - Mã: ${credentialCode}`,
          url: directUrl,
        });
      } catch {}
    }
  };

  return (
    <div className={styles._1} onClick={onClose}>
      <div className={styles._2} onClick={(e) => e.stopPropagation()}>
        <div className={styles._3}>
          <h2 className={styles._4}>Chia sẻ văn bằng</h2>
          <p className={styles._5}>{credentialTitle}</p>
        </div>

        <button onClick={onClose} className={styles._6}>
          <svg className={styles._7} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Tab switchers */}
        <div className="flex border-b border-gray-200 dark:border-gray-800 mb-5">
          <button
            onClick={() => setActiveTab("link")}
            className={`flex-1 pb-2.5 text-xs font-bold transition-all border-b-2 ${
              activeTab === "link"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            🔗 Link chia sẻ
          </button>
          <button
            onClick={() => setActiveTab("qr")}
            className={`flex-1 pb-2.5 text-xs font-bold transition-all border-b-2 ${
              activeTab === "qr"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            📱 Mã QR
          </button>
        </div>

        {activeTab === "link" ? (
          <div className="space-y-4">
            <div className={styles._12}>
              <label className={styles._13}>Link xác minh công khai</label>
              <div className={styles._14}>
                <input type="text" value={directUrl} readOnly className={styles._15} />
                <button onClick={() => handleCopyLink(directUrl)} className={styles._16}>
                  {copied ? (
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">Đã sao chép</span>
                  ) : (
                    <svg className={styles._7} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className={styles._12}>
              <label className={styles._13}>Link tra cứu nhanh</label>
              <div className={styles._14}>
                <input type="text" value={verifyUrl} readOnly className={styles._15} />
                <button onClick={() => handleCopyLink(verifyUrl)} className={styles._16}>
                  <svg className={styles._7} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="pt-2 space-y-2">

              {typeof navigator !== "undefined" && !!navigator.share && (
                <button onClick={handleShareNative} className={styles._17}>
                  <svg className={styles._18} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  Chia sẻ qua ứng dụng khác
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-3">
            <QRCodeBox value={directUrl} size={180} title="Quét mã để xác minh văn bằng công khai" />
          </div>
        )}
      </div>
    </div>
  );
}
