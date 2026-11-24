import { Suspense } from "react";
import { QuickDeploy } from "@/components/dashboard/quick-deploy";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { StatsRow } from "@/components/dashboard/stats-row";
import { PageHeader } from "@/components/layout/page-header";
import { ErrorState } from "@/components/ui/error-state";
import { RefreshButton } from "@/components/ui/refresh-button";
import { Skeleton } from "@/components/ui/skeleton";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { mapDeployment } from "@/lib/deployments/map";
import { createClient } from "@/lib/supabase/server";
import type { Environment, QuickDeployApp } from "@/lib/types";

export const metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <>
          <PageHeader
            title="Dashboard"
            description="Deployment overview and quick trigger."
          />
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-[6px] border border-border bg-canvas-subtle p-4"
                >
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="mt-2 h-6 w-[60px]" />
                </div>
              ))}
            </div>
            <TableSkeleton rows={3} />
          </div>
        </>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}

async function DashboardContent() {
  const supabase = await createClient();
  // Live 24h window for dashboard stats (intentionally dynamic).
  // eslint-disable-next-line react-hooks/purity -- current time required for rolling window
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const [
    appsResult,
    branchesResult,
    triggersResult,
    failedResult,
    recentResult,
    quickAppsResult,
    quickBranchesResult,
  ] = await Promise.all([
    supabase.from("applications").select("id", { count: "exact", head: true }),
    supabase.from("branches").select("id", { count: "exact", head: true }),
    supabase
      .from("deployments")
      .select("id", { count: "exact", head: true })
      .eq("status", "triggered")
      .gte("created_at", since),
    supabase
      .from("deployments")
      .select("id", { count: "exact", head: true })
      .eq("status", "failed")
      .gte("created_at", since),
    supabase
      .from("deployments")
      .select(
        "id, application_id, branch_id, application_name, branch_name, environment, status, http_status, error_message, triggered_by, triggered_by_email, retry_of, created_at"
      )
      .order("created_at", { ascending: false })
      .limit(10),
    supabase.from("applications").select("id, name").order("name"),
    supabase
      .from("branches")
      .select("id, application_id, name, environment, is_enabled")
      .order("name"),
  ]);

  const loadError =
    appsResult.error ||
    branchesResult.error ||
    triggersResult.error ||
    failedResult.error ||
    recentResult.error ||
    quickAppsResult.error ||
    quickBranchesResult.error;

  if (loadError) {
    return (
      <>
        <PageHeader
          title="Dashboard"
          description="Deployment overview and quick trigger."
        />
        <ErrorState
          message="Couldn't load the dashboard."
          action={<RefreshButton />}
        />
      </>
    );
  }

  const branchMeta = new Map<string, { exists: boolean; enabled: boolean }>();
  for (const b of quickBranchesResult.data ?? []) {
    branchMeta.set(b.id, { exists: true, enabled: b.is_enabled });
  }

  const recent = (recentResult.data ?? []).map((row) => {
    const meta = row.branch_id ? branchMeta.get(row.branch_id) : undefined;
    return mapDeployment(row, meta ?? { exists: false, enabled: false });
  });

  const branchesByApp = new Map<
    string,
    QuickDeployApp["branches"]
  >();
  for (const b of quickBranchesResult.data ?? []) {
    const list = branchesByApp.get(b.application_id) ?? [];
    list.push({
      id: b.id,
      name: b.name,
      environment: b.environment as Environment,
      isEnabled: b.is_enabled,
    });
    branchesByApp.set(b.application_id, list);
  }

  const quickApps: QuickDeployApp[] = (quickAppsResult.data ?? []).map(
    (app) => ({
      id: app.id,
      name: app.name,
      branches: branchesByApp.get(app.id) ?? [],
    })
  );

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Deployment overview and quick trigger."
      />
      <div className="space-y-6">
        <StatsRow
          applications={appsResult.count ?? 0}
          branches={branchesResult.count ?? 0}
          triggers24h={triggersResult.count ?? 0}
          failed24h={failedResult.count ?? 0}
        />
        <QuickDeploy applications={quickApps} />
        <RecentActivity deployments={recent} />
      </div>
    </>
  );
}
