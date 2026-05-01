// Build a clean, transparent SVG of a Chinese name suitable for tattoo
// reference / laser engraving / large-format print. We pull the per-character
// stroke paths from `hanzi-writer-data` (each character has a list of
// closed-path stroke outlines on a 1024×1024 grid with origin top-left and
// y inverted — same convention hanzi-writer renders to).

interface CharData {
  strokes: string[];
}

// hanzi-writer-data ships sub-modules per character, but we only need to
// load via the published "characters" loader on demand so the bundle stays
// small. The library exposes a `loadCharacterData` async fn — but we'll do
// our own dynamic fetch from CDN to keep bundle slim.
async function fetchCharacterData(ch: string): Promise<CharData | null> {
  // The "hanzi-writer-data" package on jsdelivr exposes character JSON at
  // https://cdn.jsdelivr.net/npm/hanzi-writer-data@2/{char}.json
  try {
    const res = await fetch(
      `https://cdn.jsdelivr.net/npm/hanzi-writer-data@2/${encodeURIComponent(ch)}.json`,
      { cache: "force-cache" },
    );
    if (!res.ok) return null;
    return (await res.json()) as CharData;
  } catch {
    return null;
  }
}

export interface TattooSvgOptions {
  chineseName: string;
  charSizePx?: number;
  gapPx?: number;
  paddingPx?: number;
  // 'horizontal' for traditional left-to-right; 'vertical' for traditional
  // calligraphy column.
  orientation?: "horizontal" | "vertical";
}

// hanzi-writer-data's coordinate system: 1024 units, origin top-left,
// y axis flipped (positive Y goes UP on character — i.e. baseline at 900,
// top at 100). We mirror Y so it renders right-side-up in normal SVG.
export async function buildTattooSvg(opts: TattooSvgOptions): Promise<string> {
  const charSize = opts.charSizePx ?? 200;
  const gap = opts.gapPx ?? 40;
  const padding = opts.paddingPx ?? 30;
  const orientation = opts.orientation ?? "horizontal";

  const chars = [...opts.chineseName];
  const data = await Promise.all(chars.map((c) => fetchCharacterData(c)));

  const renderableCount = data.filter((d) => d).length;
  if (renderableCount === 0) {
    throw new Error("No stroke data available for this name");
  }

  // Calculate canvas size
  const totalCharsLong = chars.length;
  const widthPx = orientation === "horizontal"
    ? padding * 2 + totalCharsLong * charSize + (totalCharsLong - 1) * gap
    : padding * 2 + charSize;
  const heightPx = orientation === "horizontal"
    ? padding * 2 + charSize
    : padding * 2 + totalCharsLong * charSize + (totalCharsLong - 1) * gap;

  const charPaths: string[] = [];

  data.forEach((cd, idx) => {
    if (!cd) return;
    const dx = orientation === "horizontal"
      ? padding + idx * (charSize + gap)
      : padding;
    const dy = orientation === "horizontal"
      ? padding
      : padding + idx * (charSize + gap);

    // Each stroke is an SVG path on a 1024 grid with y flipped. Translate
    // and scale into the slot.
    // hanzi-writer transforms strokes with (1, 0, 0, -1, 0, 900) — flip Y,
    // shift baseline. We reproduce that, then scale to charSize.
    const scale = charSize / 1024;
    const inner = cd.strokes
      .map(
        (d) =>
          `<path d="${d}" transform="translate(${dx}, ${dy}) scale(${scale}, ${-scale}) translate(0, -900)" fill="#000" />`,
      )
      .join("");
    charPaths.push(`<g data-char="${chars[idx]}">${inner}</g>`);
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${widthPx}" height="${heightPx}" viewBox="0 0 ${widthPx} ${heightPx}" fill="none">
  <title>${escapeXml(opts.chineseName)} · Ink Name</title>
  ${charPaths.join("\n  ")}
</svg>`;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
