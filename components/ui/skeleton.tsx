import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "animate-pulse rounded-[6px] bg-[rgba(110,118,129,0.1)]",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
