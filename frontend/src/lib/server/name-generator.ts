import {
  CharacterTriple,
  EARTHLY_BRANCHES,
  ELEMENT_IMAGES,
  GENERIC_NAME_BLACKLIST,
  HEAVENLY_STEMS,
  HOUR_WINDOWS,
  LETTER_CANDIDATES,
  SEASON_TRIGRAMS,
  SEASONAL_CLASSICAL_REFS,
  SOUND_CANDIDATES,
  SURNAME_CANDIDATES,
  TrigramReading,
  ZODIAC_TRAITS,
} from "./naming-data";

export interface NameGenerationInput {
  englishName: string;
  gender: "male" | "female" | "other";
  birthDate: string;
  birthTime?: string;
}

export interface SuggestedCharacter {
  character: string;
  meaning: string;
}

export interface NameGenerationResult {
  chineseName: string;
  pinyin: string;
  meaning: string;
  culturalExplanation: string;
  pronunciationMapping: string;
  elementAnalysis: string;
  classicalAllusion?: string;
  suggestedCharacters: SuggestedCharacter[];
}

interface BirthProfile {
  season: string;
  dominant: string;
  support: string[];
  yearGZ: string;
  zodiac: string;
  zodiacTraits: string;
  zodiacImagery: string;
  hourBranch: string | null;
  trigrams: TrigramReading[];
  classicalRef: string;
  balancingElements: string[];
  balancingImages: string;
  summary: string;
}

interface ParsedName {
  given: string;
  family: string | null;
  hasFamily: boolean;
}

interface FallbackContext {
  englishName: string;
  parsedName: ParsedName;
  normalizedGiven: string;
  normalizedFamily: string;
  surnameCandidates: CharacterTriple[];
  soundCandidates: CharacterTriple[];
  birthProfile: BirthProfile;
}

function formatGender(gender: string): string {
  if (gender === "male") return "male";
  if (gender === "female") return "female";
  return "any";
}

// Split "Emma Carter" → { given: "Emma", family: "Carter" }; "Mary Jane Watson"
// → { given: "Mary Jane", family: "Watson" }; "Emma" alone → { given: "Emma",
// family: null }. Last whitespace-delimited token is treated as the family
// name in Western convention; everything before it is the given/middle.
function parseEnglishName(raw: string): ParsedName {
  const trimmed = raw.trim();
  const tokens = trimmed.split(/\s+/).filter(Boolean);
  if (tokens.length <= 1) {
    return { given: tokens[0] ?? "", family: null, hasFamily: false };
  }
  const family = tokens[tokens.length - 1];
  const given = tokens.slice(0, -1).join(" ");
  return { given, family, hasFamily: true };
}

function normalizeAscii(s: string): string {
  return s.toLowerCase().replace(/[^a-z]/g, "");
}

function buildSurnameCandidates(seedLetter: string): CharacterTriple[] {
  return SURNAME_CANDIDATES[seedLetter] ?? SURNAME_CANDIDATES.l;
}

function buildSoundCandidates(normalized: string, gender: string): CharacterTriple[] {
  const out: CharacterTriple[] = [];
  const seen = new Set<string>();

  const sortedKeys = Object.keys(SOUND_CANDIDATES).sort((a, b) => b.length - a.length);
  for (const key of sortedKeys) {
    if (normalized.includes(key)) {
      for (const triple of SOUND_CANDIDATES[key]) {
        if (!seen.has(triple[0])) {
          seen.add(triple[0]);
          out.push(triple);
        }
      }
    }
  }

  for (const letter of normalized) {
    for (const triple of LETTER_CANDIDATES[letter] ?? []) {
      if (!seen.has(triple[0])) {
        seen.add(triple[0]);
        out.push(triple);
      }
    }
  }

  const accents: Record<string, CharacterTriple[]> = {
    male: [["宸", "Chén", "dignified presence"], ["轩", "Xuān", "elevated bearing"], ["川", "Chuān", "open flowing energy"]],
    female: [["雅", "Yǎ", "refined elegance"], ["宁", "Níng", "serenity"], ["岚", "Lán", "misty grace"]],
    any: [["安", "Ān", "peace"], ["清", "Qīng", "clarity"], ["和", "Hé", "harmony"]],
  };

  for (const triple of accents[gender] ?? accents.any) {
    if (!seen.has(triple[0])) {
      seen.add(triple[0]);
      out.push(triple);
    }
  }

  return out.slice(0, 10);
}

