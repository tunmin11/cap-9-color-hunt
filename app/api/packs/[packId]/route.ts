import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ packId: string }> }
) {
    try {
        const { packId } = await params;

        if (!packId) {
            return NextResponse.json({ error: "Pack ID is required" }, { status: 400 });
        }

        const packRef = adminDb.collection("packs").doc(packId);
        const packDoc = await packRef.get();

        if (!packDoc.exists) {
            return NextResponse.json({ error: "Pack not found" }, { status: 404 });
        }

        const packData = { id: packDoc.id, ...packDoc.data() } as any;

        // Fetch user details
        if (packData.userId) {
            try {
                let user = null;
                // 1. Try Firestore first
                const userDoc = await adminDb.collection("users").doc(packData.userId).get();
                if (userDoc.exists) {
                    const userData = userDoc.data();
                    if (userData?.displayName) {
                        user = {
                            displayName: userData.displayName,
                            photoURL: userData.photoURL || null,
                            uid: userData.uid
                        };
                    }
                }

                // 2. Fallback to Auth
                if (!user) {
                    const authUser = await import("@/lib/firebaseAdmin").then(m => m.adminAuth.getUser(packData.userId));
                    user = {
                        displayName: authUser.displayName || authUser.email?.split("@")[0] || "Anonymous",
                        photoURL: authUser.photoURL || null,
                        uid: authUser.uid
                    };
                }
                packData.user = user;
            } catch (err) {
                console.error(`Failed to fetch user ${packData.userId}:`, err);
                packData.user = { displayName: "Anonymous", photoURL: null, uid: packData.userId };
            }
        }

        return NextResponse.json(packData);
    } catch (error: any) {
        console.error("Error fetching pack:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
