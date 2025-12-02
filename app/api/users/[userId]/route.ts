import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebaseAdmin";

export async function GET(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
    try {
        const { userId } = await params;
        if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

        // Check for Auth Token (Optional)
        let currentUserId: string | null = null;
        const authHeader = request.headers.get("Authorization");
        if (authHeader?.startsWith("Bearer ")) {
            try {
                const token = authHeader.split("Bearer ")[1];
                const decodedToken = await adminAuth.verifyIdToken(token);
                currentUserId = decodedToken.uid;
            } catch (e) {
                // Ignore
            }
        }

        let publicProfile;
        const userDoc = await adminDb.collection("users").doc(userId).get();

        if (userDoc.exists) {
            const userData = userDoc.data();
            publicProfile = {
                uid: userData?.uid,
                displayName: userData?.displayName,
                photoURL: userData?.photoURL,
                createdAt: userData?.createdAt,
                followersCount: userData?.followersCount || 0,
                followingCount: userData?.followingCount || 0
            };
        } else {
            // Fallback to Firebase Auth
            try {
                const authUser = await adminAuth.getUser(userId);
                publicProfile = {
                    uid: authUser.uid,
                    displayName: authUser.displayName || authUser.email?.split("@")[0] || "Anonymous",
                    photoURL: authUser.photoURL || null,
                    createdAt: authUser.metadata.creationTime,
                    followersCount: 0,
                    followingCount: 0
                };
            } catch (authError) {
                console.error("Auth fetch failed:", authError);
                return NextResponse.json({ error: "User not found" }, { status: 404 });
            }
        }

        // Check if following
        let isFollowing = false;
        if (currentUserId && currentUserId !== userId) {
            const followDoc = await adminDb.collection("follows").doc(`${currentUserId}_${userId}`).get();
            isFollowing = followDoc.exists;
        }

        return NextResponse.json({ ...publicProfile, isFollowing });
    } catch (error: any) {
        console.error("Error fetching user:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
