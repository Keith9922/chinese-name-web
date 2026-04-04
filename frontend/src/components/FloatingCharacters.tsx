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

// 书法风格配置 - 不同书法风格
const calligraphyStyles = [
  { fontFamily: "STKaiti, KaiTi, serif", weight: "normal", color: "#8b4513" },      // 楷书 - 棕色
  { fontFamily: "STKaiti, KaiTi, serif", weight: "bold", color: "#4a1a1a" },       // 楷书 - 深红
  { fontFamily: "STSong, SimSun, serif", weight: "normal", color: "#2d2d2d" },       // 宋体 - 墨黑
  { fontFamily: "STLiti, LiSu, serif", weight: "normal", color: "#6b3a3a" },        // 隶书 - 褐色
  { fontFamily: "STXingkai, XingKai, serif", weight: "normal", color: "#1e3a5f" },  // 行楷 - 深蓝
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
  vertical: boolean; // 是否竖排
}

function generateFloatingSurnames(): FloatingSurname[] {
  const result: FloatingSurname[] = [];
  const usedPositions: { x: number; y: number }[] = [];

  for (let i = 0; i < 35; i++) {
    let x: number;
    let y: number;
    let attempts = 0;
    do {
      x = Math.random() * 85 + 5; // 5-90%
      y = Math.random() * 85 + 5; // 5-90%
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
      size: Math.random() * 3 + 2.5, // 2.5-5.5rem
      duration: Math.random() * 40 + 30, // 30-70s
      delay: Math.random() * 20,
      rotation: Math.random() * 30 - 15, // -15 to 15 degrees
      opacity: Math.random() * 0.08 + 0.03, // 0.03-0.11
      style: calligraphyStyles[Math.floor(Math.random() * calligraphyStyles.length)],
      vertical: Math.random() > 0.6, // 40% chance vertical
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
        y: [0, -20, -10, 0],
        x: [0, 10, 5, 0],
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
          textShadow: "0 2px 4px rgba(0,0,0,0.1)",
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
        width: 60,
        height: 60,
      }}
      initial={{ opacity: 0, scale: 0.5, rotate: -30 }}
      animate={{
        opacity: [0, 0.06, 0.06, 0],
        scale: [0.5, 1, 1, 0.5],
        rotate: [-30, -25, -30],
      }}
      transition={{
        duration: 20,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <div
        className="w-full h-full rounded-md flex items-center justify-center"
        style={{
          border: "2px solid #8b2323",
          background: "rgba(139, 35, 35, 0.05)",
        }}
      >
        <span
          className="text-lg font-bold"
          style={{
            fontFamily: "STLiti, LiSu, serif",
            color: "#8b2323",
          }}
        >
          名
        </span>
      </div>
    </motion.div>
  );
}

// 墨点装饰
function InkDot({ x, y, size, delay }: { x: number; y: number; size: number; delay: number }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
        background: "radial-gradient(circle, rgba(30,30,30,0.3) 0%, transparent 70%)",
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: [0, 0.15, 0.15, 0],
        scale: [0, 1, 1.5, 0],
      }}
      transition={{
        duration: 15,
        delay,
        repeat: Infinity,
        ease: "easeOut",
      }}
    />
  );
}

// 宣纸纹理背景
function RicePaperTexture() {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        background: `
          radial-gradient(ellipse 100% 100% at 50% 0%, rgba(255, 248, 240, 0.3) 0%, transparent 50%),
          radial-gradient(ellipse 100% 100% at 50% 100%, rgba(255, 248, 240, 0.2) 0%, transparent 50%),
          linear-gradient(180deg, rgba(20, 15, 10, 0.02) 0%, rgba(20, 15, 10, 0.05) 100%)
        `,
      }}
    >
      {/* 细微纹理 */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}

// 水墨晕染效果
function InkWashEffect() {
  return (
    <motion.div
      className="absolute inset-0 pointer-events-none overflow-hidden"
      animate={{
        opacity: [0.02, 0.04, 0.02],
      }}
      transition={{
        duration: 20,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {/* 左上角晕染 */}
      <div
        className="absolute -top-1/4 -left-1/4 w-2/3 h-2/3 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(60, 40, 30, 0.15) 0%, transparent 60%)",
          filter: "blur(40px)",
        }}
      />
      {/* 右下角晕染 */}
      <div
        className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(80, 50, 40, 0.1) 0%, transparent 60%)",
          filter: "blur(50px)",
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
      {/* 宣纸纹理背景 */}
      <RicePaperTexture />

      {/* 水墨晕染效果 */}
      <InkWashEffect />

      {/* 浮动姓氏 */}
      {floatingSurnames.map((item) => (
        <FloatingSurnameItem key={item.id} item={item} />
      ))}

      {/* 装饰性印章 */}
      <SealStamp x={5} y={15} delay={0} />
      <SealStamp x={88} y={75} delay={7} />
      <SealStamp x={75} y={20} delay={14} />
      <SealStamp x={15} y={80} delay={5} />

      {/* 墨点装饰 */}
      {[...Array(8)].map((_, i) => (
        <InkDot
          key={i}
          x={Math.random() * 90 + 5}
          y={Math.random() * 90 + 5}
          size={Math.random() * 8 + 4}
          delay={i * 3}
        />
      ))}

      {/* 柔和的渐变叠加 - 温暖的氛围 */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 20% 20%, rgba(139, 90, 43, 0.03) 0%, transparent 50%),
            radial-gradient(ellipse 60% 50% at 80% 80%, rgba(139, 35, 35, 0.03) 0%, transparent 50%),
            radial-gradient(ellipse 100% 100% at 50% 50%, transparent 60%, rgba(20, 15, 10, 0.15) 100%)
          `,
        }}
      />
    </div>
  );
}
