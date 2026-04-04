"use client";

import { motion, useSpring } from "framer-motion";
import { useEffect, useState } from "react";

// 百家姓 - Hundred Family Surnames
const surnames = [
  "赵", "钱", "孙", "李", "周", "吴", "郑", "王", "冯", "陈",
  "楚", "卫", "蒋", "沈", "韩", "杨", "朱", "秦", "尤", "许",
  "何", "吕", "施", "张", "孔", "曹", "严", "华", "金", "魏",
  "陶", "姜", "戚", "谢", "邹", "喻", "柏", "水", "窦", "章",
  "云", "苏", "潘", "葛", "奚", "范", "彭", "郎", "鲁", "韦",
  "马", "苗", "凤", "花", "方", "俞", "任", "袁", "柳", "酆",
  "鲍", "史", "唐", "费", "廉", "岑", "薛", "雷", "贺", "倪",
  "汤", "毛", "禹", "狄", "米", "贝", "明", "臧", "计", "伏",
  "成", "戴", "谈", "宋", "茅", "庞", "熊", "纪", "舒", "屈",
  "项", "祝", "董", "梁", "杜", "阮", "蓝", "闵", "席", "季",
  "廉", "邓", "许", "傅", "沈", "曾", "彭", "吕", "苏", "卢",
  "蒋", "蔡", "贾", "丁", "魏", "薛", "叶", "阎", "余", "潘",
  "杜", "戴", "夏", "伍", "谭", "姜", "范", "方", "石", "姚",
  "戚", "邹", "邱", "侯", "尹", "雷", "牛", "史", "龙", "万",
  "段", "钱", "汤", "尹", "黎", "易", "常", "武", "乔", "贺",
  "赖", "龚", "文", "欧阳", "司马", "上官", "诸葛", "慕容", "令狐"
];

// 书法风格配置 - 多样化字体
const calligraphyStyles = [
  // 楷书
  { fontFamily: "STKaiti, KaiTi, 'Noto Serif SC', serif", weight: "normal", color: "#9ca3af" },
  { fontFamily: "STKaiti, KaiTi, 'Noto Serif SC', serif", weight: "bold", color: "#6b7280" },
  // 宋体
  { fontFamily: "STSong, SimSun, 'Noto Serif SC', serif", weight: "normal", color: "#78716c" },
  // 隶书
  { fontFamily: "STLiti, LiSu, 'Noto Serif SC', serif", weight: "normal", color: "#57534e" },
  // 行楷
  { fontFamily: "STXingkai, XingKai, 'Noto Serif SC', serif", weight: "normal", color: "#6b7280" },
  // 小篆 (用特殊字体)
  { fontFamily: "'STZhongsong', 'Noto Serif SC', serif", weight: "normal", color: "#4b5563" },
  // 古风楷书
  { fontFamily: "'Noto Serif SC', 'STKaiti', serif", weight: "600", color: "#6b7280" },
];

// 神秘符号 - 甲骨文风格字符
const mysticalSymbols = [
  "☯", "☮", "✧", "✦", "★", "☆", "◇", "◆", "○", "●",
  "卍", "卐", "⊕", "∞", "※", "△", "▽", "☆", "◇"
];

interface FloatingSurname {
  id: number;
  character: string;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  rotation: number;
  opacity: number;
  style: typeof calligraphyStyles[0];
  vertical: boolean;
  floatX: number;
  floatY: number;
  floatDuration: number;
}

function generateFloatingSurnames(): FloatingSurname[] {
  const result: FloatingSurname[] = [];
  const usedPositions: { x: number; y: number }[] = [];

  for (let i = 0; i < 60; i++) {
    let x: number;
    let y: number;
    let attempts = 0;
    do {
      x = Math.random() * 92 + 2;
      y = Math.random() * 92 + 2;
      attempts++;
    } while (
      attempts < 50 &&
      usedPositions.some(pos => Math.abs(pos.x - x) < 10 && Math.abs(pos.y - y) < 8)
    );
    usedPositions.push({ x, y });

    // 混合使用姓氏和神秘符号
    const useSymbol = Math.random() > 0.75;
    const char = useSymbol
      ? mysticalSymbols[Math.floor(Math.random() * mysticalSymbols.length)]
      : surnames[Math.floor(Math.random() * surnames.length)];

    result.push({
      id: i,
      character: char,
      x,
      y,
      size: Math.random() * 2.5 + 2.5, // 2.5-5rem
      duration: Math.random() * 35 + 30, // 30-65s
      delay: Math.random() * 20,
      rotation: Math.random() * 60 - 30, // -30 to 30 degrees
      opacity: Math.random() * 0.15 + 0.08, // 0.08-0.23
      style: calligraphyStyles[Math.floor(Math.random() * calligraphyStyles.length)],
      vertical: Math.random() > 0.5,
      floatX: Math.random() * 80 - 40, // 大幅左右游动 -40 to 40
      floatY: Math.random() * 80 + 30, // 大幅上下浮动 30 to 110
      floatDuration: Math.random() * 20 + 15, // 15-35s for each float cycle
    });
  }
  return result;
}

const floatingSurnames = generateFloatingSurnames();

