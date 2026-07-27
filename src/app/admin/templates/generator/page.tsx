"use client";

import styles from "./page.module.css";
import React, { useEffect, useState, useRef, useMemo } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import JSZip from "jszip";
import { templateApi } from "@/features/templates/services/api";
import type { CertificateTemplate, TemplateField, DesignData } from "@/features/templates/types";
import { certificateApi, type CreateCertificatePayload } from "@/features/certificates/services/certificate.api";
import { studentApi, type StudentDto } from "@/features/students/services/student.api";
import { QRCodeSVG } from "qrcode.react";
import Button from "@/components/ui/Button";

const ALL_BINDING_LABELS: Record<string, string> = {
  student_id: "Mã sinh viên",
  student_fullName: "Họ tên sinh viên",
  certificate_title: "Tên văn bằng",
  organization_name: "Tên tổ chức",
  organization_logo: "Logo tổ chức",
  dob: "Ngày sinh",
  placeOfBirth: "Nơi sinh",
  gender: "Giới tính",
  ethnicity: "Dân tộc",
  schoolName: "Tên trường / Đơn vị",
  examCohort: "Khóa học",
  examBoard: "Hội đồng thi",
  issueLocation: "Nơi cấp",
  issueDate: "Ngày cấp",
  serialNumber: "Số hiệu",
  registryNumber: "Số vào sổ",
  verification_url: "URL xác minh (QR)",
};

const DEFAULT_DESIGN: DesignData = {
  page: { width: 800, height: 600, bgColor: "#ffffff" },
  fields: [
    { id: "fld_1", type: "text", x: 200, y: 180, w: 400, h: 30, font: "serif", size: 14, color: "#c9a84c", align: "center", text: "CHỨNG NHẬN" },
    { id: "fld_2", type: "text", x: 150, y: 280, w: 500, h: 60, font: "serif", size: 36, color: "#1a1a1a", align: "center", dynamic: true, binding: "student_fullName", bold: true },
    { id: "fld_3", type: "text", x: 200, y: 370, w: 400, h: 20, font: "sans-serif", size: 12, color: "#555555", align: "center", dynamic: true, binding: "dob", label: "Ngày sinh:" },
    { id: "fld_4", type: "text", x: 50, y: 520, w: 300, h: 20, font: "sans-serif", size: 10, color: "#999999", align: "left", dynamic: true, binding: "serialNumber", label: "Số hiệu:" },
    { id: "fld_5", type: "qr", x: 680, y: 460, w: 70, h: 70, dynamic: true, binding: "verification_url" },
  ],
  decorations: [{ type: "border", style: "double", color: "#c9a84c", width: 4 }],
};

