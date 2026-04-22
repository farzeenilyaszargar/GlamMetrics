import { NextResponse } from "next/server";
import { getRazorpayConfig } from "@/lib/razorpay";

type CreateOrderBody = {
  amount?: number;
  currency?: string;
  receipt?: string;
};

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateOrderBody;
    const amount = Number(body.amount ?? 0);
    const currency = body.currency || "INR";
    const receipt = body.receipt || `rcpt_${Date.now()}`;

    if (!Number.isFinite(amount) || amount < 100) {
      return NextResponse.json({ error: "Amount must be at least 100 paise." }, { status: 400 });
    }

    const { config, error, status } = getRazorpayConfig();
    if (!config) {
      return NextResponse.json({ error }, { status: status || 500 });
    }

    const authHeader = Buffer.from(`${config.keyId}:${config.keySecret}`).toString("base64");
    const razorpayResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${authHeader}`,
      },
      body: JSON.stringify({
        amount,
        currency,
        receipt,
      }),
    });

    const raw = await razorpayResponse.text();
    let data: {
      id?: string;
      amount?: number;
      currency?: string;
      error?: { description?: string };
    } = {};
    try {
      data = raw ? (JSON.parse(raw) as typeof data) : {};
    } catch {
      data = {};
    }

    if (razorpayResponse.status === 401) {
      return NextResponse.json(
        {
          error:
            data.error?.description ||
            "Razorpay authentication failed. Check live/test mode match and key values on server.",
        },
        { status: 401 },
      );
    }

    if (!razorpayResponse.ok || !data.id || !data.amount || !data.currency) {
      return NextResponse.json(
        { error: data.error?.description || "Failed to create Razorpay order." },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        order_id: data.id,
        amount: data.amount,
        currency: data.currency,
      },
      { status: 200 },
    );
  } catch (error) {
    const err = error as { message?: string; cause?: { code?: string } };
    if (err.cause?.code === "ENOTFOUND") {
      return NextResponse.json(
        {
          error:
            "Razorpay API hostname could not be resolved. Check internet/DNS/firewall and server outbound network access.",
        },
        { status: 500 },
      );
    }
    return NextResponse.json(
      { error: err.message || "Failed to create Razorpay order." },
      { status: 500 },
    );
  }
}
