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
  const suggestedRaw = parsed.suggestedCharacters;

  if (!chineseName || !Array.isArray(suggestedRaw)) return buildFallbackName(ctx);
  if ([...chineseName].length !== suggestedRaw.length) return buildFallbackName(ctx);

  if (!ctx.surnameCandidates.some((triple) => chineseName.startsWith(triple[0]))) {
    return buildFallbackName(ctx);
  }

  const required = {
    pinyin: parsed.pinyin,
    meaning: parsed.meaning,
    culturalExplanation: parsed.culturalExplanation,
    pronunciationMapping: parsed.pronunciationMapping,
    elementAnalysis: parsed.elementAnalysis,
  };
  if (Object.values(required).some((v) => !String(v ?? "").trim())) return buildFallbackName(ctx);

  const characters: SuggestedCharacter[] = [];
  for (const item of suggestedRaw) {
    if (!item || typeof item !== "object") return buildFallbackName(ctx);
    const character = String((item as Record<string, unknown>).character ?? "").trim();
    const meaning = String((item as Record<string, unknown>).meaning ?? "").trim();
    if ([...character].length !== 1 || !meaning) return buildFallbackName(ctx);
    characters.push({ character, meaning });
  }

  if (characters.map((c) => c.character).join("") !== chineseName) return buildFallbackName(ctx);

  return {
    chineseName,
    pinyin: String(required.pinyin).trim(),
    meaning: String(required.meaning).trim(),
    culturalExplanation: String(required.culturalExplanation).trim(),
    pronunciationMapping: String(required.pronunciationMapping).trim(),
    elementAnalysis: String(required.elementAnalysis).trim(),
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

async function callClaude(prompt: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not configured");

  const baseURL = process.env.ANTHROPIC_BASE_URL || "https://api.minimaxi.com/anthropic";
  const model = process.env.MINIMAX_MODEL || "MiniMax-M2";

  const client = new Anthropic({ apiKey, baseURL });

  const response = await client.messages.create({
    model,
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("\n");

  return text;
}

function buildPrompt(input: NameGenerationInput, ctx: FallbackContext): string {
  const { englishName, birthDate, birthTime } = input;
  const gender = formatGender(input.gender);
  const [year, month, day] = birthDate.split("-");
  const surnamePrompt = ctx.surnameCandidates.slice(0, 6).map(([c, p, m]) => `${c} (${p}, ${m})`).join(", ");
  const soundPrompt = ctx.soundCandidates.slice(0, 8).map(([c, p, m]) => `${c} (${p}, ${m})`).join(", ");
  const birthTimeLine = birthTime || "not provided";

  return `You are a senior Chinese naming consultant who combines Mandarin phonetics, literary naming taste, and light 八字 / 五行 reasoning.

Create a distinctive Chinese full name for this person:
- English name: ${englishName}
- Gender: ${gender}
- Birth date: ${year}-${month}-${day}
- Birth time: ${birthTimeLine}
- Approximate birth profile: ${ctx.birthProfile.summary}
- Recommended surname pool based on pronunciation: ${surnamePrompt}
- Recommended given-name sound pool based on pronunciation and mood: ${soundPrompt}

Naming rules:
1. Prefer a 3-character full Chinese name: 1 surname + 2-character given name.
2. The surname must come directly from this recommended surname pool unless there is an overwhelming phonetic reason not to.
3. Do NOT default to ultra-generic names such as 李明, 王伟, 张伟, 李华, 王芳, 王娜, 张敏, 李娜.
4. Never use 王 as the surname unless 王 is inside the surname pool and you clearly explain why it is the best phonetic match.
5. The full name should feel like a real Mandarin name, not a mechanical transliteration or a classroom placeholder.
6. The given name should preserve either the sound, rhythm, or emotional impression of "${englishName}".
7. Use the birth profile as a lightweight 八字 guide: favor imagery connected to ${ctx.birthProfile.balancingElements.join(", ")} and qualities such as ${ctx.birthProfile.balancingImages}.
8. Avoid lazy endings like 明 / 伟 / 芳 / 娜 unless the semantics are unusually well justified.
9. The name should be aesthetically pleasing, easy for Western users to remember, and culturally elegant.
10. Explain both the pronunciation bridge and the birth-profile balance.
11. suggestedCharacters must contain one entry for each Chinese character in chineseName, in order.

Return pure JSON only:
{
  "chineseName": "3 Chinese characters preferred",
  "pinyin": "full pinyin with tone marks",
  "meaning": "natural English gloss of the whole name",
  "culturalExplanation": "2-3 sentences on why this is culturally elegant and suitable",
  "pronunciationMapping": "1-2 sentences on how the Chinese surname and given name echo ${englishName}",
  "elementAnalysis": "1-2 sentences on how the birth date and optional birth time influenced the character choice",
  "suggestedCharacters": [
    {"character": "姓", "meaning": "meaning of the surname character"},
    {"character": "名", "meaning": "meaning of the first given-name character"},
    {"character": "名", "meaning": "meaning of the second given-name character"}
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

  if (isGenericResult(parsed)) {
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
