import { NextRequest, NextResponse } from "next/server";
import { buildTattooSvg } from "@/lib/tattoo-svg";
import { verifyDownloadSig } from "@/lib/server/download-signing";

export const runtime = "edge";
export const maxDuration = 15;

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const name = (url.searchParams.get("name") ?? "").trim();
  if (!name || name.length > 8) {
    return NextResponse.json({ error: "Missing or invalid 'name'" }, { status: 400 });
  }
  const orientation = url.searchParams.get("orientation") === "vertical"
    ? "vertical"
    : "horizontal";

  // Tattoo SVGs are a paid-only deliverable. Without a valid HMAC sig
  // (which the order-confirmation email includes), respond with a polite
  // 402 telling the caller where to buy.
  const sig = url.searchParams.get("sig");
  const params = {
    name,
    pinyin: url.searchParams.get("pinyin") ?? "",
    meaning: url.searchParams.get("meaning") ?? "",
    allusion: url.searchParams.get("allusion") ?? "",
    style: url.searchParams.get("style") ?? "kaishu",
  };
  const isPaid = await verifyDownloadSig(sig, params);
  if (!isPaid) {
    return NextResponse.json(
      {
        error: "Tattoo SVG is part of the Signature Collection.",
        upgrade_url: "https://6419390574794.gumroad.com/l/kidcrz?wanted=true",
      },
      { status: 402 },
    );
  }

  try {
    const svg = await buildTattooSvg({ chineseName: name, orientation });
    return new NextResponse(svg, {
      status: 200,
      headers: {
        "Content-Type": "image/svg+xml; charset=utf-8",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(name)}_tattoo_${orientation}.svg"`,
        "Cache-Control": "private, max-age=300",
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
