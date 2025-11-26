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

        return NextResponse.json({ id: packDoc.id, ...packDoc.data() });
    } catch (error: any) {
        console.error("Error fetching pack:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
