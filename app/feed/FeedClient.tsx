"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PackGridSkeleton } from "@/components/Skeleton";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import VoteControl from "@/components/VoteControl";

export default function FeedClient() {
    const { user, loading: authLoading } = useAuth();
    const [packs, setPacks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"global" | "following">("global");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (authLoading) return;

        const fetchPacks = async () => {
            setLoading(true);
            try {
                const headers: HeadersInit = {};
                if (user) {
                    const token = await user.getIdToken();
                    headers["Authorization"] = `Bearer ${token}`;
                }

                const url = activeTab === "following" ? "/api/feed?filter=following" : "/api/feed";
                const response = await fetch(url, { headers });
                if (!response.ok) {
                    throw new Error("Failed to fetch feed");
                }
                const data = await response.json();
                setPacks(data);
            } catch (err: any) {
                console.error("Error fetching feed:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPacks();
    }, [authLoading, user, activeTab]);

    return (
        <div className="min-h-screen bg-background text-foreground p-4 pb-24">
            <div className="max-w-2xl mx-auto">
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-2xl font-black text-[#A41F13] mb-6"
                >
                    Community Feed
                </motion.h1>

                {user && (
                    <div className="flex border-b-2 border-[#A41F13]/10 mb-8">
                        <button
                            onClick={() => setActiveTab("global")}
                            className={`flex-1 pb-4 text-sm font-bold transition-colors ${activeTab === "global"
                                ? "text-[#A41F13] border-b-4 border-[#A41F13] -mb-[2px]"
                                : "text-[#A41F13]/40 hover:text-[#A41F13]/60"
                                }`}
                        >
                            Global
                        </button>
                        <button
                            onClick={() => setActiveTab("following")}
                            className={`flex-1 pb-4 text-sm font-bold transition-colors ${activeTab === "following"
                                ? "text-[#A41F13] border-b-4 border-[#A41F13] -mb-[2px]"
                                : "text-[#A41F13]/40 hover:text-[#A41F13]/60"
                                }`}
                        >
                            Following
                        </button>
                    </div>
                )}

                {error ? (
                    <div className="text-center py-20">
                        <p className="text-[#A41F13] mb-2 font-bold">Something went wrong.</p>
                        <p className="text-[#A41F13]/60 text-sm">{error}</p>
                    </div>
                ) : loading || authLoading ? (
                    <PackGridSkeleton />
                ) : packs.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center text-[#A41F13]/50 py-20 font-medium"
                    >
                        {activeTab === "following" ? "You aren't following anyone yet." : "No completed hunts yet. Be the first!"}
                    </motion.div>
                ) : (
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={{
                            visible: {
                                transition: {
                                    staggerChildren: 0.1
                                }
                            }
                        }}
                        className="space-y-8"
                    >
                        {packs.map((pack) => (
                            <motion.div
                                key={pack.id}
                                variants={{
                                    hidden: { opacity: 0, y: 20 },
                                    visible: { opacity: 1, y: 0 }
                                }}
                            >
                                <div className="bg-white rounded-2xl overflow-hidden border-2 border-[#A41F13]/10 transition-all hover:border-[#A41F13] hover:shadow-lg">
                                    <Link href={`/packs/${pack.id}`} className="block group">
                                        {/* Header */}
                                        <div className="p-3 md:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#A41F13]/10 bg-[#A41F13]/5">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        // Navigate to profile
                                                        window.location.href = `/profile/${pack.user?.uid}`;
                                                    }}
                                                    className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
                                                >
                                                    {pack.user?.photoURL ? (
                                                        <img
                                                            src={pack.user.photoURL}
                                                            alt={pack.user.displayName}
                                                            className="w-8 h-8 rounded-full object-cover border border-[#A41F13]/20"
                                                        />
                                                    ) : (
                                                        <div className="w-8 h-8 bg-[#A41F13] text-[#E0DBD8] rounded-full flex items-center justify-center text-xs font-bold">
                                                            {pack.user?.displayName?.[0]?.toUpperCase() || "?"}
                                                        </div>
                                                    )}
                                                    <span className="font-bold text-sm text-[#A41F13] truncate max-w-[150px] sm:max-w-none">{pack.user?.displayName || "Anonymous"}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 pl-11 sm:pl-0">
                                                <div
                                                    className="w-3 h-3 rounded-full border border-black/10 shadow-sm shrink-0"
                                                    style={{ backgroundColor: pack.targetColor.hex }}
                                                />
                                                <span className="text-xs text-[#A41F13]/60 font-medium truncate">
                                                    {pack.targetColor.name} • {new Date(pack.completedAt?._seconds * 1000).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Grid Preview */}
                                        <div className="aspect-square p-2">
                                            <div className="grid grid-cols-3 gap-1 w-full h-full rounded-xl overflow-hidden">
                                                {Array.from({ length: 9 }).map((_, i) => {
                                                    const img = pack.images?.[i];
                                                    return (
                                                        <div key={i} className="relative bg-[#A41F13]/5">
                                                            {img?.imageUrl ? (
                                                                <img
                                                                    src={img.imageUrl}
                                                                    alt=""
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <div
                                                                    className="w-full h-full opacity-20"
                                                                    style={{ backgroundColor: pack.targetColor.hex }}
                                                                />
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </Link>

                                    {/* Actions Footer */}
                                    <div className="px-4 py-3 border-t border-[#A41F13]/10 flex flex-col gap-3">
                                        <div className="flex items-start gap-4">
                                            <VoteControl
                                                packId={pack.id}
                                                initialScore={pack.likesCount || 0}
                                                initialUserVote={pack.userVote || 0}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
