import Link from "next/link";

export default function AuthCodeErrorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fbf6ee] px-4 text-center text-stone-900">
      <div>
        <span
          className="grid h-14 w-14 mx-auto place-items-center rounded-full text-white shadow-sm"
          style={{
            background:
              "radial-gradient(circle at 30% 30%, #d8423a 0%, #a32419 60%, #6f1410 100%)",
            fontFamily: "'Noto Serif SC', serif",
          }}
        >
          名
        </span>
        <h1 className="mt-6 text-2xl font-semibold" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
          The sign-in didn&apos;t go through.
        </h1>
        <p className="mt-2 text-stone-600">
          Something interrupted the connection. Please try again.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block rounded-full px-5 py-2 text-sm font-medium text-white"
          style={{
            background: "linear-gradient(135deg, #c2392c 0%, #a32419 50%, #7e1810 100%)",
          }}
        >
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
