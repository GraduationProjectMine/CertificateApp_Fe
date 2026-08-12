"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { templateApi } from "@/features/templates/services/api";
import { issuerApi } from "@/features/issuer/services/issuer.api";
import type { CertificateTemplate, TemplateField, DesignData } from "@/features/templates/types";
import { QRCodeSVG } from "qrcode.react";

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

const FIELD_TEMPLATES = [
  { type: "text" as const, label: "Văn bản", icon: "T" },
  { type: "image" as const, label: "Hình ảnh", icon: "🖼" },
  { type: "qr" as const, label: "Mã QR", icon: "▦" },
  { type: "line" as const, label: "Đường kẻ", icon: "▬" },
  { type: "rect" as const, label: "Hình chữ nhật", icon: "▮" },
];

const FIELD_BINDINGS = [
  { value: "", label: "--- Văn bản tĩnh ---" },
  { value: "student_fullName", label: "Họ tên sinh viên" },
  { value: "certificate_title", label: "Tên văn bằng" },
  { value: "organization_name", label: "Tên tổ chức" },
  { value: "organization_logo", label: "Logo tổ chức" },
  { value: "dob", label: "Ngày sinh" },
  { value: "placeOfBirth", label: "Nơi sinh" },
  { value: "gender", label: "Giới tính" },
  { value: "ethnicity", label: "Dân tộc" },
  { value: "schoolName", label: "Tên trường" },
  { value: "examCohort", label: "Khóa học" },
  { value: "examBoard", label: "Hội đồng thi" },
  { value: "issueLocation", label: "Nơi cấp" },
  { value: "issueDate", label: "Ngày cấp" },
  { value: "serialNumber", label: "Số hiệu" },
  { value: "registryNumber", label: "Số vào sổ" },
  { value: "verification_url", label: "URL xác minh (QR)" },
];

