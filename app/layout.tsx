import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import FloatingChat from "@/components/FloatingChat";
import SessionProvider from "@/components/SessionProvider";
import DemoModeBanner from "@/components/DemoModeBanner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Health Journal | Personal Health Tracking",
  description: "A personal health tracking application with AI-powered insights for nutrition, workouts, sleep, and wellness.",
  keywords: ["health", "tracking", "journal", "nutrition", "fitness", "wellness", "AI"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider>
          {children}
          <FloatingChat />
          <DemoModeBanner />
        </SessionProvider>
      </body>
    </html>
  );
}
