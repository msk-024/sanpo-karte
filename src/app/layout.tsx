import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import TopBar from "@/components/layout/TopBar";
import TwoColumnLayout from "@/components/layout/TwoColumnLayout";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "さんぽかるて",
  description: "産業看護職向け健康管理アプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <TopBar />
        <TwoColumnLayout>{children}</TwoColumnLayout>
      </body>
    </html>
  );
}
