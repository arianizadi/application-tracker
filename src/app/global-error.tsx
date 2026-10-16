"use client";

/**
 * Last-resort boundary for errors in the root layout. It renders its own
 * document without globals.css, so styles are inline and self-contained.
 */
export default function GlobalError({ error, retry }: { error: unknown; retry: () => void }) {
  const digest =
    error && typeof error === "object" && "digest" in error && typeof error.digest === "string" ? error.digest.slice(0, 32) : null;

  return (
    <html lang="en">
      <head>
        <title>Something went wrong · Canopy</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`
          :root { color-scheme: light dark; --bg:#f8f4ea; --ink:#1d2a1f; --soft:#46574a; --moss:#3d6b3a; --on:#f8f4ea; --line:#cdbf9f; }
          @media (prefers-color-scheme: dark) { :root { --bg:#0f1a14; --ink:#eef3e8; --soft:#c2cfbf; --moss:#8cc77e; --on:#0f1a14; --line:#345040; } }
          * { box-sizing: border-box; }
          body { margin:0; min-height:100dvh; display:grid; place-items:center; padding:24px 16px; background:var(--bg); color:var(--ink);
            font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif; text-align:center; }
          h1 { font-family: ui-serif, Georgia, serif; font-size: clamp(28px, 6vw, 40px); line-height:1.15; margin:20px 0 8px; font-weight:600; }
          p { color:var(--soft); font-size:17px; line-height:1.55; max-width:28rem; margin:0 auto; }
          .row { display:flex; flex-wrap:wrap; gap:12px; justify-content:center; margin-top:28px; }
          button, a { min-height:48px; padding:0 24px; border-radius:999px; font:inherit; font-weight:600; font-size:16px; display:inline-flex; align-items:center; text-decoration:none; cursor:pointer; }
          button { background:var(--moss); color:var(--on); border:0; }
          a { color:var(--ink); border:1px solid var(--line); }
          :focus-visible { outline:2px solid var(--moss); outline-offset:3px; }
          small { display:block; margin-top:20px; color:var(--soft); font-size:12px; }
        `}</style>
      </head>
      <body>
        <main>
          <svg viewBox="0 0 40 40" width="64" height="64" aria-hidden="true">
            <rect width="40" height="40" rx="12" fill="#3d6b3a" />
            <path d="M20 8c-5 6-9 9.5-9 14.5a9 9 0 0 0 18 0C29 17.5 25 14 20 8Z" fill="#7fb069" />
            <path d="M20 31V20m0 4.5 4-3.5m-4 1-3-2.5" stroke="#f8f4ea" strokeWidth="2" strokeLinecap="round" fill="none" />
            <circle cx="29.5" cy="10.5" r="3" fill="#f2a541" />
          </svg>
          <h1>The whole forest needs a moment.</h1>
          <p>Something went wrong while loading Canopy. Your saved work is safe. Try again, or head back to the start.</p>
          <div className="row">
            <button type="button" onClick={() => retry()}>
              Try again
            </button>
            {/* A full page load is intentional here: the app shell itself failed. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/">Go home</a>
          </div>
          {digest ? <small>Reference code: {digest}</small> : null}
        </main>
      </body>
    </html>
  );
}
