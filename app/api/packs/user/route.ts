import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");

        if (!userId) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 });
        }

        const packsRef = adminDb.collection("packs");
        const snapshot = await packsRef
            .where("userId", "==", userId)
            .orderBy("createdAt", "desc")
            .get();

        const packs = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return NextResponse.json(packs);
    } catch (error: any) {
        console.error("Error fetching user packs:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
