import Link from "next/link";
import { Button } from "@/components/ui/button";

type DeploymentsPaginationProps = {
  page: number;
  hasNext: boolean;
  baseParams: URLSearchParams;
};

export function DeploymentsPagination({
  page,
  hasNext,
  baseParams,
}: DeploymentsPaginationProps) {
  if (page <= 1 && !hasNext) return null;

  function hrefFor(target: number) {
    const params = new URLSearchParams(baseParams.toString());
    if (target <= 1) params.delete("page");
    else params.set("page", String(target));
    const qs = params.toString();
    return qs ? `/deployments?${qs}` : "/deployments";
  }

  return (
    <div className="flex items-center gap-3">
      {page > 1 ? (
        <Button
          variant="default"
          className="flex-1 sm:flex-none"
          render={<Link href={hrefFor(page - 1)} />}
        >
          Previous
        </Button>
      ) : (
        <Button variant="default" className="flex-1 sm:flex-none" disabled>
          Previous
        </Button>
      )}
      <span className="shrink-0 text-sm tabular-nums text-muted-foreground">
        Page {page}
      </span>
      {hasNext ? (
        <Button
          variant="default"
          className="flex-1 sm:flex-none"
          render={<Link href={hrefFor(page + 1)} />}
        >
          Next
        </Button>
      ) : (
        <Button variant="default" className="flex-1 sm:flex-none" disabled>
          Next
        </Button>
      )}
    </div>
  );
}
