import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  return new Stripe(key, {
    apiVersion: "2026-03-25.dahlia",
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nameResult } = body;

    if (!nameResult?.chineseName) {
      return NextResponse.json(
        { error: "Missing name result" },
        { status: 400 }
      );
    }

    const stripe = getStripe();

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Chinese Name Calligraphy Card",
              description: `Your Chinese name: ${nameResult.chineseName} (${nameResult.pinyin})`,
            },
            unit_amount: 299, // $2.99 in cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${
        process.env.FRONTEND_URL || "http://localhost:3000"
      }/success?session_id={CHECKOUT_SESSION_ID}&name=${encodeURIComponent(
        nameResult.chineseName
      )}&pinyin=${encodeURIComponent(
        nameResult.pinyin
      )}&meaning=${encodeURIComponent(nameResult.meaning)}`,
      cancel_url: `${process.env.FRONTEND_URL || "http://localhost:3000"}?canceled=true`,
      metadata: {
        chineseName: nameResult.chineseName,
        pinyin: nameResult.pinyin,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