function buildHourBranch(birthTime: string | undefined): { branch: string; element: string; window: string } | null {
  if (!birthTime) return null;

  const parts = birthTime.split(":");
  const hour = parseInt(parts[0] ?? "", 10);
  if (Number.isNaN(hour)) return null;

  const normalizedHour = hour === 24 ? 0 : hour;
  let branch: string, element: string, window: string;

  if (normalizedHour === 23 || normalizedHour === 0) {
    [branch, element, window] = HOUR_WINDOWS[0];
  } else {
    const index = Math.floor((normalizedHour + 1) / 2) % 12;
    [branch, element, window] = HOUR_WINDOWS[index];
  }

  return { branch, element, window };
}

function buildBirthProfile(birthDate: string, birthTime: string | undefined): BirthProfile {
  const birth = new Date(`${birthDate}T00:00:00Z`);
  const month = birth.getUTCMonth() + 1;

  let season: string;
  let dominant: string;
  let support: string[];

  if ([12, 1, 2].includes(month)) {
    season = "winter";
    dominant = "Water";
    support = ["Wood", "Fire"];
  } else if ([3, 4, 5].includes(month)) {
    season = "spring";
    dominant = "Wood";
    support = ["Fire", "Earth"];
  } else if ([6, 7, 8].includes(month)) {
    season = "summer";
    dominant = "Fire";
    support = ["Earth", "Metal"];
  } else {
    season = "autumn";
    dominant = "Metal";
    support = ["Water", "Wood"];
  }

  const day = birth.getUTCDate();
  const solarYear = (month < 2 || (month === 2 && day < 4)) ? birth.getUTCFullYear() - 1 : birth.getUTCFullYear();
  const cycleIndex = ((solarYear - 1984) % 60 + 60) % 60;
  const [stemChar, stemElement] = HEAVENLY_STEMS[cycleIndex % 10];
  const [branchChar, branchElement, zodiac] = EARTHLY_BRANCHES[cycleIndex % 12];
  const hourBranch = buildHourBranch(birthTime);

  const elementScores: Record<string, number> = {
    Wood: 0, Fire: 0, Earth: 0, Metal: 0, Water: 0,
  };
  elementScores[dominant] += 2;
  for (const e of support) elementScores[e] += 1;
  elementScores[stemElement] += 1;
  elementScores[branchElement] += 1;
  if (hourBranch) elementScores[hourBranch.element] += 1;

  const balancingElements = Object.keys(elementScores)
    .sort((a, b) => elementScores[a] - elementScores[b] || a.localeCompare(b))
    .slice(0, 2);
  const balancingImages = balancingElements.map((e) => ELEMENT_IMAGES[e]).join(", ");

  const timeLine = hourBranch
    ? ` Birth hour leans toward the ${hourBranch.branch} branch (${hourBranch.element}, ${hourBranch.window}).`
    : " Birth hour was not provided, so the reading uses date-based seasonality only.";

  // Cultural reading: 后天八卦 trigrams for the season + zodiac traits +
  // a representative seasonal classical line. These give the model real
  // literary anchors instead of vague element words.
  const trigrams = SEASON_TRIGRAMS[season] ?? [];
  const trigramSummary = trigrams
    .map((t) => `${t.name}卦 (${t.glyph} ${t.image}, ${t.archetype})`)
    .join("; ");
  const zodiacEntry = ZODIAC_TRAITS[zodiac] ?? { traits: "", imagery: "" };
  // Pick a deterministic classical line so two requests for the same season
  // don't oscillate randomly.
  const refs = SEASONAL_CLASSICAL_REFS[season] ?? [];
  const classicalRef = refs.length
    ? refs[((solarYear + cycleIndex) % refs.length + refs.length) % refs.length]
    : "";

  return {
    season,
    dominant,
    support,
    yearGZ: `${stemChar}${branchChar}`,
    zodiac,
    zodiacTraits: zodiacEntry.traits,
    zodiacImagery: zodiacEntry.imagery,
    hourBranch: hourBranch?.branch ?? null,
    trigrams,
    classicalRef,
    balancingElements,
    balancingImages,
    summary:
      `${stemChar}${branchChar} year, 生肖 ${zodiac} (${zodiacEntry.traits}). ` +
      `${season.charAt(0).toUpperCase() + season.slice(1)} qi, ${dominant} dominant; ` +
      `seasonal trigrams: ${trigramSummary}. ` +
      `Helpful balancing emphasis: ${balancingElements.join(", ")} (${balancingImages}).${timeLine}`,
  };
}

