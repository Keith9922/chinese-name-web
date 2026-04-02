import { Variants } from "framer-motion";

// Fade in up animation for hero text
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

// Simple fade in animation
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

// Scale in animation for results
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.34, 1.56, 0.64, 1], // Bounce ease
    },
  },
};

// Slide up animation for cards
export const slideUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

// Stagger container for children
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

// Stagger item for individual elements
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

// Character float animation for individual floating characters
export const floatAnimation = (duration: number, delay: number): Variants => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 1,
      delay,
    },
  },
});

// Button hover animation
export const buttonHover = {
  scale: 1.02,
  y: -2,
  transition: { duration: 0.2 },
};

export const buttonTap = {
  scale: 0.98,
  y: 0,
  transition: { duration: 0.1 },
};

// Glow pulse animation for loading states
export const glowPulse: Variants = {
  initial: { boxShadow: "0 0 20px rgba(220, 38, 38, 0.3)" },
  animate: {
    boxShadow: [
      "0 0 20px rgba(220, 38, 38, 0.3)",
      "0 0 40px rgba(245, 158, 11, 0.5)",
      "0 0 20px rgba(220, 38, 38, 0.3)",
    ],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};
