import React from "react";
import type { Viewport } from "next";
import "./globals.css"; 

export const metadata = {
  title: "Faculty Management System",
  description: "Enterprise Suite Portal",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-[#FAF9F6] text-[#2D2D2D] antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
