"use client";
import React, { useState, useRef } from "react";
import Link from "next/link";
import styles from "./page.module.css";
import VerificationResult from "@/components/credential/VerificationResult";
import type { VerificationData } from "@/components/credential/VerificationResult";

type VerifyMode = "code" | "qrcode" | "pdf";

export default function VerifyPublicPage() {
  const [mode, setMode] = useState<VerifyMode>("code");
  const [credentialCode, setCredentialCode] = useState("");
  const [txHash, setTxHash] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<VerificationData | null>(null);
  const [error, setError] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfHash, setPdfHash] = useState("");
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const handleVerifyByCode = async () => {
    if (!credentialCode.trim()) {
      setError("Vui lòng nhập mã văn bằng");
      return;
    }
    setError("");
    setIsVerifying(true);
    await new Promise((r) => setTimeout(r, 1200));
    const mockResult: VerificationData = {
      status: credentialCode === "VD-2026-000001" ? "VALID" : "INVALID",
      credentialCode,
      studentName: "Nguyễn Văn Hùng",
      credentialTitle: "Bằng cử nhân Công nghệ thông tin",
      issuerName: "Đại học Bách khoa Hà Nội",
      issueDate: "20/06/2026",
      major: "Kỹ thuật phần mềm",
      classification: "Giỏi",
      serialNumber: "B2026/001",
      ipfsCid: "bafybeigdyrzt5mmp4l6s5h3h3p4p5k5q5z5y5x5w5v5u5t5s5r5q5p5o5n5m",
      transactionHash: "0x71c7e3b8a9c1d4f6e2a0b3c5d7e9f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e",
      contractAddress: "0x3b82f6a7b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4",
      network: "Sepolia",
      credentialHash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
      verifiedAt: new Date().toLocaleString("vi-VN"),
    };
    setResult(mockResult);
    setIsVerifying(false);
  };

  const handleVerifyByTxHash = async () => {
    if (!txHash.trim()) {
      setError("Vui lòng nhập transaction hash");
      return;
    }
    setError("");
    setIsVerifying(true);
    await new Promise((r) => setTimeout(r, 1200));
    setResult({
      status: "INVALID",
      credentialCode: "",
      error: "Transaction hash không tồn tại trên blockchain.",
      verifiedAt: new Date().toLocaleString("vi-VN"),
    });
    setIsVerifying(false);
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

    const isMatch = hashHex.startsWith("abcdef");
    if (isMatch) {
      setResult({
        status: "VALID",
        credentialCode: "VD-2026-000001",
        studentName: "Nguyễn Văn Hùng",
        credentialTitle: "Bằng cử nhân Công nghệ thông tin",
        issuerName: "Đại học Bách khoa Hà Nội",
        issueDate: "20/06/2026",
        ipfsCid: "bafybeigdyrzt5mmp4l6s5h3h3p4p5k5q5z5y5x5w5v5u5t5s5r5q5p5o5n5m",
        transactionHash: "0x71c7e3b8a9c1d4f6e2a0b3c5d7e9f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e",
        contractAddress: "0x3b82f6a7b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4",
        network: "Sepolia",
        verifiedAt: new Date().toLocaleString("vi-VN"),
      });
    } else {
      setResult({
        status: "INVALID",
        credentialCode: "",
        error: "Hash của file PDF không khớp với dữ liệu trên blockchain. File có thể đã bị chỉnh sửa.",
        verifiedAt: new Date().toLocaleString("vi-VN"),
      });
    }
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
      <div className={styles._1}>
        <div className={styles._41}>
        <Link href="/" className={`group ${styles._42}`}>
            <span className={styles._43}>C</span>
            <span className={styles._44}>CertiChain</span>
          </Link>
          <span className={styles._45}>
            <svg className={styles._46} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </span>
          <span className={styles._47}>Kết quả xác minh</span>
          <div className={styles._48}>
            <span className={styles._49} />
            <span className={styles._50}>Sepolia</span>
          </div>
        </div>
        <div className={styles._2}>
          <VerificationResult result={result} onReset={handleReset} />
        </div>
      </div>
    );
  }

  const tabs: { key: VerifyMode; label: string; icon: string }[] = [
    { key: "code", label: "Nhập mã văn bằng", icon: "M10 21h7a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v11m0 5l4.879-4.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242z" },
    { key: "qrcode", label: "Quét mã QR", icon: "M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" },
    { key: "pdf", label: "Upload file PDF", icon: "M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" },
  ];

  return (
    <div className={styles._1}>
      <div className={styles._41}>
        <Link href="/" className={`group ${styles._42}`}>
          <span className={styles._43}>C</span>
          <span className={styles._44}>CertiChain</span>
        </Link>
        <span className={styles._45}>
          <svg className={styles._46} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        </span>
        <span className={styles._47}>Xác minh văn bằng</span>
        <div className={styles._48}>
          <span className={styles._49} />
          <span className={styles._50}>Sepolia</span>
        </div>
      </div>
      <div className={styles._3}>
        <h1 className={styles._4}>Xác minh văn bằng</h1>
        <p className={styles._5}>
          Kiểm tra tính xác thực của văn bằng/chứng chỉ được cấp bởi các trường đại học và tổ chức giáo dục.
        </p>
      </div>

      <div className={styles._6}>
        <div className={styles._7}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setMode(tab.key); setError(""); }}
              className={`${styles._0} ${mode === tab.key ? styles._8 : styles._9}`}
            >
              <svg className={styles._10} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={tab.icon} />
              </svg>
              {tab.label}
            </button>
          ))}
        </div>

        <div className={styles._11}>
          {mode === "code" && (
            <div className={styles._12}>
              <div className={styles._13}>
                <label className={styles._14}>Mã văn bằng</label>
                <input
                  type="text"
                  value={credentialCode}
                  onChange={(e) => setCredentialCode(e.target.value)}
                  placeholder="VD-2026-000001"
                  className={styles._15}
                />
              </div>
              <div className={styles._13}>
                <label className={styles._14}>Transaction Hash (tùy chọn)</label>
                <input
                  type="text"
                  value={txHash}
                  onChange={(e) => setTxHash(e.target.value)}
                  placeholder="0x..."
                  className={styles._15}
                />
              </div>
              {error && <p className={styles._16}>{error}</p>}
              <button
                onClick={handleVerifyByCode}
                disabled={isVerifying}
                className={styles._17}
              >
                {isVerifying ? "Đang xác minh..." : "Xác minh"}
              </button>
            </div>
          )}

          {mode === "qrcode" && (
            <div className={styles._12}>
              {!cameraActive ? (
                <div className={styles._18}>
                  <div className={styles._19}>
                    <svg className={styles._20} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                  </div>
                  <p className={styles._21}>Sử dụng camera để quét mã QR trên văn bằng</p>
                  <button onClick={openCamera} className={styles._17}>
                    Mở Camera
                  </button>
                </div>
              ) : (
                <div className={styles._22}>
                  <video ref={videoRef} autoPlay playsInline className={styles._23} />
                  <div className={styles._24}>
                    <p className={styles._25}>Đưa mã QR vào khung hình</p>
                    <button onClick={closeCamera} className={styles._26}>
                      Đóng Camera
                    </button>
                  </div>
                </div>
              )}
              <div className={styles._27}>
                <p className={styles._28}>Hoặc nhập mã thủ công</p>
                <div className={styles._51}>
                  <input
                    type="text"
                    value={credentialCode}
                    onChange={(e) => setCredentialCode(e.target.value)}
                    placeholder="Nhập mã văn bằng..."
                    className={styles._52}
                  />
                  <button onClick={handleVerifyByCode} disabled={isVerifying} className={styles._53}>
                    {isVerifying ? "..." : "Xác minh"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {mode === "pdf" && (
            <div className={styles._12}>
              <div className={styles._29}>
                <div className={styles._19}>
                  <svg className={styles._20} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className={styles._21}>Tải lên file PDF văn bằng để kiểm tra tính toàn vẹn</p>
                <label className={styles._30}>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handlePdfUpload}
                    className="hidden"
                  />
                  <span className={styles._31}>Chọn file PDF</span>
                </label>
              </div>
              {pdfFile && (
                <div className={styles._32}>
                  <p className={styles._33}>File: {pdfFile.name}</p>
                  <p className={styles._33}>Kích thước: {(pdfFile.size / 1024).toFixed(1)} KB</p>
                  <p className={styles._33}>SHA-256 Hash: <span className="font-mono text-xs">{pdfHash.slice(0, 32)}...</span></p>
                  {isVerifying && <p className={styles._34}>Đang xác minh...</p>}
                </div>
              )}
              {error && <p className={styles._16}>{error}</p>}
            </div>
          )}
        </div>
      </div>

      <div className={styles._35}>
        <h2 className={styles._36}>Cách xác minh văn bằng</h2>
        <div className={styles._37}>
          <div className={styles._38}>
            <div className={styles._39}>1</div>
            <p className={styles._40}>Nhập mã văn bằng có trên bằng hoặc email cấp bằng</p>
          </div>
          <div className={styles._38}>
            <div className={styles._39}>2</div>
            <p className={styles._40}>Hệ thống tra cứu dữ liệu trên blockchain và IPFS</p>
          </div>
          <div className={styles._38}>
            <div className={styles._39}>3</div>
            <p className={styles._40}>Xem kết quả xác thực và thông tin chi tiết văn bằng</p>
          </div>
        </div>
      </div>
    </div>
  );
}
