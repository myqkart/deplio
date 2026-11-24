import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ApplicationHeader } from "@/components/applications/application-header";
import { ApplicationRecentDeployments } from "@/components/applications/application-recent-deployments";
import { BranchesTable } from "@/components/branches/branches-table";
import { PageHeader } from "@/components/layout/page-header";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { mapDeployment } from "@/lib/deployments/map";
import { createClient } from "@/lib/supabase/server";
import type { BranchRow, Environment, TriggerStatus } from "@/lib/types";

export const metadata = { title: "Application" };

export default function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <>
          <PageHeader title="Application" description="Loading…" />
          <TableSkeleton />
        </>
      }
    >
      <ApplicationDetailLoader params={params} />
    </Suspense>
  );
}

async function ApplicationDetailLoader({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ApplicationDetail id={id} />;
}

async function ApplicationDetail({ id }: { id: string }) {
  const supabase = await createClient();

  const { data: app, error } = await supabase
    .from("applications")
    .select("id, name, description")
    .eq("id", id)
    .maybeSingle();

  if (error || !app) {
    notFound();
  }

  const { data: branchRows } = await supabase
    .from("branches")
    .select("id, application_id, name, environment, webhook_hint, is_enabled")
    .eq("application_id", id)
    .order("name");

  const branchIds = (branchRows ?? []).map((b) => b.id);

  const { data: lastTriggers } = branchIds.length
    ? await supabase
        .from("deployments")
        .select("branch_id, created_at, status")
        .in("branch_id", branchIds)
        .order("created_at", { ascending: false })
    : { data: [] as { branch_id: string | null; created_at: string; status: TriggerStatus }[] };

  const lastByBranch = new Map<
    string,
    { createdAt: string; status: TriggerStatus }
  >();
  for (const d of lastTriggers ?? []) {
    if (!d.branch_id) continue;
    if (!lastByBranch.has(d.branch_id)) {
      lastByBranch.set(d.branch_id, {
        createdAt: d.created_at,
        status: d.status,
      });
    }
  }

  const branches: BranchRow[] = (branchRows ?? []).map((b) => {
    const last = lastByBranch.get(b.id);
    return {
      id: b.id,
      applicationId: b.application_id,
      name: b.name,
      environment: b.environment as Environment,
      webhookHint: b.webhook_hint,
      isEnabled: b.is_enabled,
      lastTriggerAt: last?.createdAt ?? null,
      lastTriggerStatus: last?.status ?? null,
    };
  });

  const { data: recent } = await supabase
    .from("deployments")
    .select(
      "id, application_id, branch_id, application_name, branch_name, environment, status, http_status, error_message, triggered_by, triggered_by_email, retry_of, created_at"
    )
    .eq("application_id", id)
    .order("created_at", { ascending: false })
    .limit(5);

  const deployments = (recent ?? []).map((row) => mapDeployment(row));

  return (
    <div className="space-y-6">
      <ApplicationHeader
        application={{
          id: app.id,
          name: app.name,
          description: app.description,
          branchCount: branches.length,
        }}
      />
      <BranchesTable
        applicationId={app.id}
        applicationName={app.name}
        branches={branches}
      />
      <ApplicationRecentDeployments
        applicationId={app.id}
        deployments={deployments}
      />
    </div>
  );
}
