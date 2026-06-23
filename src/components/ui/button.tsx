import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

export default function Button({ variant = "primary", size = "md", className = "", children, ...props }: ButtonProps) {
  const variantStyles: Record<string, string> = {
    primary: "bg-primary text-white hover:bg-primary-hover shadow-sm",
    secondary: "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50",
    ghost: "text-gray-600 hover:bg-gray-100",
    danger: "bg-danger text-white hover:bg-red-600 shadow-sm",
  };
  const sizeStyles: Record<string, string> = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
  };
  const classes = [
    "inline-flex items-center justify-center font-semibold rounded-xl transition-all select-none disabled:opacity-50",
    variantStyles[variant],
    sizeStyles[size],
    className,
  ].filter(Boolean).join(" ");

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
