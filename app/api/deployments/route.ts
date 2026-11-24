import { NextResponse } from "next/server";
import { triggerAmplifyWebhook } from "@/lib/amplify/trigger";
import { isWithinCooldown } from "@/lib/deployments/cooldown";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 15;

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  let body: { branchId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad_body" }, { status: 400 });
  }

  const branchId = body.branchId;
  if (!branchId || typeof branchId !== "string") {
    return NextResponse.json({ error: "bad_body" }, { status: 400 });
  }

  const { data: branch, error: branchError } = await supabase
    .from("branches")
    .select(
      "id, name, environment, is_enabled, application_id, applications(id, name)"
    )
    .eq("id", branchId)
    .maybeSingle();

  if (branchError || !branch) {
    return NextResponse.json({ error: "missing" }, { status: 404 });
  }

  if (!branch.is_enabled) {
    return NextResponse.json({ error: "disabled" }, { status: 409 });
  }

  const application = Array.isArray(branch.applications)
    ? branch.applications[0]
    : branch.applications;

  if (!application) {
    return NextResponse.json({ error: "missing" }, { status: 404 });
  }

  const { data: last } = await supabase
    .from("deployments")
    .select("created_at")
    .eq("branch_id", branchId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (isWithinCooldown(last?.created_at)) {
    return NextResponse.json({ error: "cooldown" }, { status: 429 });
  }

  const admin = createAdminClient();
  const { data: webhookRow, error: webhookError } = await admin
    .from("branch_webhooks")
    .select("webhook_url")
    .eq("branch_id", branchId)
    .maybeSingle();

  if (webhookError || !webhookRow?.webhook_url) {
    return NextResponse.json({ error: "missing" }, { status: 404 });
  }

  const outcome = await triggerAmplifyWebhook(webhookRow.webhook_url);

  const { data: deployment, error: insertError } = await admin
    .from("deployments")
    .insert({
      application_id: application.id,
      branch_id: branch.id,
      application_name: application.name,
      branch_name: branch.name,
      environment: branch.environment,
      status: outcome.status,
      http_status: outcome.status === "triggered" ? outcome.httpStatus : outcome.httpStatus,
      error_message: outcome.status === "failed" ? outcome.errorMessage : null,
      triggered_by: user.id,
      triggered_by_email: user.email ?? null,
      amplify_job_id: outcome.status === "triggered" ? outcome.amplifyJobId : null,
      build_status: null,
    })
    .select(
      "id, application_id, branch_id, application_name, branch_name, environment, status, http_status, error_message, triggered_by, triggered_by_email, retry_of, created_at, amplify_job_id, build_status"
    )
    .single();

  if (insertError || !deployment) {
    return NextResponse.json({ error: "unexpected" }, { status: 500 });
  }

  return NextResponse.json({ deployment });
}
