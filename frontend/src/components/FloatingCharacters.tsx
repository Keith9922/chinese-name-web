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
  "项", "祝", "董", "梁", "杜", "阮", "蓝", "闵", "席", "季",
  "廉", "邓", "许", "傅", "沈", "曾", "彭", "吕", "苏", "卢",
  "蒋", "蔡", "贾", "丁", "魏", "薛", "叶", "阎", "余", "潘",
  "杜", "戴", "夏", "伍", "谭", "姜", "范", "方", "石", "姚",
  "戚", "邹", "邱", "侯", "尹", "雷", "牛", "史", "龙", "万",
  "段", "钱", "汤", "尹", "黎", "易", "常", "武", "乔", "贺",
  "赖", "龚", "文", "欧阳", "司马", "上官", "诸葛", "慕容", "令狐"
];

// 书法风格配置 - 深色系，更清晰可见
const calligraphyStyles = [
  { fontFamily: "STKaiti, KaiTi, serif", weight: "normal", color: "#d6d3d1" },      // 楷书 - 浅灰
  { fontFamily: "STKaiti, KaiTi, serif", weight: "bold", color: "#a8a29e" },         // 楷书 - 中灰
  { fontFamily: "STSong, SimSun, serif", weight: "normal", color: "#78716c" },       // 宋体 - 深灰
  { fontFamily: "STLiti, LiSu, serif", weight: "normal", color: "#57534e" },        // 隶书 - 暗灰
  { fontFamily: "STXingkai, XingKai, serif", weight: "normal", color: "#44403c" },  // 行楷 - 墨灰
  { fontFamily: "STKaiti, KaiTi, serif", weight: "normal", color: "#e7e5e4" },      // 楷书 - 极浅
  { fontFamily: "STSong, SimSun, serif", weight: "normal", color: "#a8a29e" },       // 宋体
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
  floatDistance: number;
}

function generateFloatingSurnames(): FloatingSurname[] {
  const result: FloatingSurname[] = [];
  const usedPositions: { x: number; y: number }[] = [];

  for (let i = 0; i < 50; i++) {
    let x: number;
    let y: number;
    let attempts = 0;
    do {
      x = Math.random() * 90 + 3;
      y = Math.random() * 90 + 3;
      attempts++;
    } while (
      attempts < 50 &&
      usedPositions.some(pos => Math.abs(pos.x - x) < 10 && Math.abs(pos.y - y) < 8)
    );
    usedPositions.push({ x, y });

    result.push({
      id: i,
      character: surnames[Math.floor(Math.random() * surnames.length)],
      x,
      y,
      size: Math.random() * 2 + 2.5, // 2.5-4.5rem，更大更明显
      duration: Math.random() * 30 + 25, // 25-55s，更慢更优雅
      delay: Math.random() * 15,
      rotation: Math.random() * 40 - 20, // -20 to 20 degrees
      opacity: Math.random() * 0.12 + 0.06, // 0.06-0.18，更明显
      style: calligraphyStyles[Math.floor(Math.random() * calligraphyStyles.length)],
      vertical: Math.random() > 0.5,
      floatDistance: Math.random() * 30 + 20, // 浮动距离
    });
  }
  return result;
}

const floatingSurnames = generateFloatingSurnames();

function FloatingSurnameItem({ item }: { item: FloatingSurname }) {
  const springX = useSpring(item.x, { stiffness: 15, damping: 20 });
  const springY = useSpring(item.y, { stiffness: 15, damping: 20 });

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
      animate={{
        opacity: [item.opacity * 0.6, item.opacity, item.opacity * 0.6],
        y: [
          `0px`,
          `-${item.floatDistance * 0.5}px`,
          `-${item.floatDistance}px`,
          `-${item.floatDistance * 0.5}px`,
          `0px`
        ],
        x: [
          `0px`,
          `${item.floatDistance * 0.2}px`,
          `${item.floatDistance * 0.3}px`,
          `${item.floatDistance * 0.1}px`,
          `0px`
        ],
        rotate: [
          item.rotation,
          item.rotation + 3,
          item.rotation + 5,
          item.rotation + 2,
          item.rotation
        ],
        scale: [1, 1.02, 1.05, 1.02, 1],
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
          textShadow: "0 1px 2px rgba(0,0,0,0.08)",
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
        rotate: [-25, -20, -25],
        y: [0, -8, 0],
      }}
      transition={{
        duration: 20,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <div
        className="w-full h-full rounded flex items-center justify-center"
        style={{
          border: "1.5px solid #d97706",
          background: "rgba(217, 119, 6, 0.05)",
        }}
      >
        <span
          className="text-base font-bold"
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
      {/* 浮动姓氏 - 50个 */}
      {floatingSurnames.map((item) => (
        <FloatingSurnameItem key={item.id} item={item} />
      ))}

      {/* 装饰性印章 */}
      <SealStamp x={3} y={10} delay={0} />
      <SealStamp x={90} y={75} delay={8} />
      <SealStamp x={78} y={15} delay={4} />
      <SealStamp x={12} y={85} delay={12} />
      <SealStamp x={50} y={5} delay={6} />

      {/* 淡淡的渐变叠加 */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 60% 50% at 10% 20%, rgba(217, 119, 6, 0.04) 0%, transparent 50%),
            radial-gradient(ellipse 50% 40% at 90% 80%, rgba(185, 28, 28, 0.03) 0%, transparent 50%),
            radial-gradient(ellipse 80% 80% at 50% 50%, transparent 50%, rgba(41, 37, 36, 0.015) 100%)
          `,
        }}
      />
    </div>
  );
}
