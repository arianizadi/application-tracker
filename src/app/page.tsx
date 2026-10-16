import { isDatabaseConnected } from "@/lib/database";

export const dynamic = "force-dynamic";

export default async function Home() {
  const connected = await isDatabaseConnected();

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16 sm:px-10">
      <div className="w-full max-w-2xl">
        <div className="mb-12 flex items-center gap-3">
          <span
            aria-hidden="true"
            className="flex size-10 items-center justify-center rounded-xl bg-emerald-950 text-lg font-semibold text-white"
          >
            a.
          </span>
          <span className="text-sm font-semibold tracking-tight">
            Application Tracker
          </span>
        </div>

        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-800">
          A fresh start
        </p>
        <h1 className="max-w-xl text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
          Make room for your next opportunity.
        </h1>
        <p className="mt-6 max-w-lg text-lg leading-8 text-stone-600">
          Application Tracker is ready to build. A clean foundation for keeping
          your applications and next steps in one place.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <span
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm ${
              connected
                ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                : "border-amber-200 bg-amber-50 text-amber-900"
            }`}
          >
            <span
              aria-hidden="true"
              className={`size-2 rounded-full ${connected ? "bg-emerald-600" : "bg-amber-600"}`}
            />
            {connected ? "Database connected" : "Database unavailable"}
          </span>
          <a
            href="/api/health"
            className="rounded-full px-4 py-2 text-sm text-stone-600 underline decoration-stone-300 underline-offset-4 transition-colors hover:text-stone-950 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-800"
          >
            Check connection
          </a>
        </div>

        <footer className="mt-16 border-t border-stone-200 pt-6 text-xs text-stone-500">
          Next.js · Tailwind CSS · Prisma · MongoDB
        </footer>
      </div>
    </main>
  );
}
