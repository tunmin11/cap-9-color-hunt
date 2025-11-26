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
        image.resize({ w: 50, h: 50 }); // Resize for speed

        let rTotal = 0, gTotal = 0, bTotal = 0, count = 0;

        // Simple average of pixels
        image.scan(0, 0, image.bitmap.width, image.bitmap.height, (x, y, idx) => {
            rTotal += image.bitmap.data[idx + 0];
            gTotal += image.bitmap.data[idx + 1];
            bTotal += image.bitmap.data[idx + 2];
            count++;
        });

        const rAvg = rTotal / count;
        const gAvg = gTotal / count;
        const bAvg = bTotal / count;

        const { h, s, v } = rgbToHsv(rAvg, gAvg, bAvg);
        const hexCode = `#${((1 << 24) + (Math.round(rAvg) << 16) + (Math.round(gAvg) << 8) + Math.round(bAvg)).toString(16).slice(1)}`;

        console.log(`Detected: H=${h.toFixed(2)}, S=${s.toFixed(2)}, V=${v.toFixed(2)} (${hexCode})`);
        console.log(`Target: ${targetColor.h_min} - ${targetColor.h_max}`);

        // 2. Verify Match
        const h_min = targetColor.h_min;
        const h_max = targetColor.h_max;

        let isMatch = false;
        if (h_min > h_max) { // Wrapping case (e.g. Red)
            if (h >= h_min || h <= h_max) isMatch = true;
        } else {
            if (h >= h_min && h <= h_max) isMatch = true;
        }

        // Filter out low saturation/value (grays/blacks)
        if (s < 10 || v < 10) {
            isMatch = false;
            console.log("Rejected due to low saturation/value");
        }

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
