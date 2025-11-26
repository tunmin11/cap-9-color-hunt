import { NextResponse } from "next/server";
import { adminStorage, adminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;
        const packId = formData.get("packId") as string;
        const userId = formData.get("userId") as string;
        const cellPosition = formData.get("cellPosition") as string;
        const targetColor = formData.get("targetColor") as string; // We might need this for verification later

        if (!file || !packId || !userId || !cellPosition) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        // Explicitly get and sanitize bucket name
        const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.replace("gs://", "");
        console.log("Using storage bucket:", bucketName);

        const bucket = adminStorage.bucket(bucketName);
        const timestamp = Date.now();
        const fileName = `images/${userId}/${packId}/${cellPosition}_${timestamp}.jpg`;
        const fileRef = bucket.file(fileName);

        await fileRef.save(buffer, {
            contentType: file.type,
            public: true, // Make public so we can view it
        });

        // Get the public URL
        // Note: This assumes the bucket is readable or we use a signed URL. 
        // For simplicity in this MVP, we'll use the public media link format if possible, 
        // or a signed URL if we want to be secure. 
        // Let's try to make it public.
        await fileRef.makePublic();
        const downloadURL = fileRef.publicUrl();

        // Update Firestore
        const packRef = adminDb.collection("packs").doc(packId);
        const imageUpdateKey = `images.${cellPosition}`;

        await packRef.update({
            [`${imageUpdateKey}.imageUrl`]: downloadURL,
            [`${imageUpdateKey}.isVerified`]: false,
            [`${imageUpdateKey}.uploadedAt`]: FieldValue.serverTimestamp(),
        });

        return NextResponse.json({ success: true, downloadURL });
    } catch (error: any) {
        console.error("Error uploading file:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
