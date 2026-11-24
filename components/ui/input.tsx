import * as React from "react";
import { Input as InputPrimitive } from "@base-ui/react/input";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-11 w-full min-w-0 rounded-[6px] border border-border bg-background px-3 py-2 text-base text-foreground outline-none transition-[color,background-color,border-color,box-shadow] duration-[80ms] ease-[cubic-bezier(0.33,1,0.68,1)] placeholder:text-subtle focus-visible:border-accent-emphasis focus-visible:shadow-[inset_0_0_0_1px_#1f6feb] disabled:cursor-not-allowed disabled:bg-canvas-subtle disabled:text-subtle aria-invalid:border-danger-foreground aria-invalid:shadow-[inset_0_0_0_1px_#f85149] md:h-8 md:py-[5px] md:text-sm",
        className
      )}
      {...props}
    />
  );
}

export { Input };
