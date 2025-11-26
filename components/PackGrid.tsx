"use client";

import UploadCell from "./UploadCell";

interface PackGridProps {
    packId: string;
    userId: string;
    images: Record<string, any>; // Map of cellPosition -> imageData
    targetColorHex: string;
    targetColorObject: any;
}

export default function PackGrid({ packId, userId, images, targetColorHex, targetColorObject }: PackGridProps) {
    // Generate 9 cells (0-8)
    const cells = Array.from({ length: 9 }, (_, i) => i);

    return (
        <div className="w-full max-w-md mx-auto aspect-square bg-neutral-900 rounded-2xl p-3 md:p-4 shadow-2xl border border-neutral-800">
            <div className="grid grid-cols-3 gap-2 md:gap-3 w-full h-full">
                {cells.map((position) => (
                    <UploadCell
                        key={position}
                        packId={packId}
                        userId={userId}
                        cellPosition={position}
                        currentImage={images[position]}
                        targetColorHex={targetColorHex}
                        targetColorObject={targetColorObject}
                    />
                ))}
            </div>
        </div>
    );
}
