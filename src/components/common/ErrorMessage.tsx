import React from "react";

interface ErrorMessageProps {
  message?: string;
  onRetry?: () => void;
}

export default function ErrorMessage({ message = "Có lỗi xảy ra. Vui lòng thử lại.", onRetry }: ErrorMessageProps) {
  return (
    <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 text-danger p-4 rounded-xl text-sm flex items-start gap-3">
      <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <div className="flex-1">
        <p>{message}</p>
        {onRetry && (
          <button onClick={onRetry} className="mt-2 text-xs font-bold underline hover:no-underline">
            Thử lại
          </button>
        )}
      </div>
    </div>
  );
}
