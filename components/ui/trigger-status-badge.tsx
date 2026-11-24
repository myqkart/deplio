import {
  PaperAirplaneIcon,
  XCircleIcon,
} from "@primer/octicons-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { TriggerStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const config = {
  triggered: {
    label: "Triggered",
    tooltip: "Amplify accepted the webhook. Build result isn't tracked yet.",
    className:
      "border-info-border bg-info text-info-foreground",
    Icon: PaperAirplaneIcon,
  },
  failed: {
    label: "Failed",
    tooltip: "The webhook request didn't succeed. See details.",
    className:
      "border-danger-border bg-danger text-danger-foreground",
    Icon: XCircleIcon,
  },
} as const;

export function TriggerStatusBadge({ status }: { status: TriggerStatus }) {
  const item = config[status];
  const Icon = item.Icon;
  return (
    <Tooltip>
      <TooltipTrigger
        className={cn(
          "inline-flex h-5 items-center gap-1 rounded-[2em] border px-[7px] text-xs font-medium",
          item.className
        )}
      >
        <Icon size={12} />
        {item.label}
      </TooltipTrigger>
      <TooltipContent className="max-w-[260px] rounded-[6px] bg-[#6e7681] px-2 py-1 text-xs text-white">
        {item.tooltip}
      </TooltipContent>
    </Tooltip>
  );
}
