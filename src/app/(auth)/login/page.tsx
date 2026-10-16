import type { Metadata } from "next";
import { Suspense } from "react";

import { safeNext } from "@/lib/auth/safe-next";

import { AuthForm } from "../auth-form";

export const metadata: Metadata = { title: "Sign in" };

async function LoginForm({ searchParams }: { searchParams: PageProps<"/login">["searchParams"] }) {
  const { next } = await searchParams;
  // Sanitize here too so a hostile value never reaches the hidden input.
  return <AuthForm mode="login" next={typeof next === "string" ? safeNext(next) : undefined} />;
}

export default function LoginPage({ searchParams }: PageProps<"/login">) {
  return (
    <>
      <h1 className="text-2xl font-semibold">Welcome back</h1>
      <p className="mb-6 mt-1 text-sm text-muted">Your forest missed you.</p>
      <Suspense fallback={<div className="h-72" />}>
        <LoginForm searchParams={searchParams} />
      </Suspense>
    </>
  );
}
