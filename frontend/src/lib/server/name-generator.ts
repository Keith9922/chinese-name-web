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

interface FallbackContext {
  englishName: string;
  normalizedName: string;
  surnameCandidates: CharacterTriple[];
  soundCandidates: CharacterTriple[];
  birthProfile: BirthProfile;
}

function formatGender(gender: string): string {
  if (gender === "male") return "male";
  if (gender === "female") return "female";
  return "any";
}

function normalizeEnglishName(englishName: string): string {
  return englishName.toLowerCase().replace(/[^a-z]/g, "");
}

function buildSurnameCandidates(normalized: string): CharacterTriple[] {
  const initial = normalized.slice(0, 1) || "l";
  return SURNAME_CANDIDATES[initial] ?? SURNAME_CANDIDATES.l;
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
  const seed =
    [...ctx.normalizedName].reduce((acc, ch) => acc + ch.charCodeAt(0), 0) || 1;
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

const SYSTEM_PROMPT = `你是一位资深中文起名先生 (a senior Chinese naming sage), with the literary instincts of a 文人 and the cultural depth of a 易经 reader. You give Westerners Chinese names the way a Chinese grandparent would — names that sit naturally on a Chinese tongue, carry meaning rooted in classical imagery, and make the recipient feel they have been quietly given something true.

THE STANDARD: 信达雅 (Yan Fu's three principles, applied to naming)

  • 信 (FAITHFUL) — the name preserves the essence of the original English name: its sound, its rhythm, the kind of person it suggests. The Chinese ear should hear an echo of the English without it being a literal transliteration.
  • 达 (EXPRESSIVE) — the name reads as natural Mandarin, not a foreign-feeling assembly. A Chinese friend hearing it for the first time should not pause and think "that sounds translated." Two given-name characters must form one coherent image or short literary phrase, not two unrelated virtues stapled together.
  • 雅 (ELEGANT) — the name has 文化底蕴 (cultural depth). It draws from classical imagery — 诗经, 楚辞, 论语, 易经, 唐诗, 宋词 — and lands as something one might find in a literary work, not a kindergarten roll-call.

YOUR CULTURAL TOOLKIT (use as guides, never as fortune-telling)

  • 五行 (Five Elements): Wood 木 / Fire 火 / Earth 土 / Metal 金 / Water 水. The birth season weights one element; the name's character imagery can either lean into the dominant element or compensate for what's lacking.
  • 八卦 / 后天八卦 (Eight Trigrams of the latter heaven): each season has its trigrams. ☳震 (thunder, awakening), ☴巽 (wind, gentle penetration), ☲离 (fire, brightness), ☷坤 (earth, receptive), ☱兑 (lake, joyousness), ☰乾 (heaven, creative), ☵坎 (water, abyss/depth), ☶艮 (mountain, stillness). Use the trigram archetype to inform the mood of the given-name characters.
  • 生肖 (Twelve Zodiac): the year-animal's traits — 鼠 clever, 牛 patient, 虎 magnetic, 兔 refined, 龙 noble, 蛇 wise, 马 free-spirited, 羊 artistic, 猴 inventive, 鸡 articulate, 狗 loyal, 猪 sincere — should subtly color the given-name choice.
  • 八字 / 天干地支: the year stem-branch is supplied. Don't preach about it; just let it color the name's element balance.
  • 经典引语: when a real classical line fits, weave it in. Better to quote 蒹葭苍苍 once correctly than to gesture vaguely at "ancient wisdom."

HARD CONSTRAINTS

  • NO transliterations: 艾玛, 麦克, 约翰, 大卫, 莉莉 — these are NOT acceptable, regardless of phonetic match.
  • NO placeholder names: 李明, 王伟, 张伟, 李华, 王芳, 张敏, 王刚, 李娜, 张磊 are HARD-BANNED. Do not use 王 as a surname unless 王 is explicitly in the recommended surname pool AND there is no better phonetic match.
  • NO lazy endings unless their semantics are clearly justified by the explanation: 明 / 伟 / 芳 / 娜 / 强 / 平 / 红.
  • Surname comes from the recommended pool with strong preference; deviation requires a real phonetic reason in the explanation.
  • Three-character names preferred (1 surname + 2-character given name). Two-character names only if the 2-character given name is genuinely strong on its own.

OUTPUT
Return ONE single valid JSON object. No prose outside the JSON, no markdown fences, no leading commentary.`;

const FEW_SHOT_EXAMPLES = `Three examples of the 信达雅 bar to clear. Each shows the reasoning, not just the answer.

Example A — Emma, female, spring, 乙亥 year (Pig)
GOOD: 苏雅琳 (Sū Yǎ Lín)
  • 信: Sū's soft sibilant echoes the M-murmur of "Emma"; Lín closes on a clear vowel like "Em-ma → Yǎ-Lín".
  • 达: 雅琳 reads as one phrase — "elegant jade" — not two stapled virtues. A Chinese person hearing it would simply hear a graceful woman's name.
  • 雅: 雅 (elegance, 风雅) appears across 诗经 / 论语 as the literary refinement; 琳 (fine jade) carries 君子比德如玉 (a noble person measures their virtue in jade). The pairing evokes 林深时见鹿 — the spring-Wood quietude of woods. Trigram 巽 (wind) softens the year-Pig's sincere warmth.
BAD: 艾玛 — pure phonetic, no soul. 王芳 — kindergarten-default.

Example B — Michael, male, summer, 庚午 year (Horse)
GOOD: 麦瑞文 (Mài Ruì Wén)
  • 信: Mài catches the Mi- of "Mike" with the same plosive snap; the three syllables Mài-Ruì-Wén match Michael's three-syllable rhythm.
  • 达: 瑞文 = "auspicious literacy" — a coherent given name, the kind of name a Chinese parent might actually choose for a thoughtful son.
  • 雅: 离卦 (fire/brightness) for the summer Horse year suggests a magnetic, articulate young man; 文 echoes 文质彬彬，然后君子 (《论语》 — "balanced and refined, then a gentleman"). 瑞 cools the high-Fire profile with a Metal-clarity quality.
BAD: 迈克尔 — transliterated. 王伟 — placeholder.

Example C — Lily, female, autumn, 庚辰 year (Dragon)
GOOD: 黎清岚 (Lí Qīng Lán)
  • 信: Lí for the L-onset; the soft -ī-ī of "Lily" lives in 清岚's two -í-án vowels.
  • 达: 清岚 = "dawn-clear mountain mist" — one image, not two ideas. Reads as a poet's name.
  • 雅: 兑卦 (lake, joyousness) for autumn-Metal — but 清岚's water imagery softens the Metal sharpness. Echoes the 楚辞 line 山中兮夕阳，岚气兮欲降 (mountain mist descending at dusk). Dragon-year quality: noble without being loud.
BAD: 莉莉 — transliteration that is also visually awkward. 张敏 — placeholder.`;

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
  1. 信 — does the Chinese name carry an audible echo of "${englishName}"? Not letter-by-letter, but in rhythm/feel.
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
  const normalized = normalizeEnglishName(input.englishName);
  const surnameCandidates = buildSurnameCandidates(normalized);
  const soundCandidates = buildSoundCandidates(normalized, formatGender(input.gender));
  const birthProfile = buildBirthProfile(input.birthDate, input.birthTime);

  const ctx: FallbackContext = {
    englishName: input.englishName,
    normalizedName: normalized,
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