export default function CertificateGeneratorPage() {
  const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [selectedTemplate, setSelectedTemplate] = useState<CertificateTemplate | null>(null);
  const [students, setStudents] = useState<StudentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [zoom, setZoom] = useState(0.75);

  // Active Data Record & Imported File state
  const [records, setRecords] = useState<Array<Record<string, string>>>([{}]);
  const [activeRowIndex, setActiveRowIndex] = useState<number>(0);
  const [importedFileName, setImportedFileName] = useState<string>("");

  const [importing, setImporting] = useState(false);
  const [exportingSingle, setExportingSingle] = useState(false);
  const [exportingBatch, setExportingBatch] = useState(false);
  const [batchProgress, setBatchProgress] = useState<string>("");

  // Direct Issuing state (IPFS JSON + Blockchain)
  const [issuingSingle, setIssuingSingle] = useState(false);
  const [issuingBatch, setIssuingBatch] = useState(false);
  const [issueResult, setIssueResult] = useState<{ type: "SINGLE" | "BATCH"; data: any } | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initData = async () => {
      try {
        const [list, studList] = await Promise.all([
          templateApi.list(),
          studentApi.list().catch(() => []),
        ]);
        setTemplates(list);
        setStudents(studList);
      } catch (err: any) {
        console.error("Failed to load initial data", err);
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, []);

  const handleSelectTemplate = (id: string) => {
    setSelectedTemplateId(id);
    if (!id) {
      setSelectedTemplate(null);
      return;
    }
    const found = templates.find((t) => t.id === id) || null;
    setSelectedTemplate(found);
  };

  const handleCancel = () => {
    setSelectedTemplateId("");
    setSelectedTemplate(null);
    setRecords([{}]);
    setActiveRowIndex(0);
    setImportedFileName("");
  };

  // Active design configuration
  const activeDesign: DesignData = useMemo(() => {
    if (selectedTemplate && selectedTemplate.design_data) {
      return selectedTemplate.design_data as DesignData;
    }
    return DEFAULT_DESIGN;
  }, [selectedTemplate]);

  // Dynamically extract bound fields present in the selected template + student_id
  const boundFields = useMemo(() => {
    const fields = activeDesign.fields || [];
    const bound = fields.filter((f) => f.dynamic && f.binding);
    const uniqueKeys = Array.from(new Set(bound.map((f) => f.binding!)));
    if (!uniqueKeys.includes("student_id")) {
      uniqueKeys.unshift("student_id");
    }
    return uniqueKeys.map((key) => ({
      key,
      label: ALL_BINDING_LABELS[key] || key,
    }));
  }, [activeDesign]);

  const activeRecord = useMemo(() => {
    return records[activeRowIndex] || {};
  }, [records, activeRowIndex]);

  const handleUpdateActiveField = (key: string, val: string) => {
    setRecords((prev) => {
      const next = [...prev];
      if (!next[activeRowIndex]) next[activeRowIndex] = {};
      next[activeRowIndex] = { ...next[activeRowIndex], [key]: val };
      return next;
    });
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const res = await templateApi.importDataFile(file);
      if (!res.rows || res.rows.length === 0) {
        alert("File không chứa dữ liệu hợp lệ.");
        return;
      }
      setImportedFileName(res.fileName);
      setRecords(res.rows.map((r) => r.record));
      setActiveRowIndex(0);
      alert(`Đã tải thành công ${res.totalRows} bản ghi từ file ${res.fileName}`);
    } catch (err: any) {
      alert(err.message || "Không thể nạp dữ liệu từ file");
    } finally {
      setImporting(false);
      e.target.value = "";
    }
  };

  const exportSinglePdf = async () => {
    if (!canvasRef.current) return;
    setExportingSingle(true);
    try {
      const canvas = await html2canvas(canvasRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: activeDesign.page.bgColor || "#ffffff",
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const isLandscape = activeDesign.page.width >= activeDesign.page.height;
      const pdf = new jsPDF({
        orientation: isLandscape ? "landscape" : "portrait",
        unit: "px",
        format: [activeDesign.page.width, activeDesign.page.height],
      });

      pdf.addImage(imgData, "PNG", 0, 0, activeDesign.page.width, activeDesign.page.height);
      const studentName = activeRecord.student_fullName || activeRecord.student_id || selectedTemplate?.name || "van_bang";
      const fileName = `${studentName.replace(/\s+/g, "_")}.pdf`;
      pdf.save(fileName);
    } catch (err: any) {
      alert(err.message || "Xuất PDF thất bại");
    } finally {
      setExportingSingle(false);
    }
  };

  const exportBatchZip = async () => {
    if (!canvasRef.current || records.length === 0) return;
    setExportingBatch(true);
    setBatchProgress(`0 / ${records.length}`);
    try {
      const zip = new JSZip();
      const folder = zip.folder("Certificates") || zip;

      const isLandscape = activeDesign.page.width >= activeDesign.page.height;

      for (let i = 0; i < records.length; i++) {
        setBatchProgress(`${i + 1} / ${records.length}`);
        setActiveRowIndex(i);
        await new Promise((r) => setTimeout(r, 100));

        const canvas = await html2canvas(canvasRef.current, {
          scale: 2.5,
          useCORS: true,
          backgroundColor: activeDesign.page.bgColor || "#ffffff",
          logging: false,
        });

        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF({
          orientation: isLandscape ? "landscape" : "portrait",
          unit: "px",
          format: [activeDesign.page.width, activeDesign.page.height],
        });

        pdf.addImage(imgData, "PNG", 0, 0, activeDesign.page.width, activeDesign.page.height);
        const pdfBlob = pdf.output("blob");

        const row = records[i];
        const studentName = (row.student_fullName || row.student_id || `cert_${i + 1}`).replace(/[/\\?%*:|"<>]/g, "_");
        folder.file(`${i + 1}_${studentName}.pdf`, pdfBlob);
      }

      setBatchProgress("Tạo file ZIP...");
      const content = await zip.generateAsync({ type: "blob" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(content);
      link.download = `certificates_batch_${Date.now()}.zip`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (err: any) {
      alert(err.message || "Tạo ZIP thất bại");
    } finally {
      setExportingBatch(false);
      setBatchProgress("");
    }
  };

  // Issue single certificate with JSON file pinned to IPFS & registered on-chain
  const handleIssueSingle = async () => {
    if (!selectedTemplate) return;
    setIssuingSingle(true);
    try {
      const payload: CreateCertificatePayload = {
        student_id: activeRecord.student_id || `SV_${Date.now()}`,
        student_fullName: activeRecord.student_fullName,
        template_id: selectedTemplate.id,
        certificate_title: activeRecord.certificate_title || selectedTemplate.name || "BẰNG TỐT NGHIỆP",
        dob: activeRecord.dob,
        placeOfBirth: activeRecord.placeOfBirth,
        gender: activeRecord.gender,
        ethnicity: activeRecord.ethnicity,
        schoolName: activeRecord.schoolName,
        examCohort: activeRecord.examCohort,
        examBoard: activeRecord.examBoard,
        issueLocation: activeRecord.issueLocation,
        issueDate: activeRecord.issueDate,
        serialNumber: activeRecord.serialNumber,
        registryNumber: activeRecord.registryNumber,
      };

      const cert = await certificateApi.templateIssueSingle(payload);
      const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
      const certId = cert.certificate_id || cert.serialNumber;
      if (certId) {
        handleUpdateActiveField("verification_url", `${baseUrl}/public/certificate/${certId}`);
      }
      setIssueResult({
        type: "SINGLE",
        data: cert,
      });
    } catch (err: any) {
      alert(err.message || "Cấp phát văn bằng thất bại");
    } finally {
      setIssuingSingle(false);
    }
  };

  // Issue batch certificates with JSON files pinned to IPFS & registered on-chain
  const handleIssueBatch = async () => {
    if (!selectedTemplate || records.length === 0) return;
    if (!confirm(`Bạn có chắc chắn muốn phát hành ${records.length} văn bằng lên IPFS JSON & Blockchain?`)) return;

    setIssuingBatch(true);
    try {
      const rows: CreateCertificatePayload[] = records.map((r, i) => ({
        student_id: r.student_id || `SV_${Date.now()}_${i + 1}`,
        student_fullName: r.student_fullName,
        template_id: selectedTemplate.id,
        certificate_title: r.certificate_title || selectedTemplate.name || "BẰNG TỐT NGHIỆP",
        dob: r.dob,
        placeOfBirth: r.placeOfBirth,
        gender: r.gender,
        ethnicity: r.ethnicity,
        schoolName: r.schoolName,
        examCohort: r.examCohort,
        examBoard: r.examBoard,
        issueLocation: r.issueLocation,
        issueDate: r.issueDate,
        serialNumber: r.serialNumber,
        registryNumber: r.registryNumber,
      }));

      const batchRes = await certificateApi.templateIssueBatch({
        rows,
        template_id: selectedTemplate.id,
      });

      if (batchRes && Array.isArray(batchRes.results)) {
        const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
        setRecords((prev) =>
          prev.map((rec, idx) => {
            const item = batchRes.results[idx];
            if (item && item.certificate_id) {
              return { ...rec, verification_url: `${baseUrl}/public/certificate/${item.certificate_id}` };
            }
            return rec;
          })
        );
      }

      setIssueResult({
        type: "BATCH",
        data: batchRes,
      });
    } catch (err: any) {
      alert(err.message || "Cấp phát lô thất bại");
    } finally {
      setIssuingBatch(false);
    }
  };

  const renderFieldContent = (field: TemplateField) => {
    const isLine = field.type === "line";
    const isRect = field.type === "rect";
    const styles: React.CSSProperties = {
      position: "absolute",
      left: field.x,
      top: field.y,
      width: field.w,
      height: field.h,
      fontSize: field.size || 14,
      fontFamily: field.font || "sans-serif",
      color: field.color || "#333",
      textAlign: field.align || "left",
      fontWeight: field.bold ? "bold" : "normal",
      fontStyle: field.italic ? "italic" : "normal",
      border: "1px dashed transparent",
      borderRadius: isLine || isRect ? 0 : 4,
      padding: isLine || isRect ? 0 : "2px 4px",
      display: "flex",
      alignItems: "center",
      justifyContent: field.align === "center" ? "center" : field.align === "right" ? "flex-end" : "flex-start",
      overflow: "hidden",
      boxSizing: "border-box",
      background: field.type === "qr" ? "#ffffff" : "transparent",
    };

    const content = (() => {
      if (field.type === "qr") {
        const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
        const rawVal = field.binding && activeRecord[field.binding] ? activeRecord[field.binding] : activeRecord.verification_url;
        const qrVal =
          rawVal ||
          (activeRecord.serialNumber
            ? `${baseUrl}/public/certificate/${activeRecord.serialNumber}`
            : activeRecord.student_id
            ? `${baseUrl}/public/certificate/${activeRecord.student_id}`
            : `${baseUrl}/public/verify`);
        const qrSize = Math.max(20, Math.min(field.w, field.h) - 4);
        return (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#ffffff" }}>
            <QRCodeSVG value={qrVal} size={qrSize} level="M" />
          </div>
        );
      }
      if (field.type === "line") {
        return <div style={{ width: "100%", height: "100%", background: field.color || "#c9a84c" }} />;
      }
      if (field.type === "rect") {
        return <div style={{ width: "100%", height: "100%", border: `2px solid ${field.color || "#c9a84c"}`, boxSizing: "border-box" }} />;
      }
      if (field.dynamic && field.binding) {
        const val = activeRecord[field.binding];
        if (val && val.trim().length > 0) {
          return <span>{(field.label ? `${field.label} ` : "") + val}</span>;
        }
        const label = ALL_BINDING_LABELS[field.binding] || field.binding;
        return <span style={{ opacity: 0.6 }}>{(field.label ? `${field.label} ` : "") + label}</span>;
      }
      return <span>{field.text || "Văn bản"}</span>;
    })();

    return <div style={styles}>{content}</div>;
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500 dark:text-gray-400 text-xs">Đang tải danh sách mẫu...</div>;
  }

  return (
    <div className={styles._root}>
      {/* Header Toolbar - 2-Row Layout */}
      <div className={styles._header}>
        {/* Row 1: Title, Template Selector, Record Badge & Zoom Controls */}
        <div className={styles._headerRow1}>
          <div className={styles._headerLeft}>
            <div className={styles._titleGroup}>
              <span className={styles._titleIcon}>🎓</span>
              <h1 className={styles._title}>Tạo & Xuất bằng PDF</h1>
            </div>

            <div className={styles._divider} />

            {/* Template Selector Dropdown */}
            <div className={styles._selectorGroup}>
              <span className={styles._selectorLabel}>Chọn mẫu:</span>
              <select
                value={selectedTemplateId}
                onChange={(e) => handleSelectTemplate(e.target.value)}
                className={styles._selector}
              >
                <option value="">-- Chọn mẫu văn bằng --</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} {t.is_default ? "(Mặc định)" : ""}
                  </option>
                ))}
              </select>
            </div>

            {selectedTemplate && (
              <>
                <div className={styles._divider} />
                {/* Record Status Badge in Top Bar */}
                <div className={styles._recordGroup}>
                  <span className={styles._recordBadge}>
                    📄 Bản ghi: <strong className="text-blue-600 dark:text-blue-400">{activeRowIndex + 1}</strong> / {records.length}
                  </span>
                  {importedFileName ? (
                    <span className={styles._fileBadge}>
                      📁 {importedFileName}
                    </span>
                  ) : (
                    <span className={styles._manualHint}>(Dữ liệu nhập tay)</span>
                  )}
                </div>
              </>
            )}
          </div>

          {selectedTemplate && (
            /* Zoom Controls */
            <div className={styles._zoomGroup}>
              <Button onClick={() => setZoom((z) => Math.max(0.3, z - 0.1))} variant="ghost" size="sm" title="Thu nhỏ">−</Button>
              <span className={styles._zoomLabel}>{Math.round(zoom * 100)}%</span>
              <Button onClick={() => setZoom((z) => Math.min(1.5, z + 0.1))} variant="ghost" size="sm" title="Phóng to">+</Button>
            </div>
          )}
        </div>

        {/* Row 2: Pure Action Bar for Import, Export & Blockchain Issue (Evenly Spread) */}
        {selectedTemplate && (
          <div className={styles._headerRow2}>
            {/* Group 1: Import Data */}
            <label className={styles._importLabel}>
              <span>📥</span>
              <span>{importing ? "Đang nạp..." : "Import CSV/Excel"}</span>
              <input type="file" accept=".csv,.xlsx,.xls" onChange={handleImportFile} disabled={importing} className="hidden" />
            </label>

            <div className={styles._actionDivider} />

            {/* Group 2: PDF Export Group */}
            <div className={styles._exportGroup}>
              <Button
                onClick={exportSinglePdf}
                disabled={exportingSingle || exportingBatch || issuingSingle || issuingBatch}
                variant="secondary"
                size="sm"
                title="Xuất 1 file PDF cho bản ghi hiện tại"
              >
                <span>📄</span>
                <span>{exportingSingle ? "Đang xuất..." : "Xuất PDF bản ghi"}</span>
              </Button>
              <Button
                onClick={exportBatchZip}
                disabled={exportingSingle || exportingBatch || issuingSingle || issuingBatch || records.length === 0}
                variant="primary"
                size="sm"
                title="Xuất tất cả PDF thành file ZIP"
              >
                <span>📦</span>
                <span>{exportingBatch ? `Đang tạo ZIP (${batchProgress})...` : `Xuất ZIP tất cả (${records.length})`}</span>
              </Button>
            </div>

            <div className={styles._actionDivider} />

            {/* Group 3: Blockchain Issue Group */}
            <div className={styles._issueGroup}>
              <Button
                onClick={handleIssueSingle}
                disabled={exportingSingle || exportingBatch || issuingSingle || issuingBatch}
                variant="secondary"
                size="sm"
                title="Đăng ký bản ghi này lên IPFS & Blockchain"
              >
                <span>🚀</span>
                <span>{issuingSingle ? "Đang phát hành..." : "Phát hành bản ghi"}</span>
              </Button>
              <Button
                onClick={handleIssueBatch}
                disabled={exportingSingle || exportingBatch || issuingSingle || issuingBatch || records.length === 0}
                variant="primary"
                size="sm"
                title="Đăng ký tất cả bản ghi lên IPFS & Blockchain"
              >
                <span>🚀</span>
                <span>{issuingBatch ? "Đang phát hành..." : `Phát hành tất cả (${records.length})`}</span>
              </Button>
            </div>

            <div className={styles._actionDivider} />

            {/* Change Template Action */}
            <Button onClick={handleCancel} variant="danger" size="sm">
              <span>✕</span>
              <span>Đổi mẫu</span>
            </Button>
          </div>
        )}
      </div>

      {/* Main Content Workspace */}
      {!selectedTemplate ? (
        /* Empty / Initial Template Selection Screen */
        <div className={styles._emptyState}>
          <div className={styles._emptyInner}>
            <div className={styles._emptyIcon}>🎓</div>
            <h2 className={styles._emptyTitle}>Vui lòng chọn mẫu văn bằng</h2>
            <p className={styles._emptyDesc}>
              Hãy chọn 1 mẫu văn bằng bên dưới để hiển thị phôi thiết kế, nạp dữ liệu nhập tay hoặc file Excel và xuất PDF / Phát hành IPFS & Blockchain.
            </p>
          </div>

          <div className={styles._templateGrid}>
            {templates.map((t) => (
              <div
                key={t.id}
                onClick={() => handleSelectTemplate(t.id)}
                className={styles._templateCard}
              >
                <div>
                  <div className={styles._templateCardHeader}>
                    <span className={styles._templateBadge}>
                      {t.is_default ? "Mẫu mặc định" : "Mẫu đã tạo"}
                    </span>
                  </div>
                  <h3 className={styles._templateName}>{t.name}</h3>
                  <p className={styles._templateDesc}>{t.description || "Không có mô tả"}</p>
                </div>

                <Button variant="primary" size="sm" className="w-full">
                  Chọn mẫu này →
                </Button>
              </div>
            ))}

            {templates.length === 0 && (
              <div className={styles._emptyPlaceholder}>
                <p className="text-xs text-gray-500 dark:text-gray-400">Chưa có mẫu văn bằng nào. Hãy tạo mẫu trong mục <strong>Mẫu văn bằng</strong> trước.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Loaded Template Workspace */
        <div className={styles._workspace}>
          {/* Dynamic Input Side Panel */}
          <div className={styles._sidePanel}>
            <div className={styles._sidePanelHeader}>
              <div className={styles._templateNameLabel}>Mẫu: {selectedTemplate.name}</div>
              <h2 className={styles._sidePanelTitle}>Nhập dữ liệu theo mẫu</h2>
              <p className={styles._sidePanelDesc}>
                Hiển thị <strong>{boundFields.length} nhãn động</strong> thuộc mẫu này.
              </p>
            </div>

            {/* Record Navigator */}
            <div className={styles._navCard}>
              <div className={styles._navCardHeader}>
                <span className={styles._navCardTitle}>
                  {importedFileName ? `📁 ${importedFileName}` : "Bản ghi nhập tay"}
                  {importedFileName && (
                    <Button
                      onClick={() => {
                        setRecords([{}]);
                        setActiveRowIndex(0);
                        setImportedFileName("");
                      }}
                      variant="ghost"
                      size="sm"
                      title="Xóa dữ liệu nạp từ file"
                      className="!text-red-500 !p-0 !ml-1.5"
                    >
                      [Xóa file]
                    </Button>
                  )}
                </span>
                <span className={styles._navCardCount}>
                  Dòng {activeRowIndex + 1} / {records.length}
                </span>
              </div>

              <div className={styles._navRow}>
                <Button
                  onClick={() => setActiveRowIndex((i) => Math.max(0, i - 1))}
                  disabled={activeRowIndex <= 0}
                  variant="secondary"
                  size="sm"
                >
                  ◄ Trước
                </Button>

                <select
                  value={activeRowIndex}
                  onChange={(e) => setActiveRowIndex(Number(e.target.value))}
                  className={styles._navSelect}
                >
                  {records.map((r, i) => (
                    <option key={i} value={i}>
                      Dòng {i + 1}: {r.student_fullName || r.student_id || `Bản ghi ${i + 1}`}
                    </option>
                  ))}
                </select>

                <Button
                  onClick={() => setActiveRowIndex((i) => Math.min(records.length - 1, i + 1))}
                  disabled={activeRowIndex >= records.length - 1}
                  variant="secondary"
                  size="sm"
                >
                  Sau ►
                </Button>
              </div>
            </div>

            {/* Dynamic Input Form (Only for bound fields in the active template) */}
            <div className={styles._formGroup}>
              {boundFields.map(({ key, label }) => {
                if (key === "student_id" && students.length > 0) {
                  return (
                    <div key={key}>
                      <label className={styles._formLabel}>
                        {label} (Chọn hoặc Nhập tay)
                      </label>
                      <select
                        value={activeRecord[key] || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          handleUpdateActiveField("student_id", val);
                          const st = students.find((s) => s.student_id === val);
                          if (st) {
                            handleUpdateActiveField("student_fullName", st.student_fullName);
                          }
                        }}
                        className={styles._formSelect}
                      >
                        <option value="">-- Chọn sinh viên có sẵn --</option>
                        {students.map((st) => (
                          <option key={st.student_id} value={st.student_id}>
                            {st.student_id} - {st.student_fullName}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={activeRecord[key] || ""}
                        onChange={(e) => handleUpdateActiveField(key, e.target.value)}
                        className={styles._formInput}
                        placeholder="Hoặc nhập mã SV mới..."
                      />
                    </div>
                  );
                }

                return (
                  <div key={key}>
                    <label className={styles._formLabel}>
                      {label}
                    </label>
                    <input
                      type="text"
                      value={activeRecord[key] || ""}
                      onChange={(e) => handleUpdateActiveField(key, e.target.value)}
                      className={styles._formInput}
                      placeholder={`Nhập ${label.toLowerCase()}...`}
                    />
                  </div>
                );
              })}

              {boundFields.length === 0 && (
                <div className={styles._noFieldsNotice}>
                  Mẫu này chưa có trường động nào. Hãy vào mục <strong>Mẫu văn bằng</strong> để thêm các trường động (binding).
                </div>
              )}
            </div>
          </div>

          {/* Center Live Canvas Workspace */}
          <div className={styles._canvasWrap}>
            <div
              ref={canvasRef}
              className={styles._canvas}
              style={{
                width: activeDesign.page.width,
                height: activeDesign.page.height,
                background: activeDesign.page.bgColor || "#ffffff",
                transform: `scale(${zoom})`,
                transformOrigin: "center center",
              }}
            >
              {activeDesign.decorations?.map((dec, i) => {
                if (dec.type === "border") {
                  return (
                    <div
                      key={`dec_${i}`}
                      style={{
                        position: "absolute",
                        inset: dec.offset || 0,
                        border: `${dec.width || 2}px ${dec.style || "solid"} ${dec.color || "#000"}`,
                        borderRadius: dec.style === "double" ? 4 : 0,
                        pointerEvents: "none",
                      }}
                    />
                  );
                }
                if (dec.type === "watermark" && dec.text) {
                  return (
                    <div
                      key={`dec_${i}`}
                      style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        pointerEvents: "none",
                        opacity: dec.opacity || 0.05,
                        fontSize: dec.size || 60,
                        fontFamily: dec.font || "serif",
                        color: "#000",
                      }}
                    >
                      {dec.text}
                    </div>
                  );
                }
                return null;
              })}

              {activeDesign.fields?.map((field) => (
                <React.Fragment key={field.id}>{renderFieldContent(field)}</React.Fragment>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Result Modal for Direct Single / Batch Issuance */}
      {issueResult && (
        <div className={styles._overlay}>
          <div className={styles._modal}>
            {issueResult.type === "SINGLE" ? (
              <div>
                <div style={{ textAlign: "center", marginBottom: 20 }}>
                  <div style={{ fontSize: 44, marginBottom: 8 }}>🎉</div>
                  <h2 className={styles._modalResultTitle}>Cấp phát văn bằng thành công!</h2>
                  <p className={styles._modalResultDesc}>Văn bằng số đã được lưu vào bảng <strong>online_certificates</strong>, tệp JSON lên IPFS và ghi vĩnh viễn lên Blockchain.</p>
                </div>

                <div className={styles._detailBox}>
                  <div className={styles._detailRow}>
                    <span className={styles._detailRowLabel}>Mã văn bằng (ID): </span>
                    <code className={styles._detailRowCode}>{issueResult.data.certificate_id}</code>
                  </div>
                  <div className={styles._detailRow}>
                    <span className={styles._detailRowLabel}>Sinh viên: </span>
                    <strong className={styles._detailRowValue}>{issueResult.data.student_fullName}</strong> ({issueResult.data.student_id})
                  </div>
                  <div className={styles._detailRow}>
                    <span className={styles._detailRowLabel}>Tên văn bằng: </span>
                    <span className={styles._detailRowValue}>{issueResult.data.certificate_title}</span>
                  </div>
                  <div className={styles._detailRow}>
                    <span className={styles._detailRowLabel}>IPFS CID (JSON Metadata): </span>
                    <div style={{ marginTop: 4 }}>
                      <a href={issueResult.data.file_url || `https://gateway.pinata.cloud/ipfs/${issueResult.data.ipfs_cid}`} target="_blank" rel="noreferrer" className={styles._detailLink}>
                        🔗 {issueResult.data.ipfs_cid}
                      </a>
                    </div>
                  </div>
                  {issueResult.data.tx_hash && (
                    <div className={styles._detailRow}>
                      <span className={styles._detailRowLabel}>Blockchain Tx Hash: </span>
                      <div style={{ marginTop: 4 }}>
                        <code className={styles._txHashBox}>
                          ⚡ {issueResult.data.tx_hash}
                        </code>
                      </div>
                    </div>
                  )}
                </div>

                <Button onClick={() => setIssueResult(null)} variant="primary" size="md" className="w-full mt-5">
                  Đóng thông báo
                </Button>
              </div>
            ) : (
              <div>
                <div style={{ textAlign: "center", marginBottom: 16 }}>
                  <div style={{ fontSize: 44, marginBottom: 8 }}>📦</div>
                  <h2 className={styles._modalResultTitle}>Kết quả cấp phát lô văn bằng</h2>
                  <p className={styles._modalResultDesc}>
                    Đã xử lý <strong>{issueResult.data.total}</strong> bản ghi (Thành công: <strong style={{ color: "#16a34a" }}>{issueResult.data.successCount}</strong>, Thất bại: <strong style={{ color: "#dc2626" }}>{issueResult.data.failCount}</strong>).
                  </p>
                </div>

                <div className={styles._resultTableScroll}>
                  <table className={styles._batchTable}>
                    <thead>
                      <tr className={styles._batchThead}>
                        <th className={styles._batchTh}>STT</th>
                        <th className={styles._batchTh}>Sinh viên</th>
                        <th className={styles._batchTh}>Trạng thái</th>
                        <th className={styles._batchTh}>IPFS CID / Ghi chú</th>
                      </tr>
                    </thead>
                    <tbody>
                      {issueResult.data.results.map((r: any) => (
                        <tr key={r.index} className={styles._batchTr}>
                          <td className={styles._batchTd}>{r.index}</td>
                          <td className={styles._batchTd} style={{ fontWeight: 600 }}>{r.student_fullName}</td>
                          <td className={styles._batchTd}>
                            {r.status === "SUCCESS" ? (
                              <span className={styles._batchSuccess}>✓ Thành công</span>
                            ) : (
                              <span className={styles._batchFail}>✕ Thất bại</span>
                            )}
                          </td>
                          <td className={styles._batchTd}>
                            {r.status === "SUCCESS" ? (
                              <a href={r.file_url || `https://gateway.pinata.cloud/ipfs/${r.cid}`} target="_blank" rel="noreferrer" className={styles._batchLink}>
                                {r.cid?.slice(0, 16)}...
                              </a>
                            ) : (
                              <span className={styles._batchError}>{r.error}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <Button onClick={() => setIssueResult(null)} variant="primary" size="md" className="w-full">
                  Đóng thông báo
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
