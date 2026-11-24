import Link from "next/link";
import { HistoryIcon } from "@primer/octicons-react";
import type { DeploymentRow } from "@/lib/types";
import {
  applicationDisplayName,
  branchDisplayName,
  triggeredByDisplay,
} from "@/lib/deployments/details";
import { RetryButton } from "@/components/deploy/retry-button";
import { BranchChip } from "@/components/ui/branch-chip";
import { EmptyState } from "@/components/ui/empty-state";
import { EnvironmentBadge } from "@/components/ui/environment-badge";
import { RelativeTime } from "@/components/ui/relative-time";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TriggerStatusBadge } from "@/components/ui/trigger-status-badge";

type RecentActivityProps = {
  deployments: DeploymentRow[];
};

export function RecentActivity({ deployments }: RecentActivityProps) {
  return (
    <section className="overflow-hidden rounded-[6px] border border-border bg-background">
      <div className="flex items-center justify-between gap-3 border-b border-border bg-canvas-subtle px-4 py-2">
        <h2 className="text-sm font-semibold leading-[21px]">Recent activity</h2>
        <Link
          href="/deployments"
          className="text-sm text-link hover:underline"
        >
          View all deployments
        </Link>
      </div>

      {deployments.length === 0 ? (
        <EmptyState
          icon={HistoryIcon}
          title="No deployments yet"
          description="Triggered deployments will appear here."
        />
      ) : (
        <>
          <div className="hidden md:block">
            <table className="w-full caption-bottom text-sm">
              <TableHeader>
                <TableRow className="border-t-0 hover:bg-transparent">
                  <TableHead>Application</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Environment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Triggered by</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deployments.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="max-w-[160px] truncate">
                      <AppCell row={row} />
                    </TableCell>
                    <TableCell>
                      <BranchChip
                        name={branchDisplayName(row.branchName, row.branchId)}
                      />
                    </TableCell>
                    <TableCell>
                      <EnvironmentBadge environment={row.environment} />
                    </TableCell>
                    <TableCell>
                      <TriggerStatusBadge status={row.status} />
                    </TableCell>
                    <TableCell className="max-w-[140px] truncate text-muted-foreground">
                      {triggeredByDisplay(
                        row.triggeredByEmail,
                        row.triggeredBy
                      )}
                    </TableCell>
                    <TableCell>
                      <RelativeTime value={row.createdAt} />
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end">
                        <RetryCell row={row} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </table>
          </div>

          <div className="space-y-2 p-4 md:hidden">
            {deployments.map((row) => (
              <div
                key={row.id}
                className="rounded-[6px] border border-border bg-background p-4"
              >
                <div className="min-w-0">
                  <AppCell row={row} />
                  <div className="mt-1">
                    <BranchChip
                      name={branchDisplayName(row.branchName, row.branchId)}
                    />
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <EnvironmentBadge environment={row.environment} />
                    <TriggerStatusBadge status={row.status} />
                    <RelativeTime value={row.createdAt} />
                  </div>
                </div>
                {row.status === "failed" ? (
                  <div className="mt-3 [&_button]:w-full">
                    <RetryCell row={row} />
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function AppCell({ row }: { row: DeploymentRow }) {
  const label = applicationDisplayName(row.applicationName, row.applicationId);
  if (row.applicationId) {
    return (
      <Link
        href={`/applications/${row.applicationId}`}
        className="text-link hover:underline"
      >
        {label}
      </Link>
    );
  }
  return <span className="text-muted-foreground">{label}</span>;
}

function RetryCell({ row }: { row: DeploymentRow }) {
  if (row.status !== "failed") return null;

  let disabled = false;
  let disabledReason: string | undefined;

  if (!row.branchId || row.branchExists === false) {
    disabled = true;
    disabledReason = "Branch was deleted.";
  } else if (row.branchEnabled === false) {
    disabled = true;
    disabledReason = "Branch is disabled.";
  }

  return (
    <RetryButton
      deploymentId={row.id}
      applicationName={row.applicationName}
      branchName={row.branchName}
      disabled={disabled}
      disabledReason={disabledReason}
    />
  );
}
