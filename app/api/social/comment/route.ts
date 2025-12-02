import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const packId = searchParams.get("packId");

        if (!packId) {
            return NextResponse.json({ error: "Pack ID required" }, { status: 400 });
        }

        const commentsRef = adminDb.collection("comments");
        const snapshot = await commentsRef
            .where("packId", "==", packId)
            .limit(50)
            .get();

        let comments = await Promise.all(snapshot.docs.map(async (doc) => {
            const data = doc.data();

            // Use denormalized user data if available
            if (data.userDisplayName) {
                return {
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt?.toDate()?.toISOString()
                };
            }

            // Fallback fetch user details for each comment (could be optimized)
            let userDisplayName = "Anonymous";
            let userPhotoURL = null;

            try {
                const userDoc = await adminDb.collection("users").doc(data.userId).get();
                if (userDoc.exists) {
                    const userData = userDoc.data();
                    userDisplayName = userData?.displayName || "Anonymous";
                    userPhotoURL = userData?.photoURL || null;
                } else {
                    const authUser = await adminAuth.getUser(data.userId);
                    userDisplayName = authUser.displayName || "Anonymous";
                    userPhotoURL = authUser.photoURL || null;
                }
            } catch (e) {
                // Ignore
            }

            return {
                id: doc.id,
                ...data,
                userDisplayName,
                userPhotoURL,
                createdAt: data.createdAt?.toDate()?.toISOString()
            };
        }));

        // Sort in memory to avoid needing a composite index
        comments.sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return dateB - dateA;
        });

        return NextResponse.json(comments);

    } catch (error: any) {
        console.error("Error fetching comments:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

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

        const { packId, text } = await request.json();
        if (!packId || !text) {
            return NextResponse.json({ error: "Pack ID and text required" }, { status: 400 });
        }

        // Get user details for immediate response
        const userDoc = await adminDb.collection("users").doc(userId).get();
        const userData = userDoc.data();
        const userDisplayName = userData?.displayName || decodedToken.name || "Anonymous";
        const userPhotoURL = userData?.photoURL || decodedToken.picture || null;

        const commentData = {
            packId,
            userId,
            text,
            createdAt: FieldValue.serverTimestamp(),
            userDisplayName,
            userPhotoURL
        };

        const docRef = await adminDb.collection("comments").add(commentData);

        // Update comment count
        await adminDb.collection("packs").doc(packId).update({
            commentsCount: FieldValue.increment(1)
        });

        return NextResponse.json({
            id: docRef.id,
            ...commentData,
            userDisplayName,
            userPhotoURL,
            createdAt: new Date().toISOString() // Approximate for immediate UI update
        });

    } catch (error: any) {
        console.error("Error posting comment:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        // Verify Auth
        const authHeader = request.headers.get("Authorization");
        if (!authHeader?.startsWith("Bearer ")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const token = authHeader.split("Bearer ")[1];
        const decodedToken = await adminAuth.verifyIdToken(token);
        const userId = decodedToken.uid;

        const { searchParams } = new URL(request.url);
        const commentId = searchParams.get("id");
        const packId = searchParams.get("packId");

        if (!commentId || !packId) {
            return NextResponse.json({ error: "Comment ID and Pack ID required" }, { status: 400 });
        }

        const commentRef = adminDb.collection("comments").doc(commentId);
        const commentDoc = await commentRef.get();

        if (!commentDoc.exists) {
            return NextResponse.json({ error: "Comment not found" }, { status: 404 });
        }

        if (commentDoc.data()?.userId !== userId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        await commentRef.delete();

        // Update comment count
        await adminDb.collection("packs").doc(packId).update({
            commentsCount: FieldValue.increment(-1)
        });

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("Error deleting comment:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
