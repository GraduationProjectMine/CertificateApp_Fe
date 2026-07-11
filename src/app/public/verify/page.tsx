"use client";
import React, { useState, useRef } from "react";
import Link from "next/link";
import styles from "./page.module.css";
import VerificationResult from "@/components/credential/VerificationResult";
import type { VerificationData } from "@/components/credential/VerificationResult";
import { certificateApi } from "@/features/certificates/services/certificate.api";

type VerifyMode = "code" | "qrcode" | "pdf";

export default function VerifyPublicPage() {
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

    // Fallback stub for PDF check
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
    { key: "code", label: "Nhập mã số hiệu", icon: "M10 21h7a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v11m0 5l4.879-4.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242z" },
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
                <label className={styles._14}>Số hiệu (Số hiệu văn bằng) *</label>
                <input
                  type="text"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  placeholder="Nhập số hiệu văn bằng..."
                  className={styles._15}
                />
              </div>
              <div className={styles._13}>
                <label className={styles._14}>Số vào sổ cấp bằng *</label>
                <input
                  type="text"
                  value={registryNumber}
                  onChange={(e) => setRegistryNumber(e.target.value)}
                  placeholder="Nhập số vào sổ..."
                  className={styles._15}
                />
              </div>
              {error && <p className={styles._16}>{error}</p>}
              <button
                onClick={() => handleVerify(serialNumber, registryNumber)}
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
                <p className={styles._28}>Hoặc nhập mã số hiệu & số vào sổ để xác minh</p>
                <div className="flex flex-col gap-2 mt-2">
                  <input
                    type="text"
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    placeholder="Nhập số hiệu..."
                    className={styles._15}
                  />
                  <input
                    type="text"
                    value={registryNumber}
                    onChange={(e) => setRegistryNumber(e.target.value)}
                    placeholder="Nhập số vào sổ..."
                    className={styles._15}
                  />
                  <button onClick={() => handleVerify(serialNumber, registryNumber)} disabled={isVerifying} className={styles._17}>
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
            <p className={styles._40}>Nhập số hiệu và số vào sổ cấp bằng tương ứng</p>
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
