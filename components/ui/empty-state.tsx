import type { Icon } from "@primer/octicons-react";
import type { ReactNode } from "react";

type EmptyStateProps = {
  icon: Icon;
  title: string;
  description: string;
  action?: ReactNode;
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
      <Icon size={24} className="mb-3 text-muted-foreground" />
      <h3 className="text-xl font-semibold text-foreground">{title}</h3>
      <p className="mt-2 max-w-[360px] text-sm leading-[21px] text-muted-foreground">
        {description}
      </p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
