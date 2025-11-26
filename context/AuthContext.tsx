"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../lib/firebase";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    logout: async () => { },
    refreshUser: async () => { },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // Sync user to Firestore via API to avoid permission issues
                fetch("/api/auth/sync", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        uid: user.uid,
                        email: user.email,
                    }),
                }).catch(err => console.error("Failed to sync user:", err));
            }
            setUser(user);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const logout = async () => {
        await auth.signOut();
    };

    const refreshUser = async () => {
        if (auth.currentUser) {
            await auth.currentUser.reload();
            setUser({ ...auth.currentUser });
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
