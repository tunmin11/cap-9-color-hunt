"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "@/components/Logo";
import { motion } from "framer-motion";

export default function HomeClient() {
    const { user, login } = useAuth();

    return (
        <div className="h-[100dvh] bg-background text-foreground flex flex-col items-center justify-center p-4 relative overflow-hidden font-[family-name:var(--font-geist-sans)]">

            {/* Background Texture/Gradient */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.2, 0.3, 0.2],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-[#A41F13] rounded-full blur-[150px] opacity-20"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.2, 0.1, 0.2],
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 2
                    }}
                    className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] bg-[#A41F13] rounded-full blur-[150px] opacity-20"
                />
                <div className="absolute top-[40%] left-[30%] w-[60%] h-[60%] bg-[#A41F13] rounded-full blur-[180px] opacity-10" />
            </div>

            <main className="z-10 flex flex-col items-center text-center max-w-2xl w-full">
                {/* Logo / Badge */}
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
                    className="mb-4 md:mb-6"
                >
                    <Logo className="w-16 h-16 md:w-24 md:h-24" />
                </motion.div>

                <motion.h1
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-4xl md:text-6xl font-black tracking-tighter mb-3 md:mb-5 leading-none"
                >
                    COLOUR<br />HUNT
                </motion.h1>

                <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-base md:text-xl mb-6 md:mb-8 font-medium opacity-80 max-w-lg mx-auto px-4"
                >
                    The ultimate real-world scavenger hunt. Find colors, snap photos, complete the grid.
                </motion.p>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="flex flex-col sm:flex-row gap-3 w-full max-w-md px-4"
                >
                    {user ? (
                        <Link
                            href="/profile"
                            className="flex-1"
                        >
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="bg-[#A41F13] text-[#E0DBD8] py-3 rounded-xl font-bold text-base shadow-xl flex items-center justify-center gap-2 h-full"
                            >
                                <span>Continue Hunt</span>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </motion.div>
                        </Link>
                    ) : (
                        <motion.button
                            onClick={login}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex-1 bg-[#A41F13] text-[#E0DBD8] py-3 rounded-xl font-bold text-base shadow-xl flex items-center justify-center gap-2"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#E0DBD8" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#E0DBD8" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#E0DBD8" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#E0DBD8" />
                            </svg>
                            Sign in with Google
                        </motion.button>
                    )}

                    <Link
                        href="/feed"
                        className="flex-1"
                    >
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-white/50 backdrop-blur-sm text-[#A41F13] border-2 border-[#A41F13] py-3 rounded-xl font-bold text-base hover:bg-[#A41F13] hover:text-[#E0DBD8] transition-colors flex items-center justify-center h-full"
                        >
                            Community Feed
                        </motion.div>
                    </Link>
                </motion.div>
            </main>

            <footer className="absolute bottom-24 md:bottom-28 text-sm font-medium opacity-60">
                CAP 9 © {new Date().getFullYear()}
            </footer>
        </div>
    );
}
