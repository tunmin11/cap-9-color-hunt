"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

interface LeaderboardUser {
    uid: string;
    displayName: string;
    photoURL: string | null;
    count: number;
}

export default function LeaderboardClient() {
    const [users, setUsers] = useState<LeaderboardUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const response = await fetch("/api/leaderboard");
                if (!response.ok) {
                    throw new Error("Failed to fetch leaderboard");
                }
                const data = await response.json();
                setUsers(data);
            } catch (err: any) {
                console.error("Error fetching leaderboard:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, []);

    const getRankStyle = (index: number) => {
        switch (index) {
            case 0: return "bg-gradient-to-br from-yellow-300 to-yellow-600 text-white shadow-yellow-500/50";
            case 1: return "bg-gradient-to-br from-slate-300 to-slate-500 text-white shadow-slate-400/50";
            case 2: return "bg-gradient-to-br from-orange-300 to-orange-600 text-white shadow-orange-500/50";
            default: return "bg-white/10 text-neutral-400";
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground p-4 pb-24">
            <div className="max-w-2xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 text-center"
                >
                    <h1 className="text-3xl font-black text-[#A41F13] mb-2">Leaderboard</h1>
                    <p className="text-[#A41F13]/60">Top hunters of all time</p>
                </motion.div>

                {error ? (
                    <div className="text-center py-20">
                        <p className="text-[#A41F13] mb-2 font-bold">Something went wrong.</p>
                        <p className="text-[#A41F13]/60 text-sm">{error}</p>
                    </div>
                ) : loading ? (
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-20 bg-black/5 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                ) : users.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center text-[#A41F13]/50 py-20 font-medium"
                    >
                        No hunts completed yet.
                    </motion.div>
                ) : (
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={{
                            visible: {
                                transition: {
                                    staggerChildren: 0.05
                                }
                            }
                        }}
                        className="space-y-3"
                    >
                        {users.map((user, index) => (
                            <motion.div
                                key={user.uid}
                                variants={{
                                    hidden: { opacity: 0, x: -20 },
                                    visible: { opacity: 1, x: 0 }
                                }}
                            >
                                <Link href={`/profile/${user.uid}`} className="block group">
                                    <div className="relative flex items-center gap-4 p-4 bg-white/40 backdrop-blur-md border border-white/20 rounded-2xl shadow-sm transition-all hover:scale-[1.02] hover:bg-white/60 hover:shadow-lg hover:shadow-[#A41F13]/10">

                                        {/* Rank Badge */}
                                        <div className={`
                                            flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm shadow-lg
                                            ${getRankStyle(index)}
                                        `}>
                                            {index + 1}
                                        </div>

                                        {/* Avatar */}
                                        <div className="relative">
                                            {user.photoURL ? (
                                                <img
                                                    src={user.photoURL}
                                                    alt={user.displayName}
                                                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 bg-[#A41F13] text-[#E0DBD8] rounded-full flex items-center justify-center text-lg font-bold border-2 border-white shadow-sm">
                                                    {user.displayName?.[0]?.toUpperCase() || "?"}
                                                </div>
                                            )}
                                            {index < 3 && (
                                                <div className="absolute -top-1 -right-1 text-lg">
                                                    {index === 0 && "👑"}
                                                    {index === 1 && "🥈"}
                                                    {index === 2 && "🥉"}
                                                </div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-[#A41F13] truncate">
                                                {user.displayName}
                                            </h3>
                                            <p className="text-xs text-[#A41F13]/60 font-medium">
                                                Master Hunter
                                            </p>
                                        </div>

                                        {/* Score */}
                                        <div className="text-right">
                                            <div className="text-2xl font-black text-[#A41F13]">
                                                {user.count}
                                            </div>
                                            <div className="text-[10px] uppercase tracking-wider font-bold text-[#A41F13]/40">
                                                Hunts
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
