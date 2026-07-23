"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { templateApi } from "@/features/templates/services/api";
import type { CertificateTemplate, TemplateField, DesignData } from "@/features/templates/types";

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

  useEffect(() => {
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

  const addField = useCallback((type: TemplateField["type"]) => {
    const isLine = type === "line";
    const isRect = type === "rect";
    const newField: TemplateField = {
      id: generateId(),
      type,
      x: 100,
      y: 100,
      w: type === "qr" ? 70 : isLine ? 150 : isRect ? 150 : 200,
      h: type === "qr" ? 70 : isLine ? 4 : isRect ? 100 : 40,
      font: "sans-serif",
      size: 14,
      color: type === "line" || type === "rect" ? "#c9a84c" : "#333333",
      align: "left",
      text: type === "text" ? "Văn bản" : undefined,
    };
    setDesign((prev) => ({ ...prev, fields: [...prev.fields, newField] }));
    setSelectedId(newField.id);
  }, []);

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
        alert("Đã lưu!");
      }
    } catch (err: any) {
      alert(err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-400 dark:text-gray-500 text-xs">Đang tải...</div>;
  }

  const renderFieldContent = (field: TemplateField) => {
    const scale = previewMode ? 1 : zoom;
    const isLine = field.type === "line";
    const isRect = field.type === "rect";
    const styles: React.CSSProperties = {
      position: "absolute",
      left: field.x * (1 / (previewMode ? 1 : 1)),
      top: field.y * (1 / (previewMode ? 1 : 1)),
      width: field.w,
      height: field.h,
      fontSize: (field.size || 14) * (1 / (previewMode ? 1 : 1)),
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
      background: field.type === "qr" ? "#f8f8f8" : "transparent",
    };

    const content = (() => {
      if (field.type === "qr") {
        return <span style={{ fontSize: 9, color: "#999" as any, textAlign: "center" as any, width: "100%" }}>QR</span>;
      }
      if (field.type === "line") {
        return <div style={{ width: "100%", height: "100%", background: field.color || "#c9a84c" }} />;
      }
      if (field.type === "rect") {
        return <div style={{ width: "100%", height: "100%", border: `2px solid ${field.color || "#c9a84c"}`, boxSizing: "border-box" }} />;
      }
      if (field.dynamic && field.binding) {
        const label = FIELD_BINDINGS.find((b) => b.value === field.binding)?.label || field.binding;
        return <span style={{ opacity: 0.7 }}>[{label}]</span>;
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
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 64px)", background: "#f1f5f9", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 24px", background: "#fff", borderBottom: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button onClick={() => router.push("/admin/templates")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#64748b", padding: 4 }}>←</button>
          <input
            type="text"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            style={{ fontSize: 16, fontWeight: 700, border: "none", outline: "none", background: "transparent", color: "#1e293b", width: 300 }}
            placeholder="Tên mẫu văn bằng"
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4, background: "#f1f5f9", borderRadius: 8, padding: "2px" }}>
            <button onClick={() => setZoom((z) => Math.max(0.3, z - 0.1))} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px 8px", fontSize: 12, color: "#64748b" }}>−</button>
            <span style={{ fontSize: 11, color: "#64748b", minWidth: 36, textAlign: "center" }}>{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom((z) => Math.min(1.5, z + 0.1))} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px 8px", fontSize: 12, color: "#64748b" }}>+</button>
          </div>
          <button
            onClick={() => setPreviewMode(!previewMode)}
            style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #e2e8f0", background: previewMode ? "#3b82f6" : "#fff", color: previewMode ? "#fff" : "#64748b", cursor: "pointer", fontSize: 12, fontWeight: 600 }}
          >
            {previewMode ? "Chỉnh sửa" : "Xem trước"}
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !templateName.trim()}
            style={{ padding: "8px 20px", borderRadius: 8, border: "none", background: saving ? "#94a3b8" : "#3b82f6", color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 700, opacity: saving || !templateName.trim() ? 0.6 : 1 }}
          >
            {saving ? "Đang lưu..." : "Lưu"}
          </button>
        </div>
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {!previewMode && (
          <div style={{ width: 220, background: "#fff", borderRight: "1px solid #e2e8f0", padding: 16, overflowY: "auto" }}>
            <h3 style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Thêm trường</h3>
            {FIELD_TEMPLATES.map((ft) => (
              <button
                key={ft.type}
                onClick={() => addField(ft.type)}
                style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 14px", marginBottom: 6, borderRadius: 10, border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", fontSize: 13, color: "#334155", transition: "all 0.15s" }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#3b82f6"; e.currentTarget.style.background = "#f8faff"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.background = "#fff"; }}
              >
                <span style={{ fontSize: 16 }}>{ft.icon}</span>
                <span>{ft.label}</span>
              </button>
            ))}
            <h3 style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1, margin: "20px 0 12px" }}>Các trường ({design.fields.length})</h3>
            {design.fields.map((f) => (
              <div
                key={f.id}
                onClick={() => setSelectedId(f.id)}
                style={{ padding: "8px 12px", borderRadius: 8, cursor: "pointer", fontSize: 12, color: selectedId === f.id ? "#3b82f6" : "#64748b", background: selectedId === f.id ? "#f0f7ff" : "transparent", marginBottom: 4, display: "flex", alignItems: "center", justifyContent: "space-between" }}
              >
                <span style={{ fontWeight: 500 }}>{f.binding ? FIELD_BINDINGS.find((b) => b.value === f.binding)?.label || f.binding : f.text || "Văn bản"}</span>
                <span style={{ fontSize: 10, color: "#94a3b8" }}>{f.type}</span>
              </div>
            ))}
          </div>
        )}

        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", overflow: "auto", padding: 24, background: "#f1f5f9" }}>
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

        {!previewMode && selectedField && (
          <div style={{ width: 280, background: "#fff", borderLeft: "1px solid #e2e8f0", padding: 16, overflowY: "auto" }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", marginBottom: 16 }}>Thuộc tính</h3>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 10, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Loại</label>
              <select
                value={selectedField.type}
                onChange={(e) => updateField(selectedField.id, { type: e.target.value as any })}
                style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12, color: "#334155", background: "#fff", outline: "none" }}
              >
                <option value="text">Văn bản</option>
                <option value="image">Hình ảnh</option>
                <option value="qr">Mã QR</option>
                <option value="line">Đường kẻ</option>
                <option value="rect">Hình chữ nhật</option>
              </select>
            </div>

            {selectedField.type !== "line" && selectedField.type !== "rect" && (
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 10, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Dữ liệu động</label>
                <select
                  value={selectedField.binding || ""}
                  onChange={(e) => updateField(selectedField.id, { binding: e.target.value || undefined, dynamic: !!e.target.value })}
                  style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12, color: "#334155", background: "#fff", outline: "none" }}
                >
                  {FIELD_BINDINGS.map((b) => (
                    <option key={b.value} value={b.value}>{b.label}</option>
                  ))}
                </select>
              </div>
            )}

            {!selectedField.dynamic && selectedField.type === "text" && (
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 10, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Nội dung</label>
                <input
                  type="text"
                  value={selectedField.text || ""}
                  onChange={(e) => updateField(selectedField.id, { text: e.target.value })}
                  style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12, color: "#334155", outline: "none" }}
                />
              </div>
            )}

            {(selectedField.type === "line" || selectedField.type === "rect") && (
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 10, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Màu sắc</label>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <input
                    type="color"
                    value={selectedField.color || "#c9a84c"}
                    onChange={(e) => updateField(selectedField.id, { color: e.target.value })}
                    style={{ width: 36, height: 36, padding: 0, border: "1px solid #e2e8f0", borderRadius: 8, cursor: "pointer" }}
                  />
                  <input
                    type="text"
                    value={selectedField.color || "#c9a84c"}
                    onChange={(e) => updateField(selectedField.id, { color: e.target.value })}
                    style={{ flex: 1, padding: "8px 10px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 11, color: "#334155", outline: "none", fontFamily: "monospace" }}
                  />
                </div>
              </div>
            )}

            {selectedField.type === "text" && (
              <>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: "block", fontSize: 10, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Phông chữ</label>
                  <select
                    value={selectedField.font || "sans-serif"}
                    onChange={(e) => updateField(selectedField.id, { font: e.target.value })}
                    style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12, color: "#334155", background: "#fff", outline: "none" }}
                  >
                    <option value="sans-serif">Sans-serif</option>
                    <option value="serif">Serif</option>
                    <option value="monospace">Monospace</option>
                    <option value="script">Script</option>
                  </select>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 10, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Cỡ chữ</label>
                    <input
                      type="number"
                      value={selectedField.size || 14}
                      onChange={(e) => updateField(selectedField.id, { size: Number(e.target.value) })}
                      min={8}
                      max={72}
                      style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12, color: "#334155", outline: "none" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 10, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Màu sắc</label>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <input
                        type="color"
                        value={selectedField.color || "#333333"}
                        onChange={(e) => updateField(selectedField.id, { color: e.target.value })}
                        style={{ width: 36, height: 36, padding: 0, border: "1px solid #e2e8f0", borderRadius: 8, cursor: "pointer" }}
                      />
                      <input
                        type="text"
                        value={selectedField.color || "#333333"}
                        onChange={(e) => updateField(selectedField.id, { color: e.target.value })}
                        style={{ flex: 1, padding: "8px 10px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 11, color: "#334155", outline: "none", fontFamily: "monospace" }}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: "block", fontSize: 10, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Căn chỉnh</label>
                  <div style={{ display: "flex", gap: 4 }}>
                    {(["left", "center", "right"] as const).map((a) => (
                      <button
                        key={a}
                        onClick={() => updateField(selectedField.id, { align: a })}
                        style={{
                          flex: 1, padding: "6px 8px", borderRadius: 6, border: `1px solid ${selectedField.align === a ? "#3b82f6" : "#e2e8f0"}`,
                          background: selectedField.align === a ? "#eff6ff" : "#fff", cursor: "pointer", fontSize: 11, fontWeight: 600,
                          color: selectedField.align === a ? "#3b82f6" : "#94a3b8",
                        }}
                      >
                        {a === "left" ? "Trái" : a === "center" ? "Giữa" : "Phải"}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 12, color: "#64748b" }}>
                    <input
                      type="checkbox"
                      checked={selectedField.bold || false}
                      onChange={(e) => updateField(selectedField.id, { bold: e.target.checked })}
                      style={{ accentColor: "#3b82f6" }}
                    />
                    Đậm
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 12, color: "#64748b" }}>
                    <input
                      type="checkbox"
                      checked={selectedField.italic || false}
                      onChange={(e) => updateField(selectedField.id, { italic: e.target.checked })}
                      style={{ accentColor: "#3b82f6" }}
                    />
                    Nghiêng
                  </label>
                </div>
              </>
            )}

            <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 14, marginTop: 14 }}>
              <h4 style={{ fontSize: 10, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Vị trí & Kích thước</h4>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {(["x", "y", "w", "h"] as const).map((prop) => (
                  <div key={prop}>
                    <label style={{ display: "block", fontSize: 9, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", marginBottom: 2 }}>{prop}</label>
                    <input
                      type="number"
                      value={selectedField[prop]}
                      onChange={(e) => updateField(selectedField.id, { [prop]: Number(e.target.value) })}
                      style={{ width: "100%", padding: "6px 8px", borderRadius: 6, border: "1px solid #e2e8f0", fontSize: 11, color: "#334155", outline: "none" }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
