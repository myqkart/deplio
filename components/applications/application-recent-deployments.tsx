import Link from "next/link";
import type { DeploymentRow } from "@/lib/types";
import {
  branchDisplayName,
  triggeredByDisplay,
} from "@/lib/deployments/details";
import { BranchChip } from "@/components/ui/branch-chip";
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

type ApplicationRecentDeploymentsProps = {
  applicationId: string;
  deployments: DeploymentRow[];
};

export function ApplicationRecentDeployments({
  applicationId,
  deployments,
}: ApplicationRecentDeploymentsProps) {
  return (
    <section className="overflow-hidden rounded-[6px] border border-border bg-background">
      <div className="flex items-center justify-between gap-3 border-b border-border bg-canvas-subtle px-4 py-2">
        <h2 className="text-sm font-semibold leading-[21px]">
          Recent deployments
        </h2>
        <Link
          href={`/deployments?application=${applicationId}`}
          className="text-sm text-link hover:underline"
        >
          View all
        </Link>
      </div>

      {deployments.length === 0 ? (
        <div className="px-4 py-8 text-center text-sm text-muted-foreground">
          No deployments for this application yet.
        </div>
      ) : (
        <table className="w-full caption-bottom text-sm">
          <TableHeader>
            <TableRow className="border-t-0 hover:bg-transparent">
              <TableHead>Branch</TableHead>
              <TableHead className="hidden sm:table-cell">Environment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Triggered by</TableHead>
              <TableHead>Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deployments.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  <BranchChip
                    name={branchDisplayName(row.branchName, row.branchId)}
                  />
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <EnvironmentBadge environment={row.environment} />
                </TableCell>
                <TableCell>
                  <TriggerStatusBadge status={row.status} />
                </TableCell>
                <TableCell className="hidden max-w-[160px] truncate text-muted-foreground md:table-cell">
                  {triggeredByDisplay(row.triggeredByEmail, row.triggeredBy)}
                </TableCell>
                <TableCell>
                  <RelativeTime value={row.createdAt} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </table>
      )}
    </section>
  );
}
