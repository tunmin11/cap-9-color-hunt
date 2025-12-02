"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

interface VoteControlProps {
    packId: string;
    initialScore: number;
    initialUserVote: number; // -1, 0, 1
}

export default function VoteControl({ packId, initialScore, initialUserVote }: VoteControlProps) {
    const { user } = useAuth();
    const [score, setScore] = useState(initialScore);
    const [userVote, setUserVote] = useState<number>(initialUserVote);
    const [isLoading, setIsLoading] = useState(false);

    const handleVote = async (e: React.MouseEvent, voteType: 1 | -1) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) return; // TODO: Trigger login modal?
        if (isLoading) return;

        // Optimistic update
        const previousVote = userVote;
        const previousScore = score;
        let newVote = voteType;
        let newScore = score;

        if (userVote === voteType) {
            // Toggle off
            newVote = 1;
            newScore -= voteType;
        } else {
            // Change vote
            newVote = voteType;
            newScore += voteType - userVote;
        }

        setUserVote(newVote);
        setScore(newScore);
        setIsLoading(true);

        try {
            const response = await fetch("/api/social/vote", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ packId, vote: newVote }),
            });

            if (!response.ok) {
                throw new Error("Failed to vote");
            }
        } catch (error) {
            console.error("Error voting:", error);
            // Revert optimistic update
            setUserVote(previousVote);
            setScore(previousScore);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center gap-1 bg-neutral-50 rounded-full p-1 border border-neutral-200">
            <motion.button
                whileTap={{ scale: 0.8 }}
                onClick={(e) => handleVote(e, 1)}
                className={`p-1 rounded-full transition-colors ${userVote === 1
                    ? "text-[#A41F13] bg-[#A41F13]/10"
                    : "text-neutral-400 hover:text-[#A41F13] hover:bg-[#A41F13]/5"
                    }`}
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M10 17a.75.75 0 01-.75-.75V5.612L5.29 9.77a.75.75 0 01-1.08-1.04l5.25-5.5a.75.75 0 011.08 0l5.25 5.5a.75.75 0 11-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0110 17z" clipRule="evenodd" />
                </svg>
            </motion.button>

            <span className={`text-xs font-bold min-w-[1ch] ${userVote === 1 ? "text-[#A41F13]" :
                userVote === -1 ? "text-blue-600" : "text-neutral-600"
                }`}>
                {score}
            </span>

            <motion.button
                whileTap={{ scale: 0.8 }}
                onClick={(e) => handleVote(e, -1)}
                className={`p-1 rounded-full transition-colors ${userVote === -1
                    ? "text-blue-600 bg-blue-50"
                    : "text-neutral-400 hover:text-blue-600 hover:bg-blue-50"
                    }`}
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M10 3a.75.75 0 01.75.75v10.638l3.96-4.158a.75.75 0 111.08 1.04l-5.25 5.5a.75.75 0 01-1.08 0l-5.25-5.5a.75.75 0 111.08-1.04l3.96 4.158V3.75A.75.75 0 0110 3z" clipRule="evenodd" />
                </svg>
            </motion.button>
        </div>
    );
}
