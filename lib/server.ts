import { createClient } from "@supabase/supabase-js";
export class ApiError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
export function adminDb() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key)
    throw new ApiError(
      "The service is being prepared. Please try again soon.",
      503,
    );
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
export async function authenticate(request: Request) {
  const token = request.headers
    .get("authorization")
    ?.match(/^Bearer (.+)$/)?.[1];
  if (!token) throw new ApiError("Please sign in to continue.", 401);
  const db = adminDb();
  const { data, error } = await db.auth.getUser(token);
  if (error || !data.user)
    throw new ApiError("Your session has expired. Please sign in again.", 401);
  return { db, user: data.user };
}
export function failure(error: unknown) {
  if (error instanceof ApiError)
    return Response.json({ error: error.message }, { status: error.status });
  console.error(
    "Service request failed",
    error instanceof Error ? error.message : "database or provider error",
  );
  return Response.json(
    { error: "We couldn't complete that request. Please try again shortly." },
    { status: 500 },
  );
}
export async function jsonBody(request: Request, max = 16000) {
  if (Number(request.headers.get("content-length")) > max)
    throw new ApiError("Request is too large.", 413);
  const reader = request.body?.getReader();
  if (!reader) throw new ApiError("Request is empty.");
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > max) {
      await reader.cancel();
      throw new ApiError("Request is too large.", 413);
    }
    chunks.push(value);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString());
  } catch {
    throw new ApiError("Invalid request.");
  }
}
