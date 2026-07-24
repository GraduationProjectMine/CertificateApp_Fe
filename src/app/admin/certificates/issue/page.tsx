"use client";
import styles from "./page.module.css";
import React, { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ocrApi } from "@/features/ocr/services/api";
import { certificateApi } from "@/features/certificates/services/certificate.api";
import { studentApi, type StudentDto } from "@/features/students/services/student.api";

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

const initialForm: FormData = {
  student_id: "",
  student_fullName: "",
  certificate_title: "",
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
  const [step, setStep] = useState<"info" | "confirm" | "result">("info");
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
      .catch((err) => setStudentsError(err instanceof Error ? err.message : "Không thể tải danh sách sinh viên"))
      .finally(() => setStudentsLoading(false));
  }, []);

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
    if (!allowed.includes(f.type)) { setOcrError("Chỉ hỗ trợ JPEG, PNG, WebP, TIFF"); return; }
    setOcrFile(f);
    setOcrError("");
    setOcrPreview(URL.createObjectURL(f));
  }, []);

  const handleOcrDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (!f) return;
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/tiff"];
    if (!allowed.includes(f.type)) { setOcrError("Chỉ hỗ trợ JPEG, PNG, WebP, TIFF"); return; }
    setOcrFile(f);
    setOcrError("");
    setOcrPreview(URL.createObjectURL(f));
  }, []);

  const handleOcrScan = async () => {
    if (!ocrFile) return;
    setOcrScanning(true);
    setOcrError("");
    try {
      const res = await ocrApi.extractDiploma(ocrFile, ocrLang);
      const d = res.data;
      if (d.full_name) updateField("student_fullName", d.full_name);
      if (d.dob) {
        // Expected format: DD/MM/YYYY
        const parts = d.dob.split("/");
        if (parts.length === 3) {
           updateField("dob", `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`);
        } else {
           updateField("dob", d.dob);
        }
      }
      if (d.place_of_birth) updateField("placeOfBirth", d.place_of_birth);
      if (d.gender) updateField("gender", d.gender);
      if (d.ethnicity) updateField("ethnicity", d.ethnicity);
      if (d.school_name) updateField("schoolName", d.school_name);
      if (d.exam_cohort) updateField("examCohort", d.exam_cohort);
      if (d.exam_board) updateField("examBoard", d.exam_board);
      if (d.issue_location) updateField("issueLocation", d.issue_location);
      if (d.issue_date) updateField("issueDate", d.issue_date.split("/").reverse().join("-"));
      if (d.serial_number) updateField("serialNumber", d.serial_number);
      if (d.registry_number) updateField("registryNumber", d.registry_number);
      if (res.ipfs_cid) updateField("ipfs_cid", res.ipfs_cid);
      if (res.ipfs_url) updateField("file_url", res.ipfs_url);
    } catch (err) {
      setOcrError(err instanceof Error ? err.message : "OCR thất bại");
    } finally {
      setOcrScanning(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.student_id || !formData.certificate_title) {
      setError("Vui lòng nhập mã sinh viên và tên văn bằng");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const created = await certificateApi.createDraft({
        student_id: formData.student_id,
        certificate_title: formData.certificate_title,
        dob: formData.dob || undefined,
        placeOfBirth: formData.placeOfBirth || undefined,
        gender: formData.gender || undefined,
        ethnicity: formData.ethnicity || undefined,
        schoolName: formData.schoolName || undefined,
        examCohort: formData.examCohort || undefined,
        examBoard: formData.examBoard || undefined,
        issueLocation: formData.issueLocation || undefined,
        issueDate: formData.issueDate || undefined,
        serialNumber: formData.serialNumber || undefined,
        registryNumber: formData.registryNumber || undefined,
        ipfs_cid: formData.ipfs_cid || undefined,
        file_url: formData.file_url || undefined,
      });
      setResult({ id: created.certificate_id, status: created.status });
      setStep("result");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Tạo văn bằng thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  if (step === "result" && result) {
    return (
      <div className={styles._1}>
        <div className="max-w-lg mx-auto text-center space-y-6 py-12">
          <div className="text-5xl">🎓</div>
          <h2 className="text-xl font-black text-gray-900 dark:text-white">Tạo văn bằng thành công!</h2>
          <div className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800/60 rounded-2xl p-6 space-y-2 text-left">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500 dark:text-gray-400">Mã văn bằng:</span>
              <span className="font-mono text-gray-900 dark:text-white">{result.id}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500 dark:text-gray-400">Trạng thái:</span>
              <span className="text-amber-600 font-bold">{result.status}</span>
            </div>
          </div>
          <div className="flex gap-3 justify-center">
            <button onClick={() => router.push(`/admin/certificates/${result.id}`)} className="px-5 py-2.5 text-xs font-bold text-white bg-primary hover:bg-primary-hover rounded-xl transition-all">
              Xem chi tiết
            </button>
            <button onClick={() => { setStep("info"); setFormData(initialForm); setResult(null); }} className="px-5 py-2.5 text-xs font-bold text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-300 rounded-xl transition-all">
              Tạo tiếp
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles._1}>
      <div>
        <h1 className={styles._2}>Cấp phát văn bằng mới</h1>
        <p className={styles._3}>Nhập thông tin văn bằng và lưu nháp trước khi gửi duyệt.</p>
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
          Nhập tay
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
          Quét OCR
        </button>
      </div>

      {/* OCR panel */}
      {inputMode === "ocr" && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800/60 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="text-sm font-bold text-gray-900 dark:text-white">Chọn ảnh bằng</div>
            <select
              value={ocrLang}
              onChange={(e) => setOcrLang(e.target.value)}
              className="flex-1 max-w-[160px] px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="vie">Tiếng Việt</option>
              <option value="eng">English</option>
            </select>
          </div>

          {ocrPreview ? (
            <div className="space-y-3">
              <img src={ocrPreview} alt="Preview" className="w-full max-h-48 object-contain rounded-lg border border-gray-200 dark:border-gray-800" />
              {ocrError && <div className="text-[11px] text-red-500 bg-red-50 dark:bg-red-950/20 px-3 py-2 rounded-lg">{ocrError}</div>}
              <div className="flex gap-3">
                <button onClick={handleOcrScan} disabled={ocrScanning} className="px-6 py-2.5 text-xs font-bold text-white bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all">
                  {ocrScanning ? (
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Đang xử lý...
                    </span>
                  ) : "Quét văn bằng"}
                </button>
                <button onClick={() => { setOcrFile(null); setOcrPreview(null); setOcrError(""); }} className="px-4 py-2.5 text-xs font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-all">
                  Làm lại
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
              <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">Kéo thả ảnh vào đây</div>
              <div className="text-[10px] text-gray-400 dark:text-gray-500">hoặc nhấp để chọn file (JPEG, PNG, WebP, TIFF)</div>
              {ocrError && <div className="text-[11px] text-red-500">{ocrError}</div>}
              <input type="file" accept="image/jpeg,image/png,image/webp,image/tiff" onChange={handleOcrFileSelect} className="hidden" />
            </label>
          )}
        </div>
      )}

      {/* Form */}
      <div className={styles._28}>
        <div>
          <label className={styles._29}>Sinh viên *</label>
          {studentsLoading ? (
            <p className="text-xs text-gray-400">Đang tải danh sách sinh viên...</p>
          ) : students.length > 0 ? (
            <select
              className={styles._30}
              value={formData.student_id}
              onChange={(e) => {
                const s = students.find((s) => s.student_id === e.target.value);
                updateField("student_id", e.target.value);
                if (s) updateField("student_fullName", s.student_fullName);
              }}
            >
              <option value="">-- Chọn sinh viên --</option>
              {students.map((s) => (
                <option key={s.student_id} value={s.student_id}>
                  {s.student_fullName} ({s.email})
                </option>
              ))}
            </select>
          ) : (
            <div className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/20 px-3 py-2 rounded-lg">
              {studentsError || "Chưa có sinh viên nào."}{' '}
              <Link href="/admin/students/create" className="underline">Tạo sinh viên</Link> trước khi cấp bằng.
            </div>
          )}
        </div>
        <div>
          <label className={styles._29}>Tên sinh viên</label>
          <input
            type="text"
            className={styles._30}
            value={formData.student_fullName}
            onChange={(e) => updateField("student_fullName", e.target.value)}
          />
        </div>
        <div>
          <label className={styles._29}>Tên văn bằng *</label>
          <input
            type="text"
            className={styles._30}
            placeholder="VD: BẰNG CỬ NHÂN KỸ THUẬT"
            value={formData.certificate_title}
            onChange={(e) => updateField("certificate_title", e.target.value)}
          />
        </div>
        <div>
          <label className={styles._29}>Ngày sinh</label>
          <input type="date" className={styles._30} value={formData.dob} onChange={(e) => updateField("dob", e.target.value)} />
        </div>
        <div>
          <label className={styles._29}>Nơi sinh</label>
          <input type="text" className={styles._30} value={formData.placeOfBirth} onChange={(e) => updateField("placeOfBirth", e.target.value)} />
        </div>
        <div>
          <label className={styles._29}>Giới tính</label>
          <input type="text" className={styles._30} value={formData.gender} onChange={(e) => updateField("gender", e.target.value)} />
        </div>
        <div>
          <label className={styles._29}>Dân tộc</label>
          <input type="text" className={styles._30} value={formData.ethnicity} onChange={(e) => updateField("ethnicity", e.target.value)} />
        </div>
        <div>
          <label className={styles._29}>Trường</label>
          <input type="text" className={styles._30} value={formData.schoolName} onChange={(e) => updateField("schoolName", e.target.value)} />
        </div>
        <div>
          <label className={styles._29}>Niên khóa</label>
          <input type="text" className={styles._30} value={formData.examCohort} onChange={(e) => updateField("examCohort", e.target.value)} />
        </div>
        <div>
          <label className={styles._29}>Hội đồng thi</label>
          <input type="text" className={styles._30} value={formData.examBoard} onChange={(e) => updateField("examBoard", e.target.value)} />
        </div>
        <div>
          <label className={styles._29}>Nơi cấp</label>
          <input type="text" className={styles._30} value={formData.issueLocation} onChange={(e) => updateField("issueLocation", e.target.value)} />
        </div>
        <div>
          <label className={styles._29}>Ngày cấp</label>
          <input type="date" className={styles._30} value={formData.issueDate} onChange={(e) => updateField("issueDate", e.target.value)} />
        </div>
        <div>
          <label className={styles._29}>Số hiệu văn bằng</label>
          <input type="text" className={styles._30} value={formData.serialNumber} onChange={(e) => updateField("serialNumber", e.target.value)} />
        </div>
        <div>
          <label className={styles._29}>Số vào sổ</label>
          <input type="text" className={styles._30} value={formData.registryNumber} onChange={(e) => updateField("registryNumber", e.target.value)} />
        </div>
      </div>

      {error && <div className="text-[11px] text-red-500 bg-red-50 dark:bg-red-950/20 px-4 py-2 rounded-lg">{error}</div>}

      <div className="flex gap-3">
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="px-6 py-2.5 text-xs font-bold text-white bg-primary hover:bg-primary-hover disabled:opacity-50 rounded-xl transition-all"
        >
          {submitting ? "Đang lưu..." : "Lưu nháp (DRAFT)"}
        </button>
        <button
          onClick={() => router.push("/admin/certificates")}
          className="px-4 py-2.5 text-xs font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-all"
        >
          Hủy
        </button>
      </div>
    </div>
  );
}
