import * as admin from "firebase-admin";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

// Initialize Firebase Admin
if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
            }),
        });
    } catch (error) {
        console.error("Firebase Admin Initialization Error:", error);
        process.exit(1);
    }
}

const db = admin.firestore();

const colors = [
    { name: "Crimson", hex: "#DC143C", h_min: 340, h_max: 360 }, // Also 0-10
    { name: "Emerald", hex: "#50C878", h_min: 130, h_max: 160 },
    { name: "Azure", hex: "#007FFF", h_min: 195, h_max: 225 },
    { name: "Goldenrod", hex: "#DAA520", h_min: 35, h_max: 55 },
    { name: "Amethyst", hex: "#9966CC", h_min: 260, h_max: 280 },
    { name: "Coral", hex: "#FF7F50", h_min: 10, h_max: 25 },
    { name: "Teal", hex: "#008080", h_min: 170, h_max: 190 },
    { name: "Indigo", hex: "#4B0082", h_min: 265, h_max: 285 },
    { name: "Chartreuse", hex: "#7FFF00", h_min: 75, h_max: 95 },
    { name: "Magenta", hex: "#FF00FF", h_min: 290, h_max: 310 },
];

async function seed() {
    console.log("Seeding colors using Admin SDK...");
    const colorsRef = db.collection("colors");

    for (const color of colors) {
        await colorsRef.doc(color.name.toLowerCase()).set(color);
        console.log(`Added ${color.name}`);
    }

    console.log("Done!");
    process.exit(0);
}

seed().catch(console.error);
