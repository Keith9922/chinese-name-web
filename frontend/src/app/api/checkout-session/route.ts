import { NextRequest, NextResponse } from "next/server";
import { getCheckoutSession } from "@/lib/server/stripe-service";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.nextUrl.searchParams.get("session_id");
    if (!sessionId) {
      return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
    }

    const data = await getCheckoutSession(sessionId);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Checkout session fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch checkout session" },
      { status: 500 },
    );
  }
}
