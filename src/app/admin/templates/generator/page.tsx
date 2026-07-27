"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import JSZip from "jszip";
import { templateApi } from "@/features/templates/services/api";
import type { CertificateTemplate, TemplateField, DesignData } from "@/features/templates/types";
import { certificateApi, type CreateCertificatePayload } from "@/features/certificates/services/certificate.api";
import { studentApi, type StudentDto } from "@/features/students/services/student.api";
import { QRCodeSVG } from "qrcode.react";

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
    return <div className="p-8 text-center text-gray-500 text-xs">Đang tải danh sách mẫu...</div>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 64px)", background: "#f1f5f9", fontFamily: "sans-serif" }}>
      {/* Header Toolbar - 2-Row Layout */}
      <div className="flex flex-col bg-white border-b border-slate-200 shadow-2xs shrink-0">
        {/* Row 1: Title, Template Selector, Record Badge & Zoom Controls */}
        <div className="flex items-center justify-between px-6 py-2.5 border-b border-slate-100 overflow-x-auto whitespace-nowrap gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xl">🎓</span>
              <h1 className="text-base font-extrabold text-slate-900 m-0 whitespace-nowrap">Tạo & Xuất bằng PDF</h1>
            </div>

            <div className="h-4 w-[1px] bg-slate-200 shrink-0" />

            {/* Template Selector Dropdown */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 shadow-2xs shrink-0">
              <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Chọn mẫu:</span>
              <select
                value={selectedTemplateId}
                onChange={(e) => handleSelectTemplate(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer pr-1 whitespace-nowrap"
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
                <div className="h-4 w-[1px] bg-slate-200 shrink-0" />
                {/* Record Status Badge in Top Bar */}
                <div className="flex items-center gap-2 text-xs shrink-0">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 font-bold shadow-2xs whitespace-nowrap">
                    📄 Bản ghi: <strong className="text-blue-600">{activeRowIndex + 1}</strong> / {records.length}
                  </span>
                  {importedFileName ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold whitespace-nowrap">
                      📁 {importedFileName}
                    </span>
                  ) : (
                    <span className="text-slate-400 font-normal text-[11px] whitespace-nowrap">(Dữ liệu nhập tay)</span>
                  )}
                </div>
              </>
            )}
          </div>

          {selectedTemplate && (
            /* Zoom Controls */
            <div className="flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-xl p-1 shadow-2xs shrink-0">
              <button onClick={() => setZoom((z) => Math.max(0.3, z - 0.1))} className="px-2 py-0.5 text-xs text-slate-600 hover:text-slate-900 font-bold transition-colors" title="Thu nhỏ">−</button>
              <span className="text-[11px] font-semibold text-slate-600 min-w-[36px] text-center">{Math.round(zoom * 100)}%</span>
              <button onClick={() => setZoom((z) => Math.min(1.5, z + 0.1))} className="px-2 py-0.5 text-xs text-slate-600 hover:text-slate-900 font-bold transition-colors" title="Phóng to">+</button>
            </div>
          )}
        </div>

        {/* Row 2: Pure Action Bar for Import, Export & Blockchain Issue (Evenly Spread) */}
        {selectedTemplate && (
          <div className="flex items-center justify-between px-8 py-2.5 bg-slate-50/90 border-t border-slate-100 overflow-x-auto whitespace-nowrap gap-4">
            {/* Group 1: Import Data */}
            <label className="px-3.5 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer inline-flex items-center gap-1.5 shadow-2xs transition-all active:scale-95 shrink-0">
              <span>📥</span>
              <span>{importing ? "Đang nạp..." : "Import CSV/Excel"}</span>
              <input type="file" accept=".csv,.xlsx,.xls" onChange={handleImportFile} disabled={importing} className="hidden" />
            </label>

            <div className="h-4 w-[1px] bg-slate-300/80 shrink-0" />

            {/* Group 2: PDF Export Group */}
            <div className="flex items-center gap-1.5 bg-sky-50 border border-sky-200/80 p-1 rounded-xl shadow-2xs shrink-0">
              <button
                onClick={exportSinglePdf}
                disabled={exportingSingle || exportingBatch || issuingSingle || issuingBatch}
                className="px-3 py-1 text-xs font-bold text-sky-700 bg-white hover:bg-sky-100/80 border border-sky-200/70 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs transition-all inline-flex items-center gap-1.5 active:scale-95 shrink-0"
                title="Xuất 1 file PDF cho bản ghi hiện tại"
              >
                <span>📄</span>
                <span>{exportingSingle ? "Đang xuất..." : "Xuất PDF bản ghi"}</span>
              </button>
              <button
                onClick={exportBatchZip}
                disabled={exportingSingle || exportingBatch || issuingSingle || issuingBatch || records.length === 0}
                className="px-3 py-1 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs transition-all inline-flex items-center gap-1.5 active:scale-95 shrink-0"
                title="Xuất tất cả PDF thành file ZIP"
              >
                <span>📦</span>
                <span>{exportingBatch ? `Đang tạo ZIP (${batchProgress})...` : `Xuất ZIP tất cả (${records.length})`}</span>
              </button>
            </div>

            <div className="h-4 w-[1px] bg-slate-300/80 shrink-0" />

            {/* Group 3: Blockchain Issue Group */}
            <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200/80 p-1 rounded-xl shadow-2xs shrink-0">
              <button
                onClick={handleIssueSingle}
                disabled={exportingSingle || exportingBatch || issuingSingle || issuingBatch}
                className="px-3 py-1 text-xs font-bold text-emerald-800 bg-white hover:bg-emerald-100/80 border border-emerald-200/70 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs transition-all inline-flex items-center gap-1.5 active:scale-95 shrink-0"
                title="Đăng ký bản ghi này lên IPFS & Blockchain"
              >
                <span>🚀</span>
                <span>{issuingSingle ? "Đang phát hành..." : "Phát hành bản ghi"}</span>
              </button>
              <button
                onClick={handleIssueBatch}
                disabled={exportingSingle || exportingBatch || issuingSingle || issuingBatch || records.length === 0}
                className="px-3 py-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs transition-all inline-flex items-center gap-1.5 active:scale-95 shrink-0"
                title="Đăng ký tất cả bản ghi lên IPFS & Blockchain"
              >
                <span>🚀</span>
                <span>{issuingBatch ? "Đang phát hành..." : `Phát hành tất cả (${records.length})`}</span>
              </button>
            </div>

            <div className="h-4 w-[1px] bg-slate-300/80 shrink-0" />

            {/* Change Template Action */}
            <button
              onClick={handleCancel}
              className="px-3.5 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold transition-all inline-flex items-center gap-1.5 active:scale-95 shadow-2xs shrink-0"
            >
              <span>✕</span>
              <span>Đổi mẫu</span>
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
              Hãy chọn 1 mẫu văn bằng bên dưới để hiển thị phôi thiết kế, nạp dữ liệu nhập tay hoặc file Excel và xuất PDF / Phát hành IPFS & Blockchain.
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
              {boundFields.map(({ key, label }) => {
                if (key === "student_id" && students.length > 0) {
                  return (
                    <div key={key}>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#475569", marginBottom: 4 }}>
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
                        style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 12, color: "#0f172a", outline: "none", boxSizing: "border-box", marginBottom: 4 }}
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
                        style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 12, color: "#0f172a", outline: "none", boxSizing: "border-box" }}
                        placeholder="Hoặc nhập mã SV mới..."
                      />
                    </div>
                  );
                }

                return (
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
                );
              })}

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

      {/* Result Modal for Direct Single / Batch Issuance */}
      {issueResult && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 16 }}>
          <div style={{ background: "#fff", borderRadius: 16, maxWidth: 650, width: "100%", maxHeight: "90vh", overflowY: "auto", padding: 24, boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}>
            {issueResult.type === "SINGLE" ? (
              <div>
                <div style={{ textAlign: "center", marginBottom: 20 }}>
                  <div style={{ fontSize: 44, marginBottom: 8 }}>🎉</div>
                  <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: 0 }}>Cấp phát văn bằng thành công!</h2>
                  <p style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>Văn bằng số đã được lưu vào bảng <strong>online_certificates</strong>, tệp JSON lên IPFS và ghi vĩnh viễn lên Blockchain.</p>
                </div>

                <div style={{ background: "#f8fafc", borderRadius: 12, padding: 16, border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: 12, fontSize: 13 }}>
                  <div>
                    <span style={{ fontWeight: 700, color: "#475569" }}>Mã văn bằng (ID): </span>
                    <code style={{ background: "#e2e8f0", padding: "2px 6px", borderRadius: 4, fontSize: 12 }}>{issueResult.data.certificate_id}</code>
                  </div>
                  <div>
                    <span style={{ fontWeight: 700, color: "#475569" }}>Sinh viên: </span>
                    <strong>{issueResult.data.student_fullName}</strong> ({issueResult.data.student_id})
                  </div>
                  <div>
                    <span style={{ fontWeight: 700, color: "#475569" }}>Tên văn bằng: </span>
                    {issueResult.data.certificate_title}
                  </div>
                  <div>
                    <span style={{ fontWeight: 700, color: "#475569" }}>IPFS CID (JSON Metadata): </span>
                    <div style={{ marginTop: 4 }}>
                      <a href={issueResult.data.file_url || `https://gateway.pinata.cloud/ipfs/${issueResult.data.ipfs_cid}`} target="_blank" rel="noreferrer" style={{ color: "#2563eb", wordBreak: "break-all", fontWeight: 600, textDecoration: "underline" }}>
                        🔗 {issueResult.data.ipfs_cid}
                      </a>
                    </div>
                  </div>
                  {issueResult.data.tx_hash && (
                    <div>
                      <span style={{ fontWeight: 700, color: "#475569" }}>Blockchain Tx Hash: </span>
                      <div style={{ marginTop: 4 }}>
                        <code style={{ background: "#eff6ff", color: "#1d4ed8", padding: "4px 8px", borderRadius: 6, fontSize: 11, wordBreak: "break-all", display: "block" }}>
                          ⚡ {issueResult.data.tx_hash}
                        </code>
                      </div>
                    </div>
                  )}
                </div>

                <button onClick={() => setIssueResult(null)} style={{ marginTop: 20, width: "100%", padding: "10px", borderRadius: 8, background: "#0f172a", color: "#fff", border: "none", fontWeight: 700, cursor: "pointer" }}>
                  Đóng thông báo
                </button>
              </div>
            ) : (
              <div>
                <div style={{ textAlign: "center", marginBottom: 16 }}>
                  <div style={{ fontSize: 44, marginBottom: 8 }}>📦</div>
                  <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: 0 }}>Kết quả cấp phát lô văn bằng</h2>
                  <p style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>
                    Đã xử lý <strong>{issueResult.data.total}</strong> bản ghi (Thành công: <strong style={{ color: "#16a34a" }}>{issueResult.data.successCount}</strong>, Thất bại: <strong style={{ color: "#dc2626" }}>{issueResult.data.failCount}</strong>).
                  </p>
                </div>

                <div style={{ overflowX: "auto", maxHeight: 300, border: "1px solid #e2e8f0", borderRadius: 8, marginBottom: 16 }}>
                  <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "#f1f5f9", textAlign: "left" }}>
                        <th style={{ padding: "8px 12px" }}>STT</th>
                        <th style={{ padding: "8px 12px" }}>Sinh viên</th>
                        <th style={{ padding: "8px 12px" }}>Trạng thái</th>
                        <th style={{ padding: "8px 12px" }}>IPFS CID / Ghi chú</th>
                      </tr>
                    </thead>
                    <tbody>
                      {issueResult.data.results.map((r: any) => (
                        <tr key={r.index} style={{ borderTop: "1px solid #f1f5f9" }}>
                          <td style={{ padding: "8px 12px" }}>{r.index}</td>
                          <td style={{ padding: "8px 12px", fontWeight: 600 }}>{r.student_fullName}</td>
                          <td style={{ padding: "8px 12px" }}>
                            {r.status === "SUCCESS" ? (
                              <span style={{ color: "#16a34a", fontWeight: 700 }}>✓ Thành công</span>
                            ) : (
                              <span style={{ color: "#dc2626", fontWeight: 700 }}>✕ Thất bại</span>
                            )}
                          </td>
                          <td style={{ padding: "8px 12px" }}>
                            {r.status === "SUCCESS" ? (
                              <a href={r.file_url || `https://gateway.pinata.cloud/ipfs/${r.cid}`} target="_blank" rel="noreferrer" style={{ color: "#2563eb", textDecoration: "underline" }}>
                                {r.cid?.slice(0, 16)}...
                              </a>
                            ) : (
                              <span style={{ color: "#dc2626" }}>{r.error}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <button onClick={() => setIssueResult(null)} style={{ width: "100%", padding: "10px", borderRadius: 8, background: "#0f172a", color: "#fff", border: "none", fontWeight: 700, cursor: "pointer" }}>
                  Đóng thông báo
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
