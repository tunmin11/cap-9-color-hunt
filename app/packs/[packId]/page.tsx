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

    const generateGridImage = async () => {
        if (!pack || !pack.images) return null;

        const canvas = document.createElement('canvas');
        const size = 1080; // Instagram story/post size
        const padding = 40;
        const gap = 20;
        const cellInfoHeight = 0; // No text below cells for cleaner look

        canvas.width = size;
        canvas.height = size + 180; // Extra space for branding
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        // Background
        ctx.fillStyle = '#000000'; // Pure black for high contrast
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw "CAP 9" Branding
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 80px "Inter", sans-serif'; // Extra bold
        ctx.textAlign = 'center';
        ctx.fillText('CAP 9', size / 2, size + 80);

        // Draw Color Name & Status
        ctx.fillStyle = pack.targetColor.hex;
        ctx.font = 'bold 40px "Inter", sans-serif';
        ctx.fillText(`${pack.targetColor.name.toUpperCase()} // VERIFIED`, size / 2, size + 140);

        const cellSize = (size - (padding * 2) - (gap * 2)) / 3;

        // Load all images
        const loadImage = (url: string): Promise<HTMLImageElement> => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.crossOrigin = "anonymous";
                img.onload = () => resolve(img);
                img.onerror = () => reject(new Error(`Failed to load image ${url}`));
                // Use proxy to avoid CORS issues
                img.src = `/api/proxy-image?url=${encodeURIComponent(url)}`;
            });
        };

        // Draw Grid
        let loadedCount = 0;
        for (let i = 0; i < 9; i++) {
            const row = Math.floor(i / 3);
            const col = i % 3;
            const x = padding + col * (cellSize + gap);
            const y = padding + row * (cellSize + gap);

            const imgData = pack.images[i];

            // Draw placeholder background
            ctx.fillStyle = pack.targetColor.hex;
            ctx.globalAlpha = 0.2;
            ctx.fillRect(x, y, cellSize, cellSize);
            ctx.globalAlpha = 1.0;

            if (imgData?.imageUrl) {
                try {
                    // We need to fetch as blob first to avoid some CORS issues with direct canvas usage sometimes
                    // But try direct load first with crossOrigin
                    const img = await loadImage(imgData.imageUrl);

                    // Draw image covering the square (object-cover)
                    const scale = Math.max(cellSize / img.width, cellSize / img.height);
                    const w = img.width * scale;
                    const h = img.height * scale;
                    const ox = (cellSize - w) / 2;
                    const oy = (cellSize - h) / 2;

                    ctx.save();
                    ctx.beginPath();
                    ctx.rect(x, y, cellSize, cellSize);
                    ctx.clip();
                    ctx.drawImage(img, x + ox, y + oy, w, h);
                    ctx.restore();
                } catch (e) {
                    console.error("Error loading image for canvas", e);
                }
            }
        }

        return new Promise<Blob | null>(resolve => {
            canvas.toBlob(resolve, 'image/png');
        });
    };

    const handleShare = async () => {
        setLoading(true); // Re-use loading state or add a sharing state
        try {
            const blob = await generateGridImage();
            if (!blob) throw new Error("Failed to generate image");

            const file = new File([blob], `colour-hunt-${pack.targetColor.name}.png`, { type: 'image/png' });

            if (navigator.share && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: 'My Colour Hunt',
                    text: `I found all 9 ${pack.targetColor.name} items! #colourhunt`,
                });
            } else {
                // Fallback: Download
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `colour-hunt-${pack.targetColor.name}.png`;
                a.click();
                URL.revokeObjectURL(url);
                alert("Image downloaded! You can now post it to Instagram.");
            }
        } catch (error) {
            console.error("Sharing failed:", error);
            alert("Could not share image. Try taking a screenshot instead!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthGuard>
            <div className="min-h-screen bg-background text-foreground p-4 md:p-8 pb-24">
                <div className="max-w-4xl mx-auto flex flex-col items-center">
                    <div className="w-full flex justify-between items-center mb-8">
                        <Link href="/" className="text-[#A41F13]/60 hover:text-[#A41F13] transition-colors font-bold">
                            ← Back
                        </Link>
                        <div className="flex items-center gap-3">
                            <div
                                className="w-6 h-6 rounded-full border border-black/10 shadow-sm"
                                style={{ backgroundColor: pack.targetColor.hex }}
                            />
                            <span className="font-black text-xl text-[#A41F13]">{pack.targetColor.name} Hunt</span>
                        </div>
                        <button onClick={handleShare} className="text-[#A41F13]/60 hover:text-[#A41F13] transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                            </svg>
                        </button>
                    </div>

                    <div className="relative w-full max-w-md">
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
                                <div className="bg-[#A41F13] text-[#E0DBD8] px-6 py-3 rounded-full border-2 border-[#E0DBD8] shadow-2xl transform translate-y-full animate-bounce">
                                    <span className="text-2xl mr-2">🎉</span>
                                    <span className="font-black">Hunt Completed!</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mt-8 text-center text-[#A41F13]/60 max-w-md">
                        {pack.status === "complete" ? (
                            <div className="space-y-4">
                                <p className="text-lg text-[#A41F13] font-bold">Congratulations!</p>
                                <p>You've found all 9 {pack.targetColor.name} items.</p>
                                <button
                                    onClick={handleShare}
                                    className="bg-[#A41F13] text-[#E0DBD8] px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform shadow-lg"
                                >
                                    Share Result
                                </button>
                            </div>
                        ) : (
                            <p>Tap a square to upload a photo. Find something that matches <span className="text-[#A41F13] font-bold" style={{ color: pack.targetColor.hex }}>{pack.targetColor.name}</span>!</p>
                        )}
                    </div>
                </div>
            </div>
        </AuthGuard>
    );
}
