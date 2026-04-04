"use client";

import Link from "next/link";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function CancelPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#fdf8f3" }}>
      <Card className="w-full max-w-xl rounded-3xl border border-stone-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h1 className="text-3xl font-semibold text-stone-800 mb-3">Checkout canceled</h1>
        <p className="text-stone-500 leading-relaxed mb-6">
          Your generated Chinese name is still here. You can go back, compare the paid tiers again, and unlock when the offer feels right.
        </p>
        <Link href="/#pricing">
          <Button className="bg-gradient-to-r from-red-600 to-amber-500 text-white">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to pricing
          </Button>
        </Link>
      </Card>
    </div>
  );
}
