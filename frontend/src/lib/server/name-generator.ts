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
import { logGmiCall } from "./gmi-log";

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
  /** Full given-name portion as typed, e.g. "Charlotte Elizabeth Diana" — kept for narrative/context only. */
  given: string;
  /** The ONE given name that actually drives phonetic matching, e.g. "Charlotte". Long chains of middle names must never dilute the sound-match pool. */
  primaryGiven: string;
  /** Any middle names beyond the primary one — optional flavor for the model, never used for character selection. */
  extraGivenNames: string[];
  /** Full family-name portion as typed, e.g. "van der Berg" — used for display/narrative. */
  family: string | null;
  /** The single root word used to seed the surname candidate pool, e.g. "Berg" (not "van"). */
  familyAnchor: string | null;
  /** True when the family name spans more than one word (compound/particle surname) — lets the model + copy be transparent about the simplification instead of silently guessing. */
  familyIsCompound: boolean;
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

// Particles that signal "the surname keeps going" across common Western
// naming traditions — Dutch/Afrikaans (van, van der, ten, ter), German (von,
// zu, zum, zur), French (de, du, des, la, le), Portuguese/Spanish (da, do,
// dos, das, de la, del), Italian (di, degli, della), Arabic (al, el, bin,
// ibn, abu, bint), Gaelic (mac, mc, o' — usually unspaced but included for
// safety), and honorific-style particles (st, st., san, santa). Matched
// case-insensitively against a single raw token.
const SURNAME_PARTICLES = new Set([
  "van", "von", "der", "den", "de", "del", "della", "delle", "degli", "dei",
  "la", "le", "los", "las", "el", "al", "bin", "ibn", "abu", "bint",
  "da", "do", "dos", "das", "du", "des",
  "ter", "ten", "af", "av", "zu", "zum", "zur",
  "mac", "mc", "st", "san", "santa",
]);

function isParticle(token: string): boolean {
  return SURNAME_PARTICLES.has(token.toLowerCase().replace(/\.$/, ""));
}

