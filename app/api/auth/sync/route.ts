import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(request: Request) {
    try {
        const { uid, email, displayName, photoURL } = await request.json();

        if (!uid || !email) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Check for unique username (displayName) if provided
        if (displayName) {
            const usernameQuery = await adminDb.collection("users")
                .where("displayName", "==", displayName)
                .get();

            if (!usernameQuery.empty) {
                // Check if the found user is NOT the current user
                const existingUser = usernameQuery.docs[0];
                if (existingUser.id !== uid) {
                    return NextResponse.json({ error: "Username is already taken" }, { status: 400 });
                }
            }
        }

        const userRef = adminDb.collection("users").doc(uid);

        // Use set with merge to update or create
        await userRef.set({
            uid,
            email,
            displayName: displayName || null,
            photoURL: photoURL || null,
            lastLogin: FieldValue.serverTimestamp(),
            createdAt: FieldValue.serverTimestamp(),
        }, { merge: true });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Error syncing user:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
