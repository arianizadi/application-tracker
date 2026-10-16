"use client";

import { useEffect } from "react";

import { useToast } from "@/components/ui/toast";
import { setDraftScope } from "@/hooks/use-autosave";
import { updatePreferences } from "@/lib/settings/actions";
import { DEFAULT_TIME_ZONE, timeZoneLabel } from "@/lib/settings/validation";

const TZ_DETECTED_PREFIX = "canopy:tz-autodetected:";

export function AccountSyncClient({ userId, timeZone }: { userId: string; timeZone: string }) {
  const toast = useToast();

  useEffect(() => {
    setDraftScope(userId);
    return () => setDraftScope(null);
  }, [userId]);

  // Accounts created before sign-up captured the browser zone (or whose browser
  // didn't report one) sit on the schema default. Adopt this device's zone once
  // per account per device, so a deliberate choice in Settings is never fought.
  useEffect(() => {
    if (timeZone !== DEFAULT_TIME_ZONE) return;
    let detected = "";
    try {
      detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
      return;
    }
    if (!detected || detected === timeZone) return;
    const flag = TZ_DETECTED_PREFIX + userId;
    try {
      if (localStorage.getItem(flag)) return;
      localStorage.setItem(flag, "1");
    } catch {
      return;
    }
    updatePreferences({ timeZone: detected })
      .then((res) => {
        if (res.ok) {
          toast({ tone: "info", title: `Time zone set to ${timeZoneLabel(detected)}`, body: "Matched to this device. Change it anytime in Settings." });
        }
      })
      .catch(() => {});
  }, [userId, timeZone, toast]);

  return null;
}
