"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import InkBackdrop from "@/components/shared/InkBackdrop";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" width="20" height="20" aria-hidden>
      <path
        fill="#FFC107"
        d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
      />
      <path
        fill="#FF3D00"
        d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
      />
      <path
        fill="#1976D2"
        d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
      />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden>
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.333-1.754-1.333-1.754-1.09-.745.083-.73.083-.73 1.205.084 1.84 1.237 1.84 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.42-1.305.763-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.468-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23a11.5 11.5 0 013.003-.404c1.02.005 2.045.138 3.003.404 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFormFallback />}>
      <LoginForm />
    </Suspense>
  );
}

function LoginFormFallback() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#fbf6ee] px-4 py-16 text-stone-900">
      <InkBackdrop intensity="soft" />
    </div>
  );
}

function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/generate";
  const [loadingProvider, setLoadingProvider] = useState<"google" | "github" | null>(null);
  const [error, setError] = useState("");

  const handleSignIn = async (provider: "google" | "github") => {
    setError("");
    if (!isSupabaseConfigured()) {
      setError("Sign-in isn't configured for this preview yet.");
      return;
    }
    setLoadingProvider(provider);
    try {
      const supabase = createClient();
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });
      if (oauthError) {
        setError("Sorry, that sign-in didn't go through. Please try again.");
        setLoadingProvider(null);
      }
      // On success the browser navigates away to the provider — no further
      // state update needed here.
    } catch {
      setError("Sorry, that sign-in didn't go through. Please try again.");
      setLoadingProvider(null);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#fbf6ee] px-4 py-16 text-stone-900">
      <InkBackdrop intensity="soft" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-stone-200/80 bg-white/85 shadow-[0_30px_80px_-40px_rgba(60,38,22,0.18)] backdrop-blur"
      >
        <div
          aria-hidden
          className="absolute -left-10 -top-10 h-28 w-28 rotate-[-30deg] rounded-md"
          style={{
            background: "linear-gradient(135deg, #c2392c 0%, #7e1810 100%)",
            boxShadow: "0 8px 24px -10px rgba(162, 36, 25, 0.4)",
          }}
        />
        <span
          aria-hidden
          className="absolute left-3 top-3 text-xs font-bold tracking-wide text-amber-100/95"
          style={{ fontFamily: "'Noto Serif SC', serif" }}
        >
          印
        </span>

        <div className="relative px-7 pb-10 pt-12 text-center md:px-10">
          <Link href="/" className="group inline-flex items-center gap-2.5">
            <span
              className="grid h-10 w-10 place-items-center rounded-full text-white shadow-sm transition-transform duration-500 group-hover:rotate-12"
              style={{
                background:
                  "radial-gradient(circle at 30% 30%, #d8423a 0%, #a32419 60%, #6f1410 100%)",
                fontFamily: "'Noto Serif SC', serif",
              }}
            >
              名
            </span>
          </Link>

          <h1
            className="mt-6 text-2xl font-semibold tracking-tight text-stone-900 md:text-3xl"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Sign in to keep your name.
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-stone-600">
            One click, no password. Your generated names are saved to your account
            so you can find them again — on any device, any time.
          </p>

          <div className="mt-8 space-y-3">
            <button
              type="button"
              onClick={() => handleSignIn("google")}
              disabled={loadingProvider !== null}
              className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-stone-300 bg-white text-sm font-medium text-stone-800 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md disabled:pointer-events-none disabled:opacity-60"
            >
              <GoogleIcon />
              {loadingProvider === "google" ? "Connecting…" : "Continue with Google"}
            </button>

            <button
              type="button"
              onClick={() => handleSignIn("github")}
              disabled={loadingProvider !== null}
              className="flex h-12 w-full items-center justify-center gap-3 rounded-xl text-sm font-medium text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md disabled:pointer-events-none disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #24292e 0%, #0d1117 100%)" }}
            >
              <GitHubIcon />
              {loadingProvider === "github" ? "Connecting…" : "Continue with GitHub"}
            </button>
          </div>

          {error && (
            <p className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-center text-sm text-red-700">
              {error}
            </p>
          )}

          <p className="mt-8 text-xs text-stone-400">
            By continuing you agree this is a hackathon demo — we only ever store
            the name you generate, never your password (we never see it).
          </p>
        </div>
      </motion.div>
    </div>
  );
}
