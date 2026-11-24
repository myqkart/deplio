"use client";

import { useActionState, useState } from "react";
import { RocketIcon } from "@primer/octicons-react";
import { signIn, type SignInState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ErrorState } from "@/components/ui/error-state";

const initialState: SignInState = {};

export function LoginCard({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState(signIn, initialState);
  const [cleared, setCleared] = useState(false);
  const error = cleared ? undefined : state.error;

  return (
    <div className="w-full max-w-[400px] rounded-xl border border-border bg-popover shadow-[0_0_0_1px_#30363d,0_8px_24px_#010409]">
      <div className="flex items-center gap-2 border-b border-border px-4 py-4 sm:px-5">
        <RocketIcon size={24} className="text-foreground" />
        <span className="text-sm font-semibold">Deployment Manager</span>
      </div>
      <div className="px-4 py-5 sm:px-5 sm:py-6">
        <h1 className="text-xl font-semibold leading-[30px] text-foreground sm:text-sm sm:leading-5">
          Sign in
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Internal access only. Use your team account.
        </p>

        <form
          action={(formData) => {
            setCleared(false);
            formAction(formData);
          }}
          className="mt-6 space-y-5"
        >
          <input type="hidden" name="next" value={next} />
          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-sm font-semibold text-foreground"
            >
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              required
              disabled={pending}
              onChange={() => setCleared(true)}
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="text-sm font-semibold text-foreground"
            >
              Password
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              required
              disabled={pending}
              onChange={() => setCleared(true)}
            />
          </div>

          {error ? <ErrorState message={error} /> : null}

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            size="lg"
            disabled={pending}
          >
            {pending ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </div>
    </div>
  );
}
