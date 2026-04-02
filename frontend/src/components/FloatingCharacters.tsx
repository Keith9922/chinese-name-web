"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useState } from "react";

interface FloatingCharacter {
  character: string;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  rotation: number;
  opacity: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  color: string;
}

interface LanternProps {
  x: number;
  delay: number;
  size: number;
}

const floatingCharacters: FloatingCharacter[] = [
  { character: "福", x: 3, y: 8, size: 5, duration: 25, delay: 0, rotation: 12, opacity: 0.12 },
  { character: "禄", x: 12, y: 72, size: 6, duration: 30, delay: 2, rotation: -8, opacity: 0.1 },
  { character: "寿", x: 22, y: 15, size: 4.5, duration: 28, delay: 4, rotation: 15, opacity: 0.08 },
  { character: "喜", x: 35, y: 82, size: 5, duration: 32, delay: 1, rotation: -5, opacity: 0.1 },
  { character: "财", x: 48, y: 12, size: 4, duration: 26, delay: 3, rotation: 20, opacity: 0.08 },
  { character: "安", x: 58, y: 65, size: 6, duration: 35, delay: 5, rotation: -12, opacity: 0.1 },
  { character: "康", x: 68, y: 28, size: 5, duration: 29, delay: 2.5, rotation: 8, opacity: 0.09 },
  { character: "乐", x: 78, y: 78, size: 4.5, duration: 27, delay: 4.5, rotation: -15, opacity: 0.1 },
  { character: "和", x: 88, y: 42, size: 5.5, duration: 33, delay: 1.5, rotation: 10, opacity: 0.08 },
  { character: "满", x: 8, y: 48, size: 5.5, duration: 31, delay: 3.5, rotation: -10, opacity: 0.09 },
  { character: "春", x: 52, y: 3, size: 4.5, duration: 24, delay: 0.5, rotation: 18, opacity: 0.1 },
  { character: "龙", x: 72, y: 68, size: 7, duration: 36, delay: 6, rotation: -20, opacity: 0.11 },
  { character: "凤", x: 28, y: 38, size: 6, duration: 34, delay: 2, rotation: 14, opacity: 0.1 },
  { character: "玉", x: 92, y: 22, size: 4, duration: 22, delay: 5.5, rotation: -6, opacity: 0.08 },
  { character: "福", x: 62, y: 88, size: 5, duration: 28, delay: 1, rotation: 8, opacity: 0.1 },
  { character: "缘", x: 18, y: 55, size: 4.5, duration: 30, delay: 3, rotation: -8, opacity: 0.09 },
  { character: "德", x: 82, y: 18, size: 5, duration: 27, delay: 4, rotation: 12, opacity: 0.08 },
  { character: "道", x: 42, y: 45, size: 6.5, duration: 35, delay: 1.5, rotation: -14, opacity: 0.1 },
  { character: "禅", x: 75, y: 52, size: 4, duration: 29, delay: 5, rotation: 6, opacity: 0.07 },
  { character: "悟", x: 25, y: 88, size: 5.5, duration: 32, delay: 2, rotation: -18, opacity: 0.09 },
];

const particles: Particle[] = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 3 + 1,
  duration: Math.random() * 20 + 15,
  delay: Math.random() * 10,
  color: Math.random() > 0.5 ? "#dc2626" : "#f59e0b",
}));

function FloatingCharacterItem({ item }: { item: FloatingCharacter }) {
  const springX = useSpring(item.x, { stiffness: 10, damping: 30 });
  const springY = useSpring(item.y, { stiffness: 10, damping: 30 });

  return (
    <motion.div
      className="absolute font-serif select-none pointer-events-none"
      style={{
        left: `${item.x}%`,
        top: `${item.y}%`,
        fontSize: `${item.size}rem`,
        transform: `rotate(${item.rotation}deg)`,
        x: springX,
        y: springY,
      }}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{
        opacity: [0, item.opacity, item.opacity, 0],
        y: [0, -40, -20, 0],
        x: [0, 20, 10, 0],
        rotate: [item.rotation, item.rotation + 15, item.rotation + 5, item.rotation],
        scale: [1, 1.1, 1.05, 1],
      }}
      transition={{
        duration: item.duration,
        delay: item.delay,
        repeat: Infinity,
        ease: "easeInOut",
        times: [0, 0.25, 0.5, 0.75, 1],
      }}
    >
      <span
        className="block"
        style={{
          background: "linear-gradient(180deg, #dc2626 0%, #991b1b 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          filter: "drop-shadow(0 0 10px rgba(220, 38, 38, 0.3))",
        }}
      >
        {item.character}
      </span>
    </motion.div>
  );
}

function ParticleItem({ particle }: { particle: Particle }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        left: `${particle.x}%`,
        top: `${particle.y}%`,
        width: particle.size,
        height: particle.size,
        background: particle.color,
        boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: [0, 0.6, 0.4, 0],
        scale: [0, 1, 0.5, 0],
        y: [0, -150, -300],
        x: [0, Math.random() * 50 - 25, Math.random() * 100 - 50],
      }}
      transition={{
        duration: particle.duration,
        delay: particle.delay,
        repeat: Infinity,
        ease: "easeOut",
      }}
    />
  );
}

