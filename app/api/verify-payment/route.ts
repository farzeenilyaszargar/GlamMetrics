import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { getRazorpayConfig } from "@/lib/razorpay";

type VerifyPaymentBody = {
  razorpay_payment_id?: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as VerifyPaymentBody;
    const paymentId = body.razorpay_payment_id;
    const orderId = body.razorpay_order_id;
    const signature = body.razorpay_signature;

    if (!paymentId || !orderId || !signature) {
      return NextResponse.json({ error: "Missing payment verification fields." }, { status: 400 });
    }

    const { config, error, status } = getRazorpayConfig();
    if (!config) {
      return NextResponse.json({ error }, { status: status || 500 });
    }

    const generated = createHmac("sha256", config.keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    const signatureBuffer = Buffer.from(signature);
    const generatedBuffer = Buffer.from(generated);
    const isValid =
      signatureBuffer.length === generatedBuffer.length &&
      timingSafeEqual(signatureBuffer, generatedBuffer);

    if (!isValid) {
      return NextResponse.json({ error: "Signature verification failed." }, { status: 400 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    const err = error as { message?: string };
    return NextResponse.json(
      { error: err.message || "Failed to verify payment signature." },
      { status: 500 },
    );
  }
}
