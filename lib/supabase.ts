import { createClient, type SupabaseClient } from "@supabase/supabase-js";
export class ClientApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}
let client: SupabaseClient | null = null;
export function browserDb() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return (client ??= createClient(url, key));
}
export async function api(path: string, init?: RequestInit) {
  const db = browserDb();
  const session = db ? (await db.auth.getSession()).data.session : null;
  const response = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
      ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
    },
  });
  const data = await response.json();
  if (!response.ok)
    throw new ClientApiError(
      data.error || "Something went wrong. Please try again.",
      response.status,
    );
  return data;
}
