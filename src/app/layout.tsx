import "./globals.css";
import { geistSans, geistMono } from "./fonts";
export { metadata } from "./metadata";
import { AuthProvider } from "@/features/auth/components/AuthContext";
import { ThemeProvider } from "@/features/theme/ThemeContext";
import { I18nProvider } from "@/features/i18n/I18nContext";
import { AppMotion } from "@/components/motion/AppMotion";

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
