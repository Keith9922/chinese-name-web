import Anthropic from "@anthropic-ai/sdk";
import {
  CharacterTriple,
  EARTHLY_BRANCHES,
  ELEMENT_IMAGES,
  GENERIC_NAME_BLACKLIST,
  HEAVENLY_STEMS,
  HOUR_WINDOWS,
  LETTER_CANDIDATES,
  SOUND_CANDIDATES,
  SURNAME_CANDIDATES,
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
  suggestedCharacters: SuggestedCharacter[];
}

interface BirthProfile {
  season: string;
  dominant: string;
  support: string[];
  yearGZ: string;
  zodiac: string;
  hourBranch: string | null;
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

  return {
    season,
    dominant,
    support,
    yearGZ: `${stemChar}${branchChar}`,
    zodiac,
    hourBranch: hourBranch?.branch ?? null,
    balancingElements,
    balancingImages,
    summary:
      `Approximate birth profile points to a ${stemChar}${branchChar} year (${zodiac}) with ${season} qi leaning toward ${dominant}. ` +
      `Helpful balancing emphasis can come from ${balancingElements.join(", ")} through imagery of ${balancingImages}.${timeLine}`,
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

  return {
    chineseName,
    pinyin: fields.pinyin,
    meaning: fields.meaning,
    culturalExplanation: fields.culturalExplanation,
    pronunciationMapping: fields.pronunciationMapping,
    elementAnalysis: fields.elementAnalysis,
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

const SYSTEM_PROMPT = `You are a senior Chinese naming consultant. You write names the way a literate Chinese parent would — listening to the music of the original name, watching the season they were born into, and choosing two characters whose images, when placed next to each other, paint a small picture of the person.

You hold yourself to a strict standard:

— A real name, not a transliteration. The full name must feel like something a Chinese friend would actually call this person, never a mechanical sound-by-sound mapping (no 艾玛, 麦克, 约翰).

— A real name, not a placeholder. Hard-banned: 李明, 王伟, 张伟, 李华, 王明, 张敏, 王芳, 李娜, 张磊, 张伟, 王刚 and any combination that reads like a kindergarten roll-call. Lazy endings 明 / 伟 / 芳 / 娜 / 强 are only acceptable when the semantics are exceptional and clearly defended.

— Two characters that converse. The given-name characters should pair as imagery — 雅琳 (elegance + jade), 清岚 (clarity + mountain mist), 宇辰 (vast sky + dignified hour). Each adds to the other; together they form a small phrase or scene.

— A surname that sounds right. Pull the surname from the candidate pool unless there's an overwhelming phonetic reason not to. Never default to 王 unless 王 is in the pool AND the L/V/W sound truly matches.

— Birth profile as flavour, not as fortune-telling. Use the 八字 / 五行 imagery as a lightweight compass for character choice. Don't moralise; don't predict the future. Just lean toward the elements that balance.

— Aesthetic above all else. The name should be pleasant on the tongue, elegant in the eye, and easy for a Western speaker to remember and say.

You return ONE single JSON object. No prose, no markdown fences, no commentary outside the JSON.`;

const FEW_SHOT_EXAMPLES = `Examples of the bar to clear:

Input: Emma, female, spring birth (Wood dominant)
Good: 苏雅琳 (Sū Yǎ Lín). Sū opens softly like the M of "Emma"; 雅琳 = "elegance and jade-green woods", a spring-Wood image of a graceful woman in a young forest.
Bad: 艾玛 (Ài Mǎ) — pure transliteration, no Chinese soul. 王芳 — placeholder.

Input: Michael, male, summer birth (Fire dominant; balance toward Water)
Good: 麦瑞文 (Mài Ruì Wén). Mài echoes "Mike"; 瑞文 = "auspicious and literate", giving the high-energy Fire profile a measured Water-like inwardness.
Bad: 迈克尔 (Mài Kè'ěr) — transliteration. 王伟 — placeholder.

Input: Lily, female, autumn birth (Metal dominant; balance toward Wood/Water)
Good: 黎清岚 (Lí Qīng Lán). Lí for the L-sound; 清岚 = "clear mountain mist" — water imagery softens the Metal autumn, lily-like in clarity.
Bad: 莉莉 (Lì lì) — transliteration. 张敏 — placeholder.`;

// Vercel Hobby caps serverless functions at 10s of execution. The AI call
// alone often exceeds that, so we race it against a hard timeout and fall
// back to the deterministic naming algorithm if the model is too slow.
// On Pro you can extend NAME_AI_TIMEOUT_MS via env to (say) 50000 and let
// the model take its time.
const DEFAULT_TIMEOUT_MS = 9000;

async function callClaude(prompt: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not configured");

  const baseURL = process.env.ANTHROPIC_BASE_URL || "https://api.minimaxi.com/anthropic";
  // Default to the speed-optimised variant — the standard model frequently
  // takes 30-60s on MiniMax which exceeds Vercel Hobby's 10s function cap.
  const model = process.env.MINIMAX_MODEL || "MiniMax-M2.7-highspeed";
  const timeoutMs = Number(process.env.NAME_AI_TIMEOUT_MS) || DEFAULT_TIMEOUT_MS;

  const client = new Anthropic({ apiKey, baseURL });

  const ctrl = new AbortController();
  const timeout = setTimeout(() => ctrl.abort(), timeoutMs);

  try {
    const response = await client.messages.create(
      {
        model,
        max_tokens: 700, // names are short; 700 is plenty for the JSON envelope
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: prompt }],
      },
      { signal: ctrl.signal },
    );

    return response.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("\n");
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

  return `${FEW_SHOT_EXAMPLES}

Now compose ONE name for this person:

THE PERSON
- English name: ${englishName}
- Gender: ${gender}
- Birth date: ${year}-${month}-${day}
- Birth time: ${birthTimeLine}
- Birth profile (lightweight 八字 reading): ${ctx.birthProfile.summary}

PHONETIC CANDIDATES (you may deviate only with a real reason)
- Surname pool, ranked by pronunciation match: ${surnamePrompt}
- Given-name sound pool, by sound and mood: ${soundPrompt}

ELEMENTAL DIRECTION
- Balancing elements to lean toward: ${ctx.birthProfile.balancingElements.join(", ")}
- Suggested imagery for the given-name characters: ${ctx.birthProfile.balancingImages}

NAMING REQUIREMENTS
- Three characters total: 1 surname + a 2-character given name.
- The surname must come from the surname pool unless you provide an overwhelming phonetic reason in the explanation.
- The two given-name characters must form a coherent image or short phrase together — not two random virtues.
- Avoid placeholder names (李明 / 王伟 / 张敏 / 李娜 / 王芳 etc.) and avoid the lazy endings 明 / 伟 / 芳 / 娜 / 强.
- Avoid pure transliterations (艾玛 / 迈克 / 约翰).
- The pronunciation mapping must explain how the Chinese sounds echo "${englishName}".
- The element analysis must reference the season and dominant element, and how this name compensates.

OUTPUT FORMAT (return JSON object only — no markdown, no commentary):
{
  "chineseName": "exactly 3 Chinese characters",
  "pinyin": "Pīn Yīn Yīn — with tone marks, space-separated",
  "meaning": "8-15 word natural English phrase glossing the whole name as a single image",
  "culturalExplanation": "2-3 sentences on what makes this name elegant — reference the imagery the two given-name characters create together",
  "pronunciationMapping": "1-2 sentences explicitly mapping which Chinese syllables echo which parts of \\"${englishName}\\"",
  "elementAnalysis": "1-2 sentences naming the birth season, dominant element, and how this name's character imagery balances or complements it",
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
