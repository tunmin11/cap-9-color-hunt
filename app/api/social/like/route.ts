import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";

export async function POST(request: NextRequest) {
    try {
        // Verify Auth
        const authHeader = request.headers.get("Authorization");
        if (!authHeader?.startsWith("Bearer ")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const token = authHeader.split("Bearer ")[1];
        const decodedToken = await adminAuth.verifyIdToken(token);
        const userId = decodedToken.uid;

        const { packId } = await request.json();
        if (!packId) {
            return NextResponse.json({ error: "Pack ID required" }, { status: 400 });
        }

        const likeRef = adminDb.collection("likes").doc(`${packId}_${userId}`);
        const packRef = adminDb.collection("packs").doc(packId);

        await adminDb.runTransaction(async (t) => {
            const likeDoc = await t.get(likeRef);

            if (likeDoc.exists) {
                // Unlike
                t.delete(likeRef);
                t.update(packRef, {
                    likesCount: FieldValue.increment(-1)
                });
            } else {
                // Like
                t.set(likeRef, {
                    packId,
                    userId,
                    createdAt: FieldValue.serverTimestamp()
                });
                t.update(packRef, {
                    likesCount: FieldValue.increment(1)
                });
            }
        });

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("Error toggling like:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
