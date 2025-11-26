"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col">
      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[100px] -z-10" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] -z-10" />

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-br from-white via-neutral-200 to-neutral-500 bg-clip-text text-transparent">
          Capture the World<br />in Color
        </h1>

        <p className="text-lg md:text-xl text-neutral-400 max-w-2xl mb-10 leading-relaxed">
          A photography challenge to find beauty in the everyday.
          Pick a color, find 9 matching objects, and complete your collection.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
          {user ? (
            <Link
              href="/create"
              className="flex-1 bg-white text-black font-bold py-4 px-8 rounded-full hover:scale-105 transition-transform flex items-center justify-center gap-2"
            >
              Start New Hunt
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="flex-1 bg-white text-black font-bold py-4 px-8 rounded-full hover:scale-105 transition-transform"
              >
                Get Started
              </Link>
              <Link
                href="/feed"
                className="flex-1 bg-neutral-900 border border-neutral-800 text-white font-bold py-4 px-8 rounded-full hover:bg-neutral-800 transition-colors"
              >
                Explore Feed
              </Link>
            </>
          )}
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 max-w-4xl w-full text-left">
          <div className="p-6 rounded-2xl bg-neutral-900/50 border border-white/5 backdrop-blur-sm">
            <div className="w-12 h-12 bg-red-500/20 text-red-400 rounded-xl flex items-center justify-center mb-4 text-2xl">
              🎨
            </div>
            <h3 className="font-bold text-lg mb-2">Pick a Color</h3>
            <p className="text-neutral-400 text-sm">Choose from our curated palette of target colors to start your hunt.</p>
          </div>
          <div className="p-6 rounded-2xl bg-neutral-900/50 border border-white/5 backdrop-blur-sm">
            <div className="w-12 h-12 bg-green-500/20 text-green-400 rounded-xl flex items-center justify-center mb-4 text-2xl">
              📸
            </div>
            <h3 className="font-bold text-lg mb-2">Snap & Verify</h3>
            <p className="text-neutral-400 text-sm">Take photos of real-world objects. Our AI instantly verifies the color match.</p>
          </div>
          <div className="p-6 rounded-2xl bg-neutral-900/50 border border-white/5 backdrop-blur-sm">
            <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center mb-4 text-2xl">
              🏆
            </div>
            <h3 className="font-bold text-lg mb-2">Complete the Grid</h3>
            <p className="text-neutral-400 text-sm">Fill all 9 cells to unlock the aesthetic badge and share your collection.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-neutral-600 text-sm pb-24">
        <p>© {new Date().getFullYear()} Color Hunt. Built with Next.js & Firebase.</p>
      </footer>
    </div>
  );
}
