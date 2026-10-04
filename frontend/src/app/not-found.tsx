import Link from "next/link";

export default function NotFound() {
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
          名
        </span>
        <h1
          className="mt-6 text-2xl font-semibold"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          This page hasn&apos;t been written yet.
        </h1>
        <p className="mt-2 text-stone-600">
          Let&apos;s get you back to somewhere real.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-full px-5 py-2 text-sm font-medium text-white"
          style={{
            background: "linear-gradient(135deg, #c2392c 0%, #a32419 50%, #7e1810 100%)",
          }}
        >
          Back home
        </Link>
      </div>
    </div>
  );
}
