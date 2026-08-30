"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { studentApi, type StudentDto } from "@/features/students/services/student.api";
import { useI18n } from "@/features/i18n/I18nContext";

interface StudentSearchProps {
  value: string;
  onChange: (studentId: string, studentFullName?: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  onSelect?: (student: StudentDto) => void;
}

export default function StudentSearch({
  value,
  onChange,
  placeholder = "Tìm kiếm sinh viên...",
  className = "",
  disabled = false,
  onSelect,
}: StudentSearchProps) {
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<StudentDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [mounted, setMounted] = useState(false);
  const [allStudents, setAllStudents] = useState<StudentDto[]>([]);
  const [studentsLoaded, setStudentsLoaded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Load all students for client-side filtering fallback
  useEffect(() => {
    let cancelled = false;
    studentApi.list()
      .then((data) => {
        if (!cancelled) {
          setAllStudents(data);
          setStudentsLoaded(true);
        }
      })
      .catch(() => {
        if (!cancelled) setStudentsLoaded(true);
      });
    return () => { cancelled = true; };
  }, []);

  const searchStudents = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    const normalizedQuery = searchQuery.toLowerCase().trim();

    // For short queries (1-2 chars), use client-side filtering immediately
    if (normalizedQuery.length < 2) {
      if (studentsLoaded && allStudents.length > 0) {
        const filtered = allStudents.filter((student) =>
          student.student_fullName.toLowerCase().includes(normalizedQuery) ||
          student.student_id.toLowerCase().includes(normalizedQuery) ||
          student.email.toLowerCase().includes(normalizedQuery)
        ).slice(0, 20);
        setResults(filtered);
      } else {
        setResults([]);
      }
      return;
    }

    // For longer queries, try backend first
    setLoading(true);
    try {
      const data = await studentApi.search(searchQuery, 20);
      if (data.length > 0) {
        setResults(data);
      } else if (studentsLoaded && allStudents.length > 0) {
        // Fallback to client-side filtering if backend returns empty
        const filtered = allStudents.filter((student) =>
          student.student_fullName.toLowerCase().includes(normalizedQuery) ||
          student.student_id.toLowerCase().includes(normalizedQuery) ||
          student.email.toLowerCase().includes(normalizedQuery)
        ).slice(0, 20);
        setResults(filtered);
      } else {
        setResults([]);
      }
    } catch (err) {
      console.error("Search failed:", err);
      // Fallback to client-side filtering on error
      if (studentsLoaded && allStudents.length > 0) {
        const filtered = allStudents.filter((student) =>
          student.student_fullName.toLowerCase().includes(normalizedQuery) ||
          student.student_id.toLowerCase().includes(normalizedQuery) ||
          student.email.toLowerCase().includes(normalizedQuery)
        ).slice(0, 20);
        setResults(filtered);
      } else {
        setResults([]);
      }
    } finally {
      setLoading(false);
    }
  }, [studentsLoaded, allStudents]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      searchStudents(query);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, searchStudents]);

  useEffect(() => {
    if (!mounted) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
        if (listRef.current && !listRef.current.contains(e.target as Node)) {
          setOpen(false);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mounted]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setQuery(newValue);
    setOpen(true);
    setHighlightedIndex(-1);
    onChange(newValue);
  };

  const handleSelect = (student: StudentDto) => {
    onChange(student.student_id, student.student_fullName);
    setQuery(`${student.student_id} - ${student.student_fullName}`);
    setOpen(false);
    setResults([]);
    onSelect?.(student);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open || results.length === 0) return;

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
    if (query.trim().length >= 1) {
      setOpen(true);
    }
  };

  const handleBlur = () => {
    setTimeout(() => setOpen(false), 200);
  };

  const selectedStudent = results.find((s) => s.student_id === value);

  return (
    <div className={`relative ${className}`}>
      <input
        ref={inputRef}
        type="text"
        value={query || (selectedStudent ? `${selectedStudent.student_id} - ${selectedStudent.student_fullName}` : "")}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
        style={{
          width: "100%",
          padding: "8px 10px",
          borderRadius: 8,
          border: "1px solid var(--border-strong)",
          fontSize: 12,
          background: "var(--surface)",
          color: "var(--text-main)",
          outline: "none",
          boxSizing: "border-box",
        }}
      />
      {loading && (
        <div style={{
          position: "absolute",
          right: 10,
          top: "50%",
          transform: "translateY(-50%)",
          fontSize: 12,
          color: "var(--text-secondary)",
        }}>
          🔍
        </div>
      )}
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
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            zIndex: 50,
            maxHeight: 240,
            overflowY: "auto",
          }}
        >
          {results.map((student, index) => (
            <button
              key={student.student_id}
              type="button"
              onClick={() => handleSelect(student)}
              onMouseEnter={() => setHighlightedIndex(index)}
              style={{
                width: "100%",
                padding: "8px 12px",
                textAlign: "left",
                background: index === highlightedIndex ? "var(--primary-light)" : "transparent",
                border: "none",
                fontSize: 12,
                color: "var(--text-main)",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              <span style={{ fontWeight: 600 }}>{student.student_fullName}</span>
              <span style={{ fontSize: 10, color: "var(--text-secondary)" }}>
                {student.student_id} • {student.email}
              </span>
            </button>
          ))}
        </div>
      )}
      {open && results.length === 0 && query.trim().length >= 1 && !loading && (
        <div style={{
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
          zIndex: 50,
        }}>
          {t("adminTemplateGenerator.noStudentsFound")}
          
        </div>
      )}
    </div>
  );
}