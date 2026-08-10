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
            <h1 className="text-2xl font-black text-slate-900 dark:text-white m-0 tracking-tight">
              Văn bằng số
            </h1>
            <span style={{ background: "rgba(20, 125, 116, 0.1)", color: "#147D74", border: "1px solid rgba(20, 125, 116, 0.3)", padding: "2px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
              {certificates.length} văn bằng
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 m-0">
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
              background: "#147D74",
              color: "#fff",
              padding: "10px 18px",
              borderRadius: 12,
              fontWeight: 700,
              fontSize: 13,
              textDecoration: "none",
              boxShadow: "0 4px 12px rgba(20,125,116,0.25)",
              transition: "all 0.2s"
            }}
          >
            <span>+ Tạo văn bằng số mới</span>
          </Link>
        </div>
      </div>

      {/* Stats Counter Bar */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 24 }}>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-2xs">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Tổng văn bằng số</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{certificates.length}</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-2xs">
          <div style={{ fontSize: 12, fontWeight: 700, color: "#147D74", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Đã ghi Blockchain</div>
          <div style={{ fontSize: 26, fontWeight: 900, color: "#147D74" }}>
            {certificates.filter(c => !!c.tx_hash).length}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-2xs">
          <div className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider mb-1">Đã lưu IPFS JSON</div>
          <div className="text-2xl font-black text-sky-600 dark:text-sky-400">
            {certificates.filter(c => !!c.ipfs_cid).length}
          </div>
        </div>
      </div>

      {/* Control / Search Panel */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl mb-5 flex gap-3 items-center flex-wrap shadow-2xs">
        <div style={{ position: "relative", flex: 1, minWidth: 260 }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên văn bằng, sinh viên, số hiệu, số vào sổ, Tx Hash..."
            className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none"
          />
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: 14 }}>🔍</span>
        </div>

        <button
          onClick={fetchData}
          className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold cursor-pointer transition-colors"
        >
          🔄 Tải lại
        </button>
      </div>

      {/* Main Data Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xs">
        {loading ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400 text-xs">
            ⏳ Đang tải danh sách văn bằng số...
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500 text-xs">
            ⚠️ {error}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400">
            <div className="text-3xl mb-2">📭</div>
            <div className="font-bold text-sm text-slate-800 dark:text-slate-200">Không tìm thấy văn bằng số nào</div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              {searchQuery ? "Thử tìm kiếm với từ khóa khác" : "Hãy tạo văn bằng số đầu tiên trong mục Tạo & Xuất bằng"}
            </p>
          </div>
        ) : (
          <>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                    <th style={{ padding: "14px 16px" }}>Mã &amp; Tên văn bằng</th>
                    <th style={{ padding: "14px 16px" }}>Sinh viên / Người nhận</th>
                    <th style={{ padding: "14px 16px" }}>Số hiệu / Số sổ</th>
                    <th style={{ padding: "14px 16px" }}>IPFS (JSON)</th>
                    <th style={{ padding: "14px 16px" }}>Blockchain Hash</th>
                    <th style={{ padding: "14px 16px" }}>Ngày cấp</th>
                    <th style={{ padding: "14px 16px", textAlign: "center" }}>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((cert) => (
                    <tr key={cert.certificate_id} className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td style={{ padding: "14px 16px" }}>
                        <div className="font-bold text-slate-900 dark:text-white">{cert.certificate_title}</div>
                        <div className="text-[11px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">ID: {cert.certificate_id}</div>
                      </td>

                      <td style={{ padding: "14px 16px" }}>
                        <div className="font-bold text-slate-800 dark:text-slate-200">{cert.student_fullName}</div>
                        {cert.student_id && <div className="text-[11px] text-slate-500 dark:text-slate-400">SV: {cert.student_id}</div>}
                      </td>

                      <td style={{ padding: "14px 16px" }}>
                        <div className="text-slate-700 dark:text-slate-300"><strong className="text-slate-500 dark:text-slate-400">SH:</strong> {cert.serialNumber || "—"}</div>
                        <div className="text-slate-700 dark:text-slate-300"><strong className="text-slate-500 dark:text-slate-400">Sổ:</strong> {cert.registryNumber || "—"}</div>
                      </td>

                      <td style={{ padding: "14px 16px" }}>
                        {cert.ipfs_cid ? (
                          <a
                            href={`https://gateway.pinata.cloud/ipfs/${cert.ipfs_cid}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 bg-sky-50 dark:bg-sky-950/30 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800 px-2 py-1 rounded-md text-[11px] font-bold no-underline"
                          >
                            🌐 IPFS Gateway
                          </a>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-500 text-[11px]">Chưa lưu</span>
                        )}
                      </td>

                      <td style={{ padding: "14px 16px" }}>
                        {cert.tx_hash ? (
                          <span
                            title={cert.tx_hash}
                            className="inline-block bg-emerald-50 dark:bg-emerald-950/30 text-[#147D74] dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 px-2 py-1 rounded-md text-[11px] font-bold font-mono"
                          >
                            ✓ {cert.tx_hash.slice(0, 10)}...{cert.tx_hash.slice(-6)}
                          </span>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-500 text-[11px]">Chưa ghi</span>
                        )}
                      </td>

                      <td className="p-4 text-xs text-slate-500 dark:text-slate-400">
                        {cert.issuedAt ? new Date(cert.issuedAt).toLocaleDateString("vi-VN") : "—"}
                      </td>

                      <td style={{ padding: "14px 16px", textAlign: "center" }}>
                        <button
                          onClick={() => setSelectedCert(cert)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[#147D74] dark:text-emerald-400 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold cursor-pointer transition-colors"
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
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
            <div className="flex justify-between items-start mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span style={{ background: "rgba(20, 125, 116, 0.1)", color: "#147D74", fontSize: 11, fontWeight: 800, padding: "2px 8px", borderRadius: 4, textTransform: "uppercase" }}>Văn bằng số</span>
                <h2 className="text-lg font-black text-slate-900 dark:text-white mt-1 m-0">{selectedCert.certificate_title}</h2>
              </div>
              <button onClick={() => setSelectedCert(null)} className="bg-none border-none text-xl cursor-pointer text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300">✕</button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14, fontSize: 13 }}>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="text-slate-500 dark:text-slate-400 text-[11px] font-bold mb-0.5">MÃ VĂN BẰNG (ID)</div>
                <code className="text-xs text-slate-900 dark:text-slate-100 break-all">{selectedCert.certificate_id}</code>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="text-slate-500 dark:text-slate-400 text-[11px] font-bold">SINH VIÊN</div>
                  <div className="font-extrabold text-slate-900 dark:text-white mt-0.5">{selectedCert.student_fullName}</div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="text-slate-500 dark:text-slate-400 text-[11px] font-bold">MÃ SINH VIÊN</div>
                  <div className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{selectedCert.student_id || "Không gắn thẻ"}</div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="text-slate-500 dark:text-slate-400 text-[11px] font-bold">SỐ HIỆU (SERIAL)</div>
                  <div className="font-extrabold text-slate-900 dark:text-white mt-0.5">{selectedCert.serialNumber || "—"}</div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="text-slate-500 dark:text-slate-400 text-[11px] font-bold">SỐ VÀO SỔ</div>
                  <div className="font-extrabold text-slate-900 dark:text-white mt-0.5">{selectedCert.registryNumber || "—"}</div>
                </div>
              </div>

              {selectedCert.ipfs_cid && (
                <div className="bg-sky-50 dark:bg-sky-950/30 p-3 rounded-xl border border-sky-200 dark:border-sky-800">
                  <div className="text-sky-700 dark:text-sky-300 text-[11px] font-bold">IPFS CID &amp; GATEWAY</div>
                  <div className="text-[11px] font-mono text-sky-900 dark:text-sky-200 break-all my-1.5">{selectedCert.ipfs_cid}</div>
                  <a
                    href={`https://gateway.pinata.cloud/ipfs/${selectedCert.ipfs_cid}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-extrabold text-sky-600 dark:text-sky-400 no-underline"
                  >
                    🔗 Mở JSON gốc trên Pinata IPFS Gateway →
                  </a>
                </div>
              )}

              {selectedCert.tx_hash && (
                <div className="bg-emerald-50 dark:bg-emerald-950/30 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800">
                  <div className="text-[#147D74] dark:text-emerald-300 text-[11px] font-bold">BLOCKCHAIN TRANSACTION HASH</div>
                  <div className="text-[11px] font-mono text-emerald-900 dark:text-emerald-200 break-all mt-1">{selectedCert.tx_hash}</div>
                </div>
              )}

              <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                <Link
                  href="/public/verify"
                  target="_blank"
                  style={{
                    flex: 1,
                    textAlign: "center",
                    background: "#147D74",
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
                  className="px-4.5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-xs cursor-pointer transition-colors"
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
