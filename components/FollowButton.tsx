"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";

interface FollowButtonProps {
    targetUserId: string;
    initialIsFollowing: boolean;
    onFollowChange?: (isFollowing: boolean) => void;
}

export default function FollowButton({ targetUserId, initialIsFollowing, onFollowChange }: FollowButtonProps) {
    const { user } = useAuth();
    const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
    const [isLoading, setIsLoading] = useState(false);

    const handleFollow = async () => {
        if (!user) return; // TODO: Trigger login
        if (isLoading) return;

        // Optimistic update
        const newIsFollowing = !isFollowing;
        setIsFollowing(newIsFollowing);
        setIsLoading(true);
        if (onFollowChange) onFollowChange(newIsFollowing);

        try {
            const token = await user.getIdToken();
            const res = await fetch("/api/social/follow", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ targetUserId }),
            });

            if (!res.ok) {
                throw new Error("Failed to toggle follow");
            }
        } catch (error) {
            console.error("Error following user:", error);
            // Revert
            setIsFollowing(!newIsFollowing);
            if (onFollowChange) onFollowChange(!newIsFollowing);
        } finally {
            setIsLoading(false);
        }
    };

    if (user?.uid === targetUserId) return null;

    return (
        <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleFollow}
            className={`px-4 py-2 rounded-full font-bold text-sm transition-colors ${isFollowing
                    ? "bg-neutral-200 text-neutral-800 hover:bg-neutral-300"
                    : "bg-[#A41F13] text-white hover:bg-[#8a1a10]"
                }`}
        >
            {isFollowing ? "Following" : "Follow"}
        </motion.button>
    );
}
