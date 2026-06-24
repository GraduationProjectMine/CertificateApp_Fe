import "./globals.css";
import { geistSans, geistMono } from "./fonts";
import styles from "./layout.module.css";
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
      className={`${geistSans.variable} ${geistMono.variable} ${styles._0}`}
    >
      <body className={styles._1}>
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
