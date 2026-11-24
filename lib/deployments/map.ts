import type { DeploymentRow, Environment, TriggerStatus } from "@/lib/types";

type DbDeployment = {
  id: string;
  application_id: string | null;
  branch_id: string | null;
  application_name: string;
  branch_name: string;
  environment: Environment;
  status: TriggerStatus;
  http_status: number | null;
  error_message: string | null;
  triggered_by: string | null;
  triggered_by_email: string | null;
  retry_of: string | null;
  created_at: string;
};

export function mapDeployment(
  row: DbDeployment,
  branchMeta?: { exists: boolean; enabled: boolean }
): DeploymentRow {
  return {
    id: row.id,
    applicationId: row.application_id,
    branchId: row.branch_id,
    applicationName: row.application_name,
    branchName: row.branch_name,
    environment: row.environment,
    status: row.status,
    httpStatus: row.http_status,
    errorMessage: row.error_message,
    triggeredBy: row.triggered_by,
    triggeredByEmail: row.triggered_by_email,
    retryOf: row.retry_of,
    createdAt: row.created_at,
    branchExists: branchMeta?.exists,
    branchEnabled: branchMeta?.enabled,
  };
}
