export function Skeleton({ className }: { className?: string }) {
    return (
        <div className={`animate-pulse bg-neutral-200/20 rounded-lg ${className}`} />
    );
}

export function PackGridSkeleton() {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-square bg-white rounded-2xl p-2 border-2 border-transparent">
                    <div className="h-8 mb-2 flex items-center gap-2">
                        <Skeleton className="w-4 h-4 rounded-full" />
                        <Skeleton className="w-20 h-4" />
                    </div>
                    <div className="grid grid-cols-3 gap-0.5 w-full aspect-square rounded-lg overflow-hidden">
                        {Array.from({ length: 9 }).map((_, j) => (
                            <Skeleton key={j} className="w-full h-full" />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
