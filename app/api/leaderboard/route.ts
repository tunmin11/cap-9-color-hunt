import { NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebaseAdmin";

export async function GET() {
    try {
        const packsRef = adminDb.collection("packs");
        const snapshot = await packsRef
            .where("status", "==", "complete")
            .get();

        // Aggregate counts by userId
        const userCounts: Record<string, number> = {};

        snapshot.docs.forEach(doc => {
            const data = doc.data();
            const userId = data.userId;
            if (userId) {
                userCounts[userId] = (userCounts[userId] || 0) + 1;
            }
        });

        // Convert to array and sort
        const sortedUsers = Object.entries(userCounts)
            .map(([userId, count]) => ({ userId, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 50); // Top 50

        // Fetch user details
        const leaderboardData = await Promise.all(sortedUsers.map(async ({ userId, count }) => {
            let user = {
                uid: userId,
                displayName: "Anonymous",
                photoURL: null as string | null,
                count
            };

            try {
                // 1. Try Firestore first
                const userDoc = await adminDb.collection("users").doc(userId).get();

                if (userDoc.exists) {
                    const userData = userDoc.data();
                    if (userData?.displayName) {
                        user.displayName = userData.displayName;
                        user.photoURL = userData.photoURL || null;
                    }
                }

                // 2. Fallback to Auth if needed (and if we want to be robust, though Firestore should be source of truth for profile)
                if (user.displayName === "Anonymous") {
                    try {
                        const authUser = await adminAuth.getUser(userId);
                        user.displayName = authUser.displayName || authUser.email?.split("@")[0] || "Anonymous";
                        user.photoURL = authUser.photoURL || null;
                    } catch (e) {
                        // Ignore auth fetch errors
                    }
                }

            } catch (err) {
                console.error(`Failed to fetch user details for ${userId}:`, err);
            }

            return user;
        }));

        return NextResponse.json(leaderboardData);
    } catch (error: any) {
        console.error("Error fetching leaderboard:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
