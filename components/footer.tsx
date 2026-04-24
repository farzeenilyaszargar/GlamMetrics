import Link from "next/link";

const links = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Contact", href: "/contact" },
];

export default function Footer() {
  return (
    <footer className="w-full border-t border-[#ED2738]/20 bg-black">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-5 py-8 max-sm:px-4 sm:flex-row">
        <p className="font-emilys-candy text-2xl text-[#F7DBE2]">GlamMetrics</p>

        <div className="flex items-center gap-6 max-sm:gap-4">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="px-2 py-1 font-stack-sans-headline text-xs uppercase tracking-[0.12em] text-white transition-colors hover:text-[#F7DBE2]"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <p className="font-stack-sans-headline text-[11px] uppercase tracking-[0.1em] text-white/80">
          © {new Date().getFullYear()} GlamMetrics
        </p>
      </div>
    </footer>
  );
}