function Lantern({ x, delay, size }: LanternProps) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: `${x}%`,
        top: "0",
        transformOrigin: "top center",
      }}
      initial={{ y: -100, opacity: 0 }}
      animate={{
        y: [0, 10, 0],
        rotate: [-3, 3, -3],
        opacity: [0.7, 0.9, 0.7],
      }}
      transition={{
        y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
        rotate: { duration: 3, repeat: Infinity, ease: "easeInOut" },
        opacity: { duration: 2, repeat: Infinity },
        delay,
      }}
    >
      {/* Lantern string */}
      <div
        className="w-0.5 bg-gradient-to-b from-transparent"
        style={{ height: 40, marginLeft: size / 2 }}
      />

      {/* Lantern body */}
      <motion.div
        className="relative"
        style={{ width: size, height: size * 1.5 }}
      >
        {/* Outer glow */}
        <div
          className="absolute inset-0 rounded-lg"
          style={{
            background: "radial-gradient(circle, rgba(220, 38, 38, 0.3) 0%, transparent 70%)",
            filter: "blur(10px)",
          }}
        />

        {/* Lantern */}
        <div
          className="relative rounded-lg border-2 overflow-hidden"
          style={{
            width: "100%",
            height: "100%",
            borderColor: "#dc2626",
            background: "linear-gradient(180deg, #991b1b 0%, #dc2626 50%, #991b1b 100%)",
            boxShadow: `
              inset 0 0 20px rgba(0, 0, 0, 0.3),
              0 0 30px rgba(220, 38, 38, 0.4)
            `,
          }}
        >
          {/* Lantern ribs */}
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="absolute"
              style={{
                left: `${25 + i * 17}%`,
                top: 0,
                bottom: 0,
                width: 1,
                background: "rgba(0, 0, 0, 0.2)",
              }}
            />
          ))}

          {/* Lantern tassel */}
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2"
            style={{ width: 4, height: size * 0.4 }}
          >
            <div
              className="w-full h-full"
              style={{
                background: "linear-gradient(180deg, #f59e0b 0%, #dc2626 100%)",
                clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
              }}
            />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function MysticalOrb({ x, y, size, delay }: { x: number; y: number; size: number; delay: number }) {
  return (
    <motion.div
      className="absolute pointer-events-none rounded-full"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: [0, 0.15, 0.1, 0],
        scale: [0, 1, 1.5, 2],
        rotate: [0, 180, 360],
      }}
      transition={{
        duration: 15,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <div
        className="w-full h-full rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(245, 158, 11, 0.5) 0%, rgba(220, 38, 38, 0.2) 50%, transparent 70%)",
          boxShadow: "0 0 40px rgba(245, 158, 11, 0.3)",
        }}
      />
    </motion.div>
  );
}

function BackgroundPattern() {
  return (
    <div
      className="absolute inset-0 pointer-events-none opacity-[0.03]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23dc2626' fill-opacity='1'%3E%3Cpath d='M40 0C17.9 0 0 17.9 0 40s17.9 40 40 40 40-17.9 40-40S62.1 0 40 0zm0 70c-16.5 0-30-13.5-30-30S23.5 10 40 10s30 13.5 30 30-13.5 30-30 30z'/%3E%3Ccircle cx='40' cy='40' r='15'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        backgroundSize: "80px 80px",
      }}
    />
  );
}

function AmbientLight({ top, left, right, bottom, transform, color, size }: { top?: string; left?: string; right?: string; bottom?: string; transform?: string; color: string; size: string }) {
  return (
    <motion.div
      className="absolute pointer-events-none rounded-full blur-3xl"
      style={{
        top,
        left,
        right,
        bottom,
        transform,
        width: size,
        height: size,
      }}
      animate={{
        opacity: [0.15, 0.25, 0.15],
        scale: [1, 1.2, 1],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <div
        className="w-full h-full rounded-full"
        style={{
          background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
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
      {/* Background pattern */}
      <BackgroundPattern />

      {/* Ambient lights */}
      <AmbientLight
        top="10%"
        left="10%"
        color="rgba(220, 38, 38, 0.4)"
        size="500px"
      />
      <AmbientLight
        bottom="20%"
        right="10%"
        color="rgba(245, 158, 11, 0.3)"
        size="400px"
      />
      <AmbientLight
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        color="rgba(220, 38, 38, 0.15)"
        size="600px"
      />

      {/* Lanterns */}
      <Lantern x={5} delay={0} size={40} />
      <Lantern x={25} delay={2} size={35} />
      <Lantern x={50} delay={1} size={45} />
      <Lantern x={75} delay={3} size={38} />
      <Lantern x={95} delay={1.5} size={42} />

      {/* Floating characters */}
      {floatingCharacters.map((item, index) => (
        <FloatingCharacterItem key={index} item={item} />
      ))}

      {/* Particles */}
      {particles.map((particle) => (
        <ParticleItem key={particle.id} particle={particle} />
      ))}

      {/* Mystical orbs */}
      <MysticalOrb x={10} y={30} size={100} delay={0} />
      <MysticalOrb x={80} y={60} size={150} delay={5} />
      <MysticalOrb x={60} y={20} size={80} delay={3} />
      <MysticalOrb x={30} y={70} size={120} delay={7} />

      {/* Radial gradient overlay for depth */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 50% 0%, rgba(220, 38, 38, 0.08) 0%, transparent 50%),
            radial-gradient(ellipse 60% 40% at 80% 100%, rgba(245, 158, 11, 0.06) 0%, transparent 50%),
            radial-gradient(ellipse 100% 100% at 50% 50%, transparent 40%, rgba(0, 0, 0, 0.3) 100%)
          `,
        }}
      />

      {/* Vignette effect */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, transparent 0%, rgba(0, 0, 0, 0.4) 100%)",
        }}
      />
    </div>
  );
}
