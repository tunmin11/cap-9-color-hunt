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
            <div className="min-h-screen bg-neutral-950 text-white p-4 pb-24">
                <div className="max-w-2xl mx-auto">
                    <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                        Global Hunt Feed
                    </h1>

                    {error ? (
                        <div className="text-center py-20">
                            <p className="text-red-400 mb-2">Something went wrong.</p>
                            <p className="text-neutral-500 text-sm">{error}</p>
                            {error.includes("index") && (
                                <p className="text-neutral-600 text-xs mt-4 max-w-md mx-auto">
                                    (Developer Note: Check the server console for the Firestore Index creation link)
                                </p>
                            )}
                        </div>
                    ) : loading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                        </div>
                    ) : packs.length === 0 ? (
                        <div className="text-center text-neutral-500 py-20">
                            No completed hunts yet. Be the first!
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {packs.map((pack) => (
                                <Link href={`/packs/${pack.id}`} key={pack.id} className="block group">
                                    <div className="bg-neutral-900 rounded-2xl overflow-hidden border border-neutral-800 transition-transform group-hover:scale-[1.02]">
                                        {/* Header */}
                                        <div className="p-4 flex items-center gap-3 border-b border-neutral-800">
                                            <div
                                                className="w-8 h-8 rounded-full border border-white/10"
                                                style={{ backgroundColor: pack.targetColor.hex }}
                                            />
                                            <div>
                                                <h3 className="font-bold">{pack.targetColor.name} Hunt</h3>
                                                <p className="text-xs text-neutral-500">
                                                    Completed {new Date(pack.completedAt?._seconds * 1000).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Grid Preview */}
                                        <div className="aspect-square p-2">
                                            <div className="grid grid-cols-3 gap-1 w-full h-full rounded-xl overflow-hidden">
                                                {Array.from({ length: 9 }).map((_, i) => {
                                                    const img = pack.images?.[i];
                                                    return (
                                                        <div key={i} className="relative bg-neutral-800">
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
