import type { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  description?: string;
  breadcrumb?: ReactNode;
  action?: ReactNode;
};

export function PageHeader({
  title,
  description,
  breadcrumb,
  action,
}: PageHeaderProps) {
  return (
    <div className="mb-4">
      {breadcrumb ? <div className="mb-2 text-sm">{breadcrumb}</div> : null}
      <div className="flex flex-col gap-3 border-b border-border-muted pb-3 sm:flex-row sm:items-center sm:justify-between sm:pb-2">
        <h1 className="text-2xl leading-[30px] font-normal text-foreground">
          {title}
        </h1>
        {action ? (
          <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row sm:items-center [&_button]:w-full sm:[&_button]:w-auto">
            {action}
          </div>
        ) : null}
      </div>
      {description ? (
        <p className="mt-2 text-sm leading-[21px] text-muted-foreground">
          {description}
        </p>
      ) : null}
    </div>
  );
}
