import { Suspense } from "react";
import { LoginCard } from "@/components/auth/login-card";

export const metadata = { title: "Sign in" };

function safeNextPath(next: string | undefined): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/";
  }
  return next;
}

async function LoginContent({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const next = safeNextPath(params.next);
  return <LoginCard next={next} />;
}

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4 py-8">
      <Suspense
        fallback={
          <div className="h-72 w-full max-w-[400px] rounded-xl border border-border bg-popover" />
        }
      >
        <LoginContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
