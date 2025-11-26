import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(request: Request) {
    try {
        const { uid, email, displayName, photoURL } = await request.json();

        if (!uid || !email) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const userRef = adminDb.collection("users").doc(uid);

        // Use set with merge to update or create
        await userRef.set({
            uid,
            email,
            displayName: displayName || null,
            photoURL: photoURL || null,
            lastLogin: FieldValue.serverTimestamp(),
            createdAt: FieldValue.serverTimestamp(), // This will be overwritten on merge if exists, which is fine or we can use update logic
        }, { merge: true });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Error syncing user:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
