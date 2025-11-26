"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";

interface Color {
    id: string;
    name: string;
    hex: string;
}

export default function CreatePackPage() {
    const [colors, setColors] = useState<Color[]>([]);
    const [selectedColor, setSelectedColor] = useState<Color | null>(null);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const { user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        const fetchColors = async () => {
            try {
                const response = await fetch("/api/colors");
                if (!response.ok) throw new Error("Failed to fetch colors");
                const loadedColors = await response.json();
                setColors(loadedColors);
            } catch (error) {
                console.error("Error loading colors:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchColors();
    }, []);

    const handleCreatePack = async () => {
        if (!selectedColor || !user) return;
        setCreating(true);

        try {
            const response = await fetch("/api/packs/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: user.uid,
                    targetColorId: selectedColor.id,
                    targetColor: selectedColor,
                }),
            });

            if (!response.ok) throw new Error("Failed to create pack");

            const { id } = await response.json();
            router.push(`/packs/${id}`);
        } catch (error) {
            console.error("Error creating pack:", error);
            setCreating(false);
        }
    };

    return (
        <AuthGuard>
            <div className="min-h-screen bg-neutral-950 text-white p-8">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                        Start a New Hunt
                    </h1>
                    <p className="text-neutral-400 mb-8">Choose your target color to begin the challenge.</p>

                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                            {colors.map((color) => (
                                <button
                                    key={color.id}
                                    onClick={() => setSelectedColor(color)}
                                    className={`relative group rounded-xl overflow-hidden aspect-square transition-all duration-300 ${selectedColor?.id === color.id
                                        ? "ring-4 ring-white scale-105"
                                        : "hover:scale-105 opacity-80 hover:opacity-100"
                                        }`}
                                >
                                    <div
                                        className="absolute inset-0"
                                        style={{ backgroundColor: color.hex }}
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="font-bold text-white shadow-sm">{color.name}</span>
                                    </div>
                                    {selectedColor?.id === color.id && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                                            <div className="bg-white text-black rounded-full p-1">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="flex justify-end">
                        <button
                            onClick={handleCreatePack}
                            disabled={!selectedColor || creating}
                            className={`px-8 py-4 rounded-full font-bold text-lg transition-all ${selectedColor
                                ? "bg-white text-black hover:bg-neutral-200 transform hover:scale-105"
                                : "bg-neutral-800 text-neutral-500 cursor-not-allowed"
                                }`}
                        >
                            {creating ? "Creating..." : "Start Hunt →"}
                        </button>
                    </div>
                </div>
            </div>
        </AuthGuard>
    );
}
