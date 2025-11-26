import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export async function GET() {
    try {
        const colorsRef = adminDb.collection("colors");
        const snapshot = await colorsRef.get();

        const colors = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return NextResponse.json(colors);
    } catch (error: any) {
        console.error("Error fetching colors:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
