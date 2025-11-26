import type { Metadata } from "next";
import { AuthProvider } from "../context/AuthContext";
import Link from "next/link";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";

import "./globals.css";

export const metadata: Metadata = {
  title: "capnine.club",
  description: "A 9-cell color photography challenge",
  icons: {
    icon: "/logo.svg",
  },
};

import { NavBar } from "../components/NavBar";
import PageWrapper from "../components/PageWrapper";

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
          <PageWrapper>
            {children}
          </PageWrapper>
          <NavBar />
        </AuthProvider>
      </body>
    </html>
  );
}
