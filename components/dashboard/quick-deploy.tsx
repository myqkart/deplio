"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { ServerIcon } from "@primer/octicons-react";
import type { QuickDeployApp } from "@/lib/types";
import { DeployButton } from "@/components/deploy/deploy-button";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const STORAGE_KEY = "deplio:last-application-id";

function subscribe(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  return () => window.removeEventListener("storage", onStoreChange);
}

function getStoredAppId() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

type QuickDeployProps = {
  applications: QuickDeployApp[];
};

export function QuickDeploy({ applications }: QuickDeployProps) {
  const storedAppId = useSyncExternalStore(
    subscribe,
    getStoredAppId,
    () => null
  );

  const [appOverride, setAppOverride] = useState<string | null | undefined>(
    undefined
  );
  const [branchOverride, setBranchOverride] = useState<
    string | null | undefined
  >(undefined);

  const defaultAppId = useMemo(() => {
    if (storedAppId && applications.some((a) => a.id === storedAppId)) {
      return storedAppId;
    }
    if (applications.length === 1) return applications[0].id;
    return null;
  }, [applications, storedAppId]);

  const applicationId =
    appOverride !== undefined ? appOverride : defaultAppId;

  const selectedApp = useMemo(
    () => applications.find((a) => a.id === applicationId) ?? null,
    [applications, applicationId]
  );

  const branches = selectedApp?.branches ?? [];
  const enabledBranches = branches.filter((b) => b.isEnabled);
  const defaultBranchId =
    enabledBranches.length === 1 ? enabledBranches[0].id : null;
  const branchId =
    branchOverride !== undefined ? branchOverride : defaultBranchId;

  const selectedBranch =
    branches.find((b) => b.id === branchId && b.isEnabled) ?? null;

  function selectApplication(value: string | null) {
    setAppOverride(value);
    setBranchOverride(undefined);
    if (value) {
      try {
        localStorage.setItem(STORAGE_KEY, value);
      } catch {
        // ignore
      }
    }
  }

  if (applications.length === 0) {
    return (
      <section className="overflow-hidden rounded-[6px] border border-border bg-background">
        <div className="border-b border-border bg-canvas-subtle px-4 py-2">
          <h2 className="text-sm font-semibold leading-[21px]">Quick deploy</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Select an application and branch, then trigger a deployment.
          </p>
        </div>
        <EmptyState
          icon={ServerIcon}
          title="No applications yet"
          description="Add an application and its branches to start triggering deployments."
          action={
            <Button variant="primary" render={<Link href="/applications" />}>
              Add application
            </Button>
          }
        />
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-[6px] border border-border bg-background">
      <div className="border-b border-border bg-canvas-subtle px-4 py-2">
        <h2 className="text-sm font-semibold leading-[21px]">Quick deploy</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Select an application and branch, then trigger a deployment.
        </p>
      </div>

      <div className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1 space-y-2">
            <Label className="text-sm font-semibold text-foreground">
              Application
            </Label>
            <Select
              value={applicationId}
              onValueChange={(value) => selectApplication(value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select application" />
              </SelectTrigger>
              <SelectContent>
                {applications.map((app) => (
                  <SelectItem key={app.id} value={app.id}>
                    {app.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="min-w-0 flex-1 space-y-2">
            <Label className="text-sm font-semibold text-foreground">
              Branch
            </Label>
            <Select
              value={branchId}
              onValueChange={setBranchOverride}
              disabled={!selectedApp}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select branch" />
              </SelectTrigger>
              <SelectContent>
                {branches.map((branch) => (
                  <SelectItem
                    key={branch.id}
                    value={branch.id}
                    disabled={!branch.isEnabled}
                  >
                    {branch.isEnabled
                      ? branch.name
                      : `${branch.name} — disabled`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedApp && enabledBranches.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No enabled branches for this application.
              </p>
            ) : null}
          </div>

          <div className="w-full sm:w-auto">
            {selectedBranch && selectedApp ? (
              <DeployButton
                branchId={selectedBranch.id}
                applicationName={selectedApp.name}
                branchName={selectedBranch.name}
                environment={selectedBranch.environment}
                className="w-full sm:w-auto"
              />
            ) : (
              <DeployButton
                branchId=""
                applicationName=""
                branchName=""
                environment="development"
                disabled
                disabledReason={
                  selectedApp && enabledBranches.length === 0
                    ? "No enabled branches for this application."
                    : "Select an application and branch."
                }
                className="w-full sm:w-auto"
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
