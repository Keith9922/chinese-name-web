import { NextRequest, NextResponse } from "next/server";
import { buildTattooSvg } from "@/lib/tattoo-svg";

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

  try {
    const svg = await buildTattooSvg({ chineseName: name, orientation });
    return new NextResponse(svg, {
      status: 200,
      headers: {
        "Content-Type": "image/svg+xml; charset=utf-8",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(name)}_tattoo.svg"`,
        "Cache-Control": "public, max-age=86400, s-maxage=2592000",
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
