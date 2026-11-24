"use client";

import {
  AlertIcon,
  PaperAirplaneIcon,
  SyncIcon,
} from "@primer/octicons-react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

export function Toaster(props: ToasterProps) {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      position="top-center"
      offset={{ top: "calc(env(safe-area-inset-top, 0px) + 12px)" }}
      icons={{
        success: (
          <PaperAirplaneIcon size={16} className="text-info-foreground" />
        ),
        info: <PaperAirplaneIcon size={16} className="text-info-foreground" />,
        error: <AlertIcon size={16} className="text-danger-foreground" />,
        loading: <SyncIcon size={16} className="animate-spin" />,
      }}
      toastOptions={{
        duration: 4000,
        classNames: {
          toast:
            "w-[min(360px,calc(100vw-24px))] rounded-[6px] border border-border bg-popover text-popover-foreground shadow-none",
          title: "text-sm font-semibold",
          description: "text-xs text-muted-foreground",
          success: "border-info-border",
          info: "border-info-border",
          error: "border-danger-border",
        },
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "6px",
        } as React.CSSProperties
      }
      {...props}
    />
  );
}
