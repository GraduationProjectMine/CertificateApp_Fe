import React from "react";
import Link from "next/link";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg text-gray-900 dark:text-white">CertiChain</Link>
        <nav className="flex items-center gap-6 text-sm font-medium text-gray-600 dark:text-gray-400">
          <Link href="/public/verify" className="hover:text-primary">Xác minh</Link>
          <Link href="/auth/login" className="hover:text-primary">Đăng nhập</Link>
        </nav>
      </div>
    </header>
  );
}