function generateId() { return `fld_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

export default function TemplateEditorPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [template, setTemplate] = useState<CertificateTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [design, setDesign] = useState<DesignData>(DEFAULT_DESIGN);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [templateName, setTemplateName] = useState("");
  const [zoom, setZoom] = useState(0.7);
  const [previewMode, setPreviewMode] = useState(false);
  const [dragging, setDragging] = useState<{ fieldId: string; startX: number; startY: number; origX: number; origY: number } | null>(null);
  const [resizing, setResizing] = useState<{ fieldId: string; dir: string; startX: number; startY: number; origW: number; origH: number } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Dynamic Manual Input Data & Import File State
  const [mockData, setMockData] = useState<Record<string, string>>({
    student_fullName: "Họ và tên",
    certificate_title: "Tên văn bằng",
    dob: "Ngày sinh",
    placeOfBirth: "Nơi sinh",
    gender: "Giới tính",
    ethnicity: "Dân tộc",
    schoolName: "Tên trường",
    examCohort: "Khóa học",
    examBoard: "Hội đồng thi",
    issueLocation: "Nơi cấp",
    issueDate: "Ngày cấp",
    serialNumber: "Số hiệu",
    registryNumber: "Số vào sổ",
    organization_name: "Tên tổ chức",
    verification_url: "https://verify.certchain.edu/cert/sample-id",
  });

  const [organizationLogo, setOrganizationLogo] = useState<string | null>(null);
  const [importedData, setImportedData] = useState<{
    fileName: string;
    totalRows: number;
    rows: Array<{ rowNumber: number; record: Record<string, string>; isValid: boolean }>;
  } | null>(null);
  const [activeRowIndex, setActiveRowIndex] = useState<number>(0);

  useEffect(() => {
    // Fetch organization profile for logo
    issuerApi.getProfile().then((profile) => {
      if (profile && profile.logo_url) {
        setOrganizationLogo(profile.logo_url);
        setMockData((prev) => ({
          ...prev,
          organization_name: profile.organization_name || prev.organization_name,
          organization_logo: profile.logo_url || "",
        }));
      }
    }).catch(() => null);

    if (id === "new") {
      setDesign(DEFAULT_DESIGN);
      setTemplateName("Mẫu văn bằng mới");
      setLoading(false);
      return;
    }
    const fetchTemplate = async () => {
      try {
        const data = await templateApi.get(id);
        setTemplate(data);
        setDesign(data.design_data || DEFAULT_DESIGN);
        setTemplateName(data.name);
      } catch (err: any) {
        alert(err.message || "Failed to load template");
        router.push("/admin/templates");
      } finally {
        setLoading(false);
      }
    };
    fetchTemplate();
  }, [id, router]);

  const selectedField = design.fields.find((f) => f.id === selectedId) || null;

  const updateField = useCallback((fieldId: string, updates: Partial<TemplateField>) => {
    setDesign((prev) => ({
      ...prev,
      fields: prev.fields.map((f) => (f.id === fieldId ? { ...f, ...updates } : f)),
    }));
  }, []);

  const addField = useCallback((type: TemplateField["type"], binding?: string) => {
    const isLine = type === "line";
    const isRect = type === "rect";
    const isImage = type === "image" || binding === "organization_logo";
    const newField: TemplateField = {
      id: generateId(),
      type,
      x: 100,
      y: 100,
      w: type === "qr" ? 70 : isImage ? 100 : isLine ? 150 : isRect ? 150 : 200,
      h: type === "qr" ? 70 : isImage ? 100 : isLine ? 4 : isRect ? 100 : 40,
      font: "sans-serif",
      size: 14,
      color: type === "line" || type === "rect" ? "#c9a84c" : "#333333",
      align: "left",
      text: type === "text" ? "Văn bản" : undefined,
      dynamic: !!binding,
      binding: binding || (type === "image" ? "organization_logo" : undefined),
      src: binding === "organization_logo" || type === "image" ? organizationLogo || undefined : undefined,
    };
    setDesign((prev) => ({ ...prev, fields: [...prev.fields, newField] }));
    setSelectedId(newField.id);
  }, [organizationLogo]);

  const deleteField = useCallback((fieldId: string) => {
    setDesign((prev) => ({ ...prev, fields: prev.fields.filter((f) => f.id !== fieldId) }));
    setSelectedId((prev) => (prev === fieldId ? null : prev));
  }, []);

  const handleCanvasMouseDown = (e: React.MouseEvent, fieldId: string) => {
    const field = design.fields.find((f) => f.id === fieldId);
    if (!field) return;
    setDragging({
      fieldId,
      startX: e.clientX,
      startY: e.clientY,
      origX: field.x,
      origY: field.y,
    });
  };

  const handleResizeStart = (e: React.MouseEvent, fieldId: string, dir: string) => {
    e.stopPropagation();
    const field = design.fields.find((f) => f.id === fieldId);
    if (!field) return;
    setResizing({ fieldId, dir, startX: e.clientX, startY: e.clientY, origW: field.w, origH: field.h });
  };

  useEffect(() => {
    if (!dragging) return;
    let moved = false;
    const handleMouseMove = (e: MouseEvent) => {
      const dx = (e.clientX - dragging.startX) / zoom;
      const dy = (e.clientY - dragging.startY) / zoom;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
        moved = true;
      }
      updateField(dragging.fieldId, { x: dragging.origX + dx, y: dragging.origY + dy });
    };
    const handleMouseUp = () => {
      if (!moved) {
        setSelectedId(dragging.fieldId);
      }
      setDragging(null);
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging, zoom, updateField]);

  useEffect(() => {
    if (!resizing) return;
    const handleMouseMove = (e: MouseEvent) => {
      const dx = (e.clientX - resizing.startX) / zoom;
      const dy = (e.clientY - resizing.startY) / zoom;
      let newW = resizing.origW;
      let newH = resizing.origH;
      if (resizing.dir.includes("e")) newW = Math.max(40, resizing.origW + dx);
      if (resizing.dir.includes("w")) newW = Math.max(40, resizing.origW - dx);
      if (resizing.dir.includes("s")) newH = Math.max(20, resizing.origH + dy);
      if (resizing.dir.includes("n")) newH = Math.max(20, resizing.origH - dy);
      updateField(resizing.fieldId, { w: newW, h: newH });
    };
    const handleMouseUp = () => setResizing(null);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [resizing, zoom, updateField]);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (id === "new") {
        const created = await templateApi.create({ name: templateName, design_data: design as any });
        router.push(`/admin/templates/editor/${created.id}`);
      } else {
        await templateApi.update(id, { name: templateName, design_data: design as any });
        alert("Đã lưu mẫu thành công!");
      }
    } catch (err: any) {
      alert(err.message || "Lưu mẫu thất bại");
    } finally {
      setSaving(false);
    }
  };

  const handleSelectRowIndex = (index: number) => {
    if (!importedData || index < 0 || index >= importedData.rows.length) return;
    setActiveRowIndex(index);
    setMockData((prev) => ({ ...prev, ...importedData.rows[index].record }));
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-400 dark:text-gray-500 text-xs">Đang tải...</div>;
  }

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
      cursor: previewMode ? "default" : "move",
      border: selectedId === field.id && !previewMode ? "2px dashed #3b82f6" : "1px dashed transparent",
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
        const rawVal = field.binding ? mockData[field.binding] : field.src;
        const imgSrc = rawVal || field.src || mockData.organization_logo || organizationLogo;
        if (imgSrc && (imgSrc.startsWith("http") || imgSrc.startsWith("data:") || imgSrc.startsWith("/"))) {
          return (
            <img
              src={imgSrc}
              alt={field.label || "Logo tổ chức"}
              style={{ width: "100%", height: "100%", objectFit: "contain", pointerEvents: "none" }}
            />
          );
        }
        return (
          <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: "1px dashed #cbd5e1", background: "#f8fafc", color: "#64748b", fontSize: 10, padding: 4, textAlign: "center" }}>
            <span style={{ fontSize: 16 }}>🏢 Logo</span>
            <span style={{ fontSize: 9, color: "#94a3b8", marginTop: 2 }}>{organizationLogo ? "Logo tổ chức" : "Chưa có logo trong Cài đặt"}</span>
          </div>
        );
      }
      if (field.type === "qr") {
        const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
        const rawVal = field.binding && mockData[field.binding] ? mockData[field.binding] : mockData.verification_url;
        const qrVal = rawVal || `${baseUrl}/public/verify`;
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
        const val = mockData[field.binding];
        if (val) {
          return <span>{(field.label ? `${field.label} ` : "") + val}</span>;
        }
        const label = FIELD_BINDINGS.find((b) => b.value === field.binding)?.label || field.binding;
        return <span style={{ opacity: previewMode ? 0.4 : 0.7 }}>[{label}]</span>;
      }
      return <span>{field.text || "Văn bản"}</span>;
    })();

    return (
      <div
        style={styles}
        onMouseDown={(e) => {
          if (!previewMode) {
            e.stopPropagation();
            handleCanvasMouseDown(e, field.id);
          }
        }}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        {content}
        {selectedId === field.id && !previewMode && (
          <>
            <div onMouseDown={(e) => handleResizeStart(e, field.id, "se")} style={{ position: "absolute", bottom: -5, right: -5, width: 10, height: 10, background: "#3b82f6", borderRadius: 1, cursor: "nwse-resize" }} />
            <div onMouseDown={(e) => handleResizeStart(e, field.id, "sw")} style={{ position: "absolute", bottom: -5, left: -5, width: 10, height: 10, background: "#3b82f6", borderRadius: 1, cursor: "nesw-resize" }} />
            <div onMouseDown={(e) => handleResizeStart(e, field.id, "ne")} style={{ position: "absolute", top: -5, right: -5, width: 10, height: 10, background: "#3b82f6", borderRadius: 1, cursor: "nesw-resize" }} />
            <div onMouseDown={(e) => handleResizeStart(e, field.id, "nw")} style={{ position: "absolute", top: -5, left: -5, width: 10, height: 10, background: "#3b82f6", borderRadius: 1, cursor: "nwse-resize" }} />
            <div onMouseDown={(e) => { e.stopPropagation(); deleteField(field.id); }} style={{ position: "absolute", top: -12, right: -12, width: 18, height: 18, background: "#ef4444", borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 10, fontWeight: "bold", lineHeight: 1 }}>×</div>
          </>
        )}
      </div>
    );
  };

  const containerWidth = design.page.width;
  const containerHeight = design.page.height;

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-100 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100">
      {/* Top Header Toolbar */}
      <div className="flex items-center justify-between px-6 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-2xs shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/admin/templates")}
            className="bg-transparent border-none cursor-pointer text-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white p-1"
          >
            ←
          </button>
          <input
            type="text"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            className="text-base font-extrabold border-none outline-none bg-transparent text-slate-900 dark:text-white w-70 placeholder-slate-400 dark:placeholder-slate-500"
            placeholder="Tên mẫu văn bằng"
          />
        </div>

        <div className="flex items-center gap-3">
          {/* Zoom controls */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-1 shadow-2xs">
            <button
              onClick={() => setZoom((z) => Math.max(0.3, z - 0.1))}
              className="px-2 py-0.5 text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-bold transition-colors cursor-pointer"
            >
              −
            </button>
            <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 min-w-[36px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(1.5, z + 0.1))}
              className="px-2 py-0.5 text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-bold transition-colors cursor-pointer"
            >
              +
            </button>
          </div>

          {/* Mode Switcher */}
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className={`px-4 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-95 ${
              previewMode
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
            }`}
          >
            {previewMode ? "📐 Thiết kế mẫu" : "👁 Xem & Nhập liệu"}
          </button>

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={saving || !templateName.trim()}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold transition-all shadow-2xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
          >
            {saving ? "Đang lưu..." : "Lưu mẫu"}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Side Panel: Template Editor toolbox OR Manual Input & File Selector */}
        {!previewMode ? (
          <div className="w-56 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-4 overflow-y-auto shrink-0">
            <h3 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
              Thêm trường
            </h3>
            <button
              onClick={() => addField("image", "organization_logo")}
              className="flex items-center gap-2.5 w-full p-2.5 mb-2.5 rounded-xl border border-blue-200 dark:border-blue-800/40 bg-blue-50 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-bold cursor-pointer transition-all active:scale-95 shadow-2xs"
            >
              <span className="text-base">🏢</span>
              <span>Logo tổ chức</span>
            </button>
            {FIELD_TEMPLATES.map((ft) => (
              <button
                key={ft.type}
                onClick={() => addField(ft.type)}
                className="flex items-center gap-2.5 w-full p-2.5 mb-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 text-slate-700 dark:text-slate-200 text-xs font-semibold cursor-pointer transition-all active:scale-95 shadow-2xs"
              >
                <span className="text-base">{ft.icon}</span>
                <span>{ft.label}</span>
              </button>
            ))}
            <h3 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-5 mb-3">
              Các trường ({design.fields.length})
            </h3>
            {design.fields.map((f) => (
              <div
                key={f.id}
                onClick={() => setSelectedId(f.id)}
                className={`p-2 rounded-xl text-xs font-medium cursor-pointer transition-all flex items-center justify-between mb-1 ${
                  selectedId === f.id
                    ? "bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/40 text-blue-600 dark:text-blue-400 font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                }`}
              >
                <span className="font-semibold truncate max-w-[120px]">
                  {f.binding ? FIELD_BINDINGS.find((b) => b.value === f.binding)?.label || f.binding : f.text || "Văn bản"}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500">{f.type}</span>
              </div>
            ))}
          </div>
        ) : (
          /* Manual Input & Import Record Navigation Side Panel */
          <div className="w-80 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-4 overflow-y-auto shrink-0">
            <div className="mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-extrabold text-slate-900 dark:text-white mb-1">
                Nhập dữ liệu văn bằng
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Nhập tay hoặc chọn bản ghi từ file CSV/Excel để nạp vào phôi văn bằng.
              </p>
            </div>

            {/* Imported File Record Selector */}
            {importedData && (
              <div className="mb-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 p-3 rounded-xl shadow-2xs text-emerald-800 dark:text-emerald-300">
                <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300 mb-1.5 truncate">
                  📁 {importedData.fileName} ({importedData.totalRows} bản ghi)
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleSelectRowIndex(activeRowIndex - 1)}
                    disabled={activeRowIndex <= 0}
                    className="px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs cursor-pointer disabled:opacity-40"
                  >
                    ◄
                  </button>
                  <select
                    value={activeRowIndex}
                    onChange={(e) => handleSelectRowIndex(Number(e.target.value))}
                    className="flex-1 px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:outline-none cursor-pointer truncate"
                  >
                    {importedData.rows.map((r, i) => (
                      <option key={i} value={i} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">
                        Dòng {r.rowNumber}: {r.record.student_fullName || r.record.student_id || `Bản ghi ${r.rowNumber}`}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleSelectRowIndex(activeRowIndex + 1)}
                    disabled={activeRowIndex >= importedData.rows.length - 1}
                    className="px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs cursor-pointer disabled:opacity-40"
                  >
                    ►
                  </button>
                </div>
              </div>
            )}

            {/* Manual Form Inputs for Certificate Fields */}
            <div className="flex flex-col gap-2.5">
              {[
                { key: "student_fullName", label: "Họ và tên sinh viên" },
                { key: "certificate_title", label: "Tên văn bằng" },
                { key: "organization_name", label: "Tên tổ chức / Trường" },
                { key: "dob", label: "Ngày sinh" },
                { key: "placeOfBirth", label: "Nơi sinh" },
                { key: "gender", label: "Giới tính" },
                { key: "ethnicity", label: "Dân tộc" },
                { key: "schoolName", label: "Đơn vị đào tạo" },
                { key: "examCohort", label: "Khóa học" },
                { key: "examBoard", label: "Hội đồng thi" },
                { key: "issueLocation", label: "Nơi cấp" },
                { key: "issueDate", label: "Ngày cấp" },
                { key: "serialNumber", label: "Số hiệu" },
                { key: "registryNumber", label: "Số vào sổ" },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    {label}
                  </label>
                  <input
                    type="text"
                    value={mockData[key] || ""}
                    onChange={(e) => setMockData((prev) => ({ ...prev, [key]: e.target.value }))}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder={`Nhập ${label.toLowerCase()}...`}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Center Canvas Workspace */}
        <div className="flex-1 flex items-center justify-center overflow-auto p-6 bg-slate-100 dark:bg-slate-950 transition-colors">
          <div
            ref={canvasRef}
            onClick={() => { if (!previewMode) setSelectedId(null); }}
            style={{
              position: "relative",
              width: containerWidth,
              height: containerHeight,
              background: design.page.bgColor,
              transform: `scale(${zoom})`,
              transformOrigin: "center center",
              boxShadow: "0 4px 24px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.06)",
              borderRadius: 4,
              overflow: "hidden",
              flexShrink: 0,
            }}
          >
            {design.decorations.map((dec, i) => {
              if (dec.type === "border") {
                return (
                  <div
                    key={`dec_${i}`}
                    style={{
                      position: "absolute", inset: dec.offset || 0,
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
                      position: "absolute", inset: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      pointerEvents: "none", opacity: dec.opacity || 0.05,
                      fontSize: dec.size || 60, fontFamily: dec.font || "serif",
                      color: "#000",
                    }}
                  >
                    {dec.text}
                  </div>
                );
              }
              return null;
            })}
            {design.fields.map((field) => (
              <React.Fragment key={field.id}>{renderFieldContent(field)}</React.Fragment>
            ))}
          </div>
        </div>

        {/* Right Properties Panel when in Design Mode */}
        {!previewMode && selectedField && (
          <div className="w-72 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 p-4 overflow-y-auto text-slate-900 dark:text-slate-100 shrink-0">
            <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
              Thuộc tính trường
            </h3>

            {/* Field Type Selector */}
            <div className="mb-3.5">
              <label className="block text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                Loại trường
              </label>
              <select
                value={selectedField.type}
                onChange={(e) => updateField(selectedField.id, { type: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:outline-none cursor-pointer"
              >
                <option value="text" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Văn bản</option>
                <option value="image" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Hình ảnh / Logo</option>
                <option value="qr" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Mã QR</option>
                <option value="line" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Đường kẻ</option>
                <option value="rect" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Hình chữ nhật</option>
              </select>
            </div>

            {/* Dynamic Binding Selector */}
            {selectedField.type !== "line" && selectedField.type !== "rect" && (
              <div className="mb-3.5">
                <label className="block text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                  Dữ liệu động (Binding)
                </label>
                <select
                  value={selectedField.binding || ""}
                  onChange={(e) => updateField(selectedField.id, { binding: e.target.value || undefined, dynamic: !!e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:outline-none cursor-pointer"
                >
                  {FIELD_BINDINGS.map((b) => (
                    <option key={b.value} value={b.value} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">
                      {b.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Missing Organization Logo Alert if not configured */}
            {!organizationLogo && (selectedField.type === "image" || selectedField.binding === "organization_logo") && (
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 p-2.5 rounded-xl text-xs text-amber-800 dark:text-amber-300 mb-3.5">
                <div>⚠️ Chưa có logo trong Cài đặt tổ chức.</div>
                <Link href="/admin/settings" target="_blank" className="text-amber-600 dark:text-amber-400 font-bold underline mt-1 inline-block">
                  👉 Tải logo tại Cài đặt (Settings)
                </Link>
              </div>
            )}

            {/* Static Text Content */}
            {!selectedField.dynamic && selectedField.type === "text" && (
              <div className="mb-3.5">
                <label className="block text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                  Nội dung văn bản
                </label>
                <input
                  type="text"
                  value={selectedField.text || ""}
                  onChange={(e) => updateField(selectedField.id, { text: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>
            )}

            {/* Line / Rect Colors */}
            {(selectedField.type === "line" || selectedField.type === "rect") && (
              <div className="mb-3.5">
                <label className="block text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                  Màu sắc
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={selectedField.color || "#c9a84c"}
                    onChange={(e) => updateField(selectedField.id, { color: e.target.value })}
                    className="w-9 h-9 p-0.5 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 cursor-pointer overflow-hidden shrink-0"
                  />
                  <input
                    type="text"
                    value={selectedField.color || "#c9a84c"}
                    onChange={(e) => updateField(selectedField.id, { color: e.target.value })}
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-mono focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Text Styling Controls */}
            {selectedField.type === "text" && (
              <>
                {/* Font Family */}
                <div className="mb-3.5">
                  <label className="block text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                    Phông chữ
                  </label>
                  <select
                    value={selectedField.font || "sans-serif"}
                    onChange={(e) => updateField(selectedField.id, { font: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:outline-none cursor-pointer"
                  >
                    <option value="sans-serif" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Sans-serif (Mặc định)</option>
                    <option value="serif" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Serif (Cổ điển)</option>
                    <option value="monospace" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Monospace (Mã số)</option>
                    <option value="script" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Script (Nghệ thuật)</option>
                  </select>
                </div>

                {/* Text Size Editor with Stepper & Quick Presets */}
                <div className="mb-3.5">
                  <label className="block text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                    Cỡ chữ (px)
                  </label>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <button
                      onClick={() => updateField(selectedField.id, { size: Math.max(8, (selectedField.size || 14) - 1) })}
                      className="w-8 h-8 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-base font-bold flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer active:scale-95 transition-all"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      value={selectedField.size || 14}
                      onChange={(e) => updateField(selectedField.id, { size: Math.max(8, Number(e.target.value)) })}
                      min={8}
                      max={120}
                      className="flex-1 h-8 text-center rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-bold focus:outline-none"
                    />
                    <button
                      onClick={() => updateField(selectedField.id, { size: Math.min(120, (selectedField.size || 14) + 1) })}
                      className="w-8 h-8 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-base font-bold flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer active:scale-95 transition-all"
                    >
                      +
                    </button>
                  </div>
                  {/* Preset font size chips */}
                  <div className="flex gap-1 flex-wrap">
                    {[10, 12, 14, 18, 24, 32, 48].map((s) => (
                      <button
                        key={s}
                        onClick={() => updateField(selectedField.id, { size: s })}
                        className={`px-2 py-0.5 rounded-lg border text-[10px] font-semibold cursor-pointer transition-all ${
                          selectedField.size === s
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400"
                            : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Text Color */}
                <div className="mb-3.5">
                  <label className="block text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                    Màu văn bản
                  </label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={selectedField.color || "#333333"}
                      onChange={(e) => updateField(selectedField.id, { color: e.target.value })}
                      className="w-9 h-9 p-0.5 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 cursor-pointer overflow-hidden shrink-0"
                    />
                    <input
                      type="text"
                      value={selectedField.color || "#333333"}
                      onChange={(e) => updateField(selectedField.id, { color: e.target.value })}
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-mono focus:outline-none"
                    />
                  </div>
                </div>

                {/* Style & Alignment Toolbar */}
                <div className="mb-3.5">
                  <label className="block text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                    Định dạng & Căn chỉnh
                  </label>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => updateField(selectedField.id, { bold: !selectedField.bold })}
                      className={`w-9 h-9 rounded-xl border text-sm font-bold cursor-pointer transition-all ${
                        selectedField.bold
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400"
                          : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                      }`}
                      title="In đậm"
                    >
                      B
                    </button>
                    <button
                      onClick={() => updateField(selectedField.id, { italic: !selectedField.italic })}
                      className={`w-9 h-9 rounded-xl border text-sm italic cursor-pointer transition-all ${
                        selectedField.italic
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400"
                          : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                      }`}
                      title="In nghiêng"
                    >
                      I
                    </button>

                    <div className="w-[1px] bg-slate-200 dark:bg-slate-700 my-1 mx-0.5" />

                    {(["left", "center", "right"] as const).map((a) => (
                      <button
                        key={a}
                        onClick={() => updateField(selectedField.id, { align: a })}
                        className={`flex-1 h-9 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                          selectedField.align === a
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400"
                            : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                        }`}
                        title={a === "left" ? "Căn trái" : a === "center" ? "Căn giữa" : "Căn phải"}
                      >
                        {a === "left" ? "⬅" : a === "center" ? "↔" : "➡"}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Position & Size */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-3.5 mt-3.5">
              <h4 className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                Vị trí & Kích thước
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {(["x", "y", "w", "h"] as const).map((prop) => (
                  <div key={prop}>
                    <label className="block text-[9px] font-semibold text-slate-400 dark:text-slate-500 uppercase mb-1">
                      {prop}
                    </label>
                    <input
                      type="number"
                      value={selectedField[prop]}
                      onChange={(e) => updateField(selectedField.id, { [prop]: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions (Duplicate & Delete) */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-3.5 mt-3.5 space-y-2">
              <h4 className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Thao tác trường
              </h4>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const newField: TemplateField = {
                      ...selectedField,
                      id: generateId(),
                      x: selectedField.x + 15,
                      y: selectedField.y + 15,
                    };
                    setDesign((prev) => ({ ...prev, fields: [...prev.fields, newField] }));
                    setSelectedId(newField.id);
                  }}
                  className="flex-1 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold cursor-pointer transition-all active:scale-95"
                >
                  📋 Nhân bản
                </button>
                <button
                  onClick={() => deleteField(selectedField.id)}
                  className="flex-1 py-2 rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 text-xs font-bold cursor-pointer transition-all active:scale-95"
                >
                  🗑 Xóa trường
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
