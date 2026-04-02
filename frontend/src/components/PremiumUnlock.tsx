"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Crown, Download, Sparkles, Shield, Zap, Heart, Check, Star } from "lucide-react";
import { Loader2 } from "lucide-react";

interface PremiumUnlockProps {
  chineseName: string;
  pinyin: string;
  meaning: string;
  isUnlocked: boolean;
}

function PremiumFeature({ icon: Icon, text }: { icon: any; text: string }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center"
        style={{
          background: "linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(220, 38, 38, 0.1))",
          border: "1px solid rgba(245, 158, 11, 0.2)",
        }}
      >
        <Icon className="w-4 h-4 text-amber-400" />
      </div>
      <span className="text-zinc-300">{text}</span>
    </div>
  );
}

function PriceTag() {
  return (
    <div className="text-center">
      <div className="relative inline-block">
        {/* Glow effect */}
        <div
          className="absolute -inset-4 rounded-2xl blur-xl opacity-30"
          style={{
            background: "linear-gradient(135deg, rgba(245, 158, 11, 0.5), rgba(220, 38, 38, 0.3))",
          }}
        />

        {/* Price */}
        <div className="relative flex items-baseline justify-center gap-1">
          <span className="text-4xl font-bold bg-gradient-to-r from-amber-400 to-red-500 bg-clip-text text-transparent">
            $2.99
          </span>
          <span className="text-zinc-500 text-sm">one-time</span>
        </div>

        {/* Savings badge */}
        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs px-2 py-0.5 rounded-full font-medium">
          Save 50%
        </div>
      </div>
    </div>
  );
}

function TestimonialBadge() {
  return (
    <div className="flex items-center justify-center gap-2 text-sm text-zinc-500">
      <div className="flex -space-x-2">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="w-6 h-6 rounded-full border-2 border-zinc-900"
            style={{
              background: `linear-gradient(135deg, hsl(${i * 30 + 20}, 70%, 60%), hsl(${i * 30 + 40}, 70%, 50%))`,
            }}
          />
        ))}
      </div>
      <span>2,847 people created theirs</span>
    </div>
  );
}

export default function PremiumUnlock({
  chineseName,
  pinyin,
  meaning,
  isUnlocked,
}: PremiumUnlockProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showDialog, setShowDialog] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nameResult: { chineseName, pinyin, meaning },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create checkout session");
      }

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      }
    } catch {
      setError("Unable to start checkout. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (isUnlocked) {
    return null;
  }

  return (
    <div className="mt-8 relative">
      {/* Background glow */}
      <div
        className="absolute -inset-1 rounded-3xl opacity-20 blur-xl"
        style={{
          background: "linear-gradient(135deg, rgba(245, 158, 11, 0.3), rgba(220, 38, 38, 0.2))",
        }}
      />

      {/* Main card */}
      <div
        className="relative rounded-3xl overflow-hidden"
        style={{
          background: "linear-gradient(180deg, rgba(30, 20, 20, 0.98), rgba(15, 10, 10, 0.99))",
          border: "1px solid rgba(245, 158, 11, 0.15)",
        }}
      >
        {/* Top decorative line */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(245, 158, 11, 0.5), rgba(220, 38, 38, 0.5), transparent)",
          }}
        />

        {/* Background pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f59e0b' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative p-8">
          {/* Header */}
          <div className="text-center mb-6">
            {/* Crown icon with glow */}
            <div className="relative inline-block mb-4">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(220, 38, 38, 0.15))",
                  border: "1px solid rgba(245, 158, 11, 0.3)",
                }}
              >
                <Crown className="w-8 h-8 text-amber-400" />
              </div>
              <div
                className="absolute inset-0 rounded-2xl animate-ping"
                style={{
                  background: "rgba(245, 158, 11, 0.2)",
                  animationDuration: "3s",
                }}
              />
            </div>

            <h3 className="text-2xl font-bold text-white mb-2">
              Unlock Your{" "}
              <span className="bg-gradient-to-r from-amber-400 to-red-500 bg-clip-text text-transparent">
                Calligraphy Card
              </span>
            </h3>

            <p className="text-zinc-400 text-sm max-w-sm mx-auto">
              Get a beautiful, downloadable artwork featuring your personalized Chinese name
            </p>
          </div>

          {/* Features */}
          <div className="space-y-3 mb-6">
            <PremiumFeature icon={Download} text="HD calligraphy card (2400x1600px)" />
            <PremiumFeature icon={Zap} text="Instant download - no waiting" />
            <PremiumFeature icon={Shield} text="Lifetime access - yours forever" />
            <PremiumFeature icon={Star} text="3 premium style options" />
          </div>

          {/* Price */}
          <PriceTag />

          {/* CTA Button */}
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger>
              <motion.button
                className="w-full mt-6 h-12 bg-gradient-to-r from-red-700 via-red-600 to-amber-600 hover:from-red-600 hover:via-red-500 hover:to-amber-500 text-white rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group relative overflow-hidden"
                whileHover={{ scale: 1.01, y: -2 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setShowDialog(true)}
              >
                {/* Shimmer */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
                />
                <Crown className="w-5 h-5 relative z-10 group-hover:rotate-12 transition-transform" />
                <span className="relative z-10">Unlock Premium</span>
              </motion.button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md bg-zinc-950 border-zinc-800">
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{
                      background: "linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(220, 38, 38, 0.15))",
                      border: "1px solid rgba(245, 158, 11, 0.3)",
                    }}
                  >
                    <Crown className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <DialogTitle className="text-white">Unlock Calligraphy Card</DialogTitle>
                    <DialogDescription className="text-zinc-400">
                      Premium downloadable artwork
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="py-6">
                {/* What's included */}
                <div className="bg-zinc-900/50 rounded-xl p-4 mb-4">
                  <p className="text-sm text-zinc-400 mb-3">You will receive:</p>
                  <ul className="space-y-2">
                    {[
                      "HD calligraphy card (2400x1600px)",
                      "3 style options (Classical, Modern, Seal)",
                      "Instant download",
                      "Lifetime access",
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-zinc-300">
                        <Check className="w-4 h-4 text-green-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Price confirmation */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-red-950/30 to-amber-950/30 border border-red-500/20 mb-4">
                  <span className="text-zinc-300">Total</span>
                  <span className="text-2xl font-bold text-white">$2.99</span>
                </div>

                {/* Pay button */}
                <Button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="w-full h-12 bg-gradient-to-r from-red-700 to-amber-600 hover:from-red-600 hover:to-amber-500 text-white rounded-xl font-medium transition-all duration-300"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Pay $2.99
                    </>
                  )}
                </Button>

                {error && (
                  <p className="text-sm text-red-500 mt-3 text-center">{error}</p>
                )}

                {/* Trust indicators */}
                <div className="flex items-center justify-center gap-4 mt-4 text-xs text-zinc-600">
                  <span className="flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    Secure payment
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="w-3 h-3" />
                    Made with love
                  </span>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Social proof */}
          <div className="mt-6">
            <TestimonialBadge />
          </div>

          {/* Bottom decorative line */}
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-px"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(245, 158, 11, 0.3), transparent)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
