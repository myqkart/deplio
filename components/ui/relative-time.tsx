"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

function formatRelative(date: Date, now = new Date()): string {
  const seconds = Math.round((date.getTime() - now.getTime()) / 1000);
  const abs = Math.abs(seconds);
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  if (abs < 60) return rtf.format(Math.round(seconds), "second");
  const minutes = Math.round(seconds / 60);
  if (Math.abs(minutes) < 60) return rtf.format(minutes, "minute");
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return rtf.format(hours, "hour");
  const days = Math.round(hours / 24);
  if (Math.abs(days) < 30) return rtf.format(days, "day");
  const months = Math.round(days / 30);
  if (Math.abs(months) < 12) return rtf.format(months, "month");
  return rtf.format(Math.round(months / 12), "year");
}

export function RelativeTime({ value }: { value: string | Date }) {
  const date = typeof value === "string" ? new Date(value) : value;
  const absolute = date.toLocaleString();
  return (
    <Tooltip>
      <TooltipTrigger className="font-variant-numeric tabular-nums text-muted-foreground">
        {formatRelative(date)}
      </TooltipTrigger>
      <TooltipContent
        className="rounded-[6px] bg-[#6e7681] px-2 py-1 text-xs text-white"
        title={date.toISOString()}
      >
        {absolute}
      </TooltipContent>
    </Tooltip>
  );
}
