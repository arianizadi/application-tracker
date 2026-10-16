"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { ThemeToggle } from "@/components/theme";

import { Icon } from "./icon";
import { Logo } from "./logo";
import { NAV } from "./nav-items";

function isActive(pathname: string | null, href: string) {
  if (!pathname) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}

/*
 * Under Cache Components, usePathname() suspends while prerendering routes with
 * unknown dynamic params (e.g. /applications/[id]). Each nav renders a
 * pathname-less copy as its Suspense fallback so the shell still prerenders,
 * then the live version highlights the active item.
 */

export function SideNav({ footer }: { footer?: React.ReactNode }) {
  return (
    <Suspense fallback={<SideNavView pathname={null} footer={footer} />}>
      <LiveSideNav footer={footer} />
    </Suspense>
  );
}

function LiveSideNav({ footer }: { footer?: React.ReactNode }) {
  return <SideNavView pathname={usePathname()} footer={footer} />;
}

function SideNavView({ footer, pathname }: { footer?: React.ReactNode; pathname: string | null }) {
  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-line bg-paper-2/60 px-4 py-6 md:flex">
      <Link href="/home" className="mb-8 flex items-center gap-3 px-2">
        <Logo />
        <span className="font-display text-xl font-semibold">Canopy</span>
      </Link>
      <Link
        href="/applications/new"
        className="mb-6 flex h-11 items-center justify-center gap-2 rounded-full bg-moss text-sm font-medium text-paper shadow-soft transition-colors hover:bg-moss-strong"
      >
        <Icon name="plus" className="size-4" /> Plant an application
      </Link>
      <nav aria-label="Main" className="flex flex-1 flex-col gap-1">
        {NAV.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                active ? "bg-card text-ink shadow-soft" : "text-ink-soft hover:bg-card/60 hover:text-ink"
              }`}
            >
              <Icon name={item.icon} className={`size-5 ${active ? "text-moss" : ""}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="flex flex-col gap-4 border-t border-line pt-4">
        {footer}
        <ThemeToggle className="self-start" />
      </div>
    </aside>
  );
}

export function MobileNav() {
  return (
    <Suspense fallback={<MobileNavView pathname={null} />}>
      <LiveMobileNav />
    </Suspense>
  );
}

function LiveMobileNav() {
  return <MobileNavView pathname={usePathname()} />;
}

function MobileNavView({ pathname }: { pathname: string | null }) {
  const [moreOpen, setMoreOpen] = useState(false);
  const primary = NAV.filter((n) => n.mobile);
  const secondary = NAV.filter((n) => !n.mobile);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- close the sheet after navigating
    setMoreOpen(false);
  }, [pathname]);

  return (
    <>
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-line bg-paper/85 px-4 backdrop-blur-md md:hidden">
        <Link href="/home" className="flex items-center gap-2">
          <Logo className="size-8" />
          <span className="font-display text-lg font-semibold">Canopy</span>
        </Link>
        <ThemeToggle />
      </header>

      {moreOpen ? (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setMoreOpen(false)}>
          <div className="absolute inset-0 animate-fade bg-night/30 backdrop-blur-[2px]" />
          <nav
            aria-label="More"
            onClick={(e) => e.stopPropagation()}
            className="absolute inset-x-3 bottom-24 animate-rise rounded-3xl border border-line bg-card p-2 shadow-lift"
          >
            {secondary.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(pathname, item.href) ? "page" : undefined}
                className="flex items-center gap-3 rounded-2xl px-4 py-3.5 text-[15px] font-medium text-ink-soft aria-[current=page]:bg-paper-2 aria-[current=page]:text-ink"
              >
                <Icon name={item.icon} /> {item.label}
              </Link>
            ))}
          </nav>
        </div>
      ) : null}

      <nav
        aria-label="Main"
        className="pb-safe fixed inset-x-0 bottom-0 z-50 border-t border-line bg-card/95 px-2 pt-2 backdrop-blur-md md:hidden"
      >
        <ul className="mx-auto grid max-w-md grid-cols-5 items-end">
          {primary.slice(0, 2).map((item) => (
            <MobileTab key={item.href} href={item.href} label={item.label === "Applications" ? "Apps" : item.label} icon={item.icon} active={isActive(pathname, item.href)} />
          ))}
          <li className="flex justify-center">
            <Link
              href="/applications/new"
              aria-label="Plant an application"
              className="-mt-6 flex size-14 items-center justify-center rounded-full bg-moss text-paper shadow-lift ring-4 ring-paper transition-transform active:scale-95"
            >
              <Icon name="plus" className="size-6" />
            </Link>
          </li>
          {primary.slice(2).map((item) => (
            <MobileTab key={item.href} href={item.href} label="Prep" icon={item.icon} active={isActive(pathname, item.href)} />
          ))}
          <li>
            <button
              type="button"
              onClick={() => setMoreOpen((o) => !o)}
              aria-expanded={moreOpen}
              className={`flex w-full flex-col items-center gap-1 rounded-xl py-1.5 text-[11px] font-medium ${
                moreOpen || secondary.some((s) => isActive(pathname, s.href)) ? "text-moss" : "text-muted"
              }`}
            >
              <Icon name="more" />
              More
            </button>
          </li>
        </ul>
      </nav>
    </>
  );
}

function MobileTab({ href, label, icon, active }: { href: string; label: string; icon: Parameters<typeof Icon>[0]["name"]; active: boolean }) {
  return (
    <li>
      <Link
        href={href}
        aria-current={active ? "page" : undefined}
        className={`flex flex-col items-center gap-1 rounded-xl py-1.5 text-[11px] font-medium ${active ? "text-moss" : "text-muted"}`}
      >
        <Icon name={icon} />
        {label}
      </Link>
    </li>
  );
}
