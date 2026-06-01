import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "AI-Powered SOC Dashboard",
  description: "Enterprise Security Operations Center Dashboard powered by Model Context Protocol (MCP) and AI reasoning.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[var(--bg-obsidian)] text-[var(--text-primary)] transition-colors duration-300 antialiased">
        {children}
      </body>
    </html>
  );
}
