import Link from "next/link";

const navItems = [
  { label: "How It Works", href: "#" },
  { label: "Features", href: "#" },
  { label: "Results", href: "#" },
];

export default function Navbar() {
  return (
    <nav className="fixed inset-x-0 top-0 z-50 w-full px-4 pt-4 sm:px-8 lg:px-12">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between rounded-full border border-[#ED2738]/25 bg-white/75 px-6 py-3 shadow-sm backdrop-blur-md supports-[backdrop-filter]:bg-white/60">
        <Link href="/" className="font-emilys-candy text-2xl leading-none text-[#ED2738]">
          GlamMetrics
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="rounded-full px-3 py-1 font-stack-sans-headline text-sm uppercase tracking-[0.16em] text-black transition-colors hover:bg-[#F7DBE2]/70 hover:text-[#ED2738]"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <button className="rounded-full border border-[#ED2738] bg-[#ED2738] px-5 py-2 font-stack-sans-headline text-sm uppercase tracking-[0.12em] text-white transition-transform hover:-translate-y-0.5 hover:border-black hover:bg-black hover:text-[#F7DBE2]">
          Start Free
        </button>
      </div>
    </nav>
  );
}
