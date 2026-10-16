import { logout } from "@/lib/auth/actions";
import { getCurrentUser } from "@/lib/auth/dal";

/** Signed-in user's name with a sign-out button. Render inside <Suspense>. */
export async function UserBadge() {
  const user = await getCurrentUser();
  if (!user) return null;
  return (
    <div className="flex items-center justify-between gap-2 px-2">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">{user.name}</p>
        <p className="truncate text-xs text-muted">{user.email}</p>
      </div>
      <form action={logout}>
        <button type="submit" className="rounded-lg px-2 py-1 text-xs text-muted hover:bg-card hover:text-ink">
          Sign out
        </button>
      </form>
    </div>
  );
}
