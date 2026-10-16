import Link from "next/link";

import { Logo } from "@/components/shell/logo";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="grain flex min-h-dvh flex-col items-center justify-center px-4 py-10">
      <Link href="/" className="mb-8 flex items-center gap-3">
        <Logo className="size-10" />
        <span className="font-display text-2xl font-semibold">Canopy</span>
      </Link>
      <div className="w-full max-w-sm rounded-3xl border border-line bg-card p-6 shadow-lift sm:p-8">{children}</div>
      <p className="mt-6 max-w-xs text-center text-xs text-muted">
        Your data is private to your account. Passwords are hashed with scrypt and never stored in plain text.
      </p>
    </div>
  );
}
