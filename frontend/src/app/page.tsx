"use client";

import NameForm from "@/components/NameForm";
import FloatingCharacters from "@/components/FloatingCharacters";
import { motion, useScroll, useTransform, useSpring, MotionValue } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sparkles, Star, Heart, ChevronDown, Play, ArrowRight, Zap, BookOpen, Award, Crown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

function HeroSection() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.9]);

  const springY = useSpring(y, { stiffness: 100, damping: 30 });

  return (
    <motion.section
      ref={ref}
      style={{ y: springY, opacity, scale }}
      className="relative min-h-screen flex flex-col items-center justify-center px-4 py-20 overflow-hidden"
    >
      {/* Hero content */}
      <div className="relative z-20 text-center max-w-5xl mx-auto">
        {/* Animated badge */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
          style={{
            background: "linear-gradient(135deg, rgba(220, 38, 38, 0.15), rgba(245, 158, 11, 0.1))",
            border: "1px solid rgba(245, 158, 11, 0.2)",
          }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
          </motion.div>
          <span className="text-amber-400/90 text-sm font-medium">Powered by Ancient Wisdom</span>
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
          </motion.div>
        </motion.div>

        {/* Main title */}
        <motion.h1
          className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-[1.1]"
          initial={{ opacity: 0, y: 60, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="block text-white mb-2">Discover Your</span>
          <span
            className="block"
            style={{
              background: "linear-gradient(135deg, #fef3c7 0%, #f59e0b 25%, #dc2626 50%, #991b1b 75%, #f59e0b 100%)",
              backgroundSize: "200% 200%",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              animation: "gradient-shift 5s ease infinite",
              filter: "drop-shadow(0 0 40px rgba(245, 158, 11, 0.4))",
            }}
          >
            Chinese Name
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          Based on{" "}
          <span className="text-amber-400/80 font-medium">5,000 years</span>{" "}
          of Chinese naming wisdom, discover the name that carries your unique
          destiny, personality, and cultural heritage.
        </motion.p>

        {/* Feature pills */}
        <motion.div
          className="flex flex-wrap justify-center gap-4 mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          {[
            { icon: Sparkles, text: "100% Free" },
            { icon: Zap, text: "Instant Results" },
            { icon: BookOpen, text: "Cultural Depth" },
          ].map((item, i) => (
            <motion.div
              key={i}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm text-zinc-400"
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
              }}
              whileHover={{ scale: 1.05, borderColor: "rgba(245, 158, 11, 0.3)" }}
            >
              <item.icon className="w-4 h-4 text-amber-500" />
              <span>{item.text}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="flex items-center justify-center gap-2 text-zinc-500 text-sm"
        >
          <span>Scroll to begin your journey</span>
          <motion.div
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </motion.div>
      </div>

      {/* Decorative elements */}
      <motion.div
        className="absolute top-1/4 left-10 w-64 h-64 rounded-full blur-3xl opacity-20"
        style={{ background: "radial-gradient(circle, rgba(220, 38, 38, 0.4), transparent)" }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.3, 0.2],
        }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-1/4 right-10 w-80 h-80 rounded-full blur-3xl opacity-20"
        style={{ background: "radial-gradient(circle, rgba(245, 158, 11, 0.4), transparent)" }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.35, 0.2],
        }}
        transition={{ duration: 10, repeat: Infinity, delay: 2 }}
      />
    </motion.section>
  );
}

function FormSection() {
  return (
    <motion.section
      className="relative z-20 px-4 py-20"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 1 }}
      viewport={{ once: true }}
    >
      <div className="max-w-4xl mx-auto">
        <NameForm />
      </div>
    </motion.section>
  );
}

