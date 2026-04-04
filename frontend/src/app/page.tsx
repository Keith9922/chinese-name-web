"use client";

import NameForm from "@/components/NameForm";
import FloatingCharacters from "@/components/FloatingCharacters";
import { Card } from "@/components/ui/card";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sparkles, Star, Heart, ChevronDown, ArrowRight, Zap, BookOpen, Award, Crown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

function HeroSection() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.92]);

  const springY = useSpring(y, { stiffness: 80, damping: 25 });

  return (
    <motion.section
      ref={ref}
      style={{ y: springY, opacity, scale }}
      className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden"
    >
      {/* Hero content */}
      <div className="relative z-20 text-center max-w-4xl mx-auto">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full mb-10"
          style={{
            background: "linear-gradient(135deg, rgba(185, 28, 28, 0.06), rgba(217, 119, 6, 0.06))",
            border: "1px solid rgba(217, 119, 6, 0.15)",
          }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="w-4 h-4 text-amber-600" />
          </motion.div>
          <span className="text-amber-700 text-sm font-medium tracking-wide">
            Powered by 5,000 Years of Wisdom
          </span>
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="w-4 h-4 text-amber-600" />
          </motion.div>
        </motion.div>

        {/* Main title */}
        <motion.h1
          className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 leading-[1.1]"
          initial={{ opacity: 0, y: 60, filter: "blur(12px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="block text-stone-800 mb-3" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Discover Your
          </span>
          <span
            className="block"
            style={{
              background: "linear-gradient(135deg, #991b1b 0%, #b45309 30%, #d97706 50%, #b45309 70%, #991b1b 100%)",
              backgroundSize: "200% 200%",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              animation: "gradient-shift 6s ease infinite",
              filter: "drop-shadow(0 4px 8px rgba(185, 28, 28, 0.15))",
            }}
          >
            Chinese Name
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="text-lg md:text-xl text-stone-500 max-w-xl mx-auto mb-12 leading-relaxed"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          Receive a personalized Chinese name crafted from ancient wisdom,
          <span className="text-amber-700 font-medium"> reflecting your unique destiny</span> and cultural heritage.
        </motion.p>

        {/* Feature pills */}
        <motion.div
          className="flex flex-wrap justify-center gap-3"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          {[
            { icon: Zap, text: "100% Free" },
            { icon: Sparkles, text: "Instant Results" },
            { icon: BookOpen, text: "Cultural Depth" },
          ].map((item, i) => (
            <motion.div
              key={i}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium"
              style={{
                background: "rgba(255, 255, 255, 0.9)",
                border: "1px solid rgba(0, 0, 0, 0.06)",
                color: "#57534e",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
              }}
              whileHover={{
                scale: 1.05,
                borderColor: "rgba(217, 119, 6, 0.25)",
                boxShadow: "0 4px 12px rgba(217, 119, 6, 0.1)"
              }}
            >
              <item.icon className="w-4 h-4 text-amber-600" />
              <span>{item.text}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="flex flex-col items-center gap-2 mt-20"
        >
          <span className="text-stone-400 text-xs tracking-widest uppercase">Begin Journey</span>
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}>
            <ChevronDown className="w-5 h-5 text-stone-400" />
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
}

function FormSection() {
  return (
    <motion.section
      className="relative z-20 px-4 py-24"
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
      color: "#991b1b",
    },
    {
      number: "02",
      title: "Ancient Wisdom Meets Modern AI",
      description: "We combine 5,000 years of Chinese naming traditions with advanced AI to find your perfect name.",
      icon: Sparkles,
      color: "#b45309",
    },
    {
      number: "03",
      title: "Discover Your Destiny",
      description: "Receive your unique Chinese name with detailed meaning, cultural significance, and character breakdown.",
      icon: Star,
      color: "#d97706",
    },
  ];

  return (
    <section className="relative z-20 py-28 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Section header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <span className="inline-block text-amber-600 text-xs font-medium uppercase tracking-[0.25em] mb-4">
            Simple Process
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-stone-800 mb-4">
            How It{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #b45309, #991b1b)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Works
            </span>
          </h2>
          <p className="text-stone-500 max-w-md mx-auto">
            Three simple steps to uncover the Chinese name that has been waiting for you
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: index * 0.15 }}
              viewport={{ once: true }}
              className="relative"
            >
              <Card className="relative p-8 rounded-2xl h-full bg-white border border-stone-200 shadow-sm hover:shadow-md transition-all duration-300">
                {/* Number badge */}
                <div
                  className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-5"
                  style={{
                    background: `linear-gradient(135deg, ${step.color}12, ${step.color}06)`,
                    border: `1px solid ${step.color}20`,
                  }}
                >
                  <step.icon className="w-6 h-6" style={{ color: step.color }} />
                </div>

                {/* Large background number */}
                <div
                  className="absolute top-4 right-5 text-7xl font-bold opacity-[0.04] select-none"
                  style={{ fontFamily: "'Cormorant Garamond', serif", color: step.color }}
                >
                  {step.number}
                </div>

                <h3 className="text-lg font-semibold text-stone-800 mb-2">{step.title}</h3>
                <p className="text-sm text-stone-500 leading-relaxed">
                  {step.description}
                </p>

                {/* Arrow */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center"
                      style={{
                        background: "linear-gradient(135deg, #f5f0eb, #ffffff)",
                        border: "1px solid #e7e5e4",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                      }}
                    >
                      <ArrowRight className="w-3 h-3 text-stone-400" />
                    </div>
                  </div>
                )}
              </Card>
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
    <section className="relative z-20 py-28 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Section header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <span className="inline-block text-amber-600 text-xs font-medium uppercase tracking-[0.25em] mb-4">
            Testimonials
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-stone-800 mb-4">
            What People{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #b45309, #991b1b)",
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
        <div className="grid md:grid-cols-3 gap-5">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40, scale: 0.98 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.7, delay: index * 0.12 }}
              viewport={{ once: true }}
            >
              <Card className="relative p-6 rounded-2xl h-full bg-white border border-stone-200 shadow-sm hover:shadow-md transition-shadow duration-300">
                {/* Quote mark */}
                <div
                  className="absolute -top-1 -left-1 text-5xl opacity-[0.06]"
                  style={{ fontFamily: "'Cormorant Garamond', serif", color: "#d97706" }}
                >
                  &ldquo;
                </div>

                {/* Stars */}
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                <p className="text-stone-600 mb-5 leading-relaxed text-sm italic">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>

                {/* Author */}
                <div className="flex items-center gap-3 pt-4 border-t border-stone-100">
                  <div
                    className={`w-9 h-9 rounded-full bg-gradient-to-br ${testimonial.gradient} flex items-center justify-center text-white font-semibold text-xs`}
                  >
                    {testimonial.initials}
                  </div>
                  <div>
                    <p className="text-stone-800 font-medium text-sm">{testimonial.name}</p>
                    <p className="text-stone-400 text-xs">{testimonial.location}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  return (
    <section className="relative z-20 py-28 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Section header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <span className="inline-block text-amber-600 text-xs font-medium uppercase tracking-[0.25em] mb-4">
            Pricing
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-stone-800 mb-4">
            Simple, Transparent{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #b45309, #991b1b)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Pricing
            </span>
          </h2>
          <p className="text-stone-500 max-w-xs mx-auto">
            Start free, upgrade for premium features
          </p>
        </motion.div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-2 gap-5">
          {/* Free tier */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            <Card className="relative p-8 rounded-2xl bg-white border border-stone-200 shadow-sm hover:shadow-md transition-shadow duration-300">
              <h3 className="text-lg font-semibold text-stone-800 mb-1">Free</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold text-stone-800">$0</span>
                <span className="text-stone-400 text-sm">/ forever</span>
              </div>

              <ul className="space-y-3 mb-8">
                {[
                  "Chinese name generation",
                  "Meaning & explanation",
                  "Character breakdown",
                  "Basic cultural insights",
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-stone-600 text-sm">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-green-600" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    {feature}
                  </li>
                ))}
                <li className="flex items-center gap-3 text-stone-300 text-sm">
                  <div className="w-5 h-5 rounded-full bg-stone-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-stone-400" viewBox="0 0 12 12" fill="none">
                      <path d="M3 6l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  Calligraphy card
                </li>
              </ul>

              <Button
                variant="outline"
                className="w-full h-12 border-stone-300 text-stone-600 hover:bg-stone-50 hover:text-stone-800 rounded-xl transition-all duration-300 font-medium"
              >
                Get Started Free
              </Button>
            </Card>
          </motion.div>

          {/* Premium tier */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <Card className="relative p-8 rounded-2xl overflow-hidden bg-white border-2 border-amber-300 shadow-md">
              {/* Popular badge */}
              <div className="absolute -top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div
                  className="px-4 py-1 rounded-full text-xs font-semibold text-white shadow-sm"
                  style={{ background: "linear-gradient(135deg, #991b1b, #b45309)" }}
                >
                  Most Popular
                </div>
              </div>

              <div className="flex items-center gap-2 mb-1 pt-2">
                <Crown className="w-5 h-5 text-amber-600" />
                <h3 className="text-lg font-semibold text-stone-800">Premium</h3>
              </div>

              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold text-stone-800">$2.99</span>
                <span className="text-stone-400 text-sm">/ one-time</span>
              </div>

              <ul className="space-y-3 mb-8">
                {[
                  "Everything in Free",
                  "Beautiful calligraphy card",
                  "HD downloadable image (2400x1600)",
                  "3 premium style options",
                  "Share on social media",
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-stone-700 text-sm">
                    <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-amber-600" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>

              <Button className="w-full h-12 bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-700 hover:to-amber-600 text-white rounded-xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg">
                <span className="flex items-center justify-center gap-2">
                  <Award className="w-5 h-5" />
                  Get Premium
                </span>
              </Button>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="relative z-20 py-12 px-4 border-t border-stone-200">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center text-xl font-bold text-white"
              style={{ background: "linear-gradient(135deg, #b91c1c, #d97706)" }}
            >
              &#38518;
            </div>
            <span
              className="text-lg font-semibold"
              style={{
                background: "linear-gradient(135deg, #991b1b, #b45309)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              ChineseName
            </span>
          </div>

          {/* Links */}
          <div className="flex gap-8 text-sm text-stone-500">
            <a href="#how-it-works" className="hover:text-amber-600 transition-colors">
              How It Works
            </a>
            <a href="#pricing" className="hover:text-amber-600 transition-colors">
              Pricing
            </a>
            <a href="#" className="hover:text-amber-600 transition-colors">
              About
            </a>
          </div>

          {/* Copyright */}
          <div className="text-sm text-stone-400 flex items-center gap-1">
            <span>&copy; 2024 ChineseName.</span>
            <Heart className="w-3.5 h-3.5 text-red-400" />
            <span>for culture lovers</span>
          </div>
        </div>
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#fdf8f3" }}>
        <div className="flex items-center gap-3 text-amber-600">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="w-6 h-6" />
          </motion.div>
          <span className="text-lg text-stone-600">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-stone-800 relative overflow-hidden" style={{ background: "#fdf8f3" }}>
      {/* Floating Characters Background */}
      <FloatingCharacters />

      {/* Header */}
      <header className="relative z-20 py-4 px-4 sticky top-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-stone-200/60 px-6 py-3.5 flex justify-between items-center"
          >
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl font-bold text-white shadow-sm"
                style={{ background: "linear-gradient(135deg, #b91c1c, #d97706)" }}
              >
                &#38518;
              </div>
              <span
                className="text-xl font-bold"
                style={{
                  background: "linear-gradient(135deg, #991b1b, #b45309)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                ChineseName
              </span>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {[
                { href: "#how-it-works", label: "How It Works" },
                { href: "#pricing", label: "Pricing" },
                { href: "#", label: "About" },
              ].map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-stone-600 hover:text-amber-700 hover:bg-amber-50 transition-all"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {/* CTA */}
            <Button className="bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-700 hover:to-amber-600 text-white rounded-xl px-6 h-10 text-sm font-semibold transition-all duration-300 shadow-md hover:shadow-lg">
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
    </div>
  );
}
