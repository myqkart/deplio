import type { DeploymentRow } from "@/lib/types";

export function deploymentDetailsLabel(row: {
  status: DeploymentRow["status"];
  httpStatus: number | null;
  errorMessage: string | null;
  retryOf: string | null;
}): string {
  if (row.status === "failed") {
    if (row.httpStatus != null) return `HTTP ${row.httpStatus}`;
    if (row.errorMessage?.includes("10 seconds")) return "Timeout";
    if (row.errorMessage?.includes("Couldn't reach")) return "Network error";
  }
  if (row.retryOf) return `Retry of #${row.retryOf.slice(0, 8)}`;
  return "—";
}

export function applicationDisplayName(
  name: string,
  applicationId: string | null
): string {
  return applicationId ? name : `${name} (deleted)`;
}

export function branchDisplayName(
  name: string,
  branchId: string | null
): string {
  return branchId ? name : `${name} (deleted)`;
}

export function triggeredByDisplay(email: string | null, userId: string | null): string {
  if (!userId) return "Unknown user";
  return email?.trim() || "Unknown user";
}
