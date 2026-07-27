"use client";

import styles from "./page.module.css";
import React, { useEffect, useState, useMemo } from "react";
import { certificateApi, type OnlineCertificateDto } from "@/features/certificates/services/certificate.api";
import Pagination from "@/components/common/Pagination";
import Button from "@/components/ui/Button";
import SearchInput from "@/components/common/SearchInput";
import EmptyState from "@/components/common/EmptyState";

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
    <div className={styles._container}>
      {/* Header Banner */}
      <div className={styles._headerRow}>
        <div>
          <div className={styles._headerTitleWrap}>
            <h1 className={styles._title}>
              Văn bằng số (Online Certificates)
            </h1>
            <span className={styles._countBadge}>
              {certificates.length} văn bằng
            </span>
          </div>
          <p className={styles._subtitle}>
            Danh sách văn bằng phát hành trực tiếp từ mẫu và nạp dữ liệu online, được lưu tại bảng <code>online_certificates</code>, Pinata IPFS &amp; Blockchain.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <Button href="/admin/templates/generator" variant="primary" size="sm">
            + Tạo văn bằng số mới
          </Button>
        </div>
      </div>

      {/* Stats Counter Bar */}
      <div className={styles._statsGrid}>
        <div className={styles._statCard}>
          <div className={styles._statLabel}>Tổng văn bằng số</div>
          <div className={styles._statValue}>{certificates.length}</div>
        </div>

        <div className={styles._statCard}>
          <div className={styles._statLabel} style={{ color: "#16a34a" }}>Đã ghi Blockchain</div>
          <div className={styles._statValueGreen}>
            {certificates.filter(c => !!c.tx_hash).length}
          </div>
        </div>

        <div className={styles._statCard}>
          <div className={styles._statLabel} style={{ color: "#0284c7" }}>Đã lưu IPFS JSON</div>
          <div className={styles._statValueBlue}>
            {certificates.filter(c => !!c.ipfs_cid).length}
          </div>
        </div>
      </div>

      {/* Control / Search Panel */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800/60 rounded-2xl p-4 mb-5">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Tìm theo tên văn bằng, sinh viên, số hiệu, số vào sổ, Tx Hash..."
        >
          <Button variant="secondary" size="sm" onClick={fetchData} disabled={loading}>Tải lại</Button>
        </SearchInput>
      </div>

      {/* Main Data Table */}
      <div className={styles._tableWrap}>
        {loading ? (
          <div className={styles._loading}>
            ⏳ Đang tải danh sách văn bằng số...
          </div>
        ) : error ? (
          <div className={styles._error}>
            ⚠️ {error}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="📭"
            title="Không tìm thấy văn bằng số nào"
            description={searchQuery ? "Thử tìm kiếm với từ khóa khác" : "Hãy tạo văn bằng số đầu tiên trong mục Tạo & Xuất bằng"}
          />
        ) : (
          <>
            <div className={styles._tableScroll}>
              <table className={styles._table}>
                <thead>
                  <tr className={styles._thead}>
                    <th className={styles._th}>Mã &amp; Tên văn bằng</th>
                    <th className={styles._th}>Sinh viên / Người nhận</th>
                    <th className={styles._th}>Số hiệu / Số sổ</th>
                    <th className={styles._th}>IPFS (JSON)</th>
                    <th className={styles._th}>Blockchain Hash</th>
                    <th className={styles._th}>Ngày cấp</th>
                    <th className={styles._thRight}>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((cert) => (
                    <tr key={cert.certificate_id} className={styles._tr}>
                      <td className={styles._td}>
                        <div className={styles._certTitle}>{cert.certificate_title}</div>
                        <div className={styles._certId}>ID: {cert.certificate_id}</div>
                      </td>

                      <td className={styles._td}>
                        <div className={styles._studentName}>{cert.student_fullName}</div>
                        {cert.student_id && <div className={styles._studentId}>SV: {cert.student_id}</div>}
                      </td>

                      <td className={styles._td}>
                        <div><strong className={styles._metaLabel}>SH:</strong> {cert.serialNumber || "—"}</div>
                        <div><strong className={styles._metaLabel}>Sổ:</strong> {cert.registryNumber || "—"}</div>
                      </td>

                      <td className={styles._td}>
                        {cert.ipfs_cid ? (
                          <a
                            href={`https://gateway.pinata.cloud/ipfs/${cert.ipfs_cid}`}
                            target="_blank"
                            rel="noreferrer"
                            className={styles._ipfsBadge}
                          >
                            🌐 IPFS Gateway
                          </a>
                        ) : (
                          <span className={styles._naText}>Chưa lưu</span>
                        )}
                      </td>

                      <td className={styles._td}>
                        {cert.tx_hash ? (
                          <span title={cert.tx_hash} className={styles._txBadge}>
                            ✓ {cert.tx_hash.slice(0, 10)}...{cert.tx_hash.slice(-6)}
                          </span>
                        ) : (
                          <span className={styles._naText}>Chưa ghi</span>
                        )}
                      </td>

                      <td className={styles._td}>
                        <span className={styles._dateText}>
                          {cert.issuedAt ? new Date(cert.issuedAt).toLocaleDateString("vi-VN") : "—"}
                        </span>
                      </td>

                      <td className={styles._td} style={{ textAlign: "right" }}>
                        <Button onClick={() => setSelectedCert(cert)} variant="ghost" size="sm">
                          Chi tiết
                        </Button>
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
        <div className={styles._overlay}>
          <div className={styles._modal}>
            <div className={styles._modalHeader}>
              <div>
                <span className={styles._modalBadge}>Văn bằng số</span>
                <h2 className={styles._modalTitle}>{selectedCert.certificate_title}</h2>
              </div>
              <button onClick={() => setSelectedCert(null)} className={styles._modalClose} type="button">✕</button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14, fontSize: 13 }}>
              <div className={styles._detailCard}>
                <div className={styles._detailLabel}>MÃ VĂN BẰNG (ID)</div>
                <code className={styles._detailValue}>{selectedCert.certificate_id}</code>
              </div>

              <div className={styles._detailGrid2}>
                <div className={styles._detailCard}>
                  <div className={styles._detailLabel}>SINH VIÊN</div>
                  <div className={styles._detailValueName}>{selectedCert.student_fullName}</div>
                </div>

                <div className={styles._detailCard}>
                  <div className={styles._detailLabel}>MÃ SINH VIÊN</div>
                  <div className={styles._detailValueName}>{selectedCert.student_id || "Không gắn thẻ"}</div>
                </div>
              </div>

              <div className={styles._detailGrid2}>
                <div className={styles._detailCard}>
                  <div className={styles._detailLabel}>SỐ HIỆU (SERIAL)</div>
                  <div className={styles._detailValueName}>{selectedCert.serialNumber || "—"}</div>
                </div>

                <div className={styles._detailCard}>
                  <div className={styles._detailLabel}>SỐ VÀO SỔ</div>
                  <div className={styles._detailValueName}>{selectedCert.registryNumber || "—"}</div>
                </div>
              </div>

              {selectedCert.ipfs_cid && (
                <div className={styles._ipfsCard}>
                  <div className={styles._ipfsCardLabel}>IPFS CID &amp; GATEWAY</div>
                  <div className={styles._ipfsCardCid}>{selectedCert.ipfs_cid}</div>
                  <a
                    href={`https://gateway.pinata.cloud/ipfs/${selectedCert.ipfs_cid}`}
                    target="_blank"
                    rel="noreferrer"
                    className={styles._ipfsCardLink}
                  >
                    Mở JSON gốc trên Pinata IPFS Gateway →
                  </a>
                </div>
              )}

              {selectedCert.tx_hash && (
                <div className={styles._txCard}>
                  <div className={styles._txCardLabel}>BLOCKCHAIN TRANSACTION HASH</div>
                  <div className={styles._txCardValue}>{selectedCert.tx_hash}</div>
                </div>
              )}

              <div className={styles._modalActions}>
                <Button href="/public/verify" variant="primary" size="sm">
                    Mở trang xác minh công khai
                </Button>
                <Button onClick={() => setSelectedCert(null)} variant="secondary" size="sm">
                  Đóng
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
