"use client";

import { useState } from "react";
import Link from "next/link";
import { PencilIcon, ServerIcon, TrashIcon } from "@primer/octicons-react";
import type { ApplicationRow } from "@/lib/types";
import { ApplicationFormDialog } from "@/components/applications/application-form-dialog";
import { DeleteApplicationDialog } from "@/components/applications/delete-application-dialog";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Counter } from "@/components/ui/counter";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { RefreshButton } from "@/components/ui/refresh-button";
import { RelativeTime } from "@/components/ui/relative-time";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type ApplicationsTableProps = {
  applications: ApplicationRow[];
  error?: string | null;
};

export function ApplicationsTable({
  applications,
  error,
}: ApplicationsTableProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editApp, setEditApp] = useState<ApplicationRow | null>(null);
  const [deleteApp, setDeleteApp] = useState<ApplicationRow | null>(null);

  const addButton = (
    <Button variant="primary" onClick={() => setCreateOpen(true)}>
      Add application
    </Button>
  );

  return (
    <>
      <PageHeader
        title="Applications"
        description="Applications and the branches you can deploy."
        action={addButton}
      />

      {error ? (
        <ErrorState message="Couldn't load applications." action={<RefreshButton />} />
      ) : applications.length === 0 ? (
        <div className="overflow-hidden rounded-[6px] border border-border bg-background">
          <EmptyState
            icon={ServerIcon}
            title="No applications yet"
            description="Add your first application to start managing deployments."
            action={addButton}
          />
        </div>
      ) : (
        <>
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow className="border-t-0 hover:bg-transparent">
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Branches</TableHead>
                  <TableHead>Last deployment</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell className="max-w-[200px] truncate">
                      <Link
                        href={`/applications/${app.id}`}
                        className="text-link hover:underline"
                      >
                        {app.name}
                      </Link>
                    </TableCell>
                    <TableCell className="max-w-[280px] truncate text-muted-foreground">
                      {app.description ? (
                        <Tooltip>
                          <TooltipTrigger className="truncate">
                            {app.description}
                          </TooltipTrigger>
                          <TooltipContent className="max-w-[260px] rounded-[6px] bg-[#6e7681] px-2 py-1 text-xs text-white">
                            {app.description}
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>
                      <Counter value={app.branchCount} />
                    </TableCell>
                    <TableCell>
                      {app.lastDeploymentAt ? (
                        <RelativeTime value={app.lastDeploymentAt} />
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <RowActions
                        onEdit={() => setEditApp(app)}
                        onDelete={() => setDeleteApp(app)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="space-y-2 md:hidden">
            {applications.map((app) => (
              <div
                key={app.id}
                className="rounded-[6px] border border-border bg-background p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <Link
                      href={`/applications/${app.id}`}
                      className="text-sm text-link hover:underline"
                    >
                      {app.name}
                    </Link>
                    {app.description ? (
                      <p className="mt-0.5 truncate text-sm text-muted-foreground">
                        {app.description}
                      </p>
                    ) : null}
                    <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                      <Counter value={app.branchCount} />
                      <span>branches ·</span>
                      {app.lastDeploymentAt ? (
                        <RelativeTime value={app.lastDeploymentAt} />
                      ) : (
                        "—"
                      )}
                    </p>
                  </div>
                  <RowActions
                    onEdit={() => setEditApp(app)}
                    onDelete={() => setDeleteApp(app)}
                  />
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <ApplicationFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        mode="create"
      />

      {editApp ? (
        <ApplicationFormDialog
          open={!!editApp}
          onOpenChange={(open) => !open && setEditApp(null)}
          mode="edit"
          application={{
            id: editApp.id,
            name: editApp.name,
            description: editApp.description,
          }}
        />
      ) : null}

      {deleteApp ? (
        <DeleteApplicationDialog
          open={!!deleteApp}
          onOpenChange={(open) => !open && setDeleteApp(null)}
          application={{
            id: deleteApp.id,
            name: deleteApp.name,
            branchCount: deleteApp.branchCount,
          }}
        />
      ) : null}
    </>
  );
}

function RowActions({
  onEdit,
  onDelete,
}: {
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className={cn("flex items-center justify-end gap-0.5")}>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              aria-label="Edit application"
              onClick={onEdit}
            />
          }
        >
          <PencilIcon size={16} />
        </TooltipTrigger>
        <TooltipContent className="rounded-[6px] bg-[#6e7681] px-2 py-1 text-xs text-white">
          Edit application
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              aria-label="Delete application"
              onClick={onDelete}
            />
          }
        >
          <TrashIcon size={16} />
        </TooltipTrigger>
        <TooltipContent className="rounded-[6px] bg-[#6e7681] px-2 py-1 text-xs text-white">
          Delete application
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
