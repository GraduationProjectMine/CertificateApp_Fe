"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { certificateApi, type OnlineCertificateDto } from "@/features/certificates/services/certificate.api";
import Pagination from "@/components/common/Pagination";

const ITEMS_PER_PAGE = 10;

export default function AdminOnlineCertificatesPage() {
  const [certificates, setCertificates] = useState<OnlineCertificateDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCert, setSelectedCert] = useState<OnlineCertificateDto | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await certificateApi.listOnline();
      setCertificates(data);
    } catch (err: any) {
      setError(err.message || "Không thể tải danh sách văn bằng số");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return certificates;
    const q = searchQuery.toLowerCase().trim();
    return certificates.filter((c) =>
      (c.certificate_title && c.certificate_title.toLowerCase().includes(q)) ||
      (c.student_fullName && c.student_fullName.toLowerCase().includes(q)) ||
      (c.serialNumber && c.serialNumber.toLowerCase().includes(q)) ||
      (c.registryNumber && c.registryNumber.toLowerCase().includes(q)) ||
      (c.tx_hash && c.tx_hash.toLowerCase().includes(q)) ||
      (c.ipfs_cid && c.ipfs_cid.toLowerCase().includes(q))
    );
  }, [certificates, searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = useMemo(() => {
    return filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  return (
    <div style={{ padding: "24px 32px", maxWidth: 1400, margin: "0 auto" }}>
      {/* Header Banner */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, gap: 16, flexWrap: "wrap" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <h1 style={{ fontSize: 24, fontWeight: 900, color: "#0f172a", margin: 0, letterSpacing: "-0.02em" }}>
              Văn bằng số (Online Certificates)
            </h1>
            <span style={{ background: "#e8f5e9", color: "#09561eff", border: "1px solid #bfdbfe", padding: "2px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
              {certificates.length} văn bằng
            </span>
          </div>
          <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>
            Danh sách văn bằng phát hành trực tiếp từ mẫu và nạp dữ liệu online, được lưu tại bảng <code>online_certificates</code>, Pinata IPFS &amp; Blockchain.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <Link
            href="/admin/templates/generator"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "#10766Eff",
              color: "#fff",
              padding: "10px 18px",
              borderRadius: 12,
              fontWeight: 700,
              fontSize: 13,
              textDecoration: "none",
              boxShadow: "0 4px 12px rgba(16,185,129,0.25)",
              transition: "all 0.2s"
            }}
          >
            <span>+ Tạo văn bằng số mới</span>
          </Link>
        </div>
      </div>

      {/* Stats Counter Bar */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 24 }}>
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", padding: "16px 20px", borderRadius: 16, boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Tổng văn bằng số</div>
          <div style={{ fontSize: 26, fontWeight: 900, color: "#0f172a" }}>{certificates.length}</div>
        </div>

        <div style={{ background: "#fff", border: "1px solid #e2e8f0", padding: "16px 20px", borderRadius: 16, boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#16a34a", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Đã ghi Blockchain</div>
          <div style={{ fontSize: 26, fontWeight: 900, color: "#16a34a" }}>
            {certificates.filter(c => !!c.tx_hash).length}
          </div>
        </div>

        <div style={{ background: "#fff", border: "1px solid #e2e8f0", padding: "16px 20px", borderRadius: 16, boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#0284c7", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Đã lưu IPFS JSON</div>
          <div style={{ fontSize: 26, fontWeight: 900, color: "#0284c7" }}>
            {certificates.filter(c => !!c.ipfs_cid).length}
          </div>
        </div>
      </div>

      {/* Control / Search Panel */}
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", padding: 16, borderRadius: 16, marginBottom: 20, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 260 }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên văn bằng, sinh viên, số hiệu, số vào sổ, Tx Hash..."
            style={{
              width: "100%",
              padding: "10px 14px 10px 38px",
              borderRadius: 10,
              border: "1px solid #cbd5e1",
              fontSize: 13,
              outline: "none",
              background: "#f8fafc"
            }}
          />
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: 14 }}>🔍</span>
        </div>

        <button
          onClick={fetchData}
          style={{
            padding: "10px 16px",
            background: "#f1f5f9",
            color: "#334155",
            border: "1px solid #cbd5e1",
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer"
          }}
        >
          🔄 Tải lại
        </button>
      </div>

      {/* Main Data Table */}
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, overflow: "hidden", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: "center", color: "#64748b", fontSize: 14 }}>
            ⏳ Đang tải danh sách văn bằng số...
          </div>
        ) : error ? (
          <div style={{ padding: 32, textAlign: "center", color: "#dc2626", fontSize: 14 }}>
            ⚠️ {error}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 48, textAlign: "center", color: "#64748b" }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>📭</div>
            <div style={{ fontWeight: 700, fontSize: 15, color: "#334155" }}>Không tìm thấy văn bằng số nào</div>
            <p style={{ fontSize: 13, color: "#94a3b8", marginTop: 4 }}>
              {searchQuery ? "Thử tìm kiếm với từ khóa khác" : "Hãy tạo văn bằng số đầu tiên trong mục Tạo & Xuất bằng"}
            </p>
          </div>
        ) : (
          <>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", color: "#475569", fontWeight: 700 }}>
                    <th style={{ padding: "14px 16px" }}>Mã &amp; Tên văn bằng</th>
                    <th style={{ padding: "14px 16px" }}>Sinh viên / Người nhận</th>
                    <th style={{ padding: "14px 16px" }}>Số hiệu / Số sổ</th>
                    <th style={{ padding: "14px 16px" }}>IPFS (JSON)</th>
                    <th style={{ padding: "14px 16px" }}>Blockchain Hash</th>
                    <th style={{ padding: "14px 16px" }}>Ngày cấp</th>
                    <th style={{ padding: "14px 16px", textAlign: "right" }}>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((cert) => (
                    <tr key={cert.certificate_id} style={{ borderBottom: "1px solid #f1f5f9", transition: "background 0.15s" }}>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ fontWeight: 700, color: "#0f172a" }}>{cert.certificate_title}</div>
                        <div style={{ fontSize: 11, color: "#94a3b8", fontFamily: "monospace", marginTop: 2 }}>ID: {cert.certificate_id}</div>
                      </td>

                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ fontWeight: 700, color: "#334155" }}>{cert.student_fullName}</div>
                        {cert.student_id && <div style={{ fontSize: 11, color: "#64748b" }}>SV: {cert.student_id}</div>}
                      </td>

                      <td style={{ padding: "14px 16px" }}>
                        <div><strong style={{ color: "#475569" }}>SH:</strong> {cert.serialNumber || "—"}</div>
                        <div><strong style={{ color: "#475569" }}>Sổ:</strong> {cert.registryNumber || "—"}</div>
                      </td>

                      <td style={{ padding: "14px 16px" }}>
                        {cert.ipfs_cid ? (
                          <a
                            href={`https://gateway.pinata.cloud/ipfs/${cert.ipfs_cid}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                              background: "#f0f9ff",
                              color: "#0284c7",
                              border: "1px solid #bae6fd",
                              padding: "3px 8px",
                              borderRadius: 6,
                              fontSize: 11,
                              fontWeight: 700,
                              textDecoration: "none"
                            }}
                          >
                            🌐 IPFS Gateway
                          </a>
                        ) : (
                          <span style={{ color: "#cbd5e1", fontSize: 11 }}>Chưa lưu</span>
                        )}
                      </td>

                      <td style={{ padding: "14px 16px" }}>
                        {cert.tx_hash ? (
                          <span
                            title={cert.tx_hash}
                            style={{
                              display: "inline-block",
                              background: "#f0fdf4",
                              color: "#16a34a",
                              border: "1px solid #bbf7d0",
                              padding: "3px 8px",
                              borderRadius: 6,
                              fontSize: 11,
                              fontWeight: 700,
                              fontFamily: "monospace"
                            }}
                          >
                            ✓ {cert.tx_hash.slice(0, 10)}...{cert.tx_hash.slice(-6)}
                          </span>
                        ) : (
                          <span style={{ color: "#cbd5e1", fontSize: 11 }}>Chưa ghi</span>
                        )}
                      </td>

                      <td style={{ padding: "14px 16px", color: "#64748b", fontSize: 12 }}>
                        {cert.issuedAt ? new Date(cert.issuedAt).toLocaleDateString("vi-VN") : "—"}
                      </td>

                      <td style={{ padding: "14px 16px", textAlign: "right" }}>
                        <button
                          onClick={() => setSelectedCert(cert)}
                          style={{
                            background: "#f1f5f9",
                            color: "#2563eb",
                            border: "1px solid #cbd5e1",
                            padding: "6px 12px",
                            borderRadius: 8,
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: "pointer"
                          }}
                        >
                          Chi tiết
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filtered.length}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>

      {/* Detail Modal */}
      {selectedCert && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 16 }}>
          <div style={{ background: "#fff", borderRadius: 20, maxWidth: 600, width: "100%", maxHeight: "90vh", overflowY: "auto", padding: 24, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, borderBottom: "1px solid #f1f5f9", paddingBottom: 12 }}>
              <div>
                <span style={{ background: "#eff6ff", color: "#2563eb", fontSize: 11, fontWeight: 800, padding: "2px 8px", borderRadius: 4, textTransform: "uppercase" }}>Văn bằng số</span>
                <h2 style={{ fontSize: 18, fontWeight: 900, color: "#0f172a", margin: "4px 0 0 0" }}>{selectedCert.certificate_title}</h2>
              </div>
              <button onClick={() => setSelectedCert(null)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#94a3b8" }}>✕</button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14, fontSize: 13 }}>
              <div style={{ background: "#f8fafc", padding: 14, borderRadius: 12, border: "1px solid #e2e8f0" }}>
                <div style={{ color: "#64748b", fontSize: 11, fontWeight: 700, marginBottom: 2 }}>MÃ VĂN BẰNG (ID)</div>
                <code style={{ fontSize: 12, color: "#0f172a", wordBreak: "break-all" }}>{selectedCert.certificate_id}</code>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={{ background: "#f8fafc", padding: 12, borderRadius: 10, border: "1px solid #e2e8f0" }}>
                  <div style={{ color: "#64748b", fontSize: 11, fontWeight: 700 }}>SINH VIÊN</div>
                  <div style={{ fontWeight: 800, color: "#0f172a", marginTop: 2 }}>{selectedCert.student_fullName}</div>
                </div>

                <div style={{ background: "#f8fafc", padding: 12, borderRadius: 10, border: "1px solid #e2e8f0" }}>
                  <div style={{ color: "#64748b", fontSize: 11, fontWeight: 700 }}>MÃ SINH VIÊN</div>
                  <div style={{ fontWeight: 700, color: "#334155", marginTop: 2 }}>{selectedCert.student_id || "Không gắn thẻ"}</div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={{ background: "#f8fafc", padding: 12, borderRadius: 10, border: "1px solid #e2e8f0" }}>
                  <div style={{ color: "#64748b", fontSize: 11, fontWeight: 700 }}>SỐ HIỆU (SERIAL)</div>
                  <div style={{ fontWeight: 800, color: "#0f172a", marginTop: 2 }}>{selectedCert.serialNumber || "—"}</div>
                </div>

                <div style={{ background: "#f8fafc", padding: 12, borderRadius: 10, border: "1px solid #e2e8f0" }}>
                  <div style={{ color: "#64748b", fontSize: 11, fontWeight: 700 }}>SỐ VÀO SỔ</div>
                  <div style={{ fontWeight: 800, color: "#0f172a", marginTop: 2 }}>{selectedCert.registryNumber || "—"}</div>
                </div>
              </div>

              {selectedCert.ipfs_cid && (
                <div style={{ background: "#f0f9ff", padding: 12, borderRadius: 10, border: "1px solid #bae6fd" }}>
                  <div style={{ color: "#0369a1", fontSize: 11, fontWeight: 700 }}>IPFS CID &amp; GATEWAY</div>
                  <div style={{ fontSize: 11, fontFamily: "monospace", color: "#0c4a6e", wordBreak: "break-all", margin: "4px 0 8px 0" }}>{selectedCert.ipfs_cid}</div>
                  <a
                    href={`https://gateway.pinata.cloud/ipfs/${selectedCert.ipfs_cid}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ fontSize: 12, fontWeight: 800, color: "#0284c7", textDecoration: "none" }}
                  >
                    🔗 Mở JSON gốc trên Pinata IPFS Gateway →
                  </a>
                </div>
              )}

              {selectedCert.tx_hash && (
                <div style={{ background: "#f0fdf4", padding: 12, borderRadius: 10, border: "1px solid #bbf7d0" }}>
                  <div style={{ color: "#15803d", fontSize: 11, fontWeight: 700 }}>BLOCKCHAIN TRANSACTION HASH</div>
                  <div style={{ fontSize: 11, fontFamily: "monospace", color: "#14532d", wordBreak: "break-all", marginTop: 4 }}>{selectedCert.tx_hash}</div>
                </div>
              )}

              <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                <Link
                  href="/public/verify"
                  target="_blank"
                  style={{
                    flex: 1,
                    textAlign: "center",
                    background: "#2563eb",
                    color: "#fff",
                    padding: "10px",
                    borderRadius: 10,
                    fontWeight: 700,
                    fontSize: 13,
                    textDecoration: "none"
                  }}
                >
                  🔍 Mở trang xác minh công khai
                </Link>
                <button
                  onClick={() => setSelectedCert(null)}
                  style={{
                    background: "#f1f5f9",
                    color: "#334155",
                    border: "1px solid #cbd5e1",
                    padding: "10px 18px",
                    borderRadius: 10,
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: "pointer"
                  }}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
