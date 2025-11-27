"use client";

import { usePathname } from "next/navigation";

export default function PageWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const isHome = pathname === "/";

    return (
        <div key={pathname} className={`animate-fade-in ${isHome ? "" : "pb-28"}`}>
            {children}
        </div>
    );
}