function isGenericResult(parsed: Record<string, unknown>): boolean {
  const chineseName = String(parsed.chineseName ?? "").trim();
  const cultural = String(parsed.culturalExplanation ?? "").trim();
  const pronunciation = String(parsed.pronunciationMapping ?? "").trim();
  const element = String(parsed.elementAnalysis ?? "").trim();

  if (GENERIC_NAME_BLACKLIST.has(chineseName)) return true;
  if (cultural === "This name was chosen based on traditional Chinese naming principles.") return true;
  if (!pronunciation || !element) return true;

  return false;
}

function buildFallbackName(ctx: FallbackContext): NameGenerationResult {
  const seedSource = ctx.normalizedFamily || ctx.normalizedGiven;
  const seed =
    [...seedSource].reduce((acc, ch) => acc + ch.charCodeAt(0), 0) || 1;
  const surnamePool = ctx.surnameCandidates.slice(0, 2).length > 0
    ? ctx.surnameCandidates.slice(0, 2)
    : ctx.surnameCandidates;
  const sounds = ctx.soundCandidates;

  const surname = surnamePool[seed % surnamePool.length];

  const firstGiven = (() => {
    for (let offset = 0; offset < sounds.length; offset++) {
      const candidate = sounds[(seed + offset) % sounds.length];
      if (candidate[0] !== surname[0] && candidate[1] !== surname[1]) return candidate;
    }
    return sounds[0];
  })();

  const secondGiven = (() => {
    for (let offset = 1; offset <= sounds.length; offset++) {
      const candidate = sounds[(seed + offset) % sounds.length];
      if (candidate[0] !== surname[0] && candidate[0] !== firstGiven[0] && candidate[1] !== surname[1] && candidate[1] !== firstGiven[1]) {
        return candidate;
      }
    }
    return sounds[0];
  })();

  const chineseName = `${surname[0]}${firstGiven[0]}${secondGiven[0]}`;
  const pinyin = `${surname[1]} ${firstGiven[1]} ${secondGiven[1]}`;

  return {
    chineseName,
    pinyin,
    meaning: `A name suggesting ${firstGiven[2]} and ${secondGiven[2]}`,
    culturalExplanation:
      `This name pairs the surname ${surname[0]} with a given name shaped by the sound and mood of ` +
      `${ctx.englishName}. It stays natural in Mandarin while keeping the tone elegant and memorable.`,
    pronunciationMapping:
      `The surname ${surname[0]} echoes the opening sound of ${ctx.englishName}, while ` +
      `${firstGiven[0]} and ${secondGiven[0]} preserve the rhythm and mood of the original name.`,
    elementAnalysis: ctx.birthProfile.summary,
    suggestedCharacters: [
      { character: surname[0], meaning: surname[2] },
      { character: firstGiven[0], meaning: firstGiven[2] },
      { character: secondGiven[0], meaning: secondGiven[2] },
    ],
  };
}

