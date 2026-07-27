"use client";

import React from "react";
import { useI18n } from "@/features/i18n/I18nContext";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  pageSizeOptions = [10, 20, 50, 100],
  className = "",
}: PaginationProps) {
  const { t } = useI18n();

  if (totalItems <= 0) return null;

  const realTotalPages = Math.max(1, totalPages);
  const validCurrentPage = Math.min(Math.max(1, currentPage), realTotalPages);

  const startItem = (validCurrentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(validCurrentPage * itemsPerPage, totalItems);

  // Generate page numbers to show (e.g., [1, 2, 3, '...', 10])
  const getPageNumbers = (): (number | string)[] => {
    if (realTotalPages <= 7) {
      return Array.from({ length: realTotalPages }, (_, i) => i + 1);
    }
    const pages: (number | string)[] = [];
    pages.push(1);

    if (validCurrentPage > 3) {
      pages.push("...");
    }

    const start = Math.max(2, validCurrentPage - 1);
    const end = Math.min(realTotalPages - 1, validCurrentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (validCurrentPage < realTotalPages - 2) {
      pages.push("...");
    }

    pages.push(realTotalPages);
    return pages;
  };

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 border-t border-gray-200/80 dark:border-gray-800/80 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm text-xs text-gray-600 dark:text-gray-400 select-none ${className}`}
    >
      {/* Left: Summary text */}
      <div className="font-medium text-gray-600 dark:text-gray-400">
        {t("common.showing_records", {
          start: startItem,
          end: endItem,
          total: totalItems,
        })}
      </div>

      {/* Right: Controls & Navigation */}
      <div className="flex items-center gap-3">
        {/* Page size selector if enabled */}
        {onItemsPerPageChange && (
          <div className="flex items-center gap-1.5">
            <select
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              className="px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40 text-xs cursor-pointer shadow-xs"
            >
              {pageSizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option} / {t("common.per_page")}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Buttons */}
        <div className="flex items-center gap-1">
          {/* Previous Button */}
          <button
            type="button"
            onClick={() => onPageChange(validCurrentPage - 1)}
            disabled={validCurrentPage <= 1}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-2xs"
            title={t("common.prev_page")}
          >
            {t("common.prev_page")}
          </button>

          {/* Page numbers */}
          <div className="hidden md:flex items-center gap-1 mx-1">
            {getPageNumbers().map((page, idx) => {
              if (page === "...") {
                return (
                  <span
                    key={`ellipsis-${idx}`}
                    className="px-2 py-1 text-gray-400 dark:text-gray-600 font-bold"
                  >
                    ...
                  </span>
                );
              }
              const isCurrent = page === validCurrentPage;
              return (
                <button
                  key={`page-${page}`}
                  type="button"
                  onClick={() => onPageChange(page as number)}
                  className={`min-w-[2rem] h-8 px-2 rounded-lg font-bold transition-all shadow-2xs ${
                    isCurrent
                      ? "bg-primary text-white border border-primary shadow-xs"
                      : "border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  {page}
                </button>
              );
            })}
          </div>

          {/* Mobile Current/Total indicator */}
          <span className="md:hidden px-2.5 py-1 font-bold text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 rounded-lg">
            {validCurrentPage} / {realTotalPages}
          </span>

          {/* Next Button */}
          <button
            type="button"
            onClick={() => onPageChange(validCurrentPage + 1)}
            disabled={validCurrentPage >= realTotalPages}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-2xs"
            title={t("common.next_page")}
          >
            {t("common.next_page")}
          </button>
        </div>
      </div>
    </div>
  );
}
