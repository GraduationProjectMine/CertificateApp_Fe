import React from "react";
import Link from "next/link";

export default function Sidebar({ items, pathname }: { items: { label: string; href: string; icon: string }[]; pathname: string }) {
  return (
    <aside className="w-64 bg-slate-900 text-slate-300 border-r border-slate-800/80 flex flex-col h-full">
      <div className="h-16 flex items-center px-5 border-b border-slate-800/50">
        <Link href="/" className="font-bold text-white text-lg">CertiChain</Link>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {items.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold transition-all ${isActive ? "bg-primary text-white" : "text-slate-400 hover:text-white hover:bg-slate-800/40"}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
              </svg>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