function normalizeResponse(parsed: Record<string, unknown>, ctx: FallbackContext): NameGenerationResult {
  const chineseName = String(parsed.chineseName ?? "").trim();

  if (!chineseName) {
    console.warn("[name-generator] AI returned no chineseName, using fallback");
    return buildFallbackName(ctx);
  }

  const chars = [...chineseName];
  if (chars.length < 2 || chars.length > 4) {
    console.warn("[name-generator] AI chineseName has unusual length:", chineseName, "→ fallback");
    return buildFallbackName(ctx);
  }

  // Repair suggestedCharacters if the model returned a length mismatch — this
  // is by far the most common shape failure in practice. We trust the
  // chineseName as ground truth and pull meanings from whatever the model
  // did provide, otherwise leave a short generic gloss.
  const suggestedRaw: unknown[] = Array.isArray(parsed.suggestedCharacters)
    ? (parsed.suggestedCharacters as unknown[])
    : [];

  const characters: SuggestedCharacter[] = chars.map((ch, idx) => {
    const item = suggestedRaw[idx];
    if (item && typeof item === "object") {
      const m = String((item as Record<string, unknown>).meaning ?? "").trim();
      if (m) return { character: ch, meaning: m };
    }
    // Look up a fallback meaning from our pools
    for (const triple of ctx.surnameCandidates) {
      if (triple[0] === ch) return { character: ch, meaning: triple[2] };
    }
    for (const triple of ctx.soundCandidates) {
      if (triple[0] === ch) return { character: ch, meaning: triple[2] };
    }
    return { character: ch, meaning: "—" };
  });

  // Require the core descriptive fields. If two or more are missing, the
  // response is likely truncated and we should fall back rather than show
  // half a name.
  const fields = {
    pinyin: String(parsed.pinyin ?? "").trim(),
    meaning: String(parsed.meaning ?? "").trim(),
    culturalExplanation: String(parsed.culturalExplanation ?? "").trim(),
    pronunciationMapping: String(parsed.pronunciationMapping ?? "").trim(),
    elementAnalysis: String(parsed.elementAnalysis ?? "").trim(),
  };
  const missing = Object.entries(fields).filter(([, v]) => !v).map(([k]) => k);
  if (missing.length >= 2) {
    console.warn("[name-generator] AI response missing fields:", missing, "→ fallback");
    return buildFallbackName(ctx);
  }
  // For single missing fields, fill with a minimal placeholder so the
  // result still renders.
  for (const k of missing) {
    (fields as Record<string, string>)[k] = "—";
  }

  // classicalAllusion is optional — only surface if the model produced a
  // non-empty string that actually looks like a quotation (contains 《 》 or
  // single quote markers). Never invent one ourselves.
  const rawAllusion = String(parsed.classicalAllusion ?? "").trim();
  const classicalAllusion =
    rawAllusion && rawAllusion !== "—" && rawAllusion.length >= 8
      ? rawAllusion
      : undefined;

  return {
    chineseName,
    pinyin: fields.pinyin,
    meaning: fields.meaning,
    culturalExplanation: fields.culturalExplanation,
    pronunciationMapping: fields.pronunciationMapping,
    elementAnalysis: fields.elementAnalysis,
    classicalAllusion,
    suggestedCharacters: characters,
  };
}

function parseModelText(responseText: string): Record<string, unknown> {
  let cleaned = responseText.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
  }

  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    try {
      return JSON.parse(cleaned.slice(start, end + 1));
    } catch {
      // fall through
    }
  }
  try {
    return JSON.parse(cleaned);
  } catch {
    return {};
  }
}

const SYSTEM_PROMPT = `你是一位资深中文起名先生 — a senior Chinese naming sage with the instincts of a 文人. You write Chinese names for Westerners the way a Chinese grandparent would: names that sit naturally on the tongue, carry classical imagery, and make the recipient feel they've been quietly given something true.

THE STANDARD: 信达雅 (Yan Fu's three principles, applied to naming)
  • 信 (FAITHFUL) — preserves the sound and feel of the original name without literal transliteration.
  • 达 (EXPRESSIVE) — reads as natural Mandarin; the two given-name characters form ONE coherent image or short literary phrase, not two stapled virtues.
  • 雅 (ELEGANT) — draws from real classical imagery (诗经, 楚辞, 论语, 易经, 唐诗, 宋词); never a kindergarten-roll-call name.

CULTURAL TOOLKIT (use as guides, not fortune-telling)
  • 五行 五元素: lean into or compensate for the season's dominant element through character imagery.
  • 后天八卦: each season has its trigrams (☳震 thunder/awakening, ☴巽 wind/gentle penetration, ☲离 fire/brightness, ☱兑 lake/joyousness, ☰乾 heaven/creative, ☵坎 water/depth, ☶艮 mountain/stillness). Use the archetype to inform the name's mood.
  • 生肖: 鼠 clever, 牛 patient, 虎 magnetic, 兔 refined, 龙 noble, 蛇 wise, 马 free-spirited, 羊 artistic, 猴 inventive, 鸡 articulate, 狗 loyal, 猪 sincere — let the year-animal subtly color the choice.
  • 经典引语: better to quote one real line correctly than to gesture vaguely at "ancient wisdom."

HARD CONSTRAINTS
  • NO transliterations: 艾玛, 麦克, 约翰, 大卫, 莉莉.
  • NO placeholder names: 李明, 王伟, 张伟, 李华, 王芳, 张敏, 李娜. Don't use 王 unless 王 is in the recommended pool.
  • NO lazy endings (明 / 伟 / 芳 / 娜 / 强) unless the semantics are exceptional.
  • Surname comes from the recommended pool with strong preference.
  • 3 characters preferred (1 surname + 2-character given name).

OUTPUT: ONE valid JSON object only. No prose outside the JSON, no markdown fences.`;

