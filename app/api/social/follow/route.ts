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
        const followerId = decodedToken.uid;

        const { targetUserId } = await request.json();
        if (!targetUserId) {
            return NextResponse.json({ error: "Target User ID required" }, { status: 400 });
        }

        if (followerId === targetUserId) {
            return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 });
        }

        const followRef = adminDb.collection("follows").doc(`${followerId}_${targetUserId}`);
        const followerRef = adminDb.collection("users").doc(followerId);
        const followingRef = adminDb.collection("users").doc(targetUserId);

        await adminDb.runTransaction(async (t) => {
            const followDoc = await t.get(followRef);

            if (followDoc.exists) {
                // Unfollow
                t.delete(followRef);
                t.update(followerRef, {
                    followingCount: FieldValue.increment(-1)
                });
                t.update(followingRef, {
                    followersCount: FieldValue.increment(-1)
                });
            } else {
                // Follow
                t.set(followRef, {
                    followerId,
                    followingId: targetUserId,
                    createdAt: FieldValue.serverTimestamp()
                });
                t.update(followerRef, {
                    followingCount: FieldValue.increment(1)
                });
                t.update(followingRef, {
                    followersCount: FieldValue.increment(1)
                });
            }
        });

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("Error toggling follow:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
