import { ImageResponse } from "next/og";

export const runtime = "edge";

interface Params {
  chineseName: string;
  pinyin: string;
  meaning: string;
  classicalAllusion?: string;
}

// We resolve fonts at runtime by hitting Google Fonts CSS — version-pinned
// .ttf URLs (the previous approach) silently 404 when Google bumps the
// version, and @vercel/og then returns an empty 200 instead of erroring.
// CSS-resolution is robust to those bumps.
//
// Sending an old User-Agent forces Google to return TTF instead of WOFF2
// (satori, which @vercel/og uses, can't decode WOFF2).
const OLD_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_0) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1";

async function fetchGoogleFontTtf(family: string, weight = 400): Promise<ArrayBuffer> {
  const cssUrl = `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, "+")}:wght@${weight}&display=swap`;
  const css = await fetch(cssUrl, { headers: { "User-Agent": OLD_UA } }).then((r) => r.text());
  const match = css.match(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/);
  if (!match) throw new Error(`Could not resolve font URL for ${family}`);
  const fontRes = await fetch(match[1]);
  if (!fontRes.ok) throw new Error(`Font fetch failed for ${family}: ${fontRes.status}`);
  return fontRes.arrayBuffer();
}

let cached:
  | { notoSerif: ArrayBuffer; cormorant: ArrayBuffer; maShan: ArrayBuffer }
  | null = null;

async function loadFonts() {
  if (cached) return cached;
  const [notoSerif, cormorant, maShan] = await Promise.all([
    fetchGoogleFontTtf("Noto Serif SC", 700),
    fetchGoogleFontTtf("Cormorant Garamond", 500),
    fetchGoogleFontTtf("Ma Shan Zheng", 400),
  ]);
  cached = { notoSerif, cormorant, maShan };
  return cached;
}

function getParams(url: URL): Params | null {
  const chineseName = url.searchParams.get("name")?.trim();
  if (!chineseName || chineseName.length > 8) return null;
  return {
    chineseName,
    pinyin: (url.searchParams.get("pinyin") ?? "").slice(0, 60),
    meaning: (url.searchParams.get("meaning") ?? "").slice(0, 200),
    classicalAllusion: (url.searchParams.get("allusion") ?? "").slice(0, 220),
  };
}

const STYLE_FONT_FAMILY: Record<string, string> = {
  kaishu: "noto-serif-sc",
  brush: "ma-shan-zheng",
  default: "noto-serif-sc",
};

export async function GET(request: Request) {
  try {
    return await renderCard(request);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[card] render failed:", message);
    return new Response(JSON.stringify({ error: "Card render failed", detail: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

async function renderCard(request: Request) {
  const url = new URL(request.url);
  const params = getParams(url);
  if (!params) {
    return new Response("Missing or invalid 'name' parameter", { status: 400 });
  }

  const styleParam = url.searchParams.get("style") ?? "kaishu";
  const fontFamily = STYLE_FONT_FAMILY[styleParam] ?? STYLE_FONT_FAMILY.default;

  const { notoSerif, cormorant, maShan } = await loadFonts();

  const { chineseName, pinyin, meaning, classicalAllusion } = params;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background:
            "linear-gradient(180deg, #fbf6ee 0%, #f3e4c2 100%)",
          padding: "120px 100px",
          position: "relative",
        }}
      >
        {/* Decorative outer frame */}
        <div
          style={{
            position: "absolute",
            top: 60,
            left: 60,
            right: 60,
            bottom: 60,
            border: "2px solid rgba(140, 100, 60, 0.18)",
            borderRadius: 8,
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 76,
            left: 76,
            right: 76,
            bottom: 76,
            border: "1px solid rgba(140, 100, 60, 0.10)",
            display: "flex",
          }}
        />

        {/* Top decoration: dotted rule */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: 40,
          }}
        >
          <div
            style={{
              fontFamily: "cormorant-garamond",
              fontSize: 22,
              letterSpacing: 8,
              color: "rgba(58, 42, 31, 0.55)",
            }}
          >
            墨 名 ·  I N K   N A M E
          </div>
        </div>

        {/* Big Chinese name */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flex: 1,
            position: "relative",
          }}
        >
          <div
            style={{
              fontFamily,
              fontSize: chineseName.length <= 2 ? 540 : chineseName.length <= 3 ? 420 : 320,
              fontWeight: 700,
              color: "#1f1410",
              letterSpacing: chineseName.length <= 2 ? 24 : 16,
              lineHeight: 1,
              textShadow: "0 8px 18px rgba(60, 38, 22, 0.18)",
              display: "flex",
            }}
          >
            {chineseName}
          </div>
          {/* Red corner seal */}
          <div
            style={{
              position: "absolute",
              top: 30,
              right: 90,
              width: 110,
              height: 110,
              background:
                "linear-gradient(135deg, #c2392c 0%, #7e1810 100%)",
              borderRadius: 6,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transform: "rotate(-8deg)",
              boxShadow: "0 8px 18px -6px rgba(126, 24, 16, 0.45)",
            }}
          >
            <div
              style={{
                fontFamily: "noto-serif-sc",
                fontSize: 64,
                color: "#fbf2e2",
                fontWeight: 700,
              }}
            >
              {chineseName.slice(-1)}
            </div>
          </div>
        </div>

        {/* Pinyin */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: 24,
          }}
        >
          <div
            style={{
              fontFamily: "cormorant-garamond",
              fontSize: 56,
              letterSpacing: 14,
              color: "#5a4332",
              display: "flex",
            }}
          >
            {pinyin}
          </div>
        </div>

        {/* Meaning */}
        {meaning && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: 24,
              padding: "0 80px",
            }}
          >
            <div
              style={{
                fontFamily: "cormorant-garamond",
                fontSize: 36,
                fontStyle: "italic",
                color: "#3a2a1f",
                textAlign: "center",
                display: "flex",
                lineHeight: 1.4,
              }}
            >
              &ldquo;{meaning}&rdquo;
            </div>
          </div>
        )}

        {/* Classical allusion */}
        {classicalAllusion && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: 28,
              padding: "0 120px",
            }}
          >
            <div
              style={{
                fontFamily: "noto-serif-sc",
                fontSize: 24,
                color: "rgba(58, 42, 31, 0.7)",
                textAlign: "center",
                display: "flex",
                lineHeight: 1.5,
              }}
            >
              {classicalAllusion}
            </div>
          </div>
        )}

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginTop: 40,
            paddingTop: 20,
            borderTop: "1px solid rgba(140, 100, 60, 0.18)",
          }}
        >
          <div
            style={{
              fontFamily: "cormorant-garamond",
              fontSize: 18,
              color: "rgba(58, 42, 31, 0.55)",
              letterSpacing: 4,
              display: "flex",
            }}
          >
            落墨即名 · ink falls. the name appears.
          </div>
          <div
            style={{
              fontFamily: "cormorant-garamond",
              fontSize: 16,
              color: "rgba(58, 42, 31, 0.4)",
              display: "flex",
            }}
          >
            ink-name.vercel.app
          </div>
        </div>
      </div>
    ),
    {
      width: 2400,
      height: 1600,
      fonts: [
        { name: "noto-serif-sc", data: notoSerif, style: "normal", weight: 700 },
        { name: "cormorant-garamond", data: cormorant, style: "normal", weight: 500 },
        { name: "ma-shan-zheng", data: maShan, style: "normal", weight: 400 },
      ],
    },
  );
}
