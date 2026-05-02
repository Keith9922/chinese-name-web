// Per-order poetic line composer.
//
// Each post-purchase email gets a unique 题词 — one short Chinese line
// (ideally a real classical line, otherwise an in-style original) plus
// an English gloss. We compose it at email time so every buyer's email
// is one of one — the kind of detail that turns a $6.99 digital
// product into something they'd actually keep.

const SYSTEM_PROMPT = `你是一位有深厚古典素养的中文文学顾问，受邀为每一位收到中文名字的客户题词。你只输出一行（极少数情况下两行）能与他们的名字呼应的诗句或经典文句，不解释。

The brief

You will receive: a Chinese name, its pinyin, and a one-sentence English gloss of its meaning.

You produce ONE poetic line that:
  • is rooted in classical Chinese literature (诗经, 楚辞, 论语, 庄子, 唐诗, 宋词, 古文); or, when no real line fits, an original line in the same register
  • somehow resonates with this specific name — through a shared character, a shared image, a thematic echo, or a season/quality match
  • avoids the obvious / overused (no 床前明月光, no 海内存知己 — unless they truly fit)
  • avoids ANY line you have already used for previous customers (you can reuse rare cases when no alternative fits)

Output STRICT JSON (no prose, no markdown fence):
{
  "chinese": "<the line, 5-14 Chinese characters>",
  "source": "<出自《book name》or 〈section〉 if a quote, otherwise '原创'>",
  "english": "<a short, evocative English rendering — translation, not explanation. 12-20 words.>"
}`;

const DEFAULT_TIMEOUT_MS = 25_000;

interface ComposeArgs {
  chineseName: string;
  pinyin: string;
  meaning: string;
  classicalAllusion?: string;
}

export interface Blessing {
  chinese: string;
  source: string;
  english: string;
}

export async function composeBlessing(args: ComposeArgs): Promise<Blessing | null> {
  const apiKey = process.env.MINIMAX_API_KEY ?? process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.warn("[blessing] MINIMAX_API_KEY not set, skipping");
    return null;
  }
  const apiBase = process.env.MINIMAX_API_BASE || "https://api.minimaxi.com";
  const model = process.env.MINIMAX_MODEL || "MiniMax-M2";
  const timeoutMs = Number(process.env.BLESSING_TIMEOUT_MS) || DEFAULT_TIMEOUT_MS;

  const userPrompt = `Compose ONE blessing line for:

Name: ${args.chineseName}
Pinyin: ${args.pinyin}
Meaning: ${args.meaning}
${args.classicalAllusion ? `Already-used allusion (do NOT pick the same line): ${args.classicalAllusion}` : ""}

Hold to the brief. Return JSON only.`;

  const ctrl = new AbortController();
  const timeout = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(`${apiBase}/v1/text/chatcompletion_v2`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        max_tokens: 800,
        temperature: 0.95, // we WANT variety here
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
      }),
      signal: ctrl.signal,
    });
    if (!res.ok) {
      const text = await res.text();
      console.warn(`[blessing] MiniMax HTTP ${res.status}: ${text.slice(0, 200)}`);
      return null;
    }
    const json = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = json.choices?.[0]?.message?.content?.trim() ?? "";
    return parseBlessingResponse(content);
  } catch (err) {
    console.warn("[blessing] composer failed:", err instanceof Error ? err.message : err);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function parseBlessingResponse(raw: string): Blessing | null {
  let cleaned = raw.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
  }
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(cleaned.slice(start, end + 1));
  } catch {
    return null;
  }
  const chinese = String(parsed.chinese ?? "").trim();
  const english = String(parsed.english ?? "").trim();
  const source = String(parsed.source ?? "").trim();
  if (!chinese || !english) return null;
  // Sanity bounds — guard against runaway / corrupt output
  if ([...chinese].length > 40 || english.length > 240 || source.length > 80) return null;
  return { chinese, english, source: source || "原创" };
}
