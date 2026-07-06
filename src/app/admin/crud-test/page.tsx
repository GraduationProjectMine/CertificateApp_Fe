"use client";

import React, { useState, useEffect } from "react";
import { certificateApi } from "@/features/certificates/services/certificate.api";
import { studentApi, type StudentDto } from "@/features/students/services/student.api";

interface StudentCache {
  student_id: string;
  student_fullName: string;
  email: string;
}

export default function CrudTestPage() {
  const [students, setStudents] = useState<StudentCache[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [title, setTitle] = useState("VĂN BẰNG CỬ NHÂN CÔNG NGHỆ THÔNG TIN");
  const [serialNumber, setSerialNumber] = useState("SN-99999");
  const [registryNumber, setRegistryNumber] = useState("REG-99999");

  // Manual actions responses
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Automated test flow status
  const [testSteps, setTestSteps] = useState<{
    create: "idle" | "running" | "success" | "failed";
    read: "idle" | "running" | "success" | "failed";
    update: "idle" | "running" | "success" | "failed";
    delete: "idle" | "running" | "success" | "failed";
  }>({
    create: "idle",
    read: "idle",
    update: "idle",
    delete: "idle",
  });
  const [testLogs, setTestLogs] = useState<string[]>([]);
  const [createdCertId, setCreatedCertId] = useState<string>("");

  useEffect(() => {
    // Load students from localStorage to populate selection
    if (typeof window !== "undefined") {
      try {
        const stored = JSON.parse(localStorage.getItem("students") || "[]");
        setStudents(stored);
        if (stored.length > 0) {
          setSelectedStudentId(stored[0].student_id);
        }
      } catch (err) {
        console.error("Failed to load students", err);
      }
    }
  }, []);

  const addLog = (msg: string) => {
    setTestLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const handleAutoTest = async () => {
    if (!selectedStudentId) {
      setError("Vui lòng chọn hoặc tạo sinh viên trước khi chạy test.");
      return;
    }
    setError("");
    setTestLogs([]);
    setTestSteps({ create: "idle", read: "idle", update: "idle", delete: "idle" });
    let tempCertId = "";

    try {
      // 1. CREATE DRAFT
      setTestSteps((prev) => ({ ...prev, create: "running" }));
      addLog("Khởi chạy: Tạo chứng chỉ nháp (CREATE DRAFT)...");
      const draft = await certificateApi.createDraft({
        student_id: selectedStudentId,
        certificate_title: title,
        serialNumber,
        registryNumber,
        dob: "2000-01-01",
        placeOfBirth: "Hà Nội",
        gender: "Nam",
        ethnicity: "Kinh",
        schoolName: "Đại học Bách Khoa Hà Nội",
        examCohort: "2018-2023",
        examBoard: "Hội đồng CNTT",
        issueLocation: "Hà Nội",
        issueDate: new Date().toISOString().split("T")[0],
      });
      tempCertId = draft.certificate_id;
      setCreatedCertId(draft.certificate_id);
      setTestSteps((prev) => ({ ...prev, create: "success" }));
      addLog(`CREATE DRAFT thành công! Mã chứng chỉ mới: ${draft.certificate_id}`);

      // 2. READ DETAILS
      setTestSteps((prev) => ({ ...prev, read: "running" }));
      addLog(`Khởi chạy: Lấy thông tin chứng chỉ (READ) với ID: ${tempCertId}...`);
      const details = await certificateApi.get(tempCertId);
      setTestSteps((prev) => ({ ...prev, read: "success" }));
      addLog(`READ thành công! Tiêu đề chứng chỉ đọc được: "${details.certificate_title}"`);

      // 3. UPDATE STATUS TO PENDING
      setTestSteps((prev) => ({ ...prev, update: "running" }));
      addLog(`Khởi chạy: Cập nhật trạng thái chứng chỉ sang PENDING (UPDATE)...`);
      const updated = await certificateApi.updateStatus(tempCertId, "PENDING");
      setTestSteps((prev) => ({ ...prev, update: "success" }));
      addLog(`UPDATE thành công! Trạng thái mới: ${updated.status}`);

      // 4. DELETE DRAFT
      setTestSteps((prev) => ({ ...prev, delete: "running" }));
      addLog(`Khởi chạy: Xóa chứng chỉ nháp (DELETE) với ID: ${tempCertId}...`);
      const delResult = await certificateApi.delete(tempCertId);
      setTestSteps((prev) => ({ ...prev, delete: "success" }));
      addLog(`DELETE thành công! Kết quả phản hồi: ${delResult.message || "Đã xóa"}`);
      setCreatedCertId("");
    } catch (err: any) {
      addLog(`Lỗi kiểm tra CRUD: ${err.message}`);
      // Find which step failed
      setTestSteps((prev) => {
        if (prev.create === "running") return { ...prev, create: "failed" };
        if (prev.read === "running") return { ...prev, read: "failed" };
        if (prev.update === "running") return { ...prev, update: "failed" };
        if (prev.delete === "running") return { ...prev, delete: "failed" };
        return prev;
      });
    }
  };

  const handleManualCreate = async () => {
    if (!selectedStudentId) {
      setError("Vui lòng chọn một sinh viên");
      return;
    }
    setLoading(true);
    setError("");
    setApiResponse(null);
    try {
      const res = await certificateApi.createDraft({
        student_id: selectedStudentId,
        certificate_title: title,
        serialNumber,
        registryNumber,
        dob: "2000-01-01",
        placeOfBirth: "Hà Nội",
        gender: "Nam",
      });
      setCreatedCertId(res.certificate_id);
      setApiResponse(res);
    } catch (err: any) {
      setError(err.message || "Tạo nháp thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleManualRead = async () => {
    if (!createdCertId) {
      setError("Vui lòng tạo nháp hoặc nhập ID chứng chỉ thủ công");
      return;
    }
    setLoading(true);
    setError("");
    setApiResponse(null);
    try {
      const res = await certificateApi.get(createdCertId);
      setApiResponse(res);
    } catch (err: any) {
      setError(err.message || "Đọc thông tin thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleManualUpdate = async () => {
    if (!createdCertId) {
      setError("Vui lòng tạo nháp hoặc nhập ID chứng chỉ thủ công");
      return;
    }
    setLoading(true);
    setError("");
    setApiResponse(null);
    try {
      const res = await certificateApi.updateStatus(createdCertId, "PENDING");
      setApiResponse(res);
    } catch (err: any) {
      setError(err.message || "Cập nhật thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleManualDelete = async () => {
    if (!createdCertId) {
      setError("Vui lòng tạo nháp hoặc nhập ID chứng chỉ thủ công");
      return;
    }
    setLoading(true);
    setError("");
    setApiResponse(null);
    try {
      const res = await certificateApi.delete(createdCertId);
      setApiResponse(res);
      setCreatedCertId("");
    } catch (err: any) {
      setError(err.message || "Xóa thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">Kiểm tra kết nối CRUD API</h1>
        <p className="text-sm text-gray-500">
          Chạy các kịch bản kiểm tra Tạo (Create), Đọc (Read), Cập nhật (Update), Xóa (Delete) văn bằng để xác nhận frontend và backend kết nối chính xác.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Form Inputs */}
        <div className="md:col-span-1 bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800/60 rounded-2xl p-5 space-y-4 shadow-sm">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-2">
            Tham số Kiểm thử
          </h2>

          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-gray-500 mb-1">Sinh viên kiểm tra *</label>
              {students.length > 0 ? (
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {students.map((s) => (
                    <option key={s.student_id} value={s.student_id}>
                      {s.student_fullName} ({s.student_id.slice(0, 8)}...)
                    </option>
                  ))}
                </select>
              ) : (
                <div className="text-[10px] text-amber-600 bg-amber-50 dark:bg-amber-950/20 p-2.5 rounded-lg">
                  Không tìm thấy sinh viên nào trong localStorage. Vui lòng tạo sinh viên mới ở mục "Sinh viên" trước.
                </div>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-500 mb-1">Tên văn bằng</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-500 mb-1">Số hiệu văn bằng</label>
              <input
                type="text"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-500 mb-1">Số vào sổ</label>
              <input
                type="text"
                value={registryNumber}
                onChange={(e) => setRegistryNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-500 mb-1">Mã chứng chỉ đang thao tác (ID)</label>
              <input
                type="text"
                placeholder="Tự động tạo hoặc điền ID thủ công"
                value={createdCertId}
                onChange={(e) => setCreatedCertId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* Center/Right Column: Verification & Logs */}
        <div className="md:col-span-2 space-y-6">
          {/* Automated test suite */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800/60 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-2">
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">Kiểm thử tự động chuỗi CRUD</h2>
              <button
                onClick={handleAutoTest}
                className="px-4 py-2 text-xs font-bold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-sm transition-all"
              >
                Chạy kiểm thử tự động
              </button>
            </div>

            {/* Steps statuses */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(["create", "read", "update", "delete"] as const).map((step) => {
                const status = testSteps[step];
                const labels: Record<string, string> = {
                  create: "Create Draft",
                  read: "Read Details",
                  update: "Update Status",
                  delete: "Delete Draft",
                };
                return (
                  <div
                    key={step}
                    className={`p-3 rounded-xl border text-center space-y-1 transition-all ${
                      status === "success"
                        ? "bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-400"
                        : status === "failed"
                          ? "bg-red-500/10 border-red-500/30 text-red-500"
                          : status === "running"
                            ? "bg-primary/10 border-primary/30 text-primary animate-pulse"
                            : "bg-slate-100 dark:bg-gray-800/50 border-gray-200 dark:border-gray-800 text-gray-400"
                    }`}
                  >
                    <div className="text-[10px] uppercase font-bold tracking-wider">{labels[step]}</div>
                    <div className="text-xs font-semibold">
                      {status === "idle" && "Chờ chạy..."}
                      {status === "running" && "Đang xử lý..."}
                      {status === "success" && "✓ Hoàn thành"}
                      {status === "failed" && "✗ Thất bại"}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Test Log output */}
            <div className="bg-slate-900 text-gray-300 font-mono text-[11px] p-3 rounded-xl max-h-36 overflow-y-auto space-y-1 border border-slate-800">
              {testLogs.length === 0 ? (
                <div className="text-gray-500 italic">Logs kiểm thử sẽ hiển thị tại đây khi bạn chạy test...</div>
              ) : (
                testLogs.map((log, idx) => <div key={idx}>{log}</div>)
              )}
            </div>
          </div>

          {/* Manual controls & response viewer */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800/60 rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-2">
              Thao tác CRUD Thủ công
            </h2>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleManualCreate}
                disabled={loading}
                className="px-3.5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg disabled:opacity-50 transition-all"
              >
                1. Create Draft
              </button>
              <button
                onClick={handleManualRead}
                disabled={loading || !createdCertId}
                className="px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 transition-all"
              >
                2. Read Details
              </button>
              <button
                onClick={handleManualUpdate}
                disabled={loading || !createdCertId}
                className="px-3.5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg disabled:opacity-50 transition-all"
              >
                3. Update to Pending
              </button>
              <button
                onClick={handleManualDelete}
                disabled={loading || !createdCertId}
                className="px-3.5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50 transition-all"
              >
                4. Delete Draft
              </button>
            </div>

            {/* Error output */}
            {error && (
              <div className="p-3 text-xs text-red-500 bg-red-50 dark:bg-red-950/20 border border-red-200/30 rounded-xl">
                {error}
              </div>
            )}

            {/* API response print */}
            <div className="space-y-2">
              <div className="text-[11px] font-bold text-gray-500">Kết quả phản hồi API:</div>
              <pre className="bg-gray-50 dark:bg-slate-950 text-xs p-4 rounded-xl overflow-x-auto text-gray-800 dark:text-gray-300 font-mono border border-gray-200/40 dark:border-gray-800/40 max-h-60">
                {loading ? (
                  <span className="text-gray-400 italic">Đang gọi API...</span>
                ) : apiResponse ? (
                  JSON.stringify(apiResponse, null, 2)
                ) : (
                  <span className="text-gray-400 italic">Chưa có dữ liệu phản hồi.</span>
                )}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
