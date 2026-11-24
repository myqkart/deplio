"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteApplication } from "@/lib/actions/applications";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

type DeleteApplicationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  application: { id: string; name: string; branchCount: number };
  redirectOnSuccess?: boolean;
};

export function DeleteApplicationDialog({
  open,
  onOpenChange,
  application,
  redirectOnSuccess = false,
}: DeleteApplicationDialogProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function onConfirm() {
    setPending(true);
    const result = await deleteApplication(application.id);
    setPending(false);

    if (!result.ok) {
      toast.error(result.error, { duration: 6000 });
      return;
    }

    toast.success(`Application "${application.name}" deleted.`);
    onOpenChange(false);
    if (redirectOnSuccess) {
      router.push("/applications");
    }
    router.refresh();
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Delete ${application.name}?`}
      body={`This permanently deletes the application and its ${application.branchCount} branches, including their stored webhook URLs. Deployment history is kept.`}
      confirmLabel="Delete application"
      variant="destructive"
      pending={pending}
      onConfirm={() => void onConfirm()}
    />
  );
}
