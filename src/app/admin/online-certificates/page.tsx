"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { certificateApi, type OnlineCertificateDto } from "@/features/certificates/services/certificate.api";
import Pagination from "@/components/common/Pagination";
import { useI18n } from "@/features/i18n/I18nContext";

const ITEMS_PER_PAGE = 10;

export default function AdminOnlineCertificatesPage() {
  const { t } = useI18n();
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
      setError(err.message || t("adminOnlineCertificates.loadError"));
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
              {t("adminOnlineCertificates.header.title")}
            </h1>
            <span style={{ background: "rgba(20, 125, 116, 0.1)", color: "#147D74", border: "1px solid rgba(20, 125, 116, 0.3)", padding: "2px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
              {`${certificates.length} ${t("adminOnlineCertificates.header.count")}`}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 m-0">
            {t("adminOnlineCertificates.header.descPrefix")}
            <code>online_certificates</code>
            {t("adminOnlineCertificates.header.descSuffix")}
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
            <span>{t("adminOnlineCertificates.header.createNew")}</span>
          </Link>
        </div>
      </div>

      {/* Stats Counter Bar */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 24 }}>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-2xs">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{t("adminOnlineCertificates.stats.total")}</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{certificates.length}</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-2xs">
          <div style={{ fontSize: 12, fontWeight: 700, color: "#147D74", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>{t("adminOnlineCertificates.stats.blockchain")}</div>
          <div style={{ fontSize: 26, fontWeight: 900, color: "#147D74" }}>
            {certificates.filter(c => !!c.tx_hash).length}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-2xs">
          <div className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider mb-1">{t("adminOnlineCertificates.stats.ipfs")}</div>
          <div className="text-2xl font-black text-sky-600 dark:text-sky-400">
            {certificates.filter(c => !!c.ipfs_cid).length}
          </div>
        </div>
      </div>

      {/* Search Filter Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl mb-5 flex gap-3 items-center flex-wrap shadow-2xs">
        <div style={{ position: "relative", flex: 1, minWidth: 260 }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("adminOnlineCertificates.searchPlaceholder")}
            className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none"
          />
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: 14 }}>🔍</span>
        </div>
      </div>

      {/* Main Data Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xs">
        {loading ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400 text-xs">
            ⏳ {t("adminOnlineCertificates.loading")}
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500 text-xs">
            ⚠️ {error}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-4xl mb-3">📁</div>
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">{t("adminOnlineCertificates.empty.title")}</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm mx-auto">
              {searchQuery ? t("adminOnlineCertificates.empty.withQuery") : t("adminOnlineCertificates.empty.withoutQuery")}
            </p>
          </div>
        ) : (
          <>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                    <th style={{ padding: "14px 16px" }}>{t("adminOnlineCertificates.table.codeAndName")}</th>
                    <th style={{ padding: "14px 16px" }}>{t("adminOnlineCertificates.table.studentRecipient")}</th>
                    <th style={{ padding: "14px 16px" }}>{t("adminOnlineCertificates.table.serialRegistry")}</th>
                    <th style={{ padding: "14px 16px" }}>{t("adminOnlineCertificates.table.issuedDate")}</th>
                    <th style={{ padding: "14px 16px", textAlign: "center" }}>{t("adminOnlineCertificates.table.actions")}</th>
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
                        <div className="text-slate-700 dark:text-slate-300"><strong className="text-slate-500 dark:text-slate-400">{t("adminOnlineCertificates.table.registryAbbr")}:</strong> {cert.registryNumber || "—"}</div>
                      </td>

                      <td className="p-4 text-xs text-slate-500 dark:text-slate-400">
                        {cert.issuedAt ? new Date(cert.issuedAt).toLocaleDateString("vi-VN") : "—"}
                      </td>

                      <td style={{ padding: "14px 16px", textAlign: "center" }}>
                        <button
                          onClick={() => setSelectedCert(cert)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[#147D74] dark:text-emerald-400 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold cursor-pointer transition-colors"
                        >
                          {t("adminOnlineCertificates.table.detail")}
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
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(2px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #e2e8f0", paddingBottom: 12 }}>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">{t("adminOnlineCertificates.modal.title")}</h3>
              <button
                onClick={() => setSelectedCert(null)}
                className="bg-transparent border-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="text-slate-500 dark:text-slate-400 text-[11px] font-bold">{t("adminOnlineCertificates.modal.certName")}</div>
                <div className="font-extrabold text-[#147D74] dark:text-emerald-400 text-base mt-0.5">{selectedCert.certificate_title}</div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="text-slate-500 dark:text-slate-400 text-[11px] font-bold">{t("adminOnlineCertificates.modal.studentName")}</div>
                  <div className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{selectedCert.student_fullName}</div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="text-slate-500 dark:text-slate-400 text-[11px] font-bold">{t("adminOnlineCertificates.modal.studentId")}</div>
                  <div className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{selectedCert.student_id || t("adminOnlineCertificates.modal.notLinked")}</div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="text-slate-500 dark:text-slate-400 text-[11px] font-bold">{t("adminOnlineCertificates.modal.serial")}</div>
                  <div className="font-extrabold text-slate-900 dark:text-white mt-0.5">{selectedCert.serialNumber || "—"}</div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="text-slate-500 dark:text-slate-400 text-[11px] font-bold">{t("adminOnlineCertificates.modal.registry")}</div>
                  <div className="font-extrabold text-slate-900 dark:text-white mt-0.5">{selectedCert.registryNumber || "—"}</div>
                </div>
              </div>

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
                  🔍 {t("adminOnlineCertificates.modal.openVerify")}
                </Link>
                <button
                  onClick={() => setSelectedCert(null)}
                  className="px-4.5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-xs cursor-pointer transition-colors"
                >
                  {t("adminOnlineCertificates.close")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
