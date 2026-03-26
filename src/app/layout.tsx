import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import { BackgroundCanvas } from "@/components/BackgroundCanvas";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "OBSIDIAN - AI Architecture",
  description: "Transform single prompts into comprehensive AI-analyzed outputs through research, reasoning, coding, and final synthesis.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
      </head>
      <body
        className={`${inter.variable} ${manrope.variable} antialiased min-h-screen bg-background text-on-background font-body selection:bg-primary/30 overflow-x-hidden relative`}
      >
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] glow-orb"></div>
          <div className="absolute bottom-[-20%] left-[-10%] w-[80%] h-[80%] glow-orb opacity-50"></div>
        </div>
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-background focus:text-foreground focus:rounded-md focus:border focus:border-border">
          Skip to content
        </a>
        <div className="relative isolate z-10 w-full min-h-screen">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </div>
      </body>
    </html>
  );
}