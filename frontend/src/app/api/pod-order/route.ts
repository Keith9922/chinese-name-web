import { NextRequest, NextResponse } from "next/server";
import { submitPodOrder, PodOrderInput, PodProductType } from "@/lib/server/pod-order";

export const runtime = "nodejs";

const VALID_PRODUCT_TYPES: PodProductType[] = [
  "canvas_print",
  "rice_paper_scroll",
  "carved_seal",
];

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<PodOrderInput>;
    const {
      productType,
      imageUrl,
      recipientName,
      addressLine1,
      addressLine2,
      city,
      region,
      postalCode,
      country,
      email,
    } = body;

    if (!productType || !VALID_PRODUCT_TYPES.includes(productType)) {
      return NextResponse.json(
        { error: "Missing or invalid productType" },
        { status: 400 },
      );
    }

    const requiredStringFields: Array<[string, unknown]> = [
      ["imageUrl", imageUrl],
      ["recipientName", recipientName],
      ["addressLine1", addressLine1],
      ["city", city],
      ["postalCode", postalCode],
      ["country", country],
      ["email", email],
    ];
    const missing = requiredStringFields
      .filter(([, value]) => typeof value !== "string" || !value.trim())
      .map(([key]) => key);

    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missing.join(", ")}` },
        { status: 400 },
      );
    }

    const result = await submitPodOrder({
      productType,
      imageUrl: imageUrl!,
      recipientName: recipientName!,
      addressLine1: addressLine1!,
      addressLine2: addressLine2 || undefined,
      city: city!,
      region: region || undefined,
      postalCode: postalCode!,
      country: country!,
      email: email!,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("POD order error:", error);
    return NextResponse.json(
      { error: "Failed to submit print-on-demand order" },
      { status: 500 },
    );
  }
}
