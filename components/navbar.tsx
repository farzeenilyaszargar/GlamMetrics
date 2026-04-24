"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";

function ProfileAvatar({ user }: { user: User }) {
  if (user.photoURL) {
    return (
      <Image
        src={user.photoURL}
        alt={user.displayName || "Profile"}
        width={36}
        height={36}
        className="h-9 w-9 rounded-full object-cover"
      />
    );
  }

  const fallback = (user.displayName || user.email || "U").slice(0, 1).toUpperCase();
  return (
    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#F7DBE2] text-sm font-semibold text-[#ED2738]">
      {fallback}
    </span>
  );
}

function DashboardIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="8" height="8" rx="1.5" />
      <rect x="13" y="3" width="8" height="5" rx="1.5" />
      <rect x="13" y="10" width="8" height="11" rx="1.5" />
      <rect x="3" y="13" width="8" height="8" rx="1.5" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!auth) return;
    const unsub = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (!menuRef.current) return;
      const target = event.target as Node;
      if (!menuRef.current.contains(target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const handleLogout = async () => {
    if (!auth || !user) return;
    await signOut(auth);
    setIsMenuOpen(false);
    router.push("/auth");
  };

  return (
    <nav className="fixed inset-x-0 top-0 z-50 w-full px-4 pt-4 max-sm:pt-2 sm:px-8 lg:px-12">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between rounded-full border border-[#ED2738]/20 bg-white/75 px-5 py-3 shadow-sm backdrop-blur-md supports-[backdrop-filter]:bg-white/60 max-sm:rounded-2xl max-sm:px-3 max-sm:py-2 sm:px-6">
        <Link href="/" className="truncate font-emilys-candy text-2xl leading-none text-[#ED2738] max-sm:text-xl">
          GlamMetrics
        </Link>

        {!user ? (
          <Link
            href="/auth"
            className="rounded-full border border-[#ED2738] bg-[#ED2738] px-5 py-2 text-sm font-medium text-white transition-transform hover:-translate-y-0.5 hover:border-black hover:bg-black hover:text-[#F7DBE2] max-sm:px-4 max-sm:py-1.5 max-sm:text-xs"
          >
            Start Free
          </Link>
        ) : (
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className="rounded-full border border-[#ED2738]/30 bg-white/70 p-1 transition-colors hover:bg-[#F7DBE2]/50"
              aria-label="Open profile"
            >
              <ProfileAvatar user={user} />
            </button>

            {isMenuOpen ? (
              <div className="absolute right-0 mt-3 w-44 rounded-xl border border-[#ED2738]/20 bg-white p-2 shadow-lg max-sm:w-40">
                <Link
                  href="/profile"
                  onClick={() => setIsMenuOpen(false)}
                  className="inline-flex w-full items-center justify-start gap-2 rounded-lg px-3 py-2 text-sm font-medium text-black transition-colors hover:bg-[#F7DBE2]"
                >
                  <DashboardIcon />
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex w-full items-center justify-start gap-2 rounded-lg px-3 py-2 text-sm font-medium text-[#ED2738] transition-colors hover:bg-[#F7DBE2]"
                >
                  <LogoutIcon />
                  Logout
                </button>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </nav>
  );
}
