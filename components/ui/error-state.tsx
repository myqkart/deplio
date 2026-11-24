import { AlertIcon } from "@primer/octicons-react";
import type { ReactNode } from "react";

type ErrorStateProps = {
  message: string;
  action?: ReactNode;
};

export function ErrorState({ message, action }: ErrorStateProps) {
  return (
    <div className="flex items-start gap-3 rounded-[6px] border border-danger-border bg-danger p-4 text-sm text-danger-foreground">
      <AlertIcon size={16} className="mt-0.5 shrink-0" />
      <div className="min-w-0 flex-1">
        <p>{message}</p>
        {action ? <div className="mt-2">{action}</div> : null}
      </div>
    </div>
  );
}
