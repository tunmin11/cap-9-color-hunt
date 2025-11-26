import type { Metadata } from "next";
import { AuthProvider } from "../context/AuthContext";
import Link from "next/link";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";

import "./globals.css";

export const metadata: Metadata = {
  title: "Color Hunt",
  description: "A 9-cell color photography challenge",
};

import { NavBar } from "../components/NavBar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} antialiased bg-neutral-950 text-white`}
      >
        <AuthProvider>
          {children}
          <NavBar />
        </AuthProvider>
      </body>
    </html>
  );
}
