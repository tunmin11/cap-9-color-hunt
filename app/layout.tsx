import type { Metadata } from "next";
import { AuthProvider } from "../context/AuthContext";
import Link from "next/link";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Colour Hunt - Daily Photography Challenge",
    template: "%s | Colour Hunt",
  },
  description: "Join the ultimate real-world scavenger hunt. Find colors, snap photos, and complete the 9-grid challenge. A creative photography game for everyone.",
  keywords: ["photography challenge", "color hunt", "scavenger hunt", "photo game", "creative challenge", "daily challenge", "photography", "colors"],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://colourhunt.app",
    siteName: "Colour Hunt",
    title: "Colour Hunt - Daily Photography Challenge",
    description: "Join the ultimate real-world scavenger hunt. Find colors, snap photos, and complete the 9-grid challenge.",
    images: [
      {
        url: "/og-image.jpg", // We should probably ensure this exists or use a default
        width: 1200,
        height: 630,
        alt: "Colour Hunt App",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Colour Hunt - Daily Photography Challenge",
    description: "Join the ultimate real-world scavenger hunt. Find colors, snap photos, and complete the 9-grid challenge.",
    images: ["/og-image.jpg"],
  },
  icons: {
    icon: "/logo.svg",
    apple: "/apple-touch-icon.png", // Assuming we might add this later or it exists
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
