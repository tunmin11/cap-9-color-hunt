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
    const { logout } = useAuth();

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

            if (!syncRes.ok) throw new Error("Failed to update profile");

            // 4. Refresh local user state without page reload
            await refreshUser();

        } catch (err) {
            console.error("Error updating profile:", err);
            alert("Failed to update profile. Please try again.");
        } finally {
            setSaving(false);
            setIsEditing(false);
        }
    };

    return (
        <AuthGuard>
            <div className="min-h-screen bg-neutral-950 text-white p-4 pb-24">
                <div className="max-w-2xl mx-auto">
                    {/* Header */}
                    <div className="flex flex-col items-center mb-8 pt-8 relative">
                        {/* Logout Button */}
                        <button
                            onClick={logout}
                            className="absolute top-0 right-0 text-neutral-500 hover:text-red-500 text-sm font-medium transition-colors"
                        >
                            Logout
                        </button>

                        <div className="relative group cursor-pointer" onClick={handleEditClick}>
                            {user?.photoURL ? (
                                <img
                                    src={user.photoURL}
                                    alt="Profile"
                                    className="w-24 h-24 rounded-full object-cover border-4 border-neutral-800 group-hover:border-white/20 transition-colors"
                                />
                            ) : (
                                <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-3xl font-bold border-4 border-neutral-800 group-hover:border-white/20 transition-colors">
                                    {user?.email?.[0].toUpperCase()}
                                </div>
                            )}
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-xs font-bold">Edit</span>
                            </div>
                        </div>

                        <h1 className="text-2xl font-bold mt-4">{user?.displayName || user?.email?.split("@")[0]}</h1>

                        <button
                            onClick={handleEditClick}
                            className="mt-2 text-sm text-neutral-400 hover:text-white transition-colors"
                        >
                            Edit Profile
                        </button>

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

                    {/* Tabs */}
                    <div className="flex border-b border-neutral-800 mb-8">
                        <button
                            onClick={() => setActiveTab("inprogress")}
                            className={`flex-1 pb-4 text-sm font-medium transition-colors ${activeTab === "inprogress"
                                ? "text-white border-b-2 border-white"
                                : "text-neutral-500 hover:text-neutral-300"
                                }`}
                        >
                            In Progress ({inProgressPacks.length})
                        </button>
                        <button
                            onClick={() => setActiveTab("completed")}
                            className={`flex-1 pb-4 text-sm font-medium transition-colors ${activeTab === "completed"
                                ? "text-white border-b-2 border-white"
                                : "text-neutral-500 hover:text-neutral-300"
                                }`}
                        >
                            Completed ({completedPacks.length})
                        </button>
                    </div>

                    {/* Grid */}
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
                    ) : displayedPacks.length === 0 ? (
                        <div className="text-center text-neutral-500 py-20">
                            {activeTab === "inprogress" ? (
                                <div>
                                    <p className="mb-4">No active hunts.</p>
                                    <Link href="/create" className="text-purple-400 hover:text-purple-300 font-bold">
                                        Start a new one →
                                    </Link>
                                </div>
                            ) : (
                                <p>No completed hunts yet. Keep going!</p>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4">
                            {displayedPacks.map((pack) => (
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
                                            {pack.status === "complete" && (
                                                <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                                                    Done
                                                </span>
                                            )}
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
                </div>

                {/* Edit Profile Modal */}
                {isEditing && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 w-full max-w-md">
                            <h2 className="text-xl font-bold mb-4">Edit Profile</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-neutral-400 mb-1">Display Name</label>
                                    <input
                                        type="text"
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-white/50"
                                        placeholder="Enter your name"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm text-neutral-400 mb-1">Profile Picture</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setNewAvatar(e.target.files?.[0] || null)}
                                        className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2 text-white text-sm file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:bg-neutral-700 file:text-white hover:file:bg-neutral-600"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 mt-8">
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="flex-1 py-3 rounded-xl font-bold text-neutral-400 hover:bg-neutral-800 transition-colors"
                                    disabled={saving}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveProfile}
                                    className="flex-1 bg-white text-black py-3 rounded-xl font-bold hover:bg-neutral-200 transition-colors disabled:opacity-50"
                                    disabled={saving}
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
