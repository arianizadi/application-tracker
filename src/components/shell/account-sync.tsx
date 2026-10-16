import { getCurrentUser } from "@/lib/auth/dal";

import { AccountSyncClient } from "./account-sync-client";

/**
 * Hands the signed-in account to the client: scopes autosaved drafts to this
 * user and adopts the device time zone for accounts still on the default.
 * Mount inside <Suspense fallback={null}> in the authed layout.
 */
export async function AccountSync() {
  const user = await getCurrentUser();
  if (!user) return null;
  return <AccountSyncClient userId={user.id} timeZone={user.timeZone} />;
}
