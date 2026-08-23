"use client";
import styles from "./page.module.css";
import React, { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ocrApi } from "@/features/ocr/services/api";
import { certificateApi } from "@/features/certificates/services/certificate.api";
import { studentApi, type StudentDto } from "@/features/students/services/student.api";
import { useI18n } from "@/features/i18n/I18nContext";
import toast from "react-hot-toast";

type FormData = {
  student_id: string;
  student_fullName: string;
  certificate_title: string;
  dob: string;
  placeOfBirth: string;
  gender: string;
  ethnicity: string;
  schoolName: string;
  examCohort: string;
  examBoard: string;
  issueLocation: string;
  issueDate: string;
  serialNumber: string;
  registryNumber: string;
  ipfs_cid: string;
  file_url: string;
};

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
  className,
  label,
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
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
    <div className="relative flex items-center">
      <input
        type="text"
        required={required}
        value={value}
        onChange={(e) => handleTextChange(e.target.value)}
        placeholder={placeholder || "dd/mm/yyyy"}
        maxLength={10}
        className={`${className} pr-10`}
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={handleOpenCalendar}
        title={t("adminCertificateIssue.calendar.selectDate")}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer bg-transparent border-0 text-sm"
      >
        📅
      </button>

      {/* Centered Calendar Modal */}
      {showCalendar && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-xs w-full shadow-2xl space-y-3 animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                  {label ? `${t("adminCertificateIssue.calendar.selectDate")} - ${label}` : t("adminCertificateIssue.calendar.selectDate")}
                </h3>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">
                  {t("adminCertificateIssue.calendar.formatPrefix")} {value ? `• ${value}` : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCalendar(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer bg-transparent border-0 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {/* Month & Year Selectors & Navigation */}
            <div className="flex items-center justify-between gap-1.5">
              <button
                type="button"
                onClick={prevMonth}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer bg-transparent border border-slate-200 dark:border-slate-700 text-xs font-bold"
              >
                ◀
              </button>

              <div className="flex items-center gap-1">
                <select
                  value={viewMonth}
                  onChange={(e) => setViewMonth(parseInt(e.target.value, 10))}
                  className="px-2 py-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px] font-bold text-slate-800 dark:text-slate-200 cursor-pointer outline-none"
                >
                  {monthNames.map((m, idx) => (
                    <option key={idx + 1} value={idx + 1}>
                      {m}
                    </option>
                  ))}
                </select>

                <select
                  value={viewYear}
                  onChange={(e) => setViewYear(parseInt(e.target.value, 10))}
                  className="px-2 py-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px] font-bold text-slate-800 dark:text-slate-200 cursor-pointer outline-none"
                >
                  {yearsList.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={nextMonth}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer bg-transparent border border-slate-200 dark:border-slate-700 text-xs font-bold"
              >
                ▶
              </button>
            </div>

            {/* Days of Week */}
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 dark:text-slate-500 py-0.5">
              {dayNames.map((day, idx) => (
                <span key={idx} className={idx === 6 ? "text-red-500" : ""}>
                  {day}
                </span>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: startOffset }).map((_, i) => (
                <div key={`empty-${i}`} className="h-7" />
              ))}

              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const isSelected = parsed?.day === dayNum && parsed?.month === viewMonth && parsed?.year === viewYear;
                const isToday = now.getDate() === dayNum && (now.getMonth() + 1) === viewMonth && now.getFullYear() === viewYear;
                const isSunday = (startOffset + i) % 7 === 6;

                return (
                  <button
                    key={dayNum}
                    type="button"
                    onClick={() => handleSelectDay(dayNum)}
                    className={`h-7 w-full rounded-lg text-xs font-semibold flex items-center justify-center transition-all cursor-pointer border-0 ${
                      isSelected
                        ? "bg-[#147D74] text-white font-bold shadow-sm scale-105"
                        : isToday
                        ? "border border-teal-500 text-[#147D74] dark:text-teal-400 font-bold bg-teal-50/50 dark:bg-teal-950/20"
                        : isSunday
                        ? "text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    {dayNum}
                  </button>
                );
              })}
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={handleSelectToday}
                className="px-2.5 py-1 text-xs font-bold text-[#147D74] dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/20 rounded-lg transition-colors cursor-pointer border-0 bg-transparent"
              >
                {t("adminCertificateIssue.calendar.today")}
              </button>

              <button
                type="button"
                onClick={() => setShowCalendar(false)}
                className="px-3 py-1 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer border border-slate-200 dark:border-slate-700 bg-transparent"
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

const initialForm: FormData = {
  student_id: "",
  student_fullName: "",
  certificate_title: "BẰNG TỐT NGHIỆP TRUNG HỌC PHỔ THÔNG",
  dob: "",
  placeOfBirth: "",
  gender: "",
  ethnicity: "",
  schoolName: "",
  examCohort: "",
  examBoard: "",
  issueLocation: "",
  issueDate: "",
  serialNumber: "",
  registryNumber: "",
  ipfs_cid: "",
  file_url: "",
};

export default function IssueCertificatePage() {
  const router = useRouter();
  const { t } = useI18n();
  const [step, setStep] = useState<"info" | "result">("info");
  const [formData, setFormData] = useState<FormData>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ id: string; status: string } | null>(null);
  const [error, setError] = useState("");
  const [students, setStudents] = useState<StudentDto[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [studentsError, setStudentsError] = useState("");

  useEffect(() => {
    studentApi.list()
      .then(setStudents)
      .catch((err) => setStudentsError(err instanceof Error ? err.message : t("adminCertificateIssue.errors.studentsLoad")))
      .finally(() => setStudentsLoading(false));
  }, [t]);

  // OCR
  const [inputMode, setInputMode] = useState<"manual" | "ocr">("manual");
  const [ocrFile, setOcrFile] = useState<File | null>(null);
  const [ocrPreview, setOcrPreview] = useState<string | null>(null);
  const [ocrScanning, setOcrScanning] = useState(false);
  const [ocrLang, setOcrLang] = useState("vie");
  const [ocrError, setOcrError] = useState("");

  const updateField = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleOcrFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/tiff"];
    if (!allowed.includes(f.type)) { setOcrError(t("adminCertificateIssue.ocr.formatError")); return; }
    setOcrFile(f);
    setOcrError("");
    setOcrPreview(URL.createObjectURL(f));
  }, [t]);

  const handleOcrDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (!f) return;
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/tiff"];
    if (!allowed.includes(f.type)) { setOcrError(t("adminCertificateIssue.ocr.formatError")); return; }
    setOcrFile(f);
    setOcrError("");
    setOcrPreview(URL.createObjectURL(f));
  }, [t]);

  const handleOcrScan = async () => {
    if (!ocrFile) return;
    setOcrScanning(true);
    setOcrError("");
    try {
      const res = await ocrApi.extractDiploma(ocrFile, ocrLang);
      const d = res.data;
      if (d.document_title) {
        updateField("certificate_title", d.document_title);
      } else {
        updateField("certificate_title", "BẰNG TỐT NGHIỆP TRUNG HỌC PHỔ THÔNG");
      }
      if (d.full_name) updateField("student_fullName", d.full_name);
      if (d.dob) {
        updateField("dob", formatToDdMmYyyy(d.dob));
      }
      if (d.place_of_birth) updateField("placeOfBirth", d.place_of_birth);
      if (d.gender) updateField("gender", d.gender);
      if (d.ethnicity) updateField("ethnicity", d.ethnicity);
      if (d.school_name) updateField("schoolName", d.school_name);
      if (d.exam_cohort) updateField("examCohort", d.exam_cohort);
      if (d.exam_board) updateField("examBoard", d.exam_board);
      if (d.issue_location) updateField("issueLocation", d.issue_location);
      if (d.issue_date) {
        updateField("issueDate", formatToDdMmYyyy(d.issue_date));
      }
      if (d.serial_number) updateField("serialNumber", d.serial_number);
      if (d.registry_number) updateField("registryNumber", d.registry_number);
      if (res.ipfs_cid) updateField("ipfs_cid", res.ipfs_cid);
      if (res.ipfs_url) updateField("file_url", res.ipfs_url);

      // Convert original image file to base64 for IPFS upload upon createDraft
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          updateField("file_url", reader.result);
        }
      };
      reader.readAsDataURL(ocrFile);
    } catch (err) {
      setOcrError(err instanceof Error ? err.message : t("adminCertificateIssue.ocr.failed"));
    } finally {
      setOcrScanning(false);
    }
  };

  const handleSubmit = async () => {
    const requiredFieldDefinitions: Array<{ key: keyof FormData; label: string }> = [
      { key: "student_id", label: t("adminCertificateIssue.form.student").replace(/\s*\*$/, "") },
      { key: "student_fullName", label: t("adminCertificateIssue.form.studentName").replace(/\s*\*$/, "") },
      { key: "certificate_title", label: t("adminCertificateIssue.form.certificateTitle").replace(/\s*\*$/, "") },
      { key: "dob", label: t("adminCertificateIssue.form.dob").replace(/\s*\*$/, "") },
      { key: "placeOfBirth", label: t("adminCertificateIssue.form.placeOfBirth").replace(/\s*\*$/, "") },
      { key: "gender", label: t("adminCertificateIssue.form.gender").replace(/\s*\*$/, "") },
      { key: "ethnicity", label: t("adminCertificateIssue.form.ethnicity").replace(/\s*\*$/, "") },
      { key: "schoolName", label: t("adminCertificateIssue.form.school").replace(/\s*\*$/, "") },
      { key: "examCohort", label: t("adminCertificateIssue.form.examCohort").replace(/\s*\*$/, "") },
      { key: "examBoard", label: t("adminCertificateIssue.form.examBoard").replace(/\s*\*$/, "") },
      { key: "issueLocation", label: t("adminCertificateIssue.form.issueLocation").replace(/\s*\*$/, "") },
      { key: "issueDate", label: t("adminCertificateIssue.form.issueDate").replace(/\s*\*$/, "") },
      { key: "serialNumber", label: t("adminCertificateIssue.form.serialNumber").replace(/\s*\*$/, "") },
      { key: "registryNumber", label: t("adminCertificateIssue.form.registryNumber").replace(/\s*\*$/, "") },
    ];

    const missingLabels = requiredFieldDefinitions
      .filter((def) => !formData[def.key] || !formData[def.key].trim())
      .map((def) => def.label);

    if (missingLabels.length > 0) {
      const missingMsg = (t("adminCertificateIssue.errors.validationMissingFields") || "Please fill in all required fields: {fields}")
        .replace("{fields}", missingLabels.join(", "));
      setError(missingMsg);
      toast.error(missingMsg);
      return;
    }

    if (!isValidDdMmYyyy(formData.dob)) {
      const msg = t("adminCertificateIssue.errors.invalidDob");
      setError(msg);
      toast.error(msg);
      return;
    }

    if (!isValidDdMmYyyy(formData.issueDate)) {
      const msg = t("adminCertificateIssue.errors.invalidIssueDate");
      setError(msg);
      toast.error(msg);
      return;
    }

    const optional = (value: string) => value.trim() || undefined;
    setSubmitting(true);
    setError("");
    try {
      const created = await certificateApi.createDraft({
        student_id: formData.student_id.trim(),
        student_fullName: formData.student_fullName.trim(),
        certificate_title: formData.certificate_title.trim(),
        dob: formData.dob.trim(),
        placeOfBirth: formData.placeOfBirth.trim(),
        gender: formData.gender.trim(),
        ethnicity: formData.ethnicity.trim(),
        schoolName: formData.schoolName.trim(),
        examCohort: formData.examCohort.trim(),
        examBoard: formData.examBoard.trim(),
        issueLocation: formData.issueLocation.trim(),
        issueDate: formData.issueDate.trim(),
        serialNumber: formData.serialNumber.trim(),
        registryNumber: formData.registryNumber.trim(),
        ipfs_cid: optional(formData.ipfs_cid),
        file_url: optional(formData.file_url),
      });
      setResult({ id: created.certificate_id, status: created.status });
      toast.success(t("adminCertificateIssue.result.successTitle"));
      setStep("result");
    } catch (err) {
      const message = err instanceof Error ? err.message : t("adminCertificateIssue.errors.createFailed");
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (step === "result" && result) {
    return (
      <div className={styles._1}>
        <div className="max-w-lg mx-auto text-center space-y-6 py-12">
          <div className="text-5xl">🎓</div>
          <h2 className="text-xl font-black text-gray-900 dark:text-white">{t("adminCertificateIssue.result.successTitle")}</h2>
          <div className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800/60 rounded-2xl p-6 space-y-2 text-left">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500 dark:text-gray-400">{t("adminCertificateIssue.result.certificateId")}</span>
              <span className="font-mono text-gray-900 dark:text-white">{result.id}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500 dark:text-gray-400">{t("adminCertificateIssue.result.status")}</span>
              <span className="text-amber-600 font-bold">{result.status}</span>
            </div>
          </div>
          <div className="flex gap-3 justify-center">
            <button onClick={() => router.push(`/admin/certificates/${result.id}`)} className="px-5 py-2.5 text-xs font-bold text-white bg-primary hover:bg-primary-hover rounded-xl transition-all">
              {t("adminCertificateIssue.result.viewDetail")}
            </button>
            <button onClick={() => { setStep("info"); setFormData(initialForm); setResult(null); }} className="px-5 py-2.5 text-xs font-bold text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-300 rounded-xl transition-all">
              {t("adminCertificateIssue.result.createAnother")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles._1}>
      {submitting && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="w-14 h-14 border-4 border-[#147D74] border-t-transparent rounded-full animate-spin mx-auto" />
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">{t("adminCertificateIssue.processing.title")}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t("adminCertificateIssue.processing.message")}</p>
            </div>
          </div>
        </div>
      )}

      <div>
        <h1 className={styles._2}>{t("adminCertificateIssue.header.title")}</h1>
        <p className={styles._3}>{t("adminCertificateIssue.header.description")}</p>
      </div>

      {/* Input mode tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 w-fit">
        <button
          onClick={() => setInputMode("manual")}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${inputMode === "manual"
              ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
        >
          {t("adminCertificateIssue.tabs.manual")}
        </button>
        <button
          onClick={() => setInputMode("ocr")}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${inputMode === "ocr"
              ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
          </svg>
          {t("adminCertificateIssue.tabs.ocr")}
        </button>
      </div>

      {/* OCR panel */}
      {inputMode === "ocr" && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800/60 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="text-sm font-bold text-gray-900 dark:text-white">{t("adminCertificateIssue.ocr.chooseImage")}</div>
            <select
              value={ocrLang}
              onChange={(e) => setOcrLang(e.target.value)}
              className="flex-1 max-w-[160px] px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="vie">{t("adminCertificateIssue.ocr.langVie")}</option>
              <option value="eng">{t("adminCertificateIssue.ocr.langEng")}</option>
            </select>
          </div>

          {ocrPreview ? (
            <div className="space-y-3">
              <img src={ocrPreview} alt={t("adminCertificateIssue.ocr.previewAlt")} className="w-full max-h-48 object-contain rounded-lg border border-gray-200 dark:border-gray-800" />
              {ocrError && <div className="text-[11px] text-red-500 bg-red-50 dark:bg-red-950/20 px-3 py-2 rounded-lg">{ocrError}</div>}
              <div className="flex gap-3">
                <button onClick={handleOcrScan} disabled={ocrScanning} className="px-6 py-2.5 text-xs font-bold text-white bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all">
                  {ocrScanning ? (
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      {t("adminCertificateIssue.ocr.processing")}
                    </span>
                  ) : t("adminCertificateIssue.ocr.scanDiploma")}
                </button>
                <button onClick={() => { setOcrFile(null); setOcrPreview(null); setOcrError(""); }} className="px-4 py-2.5 text-xs font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-all">
                  {t("adminCertificateIssue.ocr.retry")}
                </button>
              </div>
            </div>
          ) : (
            <label
              className="relative border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors flex flex-col items-center gap-3"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleOcrDrop}
            >
              <svg className="w-12 h-12 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t("adminCertificateIssue.ocr.dragDrop")}</div>
              <div className="text-[10px] text-gray-400 dark:text-gray-500">{t("adminCertificateIssue.ocr.clickToSelect")}</div>
              {ocrError && <div className="text-[11px] text-red-500">{ocrError}</div>}
              <input type="file" accept="image/jpeg,image/png,image/webp,image/tiff" onChange={handleOcrFileSelect} className="hidden" />
            </label>
          )}
        </div>
      )}

      {/* Form */}
      <div className={styles._28}>
        <div>
          <label className={styles._29}>{t("adminCertificateIssue.form.student")}</label>
          {studentsLoading ? (
            <p className="text-xs text-gray-400">{t("adminCertificateIssue.form.studentsLoading")}</p>
          ) : students.length > 0 ? (
            <select
              required
              className={styles._30}
              value={formData.student_id}
              onChange={(e) => {
                const s = students.find((s) => s.student_id === e.target.value);
                updateField("student_id", e.target.value);
                if (s) updateField("student_fullName", s.student_fullName);
              }}
            >
              <option value="">{t("adminCertificateIssue.form.selectStudent")}</option>
              {students.map((s) => (
                <option key={s.student_id} value={s.student_id}>
                  {s.student_fullName} ({s.email})
                </option>
              ))}
            </select>
          ) : (
            <div className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/20 px-3 py-2 rounded-lg">
              {studentsError || t("adminCertificateIssue.form.noStudents")}{' '}
              <Link href="/admin/students/create" className="underline">{t("adminCertificateIssue.form.createStudent")}</Link> {t("adminCertificateIssue.form.beforeIssuing")}
            </div>
          )}
        </div>
        <div>
          <label className={styles._29}>{t("adminCertificateIssue.form.studentName")}</label>
          <input
            type="text"
            required
            className={styles._30}
            placeholder={t("adminCertificateIssue.form.placeholders.studentName")}
            value={formData.student_fullName}
            onChange={(e) => updateField("student_fullName", e.target.value)}
          />
        </div>
        <div>
          <label className={styles._29}>{t("adminCertificateIssue.form.certificateTitle")}</label>
          <input
            type="text"
            required
            className={styles._30}
            placeholder={t("adminCertificateIssue.form.placeholders.certificateTitle")}
            value={formData.certificate_title}
            onChange={(e) => updateField("certificate_title", e.target.value)}
          />
        </div>
        <div>
          <label className={styles._29}>{t("adminCertificateIssue.form.dob")}</label>
          <DateField
            required
            label={t("adminCertificateIssue.form.dob").replace(/\s*\*$/, "")}
            className={styles._30}
            placeholder={t("adminCertificateIssue.form.placeholders.dob")}
            value={formData.dob}
            onChange={(val) => updateField("dob", val)}
          />
        </div>
        <div>
          <label className={styles._29}>{t("adminCertificateIssue.form.placeOfBirth")}</label>
          <input
            type="text"
            required
            className={styles._30}
            placeholder={t("adminCertificateIssue.form.placeholders.placeOfBirth")}
            value={formData.placeOfBirth}
            onChange={(e) => updateField("placeOfBirth", e.target.value)}
          />
        </div>
        <div>
          <label className={styles._29}>{t("adminCertificateIssue.form.gender")}</label>
          <input
            type="text"
            required
            className={styles._30}
            placeholder={t("adminCertificateIssue.form.placeholders.gender")}
            value={formData.gender}
            onChange={(e) => updateField("gender", e.target.value)}
          />
        </div>
        <div>
          <label className={styles._29}>{t("adminCertificateIssue.form.ethnicity")}</label>
          <input
            type="text"
            required
            className={styles._30}
            placeholder={t("adminCertificateIssue.form.placeholders.ethnicity")}
            value={formData.ethnicity}
            onChange={(e) => updateField("ethnicity", e.target.value)}
          />
        </div>
        <div>
          <label className={styles._29}>{t("adminCertificateIssue.form.school")}</label>
          <input
            type="text"
            required
            className={styles._30}
            placeholder={t("adminCertificateIssue.form.placeholders.school")}
            value={formData.schoolName}
            onChange={(e) => updateField("schoolName", e.target.value)}
          />
        </div>
        <div>
          <label className={styles._29}>{t("adminCertificateIssue.form.examCohort")}</label>
          <input
            type="text"
            required
            className={styles._30}
            placeholder={t("adminCertificateIssue.form.placeholders.examCohort")}
            value={formData.examCohort}
            onChange={(e) => updateField("examCohort", e.target.value)}
          />
        </div>
        <div>
          <label className={styles._29}>{t("adminCertificateIssue.form.examBoard")}</label>
          <input
            type="text"
            required
            className={styles._30}
            placeholder={t("adminCertificateIssue.form.placeholders.examBoard")}
            value={formData.examBoard}
            onChange={(e) => updateField("examBoard", e.target.value)}
          />
        </div>
        <div>
          <label className={styles._29}>{t("adminCertificateIssue.form.issueLocation")}</label>
          <input
            type="text"
            required
            className={styles._30}
            placeholder={t("adminCertificateIssue.form.placeholders.issueLocation")}
            value={formData.issueLocation}
            onChange={(e) => updateField("issueLocation", e.target.value)}
          />
        </div>
        <div>
          <label className={styles._29}>{t("adminCertificateIssue.form.issueDate")}</label>
          <DateField
            required
            label={t("adminCertificateIssue.form.issueDate").replace(/\s*\*$/, "")}
            className={styles._30}
            placeholder={t("adminCertificateIssue.form.placeholders.issueDate")}
            value={formData.issueDate}
            onChange={(val) => updateField("issueDate", val)}
          />
        </div>
        <div>
          <label className={styles._29}>{t("adminCertificateIssue.form.serialNumber")}</label>
          <input
            type="text"
            required
            className={styles._30}
            placeholder={t("adminCertificateIssue.form.placeholders.serialNumber")}
            value={formData.serialNumber}
            onChange={(e) => updateField("serialNumber", e.target.value)}
          />
        </div>
        <div>
          <label className={styles._29}>{t("adminCertificateIssue.form.registryNumber")}</label>
          <input
            type="text"
            required
            className={styles._30}
            placeholder={t("adminCertificateIssue.form.placeholders.registryNumber")}
            value={formData.registryNumber}
            onChange={(e) => updateField("registryNumber", e.target.value)}
          />
        </div>
      </div>

      {error && <div className="text-[11px] text-red-500 bg-red-50 dark:bg-red-950/20 px-4 py-2 rounded-lg">{error}</div>}

      <div className="flex gap-3">
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="px-6 py-2.5 text-xs font-bold text-white bg-primary hover:bg-primary-hover disabled:opacity-50 rounded-xl transition-all cursor-pointer shadow-2xs active:scale-95"
        >
          {submitting ? t("adminCertificateIssue.submit.saving") : t("adminCertificateIssue.submit.saveDraft")}
        </button>
        <button
          onClick={() => router.push("/admin/certificates")}
          className="px-4 py-2.5 text-xs font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-all cursor-pointer"
        >
          {t("adminCertificateIssue.submit.cancel")}
        </button>
      </div>
    </div>
  );
}
