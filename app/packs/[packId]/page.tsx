"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useParams } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import PackGrid from "@/components/PackGrid";
import Link from "next/link";

export default function PackPage() {
    const { packId } = useParams();
    const { user } = useAuth();
    const [pack, setPack] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!packId) return;

        const fetchPack = async () => {
            try {
                const response = await fetch(`/api/packs/${packId}`);
                if (response.ok) {
                    const data = await response.json();
                    setPack(data);
                }
            } catch (error) {
                console.error("Error fetching pack:", error);
            } finally {
                setLoading(false);
            }
        };

        // Initial fetch
        fetchPack();

        // Poll every 2 seconds for updates, but stop if complete
        const interval = setInterval(() => {
            if (pack?.status !== 'complete') {
                fetchPack();
            }
        }, 2000);

        return () => clearInterval(interval);
    }, [packId, pack?.status]);

    if (loading) {
        return (
            <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
            </div>
        );
    }

    if (!pack) {
        return (
            <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-white">
                Pack not found
            </div>
        );
    }

    const handleShare = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url);
        alert("Link copied to clipboard!");
    };

    return (
        <AuthGuard>
            <div className="min-h-screen bg-neutral-950 text-white p-4 md:p-8 pb-24">
                <div className="max-w-4xl mx-auto flex flex-col items-center">
                    <div className="w-full flex justify-between items-center mb-8">
                        <Link href="/" className="text-neutral-400 hover:text-white transition-colors">
                            ← Back
                        </Link>
                        <div className="flex items-center gap-3">
                            <div
                                className="w-6 h-6 rounded-full border border-white/20"
                                style={{ backgroundColor: pack.targetColor.hex }}
                            />
                            <span className="font-bold text-xl">{pack.targetColor.name} Hunt</span>
                        </div>
                        <button onClick={handleShare} className="text-neutral-400 hover:text-white transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                            </svg>
                        </button>
                    </div>

                    <div className="relative">
                        <PackGrid
                            packId={pack.id}
                            userId={user?.uid || ""}
                            images={pack.images || {}}
                            targetColorHex={pack.targetColor.hex}
                            targetColorObject={pack.targetColor}
                        />

                        {/* Celebration Overlay */}
                        {pack.status === "complete" && (
                            <div className="absolute -inset-4 z-20 pointer-events-none flex items-center justify-center">
                                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-transparent" />
                                <div className="bg-black/80 backdrop-blur-md text-white px-6 py-3 rounded-full border border-white/20 shadow-2xl transform translate-y-full animate-bounce">
                                    <span className="text-2xl mr-2">🎉</span>
                                    <span className="font-bold">Hunt Completed!</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mt-8 text-center text-neutral-400 max-w-md">
                        {pack.status === "complete" ? (
                            <div className="space-y-4">
                                <p className="text-lg text-white font-bold">Congratulations!</p>
                                <p>You've found all 9 {pack.targetColor.name} items.</p>
                                <button
                                    onClick={handleShare}
                                    className="bg-white text-black px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform"
                                >
                                    Share Result
                                </button>
                            </div>
                        ) : (
                            <p>Tap a square to upload a photo. Find something that matches <span className="text-white font-bold" style={{ color: pack.targetColor.hex }}>{pack.targetColor.name}</span>!</p>
                        )}
                    </div>
                </div>
            </div>
        </AuthGuard>
    );
}
