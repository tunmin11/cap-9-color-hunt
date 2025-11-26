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

        const packs = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return NextResponse.json(packs);
    } catch (error: any) {
        console.error("Error fetching feed:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
