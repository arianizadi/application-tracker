"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";

import { ThemeToggle } from "@/components/theme";
import { clearAllDrafts } from "@/hooks/use-autosave";
import { logout } from "@/lib/auth/actions";

import { Icon } from "./icon";
import { Logo } from "./logo";
import { HELP_ITEM, NAV } from "./nav-items";

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
  const activeIndex = NAV.findIndex((item) => isActive(pathname, item.href));
  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-line bg-paper-2/60 px-4 py-6 md:flex">
      <Link href="/home" className="mb-8 flex items-center gap-3 px-2">
        <Logo />
        <span className="font-display text-xl font-semibold">Canopy</span>
      </Link>
      <Link
        href="/applications/new"
        className="press mb-6 flex h-11 items-center justify-center gap-2 rounded-full bg-moss text-sm font-medium text-paper shadow-soft hover:bg-moss-strong"
      >
        <Icon name="plus" className="size-4" /> Plant an application
      </Link>
      <nav aria-label="Main" className="relative flex flex-1 flex-col gap-1">
        {/* One active pill that slides between rows (rows are a fixed 2.5rem + 0.25rem gap). */}
        {activeIndex >= 0 ? (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-10 rounded-xl bg-card shadow-soft transition-transform duration-[280ms] ease-enter motion-reduce:transition-none"
            style={{ transform: `translateY(calc(${activeIndex} * 2.75rem))` }}
          />
        ) : null}
        {NAV.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`relative flex h-10 shrink-0 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors duration-[180ms] ${
                active ? "text-ink" : "text-ink-soft hover:bg-card/60 hover:text-ink"
              }`}
            >
              <Icon name={item.icon} className={`size-5 transition-colors duration-[180ms] ${active ? "text-moss" : ""}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="flex flex-col gap-4 border-t border-line pt-4">
        {footer}
        <Link
          href={HELP_ITEM.href}
          aria-current={isActive(pathname, HELP_ITEM.href) ? "page" : undefined}
          className="-my-1 flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-ink-soft transition-colors hover:bg-card/60 hover:text-ink"
        >
          <Icon name={HELP_ITEM.icon} className="size-5" />
          {HELP_ITEM.label}
        </Link>
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
  const moreBtn = useRef<HTMLButtonElement>(null);
  const firstLink = useRef<HTMLAnchorElement>(null);
  const primary = NAV.filter((n) => n.mobile);
  const secondary = NAV.filter((n) => !n.mobile);

  // The More menu stays mounted for its 150 ms fade-out.
  const [menuMounted, setMenuMounted] = useState(false);
  if (moreOpen && !menuMounted) setMenuMounted(true);
  useEffect(() => {
    if (moreOpen || !menuMounted) return;
    const t = window.setTimeout(() => setMenuMounted(false), 150);
    return () => window.clearTimeout(t);
  }, [moreOpen, menuMounted]);

  // Tab icons pop only when you navigate, never on first paint.
  const [navState, setNavState] = useState({ pathname, moved: false });
  if (navState.pathname !== pathname) setNavState({ pathname, moved: navState.pathname !== null });
  const moved = navState.moved;

  // Column of the active tab in the 5-slot bar (slot 2 is the Plant button).
  const tabSlots = [primary[0], primary[1], null, primary[2]];
  let activeSlot = tabSlots.findIndex((item) => item !== null && item !== undefined && isActive(pathname, item.href));
  if (activeSlot < 0 && (moreOpen || secondary.some((s) => isActive(pathname, s.href)))) activeSlot = 4;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- close the sheet after navigating
    setMoreOpen(false);
  }, [pathname]);

  // Move focus into the sheet when it opens; Escape closes it and returns focus.
  useEffect(() => {
    if (!moreOpen) return;
    firstLink.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setMoreOpen(false);
      moreBtn.current?.focus();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [moreOpen]);

  return (
    <>
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-line bg-paper/85 px-4 backdrop-blur-md md:hidden">
        <Link href="/home" className="flex items-center gap-2">
          <Logo className="size-8" />
          <span className="font-display text-lg font-semibold">Canopy</span>
        </Link>
        <ThemeToggle />
      </header>

      <nav
        aria-label="Main"
        className="pb-safe fixed inset-x-0 bottom-0 z-50 border-t border-line bg-card/95 px-2 pt-2 backdrop-blur-md md:hidden"
      >
        <div className="relative mx-auto max-w-md">
        {activeSlot >= 0 ? (
          <span
            aria-hidden
            className="pointer-events-none absolute bottom-0 left-0 flex w-1/5 justify-center transition-transform duration-[280ms] ease-enter motion-reduce:transition-none"
            style={{ transform: `translateX(${activeSlot * 100}%)` }}
          >
            <span className="h-[3px] w-4 rounded-full bg-moss" />
          </span>
        ) : null}
        <ul className="grid grid-cols-5 items-end">
          {primary.slice(0, 2).map((item) => (
            <MobileTab key={item.href} href={item.href} label={item.label === "Applications" ? "Apps" : item.label} icon={item.icon} active={isActive(pathname, item.href)} pop={moved} />
          ))}
          <li className="flex justify-center">
            <Link
              href="/applications/new"
              aria-label="Plant an application"
              className="-mt-6 flex size-14 items-center justify-center rounded-full bg-moss text-paper shadow-lift ring-4 ring-paper transition-transform duration-[220ms] ease-spring active:scale-95 active:duration-[90ms] active:ease-out motion-reduce:active:scale-100"
            >
              <Icon name="plus" className="size-6" />
            </Link>
          </li>
          {primary.slice(2).map((item) => (
            <MobileTab key={item.href} href={item.href} label="Prep" icon={item.icon} active={isActive(pathname, item.href)} pop={moved} />
          ))}
          <li>
            <button
              ref={moreBtn}
              type="button"
              onClick={() => setMoreOpen((o) => !o)}
              aria-expanded={moreOpen}
              aria-controls="more-menu"
              className={`flex w-full flex-col items-center gap-1 rounded-xl py-1.5 text-[11px] font-medium ${
                moreOpen || secondary.some((s) => isActive(pathname, s.href)) ? "text-moss" : "text-muted"
              }`}
            >
              <span key={activeSlot === 4 && moved ? "on" : "off"} className={`block ${activeSlot === 4 && moved ? "animate-tab-pop" : ""}`}>
                <Icon name="more" />
              </span>
              More
            </button>
          </li>
        </ul>
        </div>
      </nav>

      {menuMounted ? (
        <div className={`fixed inset-0 z-40 md:hidden ${moreOpen ? "" : "pointer-events-none"}`} onClick={() => setMoreOpen(false)}>
          <div className={`absolute inset-0 bg-night/30 ${moreOpen ? "animate-fade" : "animate-fade-out"}`} />
          <nav
            id="more-menu"
            aria-label="More"
            onClick={(e) => e.stopPropagation()}
            className={`absolute inset-x-3 bottom-24 origin-bottom rounded-3xl border border-line bg-card p-2 shadow-lift ${
              moreOpen ? "animate-pop-in" : "animate-fade-out"
            }`}
          >
            {secondary.map((item, i) => (
              <Link
                key={item.href}
                ref={i === 0 ? firstLink : undefined}
                href={item.href}
                aria-current={isActive(pathname, item.href) ? "page" : undefined}
                className="flex items-center gap-3 rounded-2xl px-4 py-3.5 text-[15px] font-medium text-ink-soft aria-[current=page]:bg-paper-2 aria-[current=page]:text-ink"
              >
                <Icon name={item.icon} /> {item.label}
              </Link>
            ))}
            <Link
              href={HELP_ITEM.href}
              className="flex items-center gap-3 rounded-2xl px-4 py-3.5 text-[15px] font-medium text-ink-soft"
            >
              <Icon name={HELP_ITEM.icon} /> {HELP_ITEM.label}
            </Link>
            {/* The sidebar's sign-out (UserBadge) is hidden below md. */}
            <form action={logout} onSubmit={() => clearAllDrafts()} className="mt-1 border-t border-line pt-1">
              <button
                type="submit"
                className="flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-left text-[15px] font-medium text-ink-soft hover:text-ink"
              >
                <Icon name="logout" /> Sign out
              </button>
            </form>
          </nav>
        </div>
      ) : null}
    </>
  );
}

function MobileTab({
  href,
  label,
  icon,
  active,
  pop = false,
}: {
  href: string;
  label: string;
  icon: Parameters<typeof Icon>[0]["name"];
  active: boolean;
  /** Pop the icon when this tab becomes active (after a navigation). */
  pop?: boolean;
}) {
  return (
    <li>
      <Link
        href={href}
        aria-current={active ? "page" : undefined}
        className={`flex flex-col items-center gap-1 rounded-xl py-1.5 text-[11px] font-medium transition-colors duration-[180ms] ${active ? "text-moss" : "text-muted"}`}
      >
        <span className={`block ${active && pop ? "animate-tab-pop" : ""}`}>
          <Icon name={icon} />
        </span>
        {label}
      </Link>
    </li>
  );
}
