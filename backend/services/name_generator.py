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

    def __init__(self):
        self.api_key = os.getenv("ANTHROPIC_API_KEY")
        self.base_url = os.getenv("ANTHROPIC_BASE_URL", "https://api.minimaxi.com/anthropic")
        self.model = "MiniMax-M2.7"

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
                return response.content[0].text
            return ""
        except Exception as e:
            raise Exception(f"Failed to call Claude API: {str(e)}")

    def _parse_response(self, response_text: str) -> dict:
        """Parse the JSON response from Claude API."""
        # Try to extract JSON from the response
        json_match = re.search(r'\{[^{}]*\}', response_text, re.DOTALL)
        if json_match:
            try:
                return json.loads(json_match.group())
            except json.JSONDecodeError:
                pass

        # Fallback: try to parse the whole response as JSON
        try:
            return json.loads(response_text)
        except json.JSONDecodeError:
            pass

        # Return fallback data if parsing fails
        return {
            "chineseName": "李明",
            "pinyin": "Lǐ Míng",
            "meaning": "Bright and intelligent",
            "culturalExplanation": "This name was chosen based on traditional Chinese naming principles.",
            "suggestedCharacters": [
                {"character": "李", "meaning": "plum tree, a common surname"},
                {"character": "明", "meaning": "bright, intelligent"}
            ]
        }

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

        prompt = f"""You are an expert in Chinese naming conventions and Chinese astrology (八字). Generate a meaningful Chinese name for a {age}-year-old {gender_text} person named "{english_name}" born on {year}-{month}-{day}.

Based on the principles of Chinese naming:
1. The name should sound pleasant and be easy for Westerners to pronounce
2. Consider the Five Elements (五行) balance based on birth date
3. The characters should have positive meanings
4. Include proper pinyin with tone marks

Return a JSON object with this exact structure (no markdown, just pure JSON):
{{
  "chineseName": "中文名",
  "pinyin": "pīnyīn with tones",
  "meaning": "English meaning of the full name",
  "culturalExplanation": "2-3 sentences about the cultural significance and why these characters were chosen based on {english_name}'s birth date and personality",
  "suggestedCharacters": [
    {{"character": "字", "meaning": "meaning of this character"}},
    {{"character": "字", "meaning": "meaning of this character"}}
  ]
}}

Important:
- Chinese name should be 2 characters (one family name + one given name, or just 2 given names if using Western-style)
- Family name should be a common Chinese surname like 王, 李, 张, 刘, 陈, 杨, 赵, 黄, 周, 吴, 徐, 孙, 胡, 朱, 高, 林, 何, 郭, 马, 罗, 梁, 宋, 郑, 谢, 韩, 唐, 冯, 董, 萧, 程, 曹, 袁, 邓, 许, 傅, 沈, 曾, 彭, 吕, 苏, 卢, 蒋, 蔡, 贾, 丁, 魏, 薛, 叶, 阎, 余, 潘, 杜, 戴, 夏, 伍, 谭, 姜, 范, 方, 石, 姚, 戚, 邹, 邱, 侯, 尹, 雷, 牛, 史, 龙, 万, 段, 钱, 汤, 尹, 黎, 易, 常, 武, 乔, 贺, 赖, 龚, 文
- Given name characters should complement and balance the overall meaning
- Make it creative but culturally appropriate"""

        response_text = self._call_claude_api(prompt)
        parsed_response = self._parse_response(response_text)

        return parsed_response


# Singleton instance
name_generator_service = NameGeneratorService()
