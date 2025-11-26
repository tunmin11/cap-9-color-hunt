import { NextResponse } from "next/server";
import { adminStorage } from "@/lib/firebaseAdmin";

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;
        const userId = formData.get("userId") as string;

        if (!file || !userId) {
            return NextResponse.json({ error: "Missing file or userId" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        // Explicitly get and sanitize bucket name
        const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.replace("gs://", "");
        const bucket = adminStorage.bucket(bucketName);

        const fileName = `avatars/${userId}/avatar.jpg`;
        const fileRef = bucket.file(fileName);

        await fileRef.save(buffer, {
            contentType: file.type,
            public: true,
        });

        await fileRef.makePublic();
        const downloadURL = fileRef.publicUrl();

        return NextResponse.json({ success: true, downloadURL });
    } catch (error: any) {
        console.error("Error uploading avatar:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
