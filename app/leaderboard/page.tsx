import { Metadata } from "next";
import LeaderboardClient from "./LeaderboardClient";

export const metadata: Metadata = {
    title: "Leaderboard",
    description: "Top hunters in the Colour Hunt community.",
};

export default function LeaderboardPage() {
    return <LeaderboardClient />;
}
