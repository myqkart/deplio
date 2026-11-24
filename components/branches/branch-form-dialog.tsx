"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createBranch, updateBranch } from "@/lib/actions/branches";
import {
  ENVIRONMENTS,
  ENVIRONMENT_LABELS,
  type Environment,
} from "@/lib/environments";
import { validateWebhookUrl } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

type BranchFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  applicationId: string;
  branch?: {
    id: string;
    name: string;
    environment: Environment;
    isEnabled: boolean;
  };
};

export function BranchFormDialog({
  open,
  onOpenChange,
  mode,
  applicationId,
  branch,
}: BranchFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[480px] gap-0 overflow-hidden rounded-xl border border-border bg-popover p-0 shadow-[0_0_0_1px_#30363d,0_8px_24px_#010409] sm:max-w-[480px] sm:rounded-xl"
        showCloseButton
      >
        {open ? (
          <BranchFormFields
            key={branch?.id ?? "create"}
            mode={mode}
            applicationId={applicationId}
            branch={branch}
            onOpenChange={onOpenChange}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function BranchFormFields({
  mode,
  applicationId,
  branch,
  onOpenChange,
}: {
  mode: "create" | "edit";
  applicationId: string;
  branch?: {
    id: string;
    name: string;
    environment: Environment;
    isEnabled: boolean;
  };
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [name, setName] = useState(branch?.name ?? "");
  const [environment, setEnvironment] = useState<Environment | null>(
    branch?.environment ?? null
  );
  const [webhookUrl, setWebhookUrl] = useState("");
  const [isEnabled, setIsEnabled] = useState(branch?.isEnabled ?? true);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!name.trim()) errors.name = "Branch name is required.";
    if (!environment) errors.environment = "Select an environment.";

    if (mode === "create") {
      if (!webhookUrl.trim()) errors.webhookUrl = "Webhook URL is required.";
      else {
        const webhookError = validateWebhookUrl(webhookUrl.trim());
        if (webhookError) errors.webhookUrl = webhookError;
      }
    } else if (webhookUrl.trim()) {
      const webhookError = validateWebhookUrl(webhookUrl.trim());
      if (webhookError) errors.webhookUrl = webhookError;
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setPending(true);
    setFieldErrors({});

    const result =
      mode === "create"
        ? await createBranch(applicationId, {
            name,
            environment: environment!,
            webhookUrl,
            isEnabled,
          })
        : await updateBranch(branch!.id, applicationId, {
            name,
            environment: environment!,
            webhookUrl: webhookUrl.trim() || undefined,
            isEnabled,
          });

    setPending(false);

    if (!result.ok) {
      if (result.fieldErrors) setFieldErrors(result.fieldErrors);
      toast.error(result.error, { duration: 6000 });
      return;
    }

    toast.success(
      mode === "create"
        ? `Branch "${name.trim()}" added.`
        : `Branch "${name.trim()}" updated.`
    );
    onOpenChange(false);
    router.refresh();
  }

  return (
    <>
      <DialogHeader className="space-y-0 border-b border-border p-4 text-left">
        <DialogTitle className="text-sm font-semibold text-foreground">
          {mode === "create" ? "Add branch" : "Edit branch"}
        </DialogTitle>
      </DialogHeader>

      <form onSubmit={onSubmit}>
        <div className="space-y-4 p-4">
          <div className="space-y-2">
            <Label
              htmlFor="branch-name"
              className="text-sm font-semibold text-foreground"
            >
              Branch name
            </Label>
            <Input
              id="branch-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="staging"
              disabled={pending}
              autoFocus
              aria-invalid={!!fieldErrors.name}
              className="font-mono text-xs"
            />
            {fieldErrors.name ? (
              <p className="text-xs text-danger-foreground">{fieldErrors.name}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground">
              Environment
            </Label>
            <Select
              value={environment}
              onValueChange={(value) =>
                setEnvironment(value as Environment | null)
              }
              disabled={pending}
              items={ENVIRONMENTS.map((value) => ({
                value,
                label: ENVIRONMENT_LABELS[value],
              }))}
            >
              <SelectTrigger
                className="w-full"
                aria-invalid={!!fieldErrors.environment}
              >
                <SelectValue placeholder="Select environment" />
              </SelectTrigger>
              <SelectContent>
                {ENVIRONMENTS.map((value) => (
                  <SelectItem key={value} value={value}>
                    {ENVIRONMENT_LABELS[value]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldErrors.environment ? (
              <p className="text-xs text-danger-foreground">
                {fieldErrors.environment}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="webhook-url"
              className="text-sm font-semibold text-foreground"
            >
              Webhook URL
            </Label>
            <Input
              id="webhook-url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder={
                mode === "edit"
                  ? "Leave blank to keep the current webhook"
                  : "https://webhooks.amplify.us-east-1.amazonaws.com/prod/webhooks?id=…&token=…"
              }
              disabled={pending}
              aria-invalid={!!fieldErrors.webhookUrl}
              className="font-mono text-xs"
            />
            {fieldErrors.webhookUrl ? (
              <p className="text-xs text-danger-foreground">
                {fieldErrors.webhookUrl}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Create one in the Amplify console under Incoming webhooks. It is
                stored server-side and never shown again.
              </p>
            )}
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <Label
                htmlFor="allow-deployments"
                className="text-sm font-semibold text-foreground"
              >
                Allow deployments
              </Label>
              <p className="mt-0.5 text-xs text-muted-foreground">
                When off, this branch can&apos;t be deployed.
              </p>
            </div>
            <Switch
              id="allow-deployments"
              checked={isEnabled}
              onCheckedChange={setIsEnabled}
              disabled={pending}
            />
          </div>
        </div>

        <DialogFooter className="m-0 flex-col-reverse gap-2 rounded-none border-t border-border bg-transparent p-4 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="default"
            disabled={pending}
            className="w-full sm:w-auto"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={pending}
            className="w-full sm:w-auto"
          >
            {mode === "create" ? "Add branch" : "Save changes"}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}
