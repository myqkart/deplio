"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { FilterIcon } from "@primer/octicons-react";
import type { Environment, TriggerStatus } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

type AppOption = { id: string; name: string };

type DeploymentsFiltersProps = {
  applications: AppOption[];
  applicationId: string | null;
  environment: Environment | null;
  status: TriggerStatus | null;
};

function FilterFields({
  applications,
  applicationId,
  environment,
  status,
  pending,
  update,
}: {
  applications: AppOption[];
  applicationId: string | null;
  environment: Environment | null;
  status: TriggerStatus | null;
  pending: boolean;
  update: (key: string, value: string | null) => void;
}) {
  return (
    <>
      <div className="space-y-2">
        <Label className="text-sm font-semibold text-foreground">
          Application
        </Label>
        <Select
          value={applicationId ?? "all"}
          onValueChange={(value) =>
            update("application", !value || value === "all" ? null : value)
          }
          disabled={pending}
        >
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All applications</SelectItem>
            {applications.map((app) => (
              <SelectItem key={app.id} value={app.id}>
                {app.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-semibold text-foreground">
          Environment
        </Label>
        <Select
          value={environment ?? "all"}
          onValueChange={(value) =>
            update(
              "environment",
              !value || value === "all" ? null : (value as Environment)
            )
          }
          disabled={pending}
        >
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All environments</SelectItem>
            <SelectItem value="development">Development</SelectItem>
            <SelectItem value="staging">Staging</SelectItem>
            <SelectItem value="production">Production</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-semibold text-foreground">Status</Label>
        <Select
          value={status ?? "all"}
          onValueChange={(value) =>
            update(
              "status",
              !value || value === "all" ? null : (value as TriggerStatus)
            )
          }
          disabled={pending}
        >
          <SelectTrigger className="w-full md:w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="triggered">Triggered</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );
}

export function DeploymentsFilters({
  applications,
  applicationId,
  environment,
  status,
}: DeploymentsFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const hasFilters = !!(applicationId || environment || status);
  const activeCount = [applicationId, environment, status].filter(Boolean)
    .length;

  function update(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (!value) params.delete(key);
    else params.set(key, value);
    params.delete("page");
    const qs = params.toString();
    startTransition(() => {
      router.push(qs ? `${pathname}?${qs}` : pathname);
    });
  }

  function clearFilters() {
    startTransition(() => {
      router.push(pathname);
      setOpen(false);
    });
  }

  return (
    <>
      {/* Mobile: single Filters button → sheet */}
      <div className="md:hidden">
        <Button
          variant="default"
          className="w-full justify-between"
          onClick={() => setOpen(true)}
        >
          <span className="inline-flex items-center gap-2">
            <FilterIcon size={16} />
            Filters
          </span>
          {activeCount > 0 ? (
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-[2em] bg-[rgba(110,118,129,0.4)] px-1.5 text-xs font-medium">
              {activeCount}
            </span>
          ) : null}
        </Button>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent
            side="bottom"
            className="max-h-[85dvh] rounded-t-xl border-border bg-popover p-0"
            showCloseButton
          >
            <SheetHeader className="border-b border-border p-4 text-left">
              <SheetTitle className="text-sm font-semibold">Filters</SheetTitle>
            </SheetHeader>
            <div className="space-y-4 overflow-y-auto p-4">
              <FilterFields
                applications={applications}
                applicationId={applicationId}
                environment={environment}
                status={status}
                pending={pending}
                update={update}
              />
            </div>
            <SheetFooter className="gap-2 border-t border-border p-4">
              {hasFilters ? (
                <Button
                  variant="ghost"
                  onClick={clearFilters}
                  disabled={pending}
                  className="w-full"
                >
                  Clear filters
                </Button>
              ) : null}
              <Button
                variant="primary"
                onClick={() => setOpen(false)}
                className="w-full"
              >
                Done
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop / tablet: inline filters */}
      <div className="hidden flex-row flex-wrap items-end gap-3 md:flex">
        <FilterFields
          applications={applications}
          applicationId={applicationId}
          environment={environment}
          status={status}
          pending={pending}
          update={update}
        />
        {hasFilters ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            disabled={pending}
          >
            Clear filters
          </Button>
        ) : null}
      </div>
    </>
  );
}
