import { createHmac, timingSafeEqual } from "node:crypto";
import { ApiError } from "@/lib/server";
export function signatureValid(
  payload: string,
  signature: string,
  secret: string,
) {
  if (!/^[a-f0-9]{64}$/i.test(signature)) return false;
  return timingSafeEqual(
    Buffer.from(signature, "hex"),
    createHmac("sha256", secret).update(payload).digest(),
  );
}
export async function razorpay(path: string, init?: RequestInit) {
  const id = process.env.RAZORPAY_KEY_ID,
    secret = process.env.RAZORPAY_KEY_SECRET;
  if (!id || !secret)
    throw new ApiError(
      "Payments are temporarily unavailable. Please try again soon.",
      503,
    );
  const response = await fetch(`https://api.razorpay.com/v1/${path}`, {
    ...init,
    signal: AbortSignal.timeout(15000),
    headers: {
      Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`,
      "Content-Type": "application/json",
    },
  });
  if (!response.ok)
    throw new ApiError(
      "The payment provider is unavailable. Please try again.",
      response.status >= 400 && response.status < 500 ? 422 : 502,
    );
  return response.json();
}