function FloatingSurnameItem({ item }: { item: FloatingSurname }) {
  const springX = useSpring(item.x, { stiffness: 12, damping: 18 });
  const springY = useSpring(item.y, { stiffness: 12, damping: 18 });

  return (
    <motion.div
      className="absolute select-none pointer-events-none"
      style={{
        left: `${item.x}%`,
        top: `${item.y}%`,
        fontSize: `${item.size}rem`,
        fontFamily: item.style.fontFamily,
        fontWeight: item.style.weight,
        writingMode: item.vertical ? "vertical-rl" : "horizontal-tb",
        x: springX,
        y: springY,
      }}
      animate={{
        opacity: [item.opacity * 0.7, item.opacity, item.opacity * 0.7],
        // 大幅游动效果
        x: [
          `0%`,
          `${item.floatX * 0.3}%`,
          `${item.floatX * 0.6}%`,
          `${item.floatX * 0.3}%`,
          `0%`,
          `${item.floatX * -0.2}%`,
          `${item.floatX * -0.4}%`,
          `${item.floatX * -0.2}%`,
          `0%`,
        ],
        y: [
          `0px`,
          `${item.floatY * 0.3}px`,
          `${item.floatY * 0.6}px`,
          `${item.floatY}px`,
          `${item.floatY * 0.6}px`,
          `${item.floatY * 0.3}px`,
          `0px`,
          `${item.floatY * -0.3}px`,
          `0px`,
        ],
        rotate: [
          item.rotation,
          item.rotation + 5,
          item.rotation + 8,
          item.rotation + 5,
          item.rotation,
          item.rotation - 5,
          item.rotation - 8,
          item.rotation - 5,
          item.rotation,
        ],
        scale: [1, 1.03, 1.05, 1.03, 1, 0.97, 0.95, 0.97, 1],
      }}
      transition={{
        duration: item.duration,
        delay: item.delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <span
        style={{
          color: item.style.color,
          textShadow: "0 2px 4px rgba(0,0,0,0.06)",
        }}
      >
        {item.character}
      </span>
    </motion.div>
  );
}

// 装饰性印章 - 更精致
function SealStamp({ x, y, delay, size = 60 }: { x: number; y: number; delay: number; size?: number }) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
      }}
      animate={{
        opacity: [0, 0.08, 0.08, 0],
        scale: [0.7, 1, 1, 0.7],
        rotate: [-20, -15, -20],
        y: [0, -15, 0, -8],
      }}
      transition={{
        duration: 25,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <div
        className="w-full h-full rounded-lg flex items-center justify-center"
        style={{
          border: "2px solid #b45309",
          background: "rgba(180, 83, 9, 0.04)",
          boxShadow: "0 4px 12px rgba(180, 83, 9, 0.1)",
        }}
      >
        <span
          className="text-lg font-bold"
          style={{
            fontFamily: "'Noto Serif SC', 'STLiti', serif",
            color: "#b45309",
            letterSpacing: "0.1em",
          }}
        >
          名
        </span>
      </div>
    </motion.div>
  );
}

// 墨点装饰
function InkSplatter({ x, y, delay }: { x: number; y: number; delay: number }) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: 4,
        height: 4,
      }}
      animate={{
        opacity: [0, 0.12, 0.08, 0],
        scale: [0, 1.5, 2, 0],
        x: [0, 15, 30],
        y: [0, -20, -40],
      }}
      transition={{
        duration: 12,
        delay,
        repeat: Infinity,
        ease: "easeOut",
      }}
    >
      <div
        className="w-full h-full rounded-full"
        style={{
          background: "radial-gradient(circle, #44403c 0%, transparent 70%)",
        }}
      />
    </motion.div>
  );
}

// 流动的金色光点
function GoldenParticle({ x, y, delay }: { x: number; y: number; delay: number }) {
  return (
    <motion.div
      className="absolute pointer-events-none rounded-full"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: 3,
        height: 3,
      }}
      animate={{
        opacity: [0, 0.4, 0.2, 0],
        scale: [0, 1, 0.5, 0],
        y: [0, -100, -200],
        x: [0, 20, 0],
      }}
      transition={{
        duration: 15,
        delay,
        repeat: Infinity,
        ease: "easeOut",
      }}
    >
      <div
        className="w-full h-full rounded-full"
        style={{
          background: "radial-gradient(circle, #d97706 0%, transparent 70%)",
          boxShadow: "0 0 6px #d97706",
        }}
      />
    </motion.div>
  );
}

export default function FloatingCharacters() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* 浮动姓氏 - 60个 */}
      {floatingSurnames.map((item) => (
        <FloatingSurnameItem key={item.id} item={item} />
      ))}

      {/* 装饰性印章 */}
      <SealStamp x={3} y={8} delay={0} size={55} />
      <SealStamp x={92} y={75} delay={10} size={50} />
      <SealStamp x={80} y={12} delay={5} size={45} />
      <SealStamp x={8} y={88} delay={15} size={55} />
      <SealStamp x={50} y={3} delay={8} size={48} />
      <SealStamp x={65} y={90} delay={12} size={52} />

      {/* 墨点装饰 */}
      {[...Array(12)].map((_, i) => (
        <InkSplatter
          key={`ink-${i}`}
          x={Math.random() * 90 + 5}
          y={Math.random() * 90 + 5}
          delay={i * 2.5}
        />
      ))}

      {/* 金色光点 */}
      {[...Array(6)].map((_, i) => (
        <GoldenParticle
          key={`gold-${i}`}
          x={Math.random() * 80 + 10}
          y={Math.random() * 60 + 20}
          delay={i * 4}
        />
      ))}

      {/* 柔和的渐变 */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 50% 40% at 5% 10%, rgba(217, 119, 6, 0.05) 0%, transparent 50%),
            radial-gradient(ellipse 40% 30% at 95% 85%, rgba(180, 83, 9, 0.04) 0%, transparent 50%),
            radial-gradient(ellipse 60% 50% at 50% 50%, rgba(251, 191, 36, 0.02) 0%, transparent 50%)
          `,
        }}
      />
    </div>
  );
}
