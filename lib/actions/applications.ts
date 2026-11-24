"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/get-user";
import { createClient } from "@/lib/supabase/server";
import { applicationSchema } from "@/lib/validation";

export type ActionResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

export async function createApplication(input: {
  name: string;
  description?: string;
}): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = applicationSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "name");
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { ok: false, error: "Couldn't save the application. Try again.", fieldErrors };
  }

  const supabase = await createClient();
  const description = parsed.data.description?.trim() || null;

  const { error } = await supabase.from("applications").insert({
    name: parsed.data.name,
    description,
    created_by: user.id,
  });

  if (error) {
    if (error.code === "23505") {
      return {
        ok: false,
        error: `An application named "${parsed.data.name}" already exists.`,
        fieldErrors: {
          name: `An application named "${parsed.data.name}" already exists.`,
        },
      };
    }
    return { ok: false, error: "Couldn't save the application. Try again." };
  }

  revalidatePath("/");
  revalidatePath("/applications");
  return { ok: true };
}

export async function updateApplication(
  id: string,
  input: { name: string; description?: string }
): Promise<ActionResult> {
  await requireUser();
  const parsed = applicationSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "name");
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { ok: false, error: "Couldn't save the application. Try again.", fieldErrors };
  }

  const supabase = await createClient();
  const description = parsed.data.description?.trim() || null;

  const { error } = await supabase
    .from("applications")
    .update({ name: parsed.data.name, description })
    .eq("id", id);

  if (error) {
    if (error.code === "23505") {
      return {
        ok: false,
        error: `An application named "${parsed.data.name}" already exists.`,
        fieldErrors: {
          name: `An application named "${parsed.data.name}" already exists.`,
        },
      };
    }
    return { ok: false, error: "Couldn't save the application. Try again." };
  }

  revalidatePath("/");
  revalidatePath("/applications");
  revalidatePath(`/applications/${id}`);
  return { ok: true };
}

export async function deleteApplication(id: string): Promise<ActionResult> {
  await requireUser();
  const supabase = await createClient();
  const { error } = await supabase.from("applications").delete().eq("id", id);

  if (error) {
    return { ok: false, error: "Couldn't delete the application. Try again." };
  }

  revalidatePath("/");
  revalidatePath("/applications");
  revalidatePath("/deployments");
  return { ok: true };
}
