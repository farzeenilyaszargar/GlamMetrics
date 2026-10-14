"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  Sparkles,
  Bookmark,
  UserRound,
  ArrowUpRight,
} from "lucide-react";
import { useSession } from "./session";
export default function Navbar() {
  const path = usePathname();
  const { user } = useSession();
  const links = [
    { href: "/", label: "Home", icon: Compass },
    { href: "/analysis", label: "Create a plan", icon: Sparkles },
    { href: "/pricing", label: "Membership", icon: Bookmark },
    { href: user ? "/profile" : "/auth", label: "My plans", icon: UserRound },
  ];
  return (
    <>
      <header className="header">
        <Link className="wordmark" href="/">
          glam<span>metrics</span>
        </Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          <Link className={path === "/" ? "active" : ""} href="/#how-it-works">
            How it works
          </Link>
          <Link
            className={path === "/analysis" ? "active" : ""}
            href="/analysis"
          >
            Create a plan
          </Link>
          <Link className={path === "/pricing" ? "active" : ""} href="/pricing">
            Style Circle
          </Link>
        </nav>
        <Link className="header-cta" href={user ? "/profile" : "/auth"}>
          {user ? "My plans" : "Try a free plan"}
          <ArrowUpRight size={15} />
        </Link>
      </header>
      {path === "/" ? (
        <div className="mobile-offer">
          <div>
            <strong>Your first plan is free</strong>
            <span>No card needed</span>
          </div>
          <Link href="/analysis" className="button primary">
            Try it free <ArrowUpRight size={16} />
          </Link>
        </div>
      ) : (
        <nav className="mobile-nav" aria-label="Mobile navigation">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={label}
              href={href}
              className={path === href ? "active" : ""}
            >
              <Icon size={20} strokeWidth={1.5} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
      )}
    </>
  );
}
