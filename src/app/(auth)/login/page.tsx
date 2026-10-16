import type { Metadata } from "next";
import { Suspense } from "react";

import { AuthForm } from "../auth-form";

export const metadata: Metadata = { title: "Sign in" };

async function LoginForm({ searchParams }: { searchParams: PageProps<"/login">["searchParams"] }) {
  const { next } = await searchParams;
  return <AuthForm mode="login" next={typeof next === "string" ? next : undefined} />;
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
