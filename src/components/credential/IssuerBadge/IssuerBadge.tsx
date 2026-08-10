"use client";

import React, { useState } from "react";

interface IssuerBadgeProps {
  organizationName: string;
  logoUrl?: string | null;
  walletAddress?: string | null;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function IssuerBadge({
  organizationName,
  logoUrl,
  walletAddress,
  className = "",
  size = "md",
}: IssuerBadgeProps) {
  const [imageError, setImageError] = useState(false);

  const etherscanUrl = walletAddress
    ? `https://sepolia.etherscan.io/address/${walletAddress}`
    : null;

  const handleBadgeClick = (e: React.MouseEvent) => {
    if (etherscanUrl) {
      window.open(etherscanUrl, "_blank", "noopener,noreferrer");
    }
  };

  const formattedWallet = walletAddress
    ? `${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`
    : null;

  // Size styling
  const logoSizes = {
    sm: "w-10 h-10 text-xs",
    md: "w-14 h-14 text-sm",
    lg: "w-20 h-20 text-base",
  };

  return (
    <div
      onClick={handleBadgeClick}
      title={
        etherscanUrl
          ? `Nhấp để xem & xác minh ví ${organizationName} trên Sepolia Etherscan (${walletAddress})`
          : `Tổ chức: ${organizationName}`
      }
      className={`group relative flex items-center gap-3 p-3.5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-md border border-slate-700/60 transition-all duration-200 ${
        etherscanUrl ? "cursor-pointer hover:border-emerald-500/80 hover:shadow-emerald-900/20 hover:shadow-lg hover:-translate-y-0.5" : ""
      } ${className}`}
    >
      {/* Verified Glow Effect */}
      <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
      </div>

      {/* Logo Container */}
      <div
        className={`relative shrink-0 ${logoSizes[size]} rounded-xl bg-white p-1 border border-slate-200/20 shadow-inner flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform`}
      >
        {logoUrl && !imageError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoUrl}
            alt={`Logo ${organizationName}`}
            className="w-full h-full object-contain"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-700 font-bold">
            <svg
              className="w-7 h-7 text-emerald-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m3 0h1m-1-4h.01M9 16h.01M9 12h.01M9 8h.01M15 16h.01M15 12h.01M15 8h.01M12 8h.01M12 12h.01M12 16h.01"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Badge Text Info */}
      <div className="flex-1 min-w-0 pr-2">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30">
            <svg
              className="w-3 h-3 text-emerald-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            Đơn vị phát hành đã xác minh
          </span>
        </div>

        <h4 className="text-sm font-bold text-white truncate leading-tight group-hover:text-emerald-300 transition-colors">
          {organizationName}
        </h4>

        {formattedWallet ? (
          <div className="flex items-center gap-1 mt-1 text-xs text-slate-300">
            <span className="font-mono bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700 text-[11px]">
              {formattedWallet}
            </span>
            <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-0.5 ml-1 group-hover:underline">
              <span>Sepolia Etherscan</span>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </span>
          </div>
        ) : (
          <p className="text-[11px] text-slate-400 mt-0.5">Địa chỉ ví: Chưa thiết lập</p>
        )}
      </div>
    </div>
  );
}
