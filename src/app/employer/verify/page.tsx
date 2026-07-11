"use client";
import React, { useState, useRef } from "react";
import styles from "./page.module.css";
import VerificationResult from "@/components/credential/VerificationResult";
import type { VerificationData } from "@/components/credential/VerificationResult";
import { certificateApi } from "@/features/certificates/services/certificate.api";

type VerifyMode = "code" | "qrcode" | "pdf";

export default function EmployerVerifyPage() {
  const [mode, setMode] = useState<VerifyMode>("code");
  const [serialNumber, setSerialNumber] = useState("");
  const [registryNumber, setRegistryNumber] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<VerificationData | null>(null);
  const [error, setError] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfHash, setPdfHash] = useState("");
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const handleVerify = async (sNum: string, rNum: string) => {
    if (!sNum.trim() || !rNum.trim()) {
      setError("Vui lòng nhập đầy đủ Số hiệu và Số vào sổ");
      return;
    }
    setError("");
    setIsVerifying(true);
    setResult(null);

    try {
      const data = await certificateApi.verify(sNum.trim(), rNum.trim());
      
      const statusMap: Record<string, "VALID" | "REVOKED" | "INVALID"> = {
        ISSUED: "VALID",
        REVOKED: "REVOKED",
      };

      const status: "VALID" | "REVOKED" | "INVALID" = data.isValid
        ? (statusMap[data.status] || "INVALID")
        : "INVALID";

      const mappedResult: VerificationData = {
        status,
        credentialCode: data.certificateDetails?.certificateId || "",
        studentName: data.certificateDetails?.studentFullName || "",
        credentialTitle: data.certificateDetails?.certificateTitle || "",
        issuerName: data.certificateDetails?.organizationName || "",
        issueDate: data.certificateDetails?.issueDate || "",
        serialNumber: data.certificateDetails?.serialNumber || "",
        ipfsCid: data.blockchain?.cid || data.certificateDetails?.ipfsCid || "",
        transactionHash: data.certificateDetails?.txHash || "",
        contractAddress: data.blockchain?.issuer || "",
        network: "Sepolia Blockchain",
        credentialHash: data.blockchain?.sha3Hash || "",
        verifiedAt: new Date().toLocaleString("vi-VN"),
      };
      setResult(mappedResult);
    } catch (err: any) {
      setResult({
        status: "INVALID",
        credentialCode: "",
        error: err.message || "Không tìm thấy văn bằng tương ứng hoặc văn bằng chưa được phát hành lên Blockchain.",
        verifiedAt: new Date().toLocaleString("vi-VN"),
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPdfFile(file);
    setError("");

    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    setPdfHash(hashHex);

    setIsVerifying(true);
    await new Promise((r) => setTimeout(r, 1000));

    setResult({
      status: "INVALID",
      credentialCode: "",
      error: "Tính năng xác thực bằng File PDF đang được hoàn thiện. Vui lòng nhập số hiệu và số vào sổ.",
      verifiedAt: new Date().toLocaleString("vi-VN"),
    });
    setIsVerifying(false);
  };

  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
    } catch {
      setError("Không thể truy cập camera. Vui lòng nhập mã thủ công.");
    }
  };

  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const handleReset = () => {
    setResult(null);
    setError("");
    setPdfFile(null);
    setPdfHash("");
    closeCamera();
  };

  if (result) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Kết quả xác minh</h1>
          <p className={styles.subtitle}>Kết quả kiểm tra dữ liệu đối chiếu trên Blockchain</p>
        </div>
        <div className="mt-6 max-w-3xl">
          <VerificationResult result={result} onReset={handleReset} />
        </div>
      </div>
    );
  }

  const tabs: { key: VerifyMode; label: string; icon: string }[] = [
    { key: "code", label: "Nhập mã số hiệu", icon: "M10 21h7a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v11m0 5l4.879-4.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242z" },
    { key: "qrcode", label: "Quét mã QR", icon: "M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" },
    { key: "pdf", label: "Upload file PDF", icon: "M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Xác minh văn bằng</h1>
        <p className={styles.subtitle}>
          Tra cứu và xác thực tính hợp lệ của văn bằng chứng chỉ trên hệ thống Blockchain.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex gap-2 border-b border-gray-200 dark:border-gray-800 pb-px">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => { setMode(tab.key); setError(""); }}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all -mb-px ${
                  mode === tab.key
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={tab.icon} />
                </svg>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800/60 rounded-2xl p-6">
            {mode === "code" && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500">Số hiệu (Số hiệu văn bằng) *</label>
                  <input
                    type="text"
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    placeholder="Nhập số hiệu..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500">Số vào sổ cấp bằng *</label>
                  <input
                    type="text"
                    value={registryNumber}
                    onChange={(e) => setRegistryNumber(e.target.value)}
                    placeholder="Nhập số vào sổ..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                {error && <p className="text-xs text-red-500">{error}</p>}
                <button
                  onClick={() => handleVerify(serialNumber, registryNumber)}
                  disabled={isVerifying}
                  className="w-full py-3 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-all disabled:opacity-50"
                >
                  {isVerifying ? "Đang xác minh..." : "Xác minh văn bằng"}
                </button>
              </div>
            )}

            {mode === "qrcode" && (
              <div className="space-y-6">
                {!cameraActive ? (
                  <div className="text-center py-8 space-y-4">
                    <div className="w-16 h-16 mx-auto bg-gray-50 dark:bg-gray-950 rounded-2xl flex items-center justify-center border border-gray-200/50 dark:border-gray-800/50">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                      </svg>
                    </div>
                    <p className="text-xs text-gray-500 max-w-sm mx-auto">Sử dụng webcam/camera để quét trực tiếp mã QR in trên văn bằng.</p>
                    <button onClick={openCamera} className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-all">
                      Mở Camera
                    </button>
                  </div>
                ) : (
                  <div className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-black aspect-video max-w-md mx-auto">
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                    <div className="absolute inset-x-0 bottom-4 flex flex-col items-center gap-2">
                      <p className="text-[10px] text-white bg-black/60 px-3 py-1 rounded-full backdrop-blur-sm">Đưa mã QR vào khung hình</p>
                      <button onClick={closeCamera} className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold rounded-lg transition-all">
                        Đóng Camera
                      </button>
                    </div>
                  </div>
                )}
                <div className="border-t border-gray-100 dark:border-gray-800/80 pt-5 space-y-4">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Hoặc nhập mã số hiệu & số vào sổ</p>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={serialNumber}
                      onChange={(e) => setSerialNumber(e.target.value)}
                      placeholder="Số hiệu..."
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                    <input
                      type="text"
                      value={registryNumber}
                      onChange={(e) => setRegistryNumber(e.target.value)}
                      placeholder="Số vào sổ..."
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                    <button onClick={() => handleVerify(serialNumber, registryNumber)} disabled={isVerifying} className="w-full py-3 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-all">
                      {isVerifying ? "..." : "Xác minh"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {mode === "pdf" && (
              <div className="space-y-6">
                <div className="border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl p-8 text-center space-y-4">
                  <div className="w-16 h-16 mx-auto bg-gray-50 dark:bg-gray-950 rounded-2xl flex items-center justify-center border border-gray-200/50 dark:border-gray-800/50">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto">Tải lên tệp PDF văn bằng để đối chiếu mã băm (Hash) với sổ cái blockchain.</p>
                  <label className="inline-block px-6 py-2.5 bg-gray-150 dark:bg-gray-850 hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-xl transition-all cursor-pointer">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handlePdfUpload}
                      className="hidden"
                    />
                    Chọn file PDF
                  </label>
                </div>
                {pdfFile && (
                  <div className="bg-gray-50 dark:bg-gray-950/40 rounded-xl p-4 space-y-2 border border-gray-100 dark:border-gray-900">
                    <p className="text-xs text-gray-600 dark:text-gray-400">File: {pdfFile.name}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Kích thước: {(pdfFile.size / 1024).toFixed(1)} KB</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">SHA-256 Hash: <span className="font-mono text-[10px] break-all">{pdfHash}</span></p>
                  </div>
                )}
                {error && <p className="text-xs text-red-500">{error}</p>}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800/60 rounded-2xl p-6 h-fit space-y-5">
          <h2 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Lưu ý khi tra cứu</h2>
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold shrink-0">1</div>
              <p className="text-xs text-gray-500">Số hiệu và Số vào sổ là thông tin bắt buộc được in trên văn bằng.</p>
            </div>
            <div className="flex gap-3">
              <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold shrink-0">2</div>
              <p className="text-xs text-gray-500">Dữ liệu đối chiếu được truy xuất trực tiếp từ mạng Blockchain Sepolia và hệ thống IPFS.</p>
            </div>
            <div className="flex gap-3">
              <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold shrink-0">3</div>
              <p className="text-xs text-gray-500">Nếu văn bằng có dấu hiệu chỉnh sửa hoặc không tồn tại trên blockchain, hệ thống sẽ cảnh báo không hợp lệ.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
