"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import JSZip from "jszip";
import { templateApi } from "@/features/templates/services/api";
import type { CertificateTemplate, TemplateField, DesignData } from "@/features/templates/types";

const ALL_BINDING_LABELS: Record<string, string> = {
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

  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const list = await templateApi.list();
        setTemplates(list);
      } catch (err: any) {
        console.error("Failed to load templates", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTemplates();
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

  // Dynamically extract bound fields present in the selected template
  const boundFields = useMemo(() => {
    const fields = activeDesign.fields || [];
    const bound = fields.filter((f) => f.dynamic && f.binding);
    const uniqueKeys = Array.from(new Set(bound.map((f) => f.binding!)));
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
      background: field.type === "qr" ? "#f8f8f8" : "transparent",
    };

    const content = (() => {
      if (field.type === "qr") {
        return <span style={{ fontSize: 9, color: "#999", textAlign: "center", width: "100%" }}>QR Code</span>;
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
    return <div className="p-8 text-center text-gray-500 text-xs">Đang tải danh sách mẫu...</div>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 64px)", background: "#f1f5f9", fontFamily: "sans-serif" }}>
      {/* Header Toolbar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 24px", background: "#fff", borderBottom: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <h1 style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", margin: 0 }}>Tạo & Xuất bằng PDF</h1>
          
          {/* Template Selector Dropdown */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b" }}>Chọn mẫu:</span>
            <select
              value={selectedTemplateId}
              onChange={(e) => handleSelectTemplate(e.target.value)}
              style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 12, fontWeight: 600, color: "#1e293b", background: "#fff" }}
            >
              <option value="">-- Chọn mẫu văn bằng --</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} {t.is_default ? "(Mặc định)" : ""}
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedTemplate && (
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* Zoom controls */}
            <div style={{ display: "flex", alignItems: "center", gap: 4, background: "#f1f5f9", borderRadius: 8, padding: "2px" }}>
              <button onClick={() => setZoom((z) => Math.max(0.3, z - 0.1))} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px 8px", fontSize: 12, color: "#64748b" }}>−</button>
              <span style={{ fontSize: 11, color: "#64748b", minWidth: 36, textAlign: "center" }}>{Math.round(zoom * 100)}%</span>
              <button onClick={() => setZoom((z) => Math.min(1.5, z + 0.1))} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px 8px", fontSize: 12, color: "#64748b" }}>+</button>
            </div>

            {/* Import File Button */}
            <label style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid #cbd5e1", background: "#f8fafc", color: "#334155", cursor: "pointer", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
              📥 {importing ? "Đang nạp file..." : "Import CSV/Excel"}
              <input type="file" accept=".csv,.xlsx,.xls" onChange={handleImportFile} disabled={importing} style={{ display: "none" }} />
            </label>

            {/* Export Single PDF */}
            <button
              onClick={exportSinglePdf}
              disabled={exportingSingle || exportingBatch}
              style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "#059669", color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}
            >
              📄 {exportingSingle ? "Đang xuất..." : "Xuất PDF bản ghi này"}
            </button>

            {/* Export Batch ZIP */}
            <button
              onClick={exportBatchZip}
              disabled={exportingSingle || exportingBatch || records.length === 0}
              style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "#3b82f6", color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}
            >
              📦 {exportingBatch ? `Đang tạo ZIP (${batchProgress})...` : `Xuất tất cả PDF (${records.length} bản ghi)`}
            </button>

            {/* Cancel & Clear Data button */}
            <button
              onClick={handleCancel}
              style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid #fca5a5", background: "#fff1f2", color: "#e11d48", cursor: "pointer", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}
            >
              ✕ Hủy / Đổi mẫu
            </button>
          </div>
        )}
      </div>

      {/* Main Content Workspace */}
      {!selectedTemplate ? (
        /* Empty / Initial Template Selection Screen */
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32, background: "#f8fafc" }}>
          <div style={{ textAlign: "center", maxWidth: 600, marginBottom: 32 }}>
            <div style={{ fontSize: 52, marginBottom: 12 }}>🎓</div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", marginBottom: 8 }}>Vui lòng chọn mẫu văn bằng</h2>
            <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>
              Hãy chọn 1 mẫu văn bằng bên dưới để hiển thị phôi thiết kế, nạp dữ liệu nhập tay hoặc file Excel và xuất PDF.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, width: "100%", maxWidth: 800 }}>
            {templates.map((t) => (
              <div
                key={t.id}
                onClick={() => handleSelectTemplate(t.id)}
                style={{
                  background: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: 16,
                  padding: 20,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#3b82f6";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#e2e8f0";
                  e.currentTarget.style.transform = "none";
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 12, background: "#eff6ff", color: "#2563eb" }}>
                      {t.is_default ? "Mẫu mặc định" : "Mẫu đã tạo"}
                    </span>
                  </div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1e293b", margin: "0 0 6px 0" }}>{t.name}</h3>
                  <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>{t.description || "Không có mô tả"}</p>
                </div>

                <button
                  style={{
                    marginTop: 16,
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: 8,
                    background: "#3b82f6",
                    color: "#fff",
                    border: "none",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Chọn mẫu này →
                </button>
              </div>
            ))}

            {templates.length === 0 && (
              <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: 32, background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", width: "100%" }}>
                <p style={{ fontSize: 13, color: "#64748b" }}>Chưa có mẫu văn bằng nào. Hãy tạo mẫu trong mục <strong>Mẫu văn bằng</strong> trước.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Loaded Template Workspace */
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          {/* Dynamic Input Side Panel */}
          <div style={{ width: 340, background: "#fff", borderRight: "1px solid #e2e8f0", padding: 16, overflowY: "auto", display: "flex", flexDirection: "column" }}>
            <div style={{ marginBottom: 14, paddingBottom: 10, borderBottom: "1px solid #f1f5f9" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#2563eb", marginBottom: 2 }}>Mẫu: {selectedTemplate.name}</div>
              <h2 style={{ fontSize: 13, fontWeight: 800, color: "#0f172a", marginBottom: 2 }}>Nhập dữ liệu theo mẫu</h2>
              <p style={{ fontSize: 11, color: "#64748b", margin: 0 }}>
                Hiển thị <strong style={{ color: "#2563eb" }}>{boundFields.length} nhãn động</strong> thuộc mẫu này.
              </p>
            </div>

            {/* Record Navigator */}
            <div style={{ marginBottom: 16, background: "#f8fafc", border: "1px solid #e2e8f0", padding: 10, borderRadius: 10 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#334155" }}>
                  {importedFileName ? `📁 ${importedFileName}` : "Bản ghi nhập tay"}
                  {importedFileName && (
                    <button
                      onClick={() => {
                        setRecords([{}]);
                        setActiveRowIndex(0);
                        setImportedFileName("");
                      }}
                      title="Xóa dữ liệu nạp từ file"
                      style={{
                        background: "none",
                        border: "none",
                        color: "#ef4444",
                        fontSize: 10,
                        fontWeight: 700,
                        cursor: "pointer",
                        marginLeft: 6,
                      }}
                    >
                      [Xóa file]
                    </button>
                  )}
                </span>
                <span style={{ fontSize: 10, fontWeight: 600, color: "#64748b" }}>
                  Dòng {activeRowIndex + 1} / {records.length}
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <button
                  onClick={() => setActiveRowIndex((i) => Math.max(0, i - 1))}
                  disabled={activeRowIndex <= 0}
                  style={{ padding: "4px 10px", borderRadius: 6, border: "1px solid #cbd5e1", background: "#fff", fontSize: 11, fontWeight: 600, cursor: "pointer", opacity: activeRowIndex <= 0 ? 0.4 : 1 }}
                >
                  ◄ Trước
                </button>

                <select
                  value={activeRowIndex}
                  onChange={(e) => setActiveRowIndex(Number(e.target.value))}
                  style={{ flex: 1, padding: "5px 8px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 11, background: "#fff", fontWeight: 500 }}
                >
                  {records.map((r, i) => (
                    <option key={i} value={i}>
                      Dòng {i + 1}: {r.student_fullName || r.student_id || `Bản ghi ${i + 1}`}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => setActiveRowIndex((i) => Math.min(records.length - 1, i + 1))}
                  disabled={activeRowIndex >= records.length - 1}
                  style={{ padding: "4px 10px", borderRadius: 6, border: "1px solid #cbd5e1", background: "#fff", fontSize: 11, fontWeight: 600, cursor: "pointer", opacity: activeRowIndex >= records.length - 1 ? 0.4 : 1 }}
                >
                  Sau ►
                </button>
              </div>
            </div>

            {/* Dynamic Input Form (Only for bound fields in the active template) */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
              {boundFields.map(({ key, label }) => (
                <div key={key}>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                    {label}
                  </label>
                  <input
                    type="text"
                    value={activeRecord[key] || ""}
                    onChange={(e) => handleUpdateActiveField(key, e.target.value)}
                    style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 12, color: "#0f172a", outline: "none", boxSizing: "border-box" }}
                    placeholder={`Nhập ${label.toLowerCase()}...`}
                  />
                </div>
              ))}

              {boundFields.length === 0 && (
                <div style={{ padding: 16, background: "#fffbe6", border: "1px solid #ffe58f", borderRadius: 8, fontSize: 11, color: "#873800" }}>
                  Mẫu này chưa có trường động nào. Hãy vào mục <strong>Mẫu văn bằng</strong> để thêm các trường động (binding).
                </div>
              )}
            </div>
          </div>

          {/* Center Live Canvas Workspace */}
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", overflow: "auto", padding: 24, background: "#f1f5f9" }}>
            <div
              ref={canvasRef}
              style={{
                position: "relative",
                width: activeDesign.page.width,
                height: activeDesign.page.height,
                background: activeDesign.page.bgColor || "#ffffff",
                transform: `scale(${zoom})`,
                transformOrigin: "center center",
                boxShadow: "0 4px 24px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.06)",
                borderRadius: 4,
                overflow: "hidden",
                flexShrink: 0,
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
    </div>
  );
}
