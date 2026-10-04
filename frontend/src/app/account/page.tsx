import Link from "next/link";
import { redirect } from "next/navigation";
import SiteHeader from "@/components/shared/SiteHeader";
import SiteFooter from "@/components/shared/SiteFooter";
import InkBackdrop from "@/components/shared/InkBackdrop";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata = { title: "My Names" };

interface Creation {
  id: string;
  english_name: string;
  chinese_name: string;
  pinyin: string;
  meaning: string;
  calligraphy_image_data: string | null;
  seal_image_data: string | null;
  created_at: string;
}

export default async function AccountPage() {
  if (!isSupabaseConfigured()) {
    return (
      <div className="relative min-h-screen overflow-x-hidden bg-[#fbf6ee] text-stone-900">
        <InkBackdrop intensity="soft" />
        <SiteHeader variant="app" />
        <main className="relative mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-4 text-center">
          <span
            className="grid h-14 w-14 place-items-center rounded-full text-white shadow-sm"
            style={{
              background:
                "radial-gradient(circle at 30% 30%, #d8423a 0%, #a32419 60%, #6f1410 100%)",
              fontFamily: "'Noto Serif SC', serif",
            }}
          >
            名
          </span>
          <h1 className="mt-6 text-2xl font-semibold" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Accounts aren&apos;t set up in this preview yet.
          </h1>
          <p className="mt-2 text-stone-600">
            Add Supabase credentials to .env.local to enable sign-in and saved names.
          </p>
          <Link href="/generate" className="mt-6 text-sm font-medium text-amber-700 hover:underline">
            ← Back to writing names
          </Link>
        </main>
      </div>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // proxy.ts already keeps signed-out visitors off this route — this is
  // the belt-and-suspenders check for the page itself.
  if (!user) {
    redirect("/login?next=%2Faccount");
  }

  const { data: creations } = await supabase
    .from("creations")
    .select(
      "id, english_name, chinese_name, pinyin, meaning, calligraphy_image_data, seal_image_data, created_at",
    )
    .order("created_at", { ascending: false });

  const items = (creations ?? []) as Creation[];

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#fbf6ee] text-stone-900">
      <InkBackdrop intensity="soft" />
      <SiteHeader variant="app" />

      <main className="relative mx-auto max-w-5xl px-4 pb-24 pt-32">
        <div className="text-center">
          <span className="text-xs uppercase tracking-[0.3em] text-stone-500">
            账户 — My Names
          </span>
          <h1
            className="mt-4 text-[clamp(2rem,4.5vw,3.2rem)] font-semibold leading-[1.05] tracking-tight text-stone-900"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Every name you&apos;ve written.
          </h1>
          <p className="mt-4 text-stone-600">
            Signed in as {user.email ?? user.user_metadata?.full_name ?? "you"}.
          </p>
        </div>

        {items.length === 0 ? (
          <div className="mx-auto mt-14 max-w-md rounded-3xl border border-stone-200/80 bg-white/85 p-10 text-center shadow-[0_30px_80px_-40px_rgba(60,38,22,0.18)] backdrop-blur">
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
            <p className="mt-5 text-stone-600">
              You haven&apos;t written a name yet — your first one is thirty
              seconds away.
            </p>
            <Link
              href="/generate"
              className="mt-6 inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium text-white"
              style={{
                background: "linear-gradient(135deg, #c2392c 0%, #a32419 50%, #7e1810 100%)",
              }}
            >
              Write my Chinese name
              <span aria-hidden>→</span>
            </Link>
          </div>
        ) : (
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="overflow-hidden rounded-3xl border border-stone-200/80 bg-white/85 shadow-[0_20px_60px_-32px_rgba(60,38,22,0.2)] backdrop-blur"
              >
                <div className="relative flex h-48 items-center justify-center bg-[#f5f0e6]">
                  {item.calligraphy_image_data ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.calligraphy_image_data}
                      alt={`Calligraphy for ${item.chinese_name}`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span
                      className="text-6xl font-bold text-stone-800"
                      style={{ fontFamily: "'Noto Serif SC', serif" }}
                    >
                      {item.chinese_name}
                    </span>
                  )}
                  {item.seal_image_data && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.seal_image_data}
                      alt={`Seal for ${item.chinese_name}`}
                      className="absolute bottom-3 right-3 h-12 w-12 rounded-md object-contain shadow-md"
                    />
                  )}
                </div>
                <div className="p-5">
                  <div className="flex items-baseline justify-between gap-2">
                    <h2
                      className="text-2xl font-semibold text-stone-900"
                      style={{ fontFamily: "'Noto Serif SC', serif" }}
                    >
                      {item.chinese_name}
                    </h2>
                    <span className="text-xs text-stone-400">
                      {new Date(item.created_at).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <p
                    className="mt-1 text-sm tracking-[0.1em] text-stone-500"
                    style={{ fontFamily: "'Cormorant Garamond', serif" }}
                  >
                    {item.pinyin}
                  </p>
                  <p className="mt-2 text-sm italic text-stone-600">
                    “{item.meaning}”
                  </p>
                  <p className="mt-3 text-xs text-stone-400">
                    for {item.english_name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
