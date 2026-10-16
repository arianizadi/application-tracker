import Link from "next/link";
import type { ComponentProps } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "sun";
type Size = "sm" | "md" | "lg" | "icon";

const base =
  "inline-flex select-none items-center justify-center gap-2 rounded-full font-medium transition-[background-color,color,box-shadow,transform] duration-150 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary: "bg-moss text-paper shadow-soft hover:bg-moss-strong",
  secondary: "border border-line-strong bg-card text-ink hover:bg-paper-2",
  ghost: "text-ink-soft hover:bg-paper-2 hover:text-ink",
  danger: "bg-coral-strong text-on-coral hover:brightness-95",
  sun: "bg-sun text-night shadow-soft hover:brightness-105",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
  icon: "size-11",
};

export function buttonClass({ variant = "primary", size = "md", className = "" }: { variant?: Variant; size?: Size; className?: string } = {}) {
  return `${base} ${variants[variant]} ${sizes[size]} ${className}`;
}

export function Button({
  variant,
  size,
  className,
  type = "button",
  ...props
}: ComponentProps<"button"> & { variant?: Variant; size?: Size }) {
  return <button type={type} className={buttonClass({ variant, size, className })} {...props} />;
}

export function ButtonLink({
  variant,
  size,
  className,
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant; size?: Size }) {
  return <Link className={buttonClass({ variant, size, className })} {...props} />;
}
