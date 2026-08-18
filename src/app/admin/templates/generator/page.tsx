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
import toast from "react-hot-toast";

import { useAuth } from "@/features/auth/components/AuthContext";
import { useI18n } from "@/features/i18n/I18nContext";

function getBindingLabels(t: ReturnType<typeof useI18n>["t"]): Record<string, string> {
  return {
    student_id: t("adminTemplateGenerator.bindingStudentId"),
    student_fullName: t("adminTemplateGenerator.bindingStudentFullName"),
    certificate_title: t("adminTemplateGenerator.bindingCertificateTitle"),
    organization_name: t("adminTemplateGenerator.bindingOrganizationName"),
    organization_logo: t("adminTemplateGenerator.bindingOrganizationLogo"),
    dob: t("adminTemplateGenerator.bindingDob"),
    placeOfBirth: t("adminTemplateGenerator.bindingPlaceOfBirth"),
    gender: t("adminTemplateGenerator.bindingGender"),
    ethnicity: t("adminTemplateGenerator.bindingEthnicity"),
    schoolName: t("adminTemplateGenerator.bindingSchoolName"),
    examCohort: t("adminTemplateGenerator.bindingExamCohort"),
    examBoard: t("adminTemplateGenerator.bindingExamBoard"),
    issueLocation: t("adminTemplateGenerator.bindingIssueLocation"),
    issueDate: t("adminTemplateGenerator.bindingIssueDate"),
    serialNumber: t("adminTemplateGenerator.bindingSerialNumber"),
    registryNumber: t("adminTemplateGenerator.bindingRegistryNumber"),
    verification_url: t("adminTemplateGenerator.bindingVerificationUrl"),
  };
}

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

const OPTIONAL_BINDINGS = ["verification_url", "organization_logo"];

