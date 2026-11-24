"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteBranch } from "@/lib/actions/branches";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

type DeleteBranchDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  branch: { id: string; name: string };
  applicationId: string;
};

export function DeleteBranchDialog({
  open,
  onOpenChange,
  branch,
  applicationId,
}: DeleteBranchDialogProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function onConfirm() {
    setPending(true);
    const result = await deleteBranch(branch.id, applicationId);
    setPending(false);

    if (!result.ok) {
      toast.error(result.error, { duration: 6000 });
      return;
    }

    toast.success(`Branch "${branch.name}" deleted.`);
    onOpenChange(false);
    router.refresh();
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Delete ${branch.name}?`}
      body="This permanently removes the branch and its stored webhook URL. Deployment history is kept."
      confirmLabel="Delete branch"
      variant="destructive"
      pending={pending}
      onConfirm={() => void onConfirm()}
    />
  );
}
