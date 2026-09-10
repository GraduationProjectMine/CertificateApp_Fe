"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import Link from "next/link";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import JSZip from "jszip";
import { templateApi } from "@/features/templates/services/api";
import type { CertificateTemplate, TemplateField, DesignData } from "@/features/templates/types";
import { certificateApi, type CreateCertificatePayload } from "@/features/certificates/services/certificate.api";
import { studentApi, type StudentDto } from "@/features/students/services/student.api";
import { issuerApi } from "@/features/issuer/services/issuer.api";
import { verifierApi } from "@/features/verification/services/verifier.api";
import StudentSearch from "@/components/common/StudentSearch/StudentSearch";
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
    { id: "fld_logo", type: "image", x: 670, y: 35, w: 75, h: 75, dynamic: true, binding: "organization_logo" },
    { id: "fld_title", type: "text", x: 150, y: 40, w: 500, h: 35, font: "serif", size: 18, color: "#c9a84c", align: "center", text: "BẰNG TỐT NGHIỆP" },
    { id: "fld_name", type: "text", x: 150, y: 90, w: 500, h: 45, font: "serif", size: 28, color: "#1a1a1a", align: "center", dynamic: true, binding: "student_fullName", bold: true },
    { id: "fld_dob", type: "text", x: 80, y: 155, w: 300, h: 22, font: "sans-serif", size: 11, color: "#333333", align: "left", dynamic: true, binding: "dob", label: "Ngày sinh:" },
    { id: "fld_pob", type: "text", x: 420, y: 155, w: 300, h: 22, font: "sans-serif", size: 11, color: "#333333", align: "left", dynamic: true, binding: "placeOfBirth", label: "Nơi sinh:" },
    { id: "fld_gender", type: "text", x: 80, y: 195, w: 300, h: 22, font: "sans-serif", size: 11, color: "#333333", align: "left", dynamic: true, binding: "gender", label: "Giới tính:" },
    { id: "fld_ethnicity", type: "text", x: 420, y: 195, w: 300, h: 22, font: "sans-serif", size: 11, color: "#333333", align: "left", dynamic: true, binding: "ethnicity", label: "Dân tộc:" },
    { id: "fld_school", type: "text", x: 80, y: 235, w: 640, h: 22, font: "sans-serif", size: 11, color: "#333333", align: "left", dynamic: true, binding: "schoolName", label: "Trường đào tạo:" },
    { id: "fld_cohort", type: "text", x: 80, y: 275, w: 300, h: 22, font: "sans-serif", size: 11, color: "#333333", align: "left", dynamic: true, binding: "examCohort", label: "Khóa thi:" },
    { id: "fld_board", type: "text", x: 420, y: 275, w: 300, h: 22, font: "sans-serif", size: 11, color: "#333333", align: "left", dynamic: true, binding: "examBoard", label: "Hội đồng:" },
    { id: "fld_loc", type: "text", x: 80, y: 315, w: 300, h: 22, font: "sans-serif", size: 11, color: "#333333", align: "left", dynamic: true, binding: "issueLocation", label: "Nơi cấp:" },
    { id: "fld_date", type: "text", x: 420, y: 315, w: 300, h: 22, font: "sans-serif", size: 11, color: "#333333", align: "left", dynamic: true, binding: "issueDate", label: "Ngày cấp:" },
    { id: "fld_serial", type: "text", x: 80, y: 520, w: 260, h: 20, font: "sans-serif", size: 10, color: "#888888", align: "left", dynamic: true, binding: "serialNumber", label: "Số hiệu:" },
    { id: "fld_registry", type: "text", x: 360, y: 520, w: 260, h: 20, font: "sans-serif", size: 10, color: "#888888", align: "left", dynamic: true, binding: "registryNumber", label: "Số vào sổ:" },
    { id: "fld_qr", type: "qr", x: 670, y: 470, w: 75, h: 75, dynamic: true, binding: "verification_url" },
  ],
  decorations: [{ type: "border", style: "double", color: "#c9a84c", width: 4 }],
};

const REQUIRED_TEMPLATE_BINDINGS = [
  "student_fullName",
  "dob",
  "placeOfBirth",
  "gender",
  "ethnicity",
  "schoolName",
  "examCohort",
  "examBoard",
  "issueLocation",
  "issueDate",
  "serialNumber",
  "registryNumber",
];

