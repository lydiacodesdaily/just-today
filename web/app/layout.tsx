import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/src/components/ThemeProvider";
import { MainLayout } from "@/src/components/MainLayout";

export const metadata: Metadata = {
  title: "JustToday",
  description: "Calm, ADHD-friendly task and routine manager",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className="h-full antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <MainLayout>{children}</MainLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
