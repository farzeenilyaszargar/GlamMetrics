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
    { href: "/analysis", label: "Outfit Fix", icon: Sparkles },
    { href: "/sample", label: "Example", icon: Bookmark },
    { href: "/profile", label: "My plans", icon: UserRound },
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
            Outfit Fix · ₹99
          </Link>
          <Link className={path === "/sample" ? "active" : ""} href="/sample">
            See an example
          </Link>
        </nav>
        <Link className="header-cta" href={user ? "/profile" : "/analysis"}>
          {user ? "My plans" : "Fix my outfit"}
          <ArrowUpRight size={15} />
        </Link>
      </header>
      {path === "/" ? (
        <div className="mobile-offer">
          <div>
            <strong>Outfit Fix · ₹99 once</strong>
            <span>No subscription</span>
          </div>
          <Link href="/analysis" className="button primary">
            Fix my outfit <ArrowUpRight size={16} />
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
