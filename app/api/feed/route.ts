import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export async function GET() {
    try {
        const packsRef = adminDb.collection("packs");
        const snapshot = await packsRef
            .where("status", "==", "complete")
            .orderBy("completedAt", "desc")
            .limit(20)
            .get();

        const packsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Fetch user details for each pack
        const packsWithUser = await Promise.all(packsData.map(async (pack: any) => {
            let user = null;
            if (pack.userId) {
                try {
                    // 1. Try Firestore first (contains custom username)
                    const userDoc = await adminDb.collection("users").doc(pack.userId).get();

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

                    // 2. Fallback to Firebase Auth if Firestore missing or no name
                    if (!user) {
                        const authUser = await import("@/lib/firebaseAdmin").then(m => m.adminAuth.getUser(pack.userId));
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
            return { ...pack, user };
        }));

        return NextResponse.json(packsWithUser);
    } catch (error: any) {
        console.error("Error fetching feed:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
