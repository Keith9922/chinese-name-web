import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import CheckoutSuccess from "@/components/CheckoutSuccess";

function LoadingState() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#fdf8f3" }}>
      <div className="flex items-center gap-3 text-stone-600">
        <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
        <span>Verifying your payment...</span>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <CheckoutSuccess />
    </Suspense>
  );
}
