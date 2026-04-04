"use client";

import { motion } from "framer-motion";

// 百家姓 - Hundred Family Surnames (只用姓氏，去掉无关符号)
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

// 书法风格配置 - 温暖的古铜色系
const calligraphyStyles = [
  { fontFamily: "STKaiti, KaiTi, 'Noto Serif SC', serif", weight: "normal", color: "#c4b5a4" },
  { fontFamily: "STKaiti, KaiTi, 'Noto Serif SC', serif", weight: "bold", color: "#a89888" },
  { fontFamily: "STSong, SimSun, 'Noto Serif SC', serif", weight: "normal", color: "#b5a594" },
  { fontFamily: "STLiti, LiSu, 'Noto Serif SC', serif", weight: "normal", color: "#9c8b7a" },
  { fontFamily: "STXingkai, XingKai, 'Noto Serif SC', serif", weight: "normal", color: "#a89888" },
  { fontFamily: "'STZhongsong', 'Noto Serif SC', serif", weight: "normal", color: "#8b7b6a" },
  { fontFamily: "'Noto Serif SC', 'STKaiti', serif", weight: "600", color: "#7a6b5a" },
  { fontFamily: "'Noto Serif SC', serif", weight: "400", color: "#c9baa8" },
];

interface FallingSurname {
  id: number;
  character: string;
  x: number;
  startY: number;
  size: number;
  duration: number;
  delay: number;
  rotation: number;
  opacity: number;
  style: typeof calligraphyStyles[0];
  vertical: boolean;
}

function generateFallingSurnames(): FallingSurname[] {
  const result: FallingSurname[] = [];

  for (let i = 0; i < 45; i++) {
    // 随机分布在整个屏幕，分散开避免重叠
    const x = Math.random() * 90 + 5; // 5-95%
    // 初始Y位置随机分布，这样下降时间错开形成瀑布
    const startY = Math.random() * 120 - 20; // -20% 到 100%

    result.push({
      id: i,
      character: surnames[Math.floor(Math.random() * surnames.length)],
      x,
      startY,
      size: Math.random() * 1.8 + 2.2, // 2.2-4rem
      duration: Math.random() * 40 + 50, // 50-90秒，非常缓慢
      delay: Math.random() * 60, // 0-60秒延迟，让它们错开
      rotation: Math.random() * 30 - 15, // -15 to 15 degrees
      opacity: Math.random() * 0.12 + 0.06, // 0.06-0.18
      style: calligraphyStyles[Math.floor(Math.random() * calligraphyStyles.length)],
      vertical: Math.random() > 0.6,
    });
  }
  return result;
}

const fallingSurnames = generateFallingSurnames();

function FallingSurnameItem({ item }: { item: FallingSurname }) {
  // 每个字符从顶部缓慢下降到底部，然后瞬间回到顶部循环
  return (
    <motion.div
      className="absolute select-none pointer-events-none"
      style={{
        left: `${item.x}%`,
        top: 0,
        fontSize: `${item.size}rem`,
        fontFamily: item.style.fontFamily,
        fontWeight: item.style.weight,
        writingMode: item.vertical ? "vertical-rl" : "horizontal-tb",
        transform: `rotate(${item.rotation}deg)`,
        opacity: item.opacity,
      }}
      animate={{
        // 从 startY 位置下降到 120%，然后瞬间回到 -20% 重新开始
        y: [`${item.startY}vh`, `${120}vh`],
        rotate: [item.rotation, item.rotation + 8],
        opacity: [item.opacity, item.opacity * 0.8, item.opacity],
      }}
      transition={{
        duration: item.duration,
        delay: item.delay,
        repeat: Infinity,
        ease: "linear", // 匀速下降
        repeatDelay: 0, // 下降到底部后立即回到顶部
      }}
    >
      <span
        style={{
          color: item.style.color,
          textShadow: "0 1px 2px rgba(0,0,0,0.05)",
        }}
      >
        {item.character}
      </span>
    </motion.div>
  );
}

// 装饰性印章
function SealStamp({ x, y, delay }: { x: number; y: number; delay: number }) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: 55,
        height: 55,
      }}
      animate={{
        opacity: [0, 0.06, 0.06, 0],
        scale: [0.8, 1, 1, 0.8],
        rotate: [-15, -10, -15],
        y: [0, -10, 0],
      }}
      transition={{
        duration: 30,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <div
        className="w-full h-full rounded-lg flex items-center justify-center"
        style={{
          border: "2px solid #b45309",
          background: "rgba(180, 83, 9, 0.03)",
        }}
      >
        <span
          className="text-base font-bold"
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

export default function FloatingCharacters() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* 缓慢下降的姓氏瀑布 */}
      {fallingSurnames.map((item) => (
        <FallingSurnameItem key={item.id} item={item} />
      ))}

      {/* 装饰性印章 */}
      <SealStamp x={5} y={15} delay={0} />
      <SealStamp x={88} y={60} delay={12} />
      <SealStamp x={75} y={25} delay={6} />
      <SealStamp x={15} y={75} delay={18} />
      <SealStamp x={50} y={40} delay={9} />

      {/* 淡淡的渐变 */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 60% 50% at 10% 20%, rgba(180, 83, 9, 0.03) 0%, transparent 50%),
            radial-gradient(ellipse 50% 40% at 90% 80%, rgba(153, 27, 27, 0.02) 0%, transparent 50%),
            radial-gradient(ellipse 80% 80% at 50% 50%, transparent 40%, rgba(253, 248, 243, 0.3) 100%)
          `,
        }}
      />
    </div>
  );
}
