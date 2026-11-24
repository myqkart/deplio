"use client";

import { SignOutIcon } from "@primer/octicons-react";
import { signOut } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function SignOutButton() {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label="Sign out"
            onClick={() => void signOut()}
          />
        }
      >
        <SignOutIcon size={16} />
      </TooltipTrigger>
      <TooltipContent className="rounded-[6px] bg-[#6e7681] px-2 py-1 text-xs text-white">
        Sign out
      </TooltipContent>
    </Tooltip>
  );
}
