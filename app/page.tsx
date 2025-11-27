import type { Metadata } from "next";
import HomeClient from "@/components/HomeClient";

export const metadata: Metadata = {
  title: "Colour Hunt - The Real-World Color Photography Game",
  description: "Start your daily photography challenge. Find 9 items matching the target color, snap photos, and complete your grid. Join the Colour Hunt community today.",
};

export default function Home() {
  return <HomeClient />;
}
