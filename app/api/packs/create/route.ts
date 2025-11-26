import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(request: Request) {
    try {
        const { userId, targetColorId, targetColor } = await request.json();

        if (!userId || !targetColorId || !targetColor) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const packData = {
            userId,
            targetColorId,
            targetColor,
            status: "incomplete",
            createdAt: FieldValue.serverTimestamp(),
            images: {},
        };

        const docRef = await adminDb.collection("packs").add(packData);

        return NextResponse.json({ id: docRef.id });
    } catch (error: any) {
        console.error("Error creating pack:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
