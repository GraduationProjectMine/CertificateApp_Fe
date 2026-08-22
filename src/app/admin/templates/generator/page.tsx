"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import JSZip from "jszip";
import { templateApi } from "@/features/templates/services/api";
import type { CertificateTemplate, TemplateField, DesignData } from "@/features/templates/types";
import { certificateApi, type CreateCertificatePayload } from "@/features/certificates/services/certificate.api";
import { studentApi, type StudentDto } from "@/features/students/services/student.api";
import { issuerApi } from "@/features/issuer/services/issuer.api";
import { QRCodeSVG } from "qrcode.react";

import { useAuth } from "@/features/auth/components/AuthContext";
import toast from "react-hot-toast";

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
  const { user } = useAuth();
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
  const [confirmingUpload, setConfirmingUpload] = useState<{ type: "SINGLE" | "BATCH"; count: number } | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initData = async () => {
      try {
        const [list, studList, profileRes] = await Promise.all([
          templateApi.list(),
          studentApi.list().catch(() => []),
          issuerApi.getProfile().catch(() => null),
        ]);
        setTemplates(list);
        setStudents(studList);
        if (profileRes && profileRes.logo_url) {
          setRecords((prev) => {
            const next = [...prev];
            if (!next[0]) next[0] = {};
            next[0] = { organization_logo: profileRes.logo_url || "", organization_name: profileRes.organization_name || "", ...next[0] };
            return next;
          });
        }
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

  const OPTIONAL_BINDINGS = ["verification_url", "organization_logo"];

  const validateRecord = (record: Record<string, string>): { valid: boolean; missingLabel?: string } => {
    for (const item of boundFields) {
      if (OPTIONAL_BINDINGS.includes(item.key)) continue;
      const val = record[item.key];
      if (!val || !val.trim()) {
        return { valid: false, missingLabel: item.label };
      }
    }
    return { valid: true };
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const res = await templateApi.importDataFile(file);
      if (!res.rows || res.rows.length === 0) {
        toast.error("File không chứa dữ liệu hợp lệ.");
        return;
      }
      setImportedFileName(res.fileName);
      setRecords(res.rows.map((r) => r.record));
      setActiveRowIndex(0);
      toast.success(`Đã tải thành công ${res.totalRows} bản ghi từ file ${res.fileName}`);
    } catch {
      toast.error("Có lỗi xảy ra, không thể nạp dữ liệu từ file.");
    } finally {
      setImporting(false);
      e.target.value = "";
    }
  };

  const exportSinglePdf = async () => {
    if (!canvasRef.current) return;
    const check = validateRecord(activeRecord);
    if (!check.valid) {
      toast.error(`Vui lòng nhập đầy đủ trường thông tin bắt buộc "${check.missingLabel}" trước khi xuất PDF.`);
      return;
    }
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
      toast.success("Xuất PDF bản ghi thành công!");
    } catch {
      toast.error("Có lỗi xảy ra, không thể xuất file PDF văn bằng.");
    } finally {
      setExportingSingle(false);
    }
  };

  const exportBatchZip = async () => {
    if (!canvasRef.current || records.length === 0) return;
    for (let i = 0; i < records.length; i++) {
      const check = validateRecord(records[i]);
      if (!check.valid) {
        toast.error(`Bản ghi dòng ${i + 1} còn thiếu thông tin "${check.missingLabel}". Vui lòng điền đầy đủ trước khi xuất ZIP.`);
        setActiveRowIndex(i);
        return;
      }
    }

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
      toast.success(`Đã xuất thành công ZIP cho ${records.length} văn bằng!`);
    } catch {
      toast.error("Có lỗi xảy ra, không thể tạo file ZIP.");
    } finally {
      setExportingBatch(false);
      setBatchProgress("");
    }
  };

  const requestIssueSingle = () => {
    if (!selectedTemplate) return;
    const check = validateRecord(activeRecord);
    if (!check.valid) {
      toast.error(`Vui lòng nhập đầy đủ trường thông tin bắt buộc "${check.missingLabel}" trước khi phát hành lên Blockchain.`);
      return;
    }
    setConfirmingUpload({ type: "SINGLE", count: 1 });
  };

  const requestIssueBatch = () => {
    if (!selectedTemplate || records.length === 0) return;
    for (let i = 0; i < records.length; i++) {
      const check = validateRecord(records[i]);
      if (!check.valid) {
        toast.error(`Bản ghi dòng ${i + 1} còn thiếu thông tin "${check.missingLabel}". Vui lòng điền đầy đủ trước khi phát hành lô.`);
        setActiveRowIndex(i);
        return;
      }
    }
    setConfirmingUpload({ type: "BATCH", count: records.length });
  };

  // Issue single certificate with JSON file pinned to IPFS & registered on-chain
  const executeIssueSingle = async () => {
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
      toast.success("Cấp phát văn bằng thành công!");
    } catch {
      toast.error("Có lỗi xảy ra, không thể phát hành văn bằng! (There is error, can't upload certificate)");
    } finally {
      setIssuingSingle(false);
    }
  };

  // Issue batch certificates with JSON files pinned to IPFS & registered on-chain
  const executeIssueBatch = async () => {
    if (!selectedTemplate || records.length === 0) return;

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
      toast.success("Cấp phát lô văn bằng thành công!");
    } catch {
      toast.error("Có lỗi xảy ra, không thể phát hành lô văn bằng! (There is error, can't upload certificate)");
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
      if (field.type === "image" || field.binding === "organization_logo") {
        const rawSrc = field.binding ? activeRecord[field.binding] : field.src;
        const imgSrc = rawSrc || field.src || activeRecord.organization_logo;
        if (imgSrc && (imgSrc.startsWith("http") || imgSrc.startsWith("data:") || imgSrc.startsWith("/"))) {
          return (
            <img
              src={imgSrc}
              alt={field.label || "Logo"}
              style={{ width: "100%", height: "100%", objectFit: "contain", pointerEvents: "none" }}
            />
          );
        }
        return (
          <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: "1px dashed #cbd5e1", background: "#f8fafc", color: "#64748b", fontSize: 11 }}>
            <span style={{ fontSize: 18 }}>🖼</span>
            <span>{field.label || "Logo tổ chức"}</span>
          </div>
        );
      }
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

  if (user?.role === "staff") {
    return (
      <div className="p-8 text-center text-xs font-semibold text-slate-500 dark:text-slate-400">
        Tài khoản nhân viên không có quyền truy cập trang Tạo &amp; Xuất bằng PDF.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-100 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100">
      {/* Header Toolbar - 2-Row Layout */}
      <div className="flex flex-col bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-2xs shrink-0">
        {/* Row 1: Title, Template Selector, Record Badge & Zoom Controls */}
        <div className="flex items-center justify-between px-6 py-2.5 border-b border-slate-100 dark:border-slate-800/60 overflow-x-auto whitespace-nowrap gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xl">🎓</span>
              <h1 className="text-base font-extrabold text-slate-900 dark:text-white m-0 whitespace-nowrap">Tạo & Xuất bằng PDF</h1>
            </div>

            <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800 shrink-0" />

            {/* Template Selector Dropdown */}
            <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 shadow-2xs shrink-0">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap">Chọn mẫu:</span>
              <select
                value={selectedTemplateId}
                onChange={(e) => handleSelectTemplate(e.target.value)}
                className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs font-semibold focus:outline-none cursor-pointer pr-1 whitespace-nowrap"
              >
                <option value="" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100">-- Chọn mẫu văn bằng --</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id} className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100">
                    {t.name} {t.is_default ? "(Mặc định)" : ""}
                  </option>
                ))}
              </select>
            </div>

            {selectedTemplate && (
              <>
                <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800 shrink-0" />
                {/* Record Status Badge in Top Bar */}
                <div className="flex items-center gap-2 text-xs shrink-0">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/40 text-blue-800 dark:text-blue-300 font-bold shadow-2xs whitespace-nowrap">
                    📄 Bản ghi: <strong className="text-blue-600 dark:text-blue-400">{activeRowIndex + 1}</strong> / {records.length}
                  </span>
                  {importedFileName ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-300 font-semibold whitespace-nowrap">
                      📁 {importedFileName}
                    </span>
                  ) : (
                    <span className="text-slate-400 dark:text-slate-500 font-normal text-[11px] whitespace-nowrap">(Dữ liệu nhập tay)</span>
                  )}
                </div>
              </>
            )}
          </div>

          {selectedTemplate && (
            /* Zoom Controls */
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-1 shadow-2xs shrink-0">
              <button onClick={() => setZoom((z) => Math.max(0.3, z - 0.1))} className="px-2 py-0.5 text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-bold transition-colors cursor-pointer" title="Thu nhỏ">−</button>
              <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 min-w-[36px] text-center">{Math.round(zoom * 100)}%</span>
              <button onClick={() => setZoom((z) => Math.min(1.5, z + 0.1))} className="px-2 py-0.5 text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-bold transition-colors cursor-pointer" title="Phóng to">+</button>
            </div>
          )}
        </div>

        {/* Row 2: Pure Action Bar for Import, Export & Blockchain Issue */}
        {selectedTemplate && (
          <div className="flex items-center justify-between px-8 py-2.5 bg-slate-50/90 dark:bg-slate-900/90 border-t border-slate-100 dark:border-slate-800 overflow-x-auto whitespace-nowrap gap-4">
            {/* Group 1: Import Data */}
            <label className="px-3.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold cursor-pointer inline-flex items-center gap-1.5 shadow-2xs transition-all active:scale-95 shrink-0">
              <span>📥</span>
              <span>{importing ? "Đang nạp..." : "Import CSV/Excel"}</span>
              <input type="file" accept=".csv,.xlsx,.xls" onChange={handleImportFile} disabled={importing} className="hidden" />
            </label>

            <div className="h-4 w-[1px] bg-slate-300/80 dark:bg-slate-800 shrink-0" />

            {/* Group 2: PDF Export Group */}
            <div className="flex items-center gap-1.5 bg-sky-50 dark:bg-sky-950/30 border border-sky-200/80 dark:border-sky-800/40 p-1 rounded-xl shadow-2xs shrink-0">
              <button
                onClick={exportSinglePdf}
                disabled={exportingSingle || exportingBatch || issuingSingle || issuingBatch}
                className="px-3 py-1 text-xs font-bold text-sky-700 dark:text-sky-300 bg-white dark:bg-slate-800 hover:bg-sky-100/80 dark:hover:bg-slate-700 border border-sky-200/70 dark:border-sky-800/40 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs transition-all inline-flex items-center gap-1.5 active:scale-95 shrink-0 cursor-pointer"
                title="Xuất 1 file PDF cho bản ghi hiện tại"
              >
                <span>📄</span>
                <span>{exportingSingle ? "Đang xuất..." : "Xuất PDF bản ghi"}</span>
              </button>
              <button
                onClick={exportBatchZip}
                disabled={exportingSingle || exportingBatch || issuingSingle || issuingBatch || records.length === 0}
                className="px-3 py-1 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs transition-all inline-flex items-center gap-1.5 active:scale-95 shrink-0 cursor-pointer"
                title="Xuất tất cả PDF thành file ZIP"
              >
                <span>📦</span>
                <span>{exportingBatch ? `Đang tạo ZIP (${batchProgress})...` : `Xuất ZIP tất cả (${records.length})`}</span>
              </button>
            </div>

            <div className="h-4 w-[1px] bg-slate-300/80 dark:bg-slate-800 shrink-0" />

            {/* Group 3: Blockchain Issue Group */}
            <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/40 p-1 rounded-xl shadow-2xs shrink-0">
              <button
                onClick={requestIssueSingle}
                disabled={exportingSingle || exportingBatch || issuingSingle || issuingBatch}
                className="px-3 py-1 text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-white dark:bg-slate-800 hover:bg-emerald-100/80 dark:hover:bg-slate-700 border border-emerald-200/70 dark:border-emerald-800/40 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs transition-all inline-flex items-center gap-1.5 active:scale-95 shrink-0 cursor-pointer"
                title="Đăng ký bản ghi này lên IPFS & Blockchain"
              >
                <span>🚀</span>
                <span>{issuingSingle ? "Đang phát hành..." : "Phát hành bản ghi"}</span>
              </button>
              <button
                onClick={requestIssueBatch}
                disabled={exportingSingle || exportingBatch || issuingSingle || issuingBatch || records.length === 0}
                className="px-3 py-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs transition-all inline-flex items-center gap-1.5 active:scale-95 shrink-0 cursor-pointer"
                title="Đăng ký tất cả bản ghi lên IPFS & Blockchain"
              >
                <span>🚀</span>
                <span>{issuingBatch ? "Đang phát hành..." : `Phát hành tất cả (${records.length})`}</span>
              </button>
            </div>

            <div className="h-4 w-[1px] bg-slate-300/80 dark:bg-slate-800 shrink-0" />

            {/* Change Template Action */}
            <button
              onClick={handleCancel}
              className="px-3.5 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 text-xs font-bold transition-all inline-flex items-center gap-1.5 active:scale-95 shadow-2xs shrink-0 cursor-pointer"
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
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-y-auto">
          <div className="text-center max-w-xl mb-8">
            <div className="text-5xl mb-3">🎓</div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">Vui lòng chọn mẫu văn bằng</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Hãy chọn 1 mẫu văn bằng bên dưới để hiển thị phôi thiết kế, nạp dữ liệu nhập tay hoặc file Excel và xuất PDF / Phát hành IPFS & Blockchain.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-4xl">
            {templates.map((t) => (
              <div
                key={t.id}
                onClick={() => handleSelectTemplate(t.id)}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:border-primary dark:hover:border-primary shadow-xs flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light">
                      {t.is_default ? "Mẫu mặc định" : "Mẫu đã tạo"}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5 group-hover:text-primary transition-colors">{t.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{t.description || "Không có mô tả"}</p>
                </div>

                <button
                  className="mt-4 w-full py-2 px-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95"
                >
                  Chọn mẫu này →
                </button>
              </div>
            ))}

            {templates.length === 0 && (
              <div className="col-span-full text-center p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full">
                <p className="text-xs text-slate-500 dark:text-slate-400">Chưa có mẫu văn bằng nào. Hãy tạo mẫu trong mục <strong>Mẫu văn bằng</strong> trước.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Loaded Template Workspace */
        <div className="flex flex-1 overflow-hidden">
          {/* Dynamic Input Side Panel */}
          <div className="w-80 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-4 overflow-y-auto flex flex-col text-slate-900 dark:text-slate-100 shrink-0">
            <div className="mb-3.5 pb-2.5 border-b border-slate-100 dark:border-slate-800">
              <div className="text-[11px] font-bold text-primary mb-0.5">Mẫu: {selectedTemplate.name}</div>
              <h2 className="text-xs font-extrabold text-slate-900 dark:text-white mb-0.5">Nhập dữ liệu theo mẫu</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 m-0">
                Hiển thị <strong className="text-primary">{boundFields.length} nhãn động</strong> thuộc mẫu này.
              </p>
            </div>

            {/* Record Navigator */}
            <div className="mb-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl shadow-2xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 truncate max-w-[170px]">
                  {importedFileName ? `📁 ${importedFileName}` : "Bản ghi nhập tay"}
                  {importedFileName && (
                    <button
                      onClick={() => {
                        setRecords([{}]);
                        setActiveRowIndex(0);
                        setImportedFileName("");
                      }}
                      title="Xóa dữ liệu nạp từ file"
                      className="bg-transparent border-none text-red-500 hover:text-red-600 text-[10px] font-bold cursor-pointer ml-1.5"
                    >
                      [Xóa file]
                    </button>
                  )}
                </span>
                <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                  Dòng {activeRowIndex + 1} / {records.length}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setActiveRowIndex((i) => Math.max(0, i - 1))}
                  disabled={activeRowIndex <= 0}
                  className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer disabled:opacity-40 transition-all"
                >
                  ◄ Trước
                </button>

                <select
                  value={activeRowIndex}
                  onChange={(e) => setActiveRowIndex(Number(e.target.value))}
                  className="flex-1 px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-medium bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none cursor-pointer truncate"
                >
                  {records.map((r, i) => (
                    <option key={i} value={i} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">
                      Dòng {i + 1}: {r.student_fullName || r.student_id || `Bản ghi ${i + 1}`}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => setActiveRowIndex((i) => Math.min(records.length - 1, i + 1))}
                  disabled={activeRowIndex >= records.length - 1}
                  className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer disabled:opacity-40 transition-all"
                >
                  Sau ►
                </button>
              </div>
            </div>

            {/* Dynamic Input Form (Only for bound fields in the active template) */}
            <div className="flex-1 flex flex-col gap-3">
              {boundFields.map(({ key, label }) => {
                const isOptional = OPTIONAL_BINDINGS.includes(key);

                if (key === "student_id" && students.length > 0) {
                  return (
                    <div key={key}>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        {label} {!isOptional && <span className="text-red-500 font-bold">*</span>}
                        <span className="text-[10px] font-normal text-slate-400 dark:text-slate-500 ml-1">(Chọn hoặc Nhập tay)</span>
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
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all mb-1 cursor-pointer"
                      >
                        <option value="" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">-- Chọn sinh viên có sẵn --</option>
                        {students.map((st) => (
                          <option key={st.student_id} value={st.student_id} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">
                            {st.student_id} - {st.student_fullName}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={activeRecord[key] || ""}
                        onChange={(e) => handleUpdateActiveField(key, e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                        placeholder="Hoặc nhập mã SV mới..."
                      />
                    </div>
                  );
                }

                return (
                  <div key={key}>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {label}{" "}
                      {isOptional ? (
                        <span className="text-[10px] font-normal text-slate-400 dark:text-slate-500">(Tự động / Tùy chọn)</span>
                      ) : (
                        <span className="text-red-500 font-bold">*</span>
                      )}
                    </label>
                    <input
                      type="text"
                      value={activeRecord[key] || ""}
                      onChange={(e) => handleUpdateActiveField(key, e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                      placeholder={isOptional ? `Tùy chọn nhập ${label.toLowerCase()}...` : `Nhập ${label.toLowerCase()}...`}
                    />
                  </div>
                );
              })}

              {boundFields.length === 0 && (
                <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 rounded-xl text-xs text-amber-800 dark:text-amber-300">
                  Mẫu này chưa có trường động nào. Hãy vào mục <strong>Mẫu văn bằng</strong> để thêm các trường động (binding).
                </div>
              )}
            </div>
          </div>

          {/* Center Live Canvas Workspace */}
          <div className="flex-1 flex items-center justify-center overflow-auto p-6 bg-slate-100 dark:bg-slate-950 transition-colors">
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

      {/* Pre-upload to Blockchain Confirmation Modal */}
      {confirmingUpload && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-[9999] p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 text-slate-900 dark:text-white">
            <div className="text-center p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 space-y-2">
              <div className="mx-auto w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-base font-extrabold text-amber-800 dark:text-amber-300">
                Xác nhận phát hành lên Blockchain
              </h3>
              <p className="text-xs text-amber-700 dark:text-amber-400 font-medium leading-relaxed">
                Văn bằng sau khi được tải/phát hành lên Blockchain & IPFS sẽ <strong>KHÔNG THỂ CHỈNH SỬA Hoặc THAY ĐỔI</strong> dữ liệu.
              </p>
              <p className="text-[11px] text-amber-600 dark:text-amber-500 font-normal italic">
                &ldquo;The certificate can&apos;t be changed after uploaded to chain&rdquo;
              </p>
            </div>

            {confirmingUpload.type === "BATCH" && (
              <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
                Số lượng văn bằng phát hành: <strong className="text-primary">{confirmingUpload.count}</strong>
              </div>
            )}

            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => setConfirmingUpload(null)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-95"
              >
                Quay lại
              </button>
              <button
                type="button"
                onClick={() => {
                  const targetType = confirmingUpload.type;
                  setConfirmingUpload(null);
                  if (targetType === "SINGLE") {
                    void executeIssueSingle();
                  } else {
                    void executeIssueBatch();
                  }
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-95"
              >
                Xác nhận phát hành
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Result Modal for Direct Single / Batch Issuance */}
      {issueResult && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-[9999] p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 text-slate-900 dark:text-white">
            <div className="text-center p-6 rounded-2xl bg-primary/10 border border-primary/20 space-y-3">
              <div className="mx-auto w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-lg font-extrabold text-primary">
                {issueResult.type === "SINGLE" ? "Cấp phát văn bằng thành công!" : "Kết quả cấp phát lô văn bằng thành công!"}
              </h2>
            </div>

            <button
              onClick={() => setIssueResult(null)}
              className="w-full py-3 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-sm transition-all cursor-pointer shadow-2xs active:scale-95"
            >
              Đóng thông báo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