const FEW_SHOT_EXAMPLES = `Two examples of the 信达雅 bar to clear:

Example A — full name (姓 mapped from family name):
  Input: "Emma Carter", female, spring (Wood dominant), 乙亥 year (Pig)
  GOOD: 柯雅琳 (Kē Yǎ Lín)
    • 信: 柯 (Kē) takes its initial from "Carter"; 雅琳 echoes the rhythm of "Emma".
    • 达: 雅琳 reads as one phrase — "elegant jade" — not two stapled virtues.
    • 雅: 雅 (风雅 in 诗经/论语) + 琳 (fine jade, recalling 君子比德如玉). Trigram 巽 (wind) softens the Pig-year sincerity.
  BAD: 艾玛卡特 (transliterating both halves) / 王芳 (placeholder, ignores "Carter").

Example B — only a given name provided (no family name):
  Input: "Emma" (no last name), female, spring, 乙亥 year (Pig)
  GOOD: 苏雅琳 (Sū Yǎ Lín)
    • 信: with no family name to map, 苏 is a graceful pool surname; the focus falls on 雅琳 echoing "Emma" in feel.
    • 达 / 雅: same as Example A.
  Note: in this mode you may also return a 2-character given-name-only result (e.g. 雅琳) if it reads more naturally than appending a forced surname.`;

// We run the naming route on Vercel's Edge runtime which gives 30s on Hobby
// and longer on Pro. We race the API call against a hard timeout slightly
// shorter than that so we can fall back gracefully without 504-ing.
// On Pro you can extend NAME_AI_TIMEOUT_MS via env to e.g. 60000.
const DEFAULT_TIMEOUT_MS = 27000;

interface MiniMaxChatResponse {
  choices?: Array<{
    finish_reason?: string;
    message?: {
      content?: string;
      reasoning_content?: string;
    };
  }>;
  base_resp?: { status_code?: number; status_msg?: string };
}

async function callClaude(prompt: string): Promise<string> {
  const apiKey = process.env.MINIMAX_API_KEY ?? process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("MINIMAX_API_KEY / ANTHROPIC_API_KEY is not configured");

  // Native MiniMax endpoint — keeps reasoning_content out of the main `content`
  // field so the model's chain-of-thought doesn't eat our token budget. The
  // Anthropic-compat layer at /anthropic/v1/messages mixes thinking blocks
  // into content and routinely 700-token-truncates the actual JSON.
  const apiBase = process.env.MINIMAX_API_BASE || "https://api.minimaxi.com";
  const model = process.env.MINIMAX_MODEL || "MiniMax-M2";
  const timeoutMs = Number(process.env.NAME_AI_TIMEOUT_MS) || DEFAULT_TIMEOUT_MS;

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
        max_tokens: 2500, // reasoning + final JSON; content is separately surfaced
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: prompt },
        ],
      }),
      signal: ctrl.signal,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`MiniMax HTTP ${res.status}: ${text.slice(0, 300)}`);
    }

    const json = (await res.json()) as MiniMaxChatResponse;
    if (json.base_resp && json.base_resp.status_code && json.base_resp.status_code !== 0) {
      throw new Error(`MiniMax error ${json.base_resp.status_code}: ${json.base_resp.status_msg ?? ""}`);
    }
    const content = json.choices?.[0]?.message?.content ?? "";
    if (!content) throw new Error("MiniMax returned empty content");
    return content;
  } finally {
    clearTimeout(timeout);
  }
}

