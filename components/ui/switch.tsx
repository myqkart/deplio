"use client";

import { Switch as SwitchPrimitive } from "@base-ui/react/switch";
import { cn } from "@/lib/utils";

function Switch({ className, ...props }: SwitchPrimitive.Root.Props) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer group/switch relative inline-flex h-7 w-12 shrink-0 items-center rounded-xl border border-border bg-[#21262d] transition-[background-color,border-color] duration-[80ms] ease-[cubic-bezier(0.33,1,0.68,1)] outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1f6feb] data-checked:border-transparent data-checked:bg-accent-emphasis data-disabled:cursor-not-allowed data-disabled:opacity-50 md:h-6 md:w-10",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block size-5 translate-x-[3px] rounded-full bg-[#e6edf3] transition-transform duration-[80ms] ease-[cubic-bezier(0.33,1,0.68,1)] group-data-checked/switch:translate-x-[22px] group-data-checked/switch:bg-white md:size-[18px] md:translate-x-[2px] md:group-data-checked/switch:translate-x-[18px]"
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
