import React from "react";

export function ActionLink({ href, onClick, children }: { href?: string; onClick?: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="px-2.5 py-1 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-lg transition-all shadow-2xs inline-flex items-center gap-1 cursor-pointer active:scale-95"
    >
      {children}
    </button>
  );
}

export function ActionButton({ onClick, disabled, children }: { onClick?: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="px-2.5 py-1 text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-900/50 border border-red-200/60 dark:border-red-800/40 rounded-lg transition-all shadow-2xs inline-flex items-center gap-1 cursor-pointer disabled:opacity-50 active:scale-95"
    >
      {children}
    </button>
  );
}

export function ActionText({ children }: { children: React.ReactNode }) {
  return (
    <span className="px-2.5 py-1 text-xs font-medium text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800/60 border border-gray-200/50 dark:border-gray-800/50 rounded-lg inline-flex items-center">
      {children}
    </span>
  );
}