// Handles the long/compound-name problem head-on rather than papering over
// it: a naive "last word = surname" split (fine for "Emma Carter") badly
// mis-splits "Vincent van der Berg" (→ given "Vincent van der", family
// "Berg" is wrong twice over) or a name with several middle names
// ("Charlotte Elizabeth Diana Windsor", where cramming all three given
// names into a 2-character Chinese given name would blur the sound-match
// beyond recognition).
//
// Strategy:
//  1. Walk backward from the last token, absorbing recognized particles
//     ("van", "der", "de la", "al", ...) into the family name — this
//     correctly recovers compounds like "van der Berg" or "Al Rashid".
//  2. Whatever's left before the family block is the given-name portion.
//     Only its FIRST token ("primaryGiven") drives character selection —
//     that's the name a person is actually addressed by day to day, and it
//     keeps the 2-character given name meaningfully tied to ONE real name
//     instead of an unreadable blend of three. Remaining middle names ride
//     along as optional narrative flavor only.
//  3. The surname's phonetic anchor is the last NON-particle word in the
//     family block ("Berg", not "van") — that's the root a Chinese ear
//     would actually key off, matching how "van der Berg" alphabetizes
//     under B in Dutch convention.
//
// Note on scope: for a bare 3-token name with no recognized particle (e.g.
// Spanish/Portuguese dual-surname style "Gabriel García Márquez"), this
// still defaults to the Anglo reading (given "Gabriel García", family
// "Márquez") rather than guessing at Iberian convention — the product's
// primary market is English-speaking users (see SYSTEM_PROMPT's
// pronunciation-accessibility notes), so the common case is optimized for
// correctness; the rarer case still produces a perfectly valid name, just
// anchored on a different word than a Spanish-convention reader might
// expect. A future locale-aware pass (see extraGivenNames/familyIsCompound
// being surfaced already) is the natural place to special-case this.
function parseEnglishName(raw: string): ParsedName {
  const trimmed = raw.trim();
  const tokens = trimmed.split(/\s+/).filter(Boolean);

  if (tokens.length <= 1) {
    const only = tokens[0] ?? "";
    return {
      given: only,
      primaryGiven: only,
      extraGivenNames: [],
      family: null,
      familyAnchor: null,
      familyIsCompound: false,
      hasFamily: false,
    };
  }

  // cut = index of the first token belonging to the family name. Never let
  // it reach 0 — a visitor must keep at least one given-name token, even
  // for a degenerate all-particle input.
  let cut = tokens.length - 1;
  while (cut > 1 && isParticle(tokens[cut - 1])) {
    cut -= 1;
  }

  const givenTokens = tokens.slice(0, cut);
  const familyTokens = tokens.slice(cut);

  const family = familyTokens.join(" ");
  const nonParticleFamilyTokens = familyTokens.filter((t) => !isParticle(t));
  const familyAnchor = nonParticleFamilyTokens[nonParticleFamilyTokens.length - 1] ?? familyTokens[familyTokens.length - 1];

  return {
    given: givenTokens.join(" ") || givenTokens[0] || "",
    primaryGiven: givenTokens[0] ?? "",
    extraGivenNames: givenTokens.slice(1),
    family,
    familyAnchor,
    familyIsCompound: familyTokens.length > 1,
    hasFamily: true,
  };
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

// Tone number (1-4) per vowel, keyed by the tone-marked character. Tone 0 =
// no mark found on the syllable (neutral tone), which is excluded from the
// "three in a row" check since neutral-tone syllables don't carry the
// tone-sandhi problem third tones do.
const TONE_MARK_TO_NUMBER: Record<string, 1 | 2 | 3 | 4> = {
  ā: 1, á: 2, ǎ: 3, à: 4,
  ē: 1, é: 2, ě: 3, è: 4,
  ī: 1, í: 2, ǐ: 3, ì: 4,
  ō: 1, ó: 2, ǒ: 3, ò: 4,
  ū: 1, ú: 2, ǔ: 3, ù: 4,
  ǖ: 1, ǘ: 2, ǚ: 3, ǜ: 4,
};

function syllableTone(syllable: string): 0 | 1 | 2 | 3 | 4 {
  for (const ch of syllable) {
    const tone = TONE_MARK_TO_NUMBER[ch.toLowerCase()];
    if (tone) return tone;
  }
  return 0;
}

// Bare syllable for repetition checks — strip tone marks back to their base
// vowel and lowercase, so "Lín" and "lin" (or "Lǐn") compare equal.
const TONE_MARK_TO_BASE: Record<string, string> = {
  ā: "a", á: "a", ǎ: "a", à: "a",
  ē: "e", é: "e", ě: "e", è: "e",
  ī: "i", í: "i", ǐ: "i", ì: "i",
  ō: "o", ó: "o", ǒ: "o", ò: "o",
  ū: "u", ú: "u", ǔ: "u", ù: "u",
  ǖ: "u", ǘ: "u", ǚ: "u", ǜ: "u",
};

function bareSyllable(syllable: string): string {
  return syllable
    .toLowerCase()
    .split("")
    .map((ch) => TONE_MARK_TO_BASE[ch] ?? ch)
    .join("");
}

// Algorithmic pronunciation-quality gate, independent of whatever the model
// claims about itself — this is the "would the visitor find this awkward to
// say out loud" check made concrete instead of trusted to the model's
// self-report. Two specific, well-documented failure modes:
//   1. Three (or more) consecutive third-tone syllables — the classic
//      hard-to-say-smoothly pattern that requires tone sandhi a visitor
//      won't know to apply (老/李/somebody's "Lǎo Lǐ Wǎ" problem).
//   2. The same bare syllable repeated across two of the name's characters
//      — reads as a stutter rather than a deliberate design choice.
// Returns a short human-readable reason to feed back into a retry prompt,
// or null if the pinyin clears both checks.
function detectAwkwardPronunciation(pinyin: string): string | null {
  const syllables = pinyin.trim().split(/\s+/).filter(Boolean);
  if (syllables.length < 2) return null;

  const tones = syllables.map(syllableTone);
  for (let i = 0; i <= tones.length - 3; i++) {
    if (tones[i] === 3 && tones[i + 1] === 3 && tones[i + 2] === 3) {
      return `three consecutive third-tone syllables ("${syllables[i]} ${syllables[i + 1]} ${syllables[i + 2]}") are hard to say smoothly — vary the tone contour`;
    }
  }

  const bases = syllables.map(bareSyllable);
  for (let i = 0; i < bases.length; i++) {
    for (let j = i + 1; j < bases.length; j++) {
      if (bases[i] === bases[j] && bases[i].length > 0) {
        return `the syllable "${syllables[i]}" repeats as "${syllables[j]}" — reads as a stutter, not a design choice`;
      }
    }
  }

  return null;
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

PRONUNCIATION ACCESSIBILITY (this product's visitors are currently primarily English speakers — see scope note below)
  • The single hardest test a name must pass: the visitor should be able to read their own pinyin aloud, from the page, on the first try, without feeling foolish. A name that is culturally perfect but that its own recipient stumbles over has failed 达 (it doesn't "read naturally") even if it looks elegant on paper.
  • Prefer syllables an English speaker can approximate reasonably (b/p/m/f/d/t/n/l/g/k/h + simple finals) over syllable choices that stack multiple hard-for-English-speakers sounds back to back (heavy retroflex zh/ch/sh/r clusters, or ü-finals) two syllables in a row — one such syllable is fine and often unavoidable for a good match, a chain of them is not.
  • Tone flow matters as much as segmental sound: three consecutive third-tone (ˇ) syllables are famously awkward even for native speakers (they trigger tone sandhi rules a visitor won't know to apply) — avoid this pattern; vary the tone contour across the name so it has a natural rise-and-fall rather than a monotone or a jarring collision.
  • Avoid repeating the same syllable (even with a different tone) across two of the three characters — it reads as a stutter, not a design choice.
  • None of this ever overrides 信达雅 or the hard constraints below — it's a final "would they enjoy saying this out loud" check applied after the name already clears the cultural bar.

SCOPE NOTE: the naming logic here (particle-aware surname parsing, phonetic pools, this pronunciation-accessibility check) is tuned for English and closely-related-language names. A visitor's name may originate from French, Russian, or elsewhere — do the best faithful 信 mapping you can from the Latin-alphabet spelling you're given regardless of origin, but the pronunciation-accessibility guidance above assumes an English-speaking reader saying the pinyin back, which is this product's current primary audience.

HARD CONSTRAINTS
  • NO transliterations: 艾玛, 麦克, 约翰, 大卫, 莉莉.
  • NO placeholder names: 李明, 王伟, 张伟, 李华, 王芳, 张敏, 李娜. Don't use 王 unless 王 is in the recommended pool.
  • NO lazy endings (明 / 伟 / 芳 / 娜 / 强) unless the semantics are exceptional.
  • Surname comes from the recommended pool with strong preference.
  • 3 characters preferred (1 surname + 2-character given name).
  • NO three consecutive third-tone syllables, and no repeated syllable across the name (see PRONUNCIATION ACCESSIBILITY above).

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

interface GmiChatResponse {
  choices?: Array<{
    finish_reason?: string;
    message?: {
      content?: string;
    };
  }>;
  model?: string;
  usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
  error?: { message?: string };
}

async function callGmi(prompt: string, step = "generate_name"): Promise<string> {
  const apiKey = process.env.GMI_API_KEY;
  if (!apiKey) throw new Error("GMI_API_KEY is not configured");

  const apiBase = process.env.GMI_BASE_URL || "https://api.gmi-serving.com/v1";
  const model = process.env.GMI_DEFAULT_MODEL || "anthropic/claude-sonnet-4.6";
  const timeoutMs = Number(process.env.NAME_AI_TIMEOUT_MS) || DEFAULT_TIMEOUT_MS;

  const ctrl = new AbortController();
  const timeout = setTimeout(() => ctrl.abort(), timeoutMs);
  const startedAt = Date.now();

  try {
    // GMI Cloud's Inference Engine is OpenAI-compatible: POST {base}/chat/completions
    // with a standard messages[] body, response in choices[0].message.content.
    const res = await fetch(`${apiBase}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        max_tokens: 2500,
        temperature: 0.7,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: prompt },
        ],
      }),
      signal: ctrl.signal,
    });

    const latencyMs = Date.now() - startedAt;

    if (!res.ok) {
      const text = await res.text();
      logGmiCall({ step, modality: "text", model, latencyMs, ok: false, error: `HTTP ${res.status}` });
      throw new Error(`GMI Cloud HTTP ${res.status}: ${text.slice(0, 300)}`);
    }

    const json = (await res.json()) as GmiChatResponse;
    if (json.error?.message) {
      logGmiCall({ step, modality: "text", model, latencyMs, ok: false, error: json.error.message });
      throw new Error(`GMI Cloud error: ${json.error.message}`);
    }
    const content = json.choices?.[0]?.message?.content ?? "";
    if (!content) {
      logGmiCall({ step, modality: "text", model, latencyMs, ok: false, error: "empty content" });
      throw new Error("GMI Cloud returned empty content");
    }

    logGmiCall({
      step,
      modality: "text",
      model: json.model || model,
      latencyMs,
      promptTokens: json.usage?.prompt_tokens,
      completionTokens: json.usage?.completion_tokens,
      ok: true,
    });
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
  //
  // Long / compound names (multiple middle names, "van der Berg"-style
  // particled surnames) are pre-resolved by parseEnglishName() before this
  // prompt is built: primaryGiven is the ONE given name that actually drives
  // the sound-match (never a blend of three), and familyAnchor is the root
  // word of a compound surname (e.g. "Berg", not "van"). Both are surfaced
  // to the model explicitly so it never has to guess, and so the model can
  // acknowledge the simplification transparently in pronunciationMapping
  // instead of silently dropping part of the visitor's name.
  const { primaryGiven, extraGivenNames, family, familyAnchor, familyIsCompound } = ctx.parsedName;
  const middleNameNote = extraGivenNames.length
    ? ` (middle name${extraGivenNames.length > 1 ? "s" : ""} "${extraGivenNames.join(" ")}" noted for flavor only — do not try to encode them into the 2 given-name characters as well, that dilutes the sound-match)`
    : "";
  const compoundSurnameNote = familyIsCompound
    ? ` This is a compound/multi-word surname — "${familyAnchor}" is the root used for phonetic mapping; briefly acknowledge in pronunciationMapping that you anchored on "${familyAnchor}" from the full surname "${family}", so the visitor understands the choice instead of wondering where the rest of their name went.`
    : "";

  const nameRoleBlock = ctx.parsedName.hasFamily
    ? `THE NAME (full name provided)
  • Given / first name (primary, drives the sound-match): ${primaryGiven}${middleNameNote}
  • Family / last name (full as written): ${family}
  • Family name phonetic anchor: ${familyAnchor}
  • Naming rule: derive the Chinese 姓 from the phonetic root of "${familyAnchor}" — pick a real Chinese surname whose initial sound (or close cognate) echoes "${familyAnchor}". The two given-name characters should echo the sound and feel of "${primaryGiven}" specifically, not the whole given-name block. The recommended surnames below are anchored on "${familyAnchor}" — strongly prefer one of them.${compoundSurnameNote}`
    : `THE NAME (only a given name provided — no family name)
  • Given / first name: ${primaryGiven || englishName}${middleNameNote}
  • Family / last name: (not provided)
  • Naming rule: the visitor did not provide a family name, so there is no surname to phonetically map. Pick a 姓 from the recommended pool that pairs gracefully with the given-name sound; the focus of 信 (faithfulness) falls on the two given-name characters echoing "${primaryGiven || englishName}". A 2-character given-name-only output is acceptable in this case if it reads more naturally than appending a forced surname.`;

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
      ? `the Chinese 姓 echoes "${familyAnchor}", and the two given-name characters echo "${primaryGiven}"`
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
  // Deliberately normalize the RESOLVED anchors, not the raw given/family
  // blobs — a visitor with three middle names or a "van der Berg"-style
  // surname must not have those extra tokens leak into the sound-match seed
  // (see parseEnglishName's doc comment for the full reasoning).
  const normalizedGiven = normalizeAscii(parsedName.primaryGiven);
  const normalizedFamily = normalizeAscii(parsedName.familyAnchor ?? "");

  // When the visitor gave us a family name, anchor the Chinese surname on
  // its phonetic root's first letter (e.g. "van der Berg" → anchor "Berg" →
  // B-pool: 白/柏/卜). When they only gave a single given name, fall back to
  // the given name's first letter so we still produce something — but the
  // prompt makes that distinction explicit so the model knows whether the
  // surname is grounded or guessed.
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
    const text = await callGmi(prompt, "generate_name");
    parsed = parseModelText(text);
  } catch (err) {
    console.error("GMI naming call failed, using fallback:", err);
    return buildFallbackName(ctx);
  }

  // Retry budget: skip the retry when the function timeout is tight (Hobby
  // plan), because a second call can't fit within the same invocation.
  const allowRetry = (Number(process.env.NAME_AI_TIMEOUT_MS) || DEFAULT_TIMEOUT_MS) >= 25000;

  const genericIssue = isGenericResult(parsed);
  const pronunciationIssue = !genericIssue ? detectAwkwardPronunciation(String(parsed.pinyin ?? "")) : null;

  if (allowRetry && (genericIssue || pronunciationIssue)) {
    const retryReason = genericIssue
      ? `Your last answer was too generic or incomplete. Try again with a name that is more distinctive for ${input.englishName}.
Hard constraints for the retry:
- Avoid 李明 / 王伟 / 张伟 / 李华 / 王芳 and similar textbook defaults
- Keep the surname close to this candidate pool: ${surnameCandidates.slice(0, 6).map(([c]) => c).join(", ")}
- Make the given name feel personally matched to ${input.englishName}, not randomly generic
- Use the birth profile, especially ${birthProfile.balancingElements.join(", ")}, in the semantics`
      : `Your last answer, "${parsed.chineseName}" (${parsed.pinyin}), has a pronunciation problem: ${pronunciationIssue}.
Keep the same cultural direction and birth-profile reasoning, but pick different characters (same recommended pools are fine) that avoid this specific issue — the visitor needs to be able to say their own name smoothly out loud.`;

    const retryPrompt = `${prompt}

${retryReason}
Return JSON only.`;

    try {
      const retryText = await callGmi(retryPrompt, "generate_name_retry");
      parsed = parseModelText(retryText);
    } catch (err) {
      console.error("GMI naming retry failed, using fallback:", err);
      return buildFallbackName(ctx);
    }
  }

  return normalizeResponse(parsed, ctx);
}
