import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../core/context/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hệ thống Xác minh & Cấp phát Văn bằng Blockchain",
  description: "Ứng dụng công nghệ Blockchain và IPFS để lưu trữ, cấp phát và xác thực văn bằng chứng chỉ chống giả mạo.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#f8fafc] text-[#0f172a] dark:bg-[#030712] dark:text-[#f9fafb]">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

