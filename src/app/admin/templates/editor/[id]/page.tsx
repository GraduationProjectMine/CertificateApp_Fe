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
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 64px)", background: "var(--page-bg)", fontFamily: "sans-serif", color: "var(--text-main)", transition: "background 0.3s, color 0.3s" }}>
      {/* Top Header Toolbar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 24px", background: "var(--surface)", borderBottom: "1px solid var(--border)", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button onClick={() => router.push("/admin/templates")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "var(--text-secondary)", padding: 4 }}>←</button>
          <input
            type="text"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            style={{ fontSize: 16, fontWeight: 700, border: "none", outline: "none", background: "transparent", color: "var(--text-body)", width: 280 }}
            placeholder="Tên mẫu văn bằng"
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Zoom controls */}
          <div style={{ display: "flex", alignItems: "center", gap: 4, background: "var(--page-bg)", borderRadius: 8, padding: "2px" }}>
            <button onClick={() => setZoom((z) => Math.max(0.3, z - 0.1))} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px 8px", fontSize: 12, color: "var(--text-secondary)" }}>−</button>
            <span style={{ fontSize: 11, color: "var(--text-secondary)", minWidth: 36, textAlign: "center" }}>{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom((z) => Math.min(1.5, z + 0.1))} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px 8px", fontSize: 12, color: "var(--text-secondary)" }}>+</button>
          </div>

          {/* Mode Switcher */}
          <button
            onClick={() => setPreviewMode(!previewMode)}
            style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid var(--border)", background: previewMode ? "#3b82f6" : "var(--surface)", color: previewMode ? "#fff" : "var(--text-secondary)", cursor: "pointer", fontSize: 12, fontWeight: 600 }}
          >
            {previewMode ? "📐 Thiết kế mẫu" : "👁 Xem & Nhập liệu"}
          </button>

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={saving || !templateName.trim()}
            style={{ padding: "8px 20px", borderRadius: 8, border: "none", background: saving ? "#94a3b8" : "#3b82f6", color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 700, opacity: saving || !templateName.trim() ? 0.6 : 1 }}
          >
            {saving ? "Đang lưu..." : "Lưu mẫu"}
          </button>
        </div>
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Left Side Panel: Template Editor toolbox OR Manual Input & File Selector */}
        {!previewMode ? (
          <div style={{ width: 220, background: "var(--surface)", borderRight: "1px solid var(--border)", padding: 16, overflowY: "auto" }}>
            <h3 style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Thêm trường</h3>
            <button
              onClick={() => addField("image", "organization_logo")}
              style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 14px", marginBottom: 10, borderRadius: 10, border: "1px solid #3b82f6", background: "var(--surface-active)", cursor: "pointer", fontSize: 13, color: "var(--surface-active-text)", fontWeight: 700, transition: "all 0.15s" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(59, 130, 246, 0.25)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "var(--surface-active)"; }}
            >
              <span style={{ fontSize: 16 }}>🏢</span>
              <span>Logo tổ chức</span>
            </button>
            {FIELD_TEMPLATES.map((ft) => (
              <button
                key={ft.type}
                onClick={() => addField(ft.type)}
                style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 14px", marginBottom: 6, borderRadius: 10, border: "1px solid var(--border)", background: "var(--surface)", cursor: "pointer", fontSize: 13, color: "var(--text-body)", transition: "all 0.15s" }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#3b82f6"; e.currentTarget.style.background = "var(--surface-active)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "var(--surface)"; }}
              >
                <span style={{ fontSize: 16 }}>{ft.icon}</span>
                <span>{ft.label}</span>
              </button>
            ))}
            <h3 style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, margin: "20px 0 12px" }}>Các trường ({design.fields.length})</h3>
            {design.fields.map((f) => (
              <div
                key={f.id}
                onClick={() => setSelectedId(f.id)}
                style={{ padding: "8px 12px", borderRadius: 8, cursor: "pointer", fontSize: 12, color: selectedId === f.id ? "#3b82f6" : "var(--text-secondary)", background: selectedId === f.id ? "var(--surface-active)" : "transparent", marginBottom: 4, display: "flex", alignItems: "center", justifyContent: "space-between" }}
              >
                <span style={{ fontWeight: 500 }}>{f.binding ? FIELD_BINDINGS.find((b) => b.value === f.binding)?.label || f.binding : f.text || "Văn bản"}</span>
                <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{f.type}</span>
              </div>
            ))}
          </div>
        ) : (
          /* Manual Input & Import Record Navigation Side Panel */
          <div style={{ width: 320, background: "var(--surface)", borderRight: "1px solid var(--border)", padding: 16, overflowY: "auto" }}>
            <div style={{ marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid var(--border-subtle)" }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-main)", marginBottom: 4 }}>Nhập dữ liệu văn bằng</h3>
              <p style={{ fontSize: 11, color: "var(--text-secondary)" }}>Nhập tay hoặc chọn bản ghi từ file CSV/Excel để nạp vào phôi văn bằng.</p>
            </div>

            {/* Imported File Record Selector */}
            {importedData && (
              <div style={{ marginBottom: 16, background: "var(--success-bg)", border: "1px solid var(--success-border)", padding: 12, borderRadius: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--success-text)", marginBottom: 6 }}>
                  📁 {importedData.fileName} ({importedData.totalRows} bản ghi)
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <button
                    onClick={() => handleSelectRowIndex(activeRowIndex - 1)}
                    disabled={activeRowIndex <= 0}
                    style={{ padding: "4px 8px", borderRadius: 6, border: "1px solid var(--border-strong)", background: "var(--surface)", color: "var(--text-main)", fontSize: 11, cursor: "pointer", opacity: activeRowIndex <= 0 ? 0.4 : 1 }}
                  >
                    ◄
                  </button>
                  <select
                    value={activeRowIndex}
                    onChange={(e) => handleSelectRowIndex(Number(e.target.value))}
                    style={{ flex: 1, padding: "4px 8px", borderRadius: 6, border: "1px solid var(--border-strong)", fontSize: 11, background: "var(--surface)", color: "var(--text-main)" }}
                  >
                    {importedData.rows.map((r, i) => (
                      <option key={i} value={i} style={{ background: "var(--surface)", color: "var(--text-main)" }}>
                        Dòng {r.rowNumber}: {r.record.student_fullName || r.record.student_id || `Bản ghi ${r.rowNumber}`}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleSelectRowIndex(activeRowIndex + 1)}
                    disabled={activeRowIndex >= importedData.rows.length - 1}
                    style={{ padding: "4px 8px", borderRadius: 6, border: "1px solid var(--border-strong)", background: "var(--surface)", color: "var(--text-main)", fontSize: 11, cursor: "pointer", opacity: activeRowIndex >= importedData.rows.length - 1 ? 0.4 : 1 }}
                  >
                    ►
                  </button>
                </div>
              </div>
            )}

            {/* Manual Form Inputs for Certificate Fields */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
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
                  <label style={{ display: "block", fontSize: 10, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 3 }}>{label}</label>
                  <input
                    type="text"
                    value={mockData[key] || ""}
                    onChange={(e) => setMockData((prev) => ({ ...prev, [key]: e.target.value }))}
                    style={{ width: "100%", padding: "7px 10px", borderRadius: 8, border: "1px solid var(--border-strong)", fontSize: 12, color: "var(--text-body)", background: "var(--surface)", outline: "none" }}
                    placeholder={`Nhập ${label.toLowerCase()}...`}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Center Canvas Workspace */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", overflow: "auto", padding: 24, background: "var(--page-bg)" }}>
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
          <div style={{ width: 280, background: "var(--surface)", borderLeft: "1px solid var(--border)", padding: 16, overflowY: "auto" }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-body)", marginBottom: 16 }}>Thuộc tính trường</h3>

            {/* Field Type Selector */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 10, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Loại trường</label>
              <select
                value={selectedField.type}
                onChange={(e) => updateField(selectedField.id, { type: e.target.value as any })}
                style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 12, color: "var(--text-main)", background: "var(--surface)", outline: "none" }}
              >
                <option value="text" style={{ background: "var(--surface)", color: "var(--text-main)" }}>Văn bản</option>
                <option value="image" style={{ background: "var(--surface)", color: "var(--text-main)" }}>Hình ảnh / Logo</option>
                <option value="qr" style={{ background: "var(--surface)", color: "var(--text-main)" }}>Mã QR</option>
                <option value="line" style={{ background: "var(--surface)", color: "var(--text-main)" }}>Đường kẻ</option>
                <option value="rect" style={{ background: "var(--surface)", color: "var(--text-main)" }}>Hình chữ nhật</option>
              </select>
            </div>

            {/* Dynamic Binding Selector */}
            {selectedField.type !== "line" && selectedField.type !== "rect" && (
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 10, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Dữ liệu động (Binding)</label>
                <select
                  value={selectedField.binding || ""}
                  onChange={(e) => updateField(selectedField.id, { binding: e.target.value || undefined, dynamic: !!e.target.value })}
                  style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 12, color: "var(--text-main)", background: "var(--surface)", outline: "none" }}
                >
                  {FIELD_BINDINGS.map((b) => (
                    <option key={b.value} value={b.value} style={{ background: "var(--surface)", color: "var(--text-main)" }}>{b.label}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Missing Organization Logo Alert if not configured */}
            {!organizationLogo && (selectedField.type === "image" || selectedField.binding === "organization_logo") && (
              <div style={{ background: "var(--warning-bg)", border: "1px solid var(--warning-border)", padding: 10, borderRadius: 8, fontSize: 11, color: "var(--warning-text)", marginBottom: 14 }}>
                <div>⚠️ Chưa có logo trong Cài đặt tổ chức.</div>
                <Link href="/admin/settings" target="_blank" style={{ color: "var(--warning-text)", fontWeight: 700, textDecoration: "underline", marginTop: 4, display: "inline-block" }}>
                  👉 Tải logo tại Cài đặt (Settings)
                </Link>
              </div>
            )}

            {/* Static Text Content */}
            {!selectedField.dynamic && selectedField.type === "text" && (
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 10, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Nội dung văn bản</label>
                <input
                  type="text"
                  value={selectedField.text || ""}
                  onChange={(e) => updateField(selectedField.id, { text: e.target.value })}
                  style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 12, color: "var(--text-main)", background: "var(--surface)", outline: "none" }}
                />
              </div>
            )}

            {/* Line / Rect Colors */}
            {(selectedField.type === "line" || selectedField.type === "rect") && (
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 10, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Màu sắc</label>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <input
                    type="color"
                    value={selectedField.color || "#c9a84c"}
                    onChange={(e) => updateField(selectedField.id, { color: e.target.value })}
                    style={{ width: 36, height: 36, padding: 0, border: "1px solid var(--border)", borderRadius: 8, cursor: "pointer", background: "var(--surface)" }}
                  />
                  <input
                    type="text"
                    value={selectedField.color || "#c9a84c"}
                    onChange={(e) => updateField(selectedField.id, { color: e.target.value })}
                    style={{ flex: 1, padding: "8px 10px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 11, color: "var(--text-main)", background: "var(--surface)", outline: "none", fontFamily: "monospace" }}
                  />
                </div>
              </div>
            )}

            {/* Text Styling Controls */}
            {selectedField.type === "text" && (
              <>
                {/* Font Family */}
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: "block", fontSize: 10, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Phông chữ</label>
                  <select
                    value={selectedField.font || "sans-serif"}
                    onChange={(e) => updateField(selectedField.id, { font: e.target.value })}
                    style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 12, color: "var(--text-main)", background: "var(--surface)", outline: "none" }}
                  >
                    <option value="sans-serif" style={{ background: "var(--surface)", color: "var(--text-main)" }}>Sans-serif (Mặc định)</option>
                    <option value="serif" style={{ background: "var(--surface)", color: "var(--text-main)" }}>Serif (Cổ điển)</option>
                    <option value="monospace" style={{ background: "var(--surface)", color: "var(--text-main)" }}>Monospace (Mã số)</option>
                    <option value="script" style={{ background: "var(--surface)", color: "var(--text-main)" }}>Script (Nghệ thuật)</option>
                  </select>
                </div>

                {/* Text Size Editor with Stepper & Quick Presets */}
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: "block", fontSize: 10, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Cỡ chữ (px)</label>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                    <button
                      onClick={() => updateField(selectedField.id, { size: Math.max(8, (selectedField.size || 14) - 1) })}
                      style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid var(--border-strong)", background: "var(--surface-subtle)", fontSize: 16, fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-faint)" }}
                    >
                      −
                    </button>
                    <input
                      type="number"
                      value={selectedField.size || 14}
                      onChange={(e) => updateField(selectedField.id, { size: Math.max(8, Number(e.target.value)) })}
                      min={8}
                      max={120}
                      style={{ flex: 1, height: 32, textAlign: "center", borderRadius: 8, border: "1px solid var(--border)", fontSize: 13, fontWeight: 700, color: "var(--text-body)", background: "var(--surface)", outline: "none" }}
                    />
                    <button
                      onClick={() => updateField(selectedField.id, { size: Math.min(120, (selectedField.size || 14) + 1) })}
                      style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid var(--border-strong)", background: "var(--surface-subtle)", fontSize: 16, fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-faint)" }}
                    >
                      +
                    </button>
                  </div>
                  {/* Preset font size chips */}
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                    {[10, 12, 14, 18, 24, 32, 48].map((s) => (
                      <button
                        key={s}
                        onClick={() => updateField(selectedField.id, { size: s })}
                        style={{
                          padding: "2px 6px", borderRadius: 6, border: `1px solid ${selectedField.size === s ? "var(--accent)" : "var(--border)"}`,
                          background: selectedField.size === s ? "var(--surface-active)" : "var(--surface)", color: selectedField.size === s ? "var(--surface-active-text)" : "var(--text-secondary)",
                          fontSize: 10, fontWeight: 600, cursor: "pointer"
                        }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Text Color */}
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: "block", fontSize: 10, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Màu văn bản</label>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <input
                      type="color"
                      value={selectedField.color || "#333333"}
                      onChange={(e) => updateField(selectedField.id, { color: e.target.value })}
                      style={{ width: 36, height: 36, padding: 0, border: "1px solid var(--border)", borderRadius: 8, cursor: "pointer", background: "var(--surface)" }}
                    />
                    <input
                      type="text"
                      value={selectedField.color || "#333333"}
                      onChange={(e) => updateField(selectedField.id, { color: e.target.value })}
                      style={{ flex: 1, padding: "8px 10px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 11, color: "var(--text-faint)", background: "var(--surface)", outline: "none", fontFamily: "monospace" }}
                    />
                  </div>
                </div>

                {/* Style & Alignment Toolbar */}
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: "block", fontSize: 10, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Định dạng & Căn chỉnh</label>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      onClick={() => updateField(selectedField.id, { bold: !selectedField.bold })}
                      style={{
                        width: 36, height: 36, borderRadius: 8, border: `1px solid ${selectedField.bold ? "var(--accent)" : "var(--border)"}`,
                        background: selectedField.bold ? "var(--surface-active)" : "var(--surface)", color: selectedField.bold ? "var(--surface-active-text)" : "var(--text-faint)",
                        fontWeight: "bold", fontSize: 14, cursor: "pointer"
                      }}
                      title="In đậm"
                    >
                      B
                    </button>
                    <button
                      onClick={() => updateField(selectedField.id, { italic: !selectedField.italic })}
                      style={{
                        width: 36, height: 36, borderRadius: 8, border: `1px solid ${selectedField.italic ? "var(--accent)" : "var(--border)"}`,
                        background: selectedField.italic ? "var(--surface-active)" : "var(--surface)", color: selectedField.italic ? "var(--surface-active-text)" : "var(--text-faint)",
                        fontStyle: "italic", fontSize: 14, cursor: "pointer"
                      }}
                      title="In nghiêng"
                    >
                      I
                    </button>

                    <div style={{ width: 1, background: "var(--border)", margin: "0 2px" }} />

                    {(["left", "center", "right"] as const).map((a) => (
                      <button
                        key={a}
                        onClick={() => updateField(selectedField.id, { align: a })}
                        style={{
                          flex: 1, height: 36, borderRadius: 8, border: `1px solid ${selectedField.align === a ? "var(--accent)" : "var(--border)"}`,
                          background: selectedField.align === a ? "var(--surface-active)" : "var(--surface)", color: selectedField.align === a ? "var(--surface-active-text)" : "var(--text-faint)",
                          fontSize: 12, fontWeight: 700, cursor: "pointer"
                        }}
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
            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 14, marginTop: 14 }}>
              <h4 style={{ fontSize: 10, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Vị trí & Kích thước</h4>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {(["x", "y", "w", "h"] as const).map((prop) => (
                  <div key={prop}>
                    <label style={{ display: "block", fontSize: 9, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 2 }}>{prop}</label>
                    <input
                      type="number"
                      value={selectedField[prop]}
                      onChange={(e) => updateField(selectedField.id, { [prop]: Number(e.target.value) })}
                      style={{ width: "100%", padding: "6px 8px", borderRadius: 6, border: "1px solid var(--border)", fontSize: 11, color: "var(--text-faint)", background: "var(--surface)", outline: "none" }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions (Duplicate & Delete) */}
            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 14, marginTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
              <h4 style={{ fontSize: 10, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5, margin: 0 }}>Thao tác trường</h4>
              <div style={{ display: "flex", gap: 6 }}>
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
                  style={{ flex: 1, padding: "8px", borderRadius: 8, border: "1px solid var(--border-strong)", background: "var(--surface-subtle)", fontSize: 11, fontWeight: 600, color: "var(--text-faint)", cursor: "pointer" }}
                >
                  📋 Nhân bản
                </button>
                <button
                  onClick={() => deleteField(selectedField.id)}
                  style={{ flex: 1, padding: "8px", borderRadius: 8, border: "1px solid var(--danger-border)", background: "var(--danger-bg)", fontSize: 11, fontWeight: 700, color: "var(--danger-text)", cursor: "pointer" }}
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
