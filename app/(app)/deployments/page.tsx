import { Suspense } from "react";
import { DeploymentsFilters } from "@/components/deployments/deployments-filters";
import { DeploymentsPagination } from "@/components/deployments/deployments-pagination";
import { DeploymentsTable } from "@/components/deployments/deployments-table";
import { TriggerNotice } from "@/components/deployments/trigger-notice";
import { PageHeader } from "@/components/layout/page-header";
import { ErrorState } from "@/components/ui/error-state";
import { RefreshButton } from "@/components/ui/refresh-button";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { mapDeployment } from "@/lib/deployments/map";
import { createClient } from "@/lib/supabase/server";
import { isEnvironment } from "@/lib/environments";
import type { TriggerStatus } from "@/lib/types";

export const metadata = { title: "Deployments" };

const PAGE_SIZE = 25;

export default function DeploymentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <Suspense
      fallback={
        <>
          <PageHeader
            title="Deployments"
            description="Webhook trigger history."
          />
          <TableSkeleton rows={8} />
        </>
      }
    >
      <DeploymentsLoader searchParams={searchParams} />
    </Suspense>
  );
}

async function DeploymentsLoader({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  return <DeploymentsContent params={params} />;
}

function first(
  value: string | string[] | undefined
): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

async function DeploymentsContent({
  params,
}: {
  params: Record<string, string | string[] | undefined>;
}) {
  const applicationId = first(params.application) || null;
  const environmentRaw = first(params.environment);
  const statusRaw = first(params.status);
  const pageRaw = first(params.page);
  const page = Math.max(1, Number.parseInt(pageRaw ?? "1", 10) || 1);

  const environment =
    environmentRaw && isEnvironment(environmentRaw) ? environmentRaw : null;

  const status =
    statusRaw === "triggered" || statusRaw === "failed"
      ? (statusRaw as TriggerStatus)
      : null;

  const filtered = !!(applicationId || environment || status);
  const offset = (page - 1) * PAGE_SIZE;

  const supabase = await createClient();

  const { data: apps } = await supabase
    .from("applications")
    .select("id, name")
    .order("name");

  let query = supabase
    .from("deployments")
    .select(
      "id, application_id, branch_id, application_name, branch_name, environment, status, http_status, error_message, triggered_by, triggered_by_email, retry_of, created_at",
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  if (applicationId) query = query.eq("application_id", applicationId);
  if (environment) query = query.eq("environment", environment);
  if (status) query = query.eq("status", status);

  const { data: rows, error, count } = await query;

  if (error) {
    return (
      <>
        <PageHeader
          title="Deployments"
          description="Webhook trigger history."
        />
        <ErrorState
          message="Couldn't load deployments."
          action={<RefreshButton />}
        />
      </>
    );
  }

  const branchIds = [
    ...new Set(
      (rows ?? [])
        .map((r) => r.branch_id)
        .filter((id): id is string => !!id)
    ),
  ];

  const branchMeta = new Map<string, { exists: boolean; enabled: boolean }>();
  if (branchIds.length) {
    const { data: branches } = await supabase
      .from("branches")
      .select("id, is_enabled")
      .in("id", branchIds);
    for (const b of branches ?? []) {
      branchMeta.set(b.id, { exists: true, enabled: b.is_enabled });
    }
  }

  const deployments = (rows ?? []).map((row) => {
    const meta = row.branch_id ? branchMeta.get(row.branch_id) : undefined;
    return mapDeployment(row, meta ?? { exists: false, enabled: false });
  });

  const total = count ?? 0;
  const hasNext = offset + PAGE_SIZE < total;

  const baseParams = new URLSearchParams();
  if (applicationId) baseParams.set("application", applicationId);
  if (environment) baseParams.set("environment", environment);
  if (status) baseParams.set("status", status);

  return (
    <>
      <PageHeader
        title="Deployments"
        description="Webhook trigger history."
      />
      <div className="space-y-4">
        <TriggerNotice />
        <DeploymentsFilters
          applications={apps ?? []}
          applicationId={applicationId}
          environment={environment}
          status={status}
        />
        <DeploymentsTable
          deployments={deployments}
          filtered={filtered}
          clearHref="/deployments"
        />
        <DeploymentsPagination
          page={page}
          hasNext={hasNext}
          baseParams={baseParams}
        />
      </div>
    </>
  );
}
