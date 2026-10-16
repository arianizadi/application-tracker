export type NavItem = { href: string; label: string; icon: IconName; mobile?: boolean };
export type IconName = "home" | "list" | "file" | "target" | "book" | "chart" | "trophy" | "settings" | "plus" | "more" | "logout" | "help";

export const NAV: NavItem[] = [
  { href: "/home", label: "Forest", icon: "home", mobile: true },
  { href: "/applications", label: "Applications", icon: "list", mobile: true },
  { href: "/prep", label: "Interview prep", icon: "book", mobile: true },
  { href: "/resumes", label: "Resumes", icon: "file" },
  { href: "/analyzer", label: "Analyzer", icon: "target" },
  { href: "/stats", label: "Stats", icon: "chart" },
  { href: "/achievements", label: "Achievements", icon: "trophy" },
  { href: "/settings", label: "Settings", icon: "settings" },
];

/** Public help page, linked from the side-nav footer and the mobile More sheet. */
export const HELP_ITEM: NavItem = { href: "/faq", label: "Help & FAQ", icon: "help" };
