import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebaseAdmin";

export async function GET(request: NextRequest) {
    try {
        // Check for Auth Token (Optional)
        let currentUserId: string | null = null;
        const authHeader = request.headers.get("Authorization");
        if (authHeader?.startsWith("Bearer ")) {
            try {
                const token = authHeader.split("Bearer ")[1];
                const decodedToken = await adminAuth.verifyIdToken(token);
                currentUserId = decodedToken.uid;
            } catch (e) {
                // Ignore invalid token, treat as guest
            }
        }

        const { searchParams } = new URL(request.url);
        const filter = searchParams.get("filter");

        const packsRef = adminDb.collection("packs");
        let query: FirebaseFirestore.Query = packsRef
            .where("status", "==", "complete")
            .orderBy("completedAt", "desc")
            .limit(20);

        if (filter === "following") {
            if (!currentUserId) {
                return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }

            // Get followed users
            const followsSnapshot = await adminDb.collection("follows")
                .where("followerId", "==", currentUserId)
                .get();

            if (followsSnapshot.empty) {
                return NextResponse.json([]);
            }

            const followingIds = followsSnapshot.docs.map(doc => doc.data().followingId);

            // Firestore 'in' limit is 10. For MVP, we'll take the top 10.
            // In a real app, we'd need a better feed architecture (fan-out).
            const limitedFollowingIds = followingIds.slice(0, 10);

            query = packsRef
                .where("status", "==", "complete")
                .where("userId", "in", limitedFollowingIds)
                .orderBy("completedAt", "desc")
                .limit(20);
        }

        const snapshot = await query.get();

        const packsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Fetch user details and like status for each pack
        // 2. Fetch Likes for current user (Batch Optimization)
        let likedPackIds = new Map<string, number>();
        if (currentUserId && packsData.length > 0) {
            const packIds = packsData.map(p => p.id);
            // Firestore 'in' query supports up to 30 items
            // We limit feed to 20, so this is safe.
            try {
                const likesSnapshot = await adminDb.collection("likes")
                    .where("userId", "==", currentUserId)
                    .where("packId", "in", packIds)
                    .get();

                likesSnapshot.docs.forEach(doc => {
                    const data = doc.data();
                    likedPackIds.set(data.packId, data.vote !== undefined ? data.vote : 1);
                });
            } catch (e) {
                console.error("Failed to batch fetch likes:", e);
            }
        }

        const packsWithUser = await Promise.all(packsData.map(async (pack: any) => {
            // Use denormalized user data if available, otherwise fallback to fetch
            let user = null;
            if (pack.userDisplayName) {
                user = {
                    displayName: pack.userDisplayName,
                    photoURL: pack.userPhotoURL || null,
                    uid: pack.userId
                };
            } else if (pack.userId) {
                // Fallback for old data
                try {
                    const userDoc = await adminDb.collection("users").doc(pack.userId).get();
                    if (userDoc.exists) {
                        const userData = userDoc.data();
                        user = {
                            displayName: userData?.displayName || "Anonymous",
                            photoURL: userData?.photoURL || null,
                            uid: userData?.uid
                        };
                    } else {
                        const authUser = await adminAuth.getUser(pack.userId);
                        user = {
                            displayName: authUser.displayName || authUser.email?.split("@")[0] || "Anonymous",
                            photoURL: authUser.photoURL || null,
                            uid: authUser.uid
                        };
                    }
                } catch (err) {
                    console.error(`Failed to fetch user ${pack.userId}:`, err);
                    user = { displayName: "Anonymous", photoURL: null, uid: pack.userId };
                }
            }

            return {
                ...pack,
                user,
                userVote: likedPackIds.has(pack.id) ? (likedPackIds.get(pack.id) || 1) : 0,
                likesCount: pack.likesCount || 0
            };
        }));

        return NextResponse.json(packsWithUser);
    } catch (error: any) {
        console.error("Error fetching feed:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
