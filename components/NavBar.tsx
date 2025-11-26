"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavBar() {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    const navItems = [
        {
            name: "Home",
            href: "/",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            ),
        },
        {
            name: "Feed",
            href: "/feed",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
            ),
        },
        {
            name: "Create",
            href: "/create",
            isPrimary: true,
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
            ),
        },
        {
            name: "Profile",
            href: "/profile",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            ),
        },
    ];

    return (
        <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center pointer-events-none">
            <nav className="flex items-center gap-2 px-4 py-3 bg-neutral-900/80 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl shadow-black/50 pointer-events-auto transition-all duration-300 hover:scale-[1.02] hover:bg-neutral-900/90">
                {navItems.map((item) => {
                    const active = isActive(item.href);

                    if (item.isPrimary) {
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="flex items-center justify-center w-12 h-12 mx-2 bg-white text-black rounded-full shadow-lg shadow-white/10 transition-all duration-200 hover:scale-110 active:scale-90 hover:rotate-3"
                                aria-label={item.name}
                            >
                                {item.icon}
                            </Link>
                        );
                    }

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`
                relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 group
                ${active ? "text-white bg-white/10 scale-110" : "text-neutral-400 hover:text-white hover:bg-white/5 hover:scale-110"}
              `}
                            aria-label={item.name}
                        >
                            {item.icon}
                            {active && (
                                <span className="absolute -bottom-1 w-1 h-1 bg-white rounded-full animate-fade-in" />
                            )}

                            {/* Tooltip */}
                            <span className="absolute -top-10 px-2 py-1 text-xs font-medium text-white bg-neutral-800 rounded opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 pointer-events-none whitespace-nowrap">
                                {item.name}
                            </span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
