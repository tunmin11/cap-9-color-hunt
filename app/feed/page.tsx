import type { Metadata } from "next";
import FeedClient from "./FeedClient";

export const metadata: Metadata = {
    title: "Community Feed - Colour Hunt",
    description: "Explore the Colour Hunt community gallery. See completed photography challenges and get inspired by creative color grids from around the world.",
};

export default function FeedPage() {
    return <FeedClient />;
}

