"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  body: string;
  confirmLabel: string;
  cancelLabel?: string;
  variant?: "primary" | "destructive";
  pending?: boolean;
  onConfirm: () => void;
};

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  body,
  confirmLabel,
  cancelLabel = "Cancel",
  variant = "primary",
  pending = false,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="w-[calc(100vw-32px)] max-w-[440px] gap-0 overflow-hidden rounded-xl border border-border bg-popover p-0 shadow-[0_0_0_1px_#30363d,0_8px_24px_#010409] sm:rounded-xl">
        <AlertDialogHeader className="space-y-0 border-b border-border p-4 text-left sm:place-items-start sm:text-left">
          <AlertDialogTitle className="text-sm font-semibold text-foreground">
            {title}
          </AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogDescription className="p-4 text-sm text-muted-foreground">
          {body}
        </AlertDialogDescription>
        <AlertDialogFooter className="m-0 flex-col-reverse gap-2 rounded-none border-t border-border bg-transparent p-4 sm:flex-row sm:justify-end">
          <AlertDialogCancel
            disabled={pending}
            className={cn(
              buttonVariants({ variant: "default", size: "default" }),
              "w-full sm:w-auto"
            )}
          >
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={pending}
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            className={cn(
              buttonVariants({
                variant: variant === "destructive" ? "destructive" : "primary",
                size: "default",
              }),
              "w-full sm:w-auto"
            )}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
