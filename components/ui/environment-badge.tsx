import {
  ENVIRONMENT_LABELS,
  type Environment,
} from "@/lib/environments";
import { cn } from "@/lib/utils";

const config: Record<Environment, string> = {
  staging: "border-env-staging-border bg-env-staging-bg text-env-staging",
  uat: "border-env-uat-border bg-env-uat-bg text-env-uat",
  production: "border-env-prod-border bg-env-prod-bg text-env-prod",
};

export function EnvironmentBadge({ environment }: { environment: Environment }) {
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center rounded-[2em] border px-[7px] text-xs font-medium",
        config[environment]
      )}
    >
      {ENVIRONMENT_LABELS[environment]}
    </span>
  );
}
