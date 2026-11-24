import type { Environment } from "@/lib/types";
import { cn } from "@/lib/utils";

const config: Record<
  Environment,
  { label: string; className: string }
> = {
  development: {
    label: "Development",
    className: "border-env-dev-border bg-env-dev-bg text-env-dev",
  },
  staging: {
    label: "Staging",
    className: "border-env-staging-border bg-env-staging-bg text-env-staging",
  },
  production: {
    label: "Production",
    className: "border-env-prod-border bg-env-prod-bg text-env-prod",
  },
};

export function EnvironmentBadge({ environment }: { environment: Environment }) {
  const item = config[environment];
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center rounded-[2em] border px-[7px] text-xs font-medium",
        item.className
      )}
    >
      {item.label}
    </span>
  );
}
