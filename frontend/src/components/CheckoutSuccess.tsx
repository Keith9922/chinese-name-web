"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2, ShieldCheck, Sparkles } from "lucide-react";
import CalligraphyCard from "@/components/CalligraphyCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getPaidPlan } from "@/lib/pricing";

type CheckoutSessionData = {
  sessionId: string;
  planId: string;
  planName: string;
  amountUsd: number;
  paymentStatus: string;
  isMock: boolean;
  nameResult: {
    chineseName: string;
    pinyin: string;
    meaning: string;
  };
};

export default function CheckoutSuccess() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [data, setData] = useState<CheckoutSessionData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSession() {
      if (!sessionId) {
        setError("Missing checkout session.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/checkout-session?session_id=${encodeURIComponent(sessionId)}`, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to verify payment");
        }

        const payload = await response.json();
        setData(payload);
      } catch {
        setError("We couldn't verify this payment session.");
      } finally {
        setLoading(false);
      }
    }

    void loadSession();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#fdf8f3" }}>
        <div className="flex items-center gap-3 text-stone-600">
          <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
          <span>Verifying your payment...</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#fdf8f3" }}>
        <Card className="w-full max-w-xl rounded-3xl border border-stone-200 bg-white p-8 text-center">
          <h1 className="text-2xl font-semibold text-stone-800 mb-3">Payment verification failed</h1>
          <p className="text-stone-500 mb-6">{error || "No checkout data available."}</p>
          <Link href="/">
            <Button className="bg-gradient-to-r from-red-600 to-amber-500 text-white">
              Return Home
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const plan = getPaidPlan(data.planId);
  const availableStyles = plan?.availableStyles ?? ["classical"];
  const resolutionMultiplier = data.planId === "signature" ? 4 : 3;

  return (
    <div className="min-h-screen px-4 py-12" style={{ background: "#fdf8f3" }}>
      <div className="max-w-5xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]"
        >
          <Card className="rounded-3xl border border-amber-200 bg-white p-8 shadow-lg">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 mb-5">
              <CheckCircle2 className="w-4 h-4" />
              Payment confirmed
            </div>

            <h1 className="text-4xl font-bold text-stone-800 mb-3">
              Your {data.planName} is ready
            </h1>
            <p className="text-stone-500 leading-relaxed mb-6">
              {data.nameResult.chineseName} has been attached to this purchase. You can download the artwork immediately below.
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                <div className="text-xs uppercase tracking-[0.22em] text-stone-400 mb-2">Plan</div>
                <div className="text-lg font-semibold text-stone-800">{data.planName}</div>
                <div className="text-sm text-stone-500 mt-1">${data.amountUsd.toFixed(2)} one-time</div>
              </div>
              <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                <div className="text-xs uppercase tracking-[0.22em] text-stone-400 mb-2">Session</div>
                <div className="text-sm font-medium text-stone-700 break-all">{data.sessionId}</div>
                <div className="text-sm text-stone-500 mt-1">
                  {data.isMock ? "Local mock checkout" : "Verified via Stripe"}
                </div>
              </div>
            </div>
          </Card>

          <Card className="rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="font-semibold text-stone-800">What you unlocked</div>
                <div className="text-sm text-stone-500">A direct path from name discovery to ownership</div>
              </div>
            </div>

            <div className="space-y-4 text-sm text-stone-600">
              <div className="rounded-2xl border border-stone-200 p-4">
                <div className="font-medium text-stone-800 mb-1">Included in this plan</div>
                <ul className="space-y-2">
                  {plan?.features.map((feature) => (
                    <li key={feature} className="flex gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-stone-200 p-4">
                <div className="font-medium text-stone-800 mb-1">Name on this card</div>
                <div className="text-2xl font-semibold text-stone-900">{data.nameResult.chineseName}</div>
                <div className="text-stone-500">{data.nameResult.pinyin}</div>
                <div className="text-stone-600 mt-2">{data.nameResult.meaning}</div>
              </div>

              <Link href="/">
                <Button variant="outline" className="w-full h-11 rounded-xl border-stone-300 text-stone-700">
                  Generate another name
                </Button>
              </Link>
            </div>
          </Card>
        </motion.div>

        <Card className="rounded-3xl border border-stone-200 bg-zinc-950 p-8 shadow-lg">
          <CalligraphyCard
            chineseName={data.nameResult.chineseName}
            pinyin={data.nameResult.pinyin}
            meaning={data.nameResult.meaning}
            availableStyles={availableStyles}
            resolutionMultiplier={resolutionMultiplier}
            planName={data.planName}
            resolutionLabel={plan?.resolutionLabel ?? "HD PNG"}
          />
        </Card>
      </div>
    </div>
  );
}
