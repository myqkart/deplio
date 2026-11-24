"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RocketIcon, SyncIcon } from "@primer/octicons-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { failureToastDescription } from "@/lib/deployments/messages";
import type { Environment } from "@/lib/types";

type DeployButtonProps = {
  branchId: string;
  applicationName: string;
  branchName: string;
  environment: Environment;
  disabled?: boolean;
  disabledReason?: string;
  label?: string;
  className?: string;
};

export function DeployButton({
  branchId,
  applicationName,
  branchName,
  environment,
  disabled = false,
  disabledReason,
  label = "Deploy",
  className,
}: DeployButtonProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  async function runDeploy() {
    setPending(true);
    try {
      const res = await fetch("/api/deployments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ branchId }),
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
      if (res.status === 429) {
        toast.error(`Couldn't trigger ${applicationName} / ${branchName}.`, {
          description: failureToastDescription("cooldown"),
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
          `Deployment triggered for ${applicationName} / ${branchName}.`,
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
      setConfirmOpen(false);
    }
  }

  function onClick() {
    if (disabled || pending) return;
    if (environment === "production") {
      setConfirmOpen(true);
      return;
    }
    void runDeploy();
  }

  const button = (
    <Button
      variant="primary"
      size="default"
      disabled={disabled || pending}
      onClick={onClick}
      aria-label={label}
      className={className}
    >
      {pending ? <SyncIcon size={16} className="animate-spin" /> : <RocketIcon size={16} />}
      {pending ? "Deploying…" : label}
    </Button>
  );

  return (
    <>
      {disabled && disabledReason ? (
        <Tooltip>
          <TooltipTrigger render={<span className="inline-flex" />}>
            {button}
          </TooltipTrigger>
          <TooltipContent className="rounded-[6px] bg-[#6e7681] px-2 py-1 text-xs text-white">
            {disabledReason}
          </TooltipContent>
        </Tooltip>
      ) : (
        button
      )}

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={`Deploy ${applicationName} / ${branchName} to production?`}
        body="This triggers an Amplify build for the production environment."
        confirmLabel="Deploy to production"
        pending={pending}
        onConfirm={() => void runDeploy()}
      />
    </>
  );
}
