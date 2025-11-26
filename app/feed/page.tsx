"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";

export default function FeedPage() {
    const [packs, setPacks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchFeed = async () => {
            try {
                const response = await fetch("/api/feed");
                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.error || "Failed to fetch feed");
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

        fetchFeed();
    }, []);

    return (
        <AuthGuard>
            <div className="min-h-screen bg-background text-foreground p-4 pb-24">
                <div className="max-w-2xl mx-auto">
                    <h1 className="text-3xl font-black mb-8 text-[#A41F13] tracking-tight">
                        Global Hunt Feed
                    </h1>

                    {error ? (
                        <div className="text-center py-20">
                            <p className="text-[#A41F13] mb-2 font-bold">Something went wrong.</p>
                            <p className="text-[#A41F13]/60 text-sm">{error}</p>
                        </div>
                    ) : loading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-4 border-b-4 border-[#A41F13]"></div>
                        </div>
                    ) : packs.length === 0 ? (
                        <div className="text-center text-[#A41F13]/50 py-20 font-medium">
                            No completed hunts yet. Be the first!
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {packs.map((pack) => (
                                <Link href={`/packs/${pack.id}`} key={pack.id} className="block group">
                                    <div className="bg-white rounded-2xl overflow-hidden border-2 border-[#A41F13]/10 transition-all group-hover:border-[#A41F13] group-hover:shadow-lg">
                                        {/* Header */}
                                        <div className="p-4 flex items-center justify-between border-b border-[#A41F13]/10 bg-[#A41F13]/5">
                                            <div className="flex items-center gap-3">
                                                <Link
                                                    href={`/profile/${pack.user?.uid}`}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="flex items-center gap-2 hover:opacity-80 transition-opacity"
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
                                                    <span className="font-bold text-sm text-[#A41F13]">{pack.user?.displayName || "Anonymous"}</span>
                                                </Link>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-3 h-3 rounded-full border border-black/10 shadow-sm"
                                                    style={{ backgroundColor: pack.targetColor.hex }}
                                                />
                                                <span className="text-xs text-[#A41F13]/60 font-medium">
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
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AuthGuard>
    );
}
