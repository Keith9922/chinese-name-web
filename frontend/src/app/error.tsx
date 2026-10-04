"use client";

import { useEffect } from "react";

// Next.js requires this to be a Client Component with this exact export
// shape — it catches any otherwise-uncaught render/runtime error in the app
// segment and replaces Next's generic, unbranded error screen with one that
// matches the rest of the product.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fbf6ee] px-4 text-center text-stone-900">
      <div>
        <span
          className="mx-auto grid h-14 w-14 place-items-center rounded-full text-white shadow-sm"
          style={{
            background:
              "radial-gradient(circle at 30% 30%, #d8423a 0%, #a32419 60%, #6f1410 100%)",
            fontFamily: "'Noto Serif SC', serif",
          }}
        >
          墨
        </span>
        <h1
          className="mt-6 text-2xl font-semibold"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          The brush slipped.
        </h1>
        <p className="mt-2 text-stone-600">
          Something went wrong on our end. Your name is safe — please try again.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-full px-5 py-2 text-sm font-medium text-white"
            style={{
              background: "linear-gradient(135deg, #c2392c 0%, #a32419 50%, #7e1810 100%)",
            }}
          >
            Try again
          </button>
          <a
            href="/"
            className="rounded-full border border-stone-300 px-5 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100"
          >
            Back home
          </a>
        </div>
      </div>
    </div>
  );
}
