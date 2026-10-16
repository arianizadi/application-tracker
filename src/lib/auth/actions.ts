"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { getDummyHash, hashPassword, verifyPassword } from "@/lib/auth/password";
import { clientIp, consume, reset } from "@/lib/auth/rate-limit";
import { createSession, deleteAllSessions, deleteCurrentSession, readSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { DEFAULT_TRACK, isTrack } from "@/lib/tracks";

export type AuthFormState = {
  error?: string;
  fieldErrors?: Partial<Record<"name" | "email" | "password" | "confirm" | "current" | "track", string>>;
  ok?: boolean;
  message?: string;
} | undefined;

const COMMON_PASSWORDS = new Set([
  "password", "password1", "password123", "12345678", "123456789", "1234567890", "qwerty123",
  "iloveyou", "letmein123", "internship", "applications", "welcome123", "abc12345", "11111111",
]);

const passwordSchema = z
  .string()
  .min(10, "Use at least 10 characters.")
  .max(200, "That password is too long.")
  .refine((value) => !COMMON_PASSWORDS.has(value.toLowerCase()), "That password is too common — pick something unique.");

const emailSchema = z.string().trim().toLowerCase().max(254).pipe(z.email("Enter a valid email address."));

const signupSchema = z.object({
  name: z.string().trim().min(1, "What should we call you?").max(60, "Keep it under 60 characters."),
  email: emailSchema,
  password: passwordSchema,
  track: z.string().trim().max(40).optional(),
});

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Enter your password.").max(200),
});

const WINDOW_15_MIN = 15 * 60 * 1000;

function fieldErrors(error: z.ZodError) {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    out[key] ??= issue.message;
  }
  return out;
}

/** Only allow same-site relative redirects after sign-in. */
function safeNext(value: FormDataEntryValue | null): string {
  const next = typeof value === "string" ? value : "";
  return next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\") ? next : "/home";
}

export async function signup(_state: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const ip = await clientIp();
  if (!(await consume("signup-ip", ip, 10, 60 * 60 * 1000))) {
    return { error: "Too many sign-up attempts. Take a breather and try again in a bit." };
  }

  const parsed = signupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    track: formData.get("track") ?? undefined,
  });
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error) };

  const { name, email, password } = parsed.data;
  const track = isTrack(parsed.data.track) ? parsed.data.track : DEFAULT_TRACK;
  const passwordHash = await hashPassword(password);
  try {
    const user = await prisma.user.create({ data: { name, email, passwordHash, track }, select: { id: true } });
    await createSession(user.id);
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      return { fieldErrors: { email: "An account with this email already exists. Try signing in." } };
    }
    console.error("Sign-up failed", error instanceof Error ? error.name : "unknown");
    return { error: "Something went wrong creating your account. Please try again." };
  }
  redirect("/home?welcome=1");
}

export async function login(_state: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = loginSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error) };
  const { email, password } = parsed.data;

  const ip = await clientIp();
  const [ipOk, emailOk] = await Promise.all([
    consume("login-ip", ip, 30, WINDOW_15_MIN),
    consume("login-email", email, 8, WINDOW_15_MIN),
  ]);
  if (!ipOk || !emailOk) {
    return { error: "Too many sign-in attempts. Wait 15 minutes and try again." };
  }

  const user = await prisma.user.findUnique({ where: { email }, select: { id: true, passwordHash: true } });
  const valid = await verifyPassword(password, user?.passwordHash ?? (await getDummyHash()));
  if (!user || !valid) {
    return { error: "That email and password don't match." };
  }

  await reset("login-email", email);
  await createSession(user.id);
  redirect(safeNext(formData.get("next")));
}

export async function logout(): Promise<void> {
  await deleteCurrentSession();
  redirect("/login");
}

const changePasswordSchema = z.object({
  current: z.string().min(1, "Enter your current password.").max(200),
  password: passwordSchema,
  confirm: z.string(),
}).refine((data) => data.password === data.confirm, { message: "Passwords don't match.", path: ["confirm"] });

export async function changePassword(_state: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const session = await readSession();
  if (!session) redirect("/login");

  const parsed = changePasswordSchema.safeParse({
    current: formData.get("current"),
    password: formData.get("password"),
    confirm: formData.get("confirm"),
  });
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error) };

  if (!(await consume("change-password", session.user.id, 8, WINDOW_15_MIN))) {
    return { error: "Too many attempts. Try again in 15 minutes." };
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { passwordHash: true } });
  if (!user || !(await verifyPassword(parsed.data.current, user.passwordHash))) {
    return { fieldErrors: { current: "That's not your current password." } };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { passwordHash: await hashPassword(parsed.data.password) },
  });
  // Sign out every other device, then start a fresh session here.
  await deleteAllSessions(session.user.id);
  await createSession(session.user.id);
  return { ok: true, message: "Password updated. Other devices were signed out." };
}

export async function signOutEverywhere(): Promise<void> {
  const session = await readSession();
  if (session) await deleteAllSessions(session.user.id);
  await deleteCurrentSession();
  redirect("/login");
}

export async function deleteAccount(_state: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const session = await readSession();
  if (!session) redirect("/login");
  const password = String(formData.get("current") ?? "");
  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { passwordHash: true } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { fieldErrors: { current: "Enter your password to confirm." } };
  }
  const userId = session.user.id;
  // MongoDB relations don't cascade automatically in every case; delete explicitly.
  const resumeIds = (await prisma.resume.findMany({ where: { userId }, select: { id: true } })).map((r) => r.id);
  await prisma.$transaction([
    prisma.resumeFile.deleteMany({ where: { resumeId: { in: resumeIds } } }),
    prisma.analysis.deleteMany({ where: { userId } }),
    prisma.application.deleteMany({ where: { userId } }),
    prisma.resume.deleteMany({ where: { userId } }),
    prisma.achievement.deleteMany({ where: { userId } }),
    prisma.progress.deleteMany({ where: { userId } }),
    prisma.session.deleteMany({ where: { userId } }),
    prisma.user.delete({ where: { id: userId } }),
  ]);
  await deleteCurrentSession();
  redirect("/?goodbye=1");
}
