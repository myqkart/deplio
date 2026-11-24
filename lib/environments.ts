export const ENVIRONMENTS = ["staging", "uat", "production"] as const;

export type Environment = (typeof ENVIRONMENTS)[number];

export const ENVIRONMENT_LABELS: Record<Environment, string> = {
  staging: "Staging",
  uat: "UAT",
  production: "Production",
};

export function isEnvironment(value: string): value is Environment {
  return (ENVIRONMENTS as readonly string[]).includes(value);
}
