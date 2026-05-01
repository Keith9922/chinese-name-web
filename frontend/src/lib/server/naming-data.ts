// Curated character pools used to guide name generation.
// Ported from backend/services/name_generator.py — kept identical so the
// AI prompt stays as well-grounded as the Python implementation.

export type CharacterTriple = readonly [character: string, pinyin: string, meaning: string];

export const GENERIC_NAME_BLACKLIST = new Set([
  "李明", "王伟", "张伟", "李华", "王明", "张敏", "王芳", "李娜", "张磊",
]);

export const SURNAME_CANDIDATES: Record<string, CharacterTriple[]> = {
  a: [["安", "Ān", "calm, settled"], ["艾", "Ài", "elegant and literary"], ["欧", "Ōu", "a crisp and rare opening"]],
  b: [["白", "Bái", "clear and refined"], ["柏", "Bǎi", "cypress, steadfast"], ["卜", "Bǔ", "compact and memorable"]],
  c: [["曹", "Cáo", "classical and steady"], ["岑", "Cén", "mountain-like calm"], ["程", "Chéng", "measured and scholarly"]],
  d: [["戴", "Dài", "dignified and familiar"], ["丁", "Dīng", "compact and bright"], ["杜", "Dù", "restrained and literary"]],
  e: [["易", "Yì", "clear and modern"], ["叶", "Yè", "light and elegant"], ["鄂", "È", "rare with presence"]],
  f: [["方", "Fāng", "balanced and upright"], ["范", "Fàn", "cultured and poised"], ["冯", "Féng", "strong and familiar"]],
  g: [["高", "Gāo", "elevated and clean"], ["顾", "Gù", "thoughtful and refined"], ["郭", "Guō", "rounded and steady"]],
  h: [["韩", "Hán", "cool and elegant"], ["何", "Hé", "gentle and familiar"], ["侯", "Hóu", "polished with presence"]],
  i: [["尹", "Yǐn", "refined and concise"], ["殷", "Yīn", "warm and classical"], ["伊", "Yī", "soft and graceful"]],
  j: [["江", "Jiāng", "flowing and expansive"], ["贾", "Jiǎ", "scholarly"], ["景", "Jǐng", "bright and scenic"]],
  k: [["柯", "Kē", "clean and distinctive"], ["康", "Kāng", "healthy and open"], ["孔", "Kǒng", "classical and rooted"]],
  l: [["林", "Lín", "forest, graceful"], ["凌", "Líng", "swift and airy"], ["罗", "Luó", "smooth and elegant"]],
  m: [["马", "Mǎ", "energetic and easy to remember"], ["孟", "Mèng", "measured and classic"], ["莫", "Mò", "cool and modern"]],
  n: [["宁", "Níng", "peaceful and centered"], ["倪", "Ní", "soft and uncommon"], ["南", "Nán", "warm and bright"]],
  o: [["欧", "Ōu", "compact and international"], ["欧阳", "Ōuyáng", "distinguished compound surname"], ["区", "Ōu", "rare but memorable"]],
  p: [["裴", "Péi", "refined and fashionable"], ["彭", "Péng", "resonant and strong"], ["潘", "Pān", "smooth and familiar"]],
  q: [["邱", "Qiū", "gentle and balanced"], ["秦", "Qín", "classical and resonant"], ["乔", "Qiáo", "light and elevated"]],
  r: [["饶", "Ráo", "warm and melodic"], ["任", "Rèn", "steady and practical"], ["阮", "Ruǎn", "literary and soft"]],
  s: [["苏", "Sū", "soft and cultured"], ["宋", "Sòng", "elegant and traditional"], ["沈", "Shěn", "deep and grounded"]],
  t: [["谭", "Tán", "deep-toned and literary"], ["唐", "Táng", "bright and classical"], ["汤", "Tāng", "warm and easy to say"], ["田", "Tián", "grounded and clear"]],
  u: [["乌", "Wū", "rare but striking"], ["伍", "Wǔ", "firm and compact"], ["吴", "Wú", "smooth and common enough to be natural"]],
  v: [["文", "Wén", "literary and elegant"], ["温", "Wēn", "warm and gentle"], ["魏", "Wèi", "confident and resonant"]],
  w: [["温", "Wēn", "gentle and balanced"], ["吴", "Wú", "smooth and easy to hear"], ["王", "Wáng", "broadly familiar but only used when it truly fits"]],
  x: [["夏", "Xià", "bright and seasonal"], ["谢", "Xiè", "clean and familiar"], ["萧", "Xiāo", "airy and elegant"]],
  y: [["叶", "Yè", "light and graceful"], ["杨", "Yáng", "bright and uplifting"], ["余", "Yú", "gentle and measured"]],
  z: [["周", "Zhōu", "balanced and traditional"], ["郑", "Zhèng", "firm and clear"], ["赵", "Zhào", "bright and strong"]],
};