function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      title: "Share Your Story",
      description: "Tell us your name, gender, and birth date. Our AI analyzes traditional Chinese naming principles.",
      icon: BookOpen,
      color: "#dc2626",
    },
    {
      number: "02",
      title: "Ancient Wisdom Meets Modern AI",
      description: "We combine 5,000 years of Chinese naming traditions with advanced AI to find your perfect name.",
      icon: Sparkles,
      color: "#f59e0b",
    },
    {
      number: "03",
      title: "Discover Your Destiny",
      description: "Receive your unique Chinese name with detailed meaning, cultural significance, and character breakdown.",
      icon: Star,
      color: "#fbbf24",
    },
  ];

  return (
    <section className="relative z-20 py-24 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <motion.span
            className="inline-block text-amber-500/80 text-sm uppercase tracking-[0.2em] mb-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Simple Process
          </motion.span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            How It{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #f59e0b, #dc2626)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Works
            </span>
          </h2>
          <p className="text-zinc-400 max-w-xl mx-auto">
            Three simple steps to uncover the Chinese name that has been waiting for you
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="relative group"
            >
              {/* Card */}
              <div
                className="relative p-8 rounded-2xl h-full overflow-hidden"
                style={{
                  background: "linear-gradient(180deg, rgba(30, 30, 30, 0.9), rgba(20, 20, 20, 0.95))",
                  border: "1px solid rgba(255, 255, 255, 0.05)",
                }}
              >
                {/* Hover glow */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: `linear-gradient(135deg, rgba(${step.color}10, 0.1), transparent)`,
                  }}
                />

                {/* Number badge */}
                <div
                  className="inline-flex items-center justify-center w-14 h-14 rounded-xl mb-6"
                  style={{
                    background: `linear-gradient(135deg, ${step.color}20, ${step.color}10)`,
                    border: `1px solid ${step.color}30`,
                  }}
                >
                  <step.icon className="w-7 h-7" style={{ color: step.color }} />
                </div>

                {/* Number */}
                <div
                  className="absolute top-4 right-4 text-6xl font-bold opacity-5 select-none"
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    color: step.color,
                  }}
                >
                  {step.number}
                </div>

                <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  {step.description}
                </p>

                {/* Arrow connector (only between cards on desktop) */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="w-6 h-6 text-zinc-700" />
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  const testimonials = [
    {
      quote: "This is so cool! I never knew my name could have such deep meaning in Chinese. The calligraphy card is stunning.",
      name: "Sarah M.",
      location: "New York, USA",
      initials: "SM",
      gradient: "from-amber-400 to-orange-500",
    },
    {
      quote: "The explanation was fascinating. My Chinese friends were impressed by the cultural depth. Highly recommended!",
      name: "Michael T.",
      location: "London, UK",
      initials: "MT",
      gradient: "from-red-400 to-pink-500",
    },
    {
      quote: "Beautiful calligraphy card. Worth every penny for the quality! I've shared it with all my friends.",
      name: "Emma L.",
      location: "Sydney, Australia",
      initials: "EL",
      gradient: "from-amber-500 to-red-500",
    },
  ];

  return (
    <section className="relative z-20 py-24 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <motion.span
            className="inline-block text-amber-500/80 text-sm uppercase tracking-[0.2em] mb-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Testimonials
          </motion.span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            What People{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #f59e0b, #dc2626)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Are Saying
            </span>
          </h2>
        </motion.div>

        {/* Testimonials grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, delay: index * 0.15 }}
              viewport={{ once: true }}
              className="relative group"
            >
              {/* Quote mark */}
              <div
                className="absolute -top-2 -left-2 text-6xl opacity-5 select-none group-hover:opacity-10 transition-opacity"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  color: "#f59e0b",
                }}
              >
                &ldquo;
              </div>

              <div
                className="relative p-6 rounded-2xl h-full"
                style={{
                  background: "linear-gradient(180deg, rgba(30, 30, 30, 0.9), rgba(20, 20, 20, 0.95))",
                  border: "1px solid rgba(255, 255, 255, 0.05)",
                }}
              >
                {/* Hover border glow */}
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: "linear-gradient(135deg, rgba(245, 158, 11, 0.05), rgba(220, 38, 38, 0.05))",
                    border: "1px solid rgba(245, 158, 11, 0.1)",
                  }}
                />

                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>

                <p className="text-zinc-300 mb-6 leading-relaxed text-sm italic">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full bg-gradient-to-br ${testimonial.gradient} flex items-center justify-center text-white font-bold text-sm`}
                  >
                    {testimonial.initials}
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">{testimonial.name}</p>
                    <p className="text-zinc-500 text-xs">{testimonial.location}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  return (
    <section className="relative z-20 py-24 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Section header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <motion.span
            className="inline-block text-amber-500/80 text-sm uppercase tracking-[0.2em] mb-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Pricing
          </motion.span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Simple, Transparent{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #f59e0b, #dc2626)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Pricing
            </span>
          </h2>
          <p className="text-zinc-400 max-w-xl mx-auto">
            Start free, upgrade for premium features
          </p>
        </motion.div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {/* Free tier */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative group"
          >
            <div
              className="relative p-8 rounded-2xl h-full"
              style={{
                background: "linear-gradient(180deg, rgba(30, 30, 30, 0.9), rgba(20, 20, 20, 0.95))",
                border: "1px solid rgba(255, 255, 255, 0.05)",
              }}
            >
              <h3 className="text-xl font-bold text-white mb-2">Free</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold text-white">$0</span>
                <span className="text-zinc-500">/ forever</span>
              </div>

              <ul className="space-y-3 mb-8">
                {[
                  "Chinese name generation",
                  "Meaning & explanation",
                  "Character breakdown",
                  "Basic cultural insights",
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-zinc-400 text-sm">
                    <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                      <svg className="w-3 h-3 text-green-500" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    {feature}
                  </li>
                ))}
                <li className="flex items-center gap-2 text-zinc-600 text-sm">
                  <div className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center">
                    <svg className="w-3 h-3 text-zinc-500" viewBox="0 0 12 12" fill="none">
                      <path d="M3 6l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  Calligraphy card
                </li>
              </ul>

              <Button
                variant="outline"
                className="w-full h-12 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-xl transition-all duration-300"
              >
                Get Started Free
              </Button>
            </div>
          </motion.div>

          {/* Premium tier */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            viewport={{ once: true }}
            className="relative group"
          >
            {/* Popular badge */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
              <div
                className="px-4 py-1 rounded-full text-xs font-medium text-white"
                style={{
                  background: "linear-gradient(135deg, #dc2626, #f59e0b)",
                }}
              >
                Most Popular
              </div>
            </div>

            {/* Glow */}
            <div
              className="absolute -inset-1 rounded-3xl opacity-30 blur-xl"
              style={{
                background: "linear-gradient(135deg, rgba(245, 158, 11, 0.3), rgba(220, 38, 38, 0.2))",
              }}
            />

            <div
              className="relative p-8 rounded-2xl h-full overflow-hidden"
              style={{
                background: "linear-gradient(180deg, rgba(40, 25, 25, 0.98), rgba(25, 15, 15, 0.99))",
                border: "1px solid rgba(245, 158, 11, 0.2)",
              }}
            >
              {/* Premium gradient overlay */}
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  background: "linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(220, 38, 38, 0.05))",
                }}
              />

              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="w-5 h-5 text-amber-400" />
                  <h3 className="text-xl font-bold text-white">Premium</h3>
                </div>

                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-bold text-white">$2.99</span>
                  <span className="text-zinc-500">/ one-time</span>
                </div>

                <ul className="space-y-3 mb-8">
                  {[
                    "Everything in Free",
                    "Beautiful calligraphy card",
                    "HD downloadable image (2400x1600)",
                    "3 premium style options",
                    "Share on social media",
                  ].map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-zinc-300 text-sm">
                      <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center">
                        <svg className="w-3 h-3 text-amber-400" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button className="w-full h-12 bg-gradient-to-r from-red-700 to-amber-600 hover:from-red-600 hover:to-amber-500 text-white rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-amber-500/20 group relative overflow-hidden">
                  {/* Shimmer */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
                  />
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <Award className="w-5 h-5" />
                    Get Premium
                  </span>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="relative z-20 py-12 px-4 border-t border-zinc-800/50">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <span className="text-3xl">&#38518;</span>
            <span
              className="text-xl font-bold"
              style={{
                background: "linear-gradient(135deg, #fef3c7, #f59e0b)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              ChineseName
            </span>
          </div>

          {/* Links */}
          <div className="flex gap-8 text-sm text-zinc-500">
            <a href="#how-it-works" className="hover:text-amber-400 transition-colors">
              How It Works
            </a>
            <a href="#pricing" className="hover:text-amber-400 transition-colors">
              Pricing
            </a>
            <a href="#" className="hover:text-amber-400 transition-colors">
              About
            </a>
          </div>

          {/* Copyright */}
          <div className="text-sm text-zinc-600">
            <span>&copy; 2024 ChineseName. Made with </span>
            <span className="inline-flex items-center">
              <Heart className="w-3 h-3 text-red-500 mx-1" />
              <span>for culture lovers</span>
            </span>
          </div>
        </div>

        {/* Decorative bottom line */}
        <div
          className="mt-8 h-px"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(245, 158, 11, 0.2), rgba(220, 38, 38, 0.2), transparent)",
          }}
        />
      </div>
    </footer>
  );
}

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="flex items-center gap-3 text-amber-500">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="w-6 h-6" />
          </motion.div>
          <span className="text-lg">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 relative overflow-hidden">
      {/* Floating Characters Background */}
      <FloatingCharacters />

      {/* Gradient overlays */}
      <div className="fixed inset-0 pointer-events-none z-10">
        {/* Top gradient */}
        <div
          className="absolute top-0 left-0 right-0 h-[40vh]"
          style={{
            background: "linear-gradient(180deg, rgba(220, 38, 38, 0.08) 0%, transparent 100%)",
          }}
        />
        {/* Bottom gradient */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[30vh]"
          style={{
            background: "linear-gradient(0deg, rgba(245, 158, 11, 0.05) 0%, transparent 100%)",
          }}
        />
        {/* Center radial */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vh] h-[100vh] opacity-30"
          style={{
            background: "radial-gradient(circle, rgba(245, 158, 11, 0.08) 0%, transparent 50%)",
          }}
        />
      </div>

      {/* Header */}
      <header className="relative z-20 py-6 px-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-3"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl"
              style={{
                background: "linear-gradient(135deg, rgba(220, 38, 38, 0.2), rgba(245, 158, 11, 0.1))",
                border: "1px solid rgba(245, 158, 11, 0.2)",
              }}
            >
              &#38518;
            </div>
            <span
              className="text-xl font-bold"
              style={{
                background: "linear-gradient(135deg, #fef3c7, #f59e0b)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              ChineseName
            </span>
          </motion.div>

          <motion.nav
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="hidden md:flex gap-8 text-sm"
          >
            <a
              href="#how-it-works"
              className="text-zinc-400 hover:text-amber-400 transition-colors"
            >
              How It Works
            </a>
            <a
              href="#pricing"
              className="text-zinc-400 hover:text-amber-400 transition-colors"
            >
              Pricing
            </a>
            <a
              href="#"
              className="text-zinc-400 hover:text-amber-400 transition-colors"
            >
              About
            </a>
          </motion.nav>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Button className="bg-gradient-to-r from-red-700 to-amber-600 hover:from-red-600 hover:to-amber-500 text-white rounded-xl px-6 h-10 text-sm font-medium transition-all duration-300 shadow-lg hover:shadow-amber-500/20">
              Try Free
            </Button>
          </motion.div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-20">
        <HeroSection />
        <FormSection />
        <HowItWorksSection />
        <TestimonialsSection />
        <PricingSection />
      </main>

      {/* Footer */}
      <Footer />

      {/* Bottom gradient fade */}
      <div
        className="fixed bottom-0 left-0 right-0 h-32 pointer-events-none z-10"
        style={{
          background: "linear-gradient(0deg, rgba(10, 10, 10, 1) 0%, transparent 100%)",
        }}
      />
    </div>
  );
}