const OPTIONAL_BINDINGS = ["verification_url", "organization_logo"];

function formatToDdMmYyyy(dateStr: string): string {
  if (!dateStr) return "";
  const cleaned = dateStr.trim();
  if (/^\d{4}[-/]\d{1,2}[-/]\d{1,2}$/.test(cleaned)) {
    const [y, m, d] = cleaned.split(/[-/]/);
    return `${d.padStart(2, "0")}/${m.padStart(2, "0")}/${y}`;
  }
  if (/^\d{1,2}[-/]\d{1,2}[-/]\d{4}$/.test(cleaned)) {
    const [d, m, y] = cleaned.split(/[-/]/);
    return `${d.padStart(2, "0")}/${m.padStart(2, "0")}/${y}`;
  }
  return cleaned;
}

function isValidDdMmYyyy(dateStr: string): boolean {
  if (!dateStr || typeof dateStr !== "string") return false;
  const match = dateStr.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return false;

  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const year = parseInt(match[3], 10);

  if (year < 1900 || year > 2100) return false;
  if (month < 1 || month > 12) return false;

  const daysInMonth = new Date(year, month, 0).getDate();
  if (day < 1 || day > daysInMonth) return false;

  return true;
}

function parseDateParts(dmy: string): { day: number; month: number; year: number } | null {
  if (!dmy) return null;
  const match = dmy.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return null;
  const d = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  const y = parseInt(match[3], 10);
  return { day: d, month: m, year: y };
}

