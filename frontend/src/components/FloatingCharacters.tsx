"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useState } from "react";

// 百家姓 - Hundred Family Surnames (精选常用姓氏)
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
  "项", "祝", "董", "梁", "杜", "阮", "蓝", "闵", "席", "季"
];

// 书法风格配置 - 适合浅色背景的颜色
const calligraphyStyles = [
  { fontFamily: "STKaiti, KaiTi, serif", weight: "normal", color: "#a8a29e" },      // 楷书 - 灰色
  { fontFamily: "STKaiti, KaiTi, serif", weight: "bold", color: "#78716c" },         // 楷书 - 深灰
  { fontFamily: "STSong, SimSun, serif", weight: "normal", color: "#57534e" },       // 宋体 - 中灰
  { fontFamily: "STLiti, LiSu, serif", weight: "normal", color: "#9ca3af" },        // 隶书 - 浅灰
  { fontFamily: "STXingkai, XingKai, serif", weight: "normal", color: "#6b7280" },  // 行楷 - 蓝灰
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
}

function generateFloatingSurnames(): FloatingSurname[] {
  const result: FloatingSurname[] = [];
  const usedPositions: { x: number; y: number }[] = [];

  for (let i = 0; i < 30; i++) {
    let x: number;
    let y: number;
    let attempts = 0;
    do {
      x = Math.random() * 85 + 5;
      y = Math.random() * 85 + 5;
      attempts++;
    } while (
      attempts < 50 &&
      usedPositions.some(pos => Math.abs(pos.x - x) < 12 && Math.abs(pos.y - y) < 10)
    );
    usedPositions.push({ x, y });

    result.push({
      id: i,
      character: surnames[Math.floor(Math.random() * surnames.length)],
      x,
      y,
      size: Math.random() * 2.5 + 2,
      duration: Math.random() * 40 + 30,
      delay: Math.random() * 20,
      rotation: Math.random() * 30 - 15,
      opacity: Math.random() * 0.06 + 0.02,
      style: calligraphyStyles[Math.floor(Math.random() * calligraphyStyles.length)],
      vertical: Math.random() > 0.6,
    });
  }
  return result;
}

const floatingSurnames = generateFloatingSurnames();

function FloatingSurnameItem({ item }: { item: FloatingSurname }) {
  const springX = useSpring(item.x, { stiffness: 8, damping: 25 });
  const springY = useSpring(item.y, { stiffness: 8, damping: 25 });

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
        transform: `rotate(${item.rotation}deg)`,
        x: springX,
        y: springY,
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{
        opacity: [0, item.opacity, item.opacity, 0],
        y: [0, -15, -8, 0],
        x: [0, 8, 4, 0],
        rotate: [item.rotation, item.rotation + 5, item.rotation, item.rotation],
        scale: [0.8, 1, 1, 0.8],
      }}
      transition={{
        duration: item.duration,
        delay: item.delay,
        repeat: Infinity,
        ease: "easeInOut",
        times: [0, 0.2, 0.5, 1],
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

// 装饰性印章 - 浅色版本
function SealStamp({ x, y, delay }: { x: number; y: number; delay: number }) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: 50,
        height: 50,
      }}
      initial={{ opacity: 0, scale: 0.5, rotate: -30 }}
      animate={{
        opacity: [0, 0.04, 0.04, 0],
        scale: [0.5, 1, 1, 0.5],
        rotate: [-30, -25, -30],
      }}
      transition={{
        duration: 25,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <div
        className="w-full h-full rounded flex items-center justify-center"
        style={{
          border: "1.5px solid #d97706",
          background: "rgba(217, 119, 6, 0.03)",
        }}
      >
        <span
          className="text-sm font-bold"
          style={{
            fontFamily: "STLiti, LiSu, serif",
            color: "#d97706",
          }}
        >
          名
        </span>
      </div>
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
      {/* 浮动姓氏 */}
      {floatingSurnames.map((item) => (
        <FloatingSurnameItem key={item.id} item={item} />
      ))}

      {/* 装饰性印章 */}
      <SealStamp x={5} y={15} delay={0} />
      <SealStamp x={88} y={75} delay={7} />
      <SealStamp x={75} y={20} delay={14} />
      <SealStamp x={15} y={80} delay={5} />

      {/* 柔和的渐变叠加 */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 20% 20%, rgba(217, 119, 6, 0.03) 0%, transparent 50%),
            radial-gradient(ellipse 60% 50% at 80% 80%, rgba(185, 28, 28, 0.02) 0%, transparent 50%),
            radial-gradient(ellipse 100% 100% at 50% 50%, transparent 60%, rgba(41, 37, 36, 0.02) 100%)
          `,
        }}
      />
    </div>
  );
}
