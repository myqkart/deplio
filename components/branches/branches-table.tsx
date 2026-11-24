"use client";

import { useOptimistic, useState, useTransition } from "react";
import {
  GitBranchIcon,
  PencilIcon,
  TrashIcon,
} from "@primer/octicons-react";
import { toast } from "sonner";
import { updateBranchEnabled } from "@/lib/actions/branches";
import type { BranchRow } from "@/lib/types";
import { BranchFormDialog } from "@/components/branches/branch-form-dialog";
import { DeleteBranchDialog } from "@/components/branches/delete-branch-dialog";
import { DeployButton } from "@/components/deploy/deploy-button";
import { BranchChip } from "@/components/ui/branch-chip";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { EnvironmentBadge } from "@/components/ui/environment-badge";
import { RelativeTime } from "@/components/ui/relative-time";
import { Switch } from "@/components/ui/switch";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TriggerStatusBadge } from "@/components/ui/trigger-status-badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type BranchesTableProps = {
  applicationId: string;
  applicationName: string;
  branches: BranchRow[];
};

export function BranchesTable({
  applicationId,
  applicationName,
  branches,
}: BranchesTableProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editBranch, setEditBranch] = useState<BranchRow | null>(null);
  const [deleteBranch, setDeleteBranch] = useState<BranchRow | null>(null);

  const addButton = (
    <Button variant="primary" onClick={() => setCreateOpen(true)}>
      Add branch
    </Button>
  );

  return (
    <section className="overflow-hidden rounded-[6px] border border-border bg-background">
      <div className="flex items-center justify-between gap-3 border-b border-border bg-canvas-subtle px-4 py-2">
        <h2 className="text-sm font-semibold leading-[21px]">Branches</h2>
        {addButton}
      </div>

      {branches.length === 0 ? (
        <EmptyState
          icon={GitBranchIcon}
          title="No branches yet"
          description="Add a branch and its Amplify webhook to enable deployments."
          action={addButton}
        />
      ) : (
        <>
          <div className="hidden md:block">
            <table className="w-full caption-bottom text-sm">
              <TableHeader>
                <TableRow className="border-t-0 hover:bg-transparent">
                  <TableHead>Branch</TableHead>
                  <TableHead>Environment</TableHead>
                  <TableHead>Webhook</TableHead>
                  <TableHead>Enabled</TableHead>
                  <TableHead>Last trigger</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {branches.map((branch) => (
                  <BranchRowDesktop
                    key={branch.id}
                    branch={branch}
                    applicationId={applicationId}
                    applicationName={applicationName}
                    onEdit={() => setEditBranch(branch)}
                    onDelete={() => setDeleteBranch(branch)}
                  />
                ))}
              </TableBody>
            </table>
          </div>

          <div className="space-y-2 p-4 md:hidden">
            {branches.map((branch) => (
              <BranchRowMobile
                key={branch.id}
                branch={branch}
                applicationId={applicationId}
                applicationName={applicationName}
                onEdit={() => setEditBranch(branch)}
                onDelete={() => setDeleteBranch(branch)}
              />
            ))}
          </div>
        </>
      )}

      <BranchFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        mode="create"
        applicationId={applicationId}
      />

      {editBranch ? (
        <BranchFormDialog
          open={!!editBranch}
          onOpenChange={(open) => !open && setEditBranch(null)}
          mode="edit"
          applicationId={applicationId}
          branch={{
            id: editBranch.id,
            name: editBranch.name,
            environment: editBranch.environment,
            isEnabled: editBranch.isEnabled,
          }}
        />
      ) : null}

      {deleteBranch ? (
        <DeleteBranchDialog
          open={!!deleteBranch}
          onOpenChange={(open) => !open && setDeleteBranch(null)}
          branch={{ id: deleteBranch.id, name: deleteBranch.name }}
          applicationId={applicationId}
        />
      ) : null}
    </section>
  );
}

function DisabledLabel() {
  return (
    <span className="inline-flex h-5 items-center rounded-[2em] border border-neutral-border bg-neutral px-[7px] text-xs font-medium text-neutral-foreground">
      Disabled
    </span>
  );
}

