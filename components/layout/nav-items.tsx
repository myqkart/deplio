"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HistoryIcon,
  HomeIcon,
  ServerIcon,
} from "@primer/octicons-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "Dashboard", icon: HomeIcon },
  { href: "/applications", label: "Applications", icon: ServerIcon },
  { href: "/deployments", label: "Deployments", icon: HistoryIcon },
] as const;

export function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 px-2">
      {items.map(({ href, label, icon: Icon }) => {
        const active =
          href === "/"
            ? pathname === "/"
            : pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={cn(
              "relative flex min-h-11 items-center gap-2 rounded-[6px] px-3 py-2.5 text-sm transition-[color,background-color] duration-[80ms] ease-[cubic-bezier(0.33,1,0.68,1)] md:min-h-0 md:px-2 md:py-1.5",
              active
                ? "bg-control-hover font-semibold text-foreground"
                : "font-normal text-foreground hover:bg-control-hover"
            )}
          >
            {active ? (
              <span
                className="absolute top-2 bottom-2 -left-2 w-1 rounded-[6px] bg-nav-active md:top-2 md:bottom-2"
                aria-hidden
              />
            ) : null}
            <Icon
              size={16}
              className={active ? "text-foreground" : "text-muted-foreground"}
            />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
