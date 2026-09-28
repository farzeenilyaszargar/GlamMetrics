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
    { href: "/", label: "Discover", icon: Compass },
    { href: "/analysis", label: "Style studio", icon: Sparkles },
    { href: "/profile", label: "My edits", icon: Bookmark },
    { href: user ? "/profile" : "/auth", label: "Account", icon: UserRound },
  ];
  return (
    <>
      <header className="header">
        <Link className="wordmark" href="/">
          glam<span>metrics</span>
        </Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          <Link className={path === "/" ? "active" : ""} href="/">
            Discover
          </Link>
          <Link
            className={path === "/analysis" ? "active" : ""}
            href="/analysis"
          >
            Style studio
          </Link>
          <Link className={path === "/pricing" ? "active" : ""} href="/pricing">
            Style Circle
          </Link>
        </nav>
        <Link className="header-cta" href={user ? "/profile" : "/auth"}>
          {user ? "My edits" : "Get started"}
          <ArrowUpRight size={15} />
        </Link>
      </header>
      <nav className="mobile-nav" aria-label="Mobile navigation">
        {links.map(({ href, label, icon: Icon }, i) => (
          <Link
            key={label}
            href={href}
            className={path === href && (i !== 3 || !user) ? "active" : ""}
          >
            <Icon size={20} strokeWidth={1.5} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
