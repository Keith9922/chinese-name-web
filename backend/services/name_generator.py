"""
Name generation service using Claude API.
This module handles the logic for generating Chinese names based on
English names, gender, and birth dates.
"""
import os
import json
import re
from typing import Optional
from datetime import datetime


class NameGeneratorService:
    """Service for generating Chinese names using Claude API."""

    GENERIC_NAME_BLACKLIST = {
        "李明", "王伟", "张伟", "李华", "王明", "张敏", "王芳", "李娜", "张磊"
    }

    SURNAME_CANDIDATES = {
        "a": [("安", "Ān", "calm, settled"), ("艾", "Ài", "elegant and literary"), ("欧", "Ōu", "a crisp and rare opening")],
        "b": [("白", "Bái", "clear and refined"), ("柏", "Bǎi", "cypress, steadfast"), ("卜", "Bǔ", "compact and memorable")],
        "c": [("曹", "Cáo", "classical and steady"), ("岑", "Cén", "mountain-like calm"), ("程", "Chéng", "measured and scholarly")],
        "d": [("戴", "Dài", "dignified and familiar"), ("丁", "Dīng", "compact and bright"), ("杜", "Dù", "restrained and literary")],
        "e": [("易", "Yì", "clear and modern"), ("叶", "Yè", "light and elegant"), ("鄂", "È", "rare with presence")],
        "f": [("方", "Fāng", "balanced and upright"), ("范", "Fàn", "cultured and poised"), ("冯", "Féng", "strong and familiar")],
        "g": [("高", "Gāo", "elevated and clean"), ("顾", "Gù", "thoughtful and refined"), ("郭", "Guō", "rounded and steady")],
        "h": [("韩", "Hán", "cool and elegant"), ("何", "Hé", "gentle and familiar"), ("侯", "Hóu", "polished with presence")],
        "i": [("尹", "Yǐn", "refined and concise"), ("殷", "Yīn", "warm and classical"), ("伊", "Yī", "soft and graceful")],
        "j": [("江", "Jiāng", "flowing and expansive"), ("贾", "Jiǎ", "scholarly"), ("景", "Jǐng", "bright and scenic")],
        "k": [("柯", "Kē", "clean and distinctive"), ("康", "Kāng", "healthy and open"), ("孔", "Kǒng", "classical and rooted")],
        "l": [("林", "Lín", "forest, graceful"), ("凌", "Líng", "swift and airy"), ("罗", "Luó", "smooth and elegant")],
        "m": [("马", "Mǎ", "energetic and easy to remember"), ("孟", "Mèng", "measured and classic"), ("莫", "Mò", "cool and modern")],
        "n": [("宁", "Níng", "peaceful and centered"), ("倪", "Ní", "soft and uncommon"), ("南", "Nán", "warm and bright")],
        "o": [("欧", "Ōu", "compact and international"), ("欧阳", "Ōuyáng", "distinguished compound surname"), ("区", "Ōu", "rare but memorable")],
        "p": [("裴", "Péi", "refined and fashionable"), ("彭", "Péng", "resonant and strong"), ("潘", "Pān", "smooth and familiar")],
        "q": [("邱", "Qiū", "gentle and balanced"), ("秦", "Qín", "classical and resonant"), ("乔", "Qiáo", "light and elevated")],
        "r": [("饶", "Ráo", "warm and melodic"), ("任", "Rèn", "steady and practical"), ("阮", "Ruǎn", "literary and soft")],
        "s": [("苏", "Sū", "soft and cultured"), ("宋", "Sòng", "elegant and traditional"), ("沈", "Shěn", "deep and grounded")],
        "t": [("谭", "Tán", "deep-toned and literary"), ("唐", "Táng", "bright and classical"), ("汤", "Tāng", "warm and easy to say"), ("田", "Tián", "grounded and clear")],
        "u": [("乌", "Wū", "rare but striking"), ("伍", "Wǔ", "firm and compact"), ("吴", "Wú", "smooth and common enough to be natural")],
        "v": [("文", "Wén", "literary and elegant"), ("温", "Wēn", "warm and gentle"), ("魏", "Wèi", "confident and resonant")],
        "w": [("温", "Wēn", "gentle and balanced"), ("吴", "Wú", "smooth and easy to hear"), ("王", "Wáng", "broadly familiar but only used when it truly fits")],
        "x": [("夏", "Xià", "bright and seasonal"), ("谢", "Xiè", "clean and familiar"), ("萧", "Xiāo", "airy and elegant")],
        "y": [("叶", "Yè", "light and graceful"), ("杨", "Yáng", "bright and uplifting"), ("余", "Yú", "gentle and measured")],
        "z": [("周", "Zhōu", "balanced and traditional"), ("郑", "Zhèng", "firm and clear"), ("赵", "Zhào", "bright and strong")],
    }

    SOUND_CANDIDATES = {
        "tim": [("添", "Tiān", "to add richness"), ("霆", "Tíng", "thunder, dynamic force"), ("廷", "Tíng", "poise and structure"), ("沐", "Mù", "bathed in grace"), ("牧", "Mù", "to guide and tend")],
        "lu": [("璐", "Lù", "fine jade"), ("露", "Lù", "dew, clarity"), ("鹿", "Lù", "spirit and agility")],
        "luna": [("露", "Lù", "dew, brightness"), ("娜", "Nà", "graceful and poised"), ("宁", "Níng", "serenity"), ("岚", "Lán", "mountain mist")],
        "mi": [("弥", "Mí", "expansive and full"), ("宓", "Mì", "quiet and elegant"), ("铭", "Míng", "engraved remembrance"), ("旻", "Mín", "gentle autumn sky")],
        "mike": [("迈", "Mài", "stride forward"), ("凯", "Kǎi", "triumph"), ("恺", "Kǎi", "kind-hearted"), ("霖", "Lín", "long, nourishing rain")],
        "chael": [("启", "Qǐ", "to open"), ("澈", "Chè", "clear and pure"), ("宸", "Chén", "dignified presence")],
        "na": [("娜", "Nà", "graceful"), ("宁", "Níng", "peaceful"), ("南", "Nán", "warm and open")],
        "li": [("俐", "Lì", "clever and neat"), ("丽", "Lì", "beautiful"), ("霖", "Lín", "nourishing rain")],
        "ma": [("玛", "Mǎ", "gem-like tone"), ("迈", "Mài", "forward motion"), ("蔓", "Màn", "growing, unfolding")],
        "el": [("尔", "Ěr", "elegant classical tone"), ("岚", "Lán", "misty grace"), ("恩", "Ēn", "kindness")],
        "an": [("安", "Ān", "peace"), ("岸", "Àn", "steadfast"), ("晏", "Yàn", "calm and bright")],
        "er": [("尔", "Ěr", "refined closeness"), ("然", "Rán", "natural ease"), ("恩", "Ēn", "warmth and grace")],
    }

    LETTER_CANDIDATES = {
        "a": [("安", "Ān", "peace"), ("雅", "Yǎ", "elegance")],
        "b": [("柏", "Bǎi", "cypress, steadfast"), ("博", "Bó", "broad and learned")],
        "c": [("澄", "Chéng", "clear"), ("宸", "Chén", "dignified presence")],
        "d": [("笛", "Dí", "flute-like grace"), ("棠", "Táng", "begonia bloom")],
        "e": [("恩", "Ēn", "grace"), ("尔", "Ěr", "refined closeness")],
        "f": [("芙", "Fú", "lotus-like beauty"), ("枫", "Fēng", "maple, vivid character")],
        "g": [("歌", "Gē", "song"), ("格", "Gé", "character and structure")],
        "h": [("衡", "Héng", "balance"), ("禾", "Hé", "grain, abundance")],
        "i": [("怡", "Yí", "pleasant ease"), ("仪", "Yí", "composure")],
        "j": [("嘉", "Jiā", "excellent"), ("瑾", "Jǐn", "fine jade")],
        "k": [("恺", "Kǎi", "kind-hearted"), ("珂", "Kē", "fine jade")],
        "l": [("岚", "Lán", "mountain mist"), ("霖", "Lín", "nourishing rain")],
        "m": [("沐", "Mù", "bathed in grace"), ("铭", "Míng", "engraved remembrance")],
        "n": [("宁", "Níng", "serenity"), ("楠", "Nán", "firm nanmu wood")],
        "o": [("欧", "Ōu", "continental openness"), ("鸥", "Ōu", "seabird, freedom")],
        "p": [("沛", "Pèi", "abundant vitality"), ("培", "Péi", "to nurture")],
        "q": [("清", "Qīng", "clarity"), ("秋", "Qiū", "autumnal grace")],
        "r": [("然", "Rán", "natural ease"), ("睿", "Ruì", "insightful wisdom")],
        "s": [("书", "Shū", "bookish grace"), ("思", "Sī", "thoughtfulness")],
        "t": [("庭", "Tíng", "courtyard, poise"), ("恬", "Tián", "calm")],
        "u": [("宇", "Yǔ", "expansive presence"), ("悠", "Yōu", "unhurried and graceful")],
        "v": [("微", "Wēi", "subtle elegance"), ("唯", "Wéi", "singular and distinct")],
        "w": [("雯", "Wén", "cloud patterns"), ("玟", "Wén", "jade-like markings")],
        "x": [("熙", "Xī", "radiant"), ("汐", "Xī", "evening tide")],
        "y": [("妍", "Yán", "beauty"), ("奕", "Yì", "bright spirit")],
        "z": [("泽", "Zé", "nourishing grace"), ("真", "Zhēn", "authenticity")],
    }

    HEAVENLY_STEMS = [
        ("甲", "Wood"),
        ("乙", "Wood"),
        ("丙", "Fire"),
        ("丁", "Fire"),
        ("戊", "Earth"),
        ("己", "Earth"),
        ("庚", "Metal"),
        ("辛", "Metal"),
        ("壬", "Water"),
        ("癸", "Water"),
    ]

    EARTHLY_BRANCHES = [
        ("子", "Water", "Rat"),
        ("丑", "Earth", "Ox"),
        ("寅", "Wood", "Tiger"),
        ("卯", "Wood", "Rabbit"),
        ("辰", "Earth", "Dragon"),
        ("巳", "Fire", "Snake"),
        ("午", "Fire", "Horse"),
        ("未", "Earth", "Goat"),
        ("申", "Metal", "Monkey"),
        ("酉", "Metal", "Rooster"),
        ("戌", "Earth", "Dog"),
        ("亥", "Water", "Pig"),
    ]

    ELEMENT_IMAGES = {
        "Wood": "growth, renewal, graceful branches",
        "Fire": "warmth, radiance, inspiration",
        "Earth": "stability, grounding, generosity",
        "Metal": "clarity, precision, polished presence",
        "Water": "flow, intelligence, calm depth",
    }

    def __init__(self):
        self.api_key = os.getenv("ANTHROPIC_API_KEY")
        self.base_url = os.getenv("ANTHROPIC_BASE_URL", "https://api.minimaxi.com/anthropic")
        # Coding Plan keys currently support the MiniMax coding text models,
        # while Token Plan keys can be switched to MiniMax-M2.7.
        self.model = os.getenv("MINIMAX_MODEL", "MiniMax-M2.5")

    def _calculate_age(self, birth_date: str) -> int:
        """Calculate age from birth date."""
        birth = datetime.strptime(birth_date, "%Y-%m-%d")
        today = datetime.now()
        age = int((today - birth).days / 365.25)
        return age

    def _format_gender(self, gender: str) -> str:
        """Format gender for prompt."""
        if gender == "male":
            return "male"
        elif gender == "female":
            return "female"
        return "any"

    def _normalize_english_name(self, english_name: str) -> str:
        return re.sub(r"[^a-z]", "", english_name.lower())

    def _build_surname_candidates(self, normalized_name: str):
        initial = normalized_name[:1] or "l"
        return self.SURNAME_CANDIDATES.get(initial, self.SURNAME_CANDIDATES["l"])

    def _build_sound_candidates(self, normalized_name: str, gender: str):
        candidates = []
        seen = set()

        for key, values in sorted(self.SOUND_CANDIDATES.items(), key=lambda item: len(item[0]), reverse=True):
            if key in normalized_name:
                for value in values:
                    if value[0] not in seen:
                        seen.add(value[0])
                        candidates.append(value)

        for letter in normalized_name:
            for value in self.LETTER_CANDIDATES.get(letter, []):
                if value[0] not in seen:
                    seen.add(value[0])
                    candidates.append(value)

        gender_accents = {
            "male": [("宸", "Chén", "dignified presence"), ("轩", "Xuān", "elevated bearing"), ("川", "Chuān", "open flowing energy")],
            "female": [("雅", "Yǎ", "refined elegance"), ("宁", "Níng", "serenity"), ("岚", "Lán", "misty grace")],
            "any": [("安", "Ān", "peace"), ("清", "Qīng", "clarity"), ("和", "Hé", "harmony")],
        }

        for value in gender_accents.get(gender, gender_accents["any"]):
            if value[0] not in seen:
                seen.add(value[0])
                candidates.append(value)

        return candidates[:10]

    def _build_hour_branch(self, birth_time: Optional[str]) -> Optional[dict]:
        if not birth_time:
            return None

        try:
            hour = int(birth_time.split(":")[0])
        except (ValueError, IndexError):
            return None

        hour_windows = [
            ("子", "Water", "23:00-00:59"),
            ("丑", "Earth", "01:00-02:59"),
            ("寅", "Wood", "03:00-04:59"),
            ("卯", "Wood", "05:00-06:59"),
            ("辰", "Earth", "07:00-08:59"),
            ("巳", "Fire", "09:00-10:59"),
            ("午", "Fire", "11:00-12:59"),
            ("未", "Earth", "13:00-14:59"),
            ("申", "Metal", "15:00-16:59"),
            ("酉", "Metal", "17:00-18:59"),
            ("戌", "Earth", "19:00-20:59"),
            ("亥", "Water", "21:00-22:59"),
        ]

        normalized_hour = 0 if hour == 24 else hour
        if normalized_hour == 23 or normalized_hour == 0:
            branch, element, window = hour_windows[0]
        else:
            index = ((normalized_hour + 1) // 2) % 12
            branch, element, window = hour_windows[index]

        return {"branch": branch, "element": element, "window": window}

    def _build_birth_profile(self, birth_date: str, birth_time: Optional[str]) -> dict:
        birth = datetime.strptime(birth_date, "%Y-%m-%d")
        month = birth.month

        if month in (12, 1, 2):
            season = "winter"
            dominant = "Water"
            support = ["Wood", "Fire"]
        elif month in (3, 4, 5):
            season = "spring"
            dominant = "Wood"
            support = ["Fire", "Earth"]
        elif month in (6, 7, 8):
            season = "summer"
            dominant = "Fire"
            support = ["Earth", "Metal"]
        else:
            season = "autumn"
            dominant = "Metal"
            support = ["Water", "Wood"]

        solar_year = birth.year - 1 if (birth.month, birth.day) < (2, 4) else birth.year
        cycle_index = (solar_year - 1984) % 60
        stem_char, stem_element = self.HEAVENLY_STEMS[cycle_index % 10]
        branch_char, branch_element, zodiac = self.EARTHLY_BRANCHES[cycle_index % 12]
        hour_branch = self._build_hour_branch(birth_time)

        element_scores = {
            "Wood": 0,
            "Fire": 0,
            "Earth": 0,
            "Metal": 0,
            "Water": 0,
        }
        element_scores[dominant] += 2
        for element in support:
            element_scores[element] += 1
        element_scores[stem_element] += 1
        element_scores[branch_element] += 1

        if hour_branch:
            element_scores[hour_branch["element"]] += 1

        balancing_elements = sorted(
            element_scores.keys(), key=lambda element: (element_scores[element], element)
        )[:2]
        balancing_images = ", ".join(self.ELEMENT_IMAGES[element] for element in balancing_elements)

        time_line = (
            f" Birth hour leans toward the {hour_branch['branch']} branch ({hour_branch['element']}, {hour_branch['window']})."
            if hour_branch
            else " Birth hour was not provided, so the reading uses date-based seasonality only."
        )

        return {
            "season": season,
            "dominant": dominant,
            "support": support,
            "yearGZ": f"{stem_char}{branch_char}",
            "zodiac": zodiac,
            "hourBranch": hour_branch["branch"] if hour_branch else None,
            "balancingElements": balancing_elements,
            "balancingImages": balancing_images,
            "summary": (
                f"Approximate birth profile points to a {stem_char}{branch_char} year ({zodiac}) with {season} qi leaning toward {dominant}. "
                f"Helpful balancing emphasis can come from {', '.join(balancing_elements)} through imagery of {balancing_images}."
                f"{time_line}"
            ),
        }

    def _is_generic_result(self, parsed_response: dict) -> bool:
        chinese_name = str(parsed_response.get("chineseName", "")).strip()
        cultural_explanation = str(parsed_response.get("culturalExplanation", "")).strip()
        pronunciation_mapping = str(parsed_response.get("pronunciationMapping", "")).strip()
        element_analysis = str(parsed_response.get("elementAnalysis", "")).strip()

        if chinese_name in self.GENERIC_NAME_BLACKLIST:
            return True

        if cultural_explanation == "This name was chosen based on traditional Chinese naming principles.":
            return True

        if not pronunciation_mapping or not element_analysis:
            return True

        return False

    def _normalize_response(self, parsed_response: dict, fallback_context: dict) -> dict:
        chinese_name = str(parsed_response.get("chineseName", "")).strip()
        suggested = parsed_response.get("suggestedCharacters") or []

        if not chinese_name or not isinstance(suggested, list):
            return self._build_fallback_name(fallback_context)

        if len(chinese_name) != len(suggested):
            return self._build_fallback_name(fallback_context)

        if not any(chinese_name.startswith(candidate[0]) for candidate in fallback_context["surname_candidates"]):
            return self._build_fallback_name(fallback_context)

        required_fields = {
            "pinyin": parsed_response.get("pinyin"),
            "meaning": parsed_response.get("meaning"),
            "culturalExplanation": parsed_response.get("culturalExplanation"),
            "pronunciationMapping": parsed_response.get("pronunciationMapping"),
            "elementAnalysis": parsed_response.get("elementAnalysis"),
        }

        if any(not str(value or "").strip() for value in required_fields.values()):
            return self._build_fallback_name(fallback_context)

        normalized_characters = []
        for item in suggested:
            character = str(item.get("character", "")).strip()
            meaning = str(item.get("meaning", "")).strip()

            if len(character) != 1 or not meaning:
                return self._build_fallback_name(fallback_context)

            normalized_characters.append({
                "character": character,
                "meaning": meaning,
            })

        if "".join(item["character"] for item in normalized_characters) != chinese_name:
            return self._build_fallback_name(fallback_context)

        return {
            "chineseName": chinese_name,
            "pinyin": str(required_fields["pinyin"]).strip(),
            "meaning": str(required_fields["meaning"]).strip(),
            "culturalExplanation": str(required_fields["culturalExplanation"]).strip(),
            "pronunciationMapping": str(required_fields["pronunciationMapping"]).strip(),
            "elementAnalysis": str(required_fields["elementAnalysis"]).strip(),
            "suggestedCharacters": normalized_characters,
        }

    def _build_fallback_name(self, fallback_context: dict) -> dict:
        seed = sum(ord(char) for char in fallback_context["normalized_name"]) or 1
        surname_candidates = fallback_context["surname_candidates"][:2] or fallback_context["surname_candidates"]
        sound_candidates = fallback_context["sound_candidates"]

        surname = surname_candidates[seed % len(surname_candidates)]
        first_given = next(
            (
                candidate
                for offset in range(len(sound_candidates))
                for candidate in [sound_candidates[(seed + offset) % len(sound_candidates)]]
                if candidate[0] != surname[0] and candidate[1] != surname[1]
            ),
            sound_candidates[0],
        )
        second_given = next(
            (
                candidate
                for offset in range(1, len(sound_candidates) + 1)
                for candidate in [sound_candidates[(seed + offset) % len(sound_candidates)]]
                if candidate[0] not in {surname[0], first_given[0]} and candidate[1] not in {surname[1], first_given[1]}
            ),
            sound_candidates[0],
        )

        chinese_name = f"{surname[0]}{first_given[0]}{second_given[0]}"
        pinyin = f"{surname[1]} {first_given[1]} {second_given[1]}"

        return {
            "chineseName": chinese_name,
            "pinyin": pinyin,
            "meaning": f"A name suggesting {first_given[2]} and {second_given[2]}",
            "culturalExplanation": (
                f"This name pairs the surname {surname[0]} with a given name shaped by the sound and mood of "
                f"{fallback_context['english_name']}. It stays natural in Mandarin while keeping the tone elegant and memorable."
            ),
            "pronunciationMapping": (
                f"The surname {surname[0]} echoes the opening sound of {fallback_context['english_name']}, while "
                f"{first_given[0]} and {second_given[0]} preserve the rhythm and mood of the original name."
            ),
            "elementAnalysis": fallback_context["birth_profile"]["summary"],
            "suggestedCharacters": [
                {"character": surname[0], "meaning": surname[2]},
                {"character": first_given[0], "meaning": first_given[2]},
                {"character": second_given[0], "meaning": second_given[2]},
            ],
        }

    def _call_claude_api(self, prompt: str) -> str:
        """
        Call Claude API to generate name.
        Note: This is a placeholder implementation. In production,
        you would use the Anthropic SDK to make the actual API call.
        """
        try:
            import anthropic
            client = anthropic.Anthropic(
                api_key=self.api_key,
                base_url=self.base_url
            )

            response = client.messages.create(
                model=self.model,
                max_tokens=1024,
                messages=[{"role": "user", "content": prompt}]
            )

            if response.content and len(response.content) > 0:
                text_blocks = []
                for block in response.content:
                    if getattr(block, "type", None) == "text":
                        text_blocks.append(getattr(block, "text", ""))

                if text_blocks:
                    return "\n".join(text_blocks)
            return ""
        except Exception as e:
            raise Exception(f"Failed to call Claude API: {str(e)}")

    def _parse_response(self, response_text: str) -> dict:
        """Parse the JSON response from Claude API."""
        cleaned_text = response_text.strip()

        # Strip markdown code fences if the model wraps JSON in ```json ... ```
        if cleaned_text.startswith("```"):
            cleaned_text = re.sub(r"^```(?:json)?\s*", "", cleaned_text)
            cleaned_text = re.sub(r"\s*```$", "", cleaned_text)

        # Try to extract the outermost JSON object from mixed prose.
        start = cleaned_text.find("{")
        end = cleaned_text.rfind("}")
        if start != -1 and end != -1 and end > start:
            try:
                return json.loads(cleaned_text[start:end + 1])
            except json.JSONDecodeError:
                pass

        # Fallback: try to parse the whole response as JSON
        try:
            return json.loads(cleaned_text)
        except json.JSONDecodeError:
            pass

        return {}

    def generate_name(
        self,
        english_name: str,
        gender: str,
        birth_date: str,
        birth_time: Optional[str] = None
    ) -> dict:
        """
        Generate a Chinese name based on English name, gender, and birth date.

        Args:
            english_name: The English name to generate Chinese name from
            gender: Gender of the person (male/female/other)
            birth_date: Birth date in YYYY-MM-DD format
            birth_time: Optional birth time in HH:MM format

        Returns:
            Dictionary containing chineseName, pinyin, meaning,
            culturalExplanation, and suggestedCharacters
        """
        age = self._calculate_age(birth_date)
        gender_text = self._format_gender(gender)

        birth = datetime.strptime(birth_date, "%Y-%m-%d")
        year = birth.year
        month = birth.month
        day = birth.day
        normalized_name = self._normalize_english_name(english_name)
        surname_candidates = self._build_surname_candidates(normalized_name)
        sound_candidates = self._build_sound_candidates(normalized_name, gender_text)
        birth_profile = self._build_birth_profile(birth_date, birth_time)

        surname_prompt = ", ".join([f"{char} ({pinyin}, {meaning})" for char, pinyin, meaning in surname_candidates[:6]])
        sound_prompt = ", ".join([f"{char} ({pinyin}, {meaning})" for char, pinyin, meaning in sound_candidates[:8]])
        fallback_context = {
            "english_name": english_name,
            "normalized_name": normalized_name,
            "surname_candidates": surname_candidates,
            "sound_candidates": sound_candidates,
            "birth_profile": birth_profile,
        }
        birth_time_line = birth_time or "not provided"

        prompt = f"""You are a senior Chinese naming consultant who combines Mandarin phonetics, literary naming taste, and light 八字 / 五行 reasoning.

Create a distinctive Chinese full name for this person:
- English name: {english_name}
- Gender: {gender_text}
- Birth date: {year}-{month}-{day}
- Birth time: {birth_time_line}
- Approximate birth profile: {birth_profile['summary']}
- Recommended surname pool based on pronunciation: {surname_prompt}
- Recommended given-name sound pool based on pronunciation and mood: {sound_prompt}

Naming rules:
1. Prefer a 3-character full Chinese name: 1 surname + 2-character given name.
2. The surname must come directly from this recommended surname pool unless there is an overwhelming phonetic reason not to.
3. Do NOT default to ultra-generic names such as 李明, 王伟, 张伟, 李华, 王芳, 王娜, 张敏, 李娜.
4. Never use 王 as the surname unless 王 is inside the surname pool and you clearly explain why it is the best phonetic match.
5. The full name should feel like a real Mandarin name, not a mechanical transliteration or a classroom placeholder.
6. The given name should preserve either the sound, rhythm, or emotional impression of "{english_name}".
7. Use the birth profile as a lightweight 八字 guide: favor imagery connected to {", ".join(birth_profile['balancingElements'])} and qualities such as {birth_profile['balancingImages']}.
8. Avoid lazy endings like 明 / 伟 / 芳 / 娜 unless the semantics are unusually well justified.
9. The name should be aesthetically pleasing, easy for Western users to remember, and culturally elegant.
10. Explain both the pronunciation bridge and the birth-profile balance.
11. suggestedCharacters must contain one entry for each Chinese character in chineseName, in order.

Return pure JSON only:
{{
  "chineseName": "3 Chinese characters preferred",
  "pinyin": "full pinyin with tone marks",
  "meaning": "natural English gloss of the whole name",
  "culturalExplanation": "2-3 sentences on why this is culturally elegant and suitable",
  "pronunciationMapping": "1-2 sentences on how the Chinese surname and given name echo {english_name}",
  "elementAnalysis": "1-2 sentences on how the birth date and optional birth time influenced the character choice",
  "suggestedCharacters": [
    {{"character": "姓", "meaning": "meaning of the surname character"}},
    {{"character": "名", "meaning": "meaning of the first given-name character"}},
    {{"character": "名", "meaning": "meaning of the second given-name character"}}
  ]
}}"""

        response_text = self._call_claude_api(prompt)
        parsed_response = self._parse_response(response_text)

        if self._is_generic_result(parsed_response):
            retry_prompt = prompt + f"""

Your last answer was too generic or incomplete. Try again with a name that is more distinctive for {english_name}.
Hard constraints for the retry:
- Avoid 李明 / 王伟 / 张伟 / 李华 / 王芳 and similar textbook defaults
- Keep the surname close to this candidate pool: {surname_prompt}
- Make the given name feel personally matched to {english_name}, not randomly generic
- Use the birth profile, especially {", ".join(birth_profile['balancingElements'])}, in the semantics
- Return JSON only"""
            retry_response = self._call_claude_api(retry_prompt)
            parsed_response = self._parse_response(retry_response)

        return self._normalize_response(parsed_response, fallback_context)


# Singleton instance
name_generator_service = NameGeneratorService()