function BranchRowDesktop({
  branch,
  applicationId,
  applicationName,
  onEdit,
  onDelete,
}: {
  branch: BranchRow;
  applicationId: string;
  applicationName: string;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [enabled, setEnabledOptimistic] = useOptimistic(branch.isEnabled);
  const [, startTransition] = useTransition();

  function onToggle(next: boolean) {
    startTransition(async () => {
      setEnabledOptimistic(next);
      const result = await updateBranchEnabled(
        branch.id,
        applicationId,
        next
      );
      if (!result.ok) {
        toast.error(`Couldn't update "${branch.name}". Reverted.`, {
          duration: 6000,
        });
      }
    });
  }

  return (
    <TableRow>
      <TableCell className={cn(!enabled && "opacity-60")}>
        <BranchChip name={branch.name} />
      </TableCell>
      <TableCell className={cn(!enabled && "opacity-60")}>
        <EnvironmentBadge environment={branch.environment} />
      </TableCell>
      <TableCell className={cn(!enabled && "opacity-60")}>
        <Tooltip>
          <TooltipTrigger className="font-mono text-xs text-muted-foreground">
            …{branch.webhookHint}
          </TooltipTrigger>
          <TooltipContent className="max-w-[260px] rounded-[6px] bg-[#6e7681] px-2 py-1 text-xs text-white">
            Webhook URLs are stored server-side and can&apos;t be viewed. Edit
            the branch to replace it.
          </TooltipContent>
        </Tooltip>
      </TableCell>
      <TableCell className={cn(!enabled && "opacity-60")}>
        <div className="flex items-center gap-2">
          <Switch
            checked={enabled}
            onCheckedChange={onToggle}
            aria-label={`Allow deployments for ${branch.name}`}
          />
          {enabled ? (
            <span className="text-sm text-muted-foreground">Enabled</span>
          ) : (
            <DisabledLabel />
          )}
        </div>
      </TableCell>
      <TableCell className={cn(!enabled && "opacity-60")}>
        {branch.lastTriggerAt && branch.lastTriggerStatus ? (
          <div className="flex items-center gap-2">
            <RelativeTime value={branch.lastTriggerAt} />
            <span
              className={cn(
                "size-1.5 rounded-full",
                branch.lastTriggerStatus === "triggered"
                  ? "bg-info-foreground"
                  : "bg-danger-foreground"
              )}
              aria-hidden
            />
          </div>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </TableCell>
      <TableCell>
        <div className="flex items-center justify-end gap-0.5">
          <DeployButton
            branchId={branch.id}
            applicationName={applicationName}
            branchName={branch.name}
            environment={branch.environment}
            disabled={!enabled}
            disabledReason="Deployments are disabled for this branch."
          />
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Edit branch"
                  onClick={onEdit}
                />
              }
            >
              <PencilIcon size={16} />
            </TooltipTrigger>
            <TooltipContent className="rounded-[6px] bg-[#6e7681] px-2 py-1 text-xs text-white">
              Edit branch
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Delete branch"
                  onClick={onDelete}
                />
              }
            >
              <TrashIcon size={16} />
            </TooltipTrigger>
            <TooltipContent className="rounded-[6px] bg-[#6e7681] px-2 py-1 text-xs text-white">
              Delete branch
            </TooltipContent>
          </Tooltip>
        </div>
      </TableCell>
    </TableRow>
  );
}

function BranchRowMobile({
  branch,
  applicationId,
  applicationName,
  onEdit,
  onDelete,
}: {
  branch: BranchRow;
  applicationId: string;
  applicationName: string;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [enabled, setEnabledOptimistic] = useOptimistic(branch.isEnabled);
  const [, startTransition] = useTransition();

  function onToggle(next: boolean) {
    startTransition(async () => {
      setEnabledOptimistic(next);
      const result = await updateBranchEnabled(
        branch.id,
        applicationId,
        next
      );
      if (!result.ok) {
        toast.error(`Couldn't update "${branch.name}". Reverted.`, {
          duration: 6000,
        });
      }
    });
  }

  return (
    <div className="rounded-[6px] border border-border bg-background p-4">
      <div className="flex items-start justify-between gap-2">
        <div className={cn("min-w-0", !enabled && "opacity-60")}>
          <div className="flex flex-wrap items-center gap-2">
            <BranchChip name={branch.name} />
            {!enabled ? <DisabledLabel /> : null}
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <EnvironmentBadge environment={branch.environment} />
            <Tooltip>
              <TooltipTrigger className="font-mono text-xs text-muted-foreground">
                …{branch.webhookHint}
              </TooltipTrigger>
              <TooltipContent className="max-w-[260px] rounded-[6px] bg-[#6e7681] px-2 py-1 text-xs text-white">
                Webhook URLs are stored server-side and can&apos;t be viewed.
                Edit the branch to replace it.
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
            {branch.lastTriggerAt && branch.lastTriggerStatus ? (
              <>
                <RelativeTime value={branch.lastTriggerAt} />
                <TriggerStatusBadge status={branch.lastTriggerStatus} />
              </>
            ) : (
              "—"
            )}
          </div>
        </div>
        <Switch
          checked={enabled}
          onCheckedChange={onToggle}
          aria-label={`Allow deployments for ${branch.name}`}
        />
      </div>
      <div className="mt-3 flex flex-col gap-2">
        <DeployButton
          branchId={branch.id}
          applicationName={applicationName}
          branchName={branch.name}
          environment={branch.environment}
          disabled={!enabled}
          disabledReason="Deployments are disabled for this branch."
          className="w-full"
        />
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Edit branch"
            onClick={onEdit}
          >
            <PencilIcon size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Delete branch"
            onClick={onDelete}
          >
            <TrashIcon size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}
