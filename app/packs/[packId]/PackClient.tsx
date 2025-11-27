"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useParams } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import PackGrid from "@/components/PackGrid";
import Link from "next/link";

import SharePreviewModal from "@/components/SharePreviewModal";

export default function PackClient() {
    const { packId } = useParams();
    const { user } = useAuth();
    const [pack, setPack] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [shareBlob, setShareBlob] = useState<Blob | null>(null);
    const [showShareModal, setShowShareModal] = useState(false);
    const [generating, setGenerating] = useState(false);

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

        fetchPack();

        const interval = setInterval(() => {
            if (pack?.status !== 'complete') {
                fetchPack();
            }
        }, 2000);

        return () => clearInterval(interval);
    }, [packId, pack?.status]);

    // Pre-generate image when pack is loaded and complete
    useEffect(() => {
        if (pack?.status === 'complete' && !shareBlob && !generating) {
            generateGridImage();
        }
    }, [pack, shareBlob, generating]);

    const generateGridImage = async () => {
        if (!pack || !pack.images) return null;
        setGenerating(true);

        try {
            const canvas = document.createElement('canvas');
            const width = 1080;
            const height = 1920; // Story format
            const padding = 80;
            const gap = 20;

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) return null;

            // 1. Background Gradient
            const gradient = ctx.createLinearGradient(0, 0, width, height);
            gradient.addColorStop(0, '#E0DBD8'); // Light base
            gradient.addColorStop(1, '#D6D3D0'); // Slightly darker bottom
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);

            // 2. Aesthetic Glow/Blobs
            // Top-left glow (Target Color)
            const glow1 = ctx.createRadialGradient(0, 0, 0, 0, 0, 800);
            glow1.addColorStop(0, `${pack.targetColor.hex}40`); // 25% opacity
            glow1.addColorStop(1, `${pack.targetColor.hex}00`); // 0% opacity
            ctx.fillStyle = glow1;
            ctx.fillRect(0, 0, 800, 800);

            // Bottom-right glow (Accent/Logo Color)
            const glow2 = ctx.createRadialGradient(width, height, 0, width, height, 900);
            glow2.addColorStop(0, '#A41F1320'); // 12% opacity
            glow2.addColorStop(1, '#A41F1300'); // 0% opacity
            ctx.fillStyle = glow2;
            ctx.fillRect(width - 900, height - 900, 900, 900);

            // Random floating circles for texture
            ctx.fillStyle = pack.targetColor.hex;
            ctx.globalAlpha = 0.05;
            for (let k = 0; k < 5; k++) {
                const r = 50 + Math.random() * 100;
                const cx = Math.random() * width;
                const cy = Math.random() * height;
                ctx.beginPath();
                ctx.arc(cx, cy, r, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.globalAlpha = 1.0;


            // 3. Header: Logo
            try {
                // Load logo from public folder
                const logoImg = await loadImage('/logo.svg');
                const logoWidth = 120;
                const logoHeight = logoWidth * (logoImg.height / logoImg.width);
                ctx.drawImage(logoImg, (width - logoWidth) / 2, 140, logoWidth, logoHeight);
            } catch (e) {
                // Fallback text if logo fails
                ctx.fillStyle = '#A41F13';
                ctx.font = '900 100px "Inter", sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('CAP 9', width / 2, 200);
            }

            // 4. The Grid Container (Glassmorphism)
            const gridSize = width - (padding * 2);
            const gridStartY = (height - gridSize) / 2 - 50;

            // Shadow for the card
            ctx.shadowColor = "rgba(0, 0, 0, 0.15)";
            ctx.shadowBlur = 40;
            ctx.shadowOffsetY = 20;

            // White card background
            ctx.fillStyle = '#ffffff';
            ctx.roundRect(padding - 30, gridStartY - 30, gridSize + 60, gridSize + 60, 40);
            ctx.fill();

            // Reset shadow
            ctx.shadowColor = "transparent";
            ctx.shadowBlur = 0;
            ctx.shadowOffsetY = 0;

            // Inner border for "stack" effect
            ctx.strokeStyle = '#E0DBD8';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Load all images
            const cellSize = (gridSize - (gap * 2)) / 3;

            for (let i = 0; i < 9; i++) {
                const row = Math.floor(i / 3);
                const col = i % 3;
                const x = padding + col * (cellSize + gap);
                const y = gridStartY + row * (cellSize + gap);

                const imgData = pack.images[i];

                // Placeholder / Empty Cell Background
                ctx.fillStyle = '#F5F5F4'; // Very light grey
                ctx.beginPath();
                ctx.roundRect(x, y, cellSize, cellSize, 12);
                ctx.fill();

                if (imgData?.imageUrl) {
                    try {
                        const img = await loadImage(imgData.imageUrl);

                        // Draw image (object-cover)
                        const scale = Math.max(cellSize / img.width, cellSize / img.height);
                        const w = img.width * scale;
                        const h = img.height * scale;
                        const ox = (cellSize - w) / 2;
                        const oy = (cellSize - h) / 2;

                        ctx.save();
                        ctx.beginPath();
                        ctx.roundRect(x, y, cellSize, cellSize, 12); // Rounded corners for cells
                        ctx.clip();
                        ctx.drawImage(img, x + ox, y + oy, w, h);
                        ctx.restore();
                    } catch (e) {
                        console.error("Error loading image for canvas", e);
                    }
                } else {
                    // Empty state dot
                    ctx.fillStyle = '#E0DBD8';
                    ctx.beginPath();
                    ctx.arc(x + cellSize / 2, y + cellSize / 2, 6, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            // 5. Footer Info
            const footerY = gridStartY + gridSize + 100;

            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = 'bold 36px "Inter", sans-serif';

            // Username . [Dot] Color Name . CTA
            const username = `@${pack.user?.displayName || "Anonymous"}`;
            const colorName = pack.targetColor.name.toLowerCase();
            const cta = "join the hunt @ capnine.club";

            // Calculate widths to position the dot
            const separator = "  •  ";
            const part1 = `${username}${separator}`;
            const part2 = ` ${colorName}${separator}${cta}`;

            const fullTextWidth = ctx.measureText(part1 + "   " + part2).width; // Add space for dot
            const startX = (width - fullTextWidth) / 2;

            // Draw Part 1 (Username + Sep)
            ctx.fillStyle = '#A41F13';
            ctx.textAlign = 'left';
            ctx.fillText(part1, startX, footerY);

            // Draw Dot
            const part1Width = ctx.measureText(part1).width;
            const dotX = startX + part1Width + 10; // Add a little padding
            const dotY = footerY;
            const dotRadius = 14;

            ctx.beginPath();
            ctx.arc(dotX, dotY, dotRadius, 0, Math.PI * 2);
            ctx.fillStyle = pack.targetColor.hex;
            ctx.fill();
            // Dot glow
            ctx.shadowColor = pack.targetColor.hex;
            ctx.shadowBlur = 10;
            ctx.stroke();
            ctx.shadowBlur = 0; // Reset

            // Draw Part 2 (Color Name + Sep + CTA)
            ctx.fillStyle = '#A41F13';
            ctx.fillText("   " + part2, startX + part1Width, footerY); // Add space for dot


            canvas.toBlob((blob) => {
                setShareBlob(blob);
                setGenerating(false);
            }, 'image/png');

        } catch (e) {
            console.error("Generation failed", e);
            setGenerating(false);
        }
    };

    const loadImage = (url: string): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error(`Failed to load image ${url}`));

            // Use proxy only for external URLs to avoid CORS on canvas export
            if (url.startsWith('http')) {
                img.src = `/api/proxy-image?url=${encodeURIComponent(url)}`;
            } else {
                img.src = url;
            }
        });
    };

    const handleShareClick = async () => {
        if (shareBlob) {
            setShowShareModal(true);
        } else {
            // Force generate if not ready
            await generateGridImage();
            setShowShareModal(true);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#A41F13]"></div>
            </div>
        );
    }

    if (!pack) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center text-[#A41F13]">
                Pack not found
            </div>
        );
    }

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
                        <button onClick={handleShareClick} className="text-[#A41F13]/60 hover:text-[#A41F13] transition-colors">
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
                                    onClick={handleShareClick}
                                    className="bg-[#A41F13] text-[#E0DBD8] px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform shadow-lg flex items-center justify-center gap-2 mx-auto"
                                    disabled={generating}
                                >
                                    {generating ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-[#E0DBD8]"></div>
                                            Preparing...
                                        </>
                                    ) : (
                                        <>
                                            Share Result
                                        </>
                                    )}
                                </button>
                            </div>
                        ) : (
                            <p>Tap a square to upload a photo. Find something that matches <span className="text-[#A41F13] font-bold" style={{ color: pack.targetColor.hex }}>{pack.targetColor.name}</span>!</p>
                        )}
                    </div>
                </div>

                <SharePreviewModal
                    isOpen={showShareModal}
                    onClose={() => setShowShareModal(false)}
                    imageBlob={shareBlob}
                    packColorName={pack.targetColor.name}
                />
            </div>
        </AuthGuard>
    );
}