export default function CertificateGeneratorPage() {
  const { user } = useAuth();
  const { t } = useI18n();
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
  const bindingLabels = useMemo(() => getBindingLabels(t), [t]);
  const boundFields = useMemo(() => {
    const fields = activeDesign.fields || [];
    const bound = fields.filter((f) => f.dynamic && f.binding);
    const uniqueKeys = Array.from(new Set(bound.map((f) => f.binding!)));
    if (!uniqueKeys.includes("student_id")) {
      uniqueKeys.unshift("student_id");
    }
    return uniqueKeys.map((key) => ({
      key,
      label: bindingLabels[key] || key,
    }));
  }, [activeDesign, bindingLabels]);

  const activeRecord = useMemo(() => {
    return records[activeRowIndex] || {};
  }, [records, activeRowIndex]);

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
        toast.error(t("adminTemplateGenerator.fileNoData"));
        return;
      }
      setImportedFileName(res.fileName);
      setRecords(res.rows.map((r) => r.record));
      setActiveRowIndex(0);
      toast.success(`${t("adminTemplateGenerator.importSuccessPrefix")} ${res.totalRows} ${t("adminTemplateGenerator.recordUnit")} ${t("adminTemplateGenerator.importFromFile")} ${res.fileName}`);
    } catch (err: any) {
      toast.error(err.message || t("adminTemplateGenerator.error.import"));
    } finally {
      setImporting(false);
      e.target.value = "";
    }
  };

  const exportSinglePdf = async () => {
    if (!canvasRef.current) return;
    const check = validateRecord(activeRecord);
    if (!check.valid) {
      toast.error(t("adminTemplateGenerator.exportPdfMissing").replace("{field}", check.missingLabel || ""));
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
      toast.success(t("adminTemplateGenerator.exportSingleSuccess"));
    } catch (err: any) {
      toast.error(err.message || t("adminTemplateGenerator.error.exportPdf"));
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
        const rowCheck = validateRecord(records[i]);
        if (!rowCheck.valid) {
          toast.error(t("adminTemplateGenerator.batchExportMissing").replace("{row}", String(i + 1)).replace("{field}", rowCheck.missingLabel || ""));
          setActiveRowIndex(i);
          return;
        }
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

      setBatchProgress(t("adminTemplateGenerator.creatingZip"));
      const content = await zip.generateAsync({ type: "blob" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(content);
      link.download = `certificates_batch_${Date.now()}.zip`;
      link.click();
      URL.revokeObjectURL(link.href);
      toast.success(t("adminTemplateGenerator.exportZipSuccess").replace("{count}", String(records.length)));
    } catch (err: any) {
      toast.error(err.message || t("adminTemplateGenerator.error.createZip"));
    } finally {
      setExportingBatch(false);
      setBatchProgress("");
    }
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
      toast.success(t("adminTemplateGenerator.issueSingleSuccess"));
    } catch (err: any) {
      toast.error(err.message || t("adminTemplateGenerator.error.issueSingle"));
    } finally {
      setIssuingSingle(false);
    }
  };

  // Request confirmation before issuing single certificate
  const requestIssueSingle = () => {
    if (!selectedTemplate) return;
    const check = validateRecord(activeRecord);
    if (!check.valid) {
      toast.error(t("adminTemplateGenerator.issueSingleMissing").replace("{field}", check.missingLabel || ""));
      return;
    }
    setConfirmingUpload({ type: "SINGLE", count: 1 });
  };

  // Request confirmation before issuing batch certificates
  const requestIssueBatch = () => {
    if (!selectedTemplate || records.length === 0) return;
    for (let i = 0; i < records.length; i++) {
      const check = validateRecord(records[i]);
      if (!check.valid) {
        toast.error(t("adminTemplateGenerator.batchIssueMissing").replace("{row}", String(i + 1)).replace("{field}", check.missingLabel || ""));
        setActiveRowIndex(i);
        return;
      }
    }
    setConfirmingUpload({ type: "BATCH", count: records.length });
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
      toast.success(t("adminTemplateGenerator.issueBatchSuccess"));
    } catch (err: any) {
      toast.error(err.message || t("adminTemplateGenerator.error.issueBatch"));
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
              alt={field.label || t("adminTemplateGenerator.logoAlt")}
              style={{ width: "100%", height: "100%", objectFit: "contain", pointerEvents: "none" }}
            />
          );
        }
        return (
          <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: "1px dashed #cbd5e1", background: "#f8fafc", color: "#64748b", fontSize: 11 }}>
            <span style={{ fontSize: 18 }}>🖼</span>
            <span>{field.label || t("adminTemplateGenerator.logoLabel")}</span>
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
        const label = bindingLabels[field.binding] || field.binding;
        return <span style={{ opacity: 0.6 }}>{(field.label ? `${field.label} ` : "") + label}</span>;
      }
      return <span>{field.text || t("adminTemplateGenerator.textDefault")}</span>;
    })();

    return <div style={styles}>{content}</div>;
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500 text-xs">{t("adminTemplateGenerator.loading")}</div>;
  }

  if (user?.role === "staff") {
    return (
      <div className="p-8 text-center text-xs font-semibold text-slate-500 dark:text-slate-400">
        {t("adminTemplateGenerator.staffAccessDenied")}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 64px)", background: "var(--page-bg)", fontFamily: "sans-serif", color: "var(--text-main)", transition: "background 0.3s, color 0.3s" }}>
      {/* Header Toolbar - 2-Row Layout */}
      <div className="flex flex-col bg-white dark:bg-gray-900 border-b border-slate-200 dark:border-slate-800 shadow-2xs shrink-0 transition-colors">
        {/* Row 1: Title, Template Selector, Record Badge & Zoom Controls */}
        <div className="flex items-center justify-between px-6 py-2.5 border-b border-slate-100 dark:border-slate-800 overflow-x-auto whitespace-nowrap gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xl">🎓</span>
              <h1 className="text-base font-extrabold text-slate-900 dark:text-white m-0 whitespace-nowrap">{t("adminTemplateGenerator.title")}</h1>
            </div>

            <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-700 shrink-0" />

            {/* Template Selector Dropdown */}
            <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 shadow-2xs shrink-0">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap">{t("adminTemplateGenerator.selectTemplateLabel")}</span>
              <select
                value={selectedTemplateId}
                onChange={(e) => handleSelectTemplate(e.target.value)}
                className="text-slate-800 dark:text-slate-100 text-xs font-semibold focus:outline-none cursor-pointer pr-1 whitespace-nowrap"
                style={{ background: "var(--surface)", color: "var(--text-main)" }}
              >
                <option value="" style={{ background: "var(--surface)", color: "var(--text-main)" }}>{t("adminTemplateGenerator.selectTemplatePlaceholder")}</option>
                {templates.map((tpl) => (
                  <option key={tpl.id} value={tpl.id} style={{ background: "var(--surface)", color: "var(--text-main)" }}>
                    {tpl.name} {tpl.is_default ? t("adminTemplateGenerator.defaultSuffix") : ""}
                  </option>
                ))}
              </select>
            </div>

            {selectedTemplate && (
              <>
                <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-700 shrink-0" />
                {/* Record Status Badge in Top Bar */}
                <div className="flex items-center gap-2 text-xs shrink-0">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-blue-800 dark:text-blue-300 font-bold shadow-2xs whitespace-nowrap">
                    📄 {t("adminTemplateGenerator.recordBadge")}: <strong className="text-blue-600 dark:text-blue-400">{activeRowIndex + 1}</strong> / {records.length}
                  </span>
                  {importedFileName ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-semibold whitespace-nowrap">
                      📁 {importedFileName}
                    </span>
                  ) : (
                    <span className="text-slate-400 dark:text-slate-500 font-normal text-[11px] whitespace-nowrap">{t("adminTemplateGenerator.manualDataSuffix")}</span>
                  )}
                </div>
              </>
            )}
          </div>

          {selectedTemplate && (
            /* Zoom Controls */
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-1 shadow-2xs shrink-0">
              <button onClick={() => setZoom((z) => Math.max(0.3, z - 0.1))} className="px-2 py-0.5 text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-bold transition-colors" title={t("adminTemplateGenerator.zoomOutTitle")}>−</button>
              <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 min-w-[36px] text-center">{Math.round(zoom * 100)}%</span>
              <button onClick={() => setZoom((z) => Math.min(1.5, z + 0.1))} className="px-2 py-0.5 text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-bold transition-colors" title={t("adminTemplateGenerator.zoomInTitle")}>+</button>
            </div>
          )}
        </div>

        {/* Row 2: Pure Action Bar for Import, Export & Blockchain Issue (Evenly Spread) */}
        {selectedTemplate && (
          <div className="flex items-center justify-between px-8 py-2.5 bg-slate-50/90 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 overflow-x-auto whitespace-nowrap gap-4">
            {/* Group 1: Import Data */}
            <label className="px-3.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold cursor-pointer inline-flex items-center gap-1.5 shadow-2xs transition-all active:scale-95 shrink-0">
              <span>📥</span>
              <span>{importing ? t("adminTemplateGenerator.importing") : t("adminTemplateGenerator.importCsv")}</span>
              <input type="file" accept=".csv,.xlsx,.xls" onChange={handleImportFile} disabled={importing} className="hidden" />
            </label>

            <div className="h-4 w-[1px] bg-slate-300/80 dark:bg-slate-600/80 shrink-0" />

            {/* Group 2: PDF Export Group */}
            <div className="flex items-center gap-1.5 bg-sky-50 dark:bg-sky-950/30 border border-sky-200/80 dark:border-sky-900/60 p-1 rounded-xl shadow-2xs shrink-0">
              <button
                onClick={exportSinglePdf}
                disabled={exportingSingle || exportingBatch || issuingSingle || issuingBatch}
                className="px-3 py-1 text-xs font-bold text-sky-700 dark:text-sky-300 bg-white dark:bg-slate-800 hover:bg-sky-100/80 dark:hover:bg-sky-950/40 border border-sky-200/70 dark:border-sky-900/60 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs transition-all inline-flex items-center gap-1.5 active:scale-95 shrink-0"
                title={t("adminTemplateGenerator.exportPdfTitle")}
              >
                <span>📄</span>
                <span>{exportingSingle ? t("adminTemplateGenerator.exportingPdf") : t("adminTemplateGenerator.exportPdf")}</span>
              </button>
              <button
                onClick={exportBatchZip}
                disabled={exportingSingle || exportingBatch || issuingSingle || issuingBatch || records.length === 0}
                className="px-3 py-1 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs transition-all inline-flex items-center gap-1.5 active:scale-95 shrink-0"
                title={t("adminTemplateGenerator.exportZipTitle")}
              >
                <span>📦</span>
                <span>{exportingBatch ? `${t("adminTemplateGenerator.creatingZipProgress")} (${batchProgress})...` : `${t("adminTemplateGenerator.exportZipAll")} (${records.length})`}</span>
              </button>
            </div>

            <div className="h-4 w-[1px] bg-slate-300/80 dark:bg-slate-600/80 shrink-0" />

            {/* Group 3: Blockchain Issue Group */}
            <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/60 p-1 rounded-xl shadow-2xs shrink-0">
              <button
                onClick={requestIssueSingle}
                disabled={exportingSingle || exportingBatch || issuingSingle || issuingBatch}
                className="px-3 py-1 text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-white dark:bg-slate-800 hover:bg-emerald-100/80 dark:hover:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-900/60 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs transition-all inline-flex items-center gap-1.5 active:scale-95 shrink-0"
                title={t("adminTemplateGenerator.issueSingleTitle")}
              >
                <span>🚀</span>
                <span>{issuingSingle ? t("adminTemplateGenerator.issuing") : t("adminTemplateGenerator.issueSingle")}</span>
              </button>
              <button
                onClick={requestIssueBatch}
                disabled={exportingSingle || exportingBatch || issuingSingle || issuingBatch || records.length === 0}
                className="px-3 py-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs transition-all inline-flex items-center gap-1.5 active:scale-95 shrink-0"
                title={t("adminTemplateGenerator.issueBatchTitle")}
              >
                <span>🚀</span>
                <span>{issuingBatch ? t("adminTemplateGenerator.issuing") : `${t("adminTemplateGenerator.issueBatch")} (${records.length})`}</span>
              </button>
            </div>

            <div className="h-4 w-[1px] bg-slate-300/80 dark:bg-slate-600/80 shrink-0" />

            {/* Change Template Action */}
            <button
              onClick={handleCancel}
              className="px-3.5 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-950/50 text-rose-600 dark:text-rose-400 text-xs font-bold transition-all inline-flex items-center gap-1.5 active:scale-95 shadow-2xs shrink-0"
            >
              <span>✕</span>
              <span>{t("adminTemplateGenerator.changeTemplate")}</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Content Workspace */}
      {!selectedTemplate ? (
        /* Empty / Initial Template Selection Screen */
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32, background: "var(--page-bg-subtle)" }}>
          <div style={{ textAlign: "center", maxWidth: 600, marginBottom: 32 }}>
            <div style={{ fontSize: 52, marginBottom: 12 }}>🎓</div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-main)", marginBottom: 8 }}>{t("adminTemplateGenerator.selectTemplateTitle")}</h2>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0 }}>
              {t("adminTemplateGenerator.selectTemplateDescription")}
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, width: "100%", maxWidth: 800 }}>
            {templates.map((tpl) => (
              <div
                key={tpl.id}
                onClick={() => handleSelectTemplate(tpl.id)}
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
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
                  e.currentTarget.style.borderColor = "#147D74";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.transform = "none";
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 12, background: "#e6f2f1", color: "#147D74" }}>
                      {tpl.is_default ? t("adminTemplateGenerator.defaultTemplateBadge") : t("adminTemplateGenerator.createdTemplateBadge")}
                    </span>
                  </div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-body)", margin: "0 0 6px 0" }}>{tpl.name}</h3>
                  <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0 }}>{tpl.description || t("adminTemplateGenerator.noDescription")}</p>
                </div>

                <button
                  style={{
                    marginTop: 16,
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: 8,
                    background: "#147D74",
                    color: "#fff",
                    border: "none",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "#0f635c"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "#147D74"; }}
                >
                  {t("adminTemplateGenerator.selectThisTemplate")}
                </button>
              </div>
            ))}

            {templates.length === 0 && (
              <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: 32, background: "var(--surface)", borderRadius: 16, border: "1px solid var(--border)", width: "100%" }}>
                <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>{t("adminTemplateGenerator.noTemplatesPrefix")} <strong>{t("adminTemplateGenerator.templateMenuLabel")}</strong> {t("adminTemplateGenerator.noTemplatesSuffix")}</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Loaded Template Workspace */
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          {/* Dynamic Input Side Panel */}
          <div style={{ width: 340, background: "var(--surface)", borderRight: "1px solid var(--border)", padding: 16, overflowY: "auto", display: "flex", flexDirection: "column" }}>
            <div style={{ marginBottom: 14, paddingBottom: 10, borderBottom: "1px solid var(--border-subtle)" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#147D74", marginBottom: 2 }}>{t("adminTemplateGenerator.templatePrefix")} {selectedTemplate.name}</div>
              <h2 style={{ fontSize: 13, fontWeight: 800, color: "var(--text-main)", marginBottom: 2 }}>{t("adminTemplateGenerator.inputDataTitle")}</h2>
              <p style={{ fontSize: 11, color: "var(--text-secondary)", margin: 0 }}>
                {t("adminTemplateGenerator.dynamicLabelsPrefix")} <strong style={{ color: "#147D74" }}>{boundFields.length} {t("adminTemplateGenerator.dynamicLabelsUnit")}</strong> {t("adminTemplateGenerator.dynamicLabelsSuffix")}
              </p>
            </div>

            {/* Record Navigator */}
            <div style={{ marginBottom: 16, background: "var(--surface-subtle)", border: "1px solid var(--border)", padding: 10, borderRadius: 10 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-body)" }}>
                  {importedFileName ? `📁 ${importedFileName}` : t("adminTemplateGenerator.manualRecordLabel")}
                  {importedFileName && (
                    <button
                      onClick={() => {
                        setRecords([{}]);
                        setActiveRowIndex(0);
                        setImportedFileName("");
                      }}
                      title={t("adminTemplateGenerator.deleteFileDataTitle")}
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
                      {t("adminTemplateGenerator.deleteFileLabel")}
                    </button>
                  )}
                </span>
                <span style={{ fontSize: 10, fontWeight: 600, color: "var(--text-secondary)" }}>
                  {t("adminTemplateGenerator.rowLabel")} {activeRowIndex + 1} / {records.length}
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <button
                  onClick={() => setActiveRowIndex((i) => Math.max(0, i - 1))}
                  disabled={activeRowIndex <= 0}
                  style={{ padding: "4px 10px", borderRadius: 6, border: "1px solid var(--border-strong)", background: "var(--surface)", color: "var(--text-main)", fontSize: 11, fontWeight: 600, cursor: "pointer", opacity: activeRowIndex <= 0 ? 0.4 : 1 }}
                >
                  {t("adminTemplateGenerator.prev")}
                </button>

                <select
                  value={activeRowIndex}
                  onChange={(e) => setActiveRowIndex(Number(e.target.value))}
                  style={{ flex: 1, padding: "5px 8px", borderRadius: 6, border: "1px solid var(--border-strong)", fontSize: 11, background: "var(--surface)", color: "var(--text-main)", fontWeight: 500 }}
                >
                  {records.map((r, i) => (
                    <option key={i} value={i} style={{ background: "var(--surface)", color: "var(--text-main)" }}>
                      {t("adminTemplateGenerator.rowLabel")} {i + 1}: {r.student_fullName || r.student_id || `${t("adminTemplateGenerator.recordLabel")} ${i + 1}`}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => setActiveRowIndex((i) => Math.min(records.length - 1, i + 1))}
                  disabled={activeRowIndex >= records.length - 1}
                  style={{ padding: "4px 10px", borderRadius: 6, border: "1px solid var(--border-strong)", background: "var(--surface)", color: "var(--text-main)", fontSize: 11, fontWeight: 600, cursor: "pointer", opacity: activeRowIndex >= records.length - 1 ? 0.4 : 1 }}
                >
                  {t("adminTemplateGenerator.next")}
                </button>
              </div>
            </div>

            {/* Dynamic Input Form (Only for bound fields in the active template) */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
              {boundFields.map(({ key, label }) => {
                if (key === "student_id" && students.length > 0) {
                  return (
                    <div key={key}>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-faint)", marginBottom: 4 }}>
                        {label}{!OPTIONAL_BINDINGS.includes(key) && <span style={{ color: "#ef4444" }}> *</span>} {t("adminTemplateGenerator.selectOrManualSuffix")}
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
                        style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid var(--border-strong)", fontSize: 12, background: "var(--surface)", color: "var(--text-main)", outline: "none", boxSizing: "border-box", marginBottom: 4 }}
                      >
                        <option value="" style={{ background: "var(--surface)", color: "var(--text-main)" }}>{t("adminTemplateGenerator.selectExistingStudent")}</option>
                        {students.map((st) => (
                          <option key={st.student_id} value={st.student_id} style={{ background: "var(--surface)", color: "var(--text-main)" }}>
                            {st.student_id} - {st.student_fullName}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={activeRecord[key] || ""}
                        onChange={(e) => handleUpdateActiveField(key, e.target.value)}
                        style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid var(--border-strong)", fontSize: 12, background: "var(--surface)", color: "var(--text-main)", outline: "none", boxSizing: "border-box" }}
                        placeholder={t("adminTemplateGenerator.enterNewStudentId")}
                      />
                    </div>
                  );
                }

                return (
                  <div key={key}>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-faint)", marginBottom: 4 }}>
                      {label}{!OPTIONAL_BINDINGS.includes(key) && <span style={{ color: "#ef4444" }}> *</span>}
                      {OPTIONAL_BINDINGS.includes(key) && <span style={{ color: "var(--text-faint)", fontWeight: 400 }}> {t("adminTemplateGenerator.optionalSuffix")}</span>}
                    </label>
                    <input
                      type="text"
                      value={activeRecord[key] || ""}
                      onChange={(e) => handleUpdateActiveField(key, e.target.value)}
                      style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid var(--border-strong)", fontSize: 12, background: "var(--surface)", color: "var(--text-main)", outline: "none", boxSizing: "border-box" }}
                      placeholder={OPTIONAL_BINDINGS.includes(key) ? t("adminTemplateGenerator.placeholderOptional").replace("{label}", label.toLowerCase()) : `${t("adminTemplateGenerator.enterPrefix")} ${label.toLowerCase()}...`}
                    />
                  </div>
                );
              })}

              {boundFields.length === 0 && (
                <div style={{ padding: 16, background: "var(--warning-bg)", border: "1px solid var(--warning-border)", borderRadius: 8, fontSize: 11, color: "var(--warning-text)" }}>
                  {t("adminTemplateGenerator.noDynamicFieldsPrefix")} <strong>{t("adminTemplateGenerator.templateMenuLabel")}</strong> {t("adminTemplateGenerator.noDynamicFieldsSuffix")}
                </div>
              )}
            </div>
          </div>

          {/* Center Live Canvas Workspace */}
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", overflow: "auto", padding: 24, background: "var(--page-bg)" }}>
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

      {/* Confirmation Modal before Blockchain Issuance */}
      {confirmingUpload && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 16 }}>
          <div style={{ background: "var(--surface)", borderRadius: 20, maxWidth: 440, width: "100%", padding: 24, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }}>
            <div style={{ textAlign: "center", padding: "24px 20px", borderRadius: 16, background: "rgba(245, 158, 11, 0.08)", border: "1px solid #fcd34d", marginBottom: 20 }}>
              <div style={{ margin: "0 auto 12px", width: 56, height: 56, borderRadius: "50%", background: "rgba(245, 158, 11, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#d97706" }}>
                <svg style={{ width: 28, height: 28 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 style={{ fontSize: 16, fontWeight: 900, color: "#b45309", margin: "0 0 8px 0" }}>{t("adminTemplateGenerator.confirmTitle")}</h2>
              <p style={{ fontSize: 12, color: "#92400e", margin: 0, lineHeight: 1.6 }}>
                {t("adminTemplateGenerator.confirmBody")}
              </p>
              <p style={{ fontSize: 11, color: "#a16207", fontStyle: "italic", margin: "8px 0 0 0" }}>
                {t("adminTemplateGenerator.confirmBodyEn")}
              </p>
            </div>

            {confirmingUpload.type === "BATCH" && (
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", background: "var(--surface-subtle)", padding: "10px 16px", borderRadius: 12, border: "1px solid var(--border)", textAlign: "center", marginBottom: 16 }}>
                {t("adminTemplateGenerator.confirmBatchCount").replace("{count}", String(confirmingUpload.count))}
              </div>
            )}

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button
                onClick={() => setConfirmingUpload(null)}
                style={{ flex: 1, padding: "12px", borderRadius: 12, border: "1px solid var(--border-strong)", background: "var(--surface)", color: "var(--text-main)", fontWeight: 700, fontSize: 13, cursor: "pointer", transition: "background 0.2s" }}
              >
                {t("adminTemplateGenerator.confirmBack")}
              </button>
              <button
                onClick={() => {
                  const targetType = confirmingUpload.type;
                  setConfirmingUpload(null);
                  if (targetType === "SINGLE") {
                    void executeIssueSingle();
                  } else {
                    void executeIssueBatch();
                  }
                }}
                style={{ flex: 1, padding: "12px", borderRadius: 12, background: "#059669", color: "#fff", border: "none", fontWeight: 700, fontSize: 13, cursor: "pointer", transition: "background 0.2s" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#047857"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "#059669"; }}
              >
                {t("adminTemplateGenerator.confirmSubmit")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Result Modal for Direct Single / Batch Issuance */}
      {issueResult && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 16 }}>
          <div style={{ background: "var(--surface)", borderRadius: 20, maxWidth: 440, width: "100%", padding: 24, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }}>
            <div style={{ textAlign: "center", padding: "28px 20px", borderRadius: 16, background: "rgba(20, 125, 116, 0.08)", border: "1px solid #b2d8d5", marginBottom: 20 }}>
              <div style={{ margin: "0 auto 12px", width: 56, height: 56, borderRadius: "50%", background: "rgba(20, 125, 116, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#147D74" }}>
                <svg style={{ width: 28, height: 28 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 900, color: "#147D74", margin: 0 }}>
                {issueResult.type === "SINGLE" ? t("adminTemplateGenerator.issueSuccessSingle") : t("adminTemplateGenerator.issueSuccessBatch")}
              </h2>
            </div>

            <button
              onClick={() => setIssueResult(null)}
              style={{ width: "100%", padding: "12px", borderRadius: 12, background: "#147D74", color: "#fff", border: "none", fontWeight: 700, fontSize: 14, cursor: "pointer", transition: "background 0.2s" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#0f635c"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#147D74"; }}
            >
              {t("adminTemplateGenerator.closeNotification")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
