"use client";

import React from "react";

interface SearchInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
  children?: React.ReactNode;
}

export default function SearchInput({
  value,
  onChange,
  placeholder = "Tìm kiếm...",
  className = "",
  children,
}: SearchInputProps) {
  return (
    <div className={`flex gap-2 items-center ${className}`}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-800 bg-gray-50/90 dark:bg-gray-900 text-xs text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 outline-none focus:bg-white dark:focus:bg-gray-900 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all min-w-0 shadow-sm"
      />
      {children}
    </div>
  );
}
