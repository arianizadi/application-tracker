import type { ApplicationStatus } from "@prisma/client";

import type { CelebrateApi } from "@/components/fx";
import { STATUS_TOAST } from "@/lib/applications/copy";

/**
 * Plays the mascot/particle moment for a successful status change.
 * Returns true when the celebration replaces the toast (rejections get the
 * rain-then-rainbow overlay, which carries its own words).
 */
export function celebrateStatus(
  celebrate: CelebrateApi["celebrate"],
  status: ApplicationStatus,
  options: { company?: string; origin?: Element | null } = {},
): boolean {
  const origin = options.origin ?? undefined;
  switch (status) {
    case "INTERVIEW":
      celebrate("interview", { quiet: true, origin });
      return false;
    case "OFFER":
    case "ACCEPTED":
      celebrate("offer", { quiet: true, origin });
      return false;
    case "REJECTED": {
      const copy = STATUS_TOAST.REJECTED;
      celebrate("reject", {
        title: options.company ? `${options.company}: ${copy.title.toLowerCase()}` : copy.title,
        body: copy.body,
      });
      return true;
    }
    default:
      return false;
  }
}
