"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { studentApi, type StudentDto } from "@/features/students/services/student.api";
import { useI18n } from "@/features/i18n/I18nContext";

interface StudentSearchProps {
  value: string;
  onChange: (studentId: string, studentFullName?: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  onSelect?: (student: StudentDto) => void;
  label?: string;
  required?: boolean;
}

function normalizeSearchText(str: string | undefined | null): string {
  if (!str) return "";
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .toLowerCase()
    .trim();
}

function matchStudent(student: StudentDto, query: string): boolean {
  if (!query || !query.trim()) return true;

  const normQuery = normalizeSearchText(query);
  const keywords = normQuery.split(/\s+/).filter(Boolean);

  const normName = normalizeSearchText(student.student_fullName);
  const normId = normalizeSearchText(student.student_id);
  const normEmail = normalizeSearchText(student.email);
  const combined = `${normId} ${normName} ${normEmail}`;

  // Direct includes check
  if (combined.includes(normQuery)) return true;

  // Multi-word check (e.g. "Nguyen A" matches "Nguyen Van A")
  return keywords.every((kw) => combined.includes(kw));
}

export default function StudentSearch({
  value,
  onChange,
  placeholder = "Tìm kiếm sinh viên...",
  className = "",
  disabled = false,
  onSelect,
  label,
  required = false,
}: StudentSearchProps) {
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<StudentDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [allStudents, setAllStudents] = useState<StudentDto[]>([]);
  const [studentsLoaded, setStudentsLoaded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);
  const isTypingRef = useRef(false);

  // Load all students for client-side search and instant lookup
  useEffect(() => {
    let cancelled = false;
    studentApi
      .list()
      .then((data) => {
        if (!cancelled) {
          setAllStudents(data || []);
          setStudentsLoaded(true);
        }
      })
      .catch(() => {
        if (!cancelled) setStudentsLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Sync displayed query when external value changes and user is not actively typing
  useEffect(() => {
    if (isTypingRef.current) return;
    if (!value) {
      setQuery("");
      return;
    }
    const found = allStudents.find(
      (s) => s.student_id?.toLowerCase() === value.toLowerCase()
    );
    if (found) {
      setQuery(`${found.student_id} - ${found.student_fullName}`);
    } else {
      setQuery(value);
    }
  }, [value, allStudents]);

  const searchStudents = useCallback(
    async (searchQuery: string) => {
      const trimmed = searchQuery.trim();

      // If empty query, show top existing students
      if (!trimmed) {
        setResults(allStudents.slice(0, 20));
        return;
      }

      // 1. Instant client-side filtering with Vietnamese accent-insensitivity
      let matched = allStudents.filter((student) => matchStudent(student, trimmed));

      setResults(matched.slice(0, 20));

      // 2. Also query backend if available to get any newly added students
      try {
        const data = await studentApi.search(trimmed, 20);
        if (data && data.length > 0) {
          // Merge deduplicated results by student_id
          const existingIds = new Set(matched.map((s) => s.student_id));
          const newItems = data.filter((s) => !existingIds.has(s.student_id));
          if (newItems.length > 0) {
            setResults([...matched, ...newItems].slice(0, 20));
          }
        }
      } catch (err) {
        // Keep client-filtered results on error
      }
    },
    [allStudents]
  );

  useEffect(() => {
    if (!isTypingRef.current) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      searchStudents(query);
    }, 150);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, searchStudents]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(e.target as Node) &&
        listRef.current &&
        !listRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        isTypingRef.current = false;
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    isTypingRef.current = true;
    const newValue = e.target.value;
    setQuery(newValue);
    setOpen(true);
    setHighlightedIndex(-1);

    if (!newValue.trim()) {
      onChange("", "");
      setResults(allStudents.slice(0, 20));
    } else {
      // If user is manually typing, check if it matches an exact ID or keep as manual
      const exactMatch = allStudents.find(
        (s) => s.student_id?.toLowerCase() === newValue.trim().toLowerCase()
      );
      if (exactMatch) {
        onChange(exactMatch.student_id, exactMatch.student_fullName);
      } else {
        onChange(newValue);
      }
    }
  };

  const handleSelect = (student: StudentDto) => {
    isTypingRef.current = false;
    const displayName = `${student.student_id} - ${student.student_fullName}`;
    setQuery(displayName);
    setOpen(false);
    setResults([]);
    onChange(student.student_id, student.student_fullName);
    onSelect?.(student);
  };

  const handleClear = () => {
    isTypingRef.current = false;
    setQuery("");
    setResults(allStudents.slice(0, 20));
    setOpen(false);
    onChange("", "");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open || results.length === 0) {
      if (e.key === "ArrowDown") {
        setOpen(true);
        searchStudents(query);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) => Math.min(prev + 1, results.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => Math.max(prev - 1, -1));
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < results.length) {
          handleSelect(results[highlightedIndex]);
        }
        break;
      case "Escape":
        setOpen(false);
        break;
    }
  };

  const handleFocus = () => {
    isTypingRef.current = true;
    searchStudents(query);
    setOpen(true);
  };

  const cleanLabel = label ? label.replace(/\s*\*+$/, "").trim() : "";

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label
          style={{
            display: "block",
            fontSize: 11,
            fontWeight: 700,
            color: "var(--text-faint)",
            marginBottom: 4,
          }}
        >
          {cleanLabel}
          {required && <span style={{ color: "#ef4444" }}> *</span>}
        </label>
      )}

      <div style={{ position: "relative", width: "100%" }}>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          style={{
            width: "100%",
            padding: "8px 10px",
            paddingRight: query ? 52 : 32,
            borderRadius: 8,
            border: "1px solid var(--border-strong)",
            fontSize: 12,
            background: "var(--surface)",
            color: "var(--text-main)",
            outline: "none",
            boxSizing: "border-box",
            transition: "border-color 0.15s",
          }}
        />

        <div
          style={{
            position: "absolute",
            right: 8,
            top: "50%",
            transform: "translateY(-50%)",
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          {query && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              onMouseDown={(e) => e.preventDefault()}
              title="Xóa lựa chọn"
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: "2px",
                color: "var(--text-secondary)",
                fontSize: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 4,
              }}
            >
              ✕
            </button>
          )}

          {loading ? (
            <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>⌛</span>
          ) : (
            <span style={{ fontSize: 11, color: "var(--text-secondary)", pointerEvents: "none" }}>

            </span>
          )}
        </div>
      </div>

      {open && results.length > 0 && (
        <div
          ref={listRef}
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            marginTop: 4,
            background: "var(--surface)",
            border: "1px solid var(--border-strong)",
            borderRadius: 8,
            boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
            zIndex: 100,
            maxHeight: 240,
            overflowY: "auto",
          }}
        >
          {results.map((student, index) => (
            <button
              key={student.student_id}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(student);
              }}
              onClick={() => handleSelect(student)}
              onMouseEnter={() => setHighlightedIndex(index)}
              style={{
                width: "100%",
                padding: "8px 12px",
                textAlign: "left",
                background:
                  index === highlightedIndex
                    ? "var(--primary-light, rgba(20, 125, 116, 0.15))"
                    : "transparent",
                border: "none",
                fontSize: 12,
                color: "var(--text-main)",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                gap: 2,
                borderBottom:
                  index < results.length - 1
                    ? "1px solid var(--border-subtle, rgba(255,255,255,0.05))"
                    : "none",
              }}
            >
              <span style={{ fontWeight: 600, color: "var(--text-main)" }}>
                {student.student_fullName}
              </span>
              <span style={{ fontSize: 10, color: "var(--text-secondary)" }}>
                {student.student_id} • {student.email}
              </span>
            </button>
          ))}
        </div>
      )}

      {open && results.length === 0 && query.trim().length >= 1 && !loading && (
        <div
          ref={listRef}
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            marginTop: 4,
            background: "var(--surface)",
            border: "1px solid var(--border-strong)",
            borderRadius: 8,
            padding: "12px",
            textAlign: "center",
            fontSize: 12,
            color: "var(--text-secondary)",
            zIndex: 100,
            boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
          }}
        >
          {t("adminTemplateGenerator.noStudentsFound")}
        </div>
      )}
    </div>
  );
}