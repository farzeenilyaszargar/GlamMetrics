export type RazorpayMode = "live" | "test";

type RazorpayEnvConfig = {
  keyId: string;
  keySecret: string;
  publicKeyId: string;
  mode: RazorpayMode;
};

function detectModeFromKeyId(keyId: string): RazorpayMode | null {
  if (keyId.startsWith("rzp_live_")) return "live";
  if (keyId.startsWith("rzp_test_")) return "test";
  return null;
}

export function getRazorpayConfig(): { config?: RazorpayEnvConfig; error?: string; status?: number } {
  const keyId = (process.env.RAZORPAY_KEY_ID || "").trim();
  const keySecret = (process.env.RAZORPAY_KEY_SECRET || "").trim();
  const publicKeyId = (process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "").trim();

  if (!keyId || !keySecret || !publicKeyId) {
    return {
      error:
        "Razorpay env is incomplete. Set RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, and NEXT_PUBLIC_RAZORPAY_KEY_ID.",
      status: 500,
    };
  }

  const serverMode = detectModeFromKeyId(keyId);
  const publicMode = detectModeFromKeyId(publicKeyId);

  if (!serverMode || !publicMode) {
    return {
      error: "Invalid Razorpay key format. Keys must start with rzp_test_ or rzp_live_.",
      status: 500,
    };
  }

  if (serverMode !== publicMode) {
    return {
      error:
        "Razorpay key mode mismatch. Server and client keys must both be test or both be live.",
      status: 500,
    };
  }

  if (keyId !== publicKeyId) {
    return {
      error:
        "Razorpay key mismatch. NEXT_PUBLIC_RAZORPAY_KEY_ID must exactly match RAZORPAY_KEY_ID.",
      status: 500,
    };
  }

  return {
    config: {
      keyId,
      keySecret,
      publicKeyId,
      mode: serverMode,
    },
  };
}
