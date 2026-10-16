import { getCurrentUser } from "@/lib/auth/dal";

import { SignOutForm } from "./sign-out-form";

/** Signed-in user's name with a sign-out button. Render inside <Suspense>. */
export async function UserBadge() {
  const user = await getCurrentUser();
  if (!user) return null;
  return (
    <div className="flex items-center justify-between gap-2 px-2">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{user.name}</p>
        <p className="truncate text-xs text-muted">{user.email}</p>
      </div>
      <SignOutForm className="shrink-0" />
    </div>
  );
}
