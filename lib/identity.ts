import type { User } from "@supabase/supabase-js";
export function hasRecoverableIdentity(
  user:
    | Pick<User, "is_anonymous" | "email" | "email_confirmed_at">
    | null
    | undefined,
) {
  return (
    !!user &&
    user.is_anonymous !== true &&
    !!user.email &&
    !!user.email_confirmed_at
  );
}
export const guestTrialsEnabled =
  process.env.NEXT_PUBLIC_GUEST_TRIAL_ENABLED === "true";
