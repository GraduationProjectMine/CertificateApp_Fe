"use client";

import styles from "./page.module.css";
import React, { useEffect, useState, useMemo } from "react";
import { certificateApi, type OnlineCertificateDto } from "@/features/certificates/services/certificate.api";
import { templateApi } from "@/features/templates/services/api";
import type { CertificateTemplate } from "@/features/templates/types";
import { studentApi, type StudentDto } from "@/features/students/services/student.api";
import Pagination from "@/components/common/Pagination";
import Button from "@/components/ui/Button";
import SearchInput from "@/components/common/SearchInput";
import EmptyState from "@/components/common/EmptyState";
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

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
  const [students, setStudents] = useState<StudentDto[]>([]);
  const [createForm, setCreateForm] = useState({ template_id: "", student_id: "", student_fullName: "", certificate_title: "" });
  const [creating, setCreating] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await certificateApi.listOnline();
      setCertificates(data);
    } catch (err: any) {
      setError(err.message || t("admin.online_certificates.load_failed"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreate = async () => {
    setShowCreateModal(true);
    setCreateForm({ template_id: "", student_id: "", student_fullName: "", certificate_title: "" });
    try {
      const [list, studList] = await Promise.all([
        templateApi.list(),
        studentApi.list().catch(() => []),
      ]);
      setTemplates(list);
      setStudents(studList);
    } catch {}
  };

  const handleCreate = async () => {
    if (!createForm.template_id || !createForm.student_id) return;
    setCreating(true);
    try {
      await certificateApi.templateIssueSingle({
        template_id: createForm.template_id,
        student_id: createForm.student_id,
        student_fullName: createForm.student_fullName,
        certificate_title: createForm.certificate_title || t("admin.online_certificates.title"),
      });
      setShowCreateModal(false);
      await fetchData();
    } catch (err: any) {
      alert(err.message || t("admin.online_certificates.create_failed"));
    } finally {
      setCreating(false);
    }
  };

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

  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, itemsPerPage]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = useMemo(() => {
    return filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  }, [filtered, currentPage, itemsPerPage]);

  return (
    <div className={styles._container}>
      {/* Header Banner */}
      <div className={styles._headerRow}>
        <div>
          <div className={styles._headerTitleWrap}>
            <h1 className={styles._title}>
              {t("admin.online_certificates.title")}
            </h1>
            <span className={styles._countBadge}>
              {certificates.length} {t("admin.online_certificates.certificates")}
            </span>
          </div>
          <p className={styles._subtitle}>
            {t("admin.online_certificates.description")}
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <Button onClick={handleOpenCreate} variant="primary" size="sm">
            + {t("admin.online_certificates.create")}
          </Button>
        </div>
      </div>

      {/* Stats Counter Bar */}
      <div className={styles._statsGrid}>
        <div className={styles._statCard}>
          <div className={styles._statLabel}>{t("admin.online_certificates.total_online")}</div>
          <div className={styles._statValue}>{certificates.length}</div>
        </div>

        <div className={styles._statCard}>
          <div className={styles._statLabel} style={{ color: "#16a34a" }}>{t("admin.online_certificates.blockchain_recorded")}</div>
          <div className={styles._statValueGreen}>
            {certificates.filter(c => !!c.tx_hash).length}
          </div>
        </div>

        <div className={styles._statCard}>
          <div className={styles._statLabel} style={{ color: "#0284c7" }}>{t("admin.online_certificates.ipfs_saved")}</div>
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
          placeholder={t("admin.online_certificates.search_placeholder")}
        >
          <Button variant="secondary" size="sm" onClick={fetchData} disabled={loading}>{t("common.refresh")}</Button>
        </SearchInput>
      </div>

      {/* Main Data Table */}
      <div className={styles._tableWrap}>
        {loading ? (
          <div className={styles._loading}>
            {t("admin.online_certificates.loading_list")}
          </div>
        ) : error ? (
          <div className={styles._error}>
            {error}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="📭"
            title={t("admin.online_certificates.no_certificates")}
            description={searchQuery ? t("common.try_different_search") : t("admin.online_certificates.create_first")}
          />
        ) : (
          <>
            <div className={styles._tableScroll}>
              <table className={styles._table}>
                <thead>
                  <tr className={styles._thead}>
                    <th className={styles._th}>{t("admin.online_certificates.certificate_info")}</th>
                    <th className={styles._th}>{t("admin.online_certificates.student_recipient")}</th>
                    <th className={styles._th}>{t("admin.online_certificates.serial_registry")}</th>
                    <th className={styles._th}>IPFS (JSON)</th>
                    <th className={styles._th}>Blockchain Hash</th>
                    <th className={styles._th}>{t("admin.certificates.issue_date")}</th>
                    <th className={styles._thRight}>{t("common.actions")}</th>
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
                          <span className={styles._naText}>{t("admin.online_certificates.not_saved")}</span>
                        )}
                      </td>

                      <td className={styles._td}>
                        {cert.tx_hash ? (
                          <span title={cert.tx_hash} className={styles._txBadge}>
                            ✓ {cert.tx_hash.slice(0, 10)}...{cert.tx_hash.slice(-6)}
                          </span>
                        ) : (
                          <span className={styles._naText}>{t("admin.online_certificates.not_recorded")}</span>
                        )}
                      </td>

                      <td className={styles._td}>
                        <span className={styles._dateText}>
                          {cert.issuedAt ? new Date(cert.issuedAt).toLocaleDateString("vi-VN") : "—"}
                        </span>
                      </td>

                      <td className={styles._td} style={{ textAlign: "right" }}>
                        <Button onClick={() => setSelectedCert(cert)} variant="ghost" size="sm">
                          {t("common.detail")}
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
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={(size) => {
                setItemsPerPage(size);
                setCurrentPage(1);
              }}
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
                <span className={styles._modalBadge}>{t("admin.online_certificates.title")}</span>
                <h2 className={styles._modalTitle}>{selectedCert.certificate_title}</h2>
              </div>
              <button onClick={() => setSelectedCert(null)} className={styles._modalClose} type="button">✕</button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14, fontSize: 13 }}>
                <div className={styles._detailCard}>
                  <div className={styles._detailLabel}>{t("admin.online_certificates.cert_id_label")}</div>
                <code className={styles._detailValue}>{selectedCert.certificate_id}</code>
              </div>

              <div className={styles._detailGrid2}>
                <div className={styles._detailCard}>
                  <div className={styles._detailLabel}>{t("admin.online_certificates.student_label")}</div>
                  <div className={styles._detailValueName}>{selectedCert.student_fullName}</div>
                </div>

                <div className={styles._detailCard}>
                  <div className={styles._detailLabel}>{t("admin.online_certificates.student_id_label")}</div>
                  <div className={styles._detailValueName}>{selectedCert.student_id || t("admin.online_certificates.not_linked")}</div>
                </div>
              </div>

              <div className={styles._detailGrid2}>
                <div className={styles._detailCard}>
                  <div className={styles._detailLabel}>{t("admin.online_certificates.serial_label")}</div>
                  <div className={styles._detailValueName}>{selectedCert.serialNumber || "—"}</div>
                </div>

                <div className={styles._detailCard}>
                  <div className={styles._detailLabel}>{t("admin.online_certificates.registry_label")}</div>
                  <div className={styles._detailValueName}>{selectedCert.registryNumber || "—"}</div>
                </div>
              </div>

              {selectedCert.ipfs_cid && (
                <div className={styles._ipfsCard}>
                  <div className={styles._ipfsCardLabel}>{t("admin.online_certificates.ipfs_label")}</div>
                  <div className={styles._ipfsCardCid}>{selectedCert.ipfs_cid}</div>
                  <a
                    href={`https://gateway.pinata.cloud/ipfs/${selectedCert.ipfs_cid}`}
                    target="_blank"
                    rel="noreferrer"
                    className={styles._ipfsCardLink}
                  >
                    {t("admin.online_certificates.open_ipfs_gateway")}
                  </a>
                </div>
              )}

              {selectedCert.tx_hash && (
                <div className={styles._txCard}>
                  <div className={styles._txCardLabel}>{t("admin.online_certificates.tx_hash_label")}</div>
                  <div className={styles._txCardValue}>{selectedCert.tx_hash}</div>
                </div>
              )}

              <div className={styles._modalActions}>
                <Button href="/public/verify" variant="primary" size="sm">
                  {t("admin.online_certificates.open_verify_page")}
                </Button>
                <Button onClick={() => setSelectedCert(null)} variant="secondary" size="sm">
                  {t("common.close")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className={styles._overlay}>
          <div className={styles._modal}>
            <div className={styles._modalHeader}>
              <div>
                <span className={styles._modalBadge}>{t("common.add")}</span>
                <h2 className={styles._modalTitle}>{t("admin.online_certificates.create")}</h2>
              </div>
              <button onClick={() => setShowCreateModal(false)} className={styles._modalClose} type="button">✕</button>
            </div>

            <div className="flex flex-col gap-4" style={{ fontSize: 13 }}>
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">{t("admin.templates.title")} *</label>
                <select
                  value={createForm.template_id}
                  onChange={(e) => setCreateForm((f) => ({ ...f, template_id: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs text-gray-900 dark:text-white outline-none"
                >
                  <option value="">{t("admin.online_certificates.select_template")}</option>
                  {templates.map((tmpl) => (
                    <option key={tmpl.id} value={tmpl.id}>{tmpl.name} {tmpl.is_default ? `(${t("admin.online_certificates.default")})` : ""}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">{t("admin.certificates.student_code")} *</label>
                <div className="flex gap-2">
                  <select
                    value={createForm.student_id}
                    onChange={(e) => { const val = e.target.value; const st = students.find((s) => s.student_id === val); setCreateForm((f) => ({ ...f, student_id: val, student_fullName: st ? st.student_fullName : f.student_fullName })); }}
                    className="flex-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs text-gray-900 dark:text-white outline-none"
                  >
                    <option value="">{t("admin.online_certificates.select_student")}</option>
                    {students.map((st) => (
                      <option key={st.student_id} value={st.student_id}>{st.student_id} - {st.student_fullName}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={createForm.student_id}
                    onChange={(e) => setCreateForm((f) => ({ ...f, student_id: e.target.value }))}
                    placeholder={t("admin.online_certificates.or_enter_id")}
                    className="flex-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">{t("admin.online_certificates.student_fullname")}</label>
                <input
                  type="text"
                  value={createForm.student_fullName}
                  onChange={(e) => setCreateForm((f) => ({ ...f, student_fullName: e.target.value }))}
                  placeholder={t("admin.online_certificates.enter_fullname")}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">{t("admin.online_certificates.cert_title")}</label>
                <input
                  type="text"
                  value={createForm.certificate_title}
                  onChange={(e) => setCreateForm((f) => ({ ...f, certificate_title: e.target.value }))}
                  placeholder={t("admin.online_certificates.cert_title_placeholder")}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2 border-t border-gray-100 dark:border-gray-800">
                <Button onClick={() => setShowCreateModal(false)} variant="secondary" size="sm">{t("common.cancel")}</Button>
                <Button onClick={handleCreate} variant="primary" size="sm" disabled={creating || !createForm.template_id || !createForm.student_id}>
                  {creating ? t("common.creating") : t("admin.online_certificates.create_cert")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
