import { NextResponse } from "next/server";
import { adminDb } from "../../../lib/firebaseAdmin";
import { Jimp } from "jimp";
import { FieldValue } from "firebase-admin/firestore";

// Helper to convert RGB to HSV
function rgbToHsv(r: number, g: number, b: number) {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, v = max;

    const d = max - min;
    s = max === 0 ? 0 : d / max;

    if (max === min) {
        h = 0;
    } else {
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return { h: h * 360, s: s * 100, v: v * 100 };
}

export async function POST(request: Request) {
    try {
        const { packId, cellPosition, imageUrl, targetColor } = await request.json();

        if (!packId || cellPosition === undefined || !imageUrl || !targetColor) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        console.log(`Verifying image for Pack: ${packId}, Cell: ${cellPosition}`);

        // 1. Fetch and Analyze Image
        const image = await Jimp.read(imageUrl);
        image.resize({ w: 100, h: 100 }); // Resize for speed but keep enough detail

        let totalScore = 0;
        let maxPossibleScore = 0;
        let rTotal = 0, gTotal = 0, bTotal = 0;
        let pixelCount = 0;

        // Add a small buffer to the hue range for leniency (+/- 5 degrees)
        const HUE_BUFFER = 5;
        const h_min = (targetColor.h_min - HUE_BUFFER + 360) % 360;
        const h_max = (targetColor.h_max + HUE_BUFFER + 360) % 360;

        const width = image.bitmap.width;
        const height = image.bitmap.height;

        // Define center zone (middle 50%)
        const centerXStart = width * 0.25;
        const centerXEnd = width * 0.75;
        const centerYStart = height * 0.25;
        const centerYEnd = height * 0.75;

        image.scan(0, 0, width, height, (x, y, idx) => {
            const r = image.bitmap.data[idx + 0];
            const g = image.bitmap.data[idx + 1];
            const b = image.bitmap.data[idx + 2];

            rTotal += r;
            gTotal += g;
            bTotal += b;
            pixelCount++;

            // Calculate Weight
            // Center pixels = 2x weight, Edges = 1x weight
            const isCenter = x >= centerXStart && x <= centerXEnd && y >= centerYStart && y <= centerYEnd;
            const weight = isCenter ? 2 : 1;

            maxPossibleScore += weight;

            const { h, s, v } = rgbToHsv(r, g, b);

            // Check if pixel matches target color
            let pixelMatches = false;

            // Ignore low saturation/value (grays/blacks/whites)
            // Lowered threshold slightly to be more forgiving for dark/pastel shades
            if (s > 10 && v > 10) {
                if (targetColor.h_min > targetColor.h_max) {
                    // Wrapping case (e.g. Red: 340-360)
                    // We use the original logic for wrapping check but with buffer
                    // If original was 340-360, buffered might be 335-5
                    // It's safer to check distance to range

                    // Simple wrap check:
                    // If target is 340-360 (Crimson), we accept 335-360 OR 0-5
                    if (h >= (targetColor.h_min - HUE_BUFFER) || h <= (targetColor.h_max + HUE_BUFFER)) pixelMatches = true;
                } else {
                    // Normal case
                    if (h >= (targetColor.h_min - HUE_BUFFER) && h <= (targetColor.h_max + HUE_BUFFER)) pixelMatches = true;
                }
            }

            if (pixelMatches) {
                totalScore += weight;
            }
        });

        // Calculate Average for display (Dominant Hex)
        const rAvg = rTotal / pixelCount;
        const gAvg = gTotal / pixelCount;
        const bAvg = bTotal / pixelCount;
        const hexCode = `#${((1 << 24) + (Math.round(rAvg) << 16) + (Math.round(gAvg) << 8) + Math.round(bAvg)).toString(16).slice(1)}`;

        const matchScore = (totalScore / maxPossibleScore) * 100;
        console.log(`Match Score (Center Weighted): ${matchScore.toFixed(2)}% (Threshold: 10%)`);

        // 2. Verify Match
        // Relaxed rule: If > 10% of weighted pixels match, it's a pass.
        // This allows for small objects (approx 5-10% of area) to pass.
        const isMatch = matchScore >= 10;

        // 3. Update Firestore
        const packRef = adminDb.collection("packs").doc(packId);

        const imageUpdateKey = `images.${cellPosition}`;
        await packRef.update({
            [`${imageUpdateKey}.isVerified`]: isMatch,
            [`${imageUpdateKey}.dominantColorHex`]: hexCode,
            [`${imageUpdateKey}.analyzedAt`]: FieldValue.serverTimestamp()
        });

        // 4. Check Completion
        if (isMatch) {
            const packDoc = await packRef.get();
            const packData = packDoc.data();
            const images = packData?.images || {};

            const verifiedCount = Object.values(images).filter((img: any) => img.isVerified).length;

            if (verifiedCount >= 9) {
                await packRef.update({
                    status: "complete",
                    completedAt: FieldValue.serverTimestamp()
                });
            }
        }

        return NextResponse.json({ success: true, isMatch, hexCode });

    } catch (error: any) {
        console.error("Verification error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
