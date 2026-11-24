"use client";

import { Suspense, useState } from "react";
import { RocketIcon, ThreeBarsIcon } from "@primer/octicons-react";
import { NavItems } from "@/components/layout/nav-items";
import { SignOutButton } from "@/components/layout/sign-out-button";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

type MobileTopBarProps = {
  email?: string | null;
};

export function MobileTopBar({ email }: MobileTopBarProps) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border bg-canvas-subtle px-3 lg:hidden">
      <Button
        variant="ghost"
        size="icon"
        aria-label="Open navigation"
        onClick={() => setOpen(true)}
      >
        <ThreeBarsIcon size={16} />
      </Button>
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <RocketIcon size={16} className="shrink-0 text-foreground" />
        <span className="truncate text-sm font-semibold">
          Deployment Manager
        </span>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="left"
          className="flex w-[min(280px,85vw)] flex-col border-border bg-popover p-0"
          showCloseButton
        >
          <SheetHeader className="border-b border-border px-4 py-4 text-left">
            <SheetTitle className="flex items-center gap-2 text-sm font-semibold">
              <RocketIcon size={16} />
              Deployment Manager
            </SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto py-3">
            <Suspense fallback={null}>
              <NavItems onNavigate={() => setOpen(false)} />
            </Suspense>
          </div>
          <div className="flex items-center gap-2 border-t border-border px-3 py-3">
            <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
              {email ?? "Signed in"}
            </span>
            <SignOutButton />
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
