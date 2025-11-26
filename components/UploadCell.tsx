"use client";

import { useState, useRef } from "react";

interface UploadCellProps {
    packId: string;
    userId: string;
    cellPosition: number;
    currentImage?: {
        imageUrl: string;
        isVerified: boolean;
        dominantColorHex?: string;
        analyzedAt?: any;
    };
    targetColorHex: string;
    targetColorObject: any;
}

export default function UploadCell({
    packId,
    userId,
    cellPosition,
    currentImage,
    targetColorHex,
    targetColorObject,
}: UploadCellProps) {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const isFailed = currentImage && !currentImage.isVerified && currentImage.analyzedAt;
    const isPending = currentImage && !currentImage.isVerified && !currentImage.analyzedAt;

    const handleClick = () => {
        // Allow upload always unless currently uploading
        if (!uploading) {
            fileInputRef.current?.click();
        }
    };

    const resizeImage = (file: File): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = URL.createObjectURL(file);
            img.onload = () => {
                const canvas = document.createElement("canvas");
                let width = img.width;
                let height = img.height;
                const MAX_SIZE = 600;

                if (width > height) {
                    if (width > MAX_SIZE) {
                        height *= MAX_SIZE / width;
                        width = MAX_SIZE;
                    }
                } else {
                    if (height > MAX_SIZE) {
                        width *= MAX_SIZE / height;
                        height = MAX_SIZE;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                ctx?.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => {
                        if (blob) resolve(blob);
                        else reject(new Error("Canvas to Blob failed"));
                    },
                    "image/jpeg",
                    0.6 // Quality
                );
            };
            img.onerror = (err) => reject(err);
        });
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setProgress(10); // Start
        try {
            // Simulate resize progress
            const resizeInterval = setInterval(() => {
                setProgress(prev => Math.min(prev + 5, 30));
            }, 100);

            const compressedBlob = await resizeImage(file);
            clearInterval(resizeInterval);
            setProgress(30);

            const formData = new FormData();
            formData.append("file", compressedBlob, "image.jpg");
            formData.append("packId", packId);
            formData.append("userId", userId);
            formData.append("cellPosition", cellPosition.toString());
            formData.append("targetColor", targetColorHex);

            // Simulate upload progress
            const uploadInterval = setInterval(() => {
                setProgress(prev => Math.min(prev + 10, 70));
            }, 200);

            const uploadResponse = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            clearInterval(uploadInterval);
            setProgress(70);

            if (!uploadResponse.ok) throw new Error("Upload failed");

            const { downloadURL } = await uploadResponse.json();

            // Trigger Verification API
            // We await this now to show the "Checking..." progress
            setProgress(80);
            await fetch("/api/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    packId,
                    cellPosition,
                    imageUrl: downloadURL,
                    targetColor: targetColorObject
                }),
            });
            setProgress(100);

        } catch (error) {
            console.error("Upload failed:", error);
            alert("Upload failed. Please try again.");
            setProgress(0);
        } finally {
            setUploading(false);
            // Reset progress after a short delay so user sees 100%
            setTimeout(() => setProgress(0), 500);
        }
    };

    // Dynamic style for the empty state tint
    const tintStyle = {
        backgroundColor: targetColorHex,
        opacity: 0.1,
    };

    return (
        <div
            onClick={handleClick}
            className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-300 cursor-pointer group ${currentImage
                ? currentImage.isVerified
                    ? "border-green-500/50"
                    : isFailed
                        ? "border-red-500/50 hover:border-red-400"
                        : "border-yellow-500/50"
                : "border-[#A41F13]/20 hover:border-[#A41F13]/50 bg-white shadow-sm"
                }`}
        >
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
            />

            {/* Progress Overlay */}
            {uploading && (
                <div className="absolute inset-0 z-50 bg-[#A41F13]/80 flex flex-col items-center justify-center p-4">
                    <div className="w-full h-2 bg-[#E0DBD8]/30 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-[#E0DBD8] transition-all duration-300 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <span className="text-xs text-[#E0DBD8] mt-2 font-bold uppercase tracking-wider">
                        {progress < 30 ? "Preparing..." : progress < 70 ? "Uploading..." : "Checking..."}
                    </span>
                </div>
            )}

            {currentImage ? (
                <>
                    <img
                        src={currentImage.imageUrl}
                        alt={`Cell ${cellPosition}`}
                        className={`w-full h-full object-cover transition-opacity ${isFailed ? "opacity-50 group-hover:opacity-30" : ""}`}
                    />
                    <div className="absolute inset-0 bg-black/10" />

                    {/* Status Indicator */}
                    <div className="absolute top-2 right-2">
                        {currentImage.isVerified && (
                            <div className="bg-green-500 text-white p-1 rounded-full shadow-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                        )}

                        {isPending && !uploading && (
                            <div className="bg-yellow-500 text-white p-1 rounded-full shadow-lg animate-pulse">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                </svg>
                            </div>
                        )}

                        {isFailed && (
                            <div className="bg-red-500 text-white p-1 rounded-full shadow-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </div>
                        )}
                    </div>

                    {isFailed && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-white font-bold text-sm bg-black/50 px-2 py-1 rounded">Try Again</span>
                        </div>
                    )}
                </>
            ) : (
                <div className="w-full h-full flex items-center justify-center relative">
                    {/* Tint Background */}
                    <div className="absolute inset-0" style={tintStyle} />

                    {!uploading && (
                        <div className="text-[#A41F13]/30 group-hover:text-[#A41F13] transition-colors z-10">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