export const SOUND_CANDIDATES: Record<string, CharacterTriple[]> = {
  tim: [["添", "Tiān", "to add richness"], ["霆", "Tíng", "thunder, dynamic force"], ["廷", "Tíng", "poise and structure"], ["沐", "Mù", "bathed in grace"], ["牧", "Mù", "to guide and tend"]],
  lu: [["璐", "Lù", "fine jade"], ["露", "Lù", "dew, clarity"], ["鹿", "Lù", "spirit and agility"]],
  luna: [["露", "Lù", "dew, brightness"], ["娜", "Nà", "graceful and poised"], ["宁", "Níng", "serenity"], ["岚", "Lán", "mountain mist"]],
  mi: [["弥", "Mí", "expansive and full"], ["宓", "Mì", "quiet and elegant"], ["铭", "Míng", "engraved remembrance"], ["旻", "Mín", "gentle autumn sky"]],
  mike: [["迈", "Mài", "stride forward"], ["凯", "Kǎi", "triumph"], ["恺", "Kǎi", "kind-hearted"], ["霖", "Lín", "long, nourishing rain"]],
  chael: [["启", "Qǐ", "to open"], ["澈", "Chè", "clear and pure"], ["宸", "Chén", "dignified presence"]],
  na: [["娜", "Nà", "graceful"], ["宁", "Níng", "peaceful"], ["南", "Nán", "warm and open"]],
  li: [["俐", "Lì", "clever and neat"], ["丽", "Lì", "beautiful"], ["霖", "Lín", "nourishing rain"]],
  ma: [["玛", "Mǎ", "gem-like tone"], ["迈", "Mài", "forward motion"], ["蔓", "Màn", "growing, unfolding"]],
  el: [["尔", "Ěr", "elegant classical tone"], ["岚", "Lán", "misty grace"], ["恩", "Ēn", "kindness"]],
  an: [["安", "Ān", "peace"], ["岸", "Àn", "steadfast"], ["晏", "Yàn", "calm and bright"]],
  er: [["尔", "Ěr", "refined closeness"], ["然", "Rán", "natural ease"], ["恩", "Ēn", "warmth and grace"]],
};

export const LETTER_CANDIDATES: Record<string, CharacterTriple[]> = {
  a: [["安", "Ān", "peace"], ["雅", "Yǎ", "elegance"]],
  b: [["柏", "Bǎi", "cypress, steadfast"], ["博", "Bó", "broad and learned"]],
  c: [["澄", "Chéng", "clear"], ["宸", "Chén", "dignified presence"]],
  d: [["笛", "Dí", "flute-like grace"], ["棠", "Táng", "begonia bloom"]],
  e: [["恩", "Ēn", "grace"], ["尔", "Ěr", "refined closeness"]],
  f: [["芙", "Fú", "lotus-like beauty"], ["枫", "Fēng", "maple, vivid character"]],
  g: [["歌", "Gē", "song"], ["格", "Gé", "character and structure"]],
  h: [["衡", "Héng", "balance"], ["禾", "Hé", "grain, abundance"]],
  i: [["怡", "Yí", "pleasant ease"], ["仪", "Yí", "composure"]],
  j: [["嘉", "Jiā", "excellent"], ["瑾", "Jǐn", "fine jade"]],
  k: [["恺", "Kǎi", "kind-hearted"], ["珂", "Kē", "fine jade"]],
  l: [["岚", "Lán", "mountain mist"], ["霖", "Lín", "nourishing rain"]],
  m: [["沐", "Mù", "bathed in grace"], ["铭", "Míng", "engraved remembrance"]],
  n: [["宁", "Níng", "serenity"], ["楠", "Nán", "firm nanmu wood"]],
  o: [["欧", "Ōu", "continental openness"], ["鸥", "Ōu", "seabird, freedom"]],
  p: [["沛", "Pèi", "abundant vitality"], ["培", "Péi", "to nurture"]],
  q: [["清", "Qīng", "clarity"], ["秋", "Qiū", "autumnal grace"]],
  r: [["然", "Rán", "natural ease"], ["睿", "Ruì", "insightful wisdom"]],
  s: [["书", "Shū", "bookish grace"], ["思", "Sī", "thoughtfulness"]],
  t: [["庭", "Tíng", "courtyard, poise"], ["恬", "Tián", "calm"]],
  u: [["宇", "Yǔ", "expansive presence"], ["悠", "Yōu", "unhurried and graceful"]],
  v: [["微", "Wēi", "subtle elegance"], ["唯", "Wéi", "singular and distinct"]],
  w: [["雯", "Wén", "cloud patterns"], ["玟", "Wén", "jade-like markings"]],
  x: [["熙", "Xī", "radiant"], ["汐", "Xī", "evening tide"]],
  y: [["妍", "Yán", "beauty"], ["奕", "Yì", "bright spirit"]],
  z: [["泽", "Zé", "nourishing grace"], ["真", "Zhēn", "authenticity"]],
};

