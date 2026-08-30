"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { validateField, sanitizeInput, formatDdMmYyyy, fieldValidations, type ValidationRule } from "@/lib/fieldValidation";
import { useI18n } from "@/features/i18n/I18nContext";

interface StrictInputProps {
  fieldKey: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  label?: string;
  customRule?: ValidationRule;
  type?: "text" | "date";
}

export default function StrictInput({
  fieldKey,
  value,
  onChange,
  onBlur,
  placeholder,
  required = false,
  disabled = false,
  className = "",
  label,
  customRule,
  type = "text",
}: StrictInputProps) {
  const { t } = useI18n();
  const [error, setError] = useState<string>("");
  const [touched, setTouched] = useState(false);
  const [showError, setShowError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  const rule = customRule || (fieldKey ? fieldValidations[fieldKey] : undefined);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const validate = useCallback((val: string) => {
    if (!rule) return { valid: true };
    return validateField(fieldKey, val);
  }, [fieldKey, rule]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;

    if (rule) {
      newValue = sanitizeInput(fieldKey, newValue);
    }

    if (type === "date" && newValue.length === 10) {
      const validation = validate(newValue);
      if (!validation.valid) {
        setError(validation.message || "");
        setShowError(true);
      } else {
        setError("");
        setShowError(false);
      }
    }

    onChange(newValue);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setTouched(true);
    const validation = validate(e.target.value);
    if (!validation.valid && e.target.value.trim()) {
      setError(validation.message || "");
      setShowError(true);
    } else {
      setError("");
      setShowError(false);
    }
    onBlur?.(e.target.value);
  };

  const handleFocus = () => {
    if (error && touched) {
      timeoutRef.current = setTimeout(() => setShowError(false), 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (rule && rule.type === "number" && !/[\d]/.test(e.key) && 
        !["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"].includes(e.key)) {
      e.preventDefault();
    }
  };

  const displayValue = type === "date" && value && !value.includes("/") 
    ? formatDdMmYyyy(value) 
    : value;

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-faint)", marginBottom: 4 }}>
          {label}{required && <span style={{ color: "#ef4444" }}> *</span>}
        </label>
      )}
      <input
        ref={inputRef}
        type={type === "date" ? "text" : "text"}
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
        style={{
          width: "100%",
          padding: "8px 10px",
          borderRadius: 8,
          border: showError ? "1px solid #ef4444" : "1px solid var(--border-strong)",
          fontSize: 12,
          background: "var(--surface)",
          color: "var(--text-main)",
          outline: "none",
          boxSizing: "border-box",
          transition: "border-color 0.15s",
        }}
      />
      {showError && error && (
        <div style={{
          position: "absolute",
          bottom: -20,
          left: 0,
          fontSize: 10,
          color: "#ef4444",
          whiteSpace: "nowrap",
        }}>
          {error}
        </div>
      )}
    </div>
  );
}