function buildPrompt(input: NameGenerationInput, ctx: FallbackContext): string {
  const { englishName, birthDate, birthTime } = input;
  const gender = formatGender(input.gender);
  const [year, month, day] = birthDate.split("-");
  const surnamePrompt = ctx.surnameCandidates.slice(0, 6).map(([c, p, m]) => `${c} (${p}, ${m})`).join(", ");
  const soundPrompt = ctx.soundCandidates.slice(0, 8).map(([c, p, m]) => `${c} (${p}, ${m})`).join(", ");
  const birthTimeLine = birthTime || "not provided";
  const profile = ctx.birthProfile;

  // Two very different naming jobs depending on whether the visitor gave us
  // a family name. With one: derive 姓 from the family name's phonetic root,
  // and the given name from the given name's sound — exactly how a Chinese
  // grandparent would do it. Without one: there's no surname to map, so we
  // pick a 姓 from the candidate pool and tell the model to pick a given
  // name that matches the lone given name's sound.
  const nameRoleBlock = ctx.parsedName.hasFamily
    ? `THE NAME (full name provided)
  • Given / first name: ${ctx.parsedName.given}
  • Family / last name: ${ctx.parsedName.family}
  • Naming rule: derive the Chinese 姓 from the phonetic root of "${ctx.parsedName.family}" — pick a real Chinese surname whose initial sound (or close cognate) echoes "${ctx.parsedName.family}". The two given-name characters should echo the sound and feel of "${ctx.parsedName.given}". The recommended surnames below are anchored on "${ctx.parsedName.family}" — strongly prefer one of them.`
    : `THE NAME (only a given name provided — no family name)
  • Given / first name: ${ctx.parsedName.given || englishName}
  • Family / last name: (not provided)
  • Naming rule: the visitor did not provide a family name, so there is no surname to phonetically map. Pick a 姓 from the recommended pool that pairs gracefully with the given-name sound; the focus of 信 (faithfulness) falls on the two given-name characters echoing "${ctx.parsedName.given || englishName}". A 2-character given-name-only output is acceptable in this case if it reads more naturally than appending a forced surname.`;

  const trigramLines = profile.trigrams.length
    ? profile.trigrams
        .map((t) => `  • ${t.name}卦 ${t.glyph} — ${t.image}, ${t.archetype} (${t.element})`)
        .join("\n")
    : "  • (no seasonal trigram available)";

  return `${FEW_SHOT_EXAMPLES}

Now compose ONE name for this person, holding to 信达雅:

THE PERSON
  • English name: ${englishName}
  • Gender: ${gender}
  • Birth date: ${year}-${month}-${day}${birthTime ? ` (birth time: ${birthTimeLine})` : ""}

${nameRoleBlock}

THE 八字 / 五行 / 生肖 READING
  • 干支 (year stem-branch): ${profile.yearGZ}
  • 生肖: ${profile.zodiac} — ${profile.zodiacTraits}; imagery cues: ${profile.zodiacImagery}
  • Season: ${profile.season}; dominant element: ${profile.dominant}
  • Balancing elements (what's missing, lean here): ${profile.balancingElements.join(" / ")}
  • Element imagery to consider: ${profile.balancingImages}
${profile.hourBranch ? `  • Birth hour branch: ${profile.hourBranch}` : ""}

THE 八卦 (seasonal trigrams, use the archetype to set the name's mood)
${trigramLines}

CLASSICAL ANCHOR FOR THE SEASON
  • ${profile.classicalRef || "(none)"}

PHONETIC CANDIDATES (your starting palette — deviate only with a real reason)
  • Recommended surnames: ${surnamePrompt}
  • Given-name sounds: ${soundPrompt}

CHECKLIST BEFORE YOU LOCK IN THE NAME
  1. 信 — ${ctx.parsedName.hasFamily
      ? `the Chinese 姓 echoes "${ctx.parsedName.family}", and the two given-name characters echo "${ctx.parsedName.given}"`
      : `the Chinese name (姓 + given) carries an audible echo of "${englishName}"`} — not letter-by-letter, but in rhythm/feel.
  2. 达 — do the two given-name characters form ONE image or short literary phrase? If you can't write a single sentence in Chinese describing the image they make together, reject and try again.
  3. 雅 — does the name draw from real classical imagery — 诗经 / 楚辞 / 论语 / 唐诗 / 宋词 / 易经? Avoid generic virtue-words (明, 伟, 芳, 强).
  4. NOT a transliteration (艾玛, 麦克, 约翰). NOT a placeholder (李明, 王伟, 张敏).
  5. The surname comes from the recommended pool unless you can defend the deviation.

OUTPUT FORMAT — return ONE valid JSON object, nothing else, no markdown fences:
{
  "chineseName": "exactly 3 Chinese characters (2 only if very strong)",
  "pinyin": "Pīn Yīn Yīn — with tone marks, space-separated",
  "meaning": "8-15 word English phrase that captures the WHOLE name as a single image",
  "culturalExplanation": "2-4 sentences on the cultural elegance — name the imagery the given-name characters create together, reference the trigram archetype if it shaped the choice, mention 信达雅 fit explicitly",
  "pronunciationMapping": "1-2 sentences mapping which Chinese syllables echo which parts of \\"${englishName}\\"",
  "elementAnalysis": "1-2 sentences naming the season, dominant element, the year's 生肖 quality, and how the chosen characters balance or amplify the profile",
  "classicalAllusion": "optional: ONE short literary line (10-25 words) connecting the name to a real Chinese classical work — 出自 ⟨source⟩: '⟨original line⟩' — with a quick gloss. Leave empty string if you cannot find a genuine fit; never fabricate a quote.",
  "suggestedCharacters": [
    {"character": "<surname char>", "meaning": "natural English meaning of this character — 6-12 words"},
    {"character": "<given char 1>", "meaning": "natural English meaning"},
    {"character": "<given char 2>", "meaning": "natural English meaning"}
  ]
}`;
}

