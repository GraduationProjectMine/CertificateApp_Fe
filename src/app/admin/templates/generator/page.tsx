"use client";

import styles from "./page.module.css";
import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import JSZip from "jszip";
import { templateApi } from "@/features/templates/services/api";
import type { CertificateTemplate, TemplateField, DesignData } from "@/features/templates/types";
import { certificateApi, type CreateCertificatePayload } from "@/features/certificates/services/certificate.api";
import { studentApi, type StudentDto } from "@/features/students/services/student.api";
import { QRCodeSVG } from "qrcode.react";
import Button from "@/components/ui/Button";
import { useI18n } from "@/features/i18n/I18nContext";

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
  const { t } = useI18n();
  const router = typeof window !== "undefined" ? { back: () => window.history.back() } : { back: () => {} };
  const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [selectedTemplate, setSelectedTemplate] = useState<CertificateTemplate | null>(null);
  const [students, setStudents] = useState<StudentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [zoom, setZoom] = useState(0.75);

  const [records, setRecords] = useState<Array<Record<string, string>>>([{}]);
  const [activeRowIndex, setActiveRowIndex] = useState<number>(0);
  const [importedFileName, setImportedFileName] = useState<string>("");

  const [importing, setImporting] = useState(false);
  const [exportingSingle, setExportingSingle] = useState(false);
  const [exportingBatch, setExportingBatch] = useState(false);
  const [batchProgress, setBatchProgress] = useState<string>("");

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

  const activeDesign: DesignData = useMemo(() => {
    if (selectedTemplate && selectedTemplate.design_data) {
      return selectedTemplate.design_data as DesignData;
    }
    return DEFAULT_DESIGN;
  }, [selectedTemplate]);

  const getBindingLabel = useCallback((key: string) => {
    const labelMap: Record<string, string> = {
      student_id: t("admin.certificates.student_code"),
      student_fullName: t("admin.certificates.student_name"),
      certificate_title: t("admin.certificates.name"),
      organization_name: t("admin.certificates.organization"),
      organization_logo: t("admin.certificates.organization_logo"),
      dob: t("admin.certificates.dob"),
      placeOfBirth: t("admin.certificates.place_of_birth"),
      gender: t("admin.certificates.gender"),
      ethnicity: t("admin.certificates.ethnicity"),
      schoolName: t("admin.certificates.school"),
      examCohort: t("admin.certificates.exam_cohort"),
      examBoard: t("admin.certificates.exam_board"),
      issueLocation: t("admin.certificates.issue_location"),
      issueDate: t("admin.certificates.issue_date"),
      serialNumber: t("admin.certificates.serial_number"),
      registryNumber: t("admin.certificates.registry_number"),
      verification_url: t("admin.certificates.verification_url"),
    };
    return labelMap[key] || key;
  }, [t]);

  const boundFields = useMemo(() => {
    const fields = activeDesign.fields || [];
    const bound = fields.filter((f) => f.dynamic && f.binding);
    const uniqueKeys = Array.from(new Set(bound.map((f) => f.binding!)));
    if (!uniqueKeys.includes("student_id")) {
      uniqueKeys.unshift("student_id");
    }
    return uniqueKeys.map((key) => ({
      key,
      label: getBindingLabel(key),
    }));
  }, [activeDesign, getBindingLabel]);

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
        alert(t("admin.templates.invalid_file_data"));
        return;
      }
      setImportedFileName(res.fileName);
      setRecords(res.rows.map((r: any) => r.record));
      setActiveRowIndex(0);
      alert(t("admin.templates.import_success", { count: res.totalRows, fileName: res.fileName }));
    } catch (err: any) {
      alert(err.message || t("admin.templates.import_failed"));
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
      alert(err.message || t("admin.templates.pdf_export_failed"));
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

      setBatchProgress(t("admin.templates.creating_zip"));
      const content = await zip.generateAsync({ type: "blob" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(content);
      link.download = `certificates_batch_${Date.now()}.zip`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (err: any) {
      alert(err.message || t("admin.templates.zip_create_failed"));
    } finally {
      setExportingBatch(false);
      setBatchProgress("");
    }
  };

  const handleIssueSingle = async () => {
    if (!selectedTemplate) return;
    setIssuingSingle(true);
    try {
      const payload: CreateCertificatePayload = {
        student_id: activeRecord.student_id || `SV_${Date.now()}`,
        student_fullName: activeRecord.student_fullName,
        template_id: selectedTemplate.id,
        certificate_title: activeRecord.certificate_title || selectedTemplate.name || t("admin.templates.default_cert_title"),
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
      setIssueResult({ type: "SINGLE", data: cert });
    } catch (err: any) {
      alert(err.message || t("admin.templates.issue_single_failed"));
    } finally {
      setIssuingSingle(false);
    }
  };

  const handleIssueBatch = async () => {
    if (!selectedTemplate || records.length === 0) return;
    if (!confirm(t("admin.templates.confirm_batch_issue", { count: records.length }))) return;

    setIssuingBatch(true);
    try {
      const rows: CreateCertificatePayload[] = records.map((r, i) => ({
        student_id: r.student_id || `SV_${Date.now()}_${i + 1}`,
        student_fullName: r.student_fullName,
        template_id: selectedTemplate.id,
        certificate_title: r.certificate_title || selectedTemplate.name || t("admin.templates.default_cert_title"),
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

      const batchRes = await certificateApi.templateIssueBatch({ rows, template_id: selectedTemplate.id });

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

      setIssueResult({ type: "BATCH", data: batchRes });
    } catch (err: any) {
      alert(err.message || t("admin.templates.batch_issue_failed"));
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
        const label = getBindingLabel(field.binding);
        return <span style={{ opacity: 0.6 }}>{(field.label ? `${field.label} ` : "") + label}</span>;
      }
      return <span>{field.text || t("admin.templates.text_placeholder")}</span>;
    })();

    return <div style={styles}>{content}</div>;
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500 dark:text-gray-400 text-xs">{t("admin.templates.loading_templates")}</div>;
  }

  return (
    <div className={styles._root}>
      {/* Header */}
      <div className={styles._header}>
        <div className={styles._headerRow1}>
          <div className={styles._headerLeft}>
            <div className={styles._titleGroup}>
              <h1 className={styles._title}>{t("admin.templates.generator_title")}</h1>
            </div>
            <div className={styles._divider} />
            <div className={styles._selectorGroup}>
              <span className={styles._selectorLabel}>{t("admin.templates.template_label")}:</span>
              <select
                value={selectedTemplateId}
                onChange={(e) => handleSelectTemplate(e.target.value)}
                className={styles._selector}
              >
                <option value="">{t("admin.templates.select_template_placeholder")}</option>
                {templates.map((tmpl) => (
                  <option key={tmpl.id} value={tmpl.id}>
                    {tmpl.name} {tmpl.is_default ? `(${t("admin.templates.default")})` : ""}
                  </option>
                ))}
              </select>
            </div>
            {selectedTemplate && (
              <span className={styles._recordBadge}>
                {t("admin.templates.record")}: {activeRowIndex + 1} / {records.length}
                {importedFileName ? (
                  <span className={styles._fileBadge}> - {importedFileName}</span>
                ) : (
                  <span className={styles._manualHint}> ({t("admin.templates.manual_entry")})</span>
                )}
              </span>
            )}
          </div>
          {selectedTemplate && (
            <div className={styles._zoomGroup}>
              <Button onClick={() => setZoom((z) => Math.max(0.3, z - 0.1))} variant="ghost" size="sm">-</Button>
              <span className={styles._zoomLabel}>{Math.round(zoom * 100)}%</span>
              <Button onClick={() => setZoom((z) => Math.min(1.5, z + 0.1))} variant="ghost" size="sm">+</Button>
            </div>
          )}
        </div>

        {selectedTemplate && (
          <div className={styles._headerRow2}>
            <div className={styles._headerRow2Inner}>
              <label className={styles._importLabel}>
                <span>{importing ? t("admin.templates.importing") : t("admin.templates.import_csv")}</span>
                <input type="file" accept=".csv,.xlsx,.xls" onChange={handleImportFile} disabled={importing} className="hidden" />
              </label>
            </div>
            <div className={styles._actionDivider} />
            <div className={styles._headerRow2Inner}>
              <Button onClick={exportSinglePdf} disabled={exportingSingle || exportingBatch || issuingSingle || issuingBatch} variant="secondary" size="sm">
                {exportingSingle ? t("admin.templates.exporting") : t("admin.templates.export_pdf_single", { index: activeRowIndex + 1 })}
              </Button>
              <Button onClick={exportBatchZip} disabled={exportingSingle || exportingBatch || issuingSingle || issuingBatch || records.length === 0} variant="secondary" size="sm">
                {exportingBatch ? t("admin.templates.creating_zip_progress", { progress: batchProgress }) : t("admin.templates.export_zip", { count: records.length })}
              </Button>
            </div>
            <div className={styles._actionDivider} />
            <div className={styles._headerRow2Inner}>
              <Button onClick={handleIssueSingle} disabled={exportingSingle || exportingBatch || issuingSingle || issuingBatch} variant="primary" size="sm">
                {issuingSingle ? t("admin.templates.issuing") : t("admin.templates.issue_single", { index: activeRowIndex + 1 })}
              </Button>
              <Button onClick={handleIssueBatch} disabled={exportingSingle || exportingBatch || issuingSingle || issuingBatch || records.length === 0} variant="primary" size="sm">
                {issuingBatch ? t("admin.templates.issuing") : t("admin.templates.issue_all", { count: records.length })}
              </Button>
            </div>
            <div className={styles._actionDivider} />
            <Button onClick={handleCancel} variant="danger" size="sm">{t("admin.templates.change_template")}</Button>
          </div>
        )}
      </div>

      {/* Workspace */}
      {!selectedTemplate ? (
        <div className={styles._emptyState}>
          <h2 className={styles._emptyTitle}>{t("admin.templates.please_select_template")}</h2>
          <p className={styles._emptyDesc}>
            {t("admin.templates.select_template_description")}
          </p>
          <div className={styles._templateGrid}>
            {templates.map((tmpl) => (
              <div key={tmpl.id} onClick={() => handleSelectTemplate(tmpl.id)} className={styles._templateCard}>
                <div>
                  <span className={tmpl.is_default ? styles._templateDefaultBadge : styles._templateBadge}>
                    {tmpl.is_default ? t("admin.templates.default") : t("admin.templates.custom_template")}
                  </span>
                  <h3 className={styles._templateName}>{tmpl.name}</h3>
                  <p className={styles._templateDesc}>{tmpl.description || t("admin.templates.no_description")}</p>
                </div>
                <Button variant="primary" size="sm" className="w-full">{t("admin.templates.select_this")}</Button>
              </div>
            ))}
            {templates.length === 0 && (
              <div className={styles._emptyPlaceholder}>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t("admin.templates.no_templates_hint")}
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className={styles._workspace} style={{ gap: 12 }}>
          {/* Side Panel */}
          <div className={styles._sidePanel}>
            <div className={styles._sidePanelSection}>
              <div className={styles._sidePanelHeader}>
                <div className={styles._sidePanelTitle}>{selectedTemplate.name}</div>
                <div className={styles._sidePanelDesc}>{t("admin.templates.fields_count", { count: boundFields.length })}</div>
              </div>

              {/* Record Navigator */}
              <div className={styles._navRow}>
                <Button onClick={() => setActiveRowIndex((i) => Math.max(0, i - 1))} disabled={activeRowIndex <= 0} variant="secondary" size="sm">{t("admin.templates.previous")}</Button>
                <select value={activeRowIndex} onChange={(e) => setActiveRowIndex(Number(e.target.value))} className={styles._navSelect}>
                  {records.map((r, i) => (
                    <option key={i} value={i}>
                      {i + 1}: {r.student_fullName || r.student_id || t("admin.templates.record_n", { n: i + 1 })}
                    </option>
                  ))}
                </select>
                <Button onClick={() => setActiveRowIndex((i) => Math.min(records.length - 1, i + 1))} disabled={activeRowIndex >= records.length - 1} variant="secondary" size="sm">{t("admin.templates.next")}</Button>
              </div>

              {importedFileName && (
                <Button onClick={() => { setRecords([{}]); setActiveRowIndex(0); setImportedFileName(""); }} variant="ghost" size="sm" className="!text-danger">
                  {t("admin.templates.clear_imported_data")}
                </Button>
              )}
            </div>

            {/* Dynamic Input Form */}
            <div className={styles._formGroup}>
              {boundFields.map(({ key, label }) => {
                if (key === "student_id" && students.length > 0) {
                  return (
                    <div key={key}>
                      <label className={styles._formLabel}>{label}</label>
                      <select value={activeRecord[key] || ""} onChange={(e) => { const val = e.target.value; handleUpdateActiveField("student_id", val); const st = students.find((s) => s.student_id === val); if (st) { handleUpdateActiveField("student_fullName", st.student_fullName); } }} className={styles._formSelect}>
                        <option value="">{t("admin.templates.select_student_placeholder")}</option>
                        {students.map((st) => (
                          <option key={st.student_id} value={st.student_id}>{st.student_id} - {st.student_fullName}</option>
                        ))}
                      </select>
                      <input type="text" value={activeRecord[key] || ""} onChange={(e) => handleUpdateActiveField(key, e.target.value)} className={styles._formInput} placeholder={t("admin.templates.or_enter_new_id")} />
                    </div>
                  );
                }
                return (
                  <div key={key}>
                    <label className={styles._formLabel}>{label}</label>
                    <input type="text" value={activeRecord[key] || ""} onChange={(e) => handleUpdateActiveField(key, e.target.value)} className={styles._formInput} placeholder={t("admin.templates.enter_field", { field: label.toLowerCase() })} />
                  </div>
                );
              })}
              {boundFields.length === 0 && (
                <div className={styles._noFieldsNotice}>
                  {t("admin.templates.no_dynamic_fields")}
                </div>
              )}
            </div>
          </div>

          {/* Canvas */}
          <div className={styles._canvasSection}>
            <div className={styles._canvasToolbar}>
              <span className="text-xs font-bold text-gray-600 dark:text-gray-400">{t("admin.templates.canvas_title")}</span>
              <Button onClick={() => { setSelectedTemplateId(""); setSelectedTemplate(null); setRecords([{}]); setActiveRowIndex(0); setImportedFileName(""); }} variant="ghost" size="sm">{t("common.close")}</Button>
            </div>
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
                      <div key={`dec_${i}`}
                        style={{ position: "absolute", inset: dec.offset || 0, border: `${dec.width || 2}px ${dec.style || "solid"} ${dec.color || "#000"}`, borderRadius: dec.style === "double" ? 4 : 0, pointerEvents: "none" }}
                      />
                    );
                  }
                  if (dec.type === "watermark" && dec.text) {
                    return (
                      <div key={`dec_${i}`}
                        style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none", opacity: dec.opacity || 0.05, fontSize: dec.size || 60, fontFamily: dec.font || "serif", color: "#000" }}
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
        </div>
      )}

      {/* Result Modal */}
      {issueResult && (
        <div className={styles._overlay}>
          <div className={styles._modal}>
            {issueResult.type === "SINGLE" ? (
              <div className="flex flex-col gap-4">
                <div className="text-center">
                  <h2 className={styles._modalResultTitle}>{t("admin.templates.issue_single_success")}</h2>
                  <p className={styles._modalResultDesc}>{t("admin.templates.issue_single_desc")}</p>
                </div>
                <div className={styles._detailBox}>
                  <div className={styles._detailRow}>
                    <span className={styles._detailRowLabel}>{t("admin.certificates.code")} (ID):</span>
                    <code className={styles._detailRowCode}>{issueResult.data.certificate_id}</code>
                  </div>
                  <div className={styles._detailRow}>
                    <span className={styles._detailRowLabel}>{t("admin.certificates.student_name")}:</span>
                    <strong className={styles._detailRowValue}>{issueResult.data.student_fullName}</strong> ({issueResult.data.student_id})
                  </div>
                  <div className={styles._detailRow}>
                    <span className={styles._detailRowLabel}>{t("admin.certificates.name")}:</span>
                    <span className={styles._detailRowValue}>{issueResult.data.certificate_title}</span>
                  </div>
                  <div className={styles._detailRow}>
                    <span className={styles._detailRowLabel}>IPFS CID (JSON Metadata):</span>
                    <a href={issueResult.data.file_url || `https://gateway.pinata.cloud/ipfs/${issueResult.data.ipfs_cid}`} target="_blank" rel="noreferrer" className={styles._detailLink}>
                      {issueResult.data.ipfs_cid}
                    </a>
                  </div>
                  {issueResult.data.tx_hash && (
                    <div className={styles._detailRow}>
                      <span className={styles._detailRowLabel}>Blockchain Tx Hash:</span>
                      <code className={styles._txHashBox}>{issueResult.data.tx_hash}</code>
                    </div>
                  )}
                </div>
                <Button onClick={() => setIssueResult(null)} variant="primary" size="md" className="w-full">{t("common.close")}</Button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="text-center">
                  <h2 className={styles._modalResultTitle}>{t("admin.templates.batch_issue_result")}</h2>
                  <p className={styles._modalResultDesc}>
                    {t("admin.templates.batch_processed", { total: issueResult.data.total, success: issueResult.data.successCount, failed: issueResult.data.failCount })}
                  </p>
                </div>
                <div className={styles._resultTableScroll}>
                  <table className={styles._batchTable}>
                    <thead><tr className={styles._batchThead}><th className={styles._batchTh}>#</th><th className={styles._batchTh}>{t("admin.certificates.student_name")}</th><th className={styles._batchTh}>{t("common.status")}</th><th className={styles._batchTh}>IPFS CID</th></tr></thead>
                    <tbody>
                      {issueResult.data.results.map((r: any) => (
                        <tr key={r.index} className={styles._batchTr}>
                          <td className={styles._batchTd}>{r.index}</td>
                          <td className={styles._batchTd} style={{ fontWeight: 600 }}>{r.student_fullName}</td>
                          <td className={styles._batchTd}>
                            {r.status === "SUCCESS" ? <span className={styles._batchSuccess}>{t("common.success")}</span> : <span className={styles._batchFail}>{t("common.failed")}</span>}
                          </td>
                          <td className={styles._batchTd}>
                            {r.status === "SUCCESS" ? <a href={r.file_url || `https://gateway.pinata.cloud/ipfs/${r.cid}`} target="_blank" rel="noreferrer" className={styles._batchLink}>{r.cid?.slice(0, 16)}...</a> : <span className={styles._batchError}>{r.error}</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Button onClick={() => setIssueResult(null)} variant="primary" size="md" className="w-full">{t("common.close")}</Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
