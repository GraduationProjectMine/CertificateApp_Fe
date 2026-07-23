import React from "react";

export function ActionLink({ href, onClick, children }: { href?: string; onClick?: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className="text-xs font-semibold text-primary hover:underline">
      {children}
    </button>
  );
}

export function ActionButton({ onClick, disabled, children }: { onClick?: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button onClick={onClick} disabled={disabled} className="text-xs font-semibold text-danger hover:underline disabled:opacity-50">
      {children}
    </button>
  );
}

export function ActionText({ children }: { children: React.ReactNode }) {
  return <span className="text-xs text-gray-400">{children}</span>;
}