export async function generateName(input: NameGenerationInput): Promise<NameGenerationResult> {
  const parsedName = parseEnglishName(input.englishName);
  const normalizedGiven = normalizeAscii(parsedName.given);
  const normalizedFamily = normalizeAscii(parsedName.family ?? "");

  // When the visitor gave us a family name, anchor the Chinese surname on
  // its first letter (e.g. "Carter" → C-pool: 蔡/柯/曹). When they only gave
  // a single given name, fall back to the given name's first letter so
  // we still produce something — but the prompt makes that distinction
  // explicit so the model knows whether the surname is grounded or guessed.
  const surnameSeedLetter =
    (normalizedFamily.slice(0, 1) || normalizedGiven.slice(0, 1) || "l");
  const surnameCandidates = buildSurnameCandidates(surnameSeedLetter);
  const soundCandidates = buildSoundCandidates(
    normalizedGiven || normalizedFamily,
    formatGender(input.gender),
  );
  const birthProfile = buildBirthProfile(input.birthDate, input.birthTime);

  const ctx: FallbackContext = {
    englishName: input.englishName,
    parsedName,
    normalizedGiven,
    normalizedFamily,
    surnameCandidates,
    soundCandidates,
    birthProfile,
  };

  const prompt = buildPrompt(input, ctx);

  let parsed: Record<string, unknown> = {};
  try {
    const text = await callClaude(prompt);
    parsed = parseModelText(text);
  } catch (err) {
    console.error("Claude API call failed, using fallback:", err);
    return buildFallbackName(ctx);
  }

  // Retry budget: skip the retry when the function timeout is tight (Hobby
  // plan), because a second call can't fit within the same invocation.
  const allowRetry = (Number(process.env.NAME_AI_TIMEOUT_MS) || DEFAULT_TIMEOUT_MS) >= 25000;

  if (allowRetry && isGenericResult(parsed)) {
    const retryPrompt = `${prompt}

Your last answer was too generic or incomplete. Try again with a name that is more distinctive for ${input.englishName}.
Hard constraints for the retry:
- Avoid 李明 / 王伟 / 张伟 / 李华 / 王芳 and similar textbook defaults
- Keep the surname close to this candidate pool: ${surnameCandidates.slice(0, 6).map(([c]) => c).join(", ")}
- Make the given name feel personally matched to ${input.englishName}, not randomly generic
- Use the birth profile, especially ${birthProfile.balancingElements.join(", ")}, in the semantics
- Return JSON only`;

    try {
      const retryText = await callClaude(retryPrompt);
      parsed = parseModelText(retryText);
    } catch (err) {
      console.error("Claude retry failed, using fallback:", err);
      return buildFallbackName(ctx);
    }
  }

  return normalizeResponse(parsed, ctx);
}
