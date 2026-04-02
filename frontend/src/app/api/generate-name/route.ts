import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface NameGenerationRequest {
  englishName: string;
  gender: "male" | "female" | "other";
  birthDate: string; // YYYY-MM-DD
  birthTime?: string; // HH:MM optional
}

export interface NameGenerationResponse {
  chineseName: string;
  pinyin: string;
  meaning: string;
  culturalExplanation: string;
  suggestedCharacters: {
    character: string;
    meaning: string;
  }[];
}

export async function POST(request: NextRequest) {
  try {
    const body: NameGenerationRequest = await request.json();
    const { englishName, gender, birthDate } = body;

    if (!englishName || !gender || !birthDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Parse birth date for age calculation
    const birth = new Date(birthDate);
    const today = new Date();
    const age = Math.floor(
      (today.getTime() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
    );

    const genderText = gender === "male" ? "male" : gender === "female" ? "female" : "any";
    const year = birth.getFullYear();
    const month = birth.getMonth() + 1;
    const day = birth.getDate();

    const prompt = `You are an expert in Chinese naming conventions and Chinese astrology (八字). Generate a meaningful Chinese name for a ${age}-year-old ${genderText} person named "${englishName}" born on ${year}-${month}-${day}.

Based on the principles of Chinese naming:
1. The name should sound pleasant and be easy for Westerners to pronounce
2. Consider the Five Elements (五行) balance based on birth date
3. The characters should have positive meanings
4. Include proper pinyin with tone marks

Return a JSON object with this exact structure (no markdown, just pure JSON):
{
  "chineseName": "中文名",
  "pinyin": "pīnyīn with tones",
  "meaning": "English meaning of the full name",
  "culturalExplanation": "2-3 sentences about the cultural significance and why these characters were chosen based on ${englishName}'s birth date and personality",
  "suggestedCharacters": [
    {"character": "字", "meaning": "meaning of this character"},
    {"character": "字", "meaning": "meaning of this character"}
  ]
}

Important:
- Chinese name should be 2 characters (one family name + one given name, or just 2 given names if using Western-style)
- Family name should be a common Chinese surname like 王, 李, 张, 刘, 陈, 杨, 赵, 黄, 周, 吴, 徐, 孙, 胡, 朱, 高, 林, 何, 郭, 马, 罗, 梁, 宋, 郑, 谢, 韩, 唐, 冯, 董, 萧, 程, 曹, 袁, 邓, 许, 傅, 沈, 曾, 彭, 吕, 苏, 卢, 蒋, 蔡, 贾, 丁, 魏, 薛, 叶, 阎, 余, 潘, 杜, 戴, 夏, 伍, 谭, 姜, 范, 方, 石, 姚, 戚, 邹, 邱, 侯, 尹, 雷, 牛, 史, 龙, 万, 段, 钱, 汤, 尹, 黎, 易, 常, 武, 乔, 贺, 赖, 龚, 文
- Given name characters should complement and balance the overall meaning
- Make it creative but culturally appropriate`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const responseText = message.content[0].type === "text" ? message.content[0].text : "";

    // Parse the JSON response
    let parsed: NameGenerationResponse;
    try {
      parsed = JSON.parse(responseText);
    } catch {
      // Fallback if JSON parsing fails
      parsed = {
        chineseName: "李明",
        pinyin: "Lǐ Míng",
        meaning: "Bright and intelligent",
        culturalExplanation: "This name was chosen based on traditional Chinese naming principles.",
        suggestedCharacters: [
          { character: "李", meaning: "plum tree, a common surname" },
          { character: "明", meaning: "bright, intelligent" },
        ],
      };
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Name generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate name" },
      { status: 500 }
    );
  }
}
