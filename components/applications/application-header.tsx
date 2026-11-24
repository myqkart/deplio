"use client";

import { useState } from "react";
import Link from "next/link";
import { ApplicationFormDialog } from "@/components/applications/application-form-dialog";
import { DeleteApplicationDialog } from "@/components/applications/delete-application-dialog";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";

type ApplicationHeaderProps = {
  application: {
    id: string;
    name: string;
    description: string | null;
    branchCount: number;
  };
};

export function ApplicationHeader({ application }: ApplicationHeaderProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <PageHeader
        title={application.name}
        description={application.description ?? undefined}
        breadcrumb={
          <nav className="text-xs text-muted-foreground">
            <Link href="/applications" className="text-link hover:underline">
              Applications
            </Link>
            <span className="mx-1.5">/</span>
            <span className="text-foreground">{application.name}</span>
          </nav>
        }
        action={
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            <Button
              variant="default"
              className="w-full sm:w-auto"
              onClick={() => setEditOpen(true)}
            >
              Edit
            </Button>
            <Button
              variant="destructive"
              className="w-full sm:w-auto"
              onClick={() => setDeleteOpen(true)}
            >
              Delete
            </Button>
          </div>
        }
      />

      <ApplicationFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        mode="edit"
        application={{
          id: application.id,
          name: application.name,
          description: application.description,
        }}
      />

      <DeleteApplicationDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        application={{
          id: application.id,
          name: application.name,
          branchCount: application.branchCount,
        }}
        redirectOnSuccess
      />
    </>
  );
}
