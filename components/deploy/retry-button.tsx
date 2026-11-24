"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SyncIcon } from "@primer/octicons-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { failureToastDescription } from "@/lib/deployments/messages";

type RetryButtonProps = {
  deploymentId: string;
  applicationName: string;
  branchName: string;
  disabled?: boolean;
  disabledReason?: string;
};

export function RetryButton({
  deploymentId,
  applicationName,
  branchName,
  disabled = false,
  disabledReason,
}: RetryButtonProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function onRetry() {
    if (disabled || pending) return;
    setPending(true);
    try {
      const res = await fetch(`/api/deployments/${deploymentId}/retry`, {
        method: "POST",
      });

      if (res.status === 401) {
        toast.error("Couldn't trigger deployment.", {
          description: failureToastDescription("unauthenticated"),
          duration: 6000,
        });
        return;
      }
      if (res.status === 404) {
        toast.error(`Couldn't trigger ${applicationName} / ${branchName}.`, {
          description: failureToastDescription("missing"),
          duration: 6000,
        });
        return;
      }
      if (res.status === 409) {
        toast.error(`Couldn't trigger ${applicationName} / ${branchName}.`, {
          description: failureToastDescription("disabled"),
          duration: 6000,
        });
        return;
      }

      const data = (await res.json()) as {
        deployment?: {
          status: string;
          error_message?: string | null;
          http_status?: number | null;
        };
        error?: string;
      };

      if (!res.ok || !data.deployment) {
        toast.error(`Couldn't trigger ${applicationName} / ${branchName}.`, {
          description: failureToastDescription("unexpected"),
          duration: 6000,
        });
        return;
      }

      if (data.deployment.status === "triggered") {
        toast.success(
          `Retry triggered for ${applicationName} / ${branchName}.`,
          {
            description:
              "Amplify accepted the webhook. Build progress isn't tracked here — check the Amplify console.",
          }
        );
      } else {
        toast.error(`Couldn't trigger ${applicationName} / ${branchName}.`, {
          description:
            data.deployment.error_message ??
            failureToastDescription("non2xx", data.deployment.http_status),
          duration: 6000,
        });
      }
      router.refresh();
    } catch {
      toast.error(`Couldn't trigger ${applicationName} / ${branchName}.`, {
        description: failureToastDescription("network"),
        duration: 6000,
      });
    } finally {
      setPending(false);
    }
  }

  const button = (
    <Button
      variant="default"
      size="sm"
      disabled={disabled || pending}
      onClick={() => void onRetry()}
      aria-label="Retry"
    >
      {pending ? <SyncIcon size={16} className="animate-spin" /> : null}
      Retry
    </Button>
  );

  const tooltip =
    disabled && disabledReason
      ? disabledReason
      : "Send the webhook again for this branch.";

  return (
    <Tooltip>
      <TooltipTrigger render={<span className="inline-flex" />}>
        {button}
      </TooltipTrigger>
      <TooltipContent className="max-w-[260px] rounded-[6px] bg-[#6e7681] px-2 py-1 text-xs text-white">
        {tooltip}
      </TooltipContent>
    </Tooltip>
  );
}
