"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import FollowButton from "@/components/FollowButton";
import VoteControl from "@/components/VoteControl";

export default function PublicProfilePage() {
    const params = useParams();
    const userId = params.userId as string;
    const { user } = useAuth();

    const [profileUser, setProfileUser] = useState<any>(null);
    const [packs, setPacks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!userId) return;

        const fetchData = async () => {
            try {
                const headers: HeadersInit = {};
                if (user) {
                    const token = await user.getIdToken();
                    headers["Authorization"] = `Bearer ${token}`;
                }

                const userRes = await fetch(`/api/users/${userId}`, { headers });
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
    }, [userId, user]);

    const completedPacks = packs.filter(p => p.status === "complete");

    return (
        <div className="min-h-screen bg-[#E0DBD8] text-[#A41F13] p-4 pb-24">
            <div className="max-w-2xl mx-auto">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#A41F13]"></div>
                    </div>
                ) : error ? (
                    <div className="text-center py-20 text-[#A41F13]/60 font-medium">{error}</div>
                ) : (
                    <>
                        {/* Header */}
                        <div className="flex flex-col items-center mb-12 pt-8">
                            {profileUser?.photoURL ? (
                                <img
                                    src={profileUser.photoURL}
                                    alt="Profile"
                                    className="w-24 h-24 rounded-full object-cover border-4 border-[#A41F13]"
                                />
                            ) : (
                                <div className="w-24 h-24 bg-[#A41F13] text-[#E0DBD8] rounded-full flex items-center justify-center text-3xl font-bold border-4 border-[#A41F13]">
                                    {profileUser?.displayName?.[0]?.toUpperCase() || "?"}
                                </div>
                            )}

                            <h1 className="text-2xl font-black mt-4 tracking-tight text-[#A41F13]">{profileUser?.displayName || "Anonymous"}</h1>

                            <div className="flex gap-4 mt-6 text-sm text-[#A41F13]/80">
                                <div className="text-center">
                                    <span className="block text-[#A41F13] font-black text-xl">{packs.length}</span>
                                    Total Hunts
                                </div>
                                <div className="text-center">
                                    <span className="block text-[#A41F13] font-black text-xl">{completedPacks.length}</span>
                                    Completed
                                </div>
                                <div className="text-center">
                                    <span className="block text-[#A41F13] font-black text-xl">{profileUser?.followersCount || 0}</span>
                                    Followers
                                </div>
                                <div className="text-center">
                                    <span className="block text-[#A41F13] font-black text-xl">{profileUser?.followingCount || 0}</span>
                                    Following
                                </div>
                            </div>

                            {user && user.uid !== userId && (
                                <div className="mt-6">
                                    <FollowButton
                                        targetUserId={userId}
                                        initialIsFollowing={profileUser?.isFollowing || false}
                                        onFollowChange={(isFollowing) => {
                                            setProfileUser((prev: any) => ({
                                                ...prev,
                                                followersCount: isFollowing
                                                    ? (prev.followersCount || 0) + 1
                                                    : (prev.followersCount || 0) - 1
                                            }));
                                        }}
                                    />
                                </div>
                            )}
                        </div>

                        <h2 className="text-xl font-black mb-6 text-[#A41F13]">Completed Hunts</h2>

                        {completedPacks.length === 0 ? (
                            <p className="text-[#A41F13]/50 text-center font-medium">No completed hunts yet.</p>
                        ) : (
                            <div className="grid grid-cols-2 gap-4">
                                {completedPacks.map((pack) => (
                                    <Link href={`/packs/${pack.id}`} key={pack.id} className="block group">
                                        <div className="bg-white rounded-2xl overflow-hidden border-2 border-[#A41F13]/10 transition-all group-hover:border-[#A41F13] group-hover:shadow-lg">
                                            <div className="p-3 flex items-center justify-between border-b border-[#A41F13]/10 bg-[#A41F13]/5">
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="w-4 h-4 rounded-full border border-black/10 shadow-sm"
                                                        style={{ backgroundColor: pack.targetColor.hex }}
                                                    />
                                                    <span className="font-bold text-sm text-[#A41F13]">{pack.targetColor.name}</span>
                                                </div>
                                            </div>
                                            <div className="aspect-square p-2">
                                                <div className="grid grid-cols-3 gap-0.5 w-full h-full rounded-lg overflow-hidden">
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

                                            {/* Vote Control */}
                                            <div className="px-3 py-2 border-t border-[#A41F13]/10 flex justify-end" onClick={(e) => e.preventDefault()}>
                                                <VoteControl
                                                    packId={pack.id}
                                                    initialScore={pack.likesCount || 0}
                                                    initialUserVote={pack.userVote || 0}
                                                />
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
    );
}
