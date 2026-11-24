import { cn } from "@/lib/utils";

export function Counter({
  value,
  className,
}: {
  value: number | string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-5 min-w-5 items-center justify-center rounded-[2em] bg-[rgba(110,118,129,0.4)] px-1.5 text-xs font-medium text-foreground",
        className
      )}
    >
      {value}
    </span>
  );
}
