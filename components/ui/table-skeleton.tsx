import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function TableSkeleton({
  rows = 5,
  className,
}: {
  rows?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-[6px] border border-border bg-background",
        className
      )}
    >
      <div className="border-b border-border bg-canvas-subtle px-4 py-2">
        <Skeleton className="h-3 w-40 bg-[rgba(110,118,129,0.1)]" />
      </div>
      <div>
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="flex h-10 items-center gap-3 border-t border-border-muted px-4"
          >
            <Skeleton className="h-3 w-1/4 bg-[rgba(110,118,129,0.1)]" />
            <Skeleton className="h-3 w-1/5 bg-[rgba(110,118,129,0.1)]" />
            <Skeleton className="ml-auto h-3 w-16 bg-[rgba(110,118,129,0.1)]" />
          </div>
        ))}
      </div>
    </div>
  );
}