function DateField({
  value,
  onChange,
  placeholder,
  required,
  label,
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  required?: boolean;
  label?: string;
}) {
  const { t } = useI18n();
  const [showCalendar, setShowCalendar] = useState(false);
  const parsed = parseDateParts(value);
  const now = new Date();

  const [viewYear, setViewYear] = useState(parsed?.year || now.getFullYear());
  const [viewMonth, setViewMonth] = useState(parsed?.month || (now.getMonth() + 1));

  const handleOpenCalendar = () => {
    const p = parseDateParts(value);
    if (p) {
      setViewYear(p.year);
      setViewMonth(p.month);
    } else {
      setViewYear(now.getFullYear());
      setViewMonth(now.getMonth() + 1);
    }
    setShowCalendar(true);
  };

  const handleTextChange = (raw: string) => {
    let val = raw.replace(/[^\d/]/g, "");
    const digits = val.replace(/\//g, "");
    if (digits.length > 8) return;
    if (!raw.includes("/") && digits.length >= 2) {
      if (digits.length <= 2) {
        val = digits;
      } else if (digits.length <= 4) {
        val = `${digits.slice(0, 2)}/${digits.slice(2)}`;
      } else {
        val = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
      }
    }
    onChange(val.slice(0, 10));
  };

  const handleSelectDay = (day: number) => {
    const formatted = `${String(day).padStart(2, "0")}/${String(viewMonth).padStart(2, "0")}/${viewYear}`;
    onChange(formatted);
    setShowCalendar(false);
  };

  const handleSelectToday = () => {
    const today = new Date();
    const formatted = `${String(today.getDate()).padStart(2, "0")}/${String(today.getMonth() + 1).padStart(2, "0")}/${today.getFullYear()}`;
    onChange(formatted);
    setShowCalendar(false);
  };

  const prevMonth = () => {
    if (viewMonth === 1) {
      setViewMonth(12);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 12) {
      setViewMonth(1);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const daysInMonth = new Date(viewYear, viewMonth, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth - 1, 1).getDay();
  const startOffset = (firstDayOfWeek + 6) % 7;

  const yearsList = [];
  const currentYear = new Date().getFullYear();
  for (let y = currentYear + 5; y >= 1950; y--) {
    yearsList.push(y);
  }

  const rawMonths = t("adminCertificateIssue.calendar.months");
  const monthNames = Array.isArray(rawMonths) ? rawMonths : [
    "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
    "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
  ];

  const rawDays = t("adminCertificateIssue.calendar.days");
  const dayNames = Array.isArray(rawDays) ? rawDays : ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

  return (
    <div style={{ position: "relative", display: "flex", alignItems: "center", width: "100%" }}>
      <input
        type="text"
        required={required}
        value={value}
        onChange={(e) => handleTextChange(e.target.value)}
        placeholder={placeholder || "dd/mm/yyyy"}
        maxLength={10}
        style={{
          width: "100%",
          padding: "8px 36px 8px 10px",
          borderRadius: 8,
          border: "1px solid var(--border-strong)",
          fontSize: 12,
          background: "var(--surface)",
          color: "var(--text-main)",
          outline: "none",
          boxSizing: "border-box",
        }}
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={handleOpenCalendar}
        title={t("adminCertificateIssue.calendar.selectDate")}
        style={{
          position: "absolute",
          right: 8,
          top: "50%",
          transform: "translateY(-50%)",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          padding: 2,
          color: "var(--text-secondary)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg style={{ width: 14, height: 14 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </button>

      {/* Centered Calendar Modal */}
      {showCalendar && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: 16,
          }}
          onClick={() => setShowCalendar(false)}
        >
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 20,
              padding: 20,
              maxWidth: 320,
              width: "100%",
              boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border-subtle)", paddingBottom: 8 }}>
              <div>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-main)", margin: 0 }}>
                  {label ? `${t("adminCertificateIssue.calendar.selectDate")} - ${label}` : t("adminCertificateIssue.calendar.selectDate")}
                </h3>
                <p style={{ fontSize: 10, color: "var(--text-secondary)", fontFamily: "monospace", margin: "2px 0 0 0" }}>
                  {t("adminCertificateIssue.calendar.formatPrefix")} {value ? `• ${value}` : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCalendar(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--text-secondary)",
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: "bold",
                  padding: 4,
                }}
              >
                ✕
              </button>
            </div>

            {/* Month & Year Selectors & Navigation */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
              <button
                type="button"
                onClick={prevMonth}
                style={{
                  padding: "4px 8px",
                  borderRadius: 8,
                  border: "1px solid var(--border)",
                  background: "var(--surface-subtle)",
                  color: "var(--text-main)",
                  cursor: "pointer",
                  fontSize: 11,
                  fontWeight: "bold",
                }}
              >
                ◀
              </button>

              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <select
                  value={viewMonth}
                  onChange={(e) => setViewMonth(parseInt(e.target.value, 10))}
                  style={{
                    padding: "4px 8px",
                    borderRadius: 8,
                    border: "1px solid var(--border)",
                    background: "var(--surface)",
                    fontSize: 11,
                    fontWeight: 700,
                    color: "var(--text-main)",
                    cursor: "pointer",
                    outline: "none",
                  }}
                >
                  {monthNames.map((m, idx) => (
                    <option key={idx + 1} value={idx + 1} style={{ background: "var(--surface)", color: "var(--text-main)" }}>
                      {m}
                    </option>
                  ))}
                </select>

                <select
                  value={viewYear}
                  onChange={(e) => setViewYear(parseInt(e.target.value, 10))}
                  style={{
                    padding: "4px 8px",
                    borderRadius: 8,
                    border: "1px solid var(--border)",
                    background: "var(--surface)",
                    fontSize: 11,
                    fontWeight: 700,
                    color: "var(--text-main)",
                    cursor: "pointer",
                    outline: "none",
                  }}
                >
                  {yearsList.map((y) => (
                    <option key={y} value={y} style={{ background: "var(--surface)", color: "var(--text-main)" }}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={nextMonth}
                style={{
                  padding: "4px 8px",
                  borderRadius: 8,
                  border: "1px solid var(--border)",
                  background: "var(--surface-subtle)",
                  color: "var(--text-main)",
                  cursor: "pointer",
                  fontSize: 11,
                  fontWeight: "bold",
                }}
              >
                ▶
              </button>
            </div>

            {/* Days of Week */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, textAlign: "center", fontSize: 10, fontWeight: 700, color: "var(--text-secondary)" }}>
              {dayNames.map((day, idx) => (
                <span key={idx} style={{ color: idx === 6 ? "#ef4444" : undefined }}>
                  {day}
                </span>
              ))}
            </div>

            {/* Calendar Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
              {Array.from({ length: startOffset }).map((_, i) => (
                <div key={`empty-${i}`} style={{ height: 28 }} />
              ))}

              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const isSelected = parsed?.day === dayNum && parsed?.month === viewMonth && parsed?.year === viewYear;
                const isToday = now.getDate() === dayNum && now.getMonth() + 1 === viewMonth && now.getFullYear() === viewYear;

                return (
                  <button
                    key={dayNum}
                    type="button"
                    onClick={() => handleSelectDay(dayNum)}
                    style={{
                      height: 28,
                      borderRadius: 8,
                      fontSize: 11,
                      fontWeight: isSelected ? 800 : 500,
                      cursor: "pointer",
                      border: "none",
                      background: isSelected ? "#147D74" : isToday ? "rgba(20,125,116,0.12)" : "transparent",
                      color: isSelected ? "#ffffff" : isToday ? "#147D74" : "var(--text-main)",
                      outline: isToday && !isSelected ? "1px dashed #147D74" : "none",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {dayNum}
                  </button>
                );
              })}
            </div>

            {/* Footer Buttons */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid var(--border-subtle)", paddingTop: 8 }}>
              <button
                type="button"
                onClick={handleSelectToday}
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#147D74",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {t("adminCertificateIssue.calendar.today")}
              </button>
              <button
                type="button"
                onClick={() => setShowCalendar(false)}
                style={{
                  fontSize: 11,
                  color: "var(--text-secondary)",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {t("adminCertificateIssue.calendar.close")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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
  const [orgLogo, setOrgLogo] = useState<string>("");

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
        const [list, profileRes] = await Promise.all([
          templateApi.list(),
          issuerApi.getProfile().catch(() => null),
        ]);
        setTemplates(list);
        if (profileRes && profileRes.logo_url) {
          setOrgLogo(profileRes.logo_url);
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

  // Dynamically extract bound fields present in the selected template + student_id
  const bindingLabels = useMemo(() => getBindingLabels(t), [t]);

  const handleSelectTemplate = (id: string) => {
    setSelectedTemplateId(id);
    if (!id) {
      setSelectedTemplate(null);
      return;
    }
    const found = templates.find((t) => t.id === id) || null;
    setSelectedTemplate(found);
    if (found && found.design_data) {
      const d = found.design_data as DesignData;
      const boundKeys = new Set((d.fields || []).filter((f) => f.dynamic && f.binding).map((f) => f.binding!));
      const missing = REQUIRED_TEMPLATE_BINDINGS.filter((k) => !boundKeys.has(k));
      if (missing.length > 0) {
        const labels = missing.map((k) => bindingLabels[k] || k);
        const msg = (t("adminTemplateGenerator.invalidTemplateMissing") || "Invalid template: Missing required fields ({fields})")
          .replace("{fields}", labels.join(", "));
        toast.error(msg, { duration: 6000 });
      }
    }
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

  // Validation to check whether template has all required online certificate bindings
  const templateValidation = useMemo(() => {
    if (!selectedTemplate) return { isValid: true, missingKeys: [] as string[], missingLabels: [] as string[] };
    const fields = activeDesign.fields || [];
    const boundKeys = new Set(
      fields.filter((f) => f.dynamic && f.binding).map((f) => f.binding!)
    );
    const missingKeys = REQUIRED_TEMPLATE_BINDINGS.filter((key) => !boundKeys.has(key));
    const missingLabels = missingKeys.map((key) => bindingLabels[key] || key);
    return {
      isValid: missingKeys.length === 0,
      missingKeys,
      missingLabels,
    };
  }, [selectedTemplate, activeDesign, bindingLabels]);

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

  const validateRecord = (record: Record<string, string>): { valid: boolean; missingLabel?: string; invalidDateLabel?: string } => {
    for (const item of boundFields) {
      if (OPTIONAL_BINDINGS.includes(item.key)) continue;
      const val = record[item.key];
      if (!val || !val.trim()) {
        return { valid: false, missingLabel: item.label };
      }
      if (item.key === "issueDate" || item.key === "dob") {
        if (!isValidDdMmYyyy(val)) {
          return { valid: false, invalidDateLabel: item.label };
        }
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
      setRecords(
        res.rows.map((r) => {
          const rec = { ...r.record };
          if (rec.dob) rec.dob = formatToDdMmYyyy(rec.dob);
          if (rec.issueDate) rec.issueDate = formatToDdMmYyyy(rec.issueDate);
          return rec;
        })
      );
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
    if (!templateValidation.isValid) {
      toast.error(t("adminTemplateGenerator.templateNotValidActionBlocked").replace("{fields}", templateValidation.missingLabels.join(", ")));
      return;
    }
    const check = validateRecord(activeRecord);
    if (!check.valid) {
      if (check.invalidDateLabel) {
        toast.error(t("adminTemplateGenerator.invalidDate").replace("{field}", check.invalidDateLabel));
        return;
      }
      toast.error(t("adminTemplateGenerator.exportPdfMissing").replace("{field}", check.missingLabel || ""));
      return;
    }
    // Block export if the certificate is not uploaded / issued yet
    let isUploaded = Boolean(
      activeRecord.certificate_id ||
      activeRecord.verification_url ||
      activeRecord.is_uploaded === "true"
    );

    if (!isUploaded && activeRecord.serialNumber && activeRecord.registryNumber) {
      try {
        const checkCert = await verifierApi.verify(activeRecord.serialNumber, activeRecord.registryNumber);
        if (checkCert && checkCert.isValid && checkCert.certificateDetails?.certificateId) {
          const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
          const cId = checkCert.certificateDetails.certificateId;
          isUploaded = true;
          setRecords((prev) => {
            const next = [...prev];
            next[activeRowIndex] = {
              ...next[activeRowIndex],
              certificate_id: cId,
              verification_url: `${baseUrl}/public/certificate/${cId}`,
              is_uploaded: "true",
            };
            return next;
          });
        }
      } catch {
        // Not found in system
      }
    }

    if (!isUploaded) {
      toast.error(t("adminTemplateGenerator.certNotUploadedExportBlocked"));
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
    if (!templateValidation.isValid) {
      toast.error(t("adminTemplateGenerator.templateNotValidActionBlocked").replace("{fields}", templateValidation.missingLabels.join(", ")));
      return;
    }

    // Pre-check all records for completeness and upload status
    for (let i = 0; i < records.length; i++) {
      const row = records[i];
      const rowCheck = validateRecord(row);
      if (!rowCheck.valid) {
        if (rowCheck.invalidDateLabel) {
          toast.error(t("adminTemplateGenerator.invalidDate").replace("{field}", rowCheck.invalidDateLabel));
        } else {
          toast.error(t("adminTemplateGenerator.batchExportMissing").replace("{row}", String(i + 1)).replace("{field}", rowCheck.missingLabel || ""));
        }
        setActiveRowIndex(i);
        return;
      }

      let isRowUploaded = Boolean(row.certificate_id || row.verification_url || row.is_uploaded === "true");
      if (!isRowUploaded && row.serialNumber && row.registryNumber) {
        try {
          const checkCert = await verifierApi.verify(row.serialNumber, row.registryNumber);
          if (checkCert && checkCert.isValid && checkCert.certificateDetails?.certificateId) {
            isRowUploaded = true;
            const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
            records[i].certificate_id = checkCert.certificateDetails.certificateId;
            records[i].verification_url = `${baseUrl}/public/certificate/${checkCert.certificateDetails.certificateId}`;
            records[i].is_uploaded = "true";
          }
        } catch {
          // Not uploaded
        }
      }

      if (!isRowUploaded) {
        const studentName = row.student_fullName || row.student_id || `cert_${i + 1}`;
        toast.error(
          (t("adminTemplateGenerator.batchCertNotUploadedExportBlocked") || "Certificate at row {row} ({name}) is not uploaded/issued yet.")
            .replace("{row}", String(i + 1))
            .replace("{name}", studentName)
        );
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
        student_id: (activeRecord.student_id || `SV_${Date.now()}`).trim(),
        student_fullName: (activeRecord.student_fullName || "").trim() || undefined,
        template_id: selectedTemplate.id,
        certificate_title: (activeRecord.certificate_title || selectedTemplate.name || "BẰNG TỐT NGHIỆP").trim(),
        dob: (activeRecord.dob || "").trim(),
        placeOfBirth: (activeRecord.placeOfBirth || "").trim(),
        gender: (activeRecord.gender || "").trim(),
        ethnicity: (activeRecord.ethnicity || "").trim(),
        schoolName: (activeRecord.schoolName || "").trim(),
        examCohort: (activeRecord.examCohort || "").trim(),
        examBoard: (activeRecord.examBoard || "").trim(),
        issueLocation: (activeRecord.issueLocation || "").trim(),
        issueDate: (activeRecord.issueDate || "").trim(),
        serialNumber: (activeRecord.serialNumber || "").trim(),
        registryNumber: (activeRecord.registryNumber || "").trim(),
      };

      const cert = await certificateApi.templateIssueSingle(payload);
      const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
      const certId = cert.certificate_id || cert.serialNumber;
      setRecords((prev) => {
        const next = [...prev];
        next[activeRowIndex] = {
          ...next[activeRowIndex],
          certificate_id: cert.certificate_id || "",
          verification_url: certId ? `${baseUrl}/public/certificate/${certId}` : "",
          is_uploaded: "true",
        };
        return next;
      });
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
    if (!templateValidation.isValid) {
      toast.error(t("adminTemplateGenerator.templateNotValidActionBlocked").replace("{fields}", templateValidation.missingLabels.join(", ")));
      return;
    }
    const check = validateRecord(activeRecord);
    if (!check.valid) {
      if (check.invalidDateLabel) {
        toast.error(t("adminTemplateGenerator.invalidDate").replace("{field}", check.invalidDateLabel));
        return;
      }
      toast.error(t("adminTemplateGenerator.issueSingleMissing").replace("{field}", check.missingLabel || ""));
      return;
    }
    setConfirmingUpload({ type: "SINGLE", count: 1 });
  };

  // Request confirmation before issuing batch certificates
  const requestIssueBatch = () => {
    if (!selectedTemplate || records.length === 0) return;
    if (!templateValidation.isValid) {
      toast.error(t("adminTemplateGenerator.templateNotValidActionBlocked").replace("{fields}", templateValidation.missingLabels.join(", ")));
      return;
    }
    for (let i = 0; i < records.length; i++) {
      const check = validateRecord(records[i]);
      if (!check.valid) {
        if (check.invalidDateLabel) {
          toast.error(t("adminTemplateGenerator.invalidDate").replace("{field}", check.invalidDateLabel));
        } else {
          toast.error(t("adminTemplateGenerator.batchIssueMissing").replace("{row}", String(i + 1)).replace("{field}", check.missingLabel || ""));
        }
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
        student_id: (r.student_id || `SV_${Date.now()}_${i + 1}`).trim(),
        student_fullName: (r.student_fullName || "").trim() || undefined,
        template_id: selectedTemplate.id,
        certificate_title: (r.certificate_title || selectedTemplate.name || "BẰNG TỐT NGHIỆP").trim(),
        dob: (r.dob || "").trim(),
        placeOfBirth: (r.placeOfBirth || "").trim(),
        gender: (r.gender || "").trim(),
        ethnicity: (r.ethnicity || "").trim(),
        schoolName: (r.schoolName || "").trim(),
        examCohort: (r.examCohort || "").trim(),
        examBoard: (r.examBoard || "").trim(),
        issueLocation: (r.issueLocation || "").trim(),
        issueDate: (r.issueDate || "").trim(),
        serialNumber: (r.serialNumber || "").trim(),
        registryNumber: (r.registryNumber || "").trim(),
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
              return {
                ...rec,
                certificate_id: item.certificate_id,
                verification_url: `${baseUrl}/public/certificate/${item.certificate_id}`,
                is_uploaded: "true",
              };
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
        const imgSrc = rawSrc || field.src || activeRecord.organization_logo || orgLogo;
        if (imgSrc && (imgSrc.startsWith("http") || imgSrc.startsWith("data:") || imgSrc.startsWith("/"))) {
          return (
            <img
              src={imgSrc}
              alt={field.label || t("adminTemplateGenerator.logoAlt")}
              crossOrigin="anonymous"
              style={{ width: "100%", height: "100%", objectFit: "contain", pointerEvents: "none" }}
            />
          );
        }
        return (
          <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: "1px dashed #cbd5e1", background: "#f8fafc", color: "#64748b", fontSize: 11 }}>
            <svg style={{ width: 20, height: 20, marginBottom: 4 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
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
      {(issuingSingle || issuingBatch || exportingSingle || exportingBatch) && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-[99999] p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="w-14 h-14 border-4 border-[#147D74] border-t-transparent rounded-full animate-spin mx-auto" />
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                {issuingSingle || issuingBatch
                  ? t("adminCertificateIssue.processing.title")
                  : t("adminTemplateGenerator.exportingPdf")}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {exportingBatch && batchProgress
                  ? `${t("adminTemplateGenerator.creatingZipProgress")} (${batchProgress})...`
                  : t("adminCertificateIssue.processing.message")}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header Toolbar - 2-Row Layout */}
      <div className="flex flex-col bg-white dark:bg-gray-900 border-b border-slate-200 dark:border-slate-800 shadow-2xs shrink-0 transition-colors">
        {/* Row 1: Title, Template Selector, Record Badge & Zoom Controls */}
        <div className="flex items-center justify-between px-6 py-2.5 border-b border-slate-100 dark:border-slate-800 overflow-x-auto whitespace-nowrap gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2 shrink-0">
              <svg className="w-5 h-5 text-teal-600 dark:text-teal-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" />
              </svg>
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
                    <svg className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10 9 9 9 8 9" />
                    </svg>
                    {t("adminTemplateGenerator.recordBadge")}: <strong className="text-blue-600 dark:text-blue-400">{activeRowIndex + 1}</strong> / {records.length}
                  </span>
                  {/* Upload / Issue Status Badge */}
                  {Boolean(activeRecord.certificate_id || activeRecord.verification_url || activeRecord.is_uploaded === "true") ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-semibold whitespace-nowrap">
                      <svg className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      {t("adminTemplateGenerator.statusUploaded")}
                    </span>
                  ) : (
                    <span
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-700 dark:text-amber-300 font-semibold whitespace-nowrap"
                      title={t("adminTemplateGenerator.notUploadedTooltip")}
                    >
                      <svg className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                      {t("adminTemplateGenerator.statusNotUploaded")}
                    </span>
                  )}
                  {importedFileName ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold whitespace-nowrap">
                      <svg className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                      </svg>
                      {importedFileName}
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
                {exportingSingle ? (
                  <div className="w-3.5 h-3.5 border-2 border-sky-600 border-t-transparent rounded-full animate-spin shrink-0" />
                ) : (
                  <svg className="w-3.5 h-3.5 shrink-0 text-sky-600 dark:text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                )}
                <span>{exportingSingle ? t("adminTemplateGenerator.exportingPdf") : t("adminTemplateGenerator.exportPdf")}</span>
              </button>
              <button
                onClick={exportBatchZip}
                disabled={exportingSingle || exportingBatch || issuingSingle || issuingBatch || records.length === 0}
                className="px-3 py-1 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs transition-all inline-flex items-center gap-1.5 active:scale-95 shrink-0"
                title={t("adminTemplateGenerator.exportZipTitle")}
              >
                {exportingBatch ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
                ) : (
                  <svg className="w-3.5 h-3.5 shrink-0 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                    <line x1="12" y1="22.08" x2="12" y2="12" />
                  </svg>
                )}
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
                {issuingSingle && (
                  <div className="w-3.5 h-3.5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin shrink-0" />
                )}
                <span>{issuingSingle ? t("adminTemplateGenerator.issuing") : t("adminTemplateGenerator.issueSingle")}</span>
              </button>
              <button
                onClick={requestIssueBatch}
                disabled={exportingSingle || exportingBatch || issuingSingle || issuingBatch || records.length === 0}
                className="px-3 py-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs transition-all inline-flex items-center gap-1.5 active:scale-95 shrink-0"
                title={t("adminTemplateGenerator.issueBatchTitle")}
              >
                {issuingBatch && (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
                )}
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
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
              <div style={{ width: 64, height: 64, borderRadius: 20, background: "rgba(20, 125, 116, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#147D74" }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                  <path d="M6 12v5c3 3 9 3 12 0v-5" />
                </svg>
              </div>
            </div>
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

            {/* Template Validity Alert Banner */}
            {!templateValidation.isValid && (
              <div style={{ marginBottom: 14, padding: 12, background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, color: "#991b1b" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700, fontSize: 12, marginBottom: 4 }}>
                  <svg style={{ width: 15, height: 15, flexShrink: 0, color: "#dc2626" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  <span>{t("adminTemplateGenerator.invalidTemplateBannerTitle")}</span>
                </div>
                <p style={{ fontSize: 11, lineHeight: 1.4, margin: "0 0 8px 0" }}>
                  {(t("adminTemplateGenerator.invalidTemplateMissing") || "Missing required fields: {fields}")
                    .replace("{fields}", templateValidation.missingLabels.join(", "))}
                </p>
                {selectedTemplate && (
                  <Link
                    href={`/admin/templates/editor/${selectedTemplate.id}`}
                    style={{ display: "inline-block", fontSize: 11, fontWeight: 700, color: "#dc2626", textDecoration: "underline" }}
                  >
                    {t("adminTemplateGenerator.editTemplateBtn")} →
                  </Link>
                )}
              </div>
            )}

            {/* Record Navigator */}
            <div style={{ marginBottom: 16, background: "var(--surface-subtle)", border: "1px solid var(--border)", padding: 10, borderRadius: 10 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-body)", display: "inline-flex", alignItems: "center", gap: 5 }}>
                  {importedFileName ? (
                    <>
                      <svg style={{ width: 13, height: 13, color: "var(--text-secondary)" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                      </svg>
                      <span>{importedFileName}</span>
                    </>
                  ) : (
                    t("adminTemplateGenerator.manualRecordLabel")
                  )}
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
                if (key === "student_id") {
                  return (
                    <div key={key}>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-faint)", marginBottom: 4 }}>
                        {label}{!OPTIONAL_BINDINGS.includes(key) && <span style={{ color: "#ef4444" }}> *</span>} {t("adminTemplateGenerator.selectOrManualSuffix")}
                      </label>
                      <StudentSearch
                        value={activeRecord[key] || ""}
                        onChange={(studentId, studentFullName) => {
                          handleUpdateActiveField("student_id", studentId);
                          if (studentFullName) {
                            handleUpdateActiveField("student_fullName", studentFullName);
                          }
                        }}
                        placeholder={t("adminTemplateGenerator.searchStudentPlaceholder")}
                      />
                      <input
                        type="text"
                        value={activeRecord[key] || ""}
                        onChange={(e) => handleUpdateActiveField(key, e.target.value)}
                        style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid var(--border-strong)", fontSize: 12, background: "var(--surface)", color: "var(--text-main)", outline: "none", boxSizing: "border-box", marginTop: 8 }}
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
                    {(key === "issueDate" || key === "dob") ? (
                      <DateField
                        value={activeRecord[key] || ""}
                        onChange={(val) => handleUpdateActiveField(key, val)}
                        placeholder="dd/mm/yyyy"
                        required={!OPTIONAL_BINDINGS.includes(key)}
                        label={label}
                      />
                    ) : (
                      <input
                        type="text"
                        value={activeRecord[key] || ""}
                        onChange={(e) => handleUpdateActiveField(key, e.target.value)}
                        style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid var(--border-strong)", fontSize: 12, background: "var(--surface)", color: "var(--text-main)", outline: "none", boxSizing: "border-box" }}
                        placeholder={OPTIONAL_BINDINGS.includes(key) ? t("adminTemplateGenerator.placeholderOptional").replace("{label}", label.toLowerCase()) : `${t("adminTemplateGenerator.enterPrefix")} ${label.toLowerCase()}...`}
                      />
                    )}
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
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", overflow: "auto", padding: 24, background: "var(--page-bg)" }}>
            {!templateValidation.isValid && (
              <div style={{ width: "100%", maxWidth: 800, marginBottom: 16, padding: "12px 16px", background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, boxShadow: "0 2px 8px rgba(239,68,68,0.08)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <svg style={{ width: 22, height: 22, flexShrink: 0, color: "#dc2626" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "#991b1b" }}>{t("adminTemplateGenerator.invalidTemplateBannerTitle")}</div>
                    <div style={{ fontSize: 11, color: "#b91c1c", marginTop: 2 }}>
                      {(t("adminTemplateGenerator.invalidTemplateMissing") || "Missing required fields: {fields}")
                        .replace("{fields}", templateValidation.missingLabels.join(", "))}
                    </div>
                  </div>
                </div>
                {selectedTemplate && (
                  <Link
                    href={`/admin/templates/editor/${selectedTemplate.id}`}
                    style={{ whiteSpace: "nowrap", padding: "6px 14px", background: "#dc2626", color: "#fff", borderRadius: 8, fontSize: 11, fontWeight: 700, textDecoration: "none", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}
                  >
                    {t("adminTemplateGenerator.editTemplateBtn")}
                  </Link>
                )}
              </div>
            )}
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
