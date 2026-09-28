"use client";
import { createContext, useContext, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { browserDb } from "@/lib/supabase";
const Context = createContext<{
  user: User | null;
  loading: boolean;
  configured: boolean;
}>({ user: null, loading: true, configured: false });
export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(!!browserDb());
  useEffect(() => {
    const db = browserDb();
    if (!db) {
      return;
    }
    db.auth
      .getSession()
      .then(({ data }) => {
        setUser(data.session?.user || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
    const { data } = db.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      setLoading(false);
    });
    return () => data.subscription.unsubscribe();
  }, []);
  return (
    <Context.Provider value={{ user, loading, configured: !!browserDb() }}>
      {children}
    </Context.Provider>
  );
}
export const useSession = () => useContext(Context);
