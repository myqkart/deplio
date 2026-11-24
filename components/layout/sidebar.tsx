import { Suspense } from "react";
import { RocketIcon } from "@primer/octicons-react";
import { NavItems } from "@/components/layout/nav-items";
import { SignOutButton } from "@/components/layout/sign-out-button";

type SidebarProps = {
  email?: string | null;
};

export function Sidebar({ email }: SidebarProps) {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-border-muted bg-background lg:flex">
      <div className="flex items-center gap-2 px-4 py-4">
        <RocketIcon size={24} className="text-foreground" />
        <span className="text-sm font-semibold text-foreground">
          Deployment Manager
        </span>
      </div>
      <div className="flex-1 overflow-y-auto py-1">
        <Suspense fallback={null}>
          <NavItems />
        </Suspense>
      </div>
      <div className="flex items-center gap-2 border-t border-border-muted px-3 py-3">
        <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
          {email ?? "Signed in"}
        </span>
        <SignOutButton />
      </div>
    </aside>
  );
}
