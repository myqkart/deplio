import type { ReactNode } from "react";
import { MobileTopBar } from "@/components/layout/mobile-top-bar";
import { Sidebar } from "@/components/layout/sidebar";

type AppShellProps = {
  children: ReactNode;
  email?: string | null;
};

export function AppShell({ children, email }: AppShellProps) {
  return (
    <div className="min-h-dvh overflow-x-hidden bg-background">
      <Sidebar email={email} />
      <MobileTopBar email={email} />
      <main className="lg:pl-64">
        <div className="mx-auto w-full max-w-[1280px] px-4 py-4 pb-8 md:px-6 md:py-6 xl:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
