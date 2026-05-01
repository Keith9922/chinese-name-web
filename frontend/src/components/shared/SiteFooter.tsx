import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="relative z-20 border-t border-stone-200/70 bg-[#fbf6ee] px-4 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <span
                className="grid h-9 w-9 place-items-center rounded-full text-white"
                style={{
                  background:
                    "radial-gradient(circle at 30% 30%, #d8423a 0%, #a32419 60%, #6f1410 100%)",
                  fontFamily: "'Noto Serif SC', serif",
                }}
              >
                名
              </span>
              <span className="text-base font-semibold tracking-tight text-stone-900">
                墨名 · <span className="text-stone-500" style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic" }}>Ink Name</span>
              </span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-stone-500">
              A small studio that turns the sound of your name into the brushstroke
              it could have always been.
            </p>
          </div>

          <FooterColumn
            title="Discover"
            links={[
              { href: "/generate", label: "Generate a name" },
              { href: "/#examples", label: "Examples" },
              { href: "/#ritual", label: "The Ritual" },
            ]}
          />
          <FooterColumn
            title="Learn"
            links={[
              { href: "/#story", label: "Why it matters" },
              { href: "/#pricing", label: "Pricing" },
            ]}
          />
          <FooterColumn
            title="Tell us"
            links={[
              { href: "mailto:hello@inkname.studio", label: "Say hello" },
              { href: "/#feedback", label: "Leave feedback" },
            ]}
          />
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-stone-200 pt-6 text-xs text-stone-500 md:flex-row md:items-center">
          <p>
            © {new Date().getFullYear()} 墨名 · Ink Name. Crafted with respect for{" "}
            <span className="text-stone-700">五千年</span> of naming tradition.
          </p>
          <p className="font-mono tracking-wider text-stone-400">
            mò · míng — the ink and the name
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-700">
        {title}
      </h3>
      <ul className="mt-3 space-y-2 text-sm">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-stone-500 transition-colors hover:text-stone-900"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
