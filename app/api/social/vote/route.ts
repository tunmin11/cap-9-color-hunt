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

        const { packId, vote } = await request.json(); // vote: 1 (up), -1 (down), 0 (remove)

        if (!packId || vote === undefined) {
            return NextResponse.json({ error: "Pack ID and vote required" }, { status: 400 });
        }

        const likeRef = adminDb.collection("likes").doc(`${packId}_${userId}`);
        const packRef = adminDb.collection("packs").doc(packId);

        await adminDb.runTransaction(async (t) => {
            const likeDoc = await t.get(likeRef);
            const currentVote = likeDoc.exists ? (likeDoc.data()?.vote || 1) : 0; // Default to 1 for legacy likes

            if (vote === 0) {
                // Remove vote
                if (likeDoc.exists) {
                    t.delete(likeRef);
                    t.update(packRef, {
                        likesCount: FieldValue.increment(-currentVote)
                    });
                }
            } else {
                // Set vote (up or down)
                const voteData = {
                    packId,
                    userId,
                    vote,
                    updatedAt: FieldValue.serverTimestamp()
                };

                if (likeDoc.exists) {
                    // Update existing
                    if (currentVote !== vote) {
                        t.update(likeRef, { vote });
                        t.update(packRef, {
                            likesCount: FieldValue.increment(vote - currentVote)
                        });
                    }
                } else {
                    // Create new
                    t.set(likeRef, {
                        ...voteData,
                        createdAt: FieldValue.serverTimestamp()
                    });
                    t.update(packRef, {
                        likesCount: FieldValue.increment(vote)
                    });
                }
            }
        });

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("Error voting:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
