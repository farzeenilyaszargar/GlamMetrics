import Link from "next/link";

const links = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Contact", href: "/contact" },
];

export default function Footer() {
  return (
    <footer className="w-full px-4 pb-10 pt-8 sm:px-8 lg:px-12">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-5 rounded-3xl border border-[#ED2738]/20 bg-black px-6 py-6 sm:flex-row">
        <p className="font-emilys-candy text-2xl text-[#F7DBE2]">GlamMetrics</p>

        <div className="flex items-center gap-6">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="rounded-full px-2 py-1 font-stack-sans-headline text-xs uppercase tracking-[0.12em] text-white transition-colors hover:bg-[#F7DBE2]/20 hover:text-[#F7DBE2]"
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
