import type { Metadata } from "next";

import { AuthForm } from "../auth-form";

export const metadata: Metadata = { title: "Create your account" };

export default function SignupPage() {
  return (
    <>
      <h1 className="text-2xl font-semibold">Start your forest</h1>
      <p className="mb-6 mt-1 text-sm text-muted">Every application plants something. Free, private, no spam.</p>
      <AuthForm mode="signup" />
    </>
  );
}
