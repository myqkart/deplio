"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  createApplication,
  updateApplication,
} from "@/lib/actions/applications";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ApplicationFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  application?: { id: string; name: string; description: string | null };
};

export function ApplicationFormDialog({
  open,
  onOpenChange,
  mode,
  application,
}: ApplicationFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[480px] gap-0 overflow-hidden rounded-xl border border-border bg-popover p-0 shadow-[0_0_0_1px_#30363d,0_8px_24px_#010409] sm:max-w-[480px] sm:rounded-xl"
        showCloseButton
      >
        {open ? (
          <ApplicationFormFields
            key={application?.id ?? "create"}
            mode={mode}
            application={application}
            onOpenChange={onOpenChange}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function ApplicationFormFields({
  mode,
  application,
  onOpenChange,
}: {
  mode: "create" | "edit";
  application?: { id: string; name: string; description: string | null };
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [name, setName] = useState(application?.name ?? "");
  const [description, setDescription] = useState(
    application?.description ?? ""
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setFieldErrors({});

    const input = { name, description };
    const result =
      mode === "create"
        ? await createApplication(input)
        : await updateApplication(application!.id, input);

    setPending(false);

    if (!result.ok) {
      if (result.fieldErrors) setFieldErrors(result.fieldErrors);
      toast.error(result.error, { duration: 6000 });
      return;
    }

    toast.success(
      mode === "create"
        ? `Application "${name.trim()}" created.`
        : `Application "${name.trim()}" updated.`
    );
    onOpenChange(false);
    router.refresh();
  }

  return (
    <>
      <DialogHeader className="space-y-0 border-b border-border p-4 text-left">
        <DialogTitle className="text-sm font-semibold text-foreground">
          {mode === "create" ? "Add application" : "Edit application"}
        </DialogTitle>
        {mode === "create" ? (
          <DialogDescription className="mt-1 text-sm text-muted-foreground">
            Group branches under one Amplify app.
          </DialogDescription>
        ) : null}
      </DialogHeader>

      <form onSubmit={onSubmit}>
        <div className="space-y-4 p-4">
          <div className="space-y-2">
            <Label
              htmlFor="app-name"
              className="text-sm font-semibold text-foreground"
            >
              Name
            </Label>
            <Input
              id="app-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Boards Frontend"
              disabled={pending}
              autoFocus
              aria-invalid={!!fieldErrors.name}
            />
            {fieldErrors.name ? (
              <p className="text-xs text-danger-foreground">{fieldErrors.name}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="app-description"
              className="text-sm font-semibold text-foreground"
            >
              Description
            </Label>
            <Input
              id="app-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Customer-facing boards app (Next.js)"
              disabled={pending}
              aria-invalid={!!fieldErrors.description}
            />
            {fieldErrors.description ? (
              <p className="text-xs text-danger-foreground">
                {fieldErrors.description}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">Optional.</p>
            )}
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
            {mode === "create" ? "Create application" : "Save changes"}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}
