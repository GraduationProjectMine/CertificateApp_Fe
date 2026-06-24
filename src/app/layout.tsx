import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../features/auth/components/AuthContext";
import { ThemeProvider } from "../features/theme/ThemeContext";
import { I18nProvider } from "../features/i18n/I18nContext";
import { AppMotion } from "../components/motion/AppMotion";

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
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#f8fafc] text-[#0f172a] dark:bg-[#030712] dark:text-[#f9fafb]">
        <ThemeProvider>
          <I18nProvider>
            <AuthProvider>
              <AppMotion>{children}</AppMotion>
            </AuthProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

