import { z } from "zod";

const AMPLIFY_HOST =
  /^webhooks\.amplify\.[a-z0-9-]+\.amazonaws\.com$/;

export const applicationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required.")
    .max(60, "Name must be 60 characters or fewer."),
  description: z
    .string()
    .trim()
    .max(200, "Description must be 200 characters or fewer.")
    .optional()
    .or(z.literal("")),
});

export const environmentSchema = z.enum(
  ["staging", "uat", "production"],
  { error: "Select an environment." }
);

export function validateWebhookUrl(url: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return "Enter a valid Amplify webhook URL (https://webhooks.amplify.<region>.amazonaws.com/…).";
  }

  if (parsed.protocol !== "https:") {
    return "Enter a valid Amplify webhook URL (https://webhooks.amplify.<region>.amazonaws.com/…).";
  }

  if (!AMPLIFY_HOST.test(parsed.hostname)) {
    return "Enter a valid Amplify webhook URL (https://webhooks.amplify.<region>.amazonaws.com/…).";
  }

  if (!parsed.searchParams.get("id") || !parsed.searchParams.get("token")) {
    return "Enter a valid Amplify webhook URL (https://webhooks.amplify.<region>.amazonaws.com/…).";
  }

  return null;
}

export function webhookHintFromUrl(url: string): string {
  const token = new URL(url).searchParams.get("token") ?? "";
  return token.slice(-6);
}

export const branchCreateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Branch name is required.")
    .max(100, "Branch name must be 100 characters or fewer."),
  environment: environmentSchema,
  webhookUrl: z.string().trim().min(1, "Webhook URL is required."),
  isEnabled: z.boolean().default(true),
});

export const branchUpdateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Branch name is required.")
    .max(100, "Branch name must be 100 characters or fewer."),
  environment: environmentSchema,
  webhookUrl: z.string().trim().optional().or(z.literal("")),
  isEnabled: z.boolean(),
});
