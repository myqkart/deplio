import type { Environment } from "@/lib/environments";

export type { Environment };
export type TriggerStatus = "triggered" | "failed";

export type ApplicationRow = {
  id: string;
  name: string;
  description: string | null;
  branchCount: number;
  lastDeploymentAt: string | null;
};

export type BranchRow = {
  id: string;
  applicationId: string;
  name: string;
  environment: Environment;
  webhookHint: string;
  isEnabled: boolean;
  lastTriggerAt: string | null;
  lastTriggerStatus: TriggerStatus | null;
};

export type DeploymentRow = {
  id: string;
  applicationId: string | null;
  branchId: string | null;
  applicationName: string;
  branchName: string;
  environment: Environment;
  status: TriggerStatus;
  httpStatus: number | null;
  errorMessage: string | null;
  triggeredBy: string | null;
  triggeredByEmail: string | null;
  retryOf: string | null;
  createdAt: string;
  branchExists?: boolean;
  branchEnabled?: boolean;
};

export type QuickDeployApp = {
  id: string;
  name: string;
  branches: {
    id: string;
    name: string;
    environment: Environment;
    isEnabled: boolean;
  }[];
};
