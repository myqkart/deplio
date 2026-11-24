import { Suspense } from "react";
import { ApplicationsTable } from "@/components/applications/applications-table";
import { PageHeader } from "@/components/layout/page-header";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { createClient } from "@/lib/supabase/server";
import type { ApplicationRow } from "@/lib/types";

export const metadata = { title: "Applications" };

export default function ApplicationsPage() {
  return (
    <Suspense
      fallback={
        <>
          <PageHeader
            title="Applications"
            description="Applications and the branches you can deploy."
          />
          <TableSkeleton />
        </>
      }
    >
      <ApplicationsContent />
    </Suspense>
  );
}

async function ApplicationsContent() {
  const supabase = await createClient();

  const { data: apps, error: appsError } = await supabase
    .from("applications")
    .select("id, name, description, created_at")
    .order("name");

  if (appsError) {
    return <ApplicationsTable applications={[]} error={appsError.message} />;
  }

  const appIds = (apps ?? []).map((a) => a.id);

  const [{ data: branches }, { data: deployments }] = await Promise.all([
    appIds.length
      ? supabase.from("branches").select("application_id").in("application_id", appIds)
      : Promise.resolve({ data: [] as { application_id: string }[] }),
    appIds.length
      ? supabase
          .from("deployments")
          .select("application_id, created_at")
          .in("application_id", appIds)
          .order("created_at", { ascending: false })
      : Promise.resolve({
          data: [] as { application_id: string | null; created_at: string }[],
        }),
  ]);

  const branchCounts = new Map<string, number>();
  for (const b of branches ?? []) {
    branchCounts.set(
      b.application_id,
      (branchCounts.get(b.application_id) ?? 0) + 1
    );
  }

  const lastDeploy = new Map<string, string>();
  for (const d of deployments ?? []) {
    if (!d.application_id) continue;
    if (!lastDeploy.has(d.application_id)) {
      lastDeploy.set(d.application_id, d.created_at);
    }
  }

  const applications: ApplicationRow[] = (apps ?? []).map((app) => ({
    id: app.id,
    name: app.name,
    description: app.description,
    branchCount: branchCounts.get(app.id) ?? 0,
    lastDeploymentAt: lastDeploy.get(app.id) ?? null,
  }));

  return <ApplicationsTable applications={applications} />;
}
