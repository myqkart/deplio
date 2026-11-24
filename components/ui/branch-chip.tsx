import { cn } from "@/lib/utils";

export function BranchChip({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center truncate rounded-[6px] bg-[rgba(56,139,253,0.1)] px-1.5 py-0.5 font-mono text-xs text-link",
        className
      )}
      title={name}
    >
      {name}
    </span>
  );
}
