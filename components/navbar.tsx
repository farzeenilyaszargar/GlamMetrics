import Link from "next/link";

const navItems = [
  { label: "How It Works", href: "#" },
  { label: "Features", href: "#" },
  { label: "Results", href: "#" },
];

export default function Navbar() {
  return (
    <nav className="w-full px-4 pt-4 sm:px-8 lg:px-12">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between rounded-full border bg-white px-6 py-3 shadow-sm">
        <Link href="/" className="font-emilys-candy text-2xl leading-none">
          GlamMetrics
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="font-stack-sans-headline text-sm uppercase tracking-[0.16em] transition-opacity hover:opacity-70"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <button className="rounded-full border px-5 py-2 font-stack-sans-headline text-sm uppercase tracking-[0.12em] transition-transform hover:-translate-y-0.5">
          Start Free
        </button>
      </div>
    </nav>
  );
}
