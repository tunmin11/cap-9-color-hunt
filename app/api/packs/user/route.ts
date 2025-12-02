import { NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebaseAdmin";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");

        if (!userId) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 });
        }

        // Check for Auth Token (Optional, for vote status)
        let currentUserId: string | null = null;
        const authHeader = request.headers.get("Authorization");
        if (authHeader?.startsWith("Bearer ")) {
            try {
                const token = authHeader.split("Bearer ")[1];
                const decodedToken = await adminAuth.verifyIdToken(token);
                currentUserId = decodedToken.uid;
            } catch (e) {
                // Ignore invalid token
            }
        }

        const packsRef = adminDb.collection("packs");
        const snapshot = await packsRef
            .where("userId", "==", userId)
            .orderBy("createdAt", "desc")
            .get();

        const packsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Fetch Likes for current user (Batch Optimization)
        let likedPackIds = new Map<string, number>();
        if (currentUserId && packsData.length > 0) {
            const packIds = packsData.map(p => p.id);
            // Firestore 'in' query supports up to 30 items.
            // If user has many packs, we might need to chunk this.
            // For now, let's chunk it manually to be safe.
            const chunkSize = 30;
            for (let i = 0; i < packIds.length; i += chunkSize) {
                const chunk = packIds.slice(i, i + chunkSize);
                try {
                    const likesSnapshot = await adminDb.collection("likes")
                        .where("userId", "==", currentUserId)
                        .where("packId", "in", chunk)
                        .get();

                    likesSnapshot.docs.forEach(doc => {
                        const data = doc.data();
                        likedPackIds.set(data.packId, data.vote !== undefined ? data.vote : 1);
                    });
                } catch (e) {
                    console.error("Failed to batch fetch likes:", e);
                }
            }
        }

        const packs = packsData.map(pack => ({
            ...pack,
            userVote: likedPackIds.has(pack.id) ? (likedPackIds.get(pack.id) || 1) : 0,
            likesCount: (pack as any).likesCount || 0
        }));

        return NextResponse.json(packs);
    } catch (error: any) {
        console.error("Error fetching user packs:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
