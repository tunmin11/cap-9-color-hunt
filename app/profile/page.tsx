"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import { useAuth } from "@/context/AuthContext";
import { updateProfile } from "firebase/auth";

export default function ProfilePage() {
    const { user } = useAuth();
    const [packs, setPacks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"inprogress" | "completed">("inprogress");
    const [error, setError] = useState<string | null>(null);

    const [isEditing, setIsEditing] = useState(false);
    const [newName, setNewName] = useState("");
    const [newAvatar, setNewAvatar] = useState<File | null>(null);
    const [saving, setSaving] = useState(false);
    const { logout, refreshUser } = useAuth();

    useEffect(() => {
        if (!user) return;

        const fetchPacks = async () => {
            try {
                const response = await fetch(`/api/packs/user?userId=${user.uid}`);
                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.error || "Failed to fetch packs");
                }
                const data = await response.json();
                setPacks(data);
            } catch (err: any) {
                console.error("Error fetching packs:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPacks();
    }, [user]);

    const completedPacks = packs.filter(p => p.status === "complete");
    const inProgressPacks = packs.filter(p => p.status !== "complete");
    const displayedPacks = activeTab === "completed" ? completedPacks : inProgressPacks;

    const handleEditClick = () => {
        setNewName(user?.displayName || "");
        setIsEditing(true);
    };

    const handleSaveProfile = async () => {
        if (!user) return;
        setSaving(true);
        try {
            let photoURL = user.photoURL;

            // 1. Upload Avatar if changed
            if (newAvatar && newAvatar.size > 0) {
                const formData = new FormData();
                formData.append("file", newAvatar);
                formData.append("userId", user.uid);

                const uploadRes = await fetch("/api/user/upload-avatar", {
                    method: "POST",
                    body: formData,
                });

                if (!uploadRes.ok) throw new Error("Failed to upload avatar");
                const { downloadURL } = await uploadRes.json();
                photoURL = downloadURL;
            }

            // 2. Update Firebase Auth (Client Side)
            // This ensures the UI updates immediately and the user context has the new data
            await updateProfile(user, {
                displayName: newName,
                photoURL: photoURL
            });

            // 3. Call Sync API (Updates Firestore)
            const syncRes = await fetch("/api/auth/sync", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    uid: user.uid,
                    email: user.email,
                    displayName: newName,
                    photoURL: photoURL,
                }),
            });

            if (!syncRes.ok) {
                const data = await syncRes.json();
                throw new Error(data.error || "Failed to update profile");
            }

            // 4. Refresh local user state without page reload
            await refreshUser();

        } catch (err: any) {
            console.error("Error updating profile:", err);
            alert(err.message || "Failed to update profile. Please try again.");
        } finally {
            setSaving(false);
            setIsEditing(false);
        }
    };

    return (
        <AuthGuard>
            <div className="min-h-screen bg-background text-foreground p-4 pb-24">
                <div className="max-w-2xl mx-auto">
                    {/* Header */}
                    <div className="flex flex-col items-center mb-8 pt-8 relative">
                        {/* Logout Button */}
                        <button
                            onClick={logout}
                            className="absolute top-0 right-0 text-[#A41F13]/60 hover:text-[#A41F13] text-sm font-bold transition-colors"
                        >
                            Logout
                        </button>

                        <div className="relative group cursor-pointer" onClick={handleEditClick}>
                            {user?.photoURL ? (
                                <img
                                    src={user.photoURL}
                                    alt="Profile"
                                    className="w-24 h-24 rounded-full object-cover border-4 border-[#A41F13] group-hover:scale-105 transition-transform"
                                />
                            ) : (
                                <div className="w-24 h-24 bg-[#A41F13] text-[#E0DBD8] rounded-full flex items-center justify-center text-3xl font-bold border-4 border-[#A41F13] group-hover:scale-105 transition-transform">
                                    {user?.email?.[0].toUpperCase()}
                                </div>
                            )}
                            <div className="absolute inset-0 flex items-center justify-center bg-[#A41F13]/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-xs font-bold text-white">Edit</span>
                            </div>
                        </div>

                        <h1 className="text-2xl font-black mt-4 tracking-tight">{user?.displayName || user?.email?.split("@")[0]}</h1>

                        <button
                            onClick={handleEditClick}
                            className="mt-2 text-sm text-[#A41F13]/60 hover:text-[#A41F13] transition-colors font-medium"
                        >
                            Edit Profile
                        </button>

                        <div className="flex gap-4 mt-6 text-sm text-[#A41F13]/80">
                            <div className="text-center">
                                <span className="block text-[#A41F13] font-black text-xl">{packs.length}</span>
                                Total Hunts
                            </div>
                            <div className="text-center">
                                <span className="block text-[#A41F13] font-black text-xl">{completedPacks.length}</span>
                                Completed
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b-2 border-[#A41F13]/10 mb-8">
                        <button
                            onClick={() => setActiveTab("inprogress")}
                            className={`flex-1 pb-4 text-sm font-bold transition-colors ${activeTab === "inprogress"
                                ? "text-[#A41F13] border-b-4 border-[#A41F13] -mb-[2px]"
                                : "text-[#A41F13]/40 hover:text-[#A41F13]/60"
                                }`}
                        >
                            In Progress ({inProgressPacks.length})
                        </button>
                        <button
                            onClick={() => setActiveTab("completed")}
                            className={`flex-1 pb-4 text-sm font-bold transition-colors ${activeTab === "completed"
                                ? "text-[#A41F13] border-b-4 border-[#A41F13] -mb-[2px]"
                                : "text-[#A41F13]/40 hover:text-[#A41F13]/60"
                                }`}
                        >
                            Completed ({completedPacks.length})
                        </button>
                    </div>

                    {/* Grid */}
                    {error ? (
                        <div className="text-center py-20">
                            <p className="text-[#A41F13] mb-2 font-bold">Something went wrong.</p>
                            <p className="text-[#A41F13]/60 text-sm">{error}</p>
                            {error.includes("index") && (
                                <p className="text-[#A41F13]/40 text-xs mt-4 max-w-md mx-auto">
                                    (Developer Note: Check the server console for the Firestore Index creation link)
                                </p>
                            )}
                        </div>
                    ) : loading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-4 border-b-4 border-[#A41F13]"></div>
                        </div>
                    ) : displayedPacks.length === 0 ? (
                        <div className="text-center text-[#A41F13]/50 py-20">
                            {activeTab === "inprogress" ? (
                                <div>
                                    <p className="mb-4 font-medium">No active hunts.</p>
                                    <Link href="/create" className="text-[#A41F13] hover:underline font-bold">
                                        Start a new one →
                                    </Link>
                                </div>
                            ) : (
                                <p className="font-medium">No completed hunts yet. Keep going!</p>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
                            {displayedPacks.map((pack) => (
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
                                            {pack.status === "complete" && (
                                                <span className="text-xs bg-[#A41F13] text-white px-2 py-0.5 rounded-full font-bold">
                                                    Done
                                                </span>
                                            )}
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
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Edit Profile Modal */}
                {isEditing && (
                    <div className="fixed inset-0 bg-[#A41F13]/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-[#E0DBD8] border-2 border-[#A41F13] rounded-2xl p-6 w-full max-w-md shadow-2xl">
                            <h2 className="text-xl font-black text-[#A41F13] mb-4">Edit Profile</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-[#A41F13]/60 mb-1 font-bold">Username (No spaces)</label>
                                    <input
                                        type="text"
                                        value={newName}
                                        onChange={(e) => {
                                            // Enforce no spaces
                                            const val = e.target.value.replace(/\s/g, "");
                                            setNewName(val);
                                        }}
                                        className="w-full bg-white border border-[#A41F13]/20 rounded-lg px-4 py-2 text-[#A41F13] focus:outline-none focus:border-[#A41F13] font-medium"
                                        placeholder="username"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm text-[#A41F13]/60 mb-1 font-bold">Profile Picture</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setNewAvatar(e.target.files?.[0] || null)}
                                        className="w-full bg-white border border-[#A41F13]/20 rounded-lg px-4 py-2 text-[#A41F13] text-sm file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:bg-[#A41F13] file:text-white hover:file:bg-[#A41F13]/80 font-medium"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 mt-8">
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="flex-1 py-3 rounded-xl font-bold text-[#A41F13]/60 hover:bg-[#A41F13]/10 transition-colors"
                                    disabled={saving}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveProfile}
                                    className="flex-1 bg-[#A41F13] text-[#E0DBD8] py-3 rounded-xl font-bold hover:scale-105 transition-transform disabled:opacity-50 shadow-lg"
                                    disabled={saving || !newName}
                                >
                                    {saving ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AuthGuard>
    );
}
