"use client";

import { useRouter } from "next/navigation";
import { useMemo, useRef } from "react";

import { QuickAdd } from "@/components/applications/quick-add";
import { useCelebrate } from "@/components/fx";
import { useHotkeys } from "@/hooks/use-hotkeys";

/**
 * The applications quick-add, on the home page. The Server Action invalidates
 * the user's cache tags, so the forest above re-renders with the new tree.
 */
export function HomeQuickAdd() {
  const companyRef = useRef<HTMLInputElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { celebrate } = useCelebrate();

  const keys = useMemo(
    () => ({
      n: () => router.push("/applications/new"),
      "/": () => router.push("/applications"),
    }),
    [router],
  );
  useHotkeys(keys);

  return (
    <div ref={wrapRef} id="quick-add">
      <QuickAdd
        companyRef={companyRef}
        onOptimisticAdd={() => {}}
        onAdded={(item) => {
          // The toast already says it in words; this is just the leaves.
          if (item.status !== "WISHLIST") celebrate("plant", { quiet: true, origin: wrapRef.current ?? undefined });
        }}
      />
    </div>
  );
}