export const HEAVENLY_STEMS: ReadonlyArray<readonly [stem: string, element: string]> = [
  ["甲", "Wood"], ["乙", "Wood"], ["丙", "Fire"], ["丁", "Fire"], ["戊", "Earth"],
  ["己", "Earth"], ["庚", "Metal"], ["辛", "Metal"], ["壬", "Water"], ["癸", "Water"],
];

export const EARTHLY_BRANCHES: ReadonlyArray<readonly [branch: string, element: string, zodiac: string]> = [
  ["子", "Water", "Rat"], ["丑", "Earth", "Ox"], ["寅", "Wood", "Tiger"], ["卯", "Wood", "Rabbit"],
  ["辰", "Earth", "Dragon"], ["巳", "Fire", "Snake"], ["午", "Fire", "Horse"], ["未", "Earth", "Goat"],
  ["申", "Metal", "Monkey"], ["酉", "Metal", "Rooster"], ["戌", "Earth", "Dog"], ["亥", "Water", "Pig"],
];

export const ELEMENT_IMAGES: Record<string, string> = {
  Wood: "growth, renewal, graceful branches",
  Fire: "warmth, radiance, inspiration",
  Earth: "stability, grounding, generosity",
  Metal: "clarity, precision, polished presence",
  Water: "flow, intelligence, calm depth",
};

export const HOUR_WINDOWS: ReadonlyArray<readonly [branch: string, element: string, window: string]> = [
  ["子", "Water", "23:00-00:59"], ["丑", "Earth", "01:00-02:59"], ["寅", "Wood", "03:00-04:59"],
  ["卯", "Wood", "05:00-06:59"], ["辰", "Earth", "07:00-08:59"], ["巳", "Fire", "09:00-10:59"],
  ["午", "Fire", "11:00-12:59"], ["未", "Earth", "13:00-14:59"], ["申", "Metal", "15:00-16:59"],
  ["酉", "Metal", "17:00-18:59"], ["戌", "Earth", "19:00-20:59"], ["亥", "Water", "21:00-22:59"],
];

// 后天八卦 mapping by season — gives the model an extra cultural axis beyond
// the five elements. Each entry: trigram name, glyph, elemental affinity,
// natural image (for poetic imagery), and an evocative English gloss.
export interface TrigramReading {
  name: string;        // 震
  pinyin: string;      // Zhèn
  glyph: string;       // ☳
  element: string;     // Wood
  image: string;       // 雷 / Thunder
  archetype: string;   // arousal, the first stir of growth
}

