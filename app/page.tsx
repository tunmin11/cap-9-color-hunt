"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

import { Logo } from "@/components/Logo";

export default function Home() {
  const { user, login } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 relative overflow-hidden font-[family-name:var(--font-geist-sans)]">

      {/* Background Texture/Gradient */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-[#A41F13] rounded-full blur-[150px] opacity-20" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] bg-[#A41F13] rounded-full blur-[150px] opacity-20" />
        <div className="absolute top-[40%] left-[30%] w-[60%] h-[60%] bg-[#A41F13] rounded-full blur-[180px] opacity-10" />
      </div>

      <main className="z-10 flex flex-col items-center text-center max-w-2xl w-full">
        {/* Logo / Badge */}
        <div className="mb-8 animate-fade-in">
          <Logo className="w-24 h-24 md:w-32 md:h-32" />
        </div>

        <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-6 leading-none">
          COLOUR<br />HUNT
        </h1>

        <p className="text-xl md:text-2xl mb-12 font-medium opacity-80 max-w-lg mx-auto">
          The ultimate real-world scavenger hunt. Find colors, snap photos, complete the grid.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
          {user ? (
            <Link
              href="/profile"
              className="flex-1 bg-[#A41F13] text-[#E0DBD8] py-4 rounded-xl font-bold text-lg hover:scale-105 transition-transform shadow-xl flex items-center justify-center gap-2"
            >
              <span>Continue Hunt</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          ) : (
            <button
              onClick={login}
              className="flex-1 bg-[#A41F13] text-[#E0DBD8] py-4 rounded-xl font-bold text-lg hover:scale-105 transition-transform shadow-xl flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#E0DBD8" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#E0DBD8" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#E0DBD8" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#E0DBD8" />
              </svg>
              Sign in with Google
            </button>
          )}

          <Link
            href="/feed"
            className="flex-1 bg-white/50 backdrop-blur-sm text-[#A41F13] border-2 border-[#A41F13] py-4 rounded-xl font-bold text-lg hover:bg-[#A41F13] hover:text-[#E0DBD8] transition-all flex items-center justify-center"
          >
            Community Feed
          </Link>
        </div>
      </main>

      <footer className="absolute bottom-28 text-sm font-medium opacity-60">
        CAP 9 © {new Date().getFullYear()}
      </footer>
    </div>
  );
}
