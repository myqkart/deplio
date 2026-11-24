"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/get-user";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  branchCreateSchema,
  branchUpdateSchema,
  validateWebhookUrl,
  webhookHintFromUrl,
} from "@/lib/validation";
import type { ActionResult } from "@/lib/actions/applications";

function revalidateApp(applicationId: string) {
  revalidatePath("/");
  revalidatePath("/applications");
  revalidatePath(`/applications/${applicationId}`);
  revalidatePath("/deployments");
}

export async function createBranch(
  applicationId: string,
  input: {
    name: string;
    environment: string;
    webhookUrl: string;
    isEnabled?: boolean;
  }
): Promise<ActionResult> {
  await requireUser();
  const parsed = branchCreateSchema.safeParse({
    ...input,
    isEnabled: input.isEnabled ?? true,
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "name");
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { ok: false, error: "Couldn't save the branch. Try again.", fieldErrors };
  }

  const webhookError = validateWebhookUrl(parsed.data.webhookUrl);
  if (webhookError) {
    return {
      ok: false,
      error: "Couldn't save the branch. Try again.",
      fieldErrors: { webhookUrl: webhookError },
    };
  }

  const supabase = await createClient();
  const hint = webhookHintFromUrl(parsed.data.webhookUrl);

  const { data: branch, error } = await supabase
    .from("branches")
    .insert({
      application_id: applicationId,
      name: parsed.data.name,
      environment: parsed.data.environment,
      webhook_hint: hint,
      is_enabled: parsed.data.isEnabled,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      return {
        ok: false,
        error: `A branch named "${parsed.data.name}" already exists in this application.`,
        fieldErrors: {
          name: `A branch named "${parsed.data.name}" already exists in this application.`,
        },
      };
    }
    return { ok: false, error: "Couldn't save the branch. Try again." };
  }

  try {
    const admin = createAdminClient();
    const { error: webhookInsertError } = await admin
      .from("branch_webhooks")
      .insert({
        branch_id: branch.id,
        webhook_url: parsed.data.webhookUrl,
      });

    if (webhookInsertError) {
      await supabase.from("branches").delete().eq("id", branch.id);
      return { ok: false, error: "Couldn't save the branch. Try again." };
    }
  } catch {
    await supabase.from("branches").delete().eq("id", branch.id);
    return { ok: false, error: "Couldn't save the branch. Try again." };
  }

  revalidateApp(applicationId);
  return { ok: true };
}

export async function updateBranch(
  branchId: string,
  applicationId: string,
  input: {
    name: string;
    environment: string;
    webhookUrl?: string;
    isEnabled: boolean;
  }
): Promise<ActionResult> {
  await requireUser();
  const parsed = branchUpdateSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "name");
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { ok: false, error: "Couldn't save the branch. Try again.", fieldErrors };
  }

  const webhookUrl = parsed.data.webhookUrl?.trim() ?? "";
  let hint: string | undefined;
  if (webhookUrl) {
    const webhookError = validateWebhookUrl(webhookUrl);
    if (webhookError) {
      return {
        ok: false,
        error: "Couldn't save the branch. Try again.",
        fieldErrors: { webhookUrl: webhookError },
      };
    }
    hint = webhookHintFromUrl(webhookUrl);
  }

  const supabase = await createClient();
  const updatePayload: {
    name: string;
    environment: string;
    is_enabled: boolean;
    webhook_hint?: string;
  } = {
    name: parsed.data.name,
    environment: parsed.data.environment,
    is_enabled: parsed.data.isEnabled,
  };
  if (hint) updatePayload.webhook_hint = hint;

  const { error } = await supabase
    .from("branches")
    .update(updatePayload)
    .eq("id", branchId);

  if (error) {
    if (error.code === "23505") {
      return {
        ok: false,
        error: `A branch named "${parsed.data.name}" already exists in this application.`,
        fieldErrors: {
          name: `A branch named "${parsed.data.name}" already exists in this application.`,
        },
      };
    }
    return { ok: false, error: "Couldn't save the branch. Try again." };
  }

  if (webhookUrl) {
    try {
      const admin = createAdminClient();
      const { error: webhookError } = await admin.from("branch_webhooks").upsert({
        branch_id: branchId,
        webhook_url: webhookUrl,
      });
      if (webhookError) {
        return { ok: false, error: "Couldn't save the branch. Try again." };
      }
    } catch {
      return { ok: false, error: "Couldn't save the branch. Try again." };
    }
  }

  revalidateApp(applicationId);
  return { ok: true };
}

export async function updateBranchEnabled(
  branchId: string,
  applicationId: string,
  isEnabled: boolean
): Promise<ActionResult> {
  await requireUser();
  const supabase = await createClient();
  const { error } = await supabase
    .from("branches")
    .update({ is_enabled: isEnabled })
    .eq("id", branchId);

  if (error) {
    return { ok: false, error: "Couldn't update branch. Reverted." };
  }

  revalidateApp(applicationId);
  return { ok: true };
}

export async function deleteBranch(
  branchId: string,
  applicationId: string
): Promise<ActionResult> {
  await requireUser();
  const supabase = await createClient();
  const { error } = await supabase.from("branches").delete().eq("id", branchId);

  if (error) {
    return { ok: false, error: "Couldn't delete the branch. Try again." };
  }

  revalidateApp(applicationId);
  return { ok: true };
}