export const SEASON_TRIGRAMS: Record<string, TrigramReading[]> = {
  spring: [
    { name: "震", pinyin: "Zhèn", glyph: "☳", element: "Wood", image: "雷 (Thunder)", archetype: "the first stir, awakening, decisive movement" },
    { name: "巽", pinyin: "Xùn", glyph: "☴", element: "Wood", image: "风 (Wind)", archetype: "gentle penetration, gradual influence, supple grace" },
  ],
  summer: [
    { name: "离", pinyin: "Lí", glyph: "☲", element: "Fire", image: "火 (Fire)", archetype: "brightness, clarity of mind, things that adhere and illuminate" },
  ],
  autumn: [
    { name: "兑", pinyin: "Duì", glyph: "☱", element: "Metal", image: "泽 (Lake)", archetype: "joyousness, reflection, articulate speech" },
    { name: "乾", pinyin: "Qián", glyph: "☰", element: "Metal", image: "天 (Heaven)", archetype: "creative force, integrity, self-mastery" },
  ],
  winter: [
    { name: "坎", pinyin: "Kǎn", glyph: "☵", element: "Water", image: "水 (Water)", archetype: "abyss, perseverance through depth, fluid intelligence" },
    { name: "艮", pinyin: "Gèn", glyph: "☶", element: "Earth", image: "山 (Mountain)", archetype: "stillness, knowing when to stop, unshakable presence" },
  ],
};

// Seasonal lines from the Chinese classics — gives the model a real allusion
// to weave into the cultural explanation rather than vague mood adjectives.
export const SEASONAL_CLASSICAL_REFS: Record<string, string[]> = {
  spring: [
    "《诗经·小雅》: 蒹葭苍苍，白露为霜 — reeds dense and grey, dew becoming frost (later autumn, contrast).",
    "《诗经·周南》: 桃之夭夭，灼灼其华 — the peach tree, young and lush, blossoms ablaze.",
    "《论语》: 子在川上曰，逝者如斯夫 — the master by the river: thus do all things flow.",
  ],
  summer: [
    "《诗经·邶风》: 习习谷风，以阴以雨 — gentle valley wind, with shade and rain.",
    "《古诗十九首》: 青青园中葵，朝露待日晞 — the green sunflowers in the garden, dew waiting for the sun.",
    "《楚辞》: 路漫漫其修远兮，吾将上下而求索 — the road is long and far, I shall seek up and down.",
  ],
  autumn: [
    "《诗经·秦风》: 蒹葭苍苍，白露为霜 — reeds dense, dew turning to frost.",
    "《诗经·小雅》: 鹤鸣九皋，声闻于天 — the crane cries in the marsh, its voice reaches heaven.",
    "《楚辞》: 悲哉秋之为气也，萧瑟兮草木摇落 — autumn's spirit, mournful, leaves trembling.",
  ],
  winter: [
    "《诗经·郑风》: 风雨如晦，鸡鸣不已 — wind and rain, dim as twilight; the cock crows on.",
    "《楚辞》: 长太息以掩涕兮 — a long sigh, hiding tears.",
    "《论语》: 岁寒，然后知松柏之后凋也 — only when the year grows cold do we know the pine and cypress are last to fall.",
  ],
};

// Traits associated with each 生肖 — used to inform character-pair imagery.
export const ZODIAC_TRAITS: Record<string, { traits: string; imagery: string }> = {
  Rat: { traits: "clever, resourceful, adaptable, observant", imagery: "moonlight, granaries, wit" },
  Ox: { traits: "patient, reliable, deliberate, strong-willed", imagery: "fields of jade green, steady plough, dawn" },
  Tiger: { traits: "courageous, dignified, magnetic, decisive", imagery: "wind in the pines, mountain striding, golden eyes" },
  Rabbit: { traits: "gentle, refined, artistic, serene", imagery: "lunar palace, clear pool, soft breeze" },
  Dragon: { traits: "noble, transformative, visionary, generous", imagery: "rising clouds, jade-blue scales, hidden strength" },
  Snake: { traits: "wise, mysterious, philosophical, graceful", imagery: "still water, coiled jade, midnight pearl" },
  Horse: { traits: "free-spirited, energetic, frank, devoted", imagery: "open plain, galloping wind, sunrise" },
  Goat: { traits: "kind, artistic, sensitive, principled", imagery: "mountain path, wild herbs, soft fleece" },
  Monkey: { traits: "clever, lively, curious, inventive", imagery: "forest canopy, bright laughter, climbing vines" },
  Rooster: { traits: "precise, observant, punctual, articulate", imagery: "first light, scarlet plumage, clear note" },
  Dog: { traits: "loyal, righteous, protective, sincere", imagery: "guarding moon, true companion, warm hearth" },
  Pig: { traits: "kind-hearted, sincere, generous, prosperous", imagery: "fertile fields, harvest table, abundance" },
};
