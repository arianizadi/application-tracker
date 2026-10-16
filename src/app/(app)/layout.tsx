import { Suspense } from "react";

import { CelebrationProvider } from "@/components/fx/celebrate";
import { CelebrationWatcher } from "@/components/game/celebration-watcher";
import { AccountSync } from "@/components/shell/account-sync";
import { MobileNav, SideNav } from "@/components/shell/nav";
import { UserBadge } from "@/components/shell/user-badge";
import { PageSkeleton } from "@/components/ui/card";

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <CelebrationProvider>
      <div className="flex min-h-dvh px-safe">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-[60] focus:rounded-full focus:bg-card focus:px-4 focus:py-2 focus:text-sm focus:shadow-lift"
        >
          Skip to content
        </a>
        <SideNav
          footer={
            <Suspense fallback={<div className="h-10" />}>
              <UserBadge />
            </Suspense>
          }
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <MobileNav />
          <main id="main" data-enter className="mx-auto w-full max-w-6xl flex-1 px-4 pb-32 pt-6 sm:px-6 md:pb-12 md:pt-10 lg:px-10">
            <Suspense fallback={<PageSkeleton />}>{children}</Suspense>
            <Suspense fallback={null}><CelebrationWatcher /></Suspense>
            <Suspense fallback={null}><AccountSync /></Suspense>
          </main>
        </div>
      </div>
    </CelebrationProvider>
  );
}
