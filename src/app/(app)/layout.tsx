import { Suspense } from "react";

import { MobileNav, SideNav } from "@/components/shell/nav";
import { UserBadge } from "@/components/shell/user-badge";
import { PageSkeleton } from "@/components/ui/card";

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-dvh">
      <SideNav
        footer={
          <Suspense fallback={<div className="h-10" />}>
            <UserBadge />
          </Suspense>
        }
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileNav />
        <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 pb-32 pt-6 sm:px-6 md:pb-12 md:pt-10 lg:px-10">
          <Suspense fallback={<PageSkeleton />}>{children}</Suspense>
        </main>
      </div>
    </div>
  );
}
