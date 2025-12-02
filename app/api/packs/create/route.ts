import { NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(request: Request) {
    try {
        const { userId, targetColorId, targetColor } = await request.json();

        if (!userId || !targetColorId || !targetColor) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Fetch user details for denormalization
        let userDisplayName = "Anonymous";
        let userPhotoURL = null;
        try {
            const userDoc = await adminDb.collection("users").doc(userId).get();
            if (userDoc.exists) {
                const userData = userDoc.data();
                userDisplayName = userData?.displayName || "Anonymous";
                userPhotoURL = userData?.photoURL || null;
            } else {
                const authUser = await adminAuth.getUser(userId);
                userDisplayName = authUser.displayName || authUser.email?.split("@")[0] || "Anonymous";
                userPhotoURL = authUser.photoURL || null;
            }
        } catch (e) {
            console.error("Failed to fetch user details for pack creation:", e);
        }

        const packData = {
            userId,
            targetColorId,
            targetColor,
            status: "active", // Changed from "incomplete" to "active"
            createdAt: FieldValue.serverTimestamp(),
            images: [], // Changed from {} to []
            completedAt: null, // Added new field
            likesCount: 0, // Added new field
            commentsCount: 0, // Added new field
            userDisplayName, // Added new field
            userPhotoURL // Added new field
        };

        const docRef = await adminDb.collection("packs").add(packData);

        return NextResponse.json({ id: docRef.id });
    } catch (error: any) {
        console.error("Error creating pack:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
