import Image from "next/image";

interface LogoProps {
    className?: string;
}

export function Logo({ className = "w-12 h-12" }: LogoProps) {
    return (
        <div className={`relative ${className}`}>
            <Image
                src="/logo.svg"
                alt="CAP 9 Logo"
                fill
                className="object-contain"
                priority
            />
        </div>
    );
}
