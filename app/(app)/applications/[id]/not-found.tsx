import Link from "next/link";
import { ServerIcon } from "@primer/octicons-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function ApplicationNotFound() {
  return (
    <div className="overflow-hidden rounded-[6px] border border-border bg-background">
      <EmptyState
        icon={ServerIcon}
        title="Application not found"
        description="It may have been deleted."
        action={
          <Button render={<Link href="/applications" />} variant="default">
            Back to applications
          </Button>
        }
      />
    </div>
  );
}
