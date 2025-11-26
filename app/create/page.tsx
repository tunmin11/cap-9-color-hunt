"use client";

import { useEffect, useState } from "react";
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
            <div className="min-h-screen bg-background text-foreground p-8 relative overflow-hidden flex flex-col">

                {/* Background Texture/Gradient */}
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-[#A41F13] rounded-full blur-[150px] opacity-20" />
                    <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] bg-[#A41F13] rounded-full blur-[150px] opacity-20" />
                    <div className="absolute top-[40%] left-[30%] w-[60%] h-[60%] bg-[#A41F13] rounded-full blur-[180px] opacity-10" />
                </div>

                <div className="max-w-4xl mx-auto w-full z-10 flex-1 flex flex-col justify-center">
                    <div className="mb-12 text-center">
                        <h1 className="text-5xl md:text-6xl font-black tracking-tighter mb-4">
                            START A <span className="text-[#A41F13]">HUNT</span>
                        </h1>
                        <p className="text-xl font-medium opacity-80 max-w-lg mx-auto">
                            Choose your target color to begin the challenge. You'll need to find 9 items matching this color.
                        </p>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#A41F13]"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 md:gap-6 mb-12">
                            {colors.map((color) => (
                                <button
                                    key={color.id}
                                    onClick={() => setSelectedColor(color)}
                                    className={`relative group rounded-2xl overflow-hidden aspect-square transition-all duration-300 shadow-xl ${selectedColor?.id === color.id
                                        ? "ring-4 ring-[#A41F13] scale-105 z-10"
                                        : "hover:scale-105 opacity-90 hover:opacity-100 hover:ring-2 hover:ring-black/10"
                                        }`}
                                >
                                    <div
                                        className="absolute inset-0 transition-transform duration-500 group-hover:scale-110"
                                        style={{ backgroundColor: color.hex }}
                                    />

                                    {/* Overlay for text visibility */}
                                    <div className="absolute inset-0 flex items-end justify-center pb-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <span className="font-bold text-white text-sm tracking-widest uppercase shadow-sm">{color.name}</span>
                                    </div>

                                    {selectedColor?.id === color.id && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px]">
                                            <div className="bg-[#A41F13] text-white rounded-full p-2 shadow-lg transform transition-transform animate-in zoom-in duration-200">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="flex justify-center pb-24">
                        <button
                            onClick={handleCreatePack}
                            disabled={!selectedColor || creating}
                            className={`px-12 py-5 rounded-full font-black text-xl tracking-wide transition-all shadow-2xl flex items-center gap-3 ${selectedColor
                                ? "bg-[#A41F13] text-[#E0DBD8] hover:scale-105 hover:shadow-[#A41F13]/50"
                                : "bg-neutral-800/20 text-neutral-500 cursor-not-allowed"
                                }`}
                        >
                            {creating ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-current"></div>
                                    <span>CREATING...</span>
                                </>
                            ) : (
                                <>
                                    <span>START HUNT</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </AuthGuard>
    );
}
