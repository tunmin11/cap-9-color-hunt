import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export async function GET(request: Request, { params }: { params: Promise<{ userId: string }> }) {
    try {
        const { userId } = await params;
        if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

        let publicProfile;

        const userDoc = await adminDb.collection("users").doc(userId).get();

        if (userDoc.exists) {
            const userData = userDoc.data();
            publicProfile = {
                uid: userData?.uid,
                displayName: userData?.displayName,
                photoURL: userData?.photoURL,
                createdAt: userData?.createdAt
            };
        } else {
            // Fallback to Firebase Auth
            try {
                const authUser = await import("@/lib/firebaseAdmin").then(m => m.adminAuth.getUser(userId));
                publicProfile = {
                    uid: authUser.uid,
                    displayName: authUser.displayName || authUser.email?.split("@")[0] || "Anonymous",
                    photoURL: authUser.photoURL || null,
                    createdAt: authUser.metadata.creationTime
                };
            } catch (authError) {
                console.error("Auth fetch failed:", authError);
                return NextResponse.json({ error: "User not found" }, { status: 404 });
            }
        }

        return NextResponse.json(publicProfile);
    } catch (error: any) {
        console.error("Error fetching user:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
