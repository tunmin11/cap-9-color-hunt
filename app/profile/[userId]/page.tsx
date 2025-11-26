"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";

export default function PublicProfilePage() {
    const params = useParams();
    const userId = params.userId as string;

    const [profileUser, setProfileUser] = useState<any>(null);
    const [packs, setPacks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!userId) return;

        const fetchData = async () => {
            try {
                // 1. Fetch User Data (We can reuse the packs endpoint or make a new one, 
                // but for now let's just infer from packs or we need a public user endpoint.
                // Actually, we don't have a public user endpoint. 
                // Let's rely on the packs endpoint to get packs, and maybe we can extract user info from there 
                // if we update the packs endpoint to return user info, OR we create a simple user fetcher.

                // Let's create a quick way to get user info. 
                // Since we don't have a dedicated public user API, we'll fetch packs and use the first one's user data 
                // IF we had it denormalized. But we don't.
                // We should probably add a route to get public user info.
                // For MVP, let's just fetch packs and if the API returns user info attached to packs (which we just added for feed, but not for user packs endpoint), we could use that.

                // Wait, the /api/packs/user endpoint just returns packs.
                // Let's assume we need to fetch user info separately.
                // I'll create a simple client-side fetch to a new endpoint or just use the packs for now and show "User's Profile".
                // BETTER: Let's make a new endpoint /api/users/[userId]

                const userRes = await fetch(`/api/users/${userId}`);
                if (!userRes.ok) throw new Error("User not found");
                const userData = await userRes.json();
                setProfileUser(userData);

                const packsRes = await fetch(`/api/packs/user?userId=${userId}`);
                if (!packsRes.ok) throw new Error("Failed to fetch packs");
                const packsData = await packsRes.json();
                setPacks(packsData);

            } catch (err: any) {
                console.error("Error loading profile:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [userId]);

    const completedPacks = packs.filter(p => p.status === "complete");

    return (
        <AuthGuard>
            <div className="min-h-screen bg-neutral-950 text-white p-4 pb-24">
                <div className="max-w-2xl mx-auto">
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                        </div>
                    ) : error ? (
                        <div className="text-center py-20 text-red-400">{error}</div>
                    ) : (
                        <>
                            {/* Header */}
                            <div className="flex flex-col items-center mb-12 pt-8">
                                {profileUser?.photoURL ? (
                                    <img
                                        src={profileUser.photoURL}
                                        alt="Profile"
                                        className="w-24 h-24 rounded-full object-cover border-4 border-neutral-800"
                                    />
                                ) : (
                                    <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-3xl font-bold border-4 border-neutral-800">
                                        {profileUser?.displayName?.[0]?.toUpperCase() || "?"}
                                    </div>
                                )}

                                <h1 className="text-2xl font-bold mt-4">{profileUser?.displayName || "Anonymous"}</h1>

                                <div className="flex gap-4 mt-6 text-sm text-neutral-400">
                                    <div className="text-center">
                                        <span className="block text-white font-bold text-lg">{packs.length}</span>
                                        Total Hunts
                                    </div>
                                    <div className="text-center">
                                        <span className="block text-white font-bold text-lg">{completedPacks.length}</span>
                                        Completed
                                    </div>
                                </div>
                            </div>

                            <h2 className="text-xl font-bold mb-6">Completed Hunts</h2>

                            {completedPacks.length === 0 ? (
                                <p className="text-neutral-500 text-center">No completed hunts yet.</p>
                            ) : (
                                <div className="grid grid-cols-2 gap-4">
                                    {completedPacks.map((pack) => (
                                        <Link href={`/packs/${pack.id}`} key={pack.id} className="block group">
                                            <div className="bg-neutral-900 rounded-2xl overflow-hidden border border-neutral-800 transition-transform group-hover:scale-[1.02]">
                                                <div className="p-3 flex items-center justify-between border-b border-neutral-800">
                                                    <div className="flex items-center gap-2">
                                                        <div
                                                            className="w-4 h-4 rounded-full border border-white/10"
                                                            style={{ backgroundColor: pack.targetColor.hex }}
                                                        />
                                                        <span className="font-bold text-sm">{pack.targetColor.name}</span>
                                                    </div>
                                                </div>
                                                <div className="aspect-square p-2">
                                                    <div className="grid grid-cols-3 gap-0.5 w-full h-full rounded-lg overflow-hidden">
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
                                                                            className="w-full h-full opacity-10"
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
                        </>
                    )}
                </div>
            </div>
        </AuthGuard>
    );
}
