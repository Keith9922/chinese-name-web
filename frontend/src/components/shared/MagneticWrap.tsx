"use client";

import { useRef, ReactNode } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface Props {
  children: ReactNode;
  strength?: number;
  className?: string;
}

/**
 * Wraps any element so it gently leans toward the cursor when the cursor is
 * near it. The motion is heavily damped — meant to be felt, not noticed.
 */
export default function MagneticWrap({
  children,
  strength = 14,
  className,
}: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 130, damping: 15 });
  const sy = useSpring(my, { stiffness: 130, damping: 15 });
  const tx = useTransform(sx, (v) => v * strength);
  const ty = useTransform(sy, (v) => v * strength);

  return (
    <motion.span
      ref={ref}
      className={className}
      style={{ x: tx, y: ty, display: "inline-block" }}
      onMouseMove={(e) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        mx.set((e.clientX - cx) / rect.width);
        my.set((e.clientY - cy) / rect.height);
      }}
      onMouseLeave={() => {
        mx.set(0);
        my.set(0);
      }}
    >
      {children}
    </motion.span>
  );
}
